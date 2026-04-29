const express = require('express');
const router = express.Router();
const { query, run, get } = require('../db');
const authMiddleware = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');

// GET /api/products
router.get('/', (req, res) => {
  const { category, search, sort, featured } = req.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (search) {
    sql += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (featured === '1' || featured === 'true') { sql += ' AND featured = 1'; }

  if (sort === 'price_asc') sql += ' ORDER BY price ASC';
  else if (sort === 'price_desc') sql += ' ORDER BY price DESC';
  else sql += ' ORDER BY id DESC';

  const products = query(sql, params);
  const parsed = products.map(p => ({ ...p, sizes: JSON.parse(p.sizes), price: Number(p.price), stock: Number(p.stock), featured: Number(p.featured) }));
  res.json(parsed);
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = get('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  product.sizes = JSON.parse(product.sizes);
  product.price = Number(product.price);
  product.stock = Number(product.stock);
  product.featured = Number(product.featured);
  res.json(product);
});

// POST /api/products
router.post('/', authMiddleware, adminMiddleware, (req, res) => {
  const { name, slug, category, price, description, image_url, sizes, stock, featured } = req.body;
  if (!name || !slug || !category || !price || !description || !image_url)
    return res.status(400).json({ error: 'Missing required fields' });

  const sizesJson = JSON.stringify(sizes || ['S', 'M', 'L', 'XL', 'XXL']);
  const result = run(
    'INSERT INTO products (name, slug, category, price, description, image_url, sizes, stock, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [name, slug, category, Number(price), description, image_url, sizesJson, Number(stock) || 100, featured ? 1 : 0]
  );
  const product = get('SELECT * FROM products WHERE id = ?', [result.lastInsertRowid]);
  product.sizes = JSON.parse(product.sizes);
  product.price = Number(product.price);
  res.status(201).json(product);
});

// PUT /api/products/:id
router.put('/:id', authMiddleware, adminMiddleware, (req, res) => {
  const existing = get('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  const { name, slug, category, price, description, image_url, sizes, stock, featured } = req.body;
  const sizesJson = sizes ? JSON.stringify(sizes) : existing.sizes;
  run(
    'UPDATE products SET name=?, slug=?, category=?, price=?, description=?, image_url=?, sizes=?, stock=?, featured=? WHERE id=?',
    [
      name || existing.name,
      slug || existing.slug,
      category || existing.category,
      price !== undefined ? Number(price) : Number(existing.price),
      description || existing.description,
      image_url || existing.image_url,
      sizesJson,
      stock !== undefined ? Number(stock) : Number(existing.stock),
      featured !== undefined ? (featured ? 1 : 0) : Number(existing.featured),
      req.params.id
    ]
  );
  const product = get('SELECT * FROM products WHERE id = ?', [req.params.id]);
  product.sizes = JSON.parse(product.sizes);
  product.price = Number(product.price);
  res.json(product);
});

// DELETE /api/products/:id
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  const existing = get('SELECT id FROM products WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Product not found' });
  run('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.json({ message: 'Product deleted' });
});

module.exports = router;
