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
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      sizes TEXT NOT NULL DEFAULT '["S","M","L","XL","XXL"]',
      stock INTEGER NOT NULL DEFAULT 100,
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
  `);

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
