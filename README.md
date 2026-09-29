# Smart E-Commerce & Multi-Vendor Order Management Platform (Smart Store)

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-4.1.1-brightgreen.svg" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Java-17-orange.svg" alt="Java 17" />
  <img src="https://img.shields.io/badge/React-18-blue.svg" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-8.2-purple.svg" alt="Vite" />
  <img src="https://img.shields.io/badge/MySQL-8.4%20(Aiven%20Cloud)-blue.svg" alt="MySQL" />
  <img src="https://img.shields.io/badge/NGINX-Reverse%20Proxy-009639.svg" alt="NGINX" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

An enterprise-grade, high-performance **Multi-Vendor E-Commerce & Order Management Platform** modeled after international and regional industry benchmarks (**Amazon, Shopee, Lazada, Tiki**). The system delivers a seamless end-to-end operational flow connecting **Customers**, **Sellers**, and the **Platform Administration (Admin Command Center)** with pure database-driven persistence on Cloud MySQL, microsecond Spring Boot caching, and an NGINX reverse proxy.

---

## 📑 Table of Contents
- [1. System Architecture](#1-system-architecture)
- [2. Core E-Commerce Business Workflows](#2-core-e-commerce-business-workflows)
- [3. Technology Stack](#3-technology-stack)
- [4. Project Directory Structure](#4-project-directory-structure)
- [5. Getting Started & Installation](#5-getting-started--installation)
- [6. Demo Accounts](#6-demo-accounts)
- [7. Key API Endpoints](#7-key-api-endpoints)

---

## 1. System Architecture

```
                            [ Client Browser ]
                                    │
                                    ▼ (Port 80)
                             ┌─────────────┐
                             │ NGINX Proxy │
                             └──────┬──────┘
                   ┌────────────────┴────────────────┐
                   ▼                                 ▼
      [ Static Assets / SPA ]               [ Upstream REST APIs ]
         frontend/dist                         http://127.0.0.1:8080
         (React 18 + Vite)                     (Spring Boot 4 / Java 17)
                                                     │
                                            ┌────────┴────────┐
                                            ▼                 ▼
                                    [ Spring Cache ]   [ Hibernate JPA ]
                                      (In-Memory)             │
                                                              ▼
                                                     [ Aiven Cloud MySQL ]
                                                      (28+ Relational Tables)
```

---

## 2. Core E-Commerce Business Workflows

### 🌟 1. Dispute / Return & Refund Arbitration (Split-View Center)
- **Customer Portal**: Customers can file dispute requests on completed orders with specific grievance reasons and photo evidence.
- **Admin Command Center**: Features a dedicated **Split-View Dispute Arbitration Center** displaying buyer evidence side-by-side with seller verification logs.
- **Arbitration Decisions**:
  - `REFUND`: Cancels the order, marks payment as `FAILED`, **automatically restocks items back to inventory**, and evicts cache via `@CacheEvict(value = {"products", "loyalty"}, allEntries = true)`.
  - `RELEASE`: Rejects the claim, marks the order as `COMPLETED`, and releases escrow funds to the seller.
- Fully audited with activity logs persisted in the `system_logs` table.

### 🚚 2. Logistics Synchronization & Automated Escrow Settlement
- Real-time carrier tracking integration (e.g., Viettel Post, GHN).
- Package delivery lifecycle: `PENDING` ➔ `PREPARING` ➔ `SHIPPING` ➔ `DELIVERED`.
- **Auto-Settlement Engine**: Once all sub-orders of a master order reach `DELIVERED`:
  - The parent order automatically advances to `Order.status = COMPLETED`.
  - Deducts the **8.5% platform take-rate fee** and creates payout records (`netPayout`) for each vendor in the `settlements` table.

### ⚡ 3. Automated Bank Transfer Verification (SePay VietQR Webhook)
- Fully automated bank transfer reconciliation via SePay VietQR webhook (`POST /api/payments/sepay-webhook`).
- Intelligent regex matching supporting both formatted codes (`ORD-10008`) and raw database IDs.
- Transitions `Payment = SUCCESS`, `Order = PAID`, advances vendor orders to `PREPARING` for packaging, and provisions tracking numbers immediately.

### 🎟️ 4. Voucher Single-Use Enforcement per Account
- Tracks voucher consumption history via the `order_vouchers` mapping entity.
- Enforces `existsByVoucherIdAndCustomerUserId` during order checkout. If a customer attempts to reuse a single-use coupon, the request is immediately rejected to prevent promotion abuse.

### ⭐ 5. Dynamic Reviews & Star Distribution
- Verified buyers can submit 1–5 star ratings with detailed reviews on completed orders.
- Computes real-time dynamic ratings from the database ($Avg = \frac{\sum rating}{count}$), updates `products.rating` & `products.reviews`, and evicts stale cache.
- The Product Detail view dynamically renders the rating breakdown across all stars (5★, 4★, 3★, 2★, 1★).

### 🚫 6. Real-Time Order Cancellation & Inventory Restock
- Customers can cancel pending orders before dispatch.
- Automatically restores product inventory in real-time.
- Safeguard: Prevents cancellation once a package is marked as `SHIPPING` or `DELIVERED`.

### 🚀 7. Database Performance & N+1 Query Elimination
- Completely eliminated the N+1 query problem by replacing 80+ isolated queries with **4 optimized Batch Queries**.
- Configured all relational associations to `FetchType.LAZY`.
- Integrated Spring Cache abstraction, reducing API latency from **~2.2s** down to **< 10ms** (>220x performance improvement).

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18 + Vite (SPA)
- **Styling**: Vanilla CSS Design System (Dark Cyberpunk / Glassmorphism, tailored HSL color tokens)
- **Icons**: Lucide React
- **HTTP Client**: Axios (configured with token management and response interceptors)

### Backend
- **Framework**: Spring Boot 4.1.1 / Java 17
- **Security**: Spring Security 7, JWT (Stateless authentication)
- **Persistence**: Spring Data JPA / Hibernate 7, HikariCP connection pool
- **Caching**: Spring Cache Abstraction
- **Build Tool**: Apache Maven

### Infrastructure & Database
- **Database**: Cloud MySQL 8.4 hosted on Aiven Cloud
- **Web Server & Reverse Proxy**: NGINX for Windows (Port 80)
- **Gzip Compression**: Compresses HTML, CSS, JS, and JSON payloads for optimal bandwidth savings

---

## 4. Project Directory Structure

```
Smart E-Commerce & Order Management Platform/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/smartecommerce/backend/
│       ├── config/              # Cache, JPA, and Application configurations
│       ├── controllers/         # REST API endpoints (Order, Admin, Payment, Delivery, Review, etc.)
│       ├── dto/                 # Data Transfer Objects (DisputeDto, ReviewDto, OrderDto...)
│       ├── entities/            # JPA Entities (Order, Product, Store, Review, Settlement...)
│       ├── repositories/        # Optimized JPA Repositories (Native & JPQL queries)
│       ├── security/            # JWT Filter, SecurityConfig, UserDetailsService
│       └── services/            # Core business logic implementations
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── dist/                    # Compiled production build
│   └── src/
│       ├── components/          # Reusable UI components (Navbar, CartDrawer, ProductDetailDrawer...)
│       ├── pages/               # Views (Home, CustomerPortal, AdminCommandCenter, Login...)
│       └── services/            # Axios API service integrations
├── nginx/
│   ├── conf/nginx.conf          # NGINX reverse proxy configuration (Port 80 & Gzip)
│   └── nginx.exe
├── smart_store_database.sql     # Database structure & initial seed data dump
├── start-nginx.bat              # Script to start NGINX
└── stop-nginx.bat               # Script to stop NGINX
```

---

## 5. Getting Started & Installation

### Prerequisites
- **Java**: JDK 17 or higher
- **Node.js**: v18.x or higher & npm
- **Maven**: 3.8+ (or Maven wrapper)
- Operating System: Windows, Linux, or macOS

### Step 1: Run Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
> The backend connects to Aiven Cloud MySQL and starts listening on `http://localhost:8080`.

### Step 2: Build & Start Frontend
For local development:
```bash
cd frontend
npm install
npm run dev
```
For production build served by NGINX:
```bash
cd frontend
npm run build
```

### Step 3: Start NGINX Reverse Proxy
Double-click `start-nginx.bat` in the root folder, or execute:
```powershell
cd nginx
.\nginx.exe
```
Access the application directly in your browser at: **`http://localhost`** (Standard HTTP Port 80).

---

## 6. Demo Accounts

The database comes pre-seeded with test accounts for all platform roles:

| Role | Username | Password | Access & Permissions |
|---|---|---|---|
| **Admin** | `admin` | `password` | Accesses the **Admin Command Center**, arbitrates disputes, approves vendors, monitors logistics and settlements. |
| **Seller** | `seller_apple` | `password` | Manages the **Apple Flagship Store**, views store orders, and updates packaging status. |
| **Customer** | `customer` | `password` | Places orders, manages orders in **Customer Portal**, submits product reviews, files disputes. |

---

## 7. Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticates user and returns JWT token |
| `GET` | `/api/products` | Retrieves all catalog products (Spring Cache enabled) |
| `POST` | `/api/orders` | Places a new order (applies voucher, restocks/deducts inventory) |
| `GET` | `/api/orders` | Retrieves order history for current customer (Batch Query) |
| `PUT` | `/api/orders/{id}/cancel` | Cancels an order and automatically restocks items |
| `POST` | `/api/orders/{id}/dispute` | Submits a customer return/refund dispute claim |
| `GET` | `/api/admin/disputes` | Retrieves pending dispute cases for arbitration |
| `POST` | `/api/admin/disputes/{id}/arbitrate` | Arbitrates a dispute (`REFUND` or `RELEASE`) |
| `PUT` | `/api/deliveries/{id}/status` | Updates delivery status & triggers auto-settlement |
| `POST` | `/api/payments/sepay-webhook` | Processes incoming VietQR SePay payment webhooks |
| `GET` | `/api/reviews/product/{id}` | Retrieves average rating, star breakdown, and reviews |
| `POST` | `/api/reviews` | Submits a new review and recalculates ratings dynamically |

---

<p align="center">
  <b>Smart Store Platform © 2026</b> — <i>Built with dedication to clean architecture, high performance & modern e-commerce standards.</i>
</p>
