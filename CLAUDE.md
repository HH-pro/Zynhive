# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev          # Start dev server (http://localhost:5173)
yarn build        # Type-check + production build (tsc && vite build)
yarn preview      # Serve production build locally
yarn lint         # ESLint with zero warnings allowed
```

No test suite is configured.

## Environment Variables

All secrets live in `.env` (never committed). Required keys:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_CLOUDINARY_CLOUD_NAME
VITE_CLOUDINARY_UPLOAD_PRESET
```

## Architecture

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Firebase (Auth + Firestore) + Cloudinary

### Routing

Custom hash-less SPA router in `src/App.tsx` using `pushState` + `popstate`. No React Router. Currently only two active routes: `/` → `HomePage`, `/admin` → `AdminPage`. Other pages (Services, Portfolio, About, Team, Contact) are implemented but commented out pending re-activation. `vercel.json` rewrites all paths to `/` for client-side routing.

### Auth Flow

`src/pages/admin/AdminPage.tsx` is the auth gate: it uses `useAuth` hook → shows `AdminLogin` if unauthenticated, `AdminDashboard` if authenticated. Firebase Email/Password auth only. `useAuth` (`src/hooks/useAuth.ts`) wraps `onAuthStateChanged`.

### Admin Dashboard

`src/pages/admin/AdminDashboard.tsx` is a tabbed interface with four tabs:
- **projects** — CRUD for portfolio projects via `ProjectForm`
- **leads** — Full CRM via `LeadTab` (the most complex feature)
- **team** — CRUD for team members via `TeamTab`
- **analytics** — (tab exists, content TBD)

### Data Layer

All Firestore operations are centralized in two files:
- `src/lib/firebase.ts` — projects (`projects` collection), team members (`team` collection), and basic lead ops
- `src/lib/lead-firebase.ts` — extended lead CRM operations with back-compat field mapping

Cloudinary image upload uses unsigned upload preset via XHR directly (no SDK). Deletion requires a signed server endpoint (currently a no-op with console.warn).

### Leads CRM

The leads feature (`src/components/admin/Leadtab.tsx` and `src/components/admin/leads/`) is the most complex subsystem:
- Types in `src/types/leads.ts`; constants in `src/lib/lead-constants.ts`
- AI-powered features via `src/lib/lead-ai.ts` and `src/api/ai/generate.ts`
- Google Maps scraping in `src/lib/maps-scraper.ts`
- Email composition via `src/components/admin/leads/ComposeEmailModal.tsx`
- Follow-up queue, analytics, and detail panel as separate components

### Theming

CSS custom properties defined in `index.css` (not tracked here). Theme toggled via `data-theme` attribute on `<html>`. Admin dashboard has its own theme persistence in `localStorage` under `"admin-theme"`. Public site theme uses `useTheme` hook from `src/hooks/index.ts`.

### Navbar/Footer

Currently disabled in `App.tsx` (commented out) — the app is in a "testing phase" showing only `HomePage` and the admin panel.
