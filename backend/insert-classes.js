import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Class from './models/Class.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const class9 = new Class({ name: 'Class 9', level: 9 });
    const class10 = new Class({ name: 'Class 10', level: 10 });
    
    await class9.save().catch(e => console.log('Class 9 might already exist'));
    await class10.save().catch(e => console.log('Class 10 might already exist'));
    
    console.log('Inserted classes 9 and 10');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
