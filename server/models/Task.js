import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  t:    { type: String, required: true },
  due:  { type: String, default: '' },
  done: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
