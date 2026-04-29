require('dotenv').config({ path: require('path').join(__dirname, 'env.txt') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize DB then start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`ROGUE X API running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize DB:', err);
  process.exit(1);
});
