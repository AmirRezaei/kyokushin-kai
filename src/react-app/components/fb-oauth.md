You are a senior engineer. Implement **Facebook Login** for an existing **React + Cloudflare Workers (module syntax) + D1 (SQLite)** app. The app already supports **Google OAuth** and has an existing **app session** mechanism (cookie-based or equivalent). Follow **Meta/Facebook documentation** for the login flow, server-side token validation, and securing server-to-server Graph API calls. ([Facebook Developers][1])

## Non-negotiable product and security requirements

1. **Never** link/merge accounts by email (no heuristics, no exceptions).
2. A user can sign in with Facebook **only if** an explicit identity link exists in DB: `(provider='facebook', provider_user_id) -> user_id`.
3. If a Facebook identity is **not linked**, do **not** create a user automatically. Route to an **ownership-proof link flow**: user must sign in to an existing account method (Google) and then explicitly link Facebook.
4. If user is already signed in, they may link Facebook to the current account.
5. Enforce uniqueness: one Facebook identity can link to **only one** user. Conflicts return **409**.
6. Use Authorization Code flow and include **`state`**. Implement **PKCE (S256)**. Meta documents Facebook Login support for OIDC Authorization Code flow with PKCE; do not implement “half-OIDC”. ([Facebook Developers][2])
7. Treat Facebook access tokens as opaque; **validate server-side** using **Graph API `/debug_token`** and ensure tokens are for **your app**. Meta notes the `input_token` and the authorizing `access_token` must be from the **same app**. ([Facebook Developers][3])
8. Secure server-to-server Graph API requests with **`appsecret_proof`** (HMAC-SHA256 of the access token used to authorize the call, keyed by the app secret) as Meta recommends. ([Facebook Developers][4])
9. Do not store Facebook tokens in `localStorage`. Do not log tokens or secrets.
10. Prevent open redirects: `returnTo` must be **relative-only** (starts with `/` and must not contain `://` or `//`). Re-validate before every redirect.

## Explicit OIDC decision (must be explicit in implementation)

- Default: **Do not use/consume ID tokens**. Implement classic server-side flow: `code -> user access token -> /debug_token validation -> provider_user_id`.
- If you choose to request/consume OIDC ID tokens, you **must** implement full OIDC validation (nonce, signature, iss/aud/exp, etc.). Do not accept any ID token without validation. ([Facebook Developers][2])

## Cloudflare/Wrangler configuration (secrets + environments)

Use Wrangler secrets (rotated/published during CI/CD build/deploy; never committed). Cloudflare documents secrets and local `.dev.vars` usage. ([Cloudflare Docs][5])
Secrets to define per environment:

- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `FACEBOOK_REDIRECT_URI` (exact callback URL registered in Meta dashboard)
- `FACEBOOK_GRAPH_VERSION` (e.g., `vXX.X`)
- `AUTH_COOKIE_SECRET` (key for signing/encrypting cookies)

## D1 schema (migrations required)

Create D1 migrations using Cloudflare’s migration workflow. ([Cloudflare Docs][6])

### Table: `identities`

- `id TEXT PRIMARY KEY`
- `user_id TEXT NOT NULL`
- `provider TEXT NOT NULL` -- 'google' | 'facebook' | ...
- `provider_user_id TEXT NOT NULL`
- `created_at INTEGER NOT NULL`
- `updated_at INTEGER NOT NULL`
  Constraints / indexes:
- `UNIQUE(provider, provider_user_id)`
- `CREATE INDEX idx_identities_user_id ON identities(user_id);`

### Table: `oauth_transactions` (ephemeral; TTL ~ 10 minutes)

Purpose: store `state` + `pkce_verifier` server-side. Cookie stores only opaque tx id.

- `id TEXT PRIMARY KEY`
- `provider TEXT NOT NULL` -- 'facebook'
- `state TEXT NOT NULL`
- `pkce_verifier TEXT NOT NULL`
- `mode TEXT NOT NULL` -- 'login' | 'link'
- `return_to TEXT NOT NULL`
- `created_at INTEGER NOT NULL`
- `expires_at INTEGER NOT NULL`
- `consumed_at INTEGER NULL`
  Indexes:
- `CREATE INDEX idx_oauth_tx_expires ON oauth_transactions(expires_at);`
- `CREATE INDEX idx_oauth_tx_provider_state ON oauth_transactions(provider, state);`

### Table: `pending_links` (ephemeral; TTL ~ 10 minutes)

- `code TEXT PRIMARY KEY`
- `provider TEXT NOT NULL` -- 'facebook'
- `provider_user_id TEXT NOT NULL`
- `return_to TEXT NOT NULL`
- `expires_at INTEGER NOT NULL`
- `consumed_at INTEGER NULL`
  Indexes:
- `CREATE INDEX idx_pending_links_expires ON pending_links(expires_at);`
- `CREATE INDEX idx_pending_links_provider_user ON pending_links(provider, provider_user_id);`
  Uniqueness rule:
- Prefer a **partial unique index** (SQLite supports it) to ensure only one active pending link per identity:
  - `CREATE UNIQUE INDEX uq_pending_links_active_identity ON pending_links(provider, provider_user_id) WHERE consumed_at IS NULL;`

