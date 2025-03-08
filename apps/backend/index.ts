import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { pool } from './db';
import bcrypt from 'bcryptjs';

const app = new Hono();

app.get('/', (c) => c.text('Hono!'));

app.use(
  '/auth/*',
  cors({
    origin: 'http://localhost:5173',
    allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600,
    credentials: true,
  })
);

app.post('/auth/signUp', async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: 'Email and password required' }, 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      'INSERT INTO auth.users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, hashedPassword]
    );

    return c.json({ user: result.rows[0] }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Error registering user' });
  }
});

app.post('/auth/signIn', async (c) => {
  return c.json({ message: 'next step' }, { status: 200 });
});

export default {
  port: 8080,
  fetch: app.fetch,
};
