const express = require('express');
const router = express.Router();
const { query, run, get } = require('../db');
const authMiddleware = require('../middleware/auth');
const { ALL_MANAGER_PERMISSIONS, getUserPermissions, requirePermission } = require('../middleware/permissions');

// GET /api/users
router.get('/', authMiddleware, requirePermission('users.read'), (req, res) => {
  const users = query('SELECT id, name, email, role, created_at FROM users ORDER BY id DESC', []);
  res.json(users.map((u) => ({
    ...u,
    permissions: u.role === 'manager' || u.role === 'admin' ? getUserPermissions(u) : [],
  })));
});

// PATCH /api/users/:id/role
router.patch('/:id/role', authMiddleware, requirePermission('users.updateRole'), (req, res) => {
  const { role } = req.body;
  if (!['admin', 'manager', 'customer'].includes(role))
    return res.status(400).json({ error: 'Invalid role' });
  const user = get('SELECT id FROM users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  run('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
  if (role === 'manager') {
    for (const permission of ALL_MANAGER_PERMISSIONS) {
      run(
        'INSERT OR IGNORE INTO manager_permissions (user_id, permission_key) VALUES (?, ?)',
        [req.params.id, permission]
      );
    }
  }
  res.json({ message: 'Role updated', role });
});

// GET /api/users/:id/permissions
router.get('/:id/permissions', authMiddleware, requirePermission('users.updateRole'), (req, res) => {
  const user = get('SELECT id, role FROM users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.role === 'customer') return res.json({ permissions: [] });
  const permissions = getUserPermissions(user);
  res.json({ permissions, available: ALL_MANAGER_PERMISSIONS });
});

// PUT /api/users/:id/permissions
router.put('/:id/permissions', authMiddleware, requirePermission('users.updateRole'), (req, res) => {
  const { permissions } = req.body;
  if (!Array.isArray(permissions)) return res.status(400).json({ error: 'permissions must be an array' });
  const user = get('SELECT id, role FROM users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.role === 'customer') return res.status(400).json({ error: 'Customer cannot have manager permissions' });

  const validPermissions = permissions.filter((p) => ALL_MANAGER_PERMISSIONS.includes(p));
  run('DELETE FROM manager_permissions WHERE user_id = ?', [req.params.id]);
  for (const permission of validPermissions) {
    run(
      'INSERT OR IGNORE INTO manager_permissions (user_id, permission_key) VALUES (?, ?)',
      [req.params.id, permission]
    );
  }
  res.json({ message: 'Permissions updated', permissions: validPermissions });
});

// DELETE /api/users/:id
router.delete('/:id', authMiddleware, requirePermission('users.delete'), (req, res) => {
  if (parseInt(req.params.id) === req.user.id)
    return res.status(400).json({ error: 'Cannot delete yourself' });
  const user = get('SELECT id FROM users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  run('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.json({ message: 'User deleted' });
});

module.exports = router;
