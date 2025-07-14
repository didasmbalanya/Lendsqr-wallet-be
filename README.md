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

```
src/
├── controllers/      # Request handlers
├── models/           # DB model definitions
├── routes/           # API route definitions
├── services/         # Business logic
├── utils/            # Helpers and utilities
├── interfaces/       # Type definitions
├── middleware/       # Auth and request processing
└── index.ts          # Entry point
migrations/           # Knex migration files
seed/                 # Seed data scripts
tests/                # Unit and integration tests
.env.example          # Environment variables example
README.md             # This file
```

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

## 🧪 Testing the API Locally

### 1. **Start the Server**
Make sure you've installed dependencies:

```bash
npm install
```
Set up your env variables following the env.example file
Start your MYSQL db

Start the development server:

```bash
npm run dev
```

This will start the server on `http://localhost:3000`

---

### 2. **Test Endpoints Using Postman or curl**

#### 🔹 Register a User
```http
POST /api/users
Host: localhost:3000
Content-Type: application/json

{
  "email": "user1@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+2348012345678"
}
```

> ✅ A wallet will be auto-created for the user

---

#### 🔹 Fund Wallet
```http
POST /api/wallets/fund/1
Host: localhost:3000
Content-Type: application/json
Authorization: Bearer 1 (Currently logged in user's ID)

{
  "amount": 500,
  "description": "Initial deposit"
}
```

> Replace `1` with the actual user ID from the previous step

---

#### 🔹 Transfer Funds
```http
POST /api/wallets/transfer/1
Host: localhost:3000
Content-Type: application/json
Authorization: Bearer 1

{
  "amount": 200,
  "description": "Send to user 2",
  "to_user_id": 2
}
```

> Make sure user 2 exists and has a wallet

---

#### 🔹 Withdraw Funds
```http
POST /api/wallets/withdraw/1
Host: localhost:3000
Content-Type: application/json
Authorization: Bearer 1

{
  "amount": 100,
  "description": "Cash withdrawal"
}
```

---

## 🧪 Running Unit Tests

This project includes unit tests for core services and controllers.

### 1. **Install Jest and Dependencies**

If you haven't already:

```bash
npm install --save-dev jest ts-jest @types/jest supertest
```

### 2. **Run All Tests**

```bash
npm run test
```

Or with watch mode for live changes:

```bash
npm run test -- --watch
```

### 3. **Run Specific Test Files**

To test a specific file, e.g. `user.service.test.ts`:

```bash
npm run test src/tests/unit/services/user.service.test.ts
```

Or for `wallet.controller.test.ts`:

```bash
npm run test src/tests/unit/controllers/wallet.controller.test.ts
```
---

## ✅ Summary

| Task | Command |
|------|---------|
| Start server | `npm run dev` |
| Register user | `POST /api/users` |
| Fund wallet | `POST /api/wallets/fund/:userId` |
| Transfer funds | `POST /api/wallets/transfer/:userId` |
| Withdraw funds | `POST /api/wallets/withdraw/:userId` |
| Run all tests | `npm run test` |
| Run specific test | `npm run test src/tests/unit/services/user.service.test.ts` |

---

## 📌 Assumptions

- A faux token-based auth system that uses a user ID is used instead of full OAuth.
- No KYC verification is required for this MVP.
- Only one wallet per user.
- Transaction rollbacks are handled via Knex transactions.
