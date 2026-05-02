const express = require('express');
const router = express.Router();
const { query, run, get } = require('../db');
const authMiddleware = require('../middleware/auth');
const { adminOrManagerMiddleware } = require('../middleware/admin');
const { requirePermission, getUserPermissions } = require('../middleware/permissions');

// GET /api/admin/stats
router.get('/stats', authMiddleware, requirePermission('dashboard.view'), (req, res) => {
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
router.get('/homepage', authMiddleware, requirePermission('homepage.read'), (req, res) => {
  const settings = query('SELECT key, value FROM homepage_settings', []);
  const result = {};
  for (const s of settings) result[s.key] = JSON.parse(s.value);
  res.json(result);
});

// PATCH /api/admin/homepage
router.patch('/homepage', authMiddleware, requirePermission('homepage.update'), (req, res) => {
  const { banner, featured_products } = req.body;
  if (banner) run("INSERT OR REPLACE INTO homepage_settings (key, value) VALUES ('banner', ?)", [JSON.stringify(banner)]);
  if (featured_products) run("INSERT OR REPLACE INTO homepage_settings (key, value) VALUES ('featured_products', ?)", [JSON.stringify(featured_products)]);
  res.json({ message: 'Homepage settings updated' });
});

// POST /api/admin/assistant
router.post('/assistant', authMiddleware, requirePermission('dashboard.view'), (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  const totalUsers = Number(get("SELECT COUNT(*) as count FROM users WHERE role = 'customer'", [])?.count || 0);
  const totalOrders = Number(get("SELECT COUNT(*) as count FROM orders", [])?.count || 0);
  const totalRevenue = Number(get("SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE status != 'cancelled'", [])?.revenue || 0);
  const pendingOrders = Number(get("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'", [])?.count || 0);
  const lowStockProducts = query('SELECT name, stock FROM products WHERE stock <= 10 ORDER BY stock ASC LIMIT 5', []);
  const topProducts = query(
    `SELECT p.name, SUM(oi.quantity) as sold
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     GROUP BY p.id
     ORDER BY sold DESC
     LIMIT 5`,
    []
  );

  const answer = [
    `Store snapshot: ${totalUsers} customers, ${totalOrders} orders, and $${totalRevenue.toFixed(2)} revenue.`,
    pendingOrders > 0
      ? `You currently have ${pendingOrders} pending orders. Prioritize shipping updates to improve customer trust.`
      : 'No pending orders right now. Operations are running smoothly.',
    topProducts.length
      ? `Top sellers: ${topProducts.map((p, i) => `${i + 1}) ${p.name} (${Number(p.sold)} sold)`).join(', ')}.`
      : 'No top-selling data yet. After first orders, this section will show winner products.',
    lowStockProducts.length
      ? `Low stock alert: ${lowStockProducts.map(p => `${p.name} (${Number(p.stock)} left)`).join(', ')}.`
      : 'No low-stock alerts at the moment.',
    `Suggestion based on your request "${prompt}": Launch a limited-time campaign on your best seller, keep hero banner focused on one premium collection, and review product pricing weekly against conversion results.`,
  ].join('\n\n');

  res.json({ answer });
});

// GET /api/admin/me/permissions
router.get('/me/permissions', authMiddleware, adminOrManagerMiddleware, (req, res) => {
  res.json({ permissions: getUserPermissions(req.user) });
});

module.exports = router;
