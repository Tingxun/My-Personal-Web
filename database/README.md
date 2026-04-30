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

LAN preview:

```bash
npm run dev:server
npm run dev:lan
```

The API server prints the current LAN URLs on startup, such as `http://192.168.1.23:4000`.
Users on the same WLAN should open the Vite URL printed by `npm run dev:lan`, usually `http://192.168.1.23:5173`.

Useful endpoints:

- `GET /api/content`
- `GET /api/content/photos`
- `GET /api/content/games`
- `GET /api/content/projects`
- `GET /api/content/music-tracks`
- `GET /api/content/skills`
- `GET /api/guestbook`
- `POST /api/guestbook`
