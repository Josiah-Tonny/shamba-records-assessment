# SmartSeason Field Monitoring System — Development Plan

**Stack:** React (JSX) · Node.js/Express · Neon PostgreSQL · Vite · Vercel  
**Deadline:** 25 April 2026  
**Repo Layout:** Single Vite project — `src/server/` holds all backend logic

---

## 1. Technology Decisions

| Concern | Choice | Reason |
|---|---|---|
| Frontend | React + JSX (Vite) | Already scaffolded |
| Backend | Express.js in `src/server/` | Simple, file-based, fits folder structure |
| Database | Neon PostgreSQL | Serverless-friendly, free tier |
| Auth | JWT (access token in memory + httpOnly refresh cookie) | Stateless, Vercel-compatible |
| Deployment | Vercel (frontend + serverless API via `/api/index.js`) | Zero-config, free tier |
| CI/CD | GitHub Actions | Auto-lint + test on push/PR |
| Styling | Tailwind CSS v3 | Fast utility-first UI |
| HTTP Client | Axios | Interceptors for auth headers |
| State | React Context + useReducer | No need for Redux at this scale |

---

## 2. Project Dependencies

### Install once after scaffolding

```bash
# Runtime
npm install express cors dotenv pg jsonwebtoken bcryptjs axios react-router-dom

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Dev utilities
npm install -D nodemon concurrently jest supertest
```

### `package.json` scripts to add

```json
"scripts": {
  "dev": "concurrently \"vite\" \"nodemon src/server/index.js\"",
  "build": "vite build",
  "server": "node src/server/index.js",
  "test": "jest --testPathPattern=src/server",
  "lint": "eslint src"
}
```

---

## 3. Environment Variables

