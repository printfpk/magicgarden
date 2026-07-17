import express from 'express';
import Class from '../models/Class.js';
import Subject from '../models/Subject.js';
import Chapter from '../models/Chapter.js';

const router = express.Router();

// Get all classes
router.get('/classes', async (req, res) => {
  try {
    const classes = await Class.find().sort({ level: 1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get subjects by class id
router.get('/classes/:classId/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find({ classId: req.params.classId }).sort({ name: 1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get chapters by subject id
router.get('/subjects/:subjectId/chapters', async (req, res) => {
  try {
    const chapters = await Chapter.find({ subjectId: req.params.subjectId })
      .sort({ order: 1, createdAt: 1 })
      .select('title order summary createdAt');
    res.json(chapters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get chapter details
router.get('/chapters/:id', async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id).populate('subjectId', 'name classId');
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    res.json(chapter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
