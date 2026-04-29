const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, run, get } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'rogue_x_super_secret_jwt_key_2024';

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const existing = get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const password_hash = bcrypt.hashSync(password, 10);
  const result = run(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email.toLowerCase(), password_hash, 'customer']
  );
  const user = get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [result.lastInsertRowid]);
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ user, token });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  const user = get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Invalid email or password' });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  const { password_hash, ...userSafe } = user;
  res.json({ user: userSafe, token });
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth'), (req, res) => {
  const user = get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

module.exports = router;
