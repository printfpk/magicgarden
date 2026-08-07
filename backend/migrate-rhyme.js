import mongoose from 'mongoose';
import prisma from './utils/prisma.js';

const MONGO_URI = "mongodb+srv://printfpk:PO7mL7g7aihMAWfz@cluster1.oker5wm.mongodb.net/test";

async function migrateRhyme() {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    
    // Find the 'rhyme' chapter in mongo
    const chapter = await db.collection('chapters').findOne({ title: 'rhyme' });
    if (!chapter) {
      console.log("Rhyme chapter not found in mongo!");
      return;
    }
    console.log("Found rhyme chapter in Mongo:", chapter._id);

    // Find the subject
    const subject = await db.collection('subjects').findOne({ _id: chapter.subjectId });
    if (!subject) return;

    // Find the class
    const cls = await db.collection('classes').findOne({ _id: subject.classId });
    if (!cls) return;

    // We need to map these to Postgres.
    // Check if the class exists in Postgres (it should, from the earlier migration)
    let pgClass = await prisma.class.findFirst({ where: { name: cls.name } });
    if (!pgClass) {
      console.log("Class not found in PG, creating...");
      pgClass = await prisma.class.create({
        data: { id: cls._id.toString(), name: cls.name, level: cls.level }
      });
    }

    // Check if subject exists in PG
    let pgSubject = await prisma.subject.findFirst({ where: { name: subject.name, classId: pgClass.id } });
    if (!pgSubject) {
      console.log("Subject not found in PG, creating...");
      pgSubject = await prisma.subject.create({
        data: {
          id: subject._id.toString(),
          name: subject.name,
          classId: pgClass.id,
          coverImage: subject.coverImage || ''
        }
      });
    }

    // Check if chapter exists
    let pgChapter = await prisma.chapter.findFirst({ where: { title: chapter.title, subjectId: pgSubject.id } });
    if (!pgChapter) {
      console.log("Chapter not found in PG, creating...");
      pgChapter = await prisma.chapter.create({
        data: {
          id: chapter._id.toString(),
          title: chapter.title,
          order: chapter.order || 0,
          summary: chapter.summary || '',
          shortNotes: chapter.shortNotes || [],
          pdfLink: chapter.pdfLink || '',
          youtubeLink: chapter.youtubeLink || '',
          subjectId: pgSubject.id,
          createdAt: chapter.createdAt,
          updatedAt: chapter.updatedAt
        }
      });
    }

    // Migrate Q&A if any
    const qas = await db.collection('questions').find({ chapterId: chapter._id }).toArray();
    for (const qa of qas) {
      await prisma.question.create({
        data: {
          id: qa._id.toString(),
          question: qa.question,
          answer: qa.answer,
          chapterId: pgChapter.id,
          createdAt: qa.createdAt,
          updatedAt: qa.updatedAt
        }
      });
    }

    console.log("Migration of rhyme complete!");
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
  }
}

migrateRhyme();
