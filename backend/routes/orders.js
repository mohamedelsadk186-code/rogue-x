const express = require('express');
const router = express.Router();
const { query, run, get } = require('../db');
const authMiddleware = require('../middleware/auth');
const { adminOrManagerMiddleware } = require('../middleware/admin');

// POST /api/orders
router.post('/', authMiddleware, (req, res) => {
  const { items, shipping_name, shipping_address, shipping_city, shipping_country } = req.body;
  if (!items || items.length === 0)
    return res.status(400).json({ error: 'Order must have at least one item' });

  let total = 0;
  const enrichedItems = [];
  for (const item of items) {
    const product = get('SELECT price FROM products WHERE id = ?', [item.product_id]);
    if (!product) return res.status(400).json({ error: `Product ${item.product_id} not found` });
    total += Number(product.price) * item.quantity;
    enrichedItems.push({ ...item, price: Number(product.price) });
  }

  const orderResult = run(
    'INSERT INTO orders (user_id, status, total, shipping_name, shipping_address, shipping_city, shipping_country) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.user.id, 'pending', total, shipping_name, shipping_address, shipping_city, shipping_country]
  );
  const orderId = orderResult.lastInsertRowid;

  for (const item of enrichedItems) {
    run('INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, size) VALUES (?, ?, ?, ?, ?)',
      [orderId, item.product_id, item.quantity, item.price, item.size || null]);
  }

  const order = get('SELECT * FROM orders WHERE id = ?', [orderId]);
  order.total = Number(order.total);
  res.status(201).json(order);
});

// GET /api/orders - user's own orders
router.get('/', authMiddleware, (req, res) => {
  const orders = query('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [req.user.id]);
  const enriched = orders.map(order => {
    const items = query(
      'SELECT oi.*, p.name, p.image_url FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
      [order.id]
    );
    return { ...order, total: Number(order.total), items };
  });
  res.json(enriched);
});

// GET /api/orders/admin/all
router.get('/admin/all', authMiddleware, adminOrManagerMiddleware, (req, res) => {
  const orders = query(
    'SELECT o.*, u.name as user_name, u.email as user_email FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.id DESC',
    []
  );
  const enriched = orders.map(order => {
    const items = query(
      'SELECT oi.*, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
      [order.id]
    );
    return { ...order, total: Number(order.total), items };
  });
  res.json(enriched);
});

// GET /api/orders/:id
router.get('/:id', authMiddleware, (req, res) => {
  const order = get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const items = query(
    'SELECT oi.*, p.name, p.image_url FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
    [order.id]
  );
  res.json({ ...order, total: Number(order.total), items });
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', authMiddleware, adminOrManagerMiddleware, (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const order = get('SELECT id FROM orders WHERE id = ?', [req.params.id]);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ message: 'Status updated', status });
});

module.exports = router;
