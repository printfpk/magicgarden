import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));
} else {
  console.warn('MONGODB_URI is not set in .env file!');
}

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
