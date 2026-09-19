# Devixo

A full stack AI development solution that combines chat, code review, code generation, and bug fixing in one seamless workspace.

## Features

Devixo brings four tools together in one workspace. AI Chat supports streaming conversations with markdown rendering, syntax-highlighted code blocks, file attachments, and saved history with search and date grouping. Code Review takes pasted code and returns structured feedback covering bugs, security issues, performance suggestions, and best practices, each with a severity level. Code Generator offers seven generator types — React components, FastAPI endpoints, SQL queries, Dockerfiles, READMEs, regex patterns, and code explanations — each with its own tuned prompt. Bug Fixer takes an error message, stack trace, and/or code (any one is enough) and returns the root cause, a fixed version of the code, and a plain-language explanation.

Authentication uses JWT with bcrypt password hashing and email verification with resend support. The app includes a dark mode toggle that persists across sessions, and a responsive layout with an off-canvas sidebar on mobile.

## Tech Stack

The frontend is built with React (Vite), Tailwind CSS, React Router, and Framer Motion. The backend runs on Node.js and Express, using PostgreSQL for storage via raw SQL through the `pg` library. AI responses come from Groq, running the `openai/gpt-oss-120b` model. Email verification is sent through Nodemailer, and both frontend and backend deploy to Vercel.

## Project Structure

Backend code lives under `backend/src`, organized into controllers for request handling, models for database queries, routes for Express endpoints, services for AI prompt logic per feature, and config for the mailer and database connection, with `server.js` as the entry point. Frontend code lives under `frontend/src`, with one component per route in `pages`, shared UI like the sidebar and chat components in `components`, auth and theme state in `context`, and the API client and streaming helpers in `api`.

## Local Setup

Create a PostgreSQL database — Neon's free tier works well — then run the schema once:

```bash
psql <your-connection-string> -f backend/src/db/schema.sql
```

Set up the backend:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

The backend needs a `DATABASE_URL` connection string, a `JWT_SECRET` (any long random string, generated with something like `openssl rand -hex 32`), `JWT_EXPIRES_IN` (e.g. `7d`), a Gmail address and App Password as `EMAIL_USER`/`EMAIL_PASS` for sending verification emails, a free `GROQ_API_KEY` from console.groq.com/keys, and `CLIENT_URL` set to the frontend's origin for CORS.

Set up the frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The frontend needs `VITE_API_URL` pointing to the backend's base URL, with `/api` at the end.

## Deployment

Both frontend and backend deploy to Vercel from the same repository, as two separate projects with different Root Directory settings — `backend` and `frontend`. Push the repo to GitHub, import it into Vercel twice with those root directories, and add the environment variables described above to each project, using each project's live deployment URL for `CLIENT_URL` and `VITE_API_URL` once both are up. The backend needs a redeploy after `CLIENT_URL` is set, since environment variable changes only take effect on the next deploy.

`backend/vercel.json` configures the Express app to run as a Vercel serverless function with a 60-second timeout, since AI responses can take a while to fully stream.

