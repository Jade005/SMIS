-- =============================================================================
-- SMIS — Slaughterhouse Meat Inventory and Sales Management System
-- Database Schema
-- Database : smis
-- Engine   : MySQL 8.x
-- Encoding : utf8mb4
-- =============================================================================

CREATE DATABASE IF NOT EXISTS smis
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smis;

-- -----------------------------------------------------------------------------
-- 1. CATEGORIES
--    Meat product categories (e.g., Beef, Pork, Chicken, Goat)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id          INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100)      NOT NULL,
  description TEXT,
  created_at  TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- 2. USERS
--    Unified accounts for Admin, Cashier, and Customer roles.
--    Customers also have a dedicated `customers` profile table.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id               INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  first_name       VARCHAR(100)      NOT NULL,
  last_name        VARCHAR(100)      NOT NULL,
  username         VARCHAR(100)      NULL,
  email            VARCHAR(255)      NOT NULL,
  password_hash    VARCHAR(255)      NOT NULL,
  role             ENUM('admin','cashier','customer') NOT NULL DEFAULT 'customer',
  is_active        TINYINT(1)        NOT NULL DEFAULT 1,
  is_temp_password TINYINT(1)        NOT NULL DEFAULT 0,
  created_at       TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_username (username),
  KEY idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- 3. SUPPLIERS
--    Meat supplier directory. Linked to inventory batches.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name            VARCHAR(255)  NOT NULL,
  contact_person  VARCHAR(255),
  phone           VARCHAR(30),
  email           VARCHAR(255),
  address         TEXT,
  is_active       TINYINT(1)    NOT NULL DEFAULT 1,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_suppliers_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- 4. PRODUCTS
