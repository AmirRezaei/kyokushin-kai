# Authentication

Authentication supports Google + Facebook OAuth with custom JWT access tokens and refresh tokens.

## Documents

- `docs/auth/jwt-implementation-review.md`
- `docs/auth/security-review.md`
- `docs/auth/jwt-secret-setup.md`

## Core Tokens

- Access token (custom JWT, 1h)
- Refresh token (30d, stored hashed in D1, issued via httpOnly cookie; refresh/logout use cookie)

## Email Matching

- Emails are normalized to lowercase in `user_settings` for collision detection and merges.

## Tables

- `identities` (provider links)
- `refresh_tokens` (session refresh)
- `oauth_transactions` (Facebook PKCE login/link)
- `oauth_login_codes` (Facebook login handoff)
- `pending_links` (collision/link handoff)
- `rate_limits` (auth throttling)
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
- `GET /api/v1/auth/facebook/start?mode=login&returnTo=/path`
- `POST /api/v1/auth/facebook/start` (link mode; requires Authorization header)
- `GET /api/v1/auth/facebook/callback`
- `POST /api/v1/auth/facebook/consume`
- `POST /api/v1/auth/link/facebook/consume`
- `DELETE /api/v1/auth/link/facebook`

## Login Flow (Google)

1. Client gets Google ID token.
2. `POST /api/v1/auth/login` verifies token, issues JWT, and sets refresh cookie.
3. On email collision, backend returns `409` with `{ mergeRequired, code, email }`.
4. Client routes to `/#/link/google?code=...&collision=true&email=...`.
5. User signs in with Facebook to prove ownership, then consumes the link.
6. If Google was previously unlinked but another provider remains, the flow follows the same collision path.

## Login Flow (Facebook)

1. Client hits `/api/v1/auth/facebook/start?mode=login&returnTo=/...`.
2. Facebook returns to `/api/v1/auth/facebook/callback`.
3. Worker redirects to `/#/link/facebook?loginCode=...`.
4. `FacebookCallbackPage` calls `POST /api/v1/auth/facebook/consume` with `{ code }`.
5. Worker returns tokens + returnTo; client stores the session and navigates to `returnTo`.
6. If the Facebook app switches browsers on mobile and drops the tx cookie, the callback falls back to
   matching by OAuth `state` to complete the flow.

## Mobile Webview Caveat (Facebook)

- Meta's manual Login Dialog flow redirects back to the same user agent via `redirect_uri` and
  requires the URI to be registered in **Valid OAuth Redirect URIs**. The same `redirect_uri` must
  be used during the token exchange.
- If the flow runs inside an in-app browser (Facebook/Instagram), the redirect can land in a
  separate webview session and the original tab will not receive the callback. For web use, require
  the system browser (Safari/Chrome). For embedded webviews, Meta notes that `redirect_uri` must be
  `https://www.facebook.com/connect/login_success.html` and the container app must capture the
  result.
- Reference: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow/

## Linking Flow

- Google link: use Google Identity token, `POST /api/v1/auth/link/google`.
- Facebook link: `POST /api/v1/auth/facebook/start` with `{ mode: "link", returnTo: "/account" }`,
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