### `.env` (local — never commit)

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your_super_secret_key_here
JWT_REFRESH_SECRET=another_secret_key_here
PORT=3001
NODE_ENV=development
VITE_API_URL=http://localhost:3001
```

### `.env.example` (commit this)

```env
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
PORT=3001
NODE_ENV=development
VITE_API_URL=
```

---

## 4. Database Schema

Run these SQL statements in Neon SQL Editor or via migration script.

```sql
-- Users
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'agent')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Fields
CREATE TABLE fields (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  crop_type    VARCHAR(100) NOT NULL,
  planting_date DATE NOT NULL,
  stage        VARCHAR(20) NOT NULL DEFAULT 'planted'
               CHECK (stage IN ('planted', 'growing', 'ready', 'harvested')),
  assigned_to  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_by   INTEGER REFERENCES users(id),
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- Field Updates (observations/notes)
CREATE TABLE field_updates (
  id         SERIAL PRIMARY KEY,
  field_id   INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  agent_id   INTEGER NOT NULL REFERENCES users(id),
  stage      VARCHAR(20) NOT NULL
             CHECK (stage IN ('planted', 'growing', 'ready', 'harvested')),
  notes      TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed demo users (run after schema)
INSERT INTO users (name, email, password, role) VALUES
  ('Admin User',  'admin@smartseason.com',  '$2a$10$HASHED_PASSWORD', 'admin'),
  ('Field Agent', 'agent@smartseason.com',  '$2a$10$HASHED_PASSWORD', 'agent');
```

### Field Status Logic

Computed at query/render time — not stored in the database:

| Condition | Status |
|---|---|
| `stage = 'harvested'` | **Completed** |
| `stage IN ('planted','growing')` AND `planting_date < NOW() - INTERVAL '90 days'` | **At Risk** |
| Everything else | **Active** |

---

## 5. Folder Structure (inside the Vite scaffold)

```
src/
├── server/
│   ├── index.js              # Express app entry point
│   ├── db.js                 # Neon PostgreSQL connection (pg Pool)
│   ├── middleware/
│   │   ├── auth.js           # JWT verify middleware
│   │   └── role.js           # requireRole('admin') guard
│   ├── routes/
│   │   ├── auth.js           # POST /api/auth/register, /login, /logout
│   │   ├── fields.js         # CRUD /api/fields
│   │   └── updates.js        # POST /api/fields/:id/updates  GET /api/fields/:id/updates
│   └── controllers/
│       ├── authController.js
│       ├── fieldController.js
│       └── updateController.js
│
├── assets/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── fields/
│   │   ├── FieldCard.jsx
│   │   ├── FieldForm.jsx
│   │   ├── FieldStatusBadge.jsx
│   │   └── UpdateForm.jsx
│   └── ui/
│       ├── StatCard.jsx
│       └── LoadingSpinner.jsx
├── context/
│   └── AuthContext.jsx       # Global auth state
├── hooks/
│   └── useAuth.js
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx         # Redirects by role
│   ├── AdminDashboard.jsx
│   ├── AgentDashboard.jsx
│   ├── FieldDetail.jsx
│   └── NotFound.jsx
├── services/
│   └── api.js                # Axios instance + interceptors
├── utils/
│   └── fieldStatus.js        # computeStatus(field) helper
├── App.jsx
├── main.jsx
└── index.css

api/
└── index.js                  # Vercel serverless entry — imports src/server/index.js
```

---

## 6. API Endpoints

### Auth — `/api/auth`

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login, returns JWT |
| POST | `/logout` | Auth | Clears refresh cookie |
| GET | `/me` | Auth | Get current user |

### Fields — `/api/fields`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | Admin | All fields with status |
| GET | `/mine` | Agent | Agent's assigned fields |
| POST | `/` | Admin | Create a field |
| PUT | `/:id` | Admin | Edit field metadata or reassign |
| DELETE | `/:id` | Admin | Delete field |

### Field Updates — `/api/fields/:id/updates`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/:id/updates` | Admin/Agent (own) | Get update history |
| POST | `/:id/updates` | Agent (own) | Post stage update + note |

---

## 7. Frontend Pages & Routes

```jsx
// App.jsx route layout
/login              → <Login />
/register           → <Register />
/dashboard          → <ProtectedRoute> → redirects by role
/admin/dashboard    → <AdminDashboard />   (admin only)
/agent/dashboard    → <AgentDashboard />   (agent only)
/fields/:id         → <FieldDetail />      (admin any | agent own)
*                   → <NotFound />
```

### Admin Dashboard shows:
- Total fields count
- Status breakdown (Active / At Risk / Completed) — stat cards
- List of all fields with agent assignment, stage, status badge
- Quick assign / reassign agent to field

### Agent Dashboard shows:
- My assigned fields count
- Status breakdown of own fields
- List of own fields with last update time
- Quick link to log an update

### Field Detail shows:
- Field metadata (name, crop, planting date, stage)
- Status badge with explanation
- Update history (timeline of notes)
- Agent: form to update stage + add note
- Admin: read-only view of updates + ability to edit field

---

## 8. Auth Flow

```
1. User submits login form
2. POST /api/auth/login → server validates password with bcrypt
3. Server returns { accessToken, user } + sets httpOnly refreshToken cookie
4. AuthContext stores accessToken in memory (NOT localStorage)
5. Axios interceptor attaches "Authorization: Bearer <token>" to all requests
6. On 401 response → call /api/auth/refresh → get new accessToken
7. ProtectedRoute reads AuthContext — redirects to /login if unauthenticated
```

---

## 9. Vercel Deployment Setup

### `vercel.json` (root level)

```json
{
  "version": 2,
  "builds": [
    { "src": "api/index.js", "use": "@vercel/node" },
    { "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.js" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### `api/index.js` (root level — Vercel entry point)

```js
const app = require('./src/server/index.js');
module.exports = app;
```

### Vercel Environment Variables to Set

Set these in the Vercel project dashboard:
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `NODE_ENV=production`

---

## 10. CI/CD — GitHub Actions

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run backend tests
        run: npm test
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          NODE_ENV: test

  deploy-preview:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy Preview to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### GitHub Secrets to Add

In GitHub repo → Settings → Secrets:
- `DATABASE_URL`
- `JWT_SECRET`
- `VERCEL_TOKEN` (from Vercel account settings)
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

---

## 11. AGENTS.md (Coding Standards)

Create `AGENTS.md` at the root with the following:

```markdown
# Coding Standards — SmartSeason

## Architecture Rules
- Business logic lives in controllers only — never in route files
- Route files only define paths and call controllers
- DB queries go in controllers or a dedicated db-query file, not in routes

## Naming
- Files: camelCase (fieldController.js)
- React components: PascalCase (FieldCard.jsx)
- DB columns: snake_case
- JS variables/functions: camelCase

## Error Handling
- All async controller functions use try/catch
- Return consistent shape: { success, data, error }
- Never expose stack traces in production responses

## Security
- Passwords: bcryptjs with saltRounds = 10
- Tokens: JWT with expiry (access: 15m, refresh: 7d)
- Never log tokens or passwords
- Role checks on every protected route

## Git
- Branch naming: feature/name, fix/name, chore/name
- No direct commits to main — use PRs
- Commits follow: feat:, fix:, chore:, docs:
```

---

## 12. Demo Credentials

Seed these into the database on first run:

| Role | Email | Password |
|---|---|---|
| Admin | admin@smartseason.com | Admin@1234 |
| Field Agent | agent@smartseason.com | Agent@1234 |

Create a `src/server/seed.js` script that inserts these with bcrypt-hashed passwords and 3–5 sample fields.

```bash
node src/server/seed.js   # run once after DB is set up
```

---

## 13. Development Phases

### Phase 1 — Foundation (Day 1)
- [ ] Install all dependencies
- [ ] Configure Tailwind CSS
- [ ] Set up Neon DB and run schema SQL
- [ ] Create `src/server/db.js` with pg Pool
- [ ] Create `src/server/index.js` Express app
- [ ] Implement `/api/auth/register` and `/api/auth/login`
- [ ] Implement JWT middleware
- [ ] Create `AuthContext.jsx` and `useAuth.js`
- [ ] Build Login and Register pages
- [ ] Set up React Router with ProtectedRoute

### Phase 2 — Core Features (Day 2)
- [ ] Fields API (CRUD + `/mine` for agents)
- [ ] Field Updates API
- [ ] `computeStatus()` utility function
- [ ] Admin Dashboard page
- [ ] Agent Dashboard page
- [ ] FieldCard and FieldStatusBadge components

### Phase 3 — Detail & Polish (Day 3)
- [ ] FieldDetail page with update timeline
- [ ] UpdateForm for agents
- [ ] Admin: assign/reassign agent to field
- [ ] StatCard summary components
- [ ] Responsive layout with Navbar
- [ ] Seed script with demo data

### Phase 4 — Deploy & CI (Day 4)
- [ ] Create `api/index.js` Vercel entry
- [ ] Add `vercel.json`
- [ ] Push to GitHub, connect Vercel
- [ ] Set all environment variables in Vercel
- [ ] Set up GitHub Actions workflow
- [ ] Add GitHub Secrets
- [ ] Smoke test deployed app
- [ ] Write README with setup instructions and design decisions

---

## 14. README Sections to Write

```markdown
## Setup Instructions
1. Clone repo
2. npm install
3. Copy .env.example to .env and fill in values
4. Run schema SQL in Neon
5. node src/server/seed.js
6. npm run dev

## Design Decisions
- Single-repo Vite project with Express backend in src/server/
- JWT stored in memory (access) + httpOnly cookie (refresh) for security
- Field status is computed dynamically, not stored, to avoid sync issues
- Vercel serverless routing via api/index.js wrapper

## Field Status Logic
- Completed: stage is 'harvested'
- At Risk: planted/growing but planting date > 90 days ago
- Active: all other cases

## Assumptions
- One agent per field (can be extended)
- Admins cannot be assigned fields as agents
- Field stage can only move forward (planted → growing → ready → harvested)

## Demo Credentials
| Role  | Email                     | Password   |
|-------|---------------------------|------------|
| Admin | admin@smartseason.com     | Admin@1234 |
| Agent | agent@smartseason.com     | Agent@1234 |
```

---

*Last updated: April 2026 | SmartSeason Assessment*