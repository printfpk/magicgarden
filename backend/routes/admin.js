import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import prisma from '../utils/prisma.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const mapId = (obj) => {
  if (Array.isArray(obj)) return obj.map(mapId);
  if (obj && typeof obj === 'object') {
    const newObj = { ...obj, _id: obj.id };
    if (newObj.subject) {
      newObj.subjectId = mapId(newObj.subject);
      delete newObj.subject;
    }
    if (newObj.class) {
      newObj.classId = mapId(newObj.class);
      delete newObj.class;
    }
    if (newObj.questions) {
      newObj.questions = mapId(newObj.questions);
    }
    return newObj;
  }
  return obj;
};

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
    const classes = await prisma.class.findMany({ orderBy: { level: 'asc' } });
    res.json(mapId(classes));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/classes', async (req, res) => {
  try {
    const newClass = await prisma.class.create({ data: { name: req.body.name, level: Number(req.body.level) } });
    res.status(201).json(mapId(newClass));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/classes/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.level) data.level = Number(data.level);
    if (data._id) delete data._id; // Ensure we don't try to update the ID
    const updated = await prisma.class.update({
      where: { id: req.params.id },
      data
    });
    res.json(mapId(updated));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/classes/:id', async (req, res) => {
  try {
    await prisma.class.delete({ where: { id: req.params.id } });
    res.json({ message: 'Class deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Subjects ─────────────────────────────────────────────────────────────────
router.get('/subjects', async (req, res) => {
  try {
    const where = req.query.classId ? { classId: req.query.classId } : {};
    const subjects = await prisma.subject.findMany({
      where,
      include: { class: { select: { name: true, level: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(mapId(subjects));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/subjects', async (req, res) => {
  try {
    const newSubject = await prisma.subject.create({
      data: {
        name: req.body.name,
        classId: req.body.classId,
        coverImage: req.body.coverImage || ''
      }
    });
    res.status(201).json(mapId(newSubject));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/subjects/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data._id) delete data._id;
    if (data.classId && typeof data.classId === 'object') data.classId = data.classId._id;
    const updated = await prisma.subject.update({
      where: { id: req.params.id },
      data
    });
    res.json(mapId(updated));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/subjects/:id', async (req, res) => {
  try {
    await prisma.subject.delete({ where: { id: req.params.id } });
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Chapters ──────────────────────────────────────────────────────────────────
router.get('/chapters', async (req, res) => {
  try {
    const where = req.query.subjectId ? { subjectId: req.query.subjectId } : {};
    const chapters = await prisma.chapter.findMany({
      where,
      include: { subject: { select: { name: true } } },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
    });
    res.json(mapId(chapters));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/chapters', async (req, res) => {
  try {
    const { questions, ...data } = req.body;
    if (data._id) delete data._id;
    if (data.subjectId && typeof data.subjectId === 'object') data.subjectId = data.subjectId._id;
    if (data.order) data.order = Number(data.order);

    const newChapter = await prisma.chapter.create({
      data: {
        ...data,
        questions: {
          create: questions ? questions.map(q => ({ question: q.question, answer: q.answer })) : []
        }
      },
      include: { questions: true }
    });
    res.status(201).json(mapId(newChapter));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/chapters/:id', async (req, res) => {
  try {
    const { questions, ...data } = req.body;
    if (data._id) delete data._id;
    if (data.subjectId && typeof data.subjectId === 'object') data.subjectId = data.subjectId._id;
    if (data.order) data.order = Number(data.order);

    // To update questions, we delete existing and recreate them to match mongoose behavior
    const updated = await prisma.chapter.update({
      where: { id: req.params.id },
      data: {
        ...data,
        questions: questions ? {
          deleteMany: {},
          create: questions.map(q => ({ question: q.question, answer: q.answer }))
        } : undefined
      },
      include: { questions: true }
    });
    res.json(mapId(updated));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/chapters/:id', async (req, res) => {
  try {
    await prisma.chapter.delete({ where: { id: req.params.id } });
    res.json({ message: 'Chapter deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── IMAGE UPLOAD ────────────────────────────────────────────────────────
router.post('/upload-image', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image provided' });
  try {
    const result = await uploadToCloudinary(req.file.buffer);
    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: 'Cloudinary upload failed', error: error.message });
  }
});

export default router;
