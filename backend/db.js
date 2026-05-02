const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'roguex.db');

let db;

function saveDb() {
  const data = db.export();
  const buf = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buf);
}

async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      oauth_provider TEXT,
      oauth_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      compare_at_price REAL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      images TEXT NOT NULL DEFAULT '[]',
      sizes TEXT NOT NULL DEFAULT '["S","M","L","XL","XXL"]',
      colors TEXT NOT NULL DEFAULT '[]',
      stock INTEGER NOT NULL DEFAULT 100,
      status TEXT NOT NULL DEFAULT 'available',
      featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      total REAL NOT NULL,
      shipping_name TEXT,
      shipping_address TEXT,
      shipping_city TEXT,
      shipping_country TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price_at_purchase REAL NOT NULL,
      size TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS homepage_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS manager_permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      permission_key TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, permission_key),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      content TEXT NOT NULL DEFAULT '',
      seo_title TEXT,
      seo_description TEXT,
      is_published INTEGER NOT NULL DEFAULT 0,
      created_by INTEGER,
      updated_by INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (updated_by) REFERENCES users(id)
    );
  `);

  // Lightweight migrations for existing databases
  ensureColumn('users', 'oauth_provider', 'TEXT');
  ensureColumn('users', 'oauth_id', 'TEXT');

  ensureColumn('products', 'compare_at_price', 'REAL');
  ensureColumn('products', 'images', `TEXT NOT NULL DEFAULT '[]'`);
  ensureColumn('products', 'colors', `TEXT NOT NULL DEFAULT '[]'`);
  ensureColumn('products', 'status', `TEXT NOT NULL DEFAULT 'available'`);

  seedDefaultManagerPermissions();

  // Insert default homepage settings if not present
  const bannerCheck = query("SELECT key FROM homepage_settings WHERE key = 'banner'");
  if (bannerCheck.length === 0) {
    run("INSERT INTO homepage_settings (key, value) VALUES (?, ?)", [
      'banner',
      JSON.stringify({
        title: 'ROGUE X',
        subtitle: 'Define Your Edge',
        description: "Premium men's clothing for the bold. Crafted for those who refuse to blend in.",
        cta_text: 'Shop Now',
        cta_link: '/category/t-shirts'
      })
    ]);
    run("INSERT INTO homepage_settings (key, value) VALUES (?, ?)", [
      'featured_products',
      JSON.stringify([])
    ]);
    saveDb();
  }

  return db;
}

function ensureColumn(table, column, definition) {
  const result = db.exec(`PRAGMA table_info(${table})`);
  const cols = result[0]?.values?.map((row) => row[1]) || [];
  if (!cols.includes(column)) {
    db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    saveDb();
  }
}

function seedDefaultManagerPermissions() {
  const managerIds = query("SELECT id FROM users WHERE role = 'manager'", []);
  const defaults = [
    'dashboard.view',

    // Catalog
    'products.read',
    'products.create',
    'products.update',
    'products.delete',

    // Operations
    'orders.read',
    'orders.update',

    // People management
    'users.read',
    'users.updateRole',
    'users.delete',

    // CMS + marketing
    'pages.read',
    'pages.create',
    'pages.update',
    'pages.delete',

    // Homepage editorial
    'homepage.read',
    'homepage.update',
  ];
  for (const manager of managerIds) {
    for (const permission of defaults) {
      run(
        'INSERT OR IGNORE INTO manager_permissions (user_id, permission_key) VALUES (?, ?)',
        [manager.id, permission]
      );
    }
  }
}

// Helper: run a query that returns rows
function query(sql, params = []) {
  if (!db) throw new Error('DB not initialized');
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// Helper: run insert/update/delete, returns { lastInsertRowid, changes }
function run(sql, params = []) {
  if (!db) throw new Error('DB not initialized');
  db.run(sql, params);
  const lastInsertRowid = db.exec("SELECT last_insert_rowid() as id")[0]?.values[0]?.[0] || null;
  saveDb();
  return { lastInsertRowid };
}

// Helper: get single row
function get(sql, params = []) {
  const rows = query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

module.exports = { initDb, query, run, get, saveDb };
