import { Pool } from 'pg';
import { env } from './environment';

/**
 * Database configuration interface
 */
interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

/**
 * Creates a PostgreSQL connection pool
 * @returns {Pool} PostgreSQL connection pool instance
 */
function createDatabasePool(): Pool {
  const config: DatabaseConfig = {
    host: env.DB_HOST || 'localhost',
    port: parseInt(env.DB_PORT || '5432', 10),
    username: env.DB_USERNAME || 'postgres',
    password: env.DB_PASSWORD || 'postgres',
    database: env.DB_NAME || 'todo_app'
  };

  return new Pool({
    host: config.host,
    port: config.port,
    user: config.username,
    password: config.password,
    database: config.database,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

const pool = createDatabasePool();

/**
 * Executes a database query
 * @param text - SQL query string
 * @param params - Query parameters
 * @returns Query result
 */
async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    console.error('Error executing query', { text, duration, error });
    throw error;
  }
}

export { pool, query };