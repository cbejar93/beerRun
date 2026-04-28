import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'url';
import path from 'path';

import Rsvp from './models/Rsvp.js';
import Task from './models/Task.js';
import Result from './models/Result.js';
import RaceState from './models/RaceState.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET must be set and at least 32 characters');
  process.exit(1);
}
if (!process.env.HOST_PIN) {
  console.error('FATAL: HOST_PIN must be set');
  process.exit(1);
}

const SEED_TASKS = [
  { t: 'Buy bibs (Amazon, 2-day ship)', due: 'Due Apr 22', done: false },
  { t: 'Confirm volunteer pourers at each mile', due: 'Due Apr 25', done: true },
  { t: 'Send reminder to the 4 Maybes', due: 'Due Apr 30', done: false },
  { t: 'Get finish-line champagne', due: 'Due May 22', done: false },
];

const app = express();
const PORT = process.env.PORT || 3001;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

const c = {
  reset:  '\x1b[0m',
  dim:    '\x1b[2m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  cyan:   '\x1b[36m',
};

const ts = () => `${c.dim}[${new Date().toISOString()}]${c.reset}`;
const log = {
  info:  (...a) => console.log( `${ts()} ${c.green}INFO ${c.reset}`, ...a),
  warn:  (...a) => console.warn(`${ts()} ${c.yellow}WARN ${c.reset}`, ...a),
  error: (...a) => console.error(`${ts()} ${c.red}ERROR${c.reset}`, ...a),
};

// Map Partiful (and generic) status strings to our schema values
function normalizeStatus(raw = '') {
  const s = raw.trim().toLowerCase();
  if (s === 'going' || s === 'yes' || s === 'attending') return 'going';
  if (s === 'not going' || s === 'no' || s === 'declined' || s === 'out') return 'out';
  return 'maybe'; // "maybe", "awaiting", "invited", blank → maybe
}

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : false }));
app.use(express.json({ limit: '100kb' }));
app.use(morgan('[:date[iso]] :method :url :status :res[content-length]b - :response-time ms'));

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, try again later' },
});

const rsvpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many RSVPs from this IP' },
});

app.post('/api/auth/host', authLimiter, (req, res) => {
  if (!process.env.HOST_PIN || req.body.pin !== process.env.HOST_PIN) {
    log.warn('Failed host auth attempt');
    return res.status(401).json({ error: 'wrong pin' });
  }
  const token = jwt.sign({ host: true }, process.env.JWT_SECRET, { expiresIn: '12h' });
  log.info('Host token issued');
  res.json({ token });
});

function requireHost(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    log.warn(`Unauthorized request: ${req.method} ${req.path}`);
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    log.warn(`Invalid token on: ${req.method} ${req.path}`);
    res.status(401).json({ error: 'invalid token' });
  }
}

app.post('/api/rsvp', rsvpLimiter, async (req, res) => {
  const { name, beer, status } = req.body;
  if (!name || !status || !['going', 'maybe', 'out'].includes(status)) {
    return res.status(400).json({ error: 'name and valid status required' });
  }
  if (name.length > 50) return res.status(400).json({ error: 'name too long (max 50)' });
  if (beer && beer.length > 80) return res.status(400).json({ error: 'bringing field too long (max 80)' });
  try {
    const entry = await Rsvp.create({ name, beer: beer || '', status });
    log.info(`RSVP: ${entry.name} → ${entry.status}${entry.beer ? ` (${entry.beer})` : ''}`);
    res.status(201).json(entry);
  } catch (err) {
    log.error('POST /api/rsvp:', err.message);
    res.status(500).json({ error: 'internal server error' });
  }
});

app.get('/api/rsvp', async (_req, res) => {
  try {
    const entries = await Rsvp.find().sort({ createdAt: -1 }).lean();
    res.json({
      total: entries.length,
      going: entries.filter(r => r.status === 'going').length,
      maybe: entries.filter(r => r.status === 'maybe').length,
      out:   entries.filter(r => r.status === 'out').length,
      entries,
    });
  } catch (err) {
    log.error('GET /api/rsvp:', err.message);
    res.status(500).json({ error: 'internal server error' });
  }
});

// POST /api/rsvp/import — accepts a Partiful (or generic) CSV upload
app.post('/api/rsvp/import', requireHost, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no file uploaded' });
  try {
    const rows = parse(req.file.buffer, { columns: true, skip_empty_lines: true, trim: true });

    // Find the name column (Partiful uses "Name", others vary)
    const sample = rows[0] ? Object.keys(rows[0]) : [];
    const nameKey = sample.find(k => /^name$/i.test(k) || /guest.?name/i.test(k)) || sample[0];
    const statusKey = sample.find(k => /^(rsvp|status|response|attending)$/i.test(k));

    if (!nameKey) return res.status(422).json({ error: 'could not find a Name column in CSV' });

    // Fetch existing names to skip duplicates
    const existing = new Set(
      (await Rsvp.find({}, 'name').lean()).map(r => r.name.toLowerCase())
    );

    const toInsert = [];
    for (const row of rows) {
      const name = row[nameKey]?.trim();
      if (!name || existing.has(name.toLowerCase())) continue;
      const status = normalizeStatus(statusKey ? row[statusKey] : '');
      toInsert.push({ name, status, beer: '' });
    }

    if (toInsert.length) await Rsvp.insertMany(toInsert);

    log.info(`CSV import: ${toInsert.length} inserted, ${rows.length - toInsert.length} skipped (${rows.length} total in file)`);
    res.json({ imported: toInsert.length, skipped: rows.length - toInsert.length, total: rows.length });
  } catch (err) {
    log.error('POST /api/rsvp/import:', err.message);
    res.status(500).json({ error: 'internal server error' });
  }
});

