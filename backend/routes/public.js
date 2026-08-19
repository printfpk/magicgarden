import express from 'express';
import prisma from '../utils/prisma.js';

const router = express.Router();

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCached = (key) => {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data;
  }
  return null;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

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

/**
 * Fetch initial data with optimized parallel queries.
 * Used by both the API endpoint and the pre-warm function.
 */
async function fetchInitialData() {
  // First batch: classes query (subjects/chapters depend on this)
  const classes = await prisma.class.findMany({ orderBy: { level: 'asc' } });
  
  let subjects = [];
  let chapters = [];
  
  if (classes.length > 0) {
    // Fetch subjects for the first class
    subjects = await prisma.subject.findMany({
      where: { classId: classes[0].id },
      orderBy: { name: 'asc' }
    });
    
    if (subjects.length > 0) {
      // Fetch chapters for the first subject
      chapters = await prisma.chapter.findMany({
        where: { subjectId: subjects[0].id },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        select: {
          id: true,
          title: true,
          order: true,
          summary: true,
          createdAt: true
        }
      });
    }
  }
  
  return {
    classes: mapId(classes),
    subjects: mapId(subjects),
    chapters: mapId(chapters)
  };
}

/**
 * Pre-warm the cache at server startup so the first request is instant.
 */
export async function preWarmCache() {
  const start = Date.now();
  try {
    const data = await fetchInitialData();
    setCache('initial-data', data);
    
    // Also cache classes separately since it's a common query
    setCache('classes', data.classes);
    
    console.log(`✅ Cache pre-warmed in ${Date.now() - start}ms (${data.classes.length} classes, ${data.subjects.length} subjects, ${data.chapters.length} chapters)`);
  } catch (err) {
    console.warn(`⚠️ Cache pre-warm failed (${Date.now() - start}ms):`, err.message);
  }
}

// Get initial data for home page (classes, subjects for first class, chapters for first subject)
router.get('/initial-data', async (req, res) => {
  try {
    const cacheKey = 'initial-data';
    const cachedData = getCached(cacheKey);
    if (cachedData) {
      res.set('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    res.set('X-Cache', 'MISS');
    const responseData = await fetchInitialData();
    setCache(cacheKey, responseData);
    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all classes
router.get('/classes', async (req, res) => {
  try {
    const cacheKey = 'classes';
    const cachedData = getCached(cacheKey);
    if (cachedData) {
      res.set('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    res.set('X-Cache', 'MISS');
    const classes = await prisma.class.findMany({ orderBy: { level: 'asc' } });
    const responseData = mapId(classes);
    setCache(cacheKey, responseData);
    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get subjects by class id
router.get('/classes/:classId/subjects', async (req, res) => {
  try {
    const cacheKey = `subjects-${req.params.classId}`;
    const cachedData = getCached(cacheKey);
    if (cachedData) {
      res.set('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    res.set('X-Cache', 'MISS');
    const subjects = await prisma.subject.findMany({
      where: { classId: req.params.classId },
      orderBy: { name: 'asc' }
    });
    const responseData = mapId(subjects);
    setCache(cacheKey, responseData);
    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get chapters by subject id
router.get('/subjects/:subjectId/chapters', async (req, res) => {
  try {
    const cacheKey = `chapters-${req.params.subjectId}`;
    const cachedData = getCached(cacheKey);
    if (cachedData) {
      res.set('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    res.set('X-Cache', 'MISS');
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
    const responseData = mapId(chapters);
    setCache(cacheKey, responseData);
    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get chapter details
router.get('/chapters/:id', async (req, res) => {
  try {
    const cacheKey = `chapter-${req.params.id}`;
    const cachedData = getCached(cacheKey);
    if (cachedData) {
      res.set('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    res.set('X-Cache', 'MISS');
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
    const responseData = mapId(chapter);
    setCache(cacheKey, responseData);
    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all active store items
router.get('/store-items', async (req, res) => {
  try {
    const cacheKey = 'store-items';
    const cachedData = getCached(cacheKey);
    if (cachedData) {
      res.set('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    res.set('X-Cache', 'MISS');
    const storeItems = await prisma.storeItem.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    const responseData = mapId(storeItems);
    setCache(cacheKey, responseData);
    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

