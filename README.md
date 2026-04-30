# Insighta Web Portal

A Next.js web portal for browsing and managing profiles enriched with predicted gender, age, and nationality data. Authentication is handled via GitHub OAuth.

## Features

- GitHub OAuth login
- Dashboard with profile statistics
- Profiles list with filters (gender, age group) and pagination
- Profile detail view with prediction confidence indicators
- Natural-language profile search
- CSV export
- Account management
- Role-based access (admin / analyst)

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Styling** — Tailwind CSS v4
- **HTTP** — Axios
- **Auth** — GitHub OAuth via HTTP-only cookies (BFF pattern)
- **CI** — GitHub Actions (lint + build on PR)

## Getting Started

### Prerequisites

- Node.js 20+
- The [Insighta API](https://github.com/hng14) running locally or deployed

### Environment

Create a `.env.local` file at the project root:

```env
BACKEND_URL=http://localhost:3000/api
```

> `BACKEND_URL` is server-only — never expose it with a `NEXT_PUBLIC_` prefix.

### Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

```
app/
  (protected)/        # Auth-gated pages (dashboard, profiles, search, account)
  api/                # BFF route handlers — proxy to backend, manage cookies
  callback/           # OAuth callback handler
  login/              # Login page
lib/
  axios.ts            # Client-side axios instances (public + private with refresh)
  backend.ts          # Server-only axios instance + cookie helpers
  types.ts            # Shared TypeScript types
components/
  sidebar.tsx         # Navigation sidebar
```

## Authentication Flow

1. User clicks **Continue with GitHub** → redirected to `/api/auth/login`
2. Backend handles the GitHub OAuth dance and redirects to `/callback?code=...`
3. Next.js exchanges the code for tokens via the backend and stores them as HTTP-only cookies
4. All subsequent API calls go through Next.js BFF route handlers — tokens never touch client JS

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |

## CI

GitHub Actions runs on every PR to `main`:
- ESLint
- `next build`
