# System Architecture
## Slaughterhouse Meat Inventory and Sales Management System (SMIS)

---

## 1. Overview

SMIS follows a **3-Tier Architecture**:

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT TIER                         │
│         React.js SPA (Admin / Cashier / Customer)    │
└─────────────────────┬───────────────────────────────┘
                      │ HTTPS / REST (JSON)
┌─────────────────────▼───────────────────────────────┐
│                 APPLICATION TIER                     │
│          Node.js + Express.js REST API               │
│          JWT Authentication Middleware               │
│          Role-Based Access Control (RBAC)            │
└─────────────────────┬───────────────────────────────┘
                      │ MySQL2 / Connection Pool
┌─────────────────────▼───────────────────────────────┐
│                   DATA TIER                          │
│          MySQL 8.x  (Database: smis)                 │
│          Host: localhost  |  Port: 3306              │
└─────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React.js | SPA for Admin, Cashier, Customer portals |
| Routing | React Router v6 | Client-side role-based routing |
| State Management | React Context + useReducer | Cart, session, role state |
| HTTP Client | Axios | API communication |
| Backend | Node.js + Express.js | REST API server |
| Authentication | JWT (jsonwebtoken) | Stateless token auth |
| ORM / Query | mysql2 | MySQL driver with prepared statements |
| Database | MySQL 8.x | Relational data store |
| DB Management | SQLyog Ultimate v9.62 | Schema design & admin |
| Version Control | Git & GitHub | Source control |
| Environment | dotenv | Secrets & config management |

---

## 3. Authentication & Authorization

- **Login** returns a signed JWT containing `{ userId, role }`.
- JWT is stored in `localStorage` on the client.
- Every protected API request includes `Authorization: Bearer <token>`.
- The backend middleware verifies the token and attaches `req.user`.
- **RBAC** guards are applied at the route level:

| Role | Accessible Modules |
|---|---|
| `admin` | All modules |
| `cashier` | Dashboard, POS, Product Availability, Transaction History |
| `customer` | Dashboard, Product Catalog, Orders, Order History |

---

## 4. REST API Endpoints

Base URL: `http://localhost:5000/api`

---

### 4.1 Authentication — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Login — returns JWT token |
| POST | `/auth/logout` | Auth | Logout (client-side token removal) |
| GET  | `/auth/me` | Auth | Get current authenticated user profile |
| POST | `/auth/refresh` | Auth | Refresh JWT token |

---

### 4.2 Users — `/api/users`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/users` | Admin | List all users (with filters: role, is_active) |
| POST | `/users` | Admin | Create a new user (any role) |
| GET | `/users/:id` | Admin | Get user by ID |
| PUT | `/users/:id` | Admin | Update user details |
| PATCH | `/users/:id/status` | Admin | Activate / deactivate user |
| PATCH | `/users/:id/password` | Admin | Reset user password |
| DELETE | `/users/:id` | Admin | Soft-delete user |

---

### 4.3 Categories — `/api/categories`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/categories` | Auth | List all active categories |
| POST | `/categories` | Admin | Create category |
| PUT | `/categories/:id` | Admin | Update category |
| DELETE | `/categories/:id` | Admin | Delete category |

---

### 4.4 Products — `/api/products`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/products` | Auth | List products (filters: category, meat_type, is_active) |
| POST | `/products` | Admin | Create product |
| GET | `/products/:id` | Auth | Get product details |
| PUT | `/products/:id` | Admin | Update product |
| PATCH | `/products/:id/status` | Admin | Activate / deactivate product |
| DELETE | `/products/:id` | Admin | Delete product |

---

### 4.5 Suppliers — `/api/suppliers`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/suppliers` | Admin | List all suppliers (filter: is_active) |
| POST | `/suppliers` | Admin | Add new supplier |
| GET | `/suppliers/:id` | Admin | Get supplier details |
| PUT | `/suppliers/:id` | Admin | Update supplier |
| PATCH | `/suppliers/:id/status` | Admin | Activate / deactivate supplier |
| DELETE | `/suppliers/:id` | Admin | Delete supplier |