- If partial indexes are not feasible in your environment, enforce the same rule transactionally in code.

## D1 atomicity requirement

When you need multi-statement atomic writes (e.g., create pending link + mark tx consumed), use **`D1Database::batch()`**. Cloudflare documents that batched statements are executed as a SQL transaction and roll back the entire sequence if a statement fails. ([Cloudflare Docs][7])

## Helper requirements (must implement correctly)

### PKCE (RFC 7636)

- `code_verifier`: high-entropy cryptographic random string using unreserved characters `[A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"`; length **43–128** characters. ([IETF Datatracker][8])
- `code_challenge = BASE64URL( SHA256(code_verifier) )` with **no padding**, method `S256`. ([IETF Datatracker][8])

### `appsecret_proof` (Meta Secure Requests)

For any server-to-server Graph call, compute:

- `appsecret_proof = HMAC_SHA256( access_token_used_to_authorize_that_graph_call, FACEBOOK_APP_SECRET )` ([Facebook Developers][4])
  IMPORTANT:
- If a Graph request is authorized by an **app access token**, compute `appsecret_proof` from that **app access token**.
- If authorized by a **user access token**, compute `appsecret_proof` from that **user access token**.

### returnTo validation

- Accept only relative paths starting with `/`.
- Reject if contains `://` or starts with `//`.
- Store the validated `returnTo` server-side (DB) and treat DB as source of truth; do not trust a client-provided `returnTo` later.

## Cookie requirements (oauth tx cookie)

Prefer a `__Host-` cookie prefix for strongest host-only semantics, following cookie prefix rules: `Secure`, **`Path=/`**, and no `Domain` attribute. ([MDN Web Docs][9])

- Name: `__Host-fb_oauth_tx`
- Attributes: `Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`
- Value: only the opaque `oauth_transactions.id`
- Must be tamper-proof: **sign and preferably encrypt** using `AUTH_COOKIE_SECRET`
- Clear it on completion and on any error path.

## Backend routes (Workers)

### 1) `GET /auth/facebook/start?mode=login|link&returnTo=/path`

- Validate `mode ∈ {login, link}`.
- Validate `returnTo` (relative-only). Default `/`.
- If `mode=link`: require authenticated app session; if not logged in, redirect to login UI.
- Generate: `state`, `code_verifier`, `code_challenge` (S256).
- Insert `oauth_transactions` with TTL ~10 minutes.
- Set cookie `__Host-fb_oauth_tx=<tx_id>` (signed/encrypted).
- Redirect to Meta authorization endpoint (manual flow). The redirect URL must match the Meta app configuration exactly. ([Facebook Developers][1])
  Include query params:
  - `client_id=FACEBOOK_APP_ID`
  - `redirect_uri=FACEBOOK_REDIRECT_URI`
  - `response_type=code`
  - `state=<state>`
  - `code_challenge=<code_challenge>`
  - `code_challenge_method=S256`
  - `scope` minimal (do not request email; for identity you only need basic profile)

### 2) `GET /auth/facebook/callback`

- If callback includes `error`, `error_description`, or `error_reason`:
  - clear `__Host-fb_oauth_tx`
  - redirect to login UI with a safe, non-sensitive error code

- Otherwise require `code` and `state`.
- Load tx id from cookie; fetch `oauth_transactions`.
- Validate:
  - exists, provider=facebook
  - not expired (`expires_at >= now`)
  - not consumed (`consumed_at IS NULL`)
  - state matches exactly

- Exchange `code` for a **user access token** via Meta token endpoint (server-to-server), including:
  - `client_id`, `client_secret`, `redirect_uri`, `code`, `code_verifier`
    (Use the documented token exchange step for the manual flow. ([Facebook Developers][1]))

#### Token validation (mandatory): Meta `/debug_token`

- Call Graph `/debug_token` with:
  - `input_token=<USER_ACCESS_TOKEN>`
  - `access_token=<VALID_ACCESS_TOKEN_FROM_THE_SAME_APP>` (use an app access token or another valid token for your app; Meta requires same-app association) ([Facebook Developers][3])
  - `appsecret_proof=<HMAC_SHA256(access_token_param_value, FACEBOOK_APP_SECRET)>` ([Facebook Developers][4])

- Verify at minimum:
  - `is_valid == true`
  - `app_id == FACEBOOK_APP_ID`
  - `user_id` present
  - token not expired

- Reject otherwise.

#### Identify the Facebook user

- Prefer `provider_user_id = debug_token.user_id` (or the equivalent `data.user_id` in the response structure).
- If needed, call `/me?fields=id` authorized by the **user access token**, including `appsecret_proof` computed from the **user token**. ([Facebook Developers][4])

#### Anti-replay: consume transaction

- Mark tx consumed with an UPDATE guarded by `consumed_at IS NULL` and `expires_at >= now`.
- If changes == 0, abort (already consumed/expired).
- Do this consumption before creating sessions/links so a replay cannot succeed.

#### Branch by tx.mode

**Mode = `link`**

