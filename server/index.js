import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Rsvp from './models/Rsvp.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

app.delete('/api/rsvp/:id', async (req, res) => {
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
