const express = require('express');
const router = express.Router();
const { query, run, get } = require('../db');
const authMiddleware = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

function serializeProduct(p) {
  return {
    ...p,
    sizes: JSON.parse(p.sizes || '[]'),
    colors: JSON.parse(p.colors || '[]'),
    images: JSON.parse(p.images || '[]'),
    price: Number(p.price),
    compare_at_price: p.compare_at_price !== null && p.compare_at_price !== undefined ? Number(p.compare_at_price) : null,
    stock: Number(p.stock),
    featured: Number(p.featured),
  };
}

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
  res.json(products.map(serializeProduct));
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = get('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(serializeProduct(product));
});

// POST /api/products
router.post('/', authMiddleware, requirePermission('products.create'), (req, res) => {
  const { name, slug, category, price, compare_at_price, description, image_url, images, sizes, colors, stock, status, featured } = req.body;
  if (!name || !slug || !category || !price || !description || !image_url)
    return res.status(400).json({ error: 'Missing required fields' });

  const sizesJson = JSON.stringify(sizes || ['S', 'M', 'L', 'XL', 'XXL']);
  const colorsJson = JSON.stringify(colors || []);
  const imagesJson = JSON.stringify(images || [image_url]);
  const result = run(
    'INSERT INTO products (name, slug, category, price, compare_at_price, description, image_url, images, sizes, colors, stock, status, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      name,
      slug,
      category,
      Number(price),
      compare_at_price !== undefined && compare_at_price !== '' ? Number(compare_at_price) : null,
      description,
      image_url,
      imagesJson,
      sizesJson,
      colorsJson,
      Number(stock) || 100,
      status === 'unavailable' ? 'unavailable' : 'available',
      featured ? 1 : 0,
    ]
  );
  const product = get('SELECT * FROM products WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(serializeProduct(product));
});

// PUT /api/products/:id
router.put('/:id', authMiddleware, requirePermission('products.update'), (req, res) => {
  const existing = get('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  const { name, slug, category, price, compare_at_price, description, image_url, images, sizes, colors, stock, status, featured } = req.body;
  const sizesJson = sizes ? JSON.stringify(sizes) : existing.sizes;
  const colorsJson = colors ? JSON.stringify(colors) : existing.colors;
  const imagesJson = images ? JSON.stringify(images) : existing.images;
  run(
    'UPDATE products SET name=?, slug=?, category=?, price=?, compare_at_price=?, description=?, image_url=?, images=?, sizes=?, colors=?, stock=?, status=?, featured=? WHERE id=?',
    [
      name || existing.name,
      slug || existing.slug,
      category || existing.category,
      price !== undefined ? Number(price) : Number(existing.price),
      compare_at_price !== undefined ? (compare_at_price === '' || compare_at_price === null ? null : Number(compare_at_price)) : existing.compare_at_price,
      description || existing.description,
      image_url || existing.image_url,
      imagesJson,
      sizesJson,
      colorsJson,
      stock !== undefined ? Number(stock) : Number(existing.stock),
      status || existing.status || 'available',
      featured !== undefined ? (featured ? 1 : 0) : Number(existing.featured),
      req.params.id
    ]
  );
  const product = get('SELECT * FROM products WHERE id = ?', [req.params.id]);
  res.json(serializeProduct(product));
});

// DELETE /api/products/:id
router.delete('/:id', authMiddleware, requirePermission('products.delete'), (req, res) => {
  const existing = get('SELECT id FROM products WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Product not found' });
  run('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.json({ message: 'Product deleted' });
});

module.exports = router;
