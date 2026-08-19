import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

// Production-grade pool configuration
const pool = new pg.Pool({
  connectionString,
  min: 2,                       // Keep 2 connections always open
  max: 10,                      // Scale up to 10 under load
  idleTimeoutMillis: 30000,     // Close idle connections after 30s (but min stays)
  connectionTimeoutMillis: 10000, // Fail fast if DB unreachable
});

// Prevent crash when Neon drops idle connections unexpectedly
pool.on('error', (err) => {
  console.warn('⚠️ Pool: idle client error (connection will be replaced):', err.message);
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Pre-warm the connection pool at server startup.
 * This ensures the first user request doesn't pay the Neon cold-start penalty.
 */
export async function warmPool() {
  const start = Date.now();
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log(`✅ Database pool warmed in ${Date.now() - start}ms`);
  } catch (err) {
    console.error(`❌ Database warm-up failed (${Date.now() - start}ms):`, err.message);
  }
}

/**
 * Keep-alive: ping the database every 4 minutes to prevent
 * Neon serverless compute from suspending (suspends after 5min idle).
 */
setInterval(async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
  } catch (err) {
    console.warn('⚠️ Keep-alive ping failed:', err.message);
  }
}, 4 * 60 * 1000); // Every 4 minutes

export default prisma;
