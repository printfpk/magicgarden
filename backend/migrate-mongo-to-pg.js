import mongoose from 'mongoose';
import prisma from './utils/prisma.js';
import dotenv from 'dotenv';
const classSchema = new mongoose.Schema({}, { strict: false, collection: 'classes' });
const subjectSchema = new mongoose.Schema({}, { strict: false, collection: 'subjects' });
const chapterSchema = new mongoose.Schema({}, { strict: false, collection: 'chapters' });

const Class = mongoose.model('Class', classSchema);
const Subject = mongoose.model('Subject', subjectSchema);
const Chapter = mongoose.model('Chapter', chapterSchema);

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Migrate Classes
    const classes = await Class.find({});
    console.log(`Migrating ${classes.length} classes...`);
    const validClassIds = new Set();
    for (const c of classes) {
      validClassIds.add(c._id.toString());
      await prisma.class.upsert({
        where: { id: c._id.toString() },
        update: {},
        create: {
          id: c._id.toString(),
          name: c.name,
          level: c.level,
          createdAt: c.createdAt || new Date(),
          updatedAt: c.updatedAt || new Date()
        }
      });
    }

    // 2. Migrate Subjects
    const subjects = await Subject.find({});
    console.log(`Migrating ${subjects.length} subjects...`);
    const validSubjectIds = new Set();
    for (const s of subjects) {
      if (!s.classId || !validClassIds.has(s.classId.toString())) {
        console.warn(`Skipping subject ${s.name} - orphaned classId`);
        continue;
      }
      validSubjectIds.add(s._id.toString());
      await prisma.subject.upsert({
        where: { id: s._id.toString() },
        update: {},
        create: {
          id: s._id.toString(),
          name: s.name,
          classId: s.classId.toString(),
          coverImage: s.coverImage || '',
          createdAt: s.createdAt || new Date(),
          updatedAt: s.updatedAt || new Date()
        }
      });
    }

    // 3. Migrate Chapters
    const chapters = await Chapter.find({});
    console.log(`Migrating ${chapters.length} chapters...`);
    for (const c of chapters) {
      if (!c.subjectId || !validSubjectIds.has(c.subjectId.toString())) {
        console.warn(`Skipping chapter ${c.title} - orphaned subjectId`);
        continue;
      }
      await prisma.chapter.upsert({
        where: { id: c._id.toString() },
        update: {},
        create: {
          id: c._id.toString(),
          title: c.title,
          subjectId: c.subjectId.toString(),
          order: c.order || 0,
          summary: c.summary || '',
          shortNotes: c.shortNotes || [],
          pdfLink: c.pdfLink || '',
          youtubeLink: c.youtubeLink || '',
          createdAt: c.createdAt || new Date(),
          updatedAt: c.updatedAt || new Date(),
        }
      });
      
      if (c.questions && c.questions.length > 0) {
        for (const q of c.questions) {
          await prisma.question.upsert({
            where: { id: q._id.toString() },
            update: {},
            create: {
              id: q._id.toString(),
              question: q.question,
              answer: q.answer,
              chapterId: c._id.toString()
            }
          });
        }
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
    process.exit(0);
  }
}

run();
