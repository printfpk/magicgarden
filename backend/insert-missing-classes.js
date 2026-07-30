import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Class from './models/Class.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const class4 = new Class({ name: 'Class 4', level: 4 });
    const class6 = new Class({ name: 'Class 6', level: 6 });
    
    await class4.save().catch(e => console.log('Class 4 might already exist'));
    await class6.save().catch(e => console.log('Class 6 might already exist'));
    
    console.log('Inserted classes 4 and 6');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
