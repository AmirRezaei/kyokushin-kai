# Authentication

Authentication supports Google + Facebook OAuth with custom JWT access tokens and refresh tokens.

## Documents

- `docs/auth/jwt-implementation-review.md`
- `docs/auth/security-review.md`
- `docs/auth/jwt-secret-setup.md`

## Core Tokens

- Access token (custom JWT, 1h)
- Refresh token (30d, stored hashed in D1)

## Tables

- `identities` (provider links)
- `refresh_tokens` (session refresh)
- `oauth_transactions` (Facebook PKCE login/link)
- `pending_links` (collision/link handoff)
- `user_settings`, `user_roles`

## Key Endpoints

Google:
- `POST /api/v1/auth/login` (Google ID token -> JWT + refresh)
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/link/google` (link; merge with `merge: true`)
- `POST /api/v1/auth/link/google/consume` (consume pending link)
- `DELETE /api/v1/auth/link/google`

Facebook:
- `GET /api/v1/auth/facebook/start?mode=login|link&returnTo=/path`
- `GET /api/v1/auth/facebook/callback`
- `POST /api/v1/auth/link/facebook/consume`
- `DELETE /api/v1/auth/link/facebook`

## Login Flow (Google)

1. Client gets Google ID token.
2. `POST /api/v1/auth/login` verifies token and issues JWT + refresh token.
3. On email collision, backend returns `409` with `{ mergeRequired, code, email }`.
4. Client routes to `/#/link/google?code=...&collision=true&email=...`.
5. User signs in with Facebook to prove ownership, then consumes the link.

## Login Flow (Facebook)

1. Client hits `/api/v1/auth/facebook/start?mode=login&returnTo=/...`.
2. Facebook returns to `/api/v1/auth/facebook/callback`.
3. Worker issues tokens and redirects to `/#/link/facebook?...` with:
   `accessToken`, `refreshToken`, `expiresIn`, `userId`, `email`, `role`, `providers`, `returnTo`.
4. `FacebookCallbackPage` stores the session and navigates to `returnTo`.

## Linking Flow

- Google link: use Google Identity token, `POST /api/v1/auth/link/google`.
- Facebook link: `/api/v1/auth/facebook/start?mode=link&returnTo=/account`,
  then `POST /api/v1/auth/link/facebook/consume`.
- Collisions create `pending_links` and redirect to `/#/link/google` or `/#/link/facebook`
  to complete the link after the user signs in with the existing provider.

## Merge Flow

- `POST /api/v1/auth/link/google` with `{ token, merge: true }` merges accounts.
- Merge moves settings, roles, progress, identities, and issues fresh tokens.
- UI prompts before merge; on success it updates the client session.

## Unlink Rules

- `DELETE /api/v1/auth/link/:provider` removes the identity.
- Unlinking the last provider returns `400` and is blocked.
- Google identity is only backfilled if no identities exist.

## Frontend Entry Points

- `/#/login` (official Google button)
- `/#/link/google` (collision/consume)
- `/#/link/facebook` (collision/consume + token redirect)
- `/#/account` (link/unlink UI)

## Environment (API)

```
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
FACEBOOK_REDIRECT_URI=...
FACEBOOK_GRAPH_VERSION=v19.0
AUTH_COOKIE_SECRET=...
```
