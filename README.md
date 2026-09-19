# Devixo

A full stack AI development solution that combines chat, code review, code generation, and bug fixing in one seamless workspace.

## Features

- **AI Chat** — streaming conversations with markdown rendering, syntax-highlighted code blocks, file attachments, saved history with search and date grouping.
- **Code Review** — paste code and get back structured feedback: bugs, security issues, performance suggestions, improvements, and best practices, each with a severity level.
- **Code Generator** — seven generator types (React component, FastAPI endpoint, SQL query, Dockerfile, README, regex, code explanation), each with its own tuned prompt.
- **Bug Fixer** — paste an error message, stack trace, and/or code (any one is enough) and get back the root cause, a fixed version of the code, and a plain-language explanation.
- **Auth** — signup/login with JWT, bcrypt password hashing, and email verification (with resend support).
- **Dark mode** — toggle in the sidebar, persisted across sessions.
- **Responsive** — off-canvas sidebar on mobile, fixed-height app shell on desktop.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router, Framer Motion |
| Backend | Node.js, Express, PostgreSQL (raw SQL via `pg`) |
| AI | [Groq](https://groq.com) (`openai/gpt-oss-120b`) |
| Auth | JWT, bcrypt, email verification via Nodemailer |
| Database | PostgreSQL ([Neon](https://neon.tech) recommended) |
| Hosting | Vercel (frontend + backend) |

## Project Structure

```
devpilot-ai7/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers (auth, chat, generate, review, bugfix)
│   │   ├── models/         # Database queries
│   │   ├── routes/         # Express route definitions
│   │   ├── services/       # AI prompt logic per feature
│   │   ├── config/         # Mailer, DB connection
│   │   └── server.js       # App entry point
│   ├── vercel.json
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/           # One component per route
    │   ├── components/      # Shared UI (Sidebar, ChatInput, ChatMessage, Logo)
    │   ├── context/          # Auth and theme state
    │   └── api/              # Axios instance + SSE stream helpers
    └── package.json
```

## Local Setup

### 1. Database

Create a PostgreSQL database (Neon's free tier works well), then run the schema once:

```bash
psql <your-connection-string> -f backend/src/db/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # fill in the values below
npm install
npm run dev             # http://localhost:5000
```

Required environment variables:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `JWT_SECRET` | Any long random string — generate one with `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | e.g. `7d` |
| `EMAIL_USER` | A Gmail address used to send verification emails |
| `EMAIL_PASS` | A [Gmail App Password](https://myaccount.google.com/apppasswords) — not your regular password |
| `GROQ_API_KEY` | Free key from [console.groq.com/keys](https://console.groq.com/keys) |
| `CLIENT_URL` | Frontend origin, for CORS — `http://localhost:5173` locally |

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

Required environment variable:

| Variable | Notes |
|---|---|
| `VITE_API_URL` | Backend base URL — `http://localhost:5000/api` locally |

## Deployment

Both frontend and backend deploy to Vercel from the same repository, as two separate projects with different **Root Directory** settings (`backend` and `frontend`).

1. Push this repo to GitHub.
2. Import it into Vercel twice — once with Root Directory `backend`, once with `frontend`.
3. Add the environment variables from the tables above to each project (using each project's public deployment URL for `CLIENT_URL` and `VITE_API_URL` once both are live).
4. Redeploy the backend after setting `CLIENT_URL`, since environment variable changes require a fresh deploy to take effect.

`backend/vercel.json` configures the Express app to run as a Vercel serverless function with a 60-second timeout, since AI responses can take a while to fully stream.

