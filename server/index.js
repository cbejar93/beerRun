import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import jwt from 'jsonwebtoken';
import Rsvp from './models/Rsvp.js';

const app = express();
const PORT = process.env.PORT || 3001;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

// Map Partiful (and generic) status strings to our schema values
function normalizeStatus(raw = '') {
  const s = raw.trim().toLowerCase();
  if (s === 'going' || s === 'yes' || s === 'attending') return 'going';
  if (s === 'not going' || s === 'no' || s === 'declined' || s === 'out') return 'out';
  return 'maybe'; // "maybe", "awaiting", "invited", blank → maybe
}

app.use(cors());
app.use(express.json());

app.post('/api/auth/host', (req, res) => {
  if (!process.env.HOST_PIN || req.body.pin !== process.env.HOST_PIN) {
    return res.status(401).json({ error: 'wrong pin' });
  }
  const token = jwt.sign({ host: true }, process.env.JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

function requireHost(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'unauthorized' });
  try {
    jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
}

app.post('/api/rsvp', async (req, res) => {
  const { name, beer, status } = req.body;
  if (!name || !status || !['going', 'maybe', 'out'].includes(status)) {
    return res.status(400).json({ error: 'name and valid status required' });
  }
  try {
    const entry = await Rsvp.create({ name, beer: beer || '', status });
    console.log(`RSVP: ${entry.name} → ${entry.status}${entry.beer ? ` (${entry.beer})` : ''}`);
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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

    console.log(`CSV import: ${toInsert.length} inserted, ${rows.length - toInsert.length} skipped`);
    res.json({ imported: toInsert.length, skipped: rows.length - toInsert.length, total: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/rsvp/:id', requireHost, async (req, res) => {
  try {
    const deleted = await Rsvp.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Beer Run API running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
