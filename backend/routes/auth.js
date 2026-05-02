const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, run, get } = require('../db');
const { verifyGoogleIdToken, verifyAppleIdentityToken } = require('../services/oauth');
const { getUserPermissions } = require('../middleware/permissions');

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
  const fullUser = get('SELECT * FROM users WHERE id = ?', [result.lastInsertRowid]);
  const response = createAuthResponse(fullUser);
  res.status(201).json(response);
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  const user = get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Invalid email or password' });

  res.json(createAuthResponse(user));
});

function createAuthResponse(user) {
  const permissions = getUserPermissions(user);
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  const { password_hash, ...userSafe } = user;
  return { user: { ...userSafe, permissions }, token };
}

function findOrCreateOAuthUser({ provider, oauthId, email, name }) {
  let user = get('SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?', [provider, oauthId]);
  if (!user && email) {
    user = get('SELECT * FROM users WHERE email = ?', [email]);
    if (user) {
      run('UPDATE users SET oauth_provider = ?, oauth_id = ? WHERE id = ?', [provider, oauthId, user.id]);
      user = get('SELECT * FROM users WHERE id = ?', [user.id]);
    }
  }

  if (!user) {
    const safeEmail = email || `${provider}_${oauthId}@roguex.social`;
    const password_hash = bcrypt.hashSync(`${provider}_${oauthId}_${Math.random()}`, 10);
    const result = run(
      'INSERT INTO users (name, email, password_hash, role, oauth_provider, oauth_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name || 'OAuth User', safeEmail, password_hash, 'customer', provider, oauthId]
    );
    user = get('SELECT * FROM users WHERE id = ?', [result.lastInsertRowid]);
  }

  return user;
}

// POST /api/auth/oauth/google
router.post('/oauth/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken is required' });
    const profile = await verifyGoogleIdToken(idToken);
    const user = findOrCreateOAuthUser(profile);
    return res.json(createAuthResponse(user));
  } catch (err) {
    return res.status(401).json({ error: err.message || 'Google authentication failed' });
  }
});

// POST /api/auth/oauth/apple
router.post('/oauth/apple', async (req, res) => {
  try {
    const { identityToken } = req.body;
    if (!identityToken) return res.status(400).json({ error: 'identityToken is required' });
    const profile = await verifyAppleIdentityToken(identityToken);
    const user = findOrCreateOAuthUser(profile);
    return res.json(createAuthResponse(user));
  } catch (err) {
    return res.status(401).json({ error: err.message || 'Apple authentication failed' });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth'), (req, res) => {
  const user = get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const permissions = getUserPermissions(req.user);
  res.json({ user: { ...user, permissions } });
});

module.exports = router;
