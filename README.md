# CITBIF

Web app for a startup incubation program. Founders sign up, complete a **profile wizard**, and use a **dashboard** once an admin **approves** their application. Admins **review** startups, manage **mentors**, **investors**, and **events**, and browse **documents**. Everything persists in **MongoDB**; the UI is **React + TypeScript** (Vite) and talks to an **Express** API in `server/`.

**Flow in short:** Home (`/`) shows a short splash, then **Login**. Saving profile data can update the linked **Startup** record for admin views; founders change **stage** (idea → scale) in **Settings**.

---

## What you can do

**As a founder** — Wizard (personal, company, incubation, files, pitch, funding), then overview, data room, mentors (incl. session requests), investors (intro requests), calendar, pitch deck, fundraising, settings. Pending or rejected applications see a gate screen instead of the full dashboard.

**As an admin** — Dashboard, **Review** (list + detail + approve/reject), startup management, data room, mentor/investor/event management, notifications. List data can refresh on a timer and when you return to the tab.

**Cross-cutting** — File uploads go to `server/uploads` (Multer); metadata in MongoDB. **Mentor session** emails use Nodemailer when SMTP env vars are set; otherwise the API may log the intent and still respond without sending mail.

---

## Stack

- **Frontend:** React 18, TypeScript, Vite, React Router, Tailwind, Framer Motion, Lucide; API via `fetch` in `src/services/`.
- **Backend:** Node, Express, Mongoose, bcryptjs, Multer, dotenv, cors, Nodemailer.
- **Auth:** Login/signup against `/api/auth/*`; the client keeps the user in **localStorage** (`AuthContext`). Treat as dev-friendly; harden for production as you deploy.

---

## Prerequisites

Node.js 18+, npm, and a running **MongoDB** (local or Atlas).

---

## Run locally

1. **Clone**

   ```bash
   git clone https://github.com/nes268/CITBIF.git
   cd CITBIF
   ```

2. **`server/.env`**

   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/citbif
   ```

   Optional mail (e.g. Gmail):

   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=...
   SMTP_PASS=...
   ```

   (`EMAIL_USER` / `EMAIL_PASSWORD` are also read in code paths.)

3. **Root `.env`**

   ```
   VITE_API_URL=http://localhost:5000
   ```

   No trailing slash. Match the port to `PORT`.

4. **Install** — `cd server && npm install`, then from repo root `npm install`.

5. **Start API** — `cd server && npm start` (or `npm run dev` for `node --watch`). Check `GET /api/health`.

6. **Start UI** — from root, `npm run dev`. Open the URL Vite prints (often port **5173**).

Optional: from `server/`, `npm run test-connection` or `npm run seed-admin` if you use those scripts.

---

## Accounts

Sign up as **Admin** or **User**. Admins land in `/admin/...`. Users finish the **profile wizard**; after approval they use `/dashboard/...`.

---

## API

All routes are under `/api` in **`server/index.js`**. Front-end callers live in **`src/services/*.ts`**. Areas include auth, profiles, startups (including approve, reject, phase), documents, mentors, investors, events, reports, notifications.

---

## Repo layout

- **`server/`** — `index.js`, `uploads/`, `package.json`
- **`src/`** — `components/` (auth, dashboard, profile, layout, ui), `context/`, `hooks/`, `services/`, `types/`, `App.tsx`, `main.tsx`
- **`public/`** — Static assets (e.g. favicon)

---

## Production

Set `VITE_API_URL` when you run `npm run build`. Serve the `dist/` folder over HTTPS. Tighten CORS, secrets, and server-side checks on protected actions.

---

## Troubleshooting

API/CORS or blank UI: confirm `VITE_API_URL`, API running, and browser console. Mongo: check `MONGODB_URI` and that the service is reachable. Port clash: change `PORT` and `VITE_API_URL` together.

---

## License

ISC (see `server/package.json`).

## Contributing

Fork, branch, open a PR with a short description of changes and any new env vars or routes.
