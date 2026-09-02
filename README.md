# Ledgerly — Accounting Practice Management Platform

A complete, production-quality **Accounting Practice Management Platform** built with the **MERN** stack (MongoDB, Express, React, Node.js) + Vite, Tailwind CSS, TanStack Query, Recharts and i18next.

Ledgerly is an internal SaaS for small accounting firms: it manages monthly, temporary and one-time clients, tasks, workflows, payments, revenue, expenses, salaries, employees, documents, notifications, and an activity timeline. It is RTL-first (Arabic default) with full English support.

> Inspired conceptually by products like Financial Cents, TaxDome and Karbon. **No branding or UI is copied** — the visual identity, layout, and naming are original.

---

## ✨ Features

### Clients

- Three client types: **monthly**, **temporary**, **one-time**
- Recurring monthly billing, end-dates for temporary engagements
- Payment status auto-derived from payments
- Per-client tasks, payments, documents, notes and activity
- Assignment to **accountants** and **customer service** staff

### Tasks

- Full CRUD, status workflow (`new → in_progress → completed / cancelled`)
- Priority, due dates, estimated vs. actual hours, price, payment status
- **Table view** and **Kanban board** (drag-free status changer)
- Comments and attachments
- Automatic overdue detection
- Visibility rules: non-managers see only their own tasks

### Workflows

- Reusable multi-step pipelines (Bookkeeping, Tax Filing, etc.)
- Step ordering and description
- Assignable to tasks

### Payments & Revenue

- Invoices with due date, payment method, payment status
- Auto-derive client payment status (paid / partially_paid / overdue / unpaid)
- Mark overdue based on due date
- Revenue entries with categories (monthly / temporary / one-time / other)
- Statistics: outstanding, paid, monthly collections

### Expenses & Salaries

- Expense categories (salary, marketing, office, software, hosting, transport, etc.)
- Salaries with **base + bonus − deductions = net**, period (month/year)
- Salaries restricted to **Super Admin / Manager**

### Employees & Team Performance

- All team members and their roles + departments
- Per-employee completion rate, workload, overdue count
- Live team performance report

### Documents

- Attach documents to clients / tasks / payments / expenses
- **Local upload** in dev; structured so it can be swapped for Cloudinary / S3 in production
- Served via a static `/uploads` route

### Notifications & Activity Log

- In-app notifications: task assigned, payment overdue, new client, etc.
- Mark as read / mark all as read
- Full audit log of actions across the workspace

### Reports

- **Financial**: revenue vs expenses, profit, outstanding
- **Clients**: by type, top clients by revenue
- **Team**: workload, completion rate, productivity
- **Expense breakdown** by category
- Recharts visualisations throughout

### Dashboard

- Stat cards: total clients, monthly / temporary / one-time, active / completed / overdue tasks, pending & overdue payments
- **Revenue / expenses / net profit** for the current month
- Charts: revenue vs expenses, client distribution, task status, team workload
- Recent activity feed and alerts (overdue tasks, due soon, overdue payments)

### Roles & Authorization (server-enforced)

- **super_admin** — full access
- **manager** — manage clients, tasks, employees, view reports & financial info
- **accountant** — view assigned work, add notes, upload documents
- **data_entry** — see only assigned tasks, update status, add notes
- **customer_service** — create clients, create work requests, track payments (no salaries, no company financials)

### i18n

- **Arabic (default)** with full **RTL** layout
- **English** with LTR
- All UI strings, validation messages, and currency formatting localised
- Language preference persisted in `localStorage`

### UI

- Custom design system: brand & ink palettes, soft shadows, rounded cards
- Sidebar + topbar layout, fully responsive
- Collapsible mobile sidebar, mobile-friendly tables, RTL-aware components
- Light & dark theme
- Modals, drawers, toasts, skeletons, empty states, confirmation dialogs

---

## 🧱 Tech Stack

| Layer    | Tech                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------ |
| Frontend | React 18, Vite 5, React Router 6, TanStack Query 5, React Hook Form, Zod, Axios, Recharts, Lucide, Tailwind CSS, i18next |
| Backend  | Node.js, Express 4, Mongoose 8, JWT, bcryptjs, Helmet, express-rate-limit, multer                                        |
| Database | MongoDB (local or Atlas)                                                                                                 |
| Tooling  | Concurrently, Nodemon, Vite, ESLint (optional)                                                                           |

---

