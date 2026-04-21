import mongoose from 'mongoose';

const raceStateSchema = new mongoose.Schema({
  startedAt: { type: Date },
});

export default mongoose.model('RaceState', raceStateSchema);
