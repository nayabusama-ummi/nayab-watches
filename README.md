# NAYAB · Fine Watchmaking from Pakistan

> **"A legacy measured in generations."**  
> NAYAB is a contemporary Pakistani luxury horological maison rooted in regional metallurgical mastery, Mughal architectural balance, and fine mechanical hand-finishing from our Lahore atelier.

---

## 1. Atelier & Maison Overview

NAYAB represents an authentic horological identity that rejects generic luxury tropes, fake European genealogies, and disposable fashion watchmaking. Every timepiece is conceived and hand-regulated in Pakistan, uniting centuries of subcontinent metal artistry with haute horlogerie mechanical movements.

### The Five Portfolios
1. **MEHR** — Classical dress horology featuring multi-fired Grand Feu ivory enamel dials, 18k rose gold architecture, and manual-wind calibres. Flagship: *Sovereign 39* (Ref. NB-3901-RG).
2. **INDUS** — Structural sports-luxury engineered from satin-brushed and mirror-bevelled Grade 5 Titanium with an integrated articulated bracelet and micro-rotor automatic calibre. Flagship: *Meridian 41* (Ref. NB-4102-TI).
3. **NOOR** — Slender 32 mm mechanical dress creations crafted in 18k Champagne Gold with opaline dials. Reference: *Noor 32* (Ref. NB-3201-CG).
4. **KARAKORAM** — High-altitude expedition chronometers engineered from 904L stainless steel with bidirectional rotating timing bezels. Reference: *Karakoram 42* (Ref. NB-4205-SS).
5. **ZAR** — Grand Complications atelier creations featuring hand-engraved 18k Honey Gold cases, minute repeaters, and perpetual calendars. Reference: *Zar Perpetual Minute Repeater* (Ref. NB-4309-HG).

---

## 2. Technical Architecture

The platform is architected as a decoupled, high-performance commerce and editorial web application:

