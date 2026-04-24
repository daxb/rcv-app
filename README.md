# Ranked Choice Voting

A self-hosted web app for running ranked choice elections using Instant Runoff Voting (IRV). Built by [Verdant Coast LLC](https://verdantcoast.com).

Live at [rcv.verdantcoast.com](https://rcv.verdantcoast.com).

## Features

- **Open elections listing** — browse and vote in active public elections
- **Create elections** — add candidates, set a deadline, allow write-ins
- **Visibility control** — choose whether an election appears on the public listing or is accessible by direct link only
- **Voter password** — optionally require a password before voters can cast a ballot
- **Drag-to-rank ballot** — intuitive drag-and-drop ranking interface
- **Admin dashboard** — manage candidates, configure settings, review all ballots, open/close the election
- **Password-protected admin** — each election has its own isolated admin password shown once at creation
- **IRV results** — round-by-round elimination visualization; winner only revealed after the election closes
- **One vote per browser** — cookie-based deduplication, no accounts needed
- **Dark mode** — respects system preference, toggle in the nav

## Local Development

**Prerequisites:** Node.js 20+

```bash
# 1. Install dependencies
cd /path/to/rcv-app
npm install

# 2. Copy environment file and edit if needed
cp .env.example .env

# 3. Push the schema to the local database
npx prisma db push

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker (local)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
cp .env.example .env
# Edit COOKIE_SECRET in .env

docker-compose up --build
```

App runs at [http://localhost:3000](http://localhost:3000). The SQLite database is persisted in `./data/rcv.db`.

## Deploying to Hostinger Managed Node.js

This app is designed for Hostinger's managed Node.js hosting (or any Node.js platform that deploys from GitHub).

> **Important — Hostinger requires MySQL, not SQLite.** Hostinger's managed Node.js environment cannot run Prisma's SQLite engine (the native binary is incompatible with their Linux setup). You **must** use their managed MySQL database. See Step 2 below.

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push
```

### 2. Create a MySQL database on Hostinger

In the Hostinger dashboard: **Websites → your domain → Databases → Management**

- Enter a database name (e.g. `rcv`), a username (e.g. `rcvuser`), and a strong password.
- Click **Create**.
- Hostinger will prefix these with your account ID, e.g. `u123456789_rcv` / `u123456789_rcvuser`.
- The host is `localhost` and the port is `3306`.

### 3. Create a new Node.js app in Hostinger

- Import from GitHub, select the `rcv-app` repo
- Framework preset: **Next.js**
- Node version: **22.x**
- Branch: **main** (or master)

### 4. Set environment variables

In the Node.js app's environment variable settings, add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `mysql://u123456789_rcvuser:YOUR_PASSWORD@localhost:3306/u123456789_rcv` |
| `COOKIE_SECRET` | A long random string, e.g. `h8k2mq9xv3nt5rw7yp4jbc6uf1oa0eds` |

Replace the database name, username, and password with the values you set in Step 2.

### 5. Deploy

Click Deploy. The build script runs `prisma generate && prisma db push --accept-data-loss && next build`, which creates all database tables automatically before the app starts.

### Redeploying after code changes

```bash
git add .
git commit -m "Your change"
git push
```

Then click **Redeploy** in the Hostinger dashboard.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Path to the SQLite database file. Use an absolute path in production. |
| `COOKIE_SECRET` | Secret used to sign session cookies. Set a strong random value in production. |

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router, TypeScript)
- [Prisma](https://prisma.io/) + SQLite
- [Tailwind CSS](https://tailwindcss.com/)
- [@dnd-kit](https://dndkit.com/) — drag-and-drop ballot ranking
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) — password hashing

## How IRV Works

Instant Runoff Voting eliminates the last-place candidate each round and redistributes their votes to the next choice on each ballot. This repeats until one candidate holds a majority. The round-by-round breakdown is shown on the results page once the election closes.

## License

MIT — see [LICENSE](LICENSE).
