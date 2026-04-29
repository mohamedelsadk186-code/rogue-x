const express = require('express');
const router = express.Router();
const { query, run, get } = require('../db');
const authMiddleware = require('../middleware/auth');
const { adminMiddleware, adminOrManagerMiddleware } = require('../middleware/admin');

// GET /api/admin/stats
router.get('/stats', authMiddleware, adminOrManagerMiddleware, (req, res) => {
  const totalUsersRow = get("SELECT COUNT(*) as count FROM users WHERE role = 'customer'", []);
  const totalOrdersRow = get("SELECT COUNT(*) as count FROM orders", []);
  const revenueRow = get("SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE status != 'cancelled'", []);
  const pendingRow = get("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'", []);
  const productsRow = get("SELECT COUNT(*) as count FROM products", []);
  const recentOrders = query(
    'SELECT o.*, u.name as user_name, u.email as user_email FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.id DESC LIMIT 5',
    []
  );
  res.json({
    totalUsers: Number(totalUsersRow.count),
    totalOrders: Number(totalOrdersRow.count),
    totalRevenue: Number(revenueRow.revenue),
    pendingOrders: Number(pendingRow.count),
    totalProducts: Number(productsRow.count),
    recentOrders: recentOrders.map(o => ({ ...o, total: Number(o.total) })),
  });
});

// GET /api/admin/homepage
router.get('/homepage', authMiddleware, adminOrManagerMiddleware, (req, res) => {
  const settings = query('SELECT key, value FROM homepage_settings', []);
  const result = {};
  for (const s of settings) result[s.key] = JSON.parse(s.value);
  res.json(result);
});

// PATCH /api/admin/homepage
router.patch('/homepage', authMiddleware, adminMiddleware, (req, res) => {
  const { banner, featured_products } = req.body;
  if (banner) run("INSERT OR REPLACE INTO homepage_settings (key, value) VALUES ('banner', ?)", [JSON.stringify(banner)]);
  if (featured_products) run("INSERT OR REPLACE INTO homepage_settings (key, value) VALUES ('featured_products', ?)", [JSON.stringify(featured_products)]);
  res.json({ message: 'Homepage settings updated' });
});

module.exports = router;
