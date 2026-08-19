import express from 'express';

import cors from 'cors';
import dotenv from 'dotenv';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';
import { warmPool } from './utils/prisma.js';
import { preWarmCache } from './routes/public.js';

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Response-time logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      const color = duration > 500 ? '\x1b[31m' : duration > 100 ? '\x1b[33m' : '\x1b[32m';
      console.log(`${color}${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)\x1b[0m`);
    }
  });
  next();
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

// Warm the database pool, pre-fill cache, THEN accept requests
warmPool()
  .then(() => preWarmCache())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  });
