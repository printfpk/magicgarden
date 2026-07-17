import express from 'express';
import jwt from 'jsonwebtoken';
import Class from '../models/Class.js';
import Subject from '../models/Subject.js';
import Chapter from '../models/Chapter.js';

const router = express.Router();

// Middleware to verify Admin JWT
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (decoded.role !== 'admin') throw new Error('Unauthorized');
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

// Admin Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ username, role: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Protect all routes below this middleware
router.use(verifyAdmin);

// ── Classes ──────────────────────────────────────────────────────────────────
router.get('/classes', async (req, res) => {
  try {
    const classes = await Class.find().sort({ level: 1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/classes', async (req, res) => {
  try {
    const newClass = await Class.create(req.body);
    res.status(201).json(newClass);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/classes/:id', async (req, res) => {
  try {
    const updated = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/classes/:id', async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Subjects ─────────────────────────────────────────────────────────────────
router.get('/subjects', async (req, res) => {
  try {
    const filter = req.query.classId ? { classId: req.query.classId } : {};
    const subjects = await Subject.find(filter).populate('classId', 'name level').sort({ name: 1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/subjects', async (req, res) => {
  try {
    const newSubject = await Subject.create(req.body);
    res.status(201).json(newSubject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/subjects/:id', async (req, res) => {
  try {
    const updated = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/subjects/:id', async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Chapters ──────────────────────────────────────────────────────────────────
router.get('/chapters', async (req, res) => {
  try {
    const filter = req.query.subjectId ? { subjectId: req.query.subjectId } : {};
    const chapters = await Chapter.find(filter)
      .populate('subjectId', 'name')
      .sort({ order: 1, createdAt: 1 });
    res.json(chapters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/chapters', async (req, res) => {
  try {
    const newChapter = await Chapter.create(req.body);
    res.status(201).json(newChapter);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/chapters/:id', async (req, res) => {
  try {
    const updated = await Chapter.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/chapters/:id', async (req, res) => {
  try {
    await Chapter.findByIdAndDelete(req.params.id);
    res.json({ message: 'Chapter deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
