import express from 'express';
import prisma from '../utils/prisma.js';

const router = express.Router();

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

// Get all classes
router.get('/classes', async (req, res) => {
  try {
    const classes = await prisma.class.findMany({ orderBy: { level: 'asc' } });
    res.json(mapId(classes));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get subjects by class id
router.get('/classes/:classId/subjects', async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: { classId: req.params.classId },
      orderBy: { name: 'asc' }
    });
    res.json(mapId(subjects));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get chapters by subject id
router.get('/subjects/:subjectId/chapters', async (req, res) => {
  try {
    const chapters = await prisma.chapter.findMany({
      where: { subjectId: req.params.subjectId },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        title: true,
        order: true,
        summary: true,
        createdAt: true
      }
    });
    res.json(mapId(chapters));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get chapter details
router.get('/chapters/:id', async (req, res) => {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: req.params.id },
      include: {
        subject: {
          include: { class: true }
        },
        questions: true
      }
    });
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    res.json(mapId(chapter));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