--    Master product catalog: meat products with type, cut, base price.
--    Actual stock is tracked in the `inventory` table (per-batch).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id            INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  category_id   INT UNSIGNED      NOT NULL,
  name          VARCHAR(255)      NOT NULL,
  meat_type     VARCHAR(100)      NOT NULL   COMMENT 'e.g., Beef, Pork, Chicken',
  meat_cut      VARCHAR(100)      NOT NULL   COMMENT 'e.g., Liempo, Kasim, Buto, Pigue',
  price_per_kg  DECIMAL(10,2)     NOT NULL   COMMENT 'Base retail price per kilogram',
  description   TEXT,
  image_url     VARCHAR(500),
  is_active     TINYINT(1)        NOT NULL DEFAULT 1,
  created_at    TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_products_category  (category_id),
  KEY idx_products_meat_type (meat_type),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id)
    REFERENCES categories (id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- 5. INVENTORY
--    Per-batch stock records. Each row = one supplier delivery batch.
--    Tracks weight delivered, weight remaining, expiry, and status.
--    Status auto-flags to 'low' or 'expired' via application logic / triggers.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory (
  id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  product_id          INT UNSIGNED    NOT NULL,
  supplier_id         INT UNSIGNED    NOT NULL,
  batch_no            VARCHAR(50)     NOT NULL   COMMENT 'Auto-generated batch identifier',
  weight_kg           DECIMAL(10,3)   NOT NULL   COMMENT 'Total weight delivered (kg)',
  available_stock_kg  DECIMAL(10,3)   NOT NULL   COMMENT 'Remaining weight available for sale (kg)',
  price_per_kg        DECIMAL(10,2)   NOT NULL   COMMENT 'Price for this batch (may differ from product base price)',
  date_processed      DATE            NOT NULL   COMMENT 'Date batch was received / processed',
  expiration_date     DATE            NOT NULL   COMMENT 'Expiry date of this batch',
  status              ENUM('available','low','expired','depleted')
                                      NOT NULL DEFAULT 'available',
  notes               TEXT,
  created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_inventory_batch (batch_no),
  KEY idx_inventory_product    (product_id),
  KEY idx_inventory_supplier   (supplier_id),
  KEY idx_inventory_status     (status),
  KEY idx_inventory_expiry     (expiration_date),

  CONSTRAINT fk_inventory_product  FOREIGN KEY (product_id)
    REFERENCES products  (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_inventory_supplier FOREIGN KEY (supplier_id)
    REFERENCES suppliers (id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- 6. CUSTOMERS
--    Extended profile for users with role = 'customer'.
--    One-to-one with the users table.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED  NOT NULL,
  phone       VARCHAR(30),
  address     TEXT,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_customers_user (user_id),
  CONSTRAINT fk_customers_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- 7. SALES
--    Sales transaction headers. Each row = one POS transaction.
--    Processed by a Cashier. May optionally be linked to a Customer.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  cashier_id      INT UNSIGNED    NOT NULL   COMMENT 'FK to users (role=cashier)',
  customer_id     INT UNSIGNED               COMMENT 'FK to customers — NULL for walk-in',
  receipt_no      VARCHAR(50)     NOT NULL,
  subtotal        DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  discount        DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  total_amount    DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  payment_method  ENUM('cash','gcash','card','other') NOT NULL DEFAULT 'cash',
  amount_tendered DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  change_amount   DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  notes           TEXT,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_sales_receipt (receipt_no),
  KEY idx_sales_cashier    (cashier_id),
  KEY idx_sales_customer   (customer_id),
  KEY idx_sales_created_at (created_at),

  CONSTRAINT fk_sales_cashier  FOREIGN KEY (cashier_id)
    REFERENCES users      (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_sales_customer FOREIGN KEY (customer_id)
    REFERENCES customers  (id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- 8. SALES_ITEMS
--    Line items for each sale. Each row = one inventory batch sold.
--    Records product snapshot data (name, cut, price) for receipt integrity.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_items (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  sale_id       INT UNSIGNED    NOT NULL,
  inventory_id  INT UNSIGNED    NOT NULL   COMMENT 'Which batch was deducted',
  product_id    INT UNSIGNED    NOT NULL,
  product_name  VARCHAR(255)    NOT NULL   COMMENT 'Snapshot at time of sale',
  meat_cut      VARCHAR(100)    NOT NULL   COMMENT 'Snapshot at time of sale',
  weight_kg     DECIMAL(10,3)   NOT NULL,
  price_per_kg  DECIMAL(10,2)   NOT NULL,
  subtotal      DECIMAL(10,2)   NOT NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_sales_items_sale      (sale_id),
  KEY idx_sales_items_inventory (inventory_id),
  KEY idx_sales_items_product   (product_id),

  CONSTRAINT fk_sales_items_sale      FOREIGN KEY (sale_id)
    REFERENCES sales     (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_sales_items_inventory FOREIGN KEY (inventory_id)
    REFERENCES inventory (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_sales_items_product   FOREIGN KEY (product_id)
    REFERENCES products  (id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- 9. ORDERS
--    Customer-initiated orders (pre-orders / online orders).
--    Separate from POS sales. Fulfilled by Admin/Cashier.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  customer_id   INT UNSIGNED    NOT NULL,
  order_no      VARCHAR(50)     NOT NULL,
  status        ENUM('pending','confirmed','ready','cancelled','completed')
                                NOT NULL DEFAULT 'pending',
  subtotal      DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  total_amount  DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  notes         TEXT,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_order_no   (order_no),
  KEY idx_orders_customer  (customer_id),
  KEY idx_orders_status    (status),
  KEY idx_orders_created_at (created_at),

  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id)
    REFERENCES customers (id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------------------
-- 10. ORDER_ITEMS
--     Line items for each customer order.
--     Records product snapshot data for order integrity.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  order_id      INT UNSIGNED    NOT NULL,
  product_id    INT UNSIGNED    NOT NULL,
  product_name  VARCHAR(255)    NOT NULL   COMMENT 'Snapshot at time of order',
  meat_cut      VARCHAR(100)    NOT NULL   COMMENT 'Snapshot at time of order',
  weight_kg     DECIMAL(10,3)   NOT NULL,
  price_per_kg  DECIMAL(10,2)   NOT NULL,
  subtotal      DECIMAL(10,2)   NOT NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_order_items_order   (order_id),
  KEY idx_order_items_product (product_id),

  CONSTRAINT fk_order_items_order   FOREIGN KEY (order_id)
    REFERENCES orders   (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id)
    REFERENCES products (id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- SEED DATA — Initial categories and default admin account
-- Password: 'admin123' (bcrypt — replace hash before production)
-- =============================================================================

INSERT INTO categories (name, description) VALUES
  ('Beef',    'Cattle-sourced meat products'),
  ('Pork',    'Swine-sourced meat products'),
  ('Chicken', 'Poultry-sourced meat products'),
  ('Goat',    'Goat-sourced meat products'),
  ('Others',  'Other meat types');

INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES
  ('Admin', 'SMIS', 'admin@smis.local',
   '$2b$12$placeholder_replace_with_real_bcrypt_hash', 'admin');
