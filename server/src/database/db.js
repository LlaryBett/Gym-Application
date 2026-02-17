// database/db.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Neon-compatible PostgreSQL pool configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // MUST be the pooled Neon URL
  max: 20,                     // max concurrent connections
  idleTimeoutMillis: 30000,    // close idle clients after 30s
  connectionTimeoutMillis: 10000, // allow time for Neon cold start
  ssl: {
    rejectUnauthorized: false, // required for Neon
  },
});

// Log successful connections
pool.on("connect", () => {
  console.log("✅ Database connected successfully");
});

// Handle unexpected errors
pool.on("error", (err) => {
  console.error("❌ Unexpected database error:", err);
  process.exit(1); // fail fast in production
});

// Optional: explicit connection test on startup
export const testDatabaseConnection = async () => {
  try {
    const res = await pool.query("SELECT 1");
    console.log("🟢 Database test query successful");
    return res;
  } catch (error) {
    console.error("🔴 Database connection test failed:", error.message);
    throw error;
  }
};

export default pool;
