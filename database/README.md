# MyWeb MySQL setup

1. Copy `.env.example` to `.env` and fill in your local MySQL account.
2. Log in to MySQL and run `database/init.sql`.
3. Start the API server:

```bash
npm run dev:server
```

4. Check the connection:

```bash
curl http://localhost:4000/api/health
```

Useful endpoints:

- `GET /api/content`
- `GET /api/content/photos`
- `GET /api/content/games`
- `GET /api/content/projects`
- `GET /api/content/music-tracks`
- `GET /api/content/skills`
- `GET /api/guestbook`
- `POST /api/guestbook`
