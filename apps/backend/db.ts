import { Pool } from 'pg';

export const pool = new Pool({
  user: 'franciscoveiras',
  host: 'localhost',
  database: 'OAuth-example',
  password: 'pass1234',
  port: 5432,
});
