# Spendwise Database & Module Diagram

## 1️⃣ Entities & Relations

```mermaid
erDiagram
    USERS {
        String id PK
        String email
        String password
        String name
        DateTime created_at
        DateTime updated_at
    }
    WALLETS {
        String id PK
        String name
        Float balance
        String currency
        String user_id FK
        DateTime created_at
    }
    CATEGORIES {
        String id PK
        String name
        String icon
        TransactionType type
        Boolean is_default
        DateTime created_at
    }
    TRANSACTIONS {
        String id PK
        Float amount
        TransactionType type
        String note
        DateTime date
        String user_id FK
        String wallet_id FK
        String category_id FK
        DateTime created_at
    }
    BUDGETS {
        String id PK
        Float amount
        Int month
        Int year
        String user_id FK
        String category_id FK
        DateTime created_at
    }

    %% Relations
    USERS ||--o{ WALLETS : "owns"
    USERS ||--o{ TRANSACTIONS : "performs"
    USERS ||--o{ BUDGETS : "plans"
    WALLETS ||--o{ TRANSACTIONS : "holds"
    CATEGORIES ||--o{ TRANSACTIONS : "categorizes"
    CATEGORIES ||--o{ BUDGETS : "assigned to"