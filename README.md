# NAYAB · Fine Watchmaking

> **Haute Horlogerie from Lahore, Pakistan**  
> *A digital flagship and bespoke client desk engineered with React, TypeScript, Node.js, Express, Prisma ORM, and PostgreSQL.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.18-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tests](https://img.shields.io/badge/Tests-50%20Passing-brightgreen)](https://vitest.dev/)

---

## Visual Flagship Preview

![NAYAB Fine Watchmaking — Homepage](docs/screenshots/01-homepage-cinematic.png)

---

## Table of Contents

- [About the Maison](#about-the-maison)
- [Design Philosophy & Aesthetic Direction](#design-philosophy--aesthetic-direction)
- [Key Features](#key-features)
- [Visual Experience Gallery](#visual-experience-gallery)
- [The Permanent Collections](#the-permanent-collections)
- [Technical Architecture](#technical-architecture)
- [Acquisition & Commerce Flow](#acquisition--commerce-flow)
- [Security & Data Integrity](#security--data-integrity)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Database Seeding](#database-seeding)
- [Running Automated Tests](#running-automated-tests)
- [Simulated Commerce Notice](#simulated-commerce-notice)
- [License & Credits](#license--credits)

---

## About the Maison

**NAYAB** (نِیاب) is a fictional luxury horological house founded on the principle that mechanical timepieces should embody patience, precision, and permanence. Operating from Lahore, Pakistan, the maison blends classical Swiss finishing standards with South Asian artistry—furnace-fired Grand Feu enamel dials, hand-beveled rose gold bridges, and hand-engraved indices inspired by classical Indo-Persian geometry.

This digital flagship presents the complete atelier catalog, an interactive timepiece configurator, a secure acquisition pipeline, and a dedicated **Client Desk** for registered collectors.

---

## Design Philosophy & Aesthetic Direction

The digital experience is crafted as a tribute to high-horology publishing:

- **Editorial Typography**: Pairing classical serif headline typography (*Playfair Display* / *Cormorant Garamond*) with ultra-clean grotesque sans-serif labels (*Inter* / *Cinzel*).
- **Monochrome & Warm Champagne Palette**: Built upon rich obsidian `#0A0A0A`, warm alabaster `#F7F5F0`, fine hairline borders `#E2DED6`, and subtle brushed-gold accents `#C5A880`.
- **Restraint & Micro-Interactions**: Smooth 60fps transitions, -12° tilted watch iconography, ambient radial highlights, and non-jarring feedback states.
- **Responsive Geometry**: Full mobile and ultra-wide desktop support with fluid typography scales and adaptive bento layouts.

---

## Key Features

### 🏛️ Digital Flagship Experience
- **Cinematic Heritage Hero**: Immersive multi-slide storytelling showcase with ambient audio and high-resolution movement photography.
- **Fullscreen Curated Navigation**: Comprehensive navigational overlay revealing collections, craftsmanship journals, private client services, and real-time bag counts.
- **Direct Atelier Icon Shortcut**: Top-right custom SVG watch icon providing one-click access directly to the complete timepiece catalog.

### ⏱️ Catalog & Timepiece Configurator
- **Full Atelier Inventory (`/watches`)**: Real-time faceted search and filtering across collections, case metallurgy, dial enamel, movement calibres, and stock availability.
- **Product Detail Desk (`/watches/:slug`)**: Multi-variant metallurgy selection, technical movement specifications, live inventory badges, and high-resolution product photography.

### 💼 Bespoke Client Desk (`/account`)
- **Collector Identity & Provenance**: Client reference badges (`NYB-CMTBVTU7`), registered tenure date, and personalized welcome.
- **4-Pillar Atelier Bento Showcase**: Quick-glance feature cards detailing movement precision, Grand Feu metallurgy, and tamper-proof archival guarantees.
- **Registered Provenance Ledger**: Real-time history of all confirmed acquisitions with order serials, dispatch statuses, and line item breakdowns.
- **Curated Wishlist & Address Management**: Multi-address Pakistani delivery registry with default address assignment.

### 🛍️ Secure Acquisition Pipeline
- **Unified Bag & Guest Merge**: Seamless guest browsing with automatic cart migration upon authentication or registration.
- **Transactional Atomic Checkout**: Concurrency-safe order reservations with database-level inventory locks to prevent overselling.
- **Concierge Order Confirmation (`/orders/:id`)**: Formal allocation notice with generated serials (`NYB-2026-XXXXX`), status tracking, and delivery breakdown.

---

## Visual Experience Gallery

### 1. Curated Navigation & Complete Inventory

| Fullscreen Navigation | Complete Atelier Catalog |
| :---: | :---: |
| ![Fullscreen Navigation](docs/screenshots/02-fullscreen-navigation.png) | ![All Timepieces](docs/screenshots/03-all-timepieces.png) |
| *Full-overlay navigation featuring collections and services* | *Faceted inventory search with material and calibre filters* |

---

### 2. Haute Horlogerie Timepiece Details

| Sovereign 39 · Rose Gold | Meridian 41 · Grade 5 Titanium |
| :---: | :---: |
| ![Sovereign 39](docs/screenshots/04-sovereign-39-product.png) | ![Meridian 41](docs/screenshots/05-meridian-41-product.png) |
| *Grand Feu ivory enamel dial with Calibre N-12 Manual* | *Midnight blue textured dial with integrated titanium bracelet* |

---

### 3. Authenticated Client Desk & Reservation Checkout

| Authenticated Client Desk | Reservation Checkout |
| :---: | :---: |
| ![Client Account Desk](docs/screenshots/06-client-account.png) | ![Bag Checkout](docs/screenshots/07-bag-checkout.png) |
| *Collector profile, 4-pillar bento showcase, and registered ledger* | *Simulated order allocation with verified delivery address* |

---

### 4. Atelier Order Confirmation

![Order Confirmation](docs/screenshots/08-order-confirmation.png)
*Official acquisition allocation with unique serial registry (`NYB-2026-25CWPW`) and concierge dispatch notice.*

---

## The Permanent Collections

```
NAYAB HOROLOGY ARCHIVE
├── 01 MEHR COLLECTION
│   └── Sovereign 39 (Ref. NB-3901-RG) — 18K Rose Gold, Grand Feu Ivory Enamel, Calibre N-12
├── 02 INDUS COLLECTION
│   └── Meridian 41 (Ref. NB-4102-TI) — Grade 5 Titanium, Midnight Blue Dial, Calibre N-08 Automatic
├── 03 NOOR COLLECTION
│   └── Noor Classic 36 (Ref. NB-3601-YG) — 18K Yellow Gold, Champagne Sunburst Dial
├── 04 QALAM COLLECTION
│   └── Qalam Chronograph 42 (Ref. NB-4203-WG) — 18K White Gold, Retrograde Calendar
└── 05 HERITAGE EDITIONS
    └── Atelier Milestones & Bespoke Historical Commissions
```

---

## Technical Architecture

### Full-Stack Architecture

```mermaid
flowchart TB
    subgraph Client ["Frontend (Browser)"]
        UI["React 18 + Vite SPA"]
        State["Zustand State Stores\n(Auth, Cart, Wishlist)"]
        Router["React Router v6"]
        UI --> State
        UI --> Router
    end

    subgraph API ["Backend (Node.js & Express)"]
        CORS["CORS & Origin Guard"]
        AuthMid["JWT Auth Middleware\n(HttpOnly Cookies)"]
        ZodVal["Zod Schema Validation"]
        
        subgraph Controllers ["API Controllers"]
            AC["AuthController"]
            PC["ProductController"]
            CC["CartController"]
            OC["OrderController"]
        end

        subgraph Services ["Service Layer"]
            AS["AuthService (Argon2id)"]
            PS["ProductService"]
            CS["CartService (Guest Merge)"]
            OS["OrderService ($transaction)"]
        end
    end

    subgraph Data ["Database Tier"]
        Prisma["Prisma ORM 5.18"]
        PG[("PostgreSQL Database")]
    end

    UI -- "JSON Requests (credentials: include)" --> CORS
    CORS --> AuthMid --> ZodVal
    ZodVal --> Controllers
    Controllers --> Services
    Services --> Prisma
    Prisma --> PG
```

### Technology Stack Summary

- **Frontend**:
  - React 18 with TypeScript
  - Vite 5 Build Pipeline
  - Lucide React Iconography
  - Custom CSS Design System (Bento Grids, Radial Gradients, Editorial Scales)
- **Backend**:
  - Node.js (ESM) & Express.js with TypeScript
  - Prisma ORM 5.18
  - PostgreSQL 14+
  - Argon2id Password Hashing (`@node-rs/argon2`)
  - JSON Web Tokens (`jsonwebtoken`)
  - Zod Request Schema Validation
- **Testing & Tooling**:
  - Vitest & Supertest (50 unit and integration tests)
  - Puppeteer Core Automated Screenshot Engine

---

## Acquisition & Commerce Flow

1. **Exploration**: Collector browses `/watches` or selects specific collections from the fullscreen menu.
2. **Configuration**: Chooses case metal, dial finish, and strap combinations on `/watches/:slug`.
3. **Cart Assembly**: Adds timepiece to bag (managed client-side with guest session ID in local storage).
4. **Authentication & Bag Merge**: When signing in at `/login`, any active guest bag items are automatically merged into the user's permanent database cart.
5. **Atomic Order Reservation**: During checkout at `/checkout`:
   - An interactive delivery address is confirmed.
   - Prisma executes an atomic `$transaction` that locks stock rows, validates availability, creates the order with unique serial `NYB-2026-XXXXX`, decrements inventory, and empties the active cart.
6. **Provenance Record**: Order is cataloged in the collector's `/account` registered acquisitions ledger.

---

## Security & Data Integrity

- **HttpOnly Secure Cookies**: Authentication tokens are stored exclusively in HttpOnly, SameSite cookies to protect against XSS token exfiltration.
- **Argon2id Hashing**: Industry-standard Argon2id cryptographic password hashing with unique salts.
- **Schema Validation**: All inbound endpoints are strictly validated via Zod schemas before hitting business logic.
- **Transactional Consistency**: Multi-table updates (Order creation + Stock decrement + Cart clear) run inside atomic database transactions to eliminate race conditions.
- **Zero Exposed Secrets**: Environment variables and database credentials are fully isolated in local configuration files and excluded from source control.

---

## Repository Structure

```
nayab-watches/
├── docs/
│   └── screenshots/              # High-resolution application screenshots
│       ├── 01-homepage-cinematic.png
│       ├── 02-fullscreen-navigation.png
│       ├── 03-all-timepieces.png
│       ├── 04-sovereign-39-product.png
│       ├── 05-meridian-41-product.png
│       ├── 06-client-account.png
│       ├── 07-bag-checkout.png
│       └── 08-order-confirmation.png
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # PostgreSQL data models
│   │   ├── seed.ts               # Demo clients, watches, and collections
│   │   └── migrations/           # Versioned migration history
│   ├── src/
│   │   ├── config/               # Environment & cookie settings
│   │   ├── controllers/          # Express route controllers
│   │   ├── middleware/           # Auth, error handling, rate limiting
│   │   ├── routes/               # API endpoints (/auth, /products, /cart, /orders)
│   │   ├── services/             # Business logic & atomic transactions
│   │   ├── validators/           # Zod schemas
│   │   └── index.ts              # Express server entrypoint
│   ├── tests/                    # Vitest integration test suite (50 tests)
│   ├── package.json
│   └── tsconfig.json
├── src/
│   ├── api/                      # Frontend API client
│   ├── components/               # Luxury UI components & layouts
│   │   ├── cart/                 # Bag drawer & line items
│   │   ├── collections/          # Timepiece grids & filter sidebars
│   │   ├── layout/               # LuxuryNavbar, FullscreenNav, Footer
│   │   ├── product/              # Product hero, metallurgy selector
│   │   └── ui/                   # EditorialButton, Badge, Modal
│   ├── hooks/                    # Auth, Cart, and Wishlist React hooks
│   ├── pages/                    # Route pages (Home, Watches, Detail, Account, Checkout)
│   ├── styles/                   # Luxury variables, typography, animations
│   ├── App.tsx                   # Main route tree
│   └── main.tsx                  # React DOM root
├── public/                       # Optimized watch photography and media loops
├── scripts/
│   └── capture-screenshots.cjs   # Automated Puppeteer screenshot pipeline
├── package.json                  # Root workspace scripts
└── README.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v14.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0 or higher)

---

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` folder:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="postgresql://postgres:password@localhost:5432/nayab_db?schema=public"
   JWT_SECRET="your_secure_jwt_secret_key_here"
   CORS_ORIGIN="http://localhost:3000,http://127.0.0.1:3000"
   ```

3. **Run Prisma Migrations**:
   ```bash
   npx prisma migrate dev
   ```

4. **Seed the Database**:
   ```bash
   npm run seed
   ```
   *Seeds the database with all 5 collections, 7 handcrafted timepieces, and the demo client account (`client@nayab.pk` / `Nayab@2026`).*

5. **Start the Backend Server**:
   ```bash
   npm run dev
   ```
   *The API will start at `http://localhost:5000/api`.*

---

### Frontend Setup

1. **Navigate to the root directory**:
   ```bash
   cd ..
   npm install
   ```

2. **Start the Frontend Dev Server**:
   ```bash
   npm run dev
   ```
   *The application will be live at `http://localhost:3000`.*

---

### Demo Client Credentials

| Role | Email | Password | Pre-configured Data |
| :--- | :--- | :--- | :--- |
| **Registered Client** | `client@nayab.pk` | `Nayab@2026` | Registered collector since 2026 with default Karachi delivery address. |

---

## Running Automated Tests

The backend test suite verifies authentication, guest cart merging, product filtering, inventory allocation, and concurrency locks:

```bash
cd backend
npm test
```

### Test Suite Summary

```
✓ tests/auth.test.ts (12 tests)
✓ tests/products.test.ts (14 tests)
✓ tests/cart.test.ts (11 tests)
✓ tests/orders.test.ts (13 tests)

Test Files  4 passed (4)
     Tests  50 passed (50)
  Duration  1.42s
```

---

## Simulated Commerce Notice

> **Note on Payment Processing**:  
> **NAYAB** is an architectural luxury portfolio project. The acquisition flow creates a confirmed reservation in the atelier database (`AWAITING_CONFIRMATION`), allowing a private client advisor to handle bespoke settlement and armored transport. No live financial payments or credit cards are charged.

---

## License & Credits

- **Design & Architecture**: Crafted for the **NAYAB Fine Watchmaking** digital flagship.
- **Imagery**: Bespoke horological photography and atelier renders created exclusively for NAYAB.
- **License**: MIT License. See [LICENSE](LICENSE) for details.