app.delete('/api/rsvp/:id', requireHost, async (req, res) => {
  try {
    const deleted = await Rsvp.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'not found' });
    log.info(`Deleted RSVP: ${req.params.id}`);
    res.status(204).end();
  } catch (err) {
    log.error('DELETE /api/rsvp/:id:', err.message);
    res.status(500).json({ error: 'internal server error' });
  }
});

app.get('/api/tasks', async (_req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: 1 }).lean();
    res.json(tasks);
  } catch (err) {
    log.error('GET /api/tasks:', err.message);
    res.status(500).json({ error: 'internal server error' });
  }
});

app.post('/api/tasks', requireHost, async (req, res) => {
  const { t, due } = req.body;
  if (!t?.trim()) return res.status(400).json({ error: 'task text required' });
  try {
    const task = await Task.create({ t: t.trim(), due: due?.trim() || '' });
    log.info(`Task added: "${task.t}"`);
    res.status(201).json(task);
  } catch (err) {
    log.error('POST /api/tasks:', err.message);
    res.status(500).json({ error: 'internal server error' });
  }
});

app.patch('/api/tasks/:id', requireHost, async (req, res) => {
  if (typeof req.body.done !== 'boolean') {
    return res.status(400).json({ error: 'done must be a boolean' });
  }
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { done: req.body.done },
      { new: true }
    ).lean();
    if (!task) return res.status(404).json({ error: 'not found' });
    res.json(task);
  } catch (err) {
    log.error('PATCH /api/tasks/:id:', err.message);
    res.status(500).json({ error: 'internal server error' });
  }
});

app.delete('/api/tasks/:id', requireHost, async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'not found' });
    log.info(`Task deleted: "${deleted.t}"`);
    res.status(204).end();
  } catch (err) {
    log.error('DELETE /api/tasks/:id:', err.message);
    res.status(500).json({ error: 'internal server error' });
  }
});

app.get('/api/results', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const year = req.query.year ? Math.max(1900, Math.min(2100, parseInt(req.query.year) || currentYear)) : currentYear;
    const [state, results, years] = await Promise.all([
      RaceState.findOne({ year }).lean(),
      Result.find({ year }).sort({ finishedAt: 1 }).lean(),
      Result.distinct('year'),
    ]);
    res.json({ year, startedAt: state?.startedAt ?? null, endedAt: state?.endedAt ?? null, results, years: years.sort((a, b) => b - a) });
  } catch (err) {
    log.error('GET /api/results:', err.message);
    res.status(500).json({ error: 'internal server error' });
  }
});

app.post('/api/results/start', requireHost, async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const startedAt = new Date();
    await RaceState.findOneAndUpdate({ year }, { startedAt }, { upsert: true, new: true });
    await Result.deleteMany({ year });
    log.info(`Race ${year} started at ${startedAt.toISOString()}`);
    res.json({ year, startedAt });
  } catch (err) {
    log.error('POST /api/results/start:', err.message);
    res.status(500).json({ error: 'internal server error' });
  }
});

app.post('/api/results/end', requireHost, async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const endedAt = new Date();
    await RaceState.findOneAndUpdate({ year }, { endedAt }, { new: true });
    log.info(`Race ${year} ended at ${endedAt.toISOString()}`);
    res.json({ endedAt });
  } catch (err) {
    log.error('POST /api/results/end:', err.message);
    res.status(500).json({ error: 'internal server error' });
  }
});

app.delete('/api/results/start', requireHost, async (req, res) => {
  try {
    const year = new Date().getFullYear();
    await RaceState.deleteOne({ year });
    await Result.deleteMany({ year });
    log.info(`Race ${year} data wiped`);
    res.status(204).end();
  } catch (err) {
    log.error('DELETE /api/results/start:', err.message);
    res.status(500).json({ error: 'internal server error' });
  }
});

app.post('/api/results', requireHost, async (req, res) => {
  const { name, dnf } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'name required' });
  try {
    const year = new Date().getFullYear();
    const existing = await Result.findOne({ year, name: { $regex: `^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });
    if (existing) return res.status(409).json({ error: 'already recorded' });
    const result = await Result.create({ name: name.trim(), finishedAt: new Date(), year, dnf: !!dnf });
    log.info(`${dnf ? 'DNF' : 'Finish'} recorded: ${result.name} (${year})`);
    res.status(201).json(result);
  } catch (err) {
    log.error('POST /api/results:', err.message);
    res.status(500).json({ error: 'internal server error' });
  }
});

app.delete('/api/results/:id', requireHost, async (req, res) => {
  try {
    const deleted = await Result.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'not found' });
    log.info(`Result removed: ${deleted.name}`);
    res.status(204).end();
  } catch (err) {
    log.error('DELETE /api/results/:id:', err.message);
    res.status(500).json({ error: 'internal server error' });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    log.info('MongoDB connected');
    const count = await Task.countDocuments();
    if (count === 0) {
      await Task.insertMany(SEED_TASKS);
      log.info('Seeded initial tasks');
    }
    app.listen(PORT, () => log.info(`Beer Run API running on port ${PORT}`));
  })
  .catch(err => {
    log.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
