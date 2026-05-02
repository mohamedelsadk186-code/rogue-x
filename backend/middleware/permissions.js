const { query } = require('../db');

const ALL_MANAGER_PERMISSIONS = [
  'dashboard.view',
  'products.read',
  'products.create',
  'products.update',
  'products.delete',
  'orders.read',
  'orders.update',
  'users.read',
  'users.updateRole',
  'users.delete',
  'homepage.read',
  'homepage.update',
  'pages.read',
  'pages.create',
  'pages.update',
  'pages.delete',
];

function getUserPermissions(user) {
  if (!user) return [];
  if (user.role === 'admin') return [...ALL_MANAGER_PERMISSIONS];
  if (user.role !== 'manager') return [];
  const rows = query(
    'SELECT permission_key FROM manager_permissions WHERE user_id = ? ORDER BY permission_key ASC',
    [user.id]
  );
  return rows.map((r) => r.permission_key);
}

function requirePermission(permissionKey) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role === 'admin') return next();
    if (req.user.role !== 'manager') return res.status(403).json({ error: 'Insufficient role' });
    const permissions = getUserPermissions(req.user);
    if (!permissions.includes(permissionKey)) {
      return res.status(403).json({ error: `Missing permission: ${permissionKey}` });
    }
    return next();
  };
}

function requireAnyPermission(permissionKeys = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role === 'admin') return next();
    if (req.user.role !== 'manager') return res.status(403).json({ error: 'Insufficient role' });

    const permissions = getUserPermissions(req.user);
    const ok = permissionKeys.some((k) => permissions.includes(k));
    if (!ok) {
      return res.status(403).json({ error: `Missing permission: one of [${permissionKeys.join(', ')}]` });
    }
    return next();
  };
}

module.exports = {
  ALL_MANAGER_PERMISSIONS,
  getUserPermissions,
  requirePermission,
  requireAnyPermission,
};