- Require authenticated app session (ownership proof).
- Link identity:
  - If `(facebook, provider_user_id)` already linked to the same user → success (idempotent).
  - If linked to another user → return 409 (and redirect to a conflict UI route).
  - Else insert into `identities`.

- Clear `__Host-fb_oauth_tx`.
- Redirect to `tx.return_to` (re-validate relative-only before redirect).

**Mode = `login`**

- Look up `identities` by `(provider='facebook', provider_user_id)`:
  - If found → create/refresh app session for that user; clear tx cookie; redirect to `tx.return_to`.
  - If not found → do **not** create a user:
    - Create `pending_links` with one-time random `code`, store `provider_user_id`, store `return_to`, TTL ~10 minutes.
    - Enforce “single active pending link per identity” via unique index or transactional enforcement.
    - Redirect to frontend: `/link/facebook?code=<code>`
    - Do not trust any client-provided `returnTo`; use DB `return_to` later.

Use `env.DB.batch()` if you want “consume tx + create pending link” to be atomic (rollback if insert fails due to uniqueness). ([Cloudflare Docs][7])

### 3) `POST /auth/link/facebook/consume`

- Requires authenticated app session (ownership proof); else 401.
- CSRF protections:
  - Keep session cookie `SameSite=Lax` (or stricter).
  - Additionally require `Origin` to match your origin for browser requests.

- Body: `{ code: string }`
- Fetch `pending_links` by code; validate exists, not expired, `consumed_at IS NULL`.
- Attempt to link identity for current user:
  - If identity already linked to another user → 409.
  - If already linked to same user → idempotent success (still consume the pending link).
  - Else insert into `identities` (unique constraint enforces single-user binding).

- Mark `pending_links` consumed (set `consumed_at`) using guarded UPDATE (`WHERE consumed_at IS NULL`) to enforce single-use.
- Return 204 (optionally return `{ returnTo: pending_links.return_to }` so client navigates using server-trusted returnTo).

## Frontend (React) changes

- Login page: “Continue with Facebook” → navigate to `/auth/facebook/start?mode=login&returnTo=/app`
- Settings/security (authenticated): “Link Facebook” → `/auth/facebook/start?mode=link&returnTo=/settings/security`
- Route `/link/facebook`:
  - Read `code` from query.
  - If user not logged in: start existing Google sign-in and return back to this route preserving `code`.
  - If logged in: POST `/auth/link/facebook/consume` with `{ code }`.
  - On success: navigate to server-provided `returnTo` (preferred) or fetch it from an endpoint; do not trust query `returnTo`.
  - On 409: show “This Facebook account is already linked to another account.”

## Cleanup (scheduled)

Use Cloudflare **Cron Triggers** with a `scheduled()` handler to periodically delete expired rows from `oauth_transactions` and `pending_links`. ([Cloudflare Docs][10])

## Tests (required)

- Login succeeds when Facebook identity is already linked.
- Login with unlinked Facebook identity redirects to `/link/facebook` and does not create a user.
- `POST /auth/link/facebook/consume` requires session (401 otherwise) and rejects cross-site origins.
- Conflict: linking an identity already linked elsewhere returns 409.
- `state` mismatch / missing tx / expired tx fails safely (no session created).
- Replay: reused oauth tx id or reused pending link code fails.
- Open redirect attempts blocked by relative-only returnTo validation.

## Output format

Provide:

1. Step-by-step plan,
2. D1 migration SQL,
3. Workers route implementations + helpers (PKCE, cookies, appsecret_proof, /debug_token validation, returnTo validation),
4. React wiring for UI/routes,
5. Minimal tests consistent with existing project patterns.

[1]: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow/?utm_source=chatgpt.com 'Manually Build a Login Flow - Meta for Developers - Facebook'
[2]: https://developers.facebook.com/docs/facebook-login/guides/advanced/oidc-token/?utm_source=chatgpt.com 'OIDC Token with Manual Flow - Facebook Login'
[3]: https://developers.facebook.com/docs/facebook-login/guides/%20access-tokens/debugging/?utm_source=chatgpt.com 'Debugging & Errors - Facebook Login - Meta for Developers'
[4]: https://developers.facebook.com/docs/graph-api/guides/secure-requests/?utm_source=chatgpt.com 'Secure Requests - Graph API - Meta for Developers - Facebook'
[5]: https://developers.cloudflare.com/workers/configuration/secrets/?utm_source=chatgpt.com 'Secrets - Workers'
[6]: https://developers.cloudflare.com/d1/reference/migrations/?utm_source=chatgpt.com 'Migrations · Cloudflare D1 docs'
[7]: https://developers.cloudflare.com/d1/worker-api/d1-database/?utm_source=chatgpt.com 'D1 Database'
[8]: https://datatracker.ietf.org/doc/html/rfc7636?utm_source=chatgpt.com 'RFC 7636 - Proof Key for Code Exchange by OAuth Public ...'
[9]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie?utm_source=chatgpt.com 'Set-Cookie header - HTTP - MDN Web Docs'
[10]: https://developers.cloudflare.com/workers/configuration/cron-triggers/?utm_source=chatgpt.com 'Cron Triggers - Workers'
