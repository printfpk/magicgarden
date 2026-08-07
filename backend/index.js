import express from 'express';

import cors from 'cors';
import dotenv from 'dotenv';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



// Routes
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
