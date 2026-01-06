# Kyokushin-Kai

Full-stack Kyokushin Karate training app (techniques, training sessions, flashcards, games).

## Quick Start (Local)

```bash
bun install

# API env (.dev.vars used by wrangler dev)
# GOOGLE_CLIENT_ID, JWT_SECRET, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET,
# FACEBOOK_REDIRECT_URI, FACEBOOK_GRAPH_VERSION, AUTH_COOKIE_SECRET
# Optional: ADMIN_EMAIL, ALLOWED_ORIGINS

# Vite env (.env)
# VITE_GOOGLE_CLIENT_ID, VITE_API_BASE_URL

bun run db:dev:migrate
bun run dev:all
```

Access: http://localhost:3000 (frontend) and http://localhost:8787 (API)

## Tech Stack

- Frontend: React 19, Vite 6, MUI v6, TypeScript 5.8 (HashRouter)
- Backend: Cloudflare Workers, Hono 4.10
- Database: Cloudflare D1 (SQLite)
- Auth: Google + Facebook OAuth, custom JWT + refresh tokens

## Project Shape

```
src/
  react-app/        # SPA, routes in App.tsx
  data/             # Models + repositories (catalog.json static curriculum)
  worker/           # Hono API, D1 migrations
```

Key files: `src/react-app/App.tsx`, `src/react-app/components/context/AuthContext.tsx`,
`src/worker/index.ts`, `src/worker/migrations/`.

## Auth + Account Linking Summary

- Google login: ID token -> custom JWT (1h) + refresh token (30d).
- Facebook login: OAuth code + PKCE, server-side token exchange.
- Facebook mobile app switching can drop the OAuth tx cookie; callback falls back to the OAuth `state`.
- Providers stored in `identities` with `pending_links` for collisions and `oauth_transactions`
  for Facebook.
- Linking/unlinking: `/api/v1/auth/link/:provider` + consume endpoints.
- Merge: `/api/v1/auth/link/google` with `merge: true` returns new login tokens and merges data.
- Unlink is blocked when the provider is the last remaining identity.
- Account UI shows last activity + active session count via `/api/v1/account/sessions` (refresh tokens).

Full details: `docs/auth/README.md`.

## Mobile Webview Note (Facebook)

Meta's manual login flow redirects back to the same user agent via `redirect_uri`. If the flow
starts inside an in-app browser (Facebook/Instagram), the redirect can land in a separate webview
session and the original tab will not receive the callback. For web use, require the system
browser (Safari/Chrome). For embedded webviews, Meta notes that `redirect_uri` must be
`https://www.facebook.com/connect/login_success.html` and the container app must capture the
result. See: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow/

## Admin + Catalog Seeding

- Set `ADMIN_EMAIL` to seed first admin.
- Admin route: `/#/admin`.
- Techniques, grades, katas, quotes, and mottos are stored in D1 and managed via the Admin Console.
- Seed scripts live in `package.json` and `scripts/*.cjs`.

## Database Notes

- Content tables: `techniques`, `grades`, `katas`, `quotes`, `mottos`, `grade_techniques`, `grade_katas`.
- Auth tables: `user_settings`, `user_roles`, `identities`, `refresh_tokens`,
  `oauth_transactions`, `oauth_login_codes`, `pending_links`, `rate_limits`.
- Migrations: `src/worker/migrations/*.sql`.
- Commands: `bun run db:dev:migrate`, `bun run db:prod:migrate`.

## Scripts

- `bun run dev:all` (frontend + API), `bun run dev`, `bun run dev:api`
- `bun run build`, `bun run deploy`, `bun run lint`, `bun run test`

## Deployment (High Level)

```bash
bun run db:prod:migrate
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put JWT_SECRET
bun run build
bun run deploy
```
