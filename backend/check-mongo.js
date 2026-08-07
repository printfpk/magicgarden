import mongoose from 'mongoose';

async function main() {
  const uri = "mongodb+srv://printfpk:PO7mL7g7aihMAWfz@cluster1.oker5wm.mongodb.net/test"; // assuming 'test' database
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const chapters = await db.collection('chapters').find({ title: /rhyme/i }).toArray();
    console.log("Chapters in Mongo with rhyme:", chapters);
  } catch(e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
  }
}
main();
