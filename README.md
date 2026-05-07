<<<<<<< HEAD
# SyncVerse — Backend API

> Real-time collaborative document editing platform — Node.js + Express + MongoDB boilerplate

---

## 📁 Folder Structure

```
SyncVerse/
├── server.js                  # Entry point — Express + HTTP server
├── .env                       # Environment variables (not committed)
├── .env.example               # Template for environment variables
├── package.json
│
├── config/
│   └── db.js                  # Mongoose connection logic
│
├── models/
│   ├── User.model.js          # User schema (auth, roles, profile)
│   └── Document.model.js      # Document schema (content, permissions, versions)
│
├── controllers/
│   ├── auth.controller.js     # Register, Login, GetMe
│   ├── document.controller.js # CRUD + Share + Version history
│   └── user.controller.js     # Profile, Search
│
├── routes/
│   ├── auth.routes.js         # /api/auth/*
│   ├── document.routes.js     # /api/documents/*
│   └── user.routes.js         # /api/users/*
│
└── middleware/
    ├── auth.middleware.js      # JWT protect + RBAC authorize()
    ├── error.middleware.js     # Global error handler
    └── validate.middleware.js  # express-validator rules + runner
```

---

## 🚀 Getting Started

### 1. Clone & install

```bash
git clone <your-repo-url>
cd SyncVerse
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET
```

### 3. Run in development

```bash
npm run dev        # nodemon auto-restart
```

### 4. Run in production

```bash
npm start
```

---

## 🛠️ Tech Stack

| Package            | Purpose                              |
|--------------------|--------------------------------------|
| `express`          | HTTP server & routing                |
| `mongoose`         | MongoDB ODM                          |
| `dotenv`           | Environment variable loading         |
| `cors`             | Cross-origin request handling        |
| `helmet`           | Security HTTP headers                |
| `morgan`           | HTTP request logging                 |
| `bcryptjs`         | Password hashing                     |
| `jsonwebtoken`     | JWT creation & verification          |
| `express-validator`| Request body validation              |
| `uuid`             | Unique room ID generation            |
| `nodemon` (dev)    | Auto-restart on file changes         |

---

## 📡 API Reference

### Auth — `/api/auth`

| Method | Endpoint           | Auth | Description        |
|--------|--------------------|------|--------------------|
| POST   | `/register`        | ❌   | Create new account |
| POST   | `/login`           | ❌   | Login, get JWT     |
| GET    | `/me`              | ✅   | Get current user   |

### Documents — `/api/documents`

| Method | Endpoint           | Auth | Description                 |
|--------|--------------------|------|-----------------------------|
| GET    | `/`                | ✅   | List user's documents        |
| POST   | `/`                | ✅   | Create a new document        |
| GET    | `/:id`             | ✅   | Get single document          |
| PUT    | `/:id`             | ✅   | Update document              |
| DELETE | `/:id`             | ✅   | Delete document (owner only) |
| POST   | `/:id/share`       | ✅   | Share with collaborator      |

### Users — `/api/users`

| Method | Endpoint           | Auth | Description          |
|--------|--------------------|------|----------------------|
| GET    | `/search?q=...`    | ✅   | Search users to share |
| GET    | `/:id`             | ✅   | Get user profile      |
| PUT    | `/profile`         | ✅   | Update own profile    |

---

## 🔒 Authentication

All protected routes require a `Bearer` token:

```
Authorization: Bearer <your_jwt_token>
```

---

## ⚡ Next Steps

- [ ] Add Socket.io for real-time collaborative editing
- [ ] Implement refresh tokens
- [ ] Add email verification
- [ ] Add rate limiting (`express-rate-limit`)
- [ ] Write unit & integration tests (Jest + Supertest)
- [ ] Add Docker + docker-compose support
=======
# Sync-Verse
>>>>>>> 7e612a768c8cb325d807e23fdaf98046de8deb3d
