import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true },
    finishedAt: { type: Date, default: Date.now },
    year:       { type: Number, required: true },
    dnf:        { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Result', resultSchema);
