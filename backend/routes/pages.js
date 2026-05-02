const express = require('express');
const router = express.Router();
const { query, run, get } = require('../db');
const authMiddleware = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

// Public pages list
router.get('/public', (req, res) => {
  const pages = query(
    'SELECT id, title, slug, description, seo_title, seo_description, updated_at FROM pages WHERE is_published = 1 ORDER BY id DESC',
    []
  );
  res.json(pages);
});

// Public page by slug
router.get('/public/:slug', (req, res) => {
  const page = get(
    'SELECT id, title, slug, description, content, seo_title, seo_description, updated_at FROM pages WHERE slug = ? AND is_published = 1',
    [req.params.slug]
  );
  if (!page) return res.status(404).json({ error: 'Page not found' });
  res.json(page);
});

// Admin list pages
router.get('/', authMiddleware, requirePermission('pages.read'), (req, res) => {
  const pages = query(
    `SELECT p.*, u1.name as created_by_name, u2.name as updated_by_name
     FROM pages p
     LEFT JOIN users u1 ON p.created_by = u1.id
     LEFT JOIN users u2 ON p.updated_by = u2.id
     ORDER BY p.id DESC`,
    []
  );
  res.json(pages);
});

// Admin create page
router.post('/', authMiddleware, requirePermission('pages.create'), (req, res) => {
  const { title, slug, description, content, seo_title, seo_description, is_published } = req.body;
  if (!title || !slug) return res.status(400).json({ error: 'title and slug are required' });
  run(
    `INSERT INTO pages (title, slug, description, content, seo_title, seo_description, is_published, created_by, updated_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      slug,
      description || '',
      content || '',
      seo_title || '',
      seo_description || '',
      is_published ? 1 : 0,
      req.user.id,
      req.user.id,
    ]
  );
  const created = get('SELECT * FROM pages WHERE slug = ?', [slug]);
  res.status(201).json(created);
});

// Admin update page
router.put('/:id', authMiddleware, requirePermission('pages.update'), (req, res) => {
  const existing = get('SELECT * FROM pages WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Page not found' });
  const { title, slug, description, content, seo_title, seo_description, is_published } = req.body;
  run(
    `UPDATE pages
     SET title=?, slug=?, description=?, content=?, seo_title=?, seo_description=?, is_published=?, updated_by=?, updated_at=datetime('now')
     WHERE id=?`,
    [
      title || existing.title,
      slug || existing.slug,
      description !== undefined ? description : existing.description,
      content !== undefined ? content : existing.content,
      seo_title !== undefined ? seo_title : existing.seo_title,
      seo_description !== undefined ? seo_description : existing.seo_description,
      is_published !== undefined ? (is_published ? 1 : 0) : existing.is_published,
      req.user.id,
      req.params.id,
    ]
  );
  res.json(get('SELECT * FROM pages WHERE id = ?', [req.params.id]));
});

// Admin delete page
router.delete('/:id', authMiddleware, requirePermission('pages.delete'), (req, res) => {
  const existing = get('SELECT id FROM pages WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Page not found' });
  run('DELETE FROM pages WHERE id = ?', [req.params.id]);
  res.json({ message: 'Page deleted' });
});

module.exports = router;
