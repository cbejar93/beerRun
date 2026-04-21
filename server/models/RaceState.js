import mongoose from 'mongoose';

const raceStateSchema = new mongoose.Schema({
  year:      { type: Number, required: true, unique: true },
  startedAt: { type: Date },
});

export default mongoose.model('RaceState', raceStateSchema);
