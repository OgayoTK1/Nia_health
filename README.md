# NiaHealth — Community Health Monitoring & Referral Platform

<!-- Optional: place your project logo at docs/logo.png -->
<!-- ![NiaHealth Logo](docs/logo.png) -->

>  Requirements Specification: [Insert requirements link here]

NiaHealth digitizes how community clinics, referral hospitals, and patients collaborate. The platform streamlines appointment booking, digital referrals, patient follow-up, and broadcast health alerts so underserved communities can access timely, preventive care.

---

## Table of Contents

1. [Product Snapshot](#product-snapshot)
2. [System Architecture](#system-architecture)
3. [Feature Matrix](#feature-matrix)
4. [Tech Stack](#tech-stack)
5. [Requirements](#requirements)
6. [Personas & User Journeys](#personas--user-journeys)
7. [Local Quick Start](#local-quick-start)
8. [Environment Variables](#environment-variables)
9. [Database & Seed Data](#database--seed-data)
10. [Running the Apps](#running-the-apps)
11. [Testing & Quality Gates](#testing--quality-gates)
12. [Deployment Guide](#deployment-guide)
13. [Operations & Maintenance](#operations--maintenance)
14. [Troubleshooting](#troubleshooting)
15. [Security & Compliance](#security--compliance)
16. [Observability & Analytics](#observability--analytics)
17. [Documentation Pack](#documentation-pack)
18. [Rubric Readiness Checklist](#rubric-readiness-checklist)
19. [Contributing](#contributing)
20. [License](#license)

---

## Product Snapshot

- **Mission:** Improve community health outcomes by connecting patients, clinics, and referral hospitals through a shared digital workflow.
- **Core Outcomes:**
  - Single patient profile with appointment history and referrals.
  - Verified health workers issue referrals, update outcomes, and trigger alerts.
  - Admins manage clinics, broadcast campaigns, and review system activity logs.
- **Current Status:** Local development environment ready; API + React SPA run in dev mode; automated tests in place; deployment-ready build scripts provided; documentation synced with rubric needs.

## Current Live Deployment

- **Frontend (React SPA):** [https://nia-health.vercel.app/](https://nia-health.vercel.app/) (Hosted on Vercel)
- **Backend (Express API):** [https://nia-health.onrender.com/](https://nia-health.onrender.com/) (Hosted on Render)
- **Database:** FreeSQL (sql12.freesqldatabase.com) - MySQL instance
- **Email Service:** SendGrid (Transactional emails for OTP and alerts)

> **Note:** FreeSQL may have limitations on remote connections. If you encounter connection issues, consider migrating to a cloud database like Render's MySQL or PlanetScale for better reliability.

---

## System Architecture

```
┌──────────────┐     HTTPS     ┌──────────────┐
│ React Frontend│ ⇆  API  ⇆  │ Express API   │
│ (Vite, Tailwind)│           │ (Node.js)     │
└──────────────┘               │              │
        ▲                      │              │
        │                      ▼              │
        │             ┌────────────────┐      │
        │             │ MySQL Database │◀─────┘
        │             └────────────────┘
        │                      ▲
        ▼                      │
  SendGrid Emails     Audit Logs & Backups
```

- **Routing:** RESTful API under `/api/*` with role-based access control.
- **Security:** Helmet headers, rate limiting, input sanitization, JWT auth + refresh tokens, OTP verification for staff.
- **Observability:** Structured audit logs recorded in MySQL; application logs stream to console by default. You can redirect or configure file logging to `logs/` using a process manager.
- **Extensibility:** Modular routing and controller pattern enables additional services (SMS, analytics) via adapters.

---

## Project Structure

```
Nia_health/
├─ backend/               # Node.js + Express API
│  ├─ src/
│  │  ├─ config/          # db, jwt, email configuration
│  │  ├─ controllers/     # route controllers
│  │  ├─ middleware/      # auth, security, validators, error handling
│  │  ├─ routes/          # API routes
│  │  └─ app.js           # express app wiring
│  ├─ server.js           # server entry
│  └─ package.json
├─ frontend/              # React + Vite + Tailwind SPA
│  ├─ src/
│  │  ├─ api/             # Axios instance & API client
│  │  ├─ contexts/        # Auth context, etc.
│  │  ├─ pages/           # Views/pages
│  │  └─ App.jsx          # root component
│  └─ package.json
├─ docs/                  # API spec, schema, design docs
├─ backups/               # DB dumps
├─ logs/                  # (optional) log output target
└─ README.md
```

---

## Feature Matrix

| Capability | Patients | Health Workers | Administrators |
|------------|----------|----------------|----------------|
| Self-registration & OTP login | ✅ | ✅ | ✅ |
| Appointment booking & history | ✅ | Read-only | Oversight |
| Referral issuance & tracking | ❌ | ✅ | ✅ |
| Clinic management & activation | ❌ | ❌ | ✅ |
| Broadcast health alerts (email) | ❌ | ❌ | ✅ |
| Audit trail visibility | ❌ | ❌ | ✅ |
| Nearest clinic geosearch | ✅ | ✅ | ✅ |
| Role-based dashboards | In roadmap | ✅ | ✅ |

---

## Tech Stack

| Layer | Tools |
|-------|-------|
| Frontend | React 18, Vite, Tailwind CSS, Axios |
| Backend | Node.js 20, Express.js, mysql2 |
| Database | MySQL 8 (InnoDB, utf8mb4) |
| Auth | JWT (access + refresh), bcrypt, OTP email verification |
| Email | SendGrid transactional API |
| Dev Tooling | Jest + Supertest, ESLint, Prettier, Nodemon |
| Automation | PowerShell/Bash setup scripts, SQL migration helpers |

---

## Requirements
- **Core dependencies:** Node.js ≥ 20, npm ≥ 9, MySQL ≥ 8, Git.
- **Optional accelerators:** Docker Desktop (for local MySQL container), SendGrid account (for live emails), PowerShell 5+ or Bash (for provided automation scripts).

Map each rubric requirement to roadmap items in `docs/` as new expectations surface.

---

## Personas & User Journeys

| Persona | Goals | Key Screens/APIs |
|---------|-------|------------------|
| Patient (mobile-first) | Register, verify via OTP, book appointments, view referral outcome | `/api/auth/register`, `/api/appointments`, frontend `AppointmentsPage` |
| Health Worker | Authenticate with OTP, create referrals, update patient notes | `/api/auth/login-health-worker`, `/api/referrals`, `DashboardPage` |
| Clinic Admin | Manage clinic status, onboard staff, send alerts | `/api/admin/clinics`, `/api/admin/alerts`, `DashboardPage` |

> Future journey artefacts (wireframes, acceptance criteria) can be linked here as they are produced.

---

## Local Quick Start

### Option A — One-click PowerShell (Windows)

```powershell
git clone https://github.com/OgayoTK1/Nia_health.git
cd Nia_health
./setup.ps1
```

The script installs dependencies, scaffolds `.env`, and prepares `logs/` + `backups/`. Edit `backend/.env` before starting services.

### Option B — Manual Setup (All Platforms)

1. **Clone & install dependencies**
   ```bash
   git clone https://github.com/OgayoTK1/Nia_health.git
   cd Nia_health
   npm install --prefix backend
   npm install --prefix frontend
   ```
2. **Create environment files**
   - Copy the sample below into `backend/.env` (create file if missing).
   - Optionally add `frontend/.env` with `VITE_API_URL=http://localhost:5000/api`.
3. **Provision MySQL schema** — see [Database & Seed Data](#database--seed-data).

---

## Environment Variables

Create `backend/.env` with the values that match your environment. All values are strings unless noted. Replace placeholders with secure values before deploying.

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| `NODE_ENV` |  | development | Controls logging & middleware behaviour |
| `PORT` | | 5000 | Express server port |
| `DB_HOST` |  | 127.0.0.1 | MySQL host or Docker service name |
| `DB_PORT` |  | 3306 | MySQL port |
| `DB_USER` |  | root | Database user |
| `DB_PASSWORD` |  | supersecret | Database password |
| `DB_NAME` |  | niahealth | Target schema |
| `FRONTEND_URL` |  | https://nia-health.vercel.app | Allowed CORS origin (production) |
| `JWT_SECRET` |  | change_me_token | Access token signing secret |
| `JWT_REFRESH_SECRET` |  | change_me_refresh | Refresh token secret |
| `JWT_EXPIRES_IN` |  | 30m | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` |  | 7d | Refresh token TTL |
| `SENDGRID_API_KEY` |  | SG.xxxxxx | Enables transactional email |
| `EMAIL_FROM_ADDRESS` |  | noreply@niahealth.local | Default email sender |
| `EMAIL_FROM_NAME` |  | NiaHealth | Default sender name |
| `EMAIL_DEBUG` | optional | true | Verbose SendGrid logging in dev |
| `LOGIN_RATE_LIMIT_MAX` | optional | 5 | Failed login threshold |
| `RATE_LIMIT_WINDOW` | optional | 15 | Rate limiter window in minutes |
| `RATE_LIMIT_MAX_REQUESTS` | optional | 100 | Requests allowed per window |
| `SESSION_TIMEOUT` | optional | 1800000 | Session timeout in ms |
| `RUN_DB_MIGRATIONS` | optional | true | On startup, automatically create missing tables/columns |

> **Frontend:** Set `frontend/.env` with `VITE_API_URL` when the API base URL differs from the default `http://localhost:5000/api`.

**Sample `backend/.env` template**

```ini
NODE_ENV=development
PORT=5000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mypassword
DB_NAME=niahealth

FRONTEND_URL=http://localhost:5173

JWT_SECRET=replace_with_random_string
JWT_REFRESH_SECRET=replace_with_another_random_string
JWT_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=7d

SENDGRID_API_KEY=
EMAIL_FROM_ADDRESS=noreply@niahealth.local
EMAIL_FROM_NAME=NiaHealth
EMAIL_DEBUG=true

LOGIN_RATE_LIMIT_MAX=5
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
SESSION_TIMEOUT=1800000
```

---

## Database & Seed Data

### Option A — Use the bundled Dockerized MySQL

```powershell
# From project root on Windows PowerShell
docker run -d --name niahealth-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql:8
Get-Content docs/DB_SCHEMA.sql | docker exec -i niahealth-mysql mysql -uroot -proot
```

### Option B — Local / Remote MySQL instance

```sql
CREATE DATABASE IF NOT EXISTS niahealth CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE niahealth;
SOURCE docs/DB_SCHEMA.sql;
-- Optional: load simplified schema or new schema variants in docs/ as required
```

### Optional seed helpers

- `docs/migrations/add_clinic_coordinates.sql` — enrich clinic table with geospatial data.
- `backups/` — contains `.sql` exports you can restore with `mysql < backups/<file>.sql`.
- `verify-db.sql` — sanity check to confirm key tables and indexes exist.

### Default accounts

Create an initial admin (bcrypt hash for `` provided):

```sql
INSERT INTO clinics (name, address, phone, is_active) VALUES ('Head Office Clinic', 'Central Nairobi', '+254700000000', 1);

INSERT INTO health_workers (name, email, password_hash, clinic_id, role, is_active, is_verified)
VALUES (
  'Platform Administrator',
  'admin@niahealth.com',
  '$2b$10$CwTycUXWue0Thq9StjUM0uJ8zr5E/6.mQxa7R/efVtG7ONmGda5y.',
  1,
  'admin',
  TRUE,
  TRUE
);
```

Update the password hash if you prefer a different credential.

### Automatic Migrations (Recommended)

If you set `RUN_DB_MIGRATIONS=true` in your backend environment, the server will automatically create missing tables (e.g., `alerts`) and columns (e.g., `user_type` in `audit_logs`) on startup. This is safe and idempotent, and can be removed after initial deployment.

---

## Running the Apps

### Backend (Express API)

```bash
cd backend
npm run dev        # nodemon with hot reload (development)
npm start          # production mode (expects prior npm run build if applicable)
```

- API base URL: `http://localhost:5000/api`
- Health check: `http://localhost:5000/health`
- Logs: stream to console by default; configure your process manager to write to `logs/` if desired.

### Frontend (React SPA)

```bash
cd frontend
npm run dev        # Vite dev server (defaults to http://localhost:5173)
npm run build      # production build -> dist/
npm run preview    # preview production build locally
```

Configure the API endpoint via `VITE_API_URL` if the backend runs on a different host.

---

## Testing & Quality Gates

| Command | Purpose |
|---------|---------|
| `npm test` (backend) | Run Jest + Supertest suites, including controller & middleware mocks |
| `npm run lint` (frontend) | ESLint + Prettier formatting checks |
| `npm run lint:fix` (frontend) | Auto-fix lint issues where possible |
| `npm run test:watch` (backend) | Watch mode for rapid backend TDD |

> Ensure MySQL is reachable before executing integration tests that touch the database.
> Add UI E2E coverage (Playwright/Cypress) per rubric stretch goals when UI stabilizes.

---

## API Quick Reference

Example requests to verify core flows (use live URLs for production testing):

```bash
# Health check (local)
curl http://localhost:5000/health

# Health check (production)
curl https://nia-health.onrender.com/health

# Register patient (local)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"Passw0rd!","phone":"+254700000000"}'

# Register patient (production)
curl -X POST https://nia-health.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"Passw0rd!","phone":"+254700000000"}'

# Login patient (local)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"Passw0rd!"}'

# Nearest clinics (Nairobi CBD example, local)
curl "http://localhost:5000/api/clinics/nearest?latitude=-1.286389&longitude=36.817223&radius=50&limit=5"
```

---

## Deployment Guide

### Current Hosting Setup

The application is currently deployed as follows:

#### Frontend Deployment (Vercel)
1. Repository connected to Vercel via GitHub integration.
2. Build command: `npm run build`
3. Output directory: `dist/`
4. Environment variable: `VITE_API_URL=https://nia-health.onrender.com/api`
5. Live URL: [https://nia-health.vercel.app/](https://nia-health.vercel.app/)

#### Backend Deployment (Render)
1. Repository connected to Render via GitHub integration.
2. Build command: `npm install`
3. Start command: `npm start`
4. Environment variables set in Render dashboard (see [Environment Variables](#environment-variables) section).
5. Automatic deployments on push to `main` branch.
6. Live URL: [https://nia-health.onrender.com/](https://nia-health.onrender.com/)

#### Database (FreeSQL)
- MySQL instance hosted on FreeSQL.
- Connection details configured in Render backend environment variables.
- Schema loaded via automatic migrations (`RUN_DB_MIGRATIONS=true`).

### Manual Deployment Steps

#### 1. Prepare Environment
- Ensure MySQL schema is loaded (automatic via migrations).
- Create production `.env` with secure secrets.

#### 2. Backend Deployment Checklist
1. Push changes to `main` branch (triggers Render auto-deploy).
2. Monitor Render logs for successful startup and migrations.
3. Verify `/health` endpoint returns 200.

#### 3. Frontend Deployment Checklist
1. Push changes to `main` branch (triggers Vercel auto-deploy).
2. Verify build succeeds and API calls work.

#### 4. Email Configuration
- SendGrid API key configured in Render environment.
- Verified sender domain set up for production emails.

### Troubleshooting Deployment
- **Render Build Failures:** Check logs for missing dependencies or environment variables.
- **Vercel Build Failures:** Ensure `VITE_API_URL` is set correctly.
- **Database Connection Issues:** FreeSQL may block remote connections; consider upgrading to Render MySQL.
- **CORS Errors:** Ensure `FRONTEND_URL` in Render matches Vercel domain.

---

## Operations & Maintenance

- **Logs:**
  - Backend runtime logs: `logs/backend-*.log` (configure via your process manager).
  - Audit logs: persisted in MySQL `audit_logs` table.
- **Backups:**
  - `backups/` contains baseline exports; schedule nightly `mysqldump` via cron/Task Scheduler; confirm recovery plan quarterly.
- **Migrations:**
  - Place incremental SQL scripts under `docs/migrations/` and apply with `mysql < file.sql`. Track migration status in change log.
- **Health Monitoring:**
  - `GET /health` returns service status and environment metadata; integrate with uptime monitors (Better Stack, Pingdom).
- **Security controls:**
  - Rate limit knobs via environment variables.
  - OTP enforced for staff logins; verify SendGrid configuration in production.
  - Rotate secrets quarterly and document procedure in ops runbook.
- **Stakeholder reports:**
  - Generate monthly KPI exports (patients onboarded, referrals fulfilled) via SQL views (see `docs/reporting` placeholder).

---

## Security & Compliance

- Passwords stored using bcrypt hashes; JWT secrets kept in environment variables.
- Role-based access control enforced at middleware layer (`auth.js`).
- Helmet, rate-limiting, and input sanitization mitigate common web threats.
- Audit trail captures user actions with IP and user agent metadata.
- Data residency & privacy. Document consent model once defined.
- Incident response playbook

### Accessibility (A11y)

- Color contrast meets WCAG AA via Tailwind defaults (verify in UI review).
- Semantic HTML in components; ensure form labels and ARIA attributes for modals.
- Keyboard navigation: verify focus states on dialogs and forms.


---

## Observability & Analytics

- **Application metrics:** Add Prometheus/StatsD exporters as future work; track request latency, error rates, and DB query timings.
- **User analytics:** Frontend ready for integration with tools like PostHog or Google Analytics (respecting privacy policies).
- **Error tracking:** Recommend Sentry/Rollbar to capture frontend + backend stack traces.
- **Dashboards:** Maintain Grafana/Looker dashboards for clinic performance and referral trends (see `docs/analytics` placeholder).

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `ECONNREFUSED 127.0.0.1:3306` | MySQL not running or wrong credentials | Start DB, confirm `.env` values, re-run `testConnection` via server logs |
| `SendGrid API key not configured` warning | Missing/invalid `SENDGRID_API_KEY` | Add valid key (starts with `SG.`) or disable email features in dev |
| CORS error in browser | `FRONTEND_URL` mismatch | Update Render backend env var to `https://nia-health.vercel.app` |
| 401 after refresh | Refresh token missing/expired | Ensure `/api/auth/refresh` reachable and localStorage tokens kept |
| Port 5000 already in use | Stray Node process | `Get-Process node | Stop-Process -Force` (Windows) or `killall node` (macOS/Linux) |
| OTP emails not received | SendGrid sandbox or domain not verified | Verify sender in SendGrid dashboard, check spam folder |
| Frontend `npm run dev` exits 1 | Missing `.env` or backend offline | Check Vite logs, verify `VITE_API_URL`, ensure backend reachable |
| `Database table not available: alerts` | Table missing in MySQL | Set `RUN_DB_MIGRATIONS=true` in Render and redeploy, or run the provided SQL to create the table |
| FreeSQL connection timeout | Remote connections blocked | FreeSQL may not allow external access; migrate to Render MySQL or PlanetScale |
| Render build failures | Missing env vars or dependencies | Check Render logs, ensure all required env vars are set |
| Vercel build failures | API URL mismatch | Ensure `VITE_API_URL` points to Render backend URL |

---

## Demo

 (login, booking, referral, dashboard):

## demo video 

- [Insert demo video link]


---

## Documentation Pack

- `docs/API_SPEC.md` — endpoint catalogue with request/response contracts.
- `docs/DATA_DICTIONARY.md` — entity definitions & relationships.
- `docs/DB_SCHEMA.sql` — canonical schema and constraints.
- `docs/DB_SCHEMA_NEW.sql`, `docs/DB_SCHEMA_SIMPLE.sql` — alternative schema variants.
- `docs/SYSTEM_DESIGN.md` — architecture rationale & sequence diagrams.
- `docs/INSTALLATION.md` — extended platform-specific instructions.
- `docs/SENDGRID_SETUP.md` — email service onboarding steps.
- `docs/` (placeholder) — [Insert presentation/slide link here].
- `backend/` & `frontend/` directories include additional READMEs where applicable.

---



## Known Issues & Limitations

- Email delivery requires a valid SendGrid API key and verified sender.
- Geosearch depends on clinic coordinates; run the provided migration/seed to populate coordinates.
- No background job queue yet (email sending is synchronous); for production consider offloading to a worker.
- Mobile responsiveness audited for common breakpoints; comprehensive accessibility review pending.

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit with conventional messages: `git commit -m "feat: add amazing feature"`.
4. Push and open a Pull Request describing changes, tests, and screenshots when relevant.

---

## License

This project is licensed under the MIT License — see [`LICENSE`](LICENSE).

---

**NiaHealth** — Empowering communities through digital health solutions.
