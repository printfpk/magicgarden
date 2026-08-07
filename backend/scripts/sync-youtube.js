import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../utils/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, 'youtube-data.json');
const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Helper to extract class level
function parseClassLevel(title) {
  const match = title.match(/class\s+(\d+)/i);
  if (match) return parseInt(match[1]);
  if (title.toLowerCase().includes('saptam')) return 7;
  if (title.toLowerCase().includes('astam')) return 8;
  if (title.toLowerCase().includes('sastha')) return 6;
  if (title.toLowerCase().includes('pancham')) return 5;
  return null;
}

// Helper to extract subject
function parseSubject(title) {
  const t = title.toLowerCase();
  if (t.includes('math') || t.includes('ganit')) return 'Math';
  if (t.includes('english') || t.includes('jasmine') || t.includes('pallavi')) return 'English';
  if (t.includes('bigyan') || t.includes('science')) return 'Science';
  return 'Unknown Subject';
}

// Helper to extract chapter title and order
function parseChapterInfo(title) {
  let order = 0;
  const chapMatch = title.match(/chapter\s+(\d+)/i);
  if (chapMatch) {
    order = parseInt(chapMatch[1]);
  }

  // Clean up title
  let cleanTitle = title
    .replace(/class\s+\d+/i, '')
    .replace(/saptam\s+sreni/i, '')
    .replace(/new\s+(math|english|bigyan)\s+book/i, '')
    .replace(/nua\s+bigyan\s+bahi/i, '')
    .replace(/ganit\s+prakash/i, '')
    .replace(/new\s+book/i, '')
    .replace(/new\s+scert\s+book/i, '')
    .replace(/chapter\s+\d+/i, '')
    .replace(/\|/g, '')
    .replace(/।/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '') // remove brackets
    .trim();

  // If cleaning made it too short or empty, use a fallback
  if (cleanTitle.length < 3) {
    cleanTitle = `Complete Playlist / Book`;
  }

  return { title: cleanTitle, order };
}

async function run() {
  console.log('Starting YouTube Sync...');

  for (const item of rawData) {
    const title = item.title;
    const url = item.url;

    const classLevel = parseClassLevel(title);
    if (!classLevel) {
      console.log(`[SKIP] Could not determine class for: ${title}`);
      continue;
    }

    const subjectName = parseSubject(title);
    const { title: chapterTitle, order: chapterOrder } = parseChapterInfo(title);

    console.log(`\nProcessing: "${title}"`);
    console.log(` -> Class: ${classLevel}, Subject: ${subjectName}, Chapter: ${chapterTitle} (Order: ${chapterOrder})`);

    // 1. Find or create Class
    let cls = await prisma.class.findUnique({ where: { level: classLevel } });
    if (!cls) {
      cls = await prisma.class.create({
        data: { name: `Class ${classLevel}`, level: classLevel }
      });
      console.log(`    Created Class ${classLevel}`);
    }

    // 2. Find or create Subject
    let subject = await prisma.subject.findFirst({
      where: { classId: cls.id, name: { equals: subjectName, mode: 'insensitive' } }
    });
    if (!subject) {
      subject = await prisma.subject.create({
        data: { name: subjectName, classId: cls.id }
      });
      console.log(`    Created Subject ${subjectName}`);
    }

    // 3. Find or create Chapter
    // If order is 0, we just match by title fuzzily, or just create it.
    // To prevent duplicate complete books, we check if it already exists.
    let chapter = await prisma.chapter.findFirst({
      where: { 
        subjectId: subject.id, 
        OR: [
          { title: { equals: chapterTitle, mode: 'insensitive' } },
          // If we parsed a chapter order, check if that order exists
          ...(chapterOrder > 0 ? [{ order: chapterOrder }] : [])
        ]
      }
    });

    if (!chapter) {
      // Get the next order if order is 0
      let finalOrder = chapterOrder;
      if (finalOrder === 0) {
        const lastChap = await prisma.chapter.findFirst({
          where: { subjectId: subject.id },
          orderBy: { order: 'desc' }
        });
        finalOrder = lastChap ? lastChap.order + 1 : 1;
      }

      chapter = await prisma.chapter.create({
        data: {
          title: chapterTitle,
          order: finalOrder,
          youtubeLink: url,
          subjectId: subject.id
        }
      });
      console.log(`    Created Chapter "${chapterTitle}" with URL`);
    } else {
      // Update existing chapter with youtube link
      await prisma.chapter.update({
        where: { id: chapter.id },
        data: { youtubeLink: url, title: chapterTitle.length > chapter.title.length ? chapterTitle : chapter.title }
      });
      console.log(`    Updated existing Chapter "${chapter.title}" with URL`);
    }
  }

  console.log('\nSync Complete!');
}

run()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
