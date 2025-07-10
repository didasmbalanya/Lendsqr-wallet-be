# Lendsqr Wallet Service – Backend Assessment

This is my submission for the Lendsqr Backend Engineer Assessment. The task was to build a minimal wallet service that allows users to create accounts, fund their wallets, transfer funds, and withdraw money — all while ensuring blacklisted users from the Lendsqr Adjutor Karma list are not onboarded.

---

## 🛠️ Tech Stack

- **Language**: TypeScript
- **Framework**: Node.js (Express)
- **Database**: MySQL
- **ORM**: Knex.js
- **Authentication**: Faux token-based authentication
- **Testing**: Jest
- **Deployment**: Heroku

---

## 🗂️ Folder Structure

src/
├── controllers/ # Request handlers
├── models/ # DB model definitions
├── routes/ # API route definitions
├── services/ # Business logic
├── utils/ # Helpers and utilities
├── interfaces/ # Type definitions
├── middleware/ # Auth and request processing
└── index.ts # Entry point
migrations/ # Knex migration files
seed/ # Seed data scripts
tests/ # Unit and integration tests
.env.example # Environment variables example
README.md # This file

---

## 🧱 Database Schema (ER Diagram)

Below is the E-R Diagram showing the structure of the database:

[ER Diagram](https://dbdesigner.page.link/cvENLcZTHiFt2zez9)

---

## 📚 Entities Overview

### Users
Stores user information during registration.

| Field       | Type         | Description              |
|-------------|--------------|--------------------------|
| id          | INT          | Primary Key              |
| email       | VARCHAR      | Unique email             |
| first_name  | VARCHAR      | User’s first name        |
| last_name   | VARCHAR      | User’s last name         |
| phone       | VARCHAR      | Phone number             |
| created_at  | DATETIME     | Timestamp                |
| updated_at  | DATETIME     | Timestamp                |

### Wallets
Each user has one wallet.

| Field      | Type          | Description              |
|------------|---------------|--------------------------|
| id         | INT           | Primary Key              |
| user_id    | INT           | Foreign Key to Users     |
| balance    | DECIMAL(10,2) | Current wallet balance   |
| created_at | DATETIME      | Timestamp                |
| updated_at | DATETIME      | Timestamp                |

### Transactions
Tracks all fund movements.

| Field           | Type           | Description                |
|-----------------|----------------|----------------------------|
| id              | INT            | Primary Key                |
| type            | ENUM           | 'debit' or 'credit'        |
| amount          | DECIMAL(10,2)  | Transaction amount         |
| description     | TEXT           | Brief transaction reason   |
| reference       | VARCHAR        | Optional transaction ID    |
| from_wallet_id  | INT (nullable) | Sender wallet              |
| to_wallet_id    | INT (nullable) | Receiver wallet            |
| created_at      | DATETIME       | Timestamp                  |

---

## 🔁 High-Level Flow

### Register User
1. Validate input
2. Check if user is blacklisted via Adjutor API
3. Create user and associated wallet

### Fund Wallet
1. Find user’s wallet
2. Increase balance
3. Record transaction

### Transfer Funds
1. Begin transaction block
2. Deduct from sender wallet
3. Credit receiver wallet
4. Record both sides of transaction
5. Commit transaction

### Withdraw Funds
1. Ensure sufficient balance
2. Decrease wallet balance
3. Record transaction

---

## 🧪 Unit Testing Strategy

We’ll write unit and integration tests for:
- User creation (positive/negative)
- Wallet funding
- Transfers (success/failure)
- Withdrawals
- Blacklist check

---

## 📌 Assumptions

- A faux token-based auth system is used instead of full OAuth.
- No KYC verification is required for this MVP.
- Only one wallet per user.
- Transaction rollbacks are handled via Knex transactions.
