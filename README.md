# ROGUE X — Men's Luxury Clothing E-Commerce

Dark luxury e-commerce platform for men's clothing built with React, Node.js, and SQLite.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Framer Motion + Zustand
- **Backend**: Node.js + Express + better-sqlite3
- **Auth**: JWT + bcryptjs
- **Database**: SQLite (file-based, zero setup)

## Quick Start

### 1. Install all dependencies
```bash
npm run install:all
```

### 2. Seed the database
```bash
npm run seed
```

### 3. Start development servers
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Seeded Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@roguex.com | admin123 |
| Customer | customer@roguex.com | customer123 |

## Admin Dashboard
Visit http://localhost:5173/admin after logging in with the admin account.

## Features
- Homepage with hero banner, featured products, category sections
- Product categories: T-Shirts, Pants, Jackets, Hoodies
- Product detail with size selector and add-to-cart
- Shopping cart with quantity management
- Checkout with shipping + payment form
- JWT authentication (login/register)
- Admin dashboard: stats, product management, user management, order management, homepage editor
