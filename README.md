# Devixo — Day 4: Code Generator

## Stack
Frontend: React (Vite) + Tailwind CSS + React Router + Framer Motion
Backend: Node.js + Express + PostgreSQL (raw SQL via `pg`)
AI: Groq (`openai/gpt-oss-120b`) — free tier, no credit card
Auth: JWT + bcrypt + email verification (Nodemailer/Gmail)

## Setup

### 1. Database
Create a Postgres DB (Neon recommended), then run `backend/src/db/schema.sql` once.

### 2. Backend
```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, EMAIL_USER/PASS, GROQ_API_KEY
npm install
npm run dev             # http://localhost:5000
```
- `GROQ_API_KEY` — free key from https://console.groq.com/keys
- `EMAIL_USER`/`EMAIL_PASS` — a Gmail address + App Password (https://myaccount.google.com/apppasswords), used to send verification emails to any signup address, not just your own

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

## What's built so far

**Day 1 — Auth & Dashboard shell**: signup/login, JWT, bcrypt, protected routes, PostgreSQL.

**Day 2 — AI Chat**: `/chat`, SSE streaming, conversations saved to DB, markdown + syntax-highlighted code blocks, search + date-grouped history (merged into the main sidebar), delete with confirmation.

**Day 3 — Code Review**: `/code-review`, paste code + pick a language, Groq returns structured JSON (bugs, security issues, performance suggestions, improvements, best practices) rendered as categorized cards with severity badges.

**Day 4 — Code Generator**: `/generate` (this update, see below).

Design: light monochrome theme (black/white/gray, no blue), Inter font, "Devixo" branding, animated 3D "D" logo, fixed-height app shell (Dashboard was removed — Chat is now the landing page after login).

---

# Day 4 — Code Generator

## What's new
- **`/generate`** page: pick a generator type from seven pills, describe what you need, click Generate
- **One backend endpoint** (`POST /api/generate`), a different system prompt per type — exactly per the original plan
- **Streams** the result via SSE (same pattern as Chat), rendered through the same `ChatMessage` component so you get syntax-highlighted code blocks, a Copy button, and the "no jank while streaming" fix from Day 2 for free

## The 7 generator types
| Type | Key | Output |
|---|---|---|
| React Component | `react-component` | Functional component, hooks, Tailwind classes |
| FastAPI Endpoint | `fastapi` | Route + Pydantic models |
| SQL Query | `sql` | A single query |
| Dockerfile | `dockerfile` | Production-ready, minimal |
| README | `readme` | Full README.md in a markdown block |
| Regex | `regex` | Pattern + explanation with examples |
| Explain Code | `explain` | Paste code in, get a plain-language walkthrough back |

## How it works
- `backend/src/services/generateService.js` — a `GENERATOR_TYPES` map of `{ label, system }`; `streamGenerate(type, prompt, onDelta)` picks the right system prompt and streams from Groq
- `POST /api/generate` — body `{ type, prompt }`, protected, streams SSE `data:` chunks + a final `event: done`
- `GET /api/generate/types` — returns the list of types (not currently used by the frontend, which hardcodes the same list for instant render, but available if you want to drive the UI from the backend instead)
- No database persistence — stateless like Code Review, not saved like Chat conversations
- Frontend: `frontend/src/api/generateStream.js` mirrors `chatStream.js`'s fetch+ReadableStream SSE parsing

## Next (Day 5)
Bug Fixer — paste an error message, stack trace, and code; get back root cause, fixed code, and an explanation.

---

# Day 5 — Bug Fixer

## What's new
- **`/bugfix`** page: three inputs — error message, stack trace (optional), code — plus a language picker
- Groq returns structured JSON (like Code Review): **Root Cause**, **Fixed Code** (syntax-highlighted, with Copy), **Explanation**
- Any single input is enough to submit — you don't need all three, matching real debugging (sometimes you only have a stack trace, sometimes only code)
- "Try a sample" loads a classic `undefined` bug so you can see it work immediately

## How it works
- `POST /api/bugfix` — body `{ errorMessage, stackTrace, code, language }`, protected, non-streaming (same reasoning as Code Review: a small structured JSON response is easier to render into clean sections than a stream)
- `backend/src/services/bugfixService.js` sends whatever inputs were provided to Groq with a strict JSON schema prompt, defensively parses the response
- Stateless — no DB persistence, consistent with Code Review and Code Generator
- Input capped at 20,000 characters combined across all three fields

## Next (Day 6)
Polish — dark mode, animations, loading skeletons, toast notifications, responsive design, typography pass.

---

# Day 6 — Polish

## What's new
- **Dark mode toggle** — button at the bottom of the sidebar, persists to localStorage. Implemented as a `.dark` class on `<html>` with global CSS overrides in `index.css` rather than hand-editing `dark:` variants across every component (the app's strict grayscale palette maps cleanly onto this). Code blocks intentionally stay light in both modes, same as most editors.
- **Toast notifications** — new `ToastContext`/`useToast()`, top-right stack, auto-dismiss. Wired into: profile save, conversation delete, and AI-call errors across Code Review, Code Generator, and Bug Fixer (in addition to their existing inline error text).
- **Loading skeletons** — sidebar conversation list while first fetching, and pulsing message-bubble placeholders when opening an existing chat (replaces the old plain "Loading..." text).
- **Animations** — new messages, chat, and result panels in Code Review/Code Generator/Bug Fixer fade-in on arrival (`animate-fade-in-up`, already defined, now actually used everywhere it fits).
- **Responsive sidebar** — this was the real gap before: the sidebar was `fixed width, always visible`, which breaks on mobile. It's now a proper off-canvas drawer below the `lg` breakpoint: hamburger button to open, backdrop + swipe-away-by-tap to close, auto-closes on navigation. This one component change makes every page in the app responsive, since they all share `<Sidebar />`.

## Notes
- Dark mode intentionally stays a **toggle**, not a replacement for the light theme — light remains the default given how much back-and-forth went into landing on it.
- The dark-mode CSS-override approach is a deliberate trade-off: much less code than per-component `dark:` classes, but it means new components should stick to the existing gray-scale utility classes (`bg-white`, `text-gray-500`, etc.) to pick up dark mode automatically — introducing new one-off colors would need a matching override added to `index.css`.

## Next (Day 7)
Deploy — Vercel (frontend), Render/Railway/Fly.io (backend), Neon (already in use). Plus README, screenshots, demo video, portfolio page.