---

### 4.6 Inventory — `/api/inventory`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/inventory` | Admin, Cashier | List all inventory batches (filters: status, product_id, supplier_id) |
| POST | `/inventory` | Admin | Add new inventory batch |
| GET | `/inventory/:id` | Admin, Cashier | Get batch details |
| PUT | `/inventory/:id` | Admin | Update batch details |
| PATCH | `/inventory/:id/status` | Admin | Manually update batch status |
| GET | `/inventory/alerts/low-stock` | Admin, Cashier | List low-stock batches |
| GET | `/inventory/alerts/expiring` | Admin, Cashier | List batches expiring within N days |
| GET | `/inventory/alerts/expired` | Admin | List expired batches |

---

### 4.7 Sales / POS — `/api/sales`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/sales` | Admin, Cashier | List all sales transactions (filters: date, cashier_id) |
| POST | `/sales` | Cashier | Process a new POS sale — deducts from inventory |
| GET | `/sales/:id` | Admin, Cashier | Get sale details with line items |
| GET | `/sales/:id/receipt` | Admin, Cashier | Generate printable receipt data |

---

### 4.8 Orders — `/api/orders`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/orders` | Admin | List all orders (filters: status, customer_id, date) |
| POST | `/orders` | Customer | Place a new order |
| GET | `/orders/:id` | Admin, Customer (own) | Get order details |
| PATCH | `/orders/:id/status` | Admin | Update order status |
| DELETE | `/orders/:id` | Customer (own, pending only) | Cancel own order |
| GET | `/orders/my` | Customer | Get own order history |

---

### 4.9 Reports — `/api/reports`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/reports/sales` | Admin | Sales report (params: range=daily/weekly/monthly, date) |
| GET | `/reports/inventory` | Admin | Inventory status report |
| GET | `/reports/expiry` | Admin | Expired / expiring product report |
| GET | `/reports/suppliers` | Admin | Supplier activity report |
| GET | `/reports/transactions` | Admin | Full transaction log |

---

### 4.10 Analytics — `/api/analytics`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/analytics/revenue` | Admin | Revenue by day/week/month |
| GET | `/analytics/best-sellers` | Admin | Top-selling products/cuts |
| GET | `/analytics/sales-by-category` | Admin | Sales volume by category |
| GET | `/analytics/stock-movement` | Admin | Stock in vs. stock out over time |

---

## 5. Folder Structure (Planned)

```
SMIS/
├── frontend/                  # React.js SPA
│   ├── public/
│   └── src/
│       ├── api/               # Axios API service modules
│       ├── components/        # Reusable UI components
│       ├── context/           # Auth, Cart context providers
│       ├── pages/
│       │   ├── admin/         # Admin portal pages
│       │   ├── cashier/       # Cashier portal pages
│       │   └── customer/      # Customer portal pages
│       ├── routes/            # Role-based route guards
│       └── utils/             # Helpers, formatters
├── backend/                   # Node.js + Express REST API
│   ├── config/                # DB connection, JWT config
│   ├── controllers/           # Route handler logic
│   ├── middleware/            # Auth, RBAC, error handling
│   ├── models/                # DB query functions
│   ├── routes/                # Express route definitions
│   └── utils/                 # Receipt generator, validators
├── database/
│   └── smis_schema.sql        # MySQL schema
└── docs/
    ├── system-architecture.md
    ├── system-workflow.md
    └── wireframes/
```

---

## 6. Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Auth strategy | JWT (stateless) | No server-side session storage needed |
| Password hashing | bcrypt (12 rounds) | Industry standard, resistant to brute-force |
| Inventory model | Per-batch | Tracks expiry and source per delivery |
| Monetary storage | DECIMAL(10,2) | Avoids floating-point rounding errors |
| Snapshot fields | Stored in sales_items / order_items | Receipt integrity even if product data changes |
| Soft deletes | `is_active` / status flags | Preserves historical data integrity |