## 📁 Project Structure

```
accounting-platform/
├── client/                   # Vite + React app
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI & forms
│   │   ├── pages/            # Route components
│   │   ├── layouts/          # Sidebar / Topbar / AppLayout
│   │   ├── services/api.js   # Axios client
│   │   ├── context/          # Auth + Theme providers
│   │   ├── i18n/             # Locales (ar, en)
│   │   ├── routes/           # ProtectedRoute
│   │   ├── utils/            # Constants, formatting
│   │   └── validations/      # (Zod schemas live next to forms)
│   └── package.json
├── server/                   # Express API
│   ├── src/
│   │   ├── config/           # db, constants
│   │   ├── models/           # Mongoose models
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic (finance, activity, notifications)
│   │   ├── middleware/       # auth, error handler
│   │   ├── routes/           # Express routers
│   │   ├── utils/            # asyncHandler, pagination, dates, apiResponse
│   │   ├── seed/             # seed.js
│   │   └── app.js            # Express bootstrap
│   ├── uploads/              # Local document storage (created on first upload)
│   └── package.json
├── package.json              # Workspace root (concurrently, scripts)
└── README.md
```

---

## 🛠️ Prerequisites

- **Node.js 18+**
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string
- npm 9+ (or pnpm / yarn)

---

## ⚙️ Installation

```bash
# from project root
npm install
npm install --workspace client
npm install --workspace server
```

Or in one go:

```bash
npm run install:all
```

### Environment Variables

#### `server/.env`

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/accounting-platform
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

#### `client/.env`

```env
VITE_API_URL=localhost:5173/api
```

> `.env.example` files are committed; real `.env` files are git-ignored.

---

## 🚀 Running the App

```bash
# from project root — runs client and server in parallel
npm run dev
```

Or individually:

```bash
npm run dev:server   # localhost:5173
npm run dev:client   # http://localhost:5173
```

### Seed the Database

```bash
npm run seed
```

This clears the database and inserts a realistic dataset (users, clients, tasks, payments, revenue, expenses, salaries, notifications, activity logs, documents, workflows).

---

## 🔐 Demo Accounts

All passwords: **`Password123!`**

| Role             | Email                 |
| ---------------- | --------------------- |
| Super Admin      | `admin@demo.io`       |
| Manager          | `manager@demo.io`     |
| Accountant       | `accountant1@demo.io` |
| Accountant       | `accountant2@demo.io` |
| Accountant       | `accountant3@demo.io` |
| Data Entry       | `data1@demo.io`       |
| Data Entry       | `data2@demo.io`       |
| Customer Service | `cs1@demo.io`         |
| Customer Service | `cs2@demo.io`         |

The login page has one-click **"Use demo"** buttons that pre-fill each account.

---

## 🧪 Build

```bash
# Frontend production build
npm run build --workspace client

# Backend "build" is a no-op (Express needs no build step)
npm run build --workspace server

# Build both
npm run build
```

Output for the frontend is in `client/dist`.

---

## 📡 API Overview

All endpoints are under `/api`. Authenticated endpoints require a `Bearer` JWT in the `Authorization` header.

| Endpoint                                                                | Description                                                        |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `POST /auth/register`                                                   | Register (first user becomes super admin)                          |
| `POST /auth/login`                                                      | Sign in, returns `{ token, user }`                                 |
| `POST /auth/logout`                                                     | Sign out (logs activity)                                           |
| `GET  /auth/me`                                                         | Get current user                                                   |
| `GET  /users` · `POST /users` · `PUT /users/:id` · `DELETE /users/:id`  | User management (super_admin / manager)                            |
| `GET  /clients` · `POST` · `PUT /:id` · `DELETE /:id`                   | Clients (filtering, pagination, search)                            |
| `GET  /clients/:id/summary`                                             | Client tasks + payments                                            |
| `POST /clients/:id/notes`                                               | Add note to client                                                 |
| `GET  /tasks` · `POST` · `PUT` · `DELETE`                               | Tasks (table + filters)                                            |
| `GET  /tasks/kanban`                                                    | Kanban board view                                                  |
| `PATCH /tasks/:id/status`                                               | Quick status change                                                |
| `POST /tasks/:id/comments`                                              | Add a comment                                                      |
| `GET  /workflows` · `POST` · `PUT` · `DELETE`                           | Workflows (manager+ create)                                        |
| `GET  /payments` · `POST` · `PUT` · `DELETE` · `/stats`                 | Payments                                                           |
| `GET  /revenue` · `POST` · `PUT` · `DELETE`                             | Revenue                                                            |
| `GET  /expenses` · `POST` · `PUT` · `DELETE`                            | Expenses                                                           |
| `GET  /salaries` · `POST` · `PUT` · `DELETE` · `/me`                    | Salaries                                                           |
| `GET  /notifications` · `PUT /:id/read` · `PUT /read-all` · `DELETE`    | Notifications                                                      |
| `GET  /activity`                                                        | Activity log (paginated, filterable)                               |
| `GET  /documents` · `POST` · `DELETE`                                   | Documents (multipart upload)                                       |
| `GET  /dashboard/stats` · `/activity` · `/alerts`                       | Dashboard data                                                     |
| `GET  /reports/financial` · `/clients` · `/team` · `/expense-breakdown` | Reports                                                            |
| `GET  /search?q=...`                                                    | Global search across clients / tasks / users / payments / expenses |

