import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    required: true,
    unique: true
  },
}, { timestamps: true });

export default mongoose.model('Class', classSchema);
