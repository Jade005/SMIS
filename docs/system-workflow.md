# System Workflow
## Slaughterhouse Meat Inventory and Sales Management System (SMIS)

---

## End-to-End Operational Flow

```mermaid
flowchart TD
    A([🟢 System Start]) --> B

    %% --- ADMIN SETUP ---
    subgraph ADMIN ["👤 Admin Operations"]
        B[Admin logs in] --> C[Add / Manage Suppliers]
        C --> D[Add / Manage Meat Products]
        D --> E[Add Inventory Batch\nweight · price · expiry · supplier]
        E --> F{Inventory Status?}
        F -- Available --> G[Stock Ready for Sale]
        F -- Low Stock --> H[⚠️ Low Stock Alert\nAdmin notified]
        F -- Expired --> I[❌ Expired Alert\nBatch flagged / removed]
        H --> E
    end

    %% --- CUSTOMER FLOW ---
    subgraph CUSTOMER ["🛒 Customer Operations"]
        G --> J[Customer logs in]
        J --> K[Browse Product Catalog]
        K --> L[Add items to Cart]
        L --> M[Place Order]
        M --> N{Order Status}
        N -- Confirmed --> O[Order Ready for Pickup / Fulfillment]
        N -- Cancelled --> P[Order Cancelled\nStock Released]
        O --> Q[Customer views Order History]
    end

    %% --- CASHIER / POS FLOW ---
    subgraph CASHIER ["🖥️ Cashier / POS Operations"]
        G --> R[Cashier logs in]
        R --> S[POS Screen: Search Products]
        S --> T[Add items to Cart\nenter weight per item]
        T --> U[Apply Discount if any]
        U --> V[Process Payment\ncash · GCash · card]
        V --> W[Generate Receipt]
    end

    %% --- POST-SALE ---
    W --> X[Inventory Auto-Deducted\navailable_stock_kg updated]
    O --> X
    X --> Y{Stock Below Threshold?}
    Y -- Yes --> H
    Y -- No --> Z[Sale Recorded in DB\nsales + sales_items]

    %% --- REPORTING ---
    subgraph REPORTS ["📊 Reporting & Analytics"]
        Z --> AA[Sales Reports Updated\ndaily · weekly · monthly]
        AA --> AB[Analytics Updated\nrevenue · best sellers · trends]
        AB --> AC[Admin views Dashboard\n& Report Screens]
    end

    AC --> AD([🔁 Cycle Continues])
```

---

## Role-Based Access Summary

```mermaid
graph LR
    Admin -->|full access| Dashboard
    Admin -->|full access| Products
    Admin -->|full access| Inventory
    Admin -->|full access| Suppliers
    Admin -->|full access| Users
    Admin -->|full access| Reports
    Admin -->|full access| Analytics
    Admin -->|view & update status| Orders

    Cashier -->|view| Dashboard
    Cashier -->|process| POS
    Cashier -->|view available| ProductAvailability
    Cashier -->|view & reprint| TransactionHistory

    Customer -->|view| Dashboard
    Customer -->|browse| ProductCatalog
    Customer -->|place & cancel| Orders
    Customer -->|view| OrderHistory
```

---

## Inventory State Machine

```mermaid
stateDiagram-v2
    [*] --> available : Batch added by Admin
    available --> low : available_stock_kg < threshold
    available --> expired : expiration_date < TODAY
    available --> depleted : available_stock_kg = 0
    low --> available : Admin restocks batch
    low --> expired : expiration_date < TODAY
    low --> depleted : available_stock_kg = 0
    expired --> [*] : Admin removes batch
    depleted --> [*] : Batch archived
```

---

## Order Lifecycle

```mermaid
stateDiagram-v2
    [*] --> pending : Customer places order
    pending --> confirmed : Admin confirms order
    pending --> cancelled : Customer cancels / Admin rejects
    confirmed --> ready : Admin marks ready for pickup
    ready --> completed : Order fulfilled
    confirmed --> cancelled : Admin cancels confirmed order
    cancelled --> [*]
    completed --> [*]
```
