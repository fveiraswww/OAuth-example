import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { pool } from './db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = new Hono();

const ACCESS_EXPIRES_IN = '2h';
const REFRESH_EXPIRES_IN = '7d';

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_EXPIRES_IN,
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_SECRET!, {
    expiresIn: REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};

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
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: 'Email and password required' }, 400);
  }

  try {
    const result = await pool.query(
      'SELECT * FROM auth.users WHERE email = $1 LIMIT 1',
      [email]
    );

    if (result.rows.length) {
      const user = result.rows[0];

      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch)
        return c.json({ message: 'Invalid credentials' }, { status: 401 });

      const { accessToken, refreshToken } = generateTokens(user.id);

      await pool.query(
        'UPDATE auth.users SET refresh_token = $1 WHERE id = $2',
        [refreshToken, user.id]
      );

      return c.json({ accessToken }, { status: 201 });
    } else {
      return c.json({ message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Error logging in' });
  }
});

export default {
  port: 8080,
  fetch: app.fetch,
};
