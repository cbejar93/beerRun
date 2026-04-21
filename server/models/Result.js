import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true },
    finishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Result', resultSchema);
