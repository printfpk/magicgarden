import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
});

const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  summary: {
    type: String,
    default: ''
  },
  shortNotes: {
    type: [String],
    default: []
  },
  pdfLink: {
    type: String,
    default: ''
  },
  youtubeLink: {
    type: String,
    default: ''
  },
  questions: [questionSchema]
}, { timestamps: true });

export default mongoose.model('Chapter', chapterSchema);
