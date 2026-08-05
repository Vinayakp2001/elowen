# Elowen — Luxury Jewelry E-Commerce Platform

A full-stack monorepo for a luxury jewelry e-commerce experience. Built with a modern headless architecture separating the storefront, content management, and backend API.

---

## Project Structure

```
elowen/
├── apps/
│   ├── web/          # Next.js storefront + Payload CMS (admin)
│   ├── api/          # FastAPI backend (cart, orders, auth, payments)
│   └── studio/       # Sanity Studio (legacy/content editing)
└── packages/
    └── shared/       # Shared TypeScript types
```

---

## Tech Stack

### Frontend — `apps/web`
| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI + custom components |
| State Management | Zustand |
| CMS / Admin | Payload CMS v3 (embedded in Next.js) |
| Database (CMS) | SQLite (via Payload's db-sqlite adapter) |
| Rich Text | Lexical (Payload richtext-lexical) |

### Backend — `apps/api`
| Layer | Technology |
|---|---|
| Framework | FastAPI |
| Language | Python 3 |
| ORM | SQLModel + Alembic |
| Database | PostgreSQL (psycopg2) |
| Auth | JWT (python-jose) + OAuth (Authlib) |
| Payments | Stripe |
| Shipping | Shiprocket |
| Email | Custom email service |
| Testing | Pytest |

### Content Studio — `apps/studio`
| Layer | Technology |
|---|---|
| CMS | Sanity v3 |
| Framework | React 18 |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Browser / Client                  │
└────────────┬────────────────────────┬────────────────┘
             │                        │
             ▼                        ▼
┌────────────────────┐   ┌────────────────────────────┐
│   Next.js (web)    │   │    Payload CMS Admin UI    │
│  - Storefront      │   │  (embedded at /admin)      │
│  - Product pages   │   │  - Products, Media, Nav    │
│  - Checkout UI     │   │  - Homepage settings       │
│  - Auth pages      │   └────────────┬───────────────┘
│  - Account/Orders  │                │
└────────┬───────────┘                │
         │  REST / fetch              │ SQLite
         ▼                            ▼
┌────────────────────┐   ┌────────────────────────────┐
│   FastAPI (api)    │   │     Payload SQLite DB      │
│  - Auth / JWT      │   │   (apps/web/payload.db)    │
│  - Cart service    │   └────────────────────────────┘
│  - Order service   │
│  - Stripe webhooks │
│  - Wishlist        │
│  - Newsletter      │
│  - Shiprocket      │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│    PostgreSQL DB   │
│  (users, orders,   │
│   cart, wishlist)  │
└────────────────────┘
```

**Data flow:**
- Product/content data lives in **Payload CMS** (SQLite, managed via `/admin`)
- Transactional data (orders, cart, users, wishlist) lives in **PostgreSQL** via the FastAPI backend
- The Next.js frontend fetches content from Payload and transactional data from FastAPI
- Stripe handles payment processing with webhooks hitting the FastAPI service
- Shiprocket handles shipping/fulfillment via the FastAPI service

---

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL

### 1. Frontend (Next.js + Payload CMS)
```bash
cd apps/web
cp .env.local.example .env.local   # fill in your values
npm install
npm run dev
```
Admin panel available at `http://localhost:3000/admin`

### 2. Backend (FastAPI)
```bash
cd apps/api
cp .env.example .env               # fill in your values
python -m venv elo_env
source elo_env/bin/activate        # Windows: elo_env\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API docs at `http://localhost:8000/docs`

### 3. Sanity Studio (optional)
```bash
cd apps/studio
npm install
npm run dev
```

---

## Environment Variables

Each app has its own `.env` file. Reference the `.example` files for required keys:
- `apps/web/.env.local.example`
- `apps/api/.env.example`

Key variables include Payload secret, database URLs, Stripe keys, Supabase/OAuth credentials, and Shiprocket API keys.

---

## Key Features
- Luxury storefront with editorial product pages, collections, and filters
- Payload CMS for content and product management
- JWT + OAuth authentication
- Cart, wishlist, and order management
- Stripe payment integration with webhook handling
- Shiprocket shipping integration
- Newsletter capture
- Responsive, accessible UI with Radix UI + Tailwind
