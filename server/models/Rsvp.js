import mongoose from 'mongoose';

const rsvpSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true, trim: true },
    beer:   { type: String, default: '' },
    status: { type: String, enum: ['going', 'maybe', 'out'], required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Rsvp', rsvpSchema);
