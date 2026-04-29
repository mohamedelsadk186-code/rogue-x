const express = require('express');
const router = express.Router();
const { query, run, get } = require('../db');
const authMiddleware = require('../middleware/auth');
const { adminMiddleware, adminOrManagerMiddleware } = require('../middleware/admin');

// GET /api/users
router.get('/', authMiddleware, adminOrManagerMiddleware, (req, res) => {
  const users = query('SELECT id, name, email, role, created_at FROM users ORDER BY id DESC', []);
  res.json(users);
});

// PATCH /api/users/:id/role
router.patch('/:id/role', authMiddleware, adminMiddleware, (req, res) => {
  const { role } = req.body;
  if (!['admin', 'manager', 'customer'].includes(role))
    return res.status(400).json({ error: 'Invalid role' });
  const user = get('SELECT id FROM users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  run('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
  res.json({ message: 'Role updated', role });
});

// DELETE /api/users/:id
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  if (parseInt(req.params.id) === req.user.id)
    return res.status(400).json({ error: 'Cannot delete yourself' });
  const user = get('SELECT id FROM users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  run('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.json({ message: 'User deleted' });
});

module.exports = router;
