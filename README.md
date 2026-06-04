# 🎯 Habit Tracker API

Personal Habit Tracking & Streak Management REST API — A backend service built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Schema Design](#-schema-design)
- [Getting Started](#-getting-started)
- [Authentication](#-authentication-jwt)
- [API Routes](#-api-routes)
- [Example Requests & Responses](#-example-requests--responses)
- [Error Responses](#-error-responses)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [Design Decisions](#-design-decisions)

---

## ✨ Features

### Core Features

- ✅ **User Authentication** — Register & Login with JWT tokens
- ✅ **Habit CRUD** — Create, Read, Update, Delete habits
- ✅ **Daily Tracking** — Mark habits as completed (one entry per day)
- ✅ **7-Day History** — View completion status for the last 7 days
- ✅ **Password Security** — bcrypt hashing with salt rounds
- ✅ **Route Protection** — JWT middleware on all habit routes
- ✅ **Input Validation** — Joi schema validation on all routes

### Bonus Features

- 🔥 **Streak Calculation** — Consecutive days completed
- 🏷️ **Tags & Filtering** — Filter habits by tag (`GET /habits?tag=health`)
- ⏰ **Reminder Time** — Store reminder time per habit
- 📄 **Pagination** — Paginate habits list with `page` and `limit` params
- 🛡️ **Rate Limiting** — 100 requests/hour per IP
- 🧪 **Automated Tests** — Jest + Supertest + MongoMemoryServer 

---

## 🛠️ Tech Stack

| Area             | Technology                          |
|------------------|-------------------------------------|
| Language         | TypeScript (Node.js)                |
| Framework        | Express.js                          |
| Database         | MongoDB (Mongoose ODM)              |
| Authentication   | JWT (jsonwebtoken) + bcryptjs       |
| Date Handling    | Day.js                              |
| Testing          | Jest + Supertest + MongoMemoryServer|
| Validation       | Joi                                 |
| Security         | express-rate-limit                  |

---

## 📊 Schema Design

### User Collection

```
┌──────────────────────────────────────┐
│ User                                 │
├──────────────────────────────────────┤
│ _id:        ObjectId (PK)            │
│ name:       String (required)        │
│ email:      String (unique, indexed) │
│ password:   String (hashed)          │
│ createdAt:  Date                     │
│ updatedAt:  Date                     │
└──────────────────────────────────────┘
```

- Email must be unique
- Passwords are hashed with bcryptjs before storage — never stored in plain text

---

### Habit Collection

```
┌──────────────────────────────────────┐
│ Habit                                │
├──────────────────────────────────────┤
│ _id:          ObjectId (PK)          │
│ userId:       ObjectId (FK → User)   │
│ title:        String (required)      │
│ description:  String                 │
│ frequency:    "daily" | "weekly"     │
│ tags:         [String]               │
│ reminderTime: String (HH:MM AM/PM)   │
│ createdAt:    Date                   │
│ updatedAt:    Date                   │
└──────────────────────────────────────┘
```

- Each habit belongs to a user via `userId`
- Tags support filtering via query param
- Reminder time is stored but notifications are not implemented

---

### TrackingLog Collection

```
┌──────────────────────────────────────┐
│ TrackingLog                          │
├──────────────────────────────────────┤
│ _id:       ObjectId (PK)             │
│ habitId:   ObjectId (FK → Habit)     │
│ userId:    ObjectId (FK → User)      │
│ date:      String (YYYY-MM-DD)       │
│ completed: Boolean                   │
│ createdAt: Date                      │
│ updatedAt: Date                      │
└──────────────────────────────────────┘
  Unique Index: { habitId: 1, date: 1 }
```

The unique compound index on `{ habitId, date }` enforces one tracking entry per habit per day at the **database level** — not just application logic.

---

### Relationships

```text
User (1) ──── (N) Habit (1) ──── (N) TrackingLog
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB running locally, or access to a MongoDB Atlas connection string
- npm

---

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Himanshugulhane27/habit-tracker-api.git
cd habit-tracker-api

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 4. Start the development server
npm run dev
```

Expected output:

```text
✅ Connected to MongoDB
✅ Server running on port 8000
```

---

### Scripts

```bash
npm run dev      # Start development server with hot reload (nodemon + ts-node)
npm run build    # Compile TypeScript to JavaScript
npm start        # Run production build
npm test         # Run automated test suite
```

---

## 🔐 Authentication (JWT)

### How It Works

1. **Register** → `POST /api/auth/register` → receive a JWT token
2. **Login** → `POST /api/auth/login` → receive a JWT token
3. **Use the token** → add to request headers for all protected routes:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Details

| Property  | Value         |
|-----------|---------------|
| Algorithm | HS256         |
| Expiry    | 7 days        |
| Payload   | `{ userId }`  |

---

## 🗺️ API Routes

| Method | Endpoint                    | Description                  | Auth |
|--------|-----------------------------|------------------------------|------|
| POST   | /api/auth/register          | Register a new user          | ❌   |
| POST   | /api/auth/login             | Login and get JWT            | ❌   |
| POST   | /api/habits                 | Create a new habit           | ✅   |
| GET    | /api/habits                 | Get all habits (paginated)   | ✅   |
| GET    | /api/habits/:id             | Get a specific habit         | ✅   |
| PUT    | /api/habits/:id             | Update a habit               | ✅   |
| DELETE | /api/habits/:id             | Delete a habit               | ✅   |
| POST   | /api/habits/:id/track       | Mark habit done today        | ✅   |
| GET    | /api/habits/:id/history     | Get 7-day history + streak   | ✅   |
| GET    | /health                     | Health check                 | ❌   |

---

## 📝 Example Requests & Responses

### Register

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response `201`:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "664a1b2c3d4e5f6789012345",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response `200`:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "664a1b2c3d4e5f6789012345",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Create Habit

```bash
curl -X POST http://localhost:8000/api/habits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Morning Run",
    "description": "Run 5km every morning",
    "frequency": "daily",
    "tags": ["health", "fitness"],
    "reminderTime": "06:00 AM"
  }'
```

Response `201`:

```json
{
  "success": true,
  "message": "Habit created successfully",
  "data": {
    "habit": {
      "_id": "664a1b2c3d4e5f6789012346",
      "userId": "664a1b2c3d4e5f6789012345",
      "title": "Morning Run",
      "description": "Run 5km every morning",
      "frequency": "daily",
      "tags": ["health", "fitness"],
      "reminderTime": "06:00 AM",
      "createdAt": "2024-05-19T10:35:00.000Z"
    }
  }
}
```

---

### Get All Habits (with filters & pagination)

```bash
curl -X GET "http://localhost:8000/api/habits?tag=health&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response `200`:

```json
{
  "success": true,
  "message": "Habits retrieved successfully",
  "data": {
    "habits": [
      {
        "_id": "664a1b2c3d4e5f6789012346",
        "title": "Morning Run",
        "frequency": "daily",
        "tags": ["health", "fitness"],
        "reminderTime": "06:00 AM"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### Update Habit

```bash
curl -X PUT http://localhost:8000/api/habits/<habit-id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Evening Workout",
    "frequency": "daily",
    "tags": ["fitness", "health"]
  }'
```

Response `200`:

```json
{
  "success": true,
  "message": "Habit updated successfully",
  "data": {
    "habit": {
      "_id": "664a1b2c3d4e5f6789012346",
      "title": "Evening Workout",
      "frequency": "daily",
      "tags": ["fitness", "health"]
    }
  }
}
```

---

### Delete Habit

```bash
curl -X DELETE http://localhost:8000/api/habits/<habit-id> \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response `200`:

```json
{
  "success": true,
  "message": "Habit deleted successfully",
  "data": null
}
```

---

### Track Habit

```bash
curl -X POST http://localhost:8000/api/habits/<habit-id>/track \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

No request body required. The API automatically records completion for the current day.

Response `201`:

```json
{
  "success": true,
  "message": "Habit tracked successfully",
  "data": {
    "log": {
      "_id": "664a1b2c3d4e5f6789012347",
      "habitId": "664a1b2c3d4e5f6789012346",
      "userId": "664a1b2c3d4e5f6789012345",
      "date": "2024-05-19",
      "completed": true
    }
  }
}
```

---

### Get Habit History

```bash
curl -X GET http://localhost:8000/api/habits/<habit-id>/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response `200`:

```json
{
  "success": true,
  "message": "Habit history retrieved successfully",
  "data": {
    "habit": "Morning Run",
    "history": [
      { "date": "2024-05-13", "completed": true },
      { "date": "2024-05-14", "completed": true },
      { "date": "2024-05-15", "completed": false },
      { "date": "2024-05-16", "completed": true },
      { "date": "2024-05-17", "completed": true },
      { "date": "2024-05-18", "completed": true },
      { "date": "2024-05-19", "completed": true }
    ],
    "streak": 4
  }
}
```

---

### Health Check

```http
GET /health
```

Response `200`:

```json
{
  "status": "OK",
  "message": "Habit Tracker API is running"
}
```

---

## ❌ Error Responses

All errors follow the same format:

```json
{
  "success": false,
  "message": "<error description>",
  "data": null
}
```

| Status | Scenario                        | Message                                   |
|--------|---------------------------------|-------------------------------------------|
| 400    | Missing required fields         | "Please provide name, email and password" |
| 400    | Duplicate tracking              | "Habit already tracked for today"         |
| 401    | Wrong credentials               | "Invalid email or password"               |
| 401    | Missing token                   | "No token provided"                       |
| 401    | Invalid or expired token        | "Invalid or expired token"                |                         
| 404    | Habit not found                 | "Habit not found"                         |
| 429    | Rate limit exceeded             | "Too many requests, please try again after an hour" |
| 500    | Server error                    | "Server error"                            |

---

## 🧪 Testing

Tests use an in-memory MongoDB instance via `MongoMemoryServer` — no real database required. Each test runs in isolation; data is cleared between tests.

```bash
# Run all tests
npm test
```

```text
Test Suites: 2 passed, 2 total
Tests:       10 passed, 10 total
```

### Test Coverage

| Suite          | What's Tested                                              |
|----------------|------------------------------------------------------------|
| auth.test.ts   | Register, login, duplicate email, wrong password, missing fields |
| habit.test.ts  | Create, get all, get by ID, update, delete, track, duplicate tracking, history |

---

## 📁 Project Structure

```text
habit-tracker-api/
│
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts       # Register & login handlers
│   │   ├── habit.controller.ts      # Habit CRUD handlers
│   │   └── tracking.controller.ts   # Track & history handlers
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts       # JWT verification
│   │   └── validate.middleware.ts   # Joi request validation
│   │
│   ├── validators/
│   │   ├── auth.validator.ts        # Auth validation schemas
│   │   └── habit.validator.ts       # Habit validation schemas
│   │
│   ├── models/
│   │   ├── User.ts                  # User schema
│   │   ├── Habit.ts                 # Habit schema
│   │   └── TrackingLog.ts           # Tracking log schema
│   │
│   ├── routes/
│   │   ├── auth.routes.ts           # /api/auth routes
│   │   └── habit.routes.ts          # /api/habits routes
│   │
│   ├── utils/
│   │   └── ApiResponse.ts           # Consistent response format
│   │
│   └── app.ts                       # Express application setup and route registration
│
├── tests/
│   ├── setup.ts                     # MongoMemoryServer setup
│   ├── auth.test.ts                 # Auth route tests
│   └── habit.test.ts                # Habit route tests
│
├── .env.example
├── .gitignore
├── jest.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 💡 Design Decisions

### Why JWT?

No session storage needed. The token contains the user ID and is verified on every request by middleware — simple and stateless.

### Why bcryptjs?

Passwords are hashed before hitting the database. Plain text is never stored.

### Why a Separate TrackingLog Collection?

Embedding logs inside habits would make the documents grow unbounded. A separate collection keeps habit documents small and makes history queries simple — just filter by habitId and date range.

### Why a Unique Compound Index on `{ habitId, date }`?

Application-level duplicate checks aren't enough — two requests hitting simultaneously can both pass the check. The index enforces it at the database level so it's physically impossible to log the same habit twice in a day.

### Why Joi Validation?

I added Joi to validate request data before it reaches the controller. If someone sends an empty name or invalid email, it gets rejected immediately with a clear message. Without this, bad data could reach the database directly.

### Why MongoMemoryServer for Tests?

Tests run against an isolated in-memory database. No real MongoDB needed, no test data leaking into development.

---