### Response shape

```json
{
  "success": true,
  "data": {
    /* ... */
  },
  "meta": { "page": 1, "limit": 20, "total": 123, "totalPages": 7 }
}
```

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid" }]
}
```

---

## 🛡️ Security Notes

- Passwords are hashed with **bcryptjs**.
- JWTs are signed with `JWT_SECRET` and expire in 7 days.
- All sensitive routes are protected by `protect` + `authorize(...roles)`.
- The frontend role checks are for UX only — **server is the source of truth**.
- Inputs are validated with Zod / Mongoose validators; Mongoose schemas use enums and refs.
- CORS is locked to `CLIENT_URL`; rate-limited on `/api`.
- Static uploads are served from `/uploads` (read-only).
- `helmet` adds common HTTP security headers.

---

## 🧮 Business Rules Enforced

1. Salary endpoints are restricted to `super_admin` / `manager`.
2. Revenue endpoints are restricted to `super_admin` / `manager` / `accountant`.
3. Customer Service cannot change task assignee or price; they can create clients/tasks.
4. Accountants / data entry only see their own tasks.
5. Overdue tasks (`status ∉ [completed, cancelled]` and `dueDate < now`) are auto-flagged on every dashboard call.
6. Overdue payments (`status ∉ [paid, cancelled]` and `dueDate < now`) are auto-flagged.
7. Client `paymentStatus` is recomputed whenever a payment is created/updated/deleted.
8. `netSalary` is always `base + bonus − deductions` (enforced by Mongoose pre-validate).
9. All financial aggregations go through a single `services/financeService.js` — no duplicated business logic.

---

## 📂 Documents / File Uploads

Files are uploaded through `POST /api/documents` (multipart/form-data, field name `file`). They are stored under `server/uploads/<yyyy-mm>/<random>-<originalname>` and served from `/uploads/...`. The Document model keeps `name`, `url`, `type`, `size` so you can later swap the local storage for Cloudinary / S3 by changing only the controller.

---

## 🌐 Internationalization

- Locales live in `client/src/i18n/locales/{ar,en}.json`.
- Default language: **Arabic** with `dir="rtl"`.
- Switching the language updates `document.documentElement.lang` and `dir`.
- Currency formatting uses `Intl.NumberFormat` with `ar-SA` for Arabic and `en-US` for English.
- Date formatting uses `date-fns` with the appropriate locale.

---

## 🖥️ Production Deployment

1. Set `NODE_ENV=production` and a strong `JWT_SECRET` in the server env.
2. Build the frontend (`npm run build --workspace client`) and serve `client/dist` from any static host (Vercel, Netlify, Nginx).
3. Point the frontend to the API using `VITE_API_URL`.
4. Run the server with a process manager (PM2, systemd, Docker).
5. Use MongoDB Atlas (or a managed instance) for the database.
6. For documents, switch the upload controller to Cloudinary / S3.

---

## 🛣️ Roadmap / Future Improvements

- Stripe / payment gateway integration (the Payment model is already gateway-ready)
- Real-time updates (Socket.IO) for notifications & task board
- Recurring tasks for monthly clients (template → auto-create)
- File previews and inline editing
- Email & SMS notifications
- Audit-log diff viewer and time-travel
- Per-client portal login
- CSV / Excel export for reports
- Multi-currency support

---

## 📜 License

MIT — use it, fork it, ship it.
