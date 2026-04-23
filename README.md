# RCV — Self-Hosted Ranked Choice Voting

A lightweight, self-hosted web app for running ranked choice elections using Instant Runoff Voting (IRV).

## Features

- **Open elections listing** — anyone can browse and vote in active polls
- **Create elections** — add candidates, set a deadline, allow write-ins
- **Drag-to-rank ballot** — intuitive drag-and-drop interface
- **Admin dashboard** — manage candidates, configure settings, review ballots, close the election
- **Password-protected admin** — each election has its own isolated admin password
- **IRV results** — round-by-round elimination visualization
- **One vote per browser** — cookie-based deduplication (no accounts needed)

## Local Development

```bash
# Install dependencies
npm install

# Set up the database
npx prisma migrate dev --name init

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker (local)

```bash
# Copy env file
cp .env.example .env
# Edit COOKIE_SECRET in .env

docker-compose up
```

App will be available at [http://localhost:3000](http://localhost:3000). The SQLite database is persisted in `./data/rcv.db`.

## Deploying to Hostinger VPS

1. **SSH into your VPS** and install Docker + Docker Compose:
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo apt-get install -y docker-compose-plugin
   ```

2. **Clone the repo**:
   ```bash
   git clone https://github.com/your-username/rcv-app.git
   cd rcv-app
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Set a strong COOKIE_SECRET
   nano .env
   ```

4. **Start the app**:
   ```bash
   docker compose up -d
   ```

5. **(Optional) Nginx reverse proxy + SSL**:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```
   Then use Certbot: `sudo certbot --nginx -d yourdomain.com`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite path | `file:./data/rcv.db` |
| `COOKIE_SECRET` | Cookie signing secret — change this! | — |

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [Prisma](https://prisma.io/) + SQLite
- [Tailwind CSS](https://tailwindcss.com/)
- [@dnd-kit](https://dndkit.com/) for drag-and-drop
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) for password hashing

## License

MIT
