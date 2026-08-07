import prisma from './utils/prisma.js';

async function main() {
  const chapter = await prisma.chapter.findFirst();
  if (!chapter) {
    console.log("No chapters found in db");
    return;
  }
  console.log("Found chapter:", chapter.id);

  try {
    const updated = await prisma.chapter.update({
      where: { id: chapter.id },
      data: {
        questions: {
          deleteMany: {},
          create: [{ question: "Test Q", answer: "Test A" }]
        }
      },
      include: { questions: true }
    });
    console.log("Updated chapter questions:", updated.questions);
  } catch (e) {
    console.error("Prisma error:", e);
  }
}

main().finally(() => process.exit(0));
