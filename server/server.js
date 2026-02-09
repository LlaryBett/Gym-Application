import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 PostgreSQL connection (same details as pgAdmin)
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fundadb',   // ← your DB name
  user: 'postgres',       // ← your pgAdmin username
  password: 'Bett@2026', // ← your pgAdmin password
});

// 🔹 Test DB connection
pool.query('SELECT NOW()')
  .then(res => console.log('Postgres connected:', res.rows[0]))
  .catch(err => console.error('Postgres connection error:', err));

/* ======================
   ROUTES
====================== */

// Get all trainers
app.get('/api/trainers', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM public.trainers ORDER BY id'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch trainers' });
  }
});

// Get featured trainers
app.get('/api/trainers/featured', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM public.trainers WHERE featured = true'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch featured trainers' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
