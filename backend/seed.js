const bcrypt = require('bcryptjs');
const { initDb, query, run, get } = require('./db');

async function seed() {
  await initDb();
  console.log('Seeding database...');

  // Clear existing data
  run('DELETE FROM order_items', []);
  run('DELETE FROM orders', []);
  run('DELETE FROM products', []);
  run('DELETE FROM users', []);

  // Seed users
  const adminHash = bcrypt.hashSync('admin123', 10);
  const customerHash = bcrypt.hashSync('customer123', 10);
  const managerHash = bcrypt.hashSync('manager123', 10);

  run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['Admin User', 'admin@roguex.com', adminHash, 'admin']);
  run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['John Doe', 'customer@roguex.com', customerHash, 'customer']);
  run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['Store Manager', 'manager@roguex.com', managerHash, 'manager']);

  console.log('Users seeded');

  const sizes = JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']);

  const products = [
    // T-Shirts
    ['Black Phantom Tee', 'black-phantom-tee', 't-shirts', 49.99, 'Premium heavyweight cotton tee with subtle texture. Relaxed fit with reinforced stitching for long-lasting wear.', 'https://picsum.photos/seed/tee1/600/800', 1],
    ['White Ghost Tee', 'white-ghost-tee', 't-shirts', 49.99, 'Crisp white cotton tee with a clean silhouette. Perfect for layering or wearing solo.', 'https://picsum.photos/seed/tee2/600/800', 0],
    ['Stealth Graphic Tee', 'stealth-graphic-tee', 't-shirts', 59.99, 'Bold minimal graphic on ultra-soft Pima cotton. A statement piece for the discerning man.', 'https://picsum.photos/seed/tee3/600/800', 1],
    ['Rogue Signature Tee', 'rogue-signature-tee', 't-shirts', 55.00, 'The quintessential ROGUE X tee. Embossed logo on premium jersey fabric.', 'https://picsum.photos/seed/tee4/600/800', 0],
    // Pants
    ['Noir Slim Trousers', 'noir-slim-trousers', 'pants', 129.99, 'Tailored slim-fit trousers in matte black. Italian wool blend fabric with stretch comfort.', 'https://picsum.photos/seed/pants1/600/800', 1],
    ['Shadow Cargo Pants', 'shadow-cargo-pants', 'pants', 99.99, 'Technical cargo pants with concealed pockets. Lightweight ripstop fabric with water-resistant coating.', 'https://picsum.photos/seed/pants2/600/800', 0],
    ['Dark Matter Joggers', 'dark-matter-joggers', 'pants', 89.99, 'Premium French terry joggers with tapered fit. Elasticated waistband with drawstring.', 'https://picsum.photos/seed/pants3/600/800', 0],
    ['Obsidian Chinos', 'obsidian-chinos', 'pants', 119.99, 'Classic chino silhouette in deep obsidian. Stretch-cotton blend for all-day comfort.', 'https://picsum.photos/seed/pants4/600/800', 0],
    // Jackets
    ['Midnight Bomber', 'midnight-bomber', 'jackets', 249.99, 'MA-1 inspired bomber jacket in premium satin polyester. Gold embroidered detail on chest.', 'https://picsum.photos/seed/jacket1/600/800', 1],
    ['Eclipse Leather Jacket', 'eclipse-leather-jacket', 'jackets', 399.99, 'Genuine leather moto jacket with asymmetric zipper. Quilted lining for warmth.', 'https://picsum.photos/seed/jacket2/600/800', 1],
    ['Void Coach Jacket', 'void-coach-jacket', 'jackets', 179.99, 'Lightweight coach jacket in technical nylon. Concealed hood, snap button closure.', 'https://picsum.photos/seed/jacket3/600/800', 0],
    ['Abyss Blazer', 'abyss-blazer', 'jackets', 299.99, 'Structured single-button blazer in black wool blend. Peak lapels, welt pockets.', 'https://picsum.photos/seed/jacket4/600/800', 0],
    // Hoodies
    ['Phantom Pullover Hoodie', 'phantom-pullover-hoodie', 'hoodies', 119.99, 'Heavyweight 400gsm French terry pullover hoodie. Oversized fit with dropped shoulders.', 'https://picsum.photos/seed/hoodie1/600/800', 1],
    ['Specter Zip Hoodie', 'specter-zip-hoodie', 'hoodies', 139.99, 'Full-zip hoodie in premium cotton fleece. YKK zip, kangaroo pockets.', 'https://picsum.photos/seed/hoodie2/600/800', 0],
    ['Wraith Tech Hoodie', 'wraith-tech-hoodie', 'hoodies', 159.99, 'Performance hoodie with moisture-wicking fabric. Thumb holes, hidden pocket, reflective logo.', 'https://picsum.photos/seed/hoodie3/600/800', 0],
    ['Dark Oversized Hoodie', 'dark-oversized-hoodie', 'hoodies', 129.99, 'Boxy oversized fit hoodie in organic cotton blend. Minimalist design with tonal embroidery.', 'https://picsum.photos/seed/hoodie4/600/800', 0],
  ];

  for (const [name, slug, category, price, description, image_url, featured] of products) {
    run('INSERT INTO products (name, slug, category, price, description, image_url, sizes, stock, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, slug, category, price, description, image_url, sizes, 100, featured]);
  }

  console.log(`${products.length} products seeded`);

  // Update featured products in homepage settings
  const featured = query('SELECT id FROM products WHERE featured = 1 LIMIT 4', []);
  run("INSERT OR REPLACE INTO homepage_settings (key, value) VALUES ('featured_products', ?)",
    [JSON.stringify(featured.map(p => p.id))]);

  // Seed a sample order
  const orderResult = run(
    "INSERT INTO orders (user_id, status, total, shipping_name, shipping_address, shipping_city, shipping_country) VALUES (2, 'delivered', 199.98, 'John Doe', '123 Luxury Lane', 'New York', 'USA')",
    []
  );
  const orderId = orderResult.lastInsertRowid;
  run('INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, size) VALUES (?, 1, 2, 49.99, ?)', [orderId, 'M']);
  run('INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, size) VALUES (?, 5, 1, 129.99, ?)', [orderId, 'L']);

  console.log('Sample order seeded');
  console.log('\nSeeding complete!');
  console.log('Admin: admin@roguex.com / admin123');
}

seed().catch(console.error);