```
┌─────────────────────────────────────────────────────────────┐
│                    NAYAB CLIENT FRONTEND                    │
│   React 18 · Vite 6 · TypeScript · TanStack Query · GSAP    │
│    Vanilla CSS Design System · Accessible Dialog Portals    │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON & HttpOnly Cookie
┌──────────────────────────────▼──────────────────────────────┐
│                    NAYAB BACKEND SERVICE                    │
│   Node.js · Express 4.21 · TypeScript · Zod Validation      │
│   HttpOnly JWT Cookie Auth · RBAC with Live DB Role Checks  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Prisma ORM 6.4 (Transactions)
┌──────────────────────────────▼──────────────────────────────┐
│                    POSTGRESQL DATABASE                      │
│   9 Relational Models · Row-Level Isolation · Atomicity     │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Highlights
- **Strict Multi-Tenant Security Isolation**: User identification is enforced in SQL `WHERE` clauses on every private resource. Customer B cannot read, update, or delete Customer A's addresses, wishlist items, bag, or orders (returning 404/403).
- **Transactional Checkout with Concurrency Protection**: Orders are generated within a single `prisma.$transaction` block using atomic conditional updates (`updateMany({ where: { id, stock: { gte: quantity } }, data: { stock: { decrement: quantity } } })`) ensuring negative stock and overselling are mathematically prevented under high-concurrency race conditions.
- **Immutable Order Snapshots**: `OrderItem` records store point-in-time snapshots of product name, reference, variant name, slug, image URL, unit price, and line total at the exact moment of purchase. Subsequent catalogue price changes or revisions never alter historical orders.
- **Price Drift & Stock Verification**: If a product price or stock availability shifts while stored in a client's bag, the checkout service detects the deviation and halts execution with a structured error, prompting user re-confirmation.
- **Strict Privacy & Zero Client-Side Credential Storage**: JWT session tokens are issued strictly via `Set-Cookie` with `HttpOnly; SameSite=Lax; Path=/` (and `Secure` in production). Authentication tokens, passwords, customer databases, orders, and wishlists are never stored in browser `localStorage`. Only anonymous guest session identifiers (`nayab_guest_session_id`) reside in client storage.
- **Guest Bag Merge on Authentication**: Timepieces added anonymously are smoothly merged into the customer's authenticated server bag upon registration or sign-in.
- **Server-Enforced Role-Based Access Control (RBAC)**: The `/api/admin/*` endpoints strictly verify the administrator's role by re-querying the database on every request, revoking access immediately if privileges change.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18.3.1 with React Router DOM 6.28.0
- **Build System**: Vite 6.4.3 + TypeScript 5.6.3
- **State Management & Caching**: `@tanstack/react-query` 5.62.8
- **Motion & Cinematic Effects**: GSAP 3.12.5 (ScrollTrigger pinning & smooth scrub)
- **Iconography**: Lucide React
- **Styling**: Vanilla CSS Design Tokens (Cormorant Garamond editorial serif, Plus Jakarta Sans technical sans, Tabular numerals, Double-bezel card structure, Warm Ivory / Charcoal / Champagne Gold palette)

### Backend
- **Runtime**: Node.js (v18+) with Express 4.21.2
- **Language**: TypeScript 5.6.3 (ESModules via `tsx`)
- **Database & ORM**: PostgreSQL with Prisma ORM 6.4.1
- **Authentication**: `jsonwebtoken` (HttpOnly Cookie) + `bcryptjs`
- **Validation**: Zod 3.24.2
- **Testing**: Vitest 2.1.8 + Supertest 7.0.0

---

## 4. Local Development & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: Local instance or hosted connection URI

### Step 1: Clone and Configure Environment Variables

Create backend configuration at `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nayab_db?schema=public"
JWT_SECRET="nayab_atelier_secret_jwt_key_super_secure_development_environment"
COOKIE_NAME="nayab_auth_token"
CORS_ORIGIN="http://localhost:3000"
```

Create frontend configuration at `.env`:
```env
VITE_API_URL="http://localhost:5000/api"
```

### Step 2: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 3: Database Migration & Seeding

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed authentic collections, products, variants, client, and admin accounts
npm run prisma:seed
```

#### Default Seeded Credentials
- **Atelier Administrator**:
  - Email: `atelier@nayab.pk`
  - Password: `Atelier@2026`
  - Access: Full access to `/admin` dashboard, order state machine management, and inventory stock adjustments.
- **Demo Registered Client**:
  - Email: `client@nayab.pk`
  - Password: `Nayab@2026`
  - Access: Client account portal, saved addresses, private wishlist, order history.

### Step 4: Run Development Servers

```bash
# In backend directory (Terminal 1)
npm run dev
# Server running at http://127.0.0.1:5000

# In root directory (Terminal 2)
npm run dev
# Frontend running at http://localhost:3000
```

---

## 5. Verification & Test Suite

The repository includes a comprehensive 50-test automated integration suite covering:
- Service health & metadata
- Collection & product catalog queries, search, availability filtering, and sorting
- Authentication registration, login, timing equalization, and cookie issuance
- Wishlist operations, deduplication, and multi-user isolation
- Guest bag management and post-login cart merging
- Address CRUD operations and multi-tenant security
- End-to-end transactional order creation with inventory decrement
- Concurrency race conditions (simultaneous checkout of the last remaining stock unit)
- Price drift protection and invalid status transition rejection
- Customer order cancellation with automatic stock restitution
- Admin authorization gates (403 for non-admins) and compare-and-set inventory adjustments

### Running Automated Tests
```bash
cd backend
npm test
```

Expected Output:
```
✓ tests/api.test.ts (25 tests)
✓ tests/commerce_and_security.test.ts (25 tests)

Test Files  2 passed (2)
     Tests  50 passed (50)
```

### Running Production Builds
```bash
# Build backend
cd backend
npm run build

# Build frontend
cd ..
npm run build
```

---

## 6. Payment Processing Disclosure

> **IMPORTANT DISCLOSURE**:  
> In accordance with this project milestone, payment processing is **SIMULATED** (`paymentMethod: 'SIMULATED'`). No real credit cards, bank accounts, or monetary funds are processed or debited during checkout. The checkout flow realistically validates addresses, inventory, pricing, and transactional order records for demonstration and quality assurance purposes.
