# ROGUE X — Men's Luxury Clothing E-Commerce

Dark luxury e-commerce platform for men's clothing built with React, Node.js, and SQLite.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Framer Motion + Zustand
- **Backend**: Node.js + Express + sql.js (SQLite file persisted to `backend/roguex.db`)
- **Auth**: JWT + bcryptjs + OAuth token verification (**Google**, **Apple**)
- **Media**: Cloudinary uploads + server-side resize/optimize (**sharp** → **WebP**)
- **Database**: SQLite via sql.js (**zero Docker / zero Postgres setup for local/dev**)

## Configure Environment Variables

### Frontend (`frontend/.env`)
Copy `frontend/.env.example` → `frontend/.env` (Vite reads `VITE_*` vars):

- **`VITE_GOOGLE_CLIENT_ID`**: OAuth Web Client ID (used by `@react-oauth/google`)
- **`VITE_APPLE_CLIENT_ID`**: Apple **Services ID** (used by Apple JS popup)

### Backend (`backend/env.txt`)
This repo loads backend env vars from **`backend/env.txt`** (see `backend/server.js`).
Copy:

- **`backend/env.example.txt` → `backend/env.txt`**

Required keys depend on features you enable:

- **JWT**: `JWT_SECRET`
- **CORS (إنتاج)**: `CLIENT_ORIGINS` (قائمة مفصولة بفواصل لمضيف المتصفح، مثل `https://your-frontend.onrender.com`)
- **Google verification**: `GOOGLE_CLIENT_ID` (Web). Optional helpers:
  - `GOOGLE_IOS_CLIENT_ID`, `GOOGLE_ALLOWED_AUDIENCES`
- **Apple verification**: `APPLE_CLIENT_ID` (must match frontend Services ID)
- **Cloudinary**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

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
| Manager | manager@roguex.com | manager123 |
| Customer | customer@roguex.com | customer123 |

> Managers use a **permission matrix** (`manager_permissions`). Admins implicitly have **full access**.

## Admin Dashboard
Visit http://localhost:5173/admin after logging in with the admin account.

## Features
- Homepage with hero banner, featured products, category sections
- Product categories: T-Shirts, Pants, Jackets, Hoodies
- Product detail with size selector and add-to-cart
- Shopping cart with quantity management
- Checkout with shipping + payment form
- JWT authentication (`/api/auth/register`, `/api/auth/login`)
- OAuth login (`/api/auth/oauth/google`, `/api/auth/oauth/apple`) with **cryptographic verification** on the backend
- Image uploads (`POST /api/uploads/images`) to **Cloudinary** (authenticated + permission-gated)
- CMS pages (**public**: `/pages` + `/p/:slug`; **admin**: `/admin/pages`)
- Admin dashboard + fine-grained manager permissions (**matrix editor** in `/admin/users`)
