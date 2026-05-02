const jwt = require('jsonwebtoken');
const { get } = require('../db');
const { getUserPermissions } = require('./permissions');

const JWT_SECRET = process.env.JWT_SECRET || 'rogue_x_super_secret_jwt_key_2024';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const dbUser = get('SELECT id, email, role, name FROM users WHERE id = ?', [decoded.id]);
    const baseUser = dbUser || decoded;
    req.user = {
      ...baseUser,
      // Always derive from DB (never trust stale JWT snapshots)
      permissions: getUserPermissions(baseUser),
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
