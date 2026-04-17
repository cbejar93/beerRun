import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory store — swap for a DB in production
const rsvps = [];

app.post('/api/rsvp', (req, res) => {
  const { name, beer, status } = req.body;
  if (!name || !status || !['going', 'maybe', 'out'].includes(status)) {
    return res.status(400).json({ error: 'name and valid status required' });
  }
  const entry = { id: rsvps.length + 1, name, beer: beer || '', status, createdAt: new Date().toISOString() };
  rsvps.push(entry);
  console.log(`RSVP: ${name} → ${status}${beer ? ` (${beer})` : ''}`);
  res.status(201).json(entry);
});

app.get('/api/rsvp', (req, res) => {
  const summary = {
    total: rsvps.length,
    going: rsvps.filter(r => r.status === 'going').length,
    maybe: rsvps.filter(r => r.status === 'maybe').length,
    out: rsvps.filter(r => r.status === 'out').length,
    entries: rsvps,
  };
  res.json(summary);
});

app.listen(PORT, () => {
  console.log(`Beer Run API running on http://localhost:${PORT}`);
});
