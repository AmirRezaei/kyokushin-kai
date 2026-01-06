// file: cloudflare/pm-api/src/index.ts
import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { createRemoteJWKSet, jwtVerify, SignJWT } from 'jose';

type Bindings = {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  JWT_SECRET: string;
  ADMIN_EMAIL?: string;
  VITE_GOOGLE_CLIENT_ID?: string;
  VITE_API_BASE_URL?: string;
  ALLOWED_ORIGINS?: string;
  // Facebook
  FACEBOOK_APP_ID: string;
  FACEBOOK_APP_SECRET: string;
  FACEBOOK_REDIRECT_URI: string;
  FACEBOOK_GRAPH_VERSION: string;
  AUTH_COOKIE_SECRET: string;
  ASSETS: Fetcher;
};

// Facebook Types
type FacebookTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  error?: unknown;
};

type FacebookDebugTokenResponse = {
  data: {
    app_id: string;
    type: string;
    application: string;
    data_access_expires_at: number;
    expires_at: number;
    is_valid: boolean;
    scopes: string[];
    user_id: string;
  };
  error?: unknown;
};

type IdentityRow = {
  id: string;
  user_id: string;
  provider: string;
  provider_user_id: string;
  created_at: number;
  updated_at: number;
};

type OAuthTransactionRow = {
  id: string;
  provider: string;
  state: string;
  pkce_verifier: string;
  mode: 'login' | 'link';
  user_id: string | null;
  return_to: string;
  created_at: number;
  expires_at: number;
  consumed_at: number | null;
};

type PendingLinkRow = {
  code: string;
  provider: string;
  provider_user_id: string;
  expected_user_id?: string | null;
  return_to: string;
  expires_at: number;
  consumed_at: number | null;
};

type OAuthLoginCodeRow = {
  code: string;
  provider: string;
  user_id: string;
  return_to: string;
  created_at: number;
  expires_at: number;
  consumed_at: number | null;
};

export type PersistedSettings = {
  gradeHistory: Array<{ date: string; gradeId: string }>;
  trainedDays: number;
  lastTrainedDate: string | null;
  skipDeleteConfirmForComboItems: boolean;
  skipDeleteConfirmForCombo: boolean;
};

type UserProfile = {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  provider?: string;
};

type UserRole = 'admin' | 'user';
type PublishStatus = 'draft' | 'published' | 'inactive';
type Locale = 'romaji' | 'ja' | 'en' | 'sv';
type LocalizedText = Partial<Record<Locale, string>>;

type TechniqueRecord = {
  id: string;
  kind: string;
  rank?: number;
  name: LocalizedText;
  aliases?: LocalizedText[];
  nameParts?: Record<string, unknown>;
  tags?: string[];
  summary?: LocalizedText;
  history?: LocalizedText;
  detailedDescription?: LocalizedText;
  relatedTermIds?: string[];
  mediaIds?: string[];
  sourceIds?: string[];
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
};

type TechniqueRow = {
  id: string;
  data_json: string;
  kind: string;
  status: string;
  rank: number | null;
  created_at: string;
  updated_at: string;
  version: number;
};

type GradeRecord = {
  id: string;
  gradingSystemId: string;
  kind: string;
  number: number;
  rank?: number;
  name: LocalizedText;
  aliases?: LocalizedText[];
  beltColor: string;
  sortOrder: number;
  notes?: LocalizedText;
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
};

type KataRecord = {
  id: string;
  rank?: number;
  name: LocalizedText;
  aliases?: LocalizedText[];
  familyTermIds?: string[];
  meaning?: LocalizedText;
  history?: LocalizedText;
  detailedDescription?: LocalizedText;
  tags?: string[];
  difficulty?: number;
  expectedDurationSec?: number;
  mediaIds?: string[];
  sourceIds?: string[];
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
};

type QuoteRecord = {
  id: string;
  author: string;
  tags: string[];
  date?: string;
  text: string;
  meaning: string;
  history?: string;
  reference?: string;
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
  sortOrder?: number;
};

type GradeRow = {
  id: string;
  data_json: string;
  grading_system_id: string;
  kind: string;
  number: number;
  rank: number | null;
  belt_color: string;
  sort_order: number;
  status: string;
  created_at: string;
  updated_at: string;
  version: number;
};

type KataRow = {
  id: string;
  data_json: string;
  status: string;
  rank: number | null;
  created_at: string;
  updated_at: string;
  version: number;
};

type QuoteRow = {
  id: string;
  data_json: string;
  author: string;
  status: string;
  created_at: string;
  updated_at: string;
  version: number;
  sort_order: number | null;
};

type MottoRecord = {
  id: string;
  shortTitle: string;
  text: string;
  details?: string;
  sortOrder?: number;
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
};

type MottoRow = {
  id: string;
  data_json: string;
  status: string;
  created_at: string;
  updated_at: string;
  sort_order: number | null;
  version: number;
};

const PUBLISH_STATUSES = new Set<PublishStatus>(['draft', 'published', 'inactive']);

const jwks = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const googleIssuers = ['https://accounts.google.com', 'accounts.google.com'];
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;
const REFRESH_COOKIE_NAME = '__Host-kk_refresh';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', async (c, next) => {
  console.log(`[Worker] ${c.req.method} ${c.req.path}`);
  await next();
});

app.use(
  '*',
  cors({
    origin: (origin, c) => {
      const allowed = parseAllowedOrigins(c.env.ALLOWED_ORIGINS);
      const requestOrigin = origin ?? new URL(c.req.url).origin;
      if (!allowed.length) return requestOrigin;
      if (!origin) return allowed[0];
      return allowed.includes(origin) ? origin : allowed[0];
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
    credentials: true,
  }),
);

// Explicit 404 for API routes to prevent fallback to SPA index.html
app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

app.get('/api/v1/health', async (c) => {
  const dbOk = await c.env.DB.prepare('SELECT 1 as ok').first<{ ok: number }>();
  return c.json({ ok: true, db: dbOk?.ok === 1 });
});

app.get('/api/v1/public-config', (c) => {
  const requestUrl = new URL(c.req.url);
  const payload = {
    googleClientId: c.env.VITE_GOOGLE_CLIENT_ID ?? c.env.GOOGLE_CLIENT_ID ?? '',
    apiBaseUrl: c.env.VITE_API_BASE_URL ?? requestUrl.origin,
  };
  return c.json(payload, 200);
});

// --- Auth Endpoints ---
// Custom JWT token authentication using OAuth 2.0 hybrid approach
// Google Sign-In for authentication → Custom JWTs for authorization
// Access tokens (1h) are refreshable via refresh tokens (30 days)

app.post('/api/v1/auth/login', async (c) => {
  /**
   * Exchange Google ID token for custom JWT + refresh token
   *
   * OAuth 2.0 Hybrid Flow:
   * 1. Verify Google ID token with Google's JWKS (user authentication)
   * 2. Generate cryptographically secure refresh token (30-day expiry)
   * 3. Hash and store refresh token in database
   * 4. Issue custom JWT access token (1-hour expiry, HMAC-SHA256)
   * 5. Return both tokens to client
   *
   * Security:
   * - Refresh tokens SHA-256 hashed before storage
   * - JWT signed with HMAC-SHA256 using JWT_SECRET
   * - Multiple refresh tokens can exist per user (no automatic cleanup)
   *
   * Known Issues:
   * - No old token cleanup (consider adding on login)
   *
   * @body {idToken: string} - Google ID token from OAuth flow
   * @returns {accessToken: JWT, expiresIn, user} (refresh token via httpOnly cookie)
   */
  let payload: { idToken: string; returnTo?: string };
  try {
    payload = await c.req.json();
    if (!payload.idToken) throw new Error('Missing idToken');
  } catch {
    return c.json({ error: 'Invalid request' }, 400);
  }

  if (!(await enforceRateLimit(c, 'auth_login', 10, 60))) {
    return c.json({ error: 'Too many requests' }, 429);
  }

  const clientId = c.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return c.json({ error: 'Server configuration error' }, 500);
  }

  try {
    // Verify Google ID token
    const { payload: googlePayload } = await jwtVerify(payload.idToken, jwks, {
      audience: clientId,
      issuer: googleIssuers,
    });

    if (!googlePayload.sub || !googlePayload.email) {
      throw new Error('Missing email or sub claim');
    }
    if (googlePayload.email_verified === false) {
      throw new Error('Email not verified');
    }

    const providerUserId = String(googlePayload.sub);
    const email = normalizeEmail(String(googlePayload.email));
    const name = googlePayload.name ? String(googlePayload.name) : undefined;
    const picture = googlePayload.picture ? String(googlePayload.picture) : undefined;
    let userId = providerUserId;

    const existingIdentity = await c.env.DB.prepare(
      `SELECT user_id FROM identities WHERE provider = 'google' AND provider_user_id = ?`,
    )
      .bind(providerUserId)
      .first<{ user_id: string }>();

    if (existingIdentity && existingIdentity.user_id !== providerUserId) {
      const providerSettings = await c.env.DB.prepare(
        `SELECT user_id FROM user_settings WHERE user_id = ? LIMIT 1`,
      )
        .bind(providerUserId)
        .first<{ user_id: string }>();

      if (!providerSettings) {
        const existingSettings = await c.env.DB.prepare(
          `SELECT user_id FROM user_settings WHERE user_id = ? LIMIT 1`,
        )
          .bind(existingIdentity.user_id)
          .first<{ user_id: string }>();
        if (existingSettings) {
          userId = existingIdentity.user_id;
        } else {
          await c.env.DB.prepare(
            `DELETE FROM identities WHERE provider = 'google' AND provider_user_id = ?`,
          )
            .bind(providerUserId)
            .run();
        }
      }
    }

    if (userId === providerUserId) {
      const existingById = await c.env.DB.prepare(
        `SELECT user_id FROM user_settings WHERE user_id = ? LIMIT 1`,
      )
        .bind(userId)
        .first<{ user_id: string }>();

      if (existingById) {
        const { results: linkedProviders } = await c.env.DB.prepare(
          `SELECT provider FROM identities WHERE user_id = ?`,
        )
          .bind(userId)
          .all<{ provider: string }>();

        const providers = linkedProviders.map((row) => row.provider).filter(Boolean);
        const hasGoogleProvider = providers.includes('google');
        const hasOtherProviders = providers.some((provider) => provider !== 'google');

        if (!hasGoogleProvider && hasOtherProviders) {
          const pendingCode = crypto.randomUUID();
          const now = Math.floor(Date.now() / 1000);
          const requestedReturnTo = payload.returnTo || '/';
          const returnTo = isValidReturnTo(requestedReturnTo) ? requestedReturnTo : '/';

          await c.env.DB.prepare(
            `INSERT INTO pending_links (code, provider, provider_user_id, expected_user_id, return_to, expires_at)
             VALUES (?, 'google', ?, ?, ?, ?)
             ON CONFLICT(provider, provider_user_id) WHERE consumed_at IS NULL
             DO UPDATE SET
               code = excluded.code,
               expected_user_id = excluded.expected_user_id,
               return_to = excluded.return_to,
               expires_at = excluded.expires_at`,
          )
            .bind(pendingCode, providerUserId, userId, returnTo, now + 600)
            .run();

          return c.json(
            {
              error: 'Google account was unlinked. Verify with your existing provider to relink.',
              mergeRequired: true,
              collision: true,
              code: pendingCode,
              email,
              providerHint: providers[0] ?? 'facebook',
            },
            409,
          );
        }
      }
    }

    const existingByEmail = await c.env.DB.prepare(
      `SELECT user_id FROM user_settings WHERE LOWER(email) = ? AND user_id != ? LIMIT 1`,
    )
      .bind(email, userId)
      .first<{ user_id: string }>();

    if (existingByEmail) {
      const { results: existingProviders } = await c.env.DB.prepare(
        `SELECT provider FROM identities WHERE user_id = ?`,
      )
        .bind(existingByEmail.user_id)
        .all<{ provider: string }>();

      if (existingProviders.length === 0) {
        userId = existingByEmail.user_id;
      } else {
        const pendingCode = crypto.randomUUID();
        const now = Math.floor(Date.now() / 1000);
        const requestedReturnTo = payload.returnTo || '/';
        const returnTo = isValidReturnTo(requestedReturnTo) ? requestedReturnTo : '/';

        await c.env.DB.prepare(
          `INSERT INTO pending_links (code, provider, provider_user_id, expected_user_id, return_to, expires_at)
           VALUES (?, 'google', ?, ?, ?, ?)
           ON CONFLICT(provider, provider_user_id) WHERE consumed_at IS NULL
           DO UPDATE SET
             code = excluded.code,
             expected_user_id = excluded.expected_user_id,
             return_to = excluded.return_to,
             expires_at = excluded.expires_at`,
        )
          .bind(pendingCode, providerUserId, existingByEmail.user_id, returnTo, now + 600)
          .run();

        return c.json(
          {
            error: 'An account with this email already exists.',
            mergeRequired: true,
            collision: true,
            code: pendingCode,
            email,
            providerHint: existingProviders[0] ?? 'facebook',
          },
          409,
        );
      }
    }
    const role = await upsertUserRole(
      c.env.DB,
      { id: userId, email, name, picture },
      normalizeEmail(c.env.ADMIN_EMAIL),
    );

    const settingsPayload = JSON.stringify(sanitizeSettings({}));
    const settingsTimestamp = new Date().toISOString();
    await c.env.DB.prepare(
      `INSERT INTO user_settings (user_id, email, display_name, image_url, settings_json, version, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         email = excluded.email,
         display_name = excluded.display_name,
         image_url = excluded.image_url,
         updated_at = excluded.updated_at`,
    )
      .bind(userId, email, name || null, picture || null, settingsPayload, settingsTimestamp)
      .run();

    // Generate refresh token (30 days)
    const refreshToken = generateRefreshToken();
    const tokenHash = await hashToken(refreshToken);
    const expiresAt = Math.floor(Date.now() / 1000) + REFRESH_TOKEN_TTL_SECONDS;

    // Store in database
    await c.env.DB.prepare(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, last_used_at, provider)
       VALUES (?, ?, ?, ?, strftime('%s', 'now'), ?)`,
    )
      .bind(crypto.randomUUID(), userId, tokenHash, expiresAt, 'google')
      .run();

    // Create custom JWT token (1 hour expiry)
    const accessToken = await createJWT(userId, email, c.env.JWT_SECRET, 3600, 'google');

    // Ensure Google identity exists
    // Ensure Google identity exists
    const now = Math.floor(Date.now() / 1000);
    await c.env.DB.prepare(
      `INSERT INTO identities (id, user_id, provider, provider_user_id, created_at, updated_at)
       VALUES (?, ?, 'google', ?, ?, ?)
       ON CONFLICT(provider, provider_user_id) DO NOTHING`,
    )
      .bind(crypto.randomUUID(), userId, providerUserId, now, now)
      .run();

    // Fetch providers
    const { results: providerResults } = await c.env.DB.prepare(
      `SELECT provider FROM identities WHERE user_id = ?`,
    )
      .bind(userId)
      .all<{ provider: string }>();

    const providers = providerResults.map((r) => r.provider);
    if (!providers.includes('google')) {
      const recheck = await c.env.DB.prepare(
        `SELECT 1 FROM identities WHERE user_id = ? AND provider = 'google' LIMIT 1`,
      )
        .bind(userId)
        .first();
      if (recheck) {
        providers.push('google');
      }
    }

    c.header('Set-Cookie', buildRefreshCookie(refreshToken));
    return c.json({
      accessToken,
      expiresIn: 3600, // 1 hour
      user: {
        id: userId,
        email,
        name,
        picture,
        role,
        providers,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
});

app.post('/api/v1/auth/refresh', async (c) => {
  /**
   * Validate refresh token and extend session
   *
   * FIXED: Now issues custom JWT tokens
   *
   * Current behavior:
   * 1. Validates refresh token exists and hasn't expired (30 days)
   * 2. Fetches user email from database
   * 3. Issues new JWT access token (1 hour)
   * 4. Updates last_used_at timestamp
   *
   * Security:
   * - Refresh token rotation (single-use)
   * - Rate limited
   *
   * @body {refreshToken?: string} (legacy; prefer httpOnly cookie)
   * @returns {accessToken, expiresIn}
   */
  let refreshToken = getCookieValue(c.req.header('Cookie'), REFRESH_COOKIE_NAME);
  if (!refreshToken) {
    try {
      const payload = (await c.req.json()) as { refreshToken?: string };
      refreshToken = payload.refreshToken ?? null;
    } catch {
      refreshToken = null;
    }
  }
  if (!refreshToken) {
    return c.json({ error: 'Missing refresh token' }, 400);
  }

  if (!(await enforceRateLimit(c, 'auth_refresh', 30, 60))) {
    return c.json({ error: 'Too many requests' }, 429);
  }

  try {
    const tokenHash = await hashToken(refreshToken);
    const now = Math.floor(Date.now() / 1000);

    // Find and validate refresh token + get user email
    const row = await c.env.DB.prepare(
      `SELECT rt.user_id as userId, rt.expires_at as expiresAt, rt.provider as provider, us.email as email
       FROM refresh_tokens rt
       JOIN user_settings us ON rt.user_id = us.user_id
       WHERE rt.token_hash = ? AND rt.expires_at > ?
       LIMIT 1`,
    )
      .bind(tokenHash, now)
      .first<{ userId: string; expiresAt: number; email: string; provider: string | null }>();

    if (!row) {
      return c.json({ error: 'Invalid or expired refresh token' }, 401);
    }

    const newRefreshToken = generateRefreshToken();
    const newTokenHash = await hashToken(newRefreshToken);
    const expiresAt = now + REFRESH_TOKEN_TTL_SECONDS;

    await c.env.DB.batch([
      c.env.DB.prepare(`DELETE FROM refresh_tokens WHERE token_hash = ?`).bind(tokenHash),
      c.env.DB.prepare(
        `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, last_used_at, provider)
           VALUES (?, ?, ?, ?, ?, ?)`,
      ).bind(crypto.randomUUID(), row.userId, newTokenHash, expiresAt, now, row.provider),
    ]);

    // Issue new custom JWT token (1 hour expiry)
    const accessToken = await createJWT(
      row.userId,
      row.email,
      c.env.JWT_SECRET,
      3600,
      row.provider ?? undefined,
    );
    const role = await getUserRole(
      c.env.DB,
      { id: row.userId, email: row.email },
      normalizeEmail(c.env.ADMIN_EMAIL),
    );

    const { results: providerResults } = await c.env.DB.prepare(
      `SELECT provider, provider_user_id FROM identities WHERE user_id = ?`,
    )
      .bind(row.userId)
      .all<{ provider: string; provider_user_id: string }>();

    const providers = providerResults.map((r) => r.provider);
    const hasGoogle = providers.includes('google');
    const shouldBackfillGoogle =
      !hasGoogle && providerResults.length === 0 && (row.provider === 'google' || !row.provider);
    if (shouldBackfillGoogle) {
      const nowTimestamp = Math.floor(Date.now() / 1000);
      await c.env.DB.prepare(
        `INSERT INTO identities (id, user_id, provider, provider_user_id, created_at, updated_at)
         VALUES (?, ?, 'google', ?, ?, ?)
         ON CONFLICT(provider, provider_user_id) DO NOTHING`,
      )
        .bind(crypto.randomUUID(), row.userId, row.userId, nowTimestamp, nowTimestamp)
        .run();
      const recheck = await c.env.DB.prepare(
        `SELECT 1 FROM identities WHERE user_id = ? AND provider = 'google' LIMIT 1`,
      )
        .bind(row.userId)
        .first();
      if (recheck) {
        providers.push('google');
      }
    }

    c.header('Set-Cookie', buildRefreshCookie(newRefreshToken));
    return c.json({
      accessToken,
      expiresIn: 3600,
      role,
      providers,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return c.json({ error: 'Token refresh failed' }, 401);
  }
});

app.post('/api/v1/auth/logout', async (c) => {
  /**
   * Invalidate refresh token on logout
   *
   * Flow:
   * 1. Hash provided refresh token
   * 2. Delete from database
   * 3. Return success
   *
   * Security:
   * - Token deletion prevents future use
   * - Fails gracefully if token not found
   * - Client also clears localStorage
   *
   * @body {refreshToken?: string} (legacy; prefer httpOnly cookie)
   * @returns {ok: boolean}
   */
  let refreshToken = getCookieValue(c.req.header('Cookie'), REFRESH_COOKIE_NAME);
  if (!refreshToken) {
    try {
      const payload = (await c.req.json()) as { refreshToken?: string };
      refreshToken = payload.refreshToken ?? null;
    } catch {
      refreshToken = null;
    }
  }

  try {
    if (refreshToken) {
      const tokenHash = await hashToken(refreshToken);
      // Delete refresh token
      await c.env.DB.prepare(`DELETE FROM refresh_tokens WHERE token_hash = ?`)
        .bind(tokenHash)
        .run();
    }
    c.header('Set-Cookie', clearRefreshCookie());

    return c.json({ ok: true });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ error: 'Logout failed' }, 500);
  }
});

app.get('/api/v1/auth/me', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const profile = await c.env.DB.prepare(
    `SELECT display_name as name, image_url as picture FROM user_settings WHERE user_id = ? LIMIT 1`,
  )
    .bind(user.id)
    .first<{ name?: string | null; picture?: string | null }>();

  const role = await getUserRole(c.env.DB, user, normalizeEmail(c.env.ADMIN_EMAIL));

  const { results } = await c.env.DB.prepare(
    `SELECT provider, provider_user_id FROM identities WHERE user_id = ?`,
  )
    .bind(user.id)
    .all<{ provider: string; provider_user_id: string }>();

  const providers = results.map((r) => r.provider);
  const hasGoogle = providers.includes('google');
  const shouldBackfillGoogle =
    !hasGoogle && results.length === 0 && (!user.provider || user.provider === 'google');
  if (shouldBackfillGoogle) {
    const now = Math.floor(Date.now() / 1000);
    await c.env.DB.prepare(
      `INSERT INTO identities (id, user_id, provider, provider_user_id, created_at, updated_at)
       VALUES (?, ?, 'google', ?, ?, ?)
       ON CONFLICT(provider, provider_user_id) DO NOTHING`,
    )
      .bind(crypto.randomUUID(), user.id, user.id, now, now)
      .run();
    const recheck = await c.env.DB.prepare(
      `SELECT 1 FROM identities WHERE user_id = ? AND provider = 'google' LIMIT 1`,
    )
      .bind(user.id)
      .first();
    if (recheck) {
      providers.push('google');
    }
  }

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: profile?.name ?? user.name ?? undefined,
      picture: profile?.picture ?? user.picture ?? undefined,
    },
    role,
    providers,
  });
});

app.delete('/api/v1/auth/link/:provider', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const provider = c.req.param('provider');

  const { results: identityRows } = await c.env.DB.prepare(
    `SELECT provider, provider_user_id FROM identities WHERE user_id = ?`,
  )
    .bind(user.id)
    .all<{ provider: string; provider_user_id: string }>();

  let hasProvider = identityRows.some((row) => row.provider === provider);
  if (!hasProvider && provider === 'google') {
    const hasFacebookPrimary = identityRows.some(
      (row) => row.provider === 'facebook' && row.provider_user_id === user.id,
    );
    const shouldBackfillGoogle =
      (!user.provider || user.provider === 'google') && !hasFacebookPrimary;
    if (shouldBackfillGoogle) {
      const now = Math.floor(Date.now() / 1000);
      await c.env.DB.prepare(
        `INSERT INTO identities (id, user_id, provider, provider_user_id, created_at, updated_at)
         VALUES (?, ?, 'google', ?, ?, ?)
         ON CONFLICT(provider, provider_user_id) DO NOTHING`,
      )
        .bind(crypto.randomUUID(), user.id, user.id, now, now)
        .run();
      const recheck = await c.env.DB.prepare(
        `SELECT 1 FROM identities WHERE user_id = ? AND provider = 'google' LIMIT 1`,
      )
        .bind(user.id)
        .first();
      hasProvider = Boolean(recheck);
    }
  }

  if (!hasProvider) {
    if (provider === 'google') {
      const existingGoogle = await c.env.DB.prepare(
        `SELECT user_id FROM identities WHERE provider = 'google' AND provider_user_id = ? LIMIT 1`,
      )
        .bind(user.id)
        .first<{ user_id: string }>();
      if (existingGoogle && existingGoogle.user_id !== user.id) {
        return c.json(
          {
            error: 'Google account is linked to another user. Use Link Google to merge accounts.',
            mergeRequired: true,
          },
          409,
        );
      }
    }
    return c.json({ error: 'Provider not linked' }, 404);
  }

  // Count total providers
  const { count } = (await c.env.DB.prepare(
    `SELECT COUNT(*) as count FROM identities WHERE user_id = ?`,
  )
    .bind(user.id)
    .first<{ count: number }>()) || { count: 0 };

  if (count <= 1) {
    return c.json({ error: 'Cannot unlink the last provider' }, 400);
  }

  await c.env.DB.prepare(`DELETE FROM identities WHERE user_id = ? AND provider = ?`)
    .bind(user.id, provider)
    .run();

  return c.json({ ok: true });
});

app.post('/api/v1/auth/link/google', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  let payload: { token: string; merge?: boolean };
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid request' }, 400);
  }
  if (!payload.token) {
    return c.json({ error: 'Invalid request' }, 400);
  }

  if (!(await enforceRateLimit(c, 'auth_link_google', 10, 60))) {
    return c.json({ error: 'Too many requests' }, 429);
  }

  try {
    const { payload: googlePayload } = await jwtVerify(payload.token, jwks, {
      audience: c.env.GOOGLE_CLIENT_ID,
      issuer: googleIssuers,
    });

    if (!googlePayload || !googlePayload.sub || !googlePayload.email) {
      return c.json({ error: 'Invalid Google token' }, 401);
    }
    if (googlePayload.email_verified === false) {
      return c.json({ error: 'Google email not verified' }, 401);
    }

    const providerUserId = googlePayload.sub;

    // Check if linked to another user
    const existing = await c.env.DB.prepare(
      `SELECT user_id FROM identities WHERE provider = 'google' AND provider_user_id = ?`,
    )
      .bind(providerUserId)
      .first<{ user_id: string }>();

    if (existing) {
      const providerUserId = String(googlePayload.sub);
      const isSameUser = existing.user_id === user.id;
      const isProviderUser = user.id === providerUserId;

      if (isSameUser && isProviderUser) {
        return c.json({ ok: true }); // Already linked and aligned
      }
      if (!payload.merge) {
        return c.json(
          { error: 'This Google account is already linked to another user.', mergeRequired: true },
          409,
        );
      }

      let mergeSourceUserId = user.id;
      let mergeTargetUserId = existing.user_id;

      if (isProviderUser) {
        mergeSourceUserId = existing.user_id;
        mergeTargetUserId = user.id;
      } else if (existing.user_id === providerUserId) {
        mergeSourceUserId = user.id;
        mergeTargetUserId = existing.user_id;
      } else if (isSameUser && user.id !== providerUserId) {
        mergeSourceUserId = user.id;
        mergeTargetUserId = providerUserId;
      }

      const mergeResult = await mergeUserAccounts(
        c.env.DB,
        mergeSourceUserId,
        mergeTargetUserId,
        {
          email: normalizeEmail(String(googlePayload.email)),
          name: googlePayload.name ? String(googlePayload.name) : undefined,
          picture: googlePayload.picture ? String(googlePayload.picture) : undefined,
          providerUserId,
        },
        normalizeEmail(c.env.ADMIN_EMAIL),
      );

      const refreshToken = generateRefreshToken();
      const tokenHash = await hashToken(refreshToken);
      const expiresAt = Math.floor(Date.now() / 1000) + REFRESH_TOKEN_TTL_SECONDS;

      await c.env.DB.prepare(
        `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, last_used_at, provider)
         VALUES (?, ?, ?, ?, strftime('%s', 'now'), ?)`,
      )
        .bind(crypto.randomUUID(), mergeResult.user.id, tokenHash, expiresAt, 'google')
        .run();

      const accessToken = await createJWT(
        mergeResult.user.id,
        mergeResult.user.email,
        c.env.JWT_SECRET,
        3600,
        'google',
      );

      c.header('Set-Cookie', buildRefreshCookie(refreshToken));
      return c.json({
        ok: true,
        merged: true,
        login: {
          accessToken,
          expiresIn: 3600,
          user: {
            id: mergeResult.user.id,
            email: mergeResult.user.email,
            name: mergeResult.user.name,
            imageUrl: mergeResult.user.imageUrl,
            role: mergeResult.role,
            providers: mergeResult.providers,
          },
        },
      });
    }

    // Link account
    const now = Math.floor(Date.now() / 1000);
    await c.env.DB.prepare(
      `INSERT INTO identities (id, user_id, provider, provider_user_id, created_at, updated_at) 
       VALUES (?, ?, 'google', ?, ?, ?)`,
    )
      .bind(crypto.randomUUID(), user.id, providerUserId, now, now)
      .run();

    return c.json({ ok: true });
  } catch (error) {
    console.error('Link Google error:', error);
    return c.json({ error: 'Failed to link Google account' }, 500);
  }
});

// --- Facebook OAuth ---

// Helper: base64url encode
function base64UrlEncode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Helper: Generate PKCE
async function generatePKCE() {
  const verifier = base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)).buffer);
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const challenge = base64UrlEncode(hash);
  return { verifier, challenge };
}

// Helper: Sign Cookie
async function signCookie(value: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return `${value}.${base64UrlEncode(signature)}`;
}

// Correct re-implementation of Verify using re-sign
async function verifyCookieSimple(signedValue: string, secret: string) {
  const parts = signedValue.split('.');
  if (parts.length !== 2) return null;
  const value = parts[0];
  const expected = await signCookie(value, secret);
  return expected === signedValue ? value : null;
}

function getCookieValue(cookieHeader: string | null | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.trim().split('=');
    if (key === name) {
      return rest.join('=');
    }
  }
  return null;
}

function buildRefreshCookie(token: string, maxAgeSeconds: number = REFRESH_TOKEN_TTL_SECONDS) {
  return `${REFRESH_COOKIE_NAME}=${token}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

function clearRefreshCookie() {
  return `${REFRESH_COOKIE_NAME}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function getClientIp(c: Context<{ Bindings: Bindings }>) {
  const cfIp = c.req.header('CF-Connecting-IP');
  if (cfIp) return cfIp;
  const xff = c.req.header('X-Forwarded-For');
  if (xff) return xff.split(',')[0].trim();
  return c.req.header('X-Real-IP');
}

async function enforceRateLimit(
  c: Context<{ Bindings: Bindings }>,
  action: string,
  limit: number,
  windowSeconds: number,
) {
  const ip = getClientIp(c);
  if (!ip) return true;

  const key = `${action}:${ip}`;
  const now = Math.floor(Date.now() / 1000);
  const row = await c.env.DB.prepare(
    `SELECT count, reset_at FROM rate_limits WHERE key = ? LIMIT 1`,
  )
    .bind(key)
    .first<{ count: number; reset_at: number }>();

  if (!row || row.reset_at < now) {
    await c.env.DB.prepare(
      `INSERT INTO rate_limits (key, count, reset_at)
       VALUES (?, 1, ?)
       ON CONFLICT(key) DO UPDATE SET count = 1, reset_at = excluded.reset_at`,
    )
      .bind(key, now + windowSeconds)
      .run();
    return true;
  }

  const nextCount = row.count + 1;
  await c.env.DB.prepare(`UPDATE rate_limits SET count = ? WHERE key = ?`)
    .bind(nextCount, key)
    .run();

  return nextCount <= limit;
}

// Helper: App Secret Proof
async function calculateAppSecretProof(accessToken: string, appSecret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(accessToken));
  // Facebook expects hex string for appsecret_proof
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function isValidReturnTo(value: string) {
  return value.startsWith('/') && !value.includes('//') && !value.includes('://');
}

function buildFacebookAuthUrl(
  c: Context<{ Bindings: Bindings }>,
  state: string,
  challenge: string,
) {
  const params = new URLSearchParams({
    client_id: c.env.FACEBOOK_APP_ID,
    redirect_uri: c.env.FACEBOOK_REDIRECT_URI,
    response_type: 'code',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    scope: 'public_profile,email',
  });

  return `https://www.facebook.com/${c.env.FACEBOOK_GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
}

async function createFacebookLoginCode(
  db: D1Database,
  userId: string,
  returnTo: string,
): Promise<string> {
  const code = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `INSERT INTO oauth_login_codes (code, provider, user_id, return_to, created_at, expires_at)
       VALUES (?, 'facebook', ?, ?, ?, ?)`,
    )
    .bind(code, userId, returnTo, now, now + 600)
    .run();
  return code;
}

app.get('/api/v1/auth/facebook/start', async (c) => {
  const mode = c.req.query('mode');
  const returnTo = c.req.query('returnTo') || '/';

  if (mode && mode !== 'login') {
    return c.json({ error: 'Use POST for link mode' }, 405);
  }

  // Validate returnTo (relative only)
  if (!isValidReturnTo(returnTo)) {
    return c.json({ error: 'Invalid returnTo' }, 400);
  }

  const { verifier, challenge } = await generatePKCE();
  const state = crypto.randomUUID();
  const txId = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);

  // Store transaction
  await c.env.DB.prepare(
    `INSERT INTO oauth_transactions (id, provider, state, pkce_verifier, mode, user_id, return_to, created_at, expires_at)
     VALUES (?, 'facebook', ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      txId,
      state,
      verifier,
      'login',
      null,
      returnTo,
      now,
      now + 600, // 10 mins
    )
    .run();

  const cookieVal = await signCookie(txId, c.env.AUTH_COOKIE_SECRET);
  c.header(
    'Set-Cookie',
    `__Host-fb_oauth_tx=${cookieVal}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=600`,
  );

  const authUrl = buildFacebookAuthUrl(c, state, challenge);

  return c.redirect(authUrl);
});

app.post('/api/v1/auth/facebook/start', async (c) => {
  let payload: { mode?: string; returnTo?: string };
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid request' }, 400);
  }

  const mode = payload.mode ?? 'link';
  const returnTo = payload.returnTo || '/';

  if (mode !== 'link') {
    return c.json({ error: 'Invalid mode' }, 400);
  }

  if (!isValidReturnTo(returnTo)) {
    return c.json({ error: 'Invalid returnTo' }, 400);
  }

  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const { verifier, challenge } = await generatePKCE();
  const state = crypto.randomUUID();
  const txId = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);

  await c.env.DB.prepare(
    `INSERT INTO oauth_transactions (id, provider, state, pkce_verifier, mode, user_id, return_to, created_at, expires_at)
     VALUES (?, 'facebook', ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(txId, state, verifier, mode, user.id, returnTo, now, now + 600)
    .run();

  const cookieVal = await signCookie(txId, c.env.AUTH_COOKIE_SECRET);
  c.header(
    'Set-Cookie',
    `__Host-fb_oauth_tx=${cookieVal}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=600`,
  );

  const authUrl = buildFacebookAuthUrl(c, state, challenge);
  return c.json({ authUrl });
});

app.get('/api/v1/auth/facebook/callback', async (c) => {
  const error = c.req.query('error');
  if (error) {
    c.header(
      'Set-Cookie',
      `__Host-fb_oauth_tx=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`,
    );
    return c.redirect('/login?error=facebook_cancel');
  }

  const code = c.req.query('code');
  const state = c.req.query('state');
  const cookieHeader = c.req.header('Cookie');

  if (!code || !state) {
    return c.json({ error: 'Invalid request' }, 400);
  }

  let txId: string | null = null;
  let tx: OAuthTransactionRow | null = null;
  if (cookieHeader) {
    // Prefer tx cookie, but allow state fallback for mobile app-switch flows.
    const cookies = cookieHeader.split(';');
    for (const cookie of cookies) {
      const parts = cookie.trim().split('=');
      if (parts[0] === '__Host-fb_oauth_tx') {
        const txCookieVal = parts[1];
        txId = await verifyCookieSimple(txCookieVal, c.env.AUTH_COOKIE_SECRET);
        if (!txId) {
          return c.json({ error: 'Invalid cookie signature' }, 400);
        }
        break;
      }
    }
  }

  const now = Math.floor(Date.now() / 1000);
  if (txId) {
    tx = await c.env.DB.prepare(
      `SELECT * FROM oauth_transactions WHERE id = ? AND provider = 'facebook'`,
    )
      .bind(txId)
      .first<OAuthTransactionRow>();
  } else {
    tx = await c.env.DB.prepare(
      `SELECT * FROM oauth_transactions WHERE state = ? AND provider = 'facebook' LIMIT 1`,
    )
      .bind(state)
      .first<OAuthTransactionRow>();
  }

  if (!tx) return c.json({ error: 'Transaction not found' }, 400);
  if (tx.expires_at < now) return c.json({ error: 'Transaction expired' }, 400);
  if (tx.consumed_at) return c.json({ error: 'Transaction consumed' }, 400);
  if (tx.state !== state) return c.json({ error: 'State mismatch' }, 400);

  // Consume transaction immediately to prevent replay
  const { meta } = await c.env.DB.prepare(
    `UPDATE oauth_transactions SET consumed_at = ? WHERE id = ? AND consumed_at IS NULL`,
  )
    .bind(now, txId)
    .run();

  if (meta.changes === 0) return c.json({ error: 'Transaction consumption failed' }, 400);

  // Exchange code for token
  const tokenParams = new URLSearchParams({
    client_id: c.env.FACEBOOK_APP_ID,
    client_secret: c.env.FACEBOOK_APP_SECRET,
    redirect_uri: c.env.FACEBOOK_REDIRECT_URI,
    code: code,
    code_verifier: tx.pkce_verifier,
  });

  const tokenResp = await fetch(
    `https://graph.facebook.com/${c.env.FACEBOOK_GRAPH_VERSION}/oauth/access_token?${tokenParams}`,
  );
  const tokenData = (await tokenResp.json()) as FacebookTokenResponse;

  if (tokenData.error) {
    return c.json({ error: 'Token exchange failed', details: tokenData.error }, 400);
  }

  const userAccessToken = tokenData.access_token;

  // Validate Token (debug_token)
  // We need an app access token or just use the app id|secret syntax if supported.
  // Docs say: input_token={token-to-inspect} & access_token={app-token-or-admin-token}
  const appAccessToken = `${c.env.FACEBOOK_APP_ID}|${c.env.FACEBOOK_APP_SECRET}`;
  const appSecretProof = await calculateAppSecretProof(appAccessToken, c.env.FACEBOOK_APP_SECRET);

  const debugParams = new URLSearchParams({
    input_token: userAccessToken,
    access_token: appAccessToken,
    appsecret_proof: appSecretProof,
  });

  const debugResp = await fetch(
    `https://graph.facebook.com/${c.env.FACEBOOK_GRAPH_VERSION}/debug_token?${debugParams}`,
  );
  const debugData = (await debugResp.json()) as FacebookDebugTokenResponse;

  if (!debugData.data || !debugData.data.is_valid) {
    return c.json({ error: 'Invalid token' }, 400);
  }
  if (debugData.data.app_id !== c.env.FACEBOOK_APP_ID) {
    return c.json({ error: 'Token app mismatch' }, 400);
  }

  const fbUserId = debugData.data.user_id;

  // Clear cookie
  c.header('Set-Cookie', `__Host-fb_oauth_tx=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`);

  // Logic based on Mode
  if (tx.mode === 'login') {
    // Find identity
    const identity = await c.env.DB.prepare(
      `SELECT * FROM identities WHERE provider = 'facebook' AND provider_user_id = ?`,
    )
      .bind(fbUserId)
      .first<IdentityRow>();

    if (identity) {
      // Login user
      const user = await c.env.DB.prepare(`SELECT * FROM user_settings WHERE user_id = ?`)
        .bind(identity.user_id)
        .first<{ user_id: string; email: string; display_name?: string; image_url?: string }>();

      if (!user) {
        // Orphan identity detected (user deleted but identity remains).
        // Clean up and treat as new user.
        console.warn(`Orphan identity found for user_id ${identity.user_id}. Deleting identity.`);
        await c.env.DB.prepare(`DELETE FROM identities WHERE id = ?`).bind(identity.id).run();
        // Proceed to 'else' block logic by falling through? No, structure is if/else.
        // We must handle this case here or restructuring.
        // Easiest is to copy the 'new user/linking' logic here or factor it out.
        // Let's copy the logic for now to ensure stability.

        // Logic for "Identity not found" (copied/adapted)
        const meResp = await fetch(
          `https://graph.facebook.com/${c.env.FACEBOOK_GRAPH_VERSION}/me?fields=email&access_token=${userAccessToken}&appsecret_proof=${await calculateAppSecretProof(userAccessToken, c.env.FACEBOOK_APP_SECRET)}`,
        );
        const meData = (await meResp.json()) as { email?: string; id: string };
        const fbEmailRaw = meData.email;
        const fbEmail = normalizeEmail(fbEmailRaw);
        if (!fbEmail) {
          return c.json({ error: 'Facebook email required' }, 400);
        }

        let collision = false;
        let expectedUserId: string | null = null;
        const existingUser = await c.env.DB.prepare(
          `SELECT user_id FROM user_settings WHERE LOWER(email) = ?`,
        )
          .bind(fbEmail)
          .first<{ user_id: string }>();
        if (existingUser) {
          collision = true;
          expectedUserId = existingUser.user_id;
        }

        const pendingCode = crypto.randomUUID();
        await c.env.DB.prepare(
          `INSERT INTO pending_links (code, provider, provider_user_id, expected_user_id, return_to, expires_at)
                 VALUES (?, 'facebook', ?, ?, ?, ?)
                 ON CONFLICT(provider, provider_user_id) WHERE consumed_at IS NULL
                 DO UPDATE SET
                   code = excluded.code,
                   expected_user_id = excluded.expected_user_id,
                   return_to = excluded.return_to,
                   expires_at = excluded.expires_at`,
        )
          .bind(
            pendingCode,
            fbUserId,
            expectedUserId,
            tx.return_to,
            Math.floor(Date.now() / 1000) + 600, // 10 mins
          )
          .run();

        const hashReturn = `/#/link/facebook?code=${pendingCode}${collision ? `&collision=true&email=${encodeURIComponent(fbEmailRaw || fbEmail)}` : ''}`;
        return c.redirect(hashReturn);
      }

      // Valid User found

      // Fetch latest FB profile to update sync
      const fbProfileResp = await fetch(
        `https://graph.facebook.com/${c.env.FACEBOOK_GRAPH_VERSION}/me?fields=id,name,email,picture.type(large)&access_token=${userAccessToken}&appsecret_proof=${await calculateAppSecretProof(userAccessToken, c.env.FACEBOOK_APP_SECRET)}`,
      );
      const fbProfile = (await fbProfileResp.json()) as {
        id: string;
        name: string;
        email: string;
        picture?: { data: { url: string } };
      };
      if (!fbProfile.email) {
        return c.json({ error: 'Facebook email required' }, 400);
      }

      // Update user settings with latest info
      const latestName = fbProfile.name || user.display_name;
      const latestImage = fbProfile.picture?.data?.url || user.image_url;

      await c.env.DB.prepare(
        `UPDATE user_settings SET display_name = ?, image_url = ?, updated_at = ? WHERE user_id = ?`,
      )
        .bind(latestName, latestImage, new Date().toISOString(), user.user_id)
        .run();

      // Refresh local user object
      user.display_name = latestName;
      user.image_url = latestImage;

      const loginCode = await createFacebookLoginCode(c.env.DB, user.user_id, tx.return_to);
      return c.redirect(`/#/link/facebook?loginCode=${loginCode}`);
    } else {
      // Identity not found. Check for potential account linking via email collision
      // We need user email to check if they already exist
      // Identity not found. Check for potential account linking via email collision
      // We need user email to check if they already exist

      // Fetch FULL profile first, as we might need it for creation
      const fbProfileResp = await fetch(
        `https://graph.facebook.com/${c.env.FACEBOOK_GRAPH_VERSION}/me?fields=id,name,email,picture.type(large)&access_token=${userAccessToken}&appsecret_proof=${await calculateAppSecretProof(userAccessToken, c.env.FACEBOOK_APP_SECRET)}`,
      );
      const fbProfile = (await fbProfileResp.json()) as {
        id: string;
        name: string;
        email: string;
        picture?: { data: { url: string } };
      };

      const fbEmailRaw = fbProfile.email;
      const fbEmail = normalizeEmail(fbEmailRaw);
      if (!fbEmail) {
        return c.json({ error: 'Facebook email required' }, 400);
      }
      console.log('FB Collision Check:', fbEmail);

      let collision = false;
      let expectedUserId: string | null = null;
      const existingUser = await c.env.DB.prepare(
        `SELECT user_id FROM user_settings WHERE LOWER(email) = ?`,
      )
        .bind(fbEmail)
        .first<{ user_id: string }>();
      if (existingUser) {
        collision = true;
        expectedUserId = existingUser.user_id;
      }

      if (!collision) {
        // --- CREATE NEW USER FLOW ---
        // 1. Create Role (User)
        // newUserId removed as we use fbUserId directly
        // Actually, better to use UUID for new users, but sticking to provided ID is okay if unique.
        // Google uses sub. Let's use fbUserId (which is id).

        // Wait, legacy google users utilize sub as ID.
        // New users should ideally use UUID?
        // Let's use fbUserId to ensure stability and identical reconstruction if they delete/re-join?
        // Yes, using provider ID as user ID is fine if we namespace or if we trust it's unique enough (it is).

        await upsertUserRole(
          c.env.DB,
          {
            id: fbUserId,
            email: fbEmail,
            name: fbProfile.name,
            picture: fbProfile.picture?.data?.url,
          },
          normalizeEmail(c.env.ADMIN_EMAIL),
        );

        // 2. Create Settings
        const settingsPayload = JSON.stringify(sanitizeSettings({}));
        const settingsTimestamp = new Date().toISOString();
        const displayName = fbProfile.name;
        const imageUrl = fbProfile.picture?.data?.url;

        await c.env.DB.prepare(
          `INSERT INTO user_settings (user_id, email, display_name, image_url, settings_json, version, updated_at)
           VALUES (?, ?, ?, ?, ?, 1, ?)
           ON CONFLICT(user_id) DO UPDATE SET
             email = excluded.email,
             display_name = excluded.display_name,
             image_url = excluded.image_url,
             updated_at = excluded.updated_at`,
        )
          // If user was "deleted", user_settings row is gone. So INSERT works.
          // If row exists (collision check failed?), ON CONFLICT updates it.
          .bind(fbUserId, fbEmail, displayName, imageUrl, settingsPayload, settingsTimestamp)
          .run();

        // 3. Create Identity
        const now = Math.floor(Date.now() / 1000);
        await c.env.DB.prepare(
          `INSERT INTO identities (id, user_id, provider, provider_user_id, created_at, updated_at)
           VALUES (?, ?, 'facebook', ?, ?, ?)
           ON CONFLICT(provider, provider_user_id) DO NOTHING`,
        )
          .bind(crypto.randomUUID(), fbUserId, fbUserId, now, now)
          .run();

        const loginCode = await createFacebookLoginCode(c.env.DB, fbUserId, tx.return_to);
        return c.redirect(`/#/link/facebook?loginCode=${loginCode}`);
      } else {
        // --- COLLISION DETECTED (Existing Logic) ---
        const pendingCode = crypto.randomUUID();
        await c.env.DB.prepare(
          `INSERT INTO pending_links (code, provider, provider_user_id, expected_user_id, return_to, expires_at)
               VALUES (?, 'facebook', ?, ?, ?, ?)
               ON CONFLICT(provider, provider_user_id) WHERE consumed_at IS NULL
               DO UPDATE SET
                 code = excluded.code,
                 expected_user_id = excluded.expected_user_id,
                 return_to = excluded.return_to,
                 expires_at = excluded.expires_at`,
        )
          .bind(
            pendingCode,
            fbUserId,
            expectedUserId,
            tx.return_to,
            Math.floor(Date.now() / 1000) + 600, // 10 mins
          )
          .run();

        // Redirect to frontend linking page with collision param
        const hashReturn = `/#/link/facebook?code=${pendingCode}&collision=true&email=${encodeURIComponent(fbEmailRaw || fbEmail)}`;
        return c.redirect(hashReturn);
      }
    }
  } else if (tx.mode === 'link') {
    if (!tx.user_id) {
      return c.json({ error: 'Link session missing user' }, 400);
    }
    // Link mode uses the stored user_id to bind the pending link to the initiator.

    const pendingCode = crypto.randomUUID();

    // We don't abort here, we let consume handle 409 if it mismatches.

    await c.env.DB.prepare(
      `INSERT INTO pending_links (code, provider, provider_user_id, expected_user_id, return_to, expires_at)
         VALUES (?, 'facebook', ?, ?, ?, ?)
         ON CONFLICT(provider, provider_user_id) WHERE consumed_at IS NULL
         DO UPDATE SET
           code = excluded.code,
           expected_user_id = excluded.expected_user_id,
           return_to = excluded.return_to,
           expires_at = excluded.expires_at`,
    )
      .bind(pendingCode, fbUserId, tx.user_id, tx.return_to, now + 600)
      .run();

    // Redirect to a specific route for linking?
    // Or reuse /link/facebook?
    // Frontend `/link/facebook` handles:
    // "If logged in: POST /auth/link/facebook/consume"

    // So yes, we can reuse it!
    return c.redirect(`/#/link/facebook?code=${pendingCode}`);
  }

  return c.json({ error: 'Invalid mode' }, 500);
});

app.post('/api/v1/auth/link/facebook/consume', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  let payload: { code: string };
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid request' }, 400);
  }
  if (!payload.code) {
    return c.json({ error: 'Invalid request' }, 400);
  }

  const now = Math.floor(Date.now() / 1000);

  // Fetch pending link
  const link = await c.env.DB.prepare(
    `SELECT * FROM pending_links WHERE code = ? AND provider = 'facebook'`,
  )
    .bind(payload.code)
    .first<PendingLinkRow>();

  if (!link) return c.json({ error: 'Invalid code' }, 404);
  if (link.expires_at < now) return c.json({ error: 'Code expired' }, 400);
  if (link.consumed_at) return c.json({ error: 'Code already consumed' }, 400);
  if (link.expected_user_id && link.expected_user_id !== user.id) {
    return c.json({ error: 'Link does not belong to this user' }, 403);
  }

  const { results: userIdentities } = await c.env.DB.prepare(
    `SELECT provider FROM identities WHERE user_id = ?`,
  )
    .bind(user.id)
    .all<{ provider: string }>();
  const hasGoogleIdentity = userIdentities.some((identity) => identity.provider === 'google');
  if (!hasGoogleIdentity && user.id !== link.provider_user_id) {
    await c.env.DB.prepare(
      `INSERT INTO identities (id, user_id, provider, provider_user_id, created_at, updated_at)
       VALUES (?, ?, 'google', ?, ?, ?)
       ON CONFLICT(provider, provider_user_id) DO NOTHING`,
    )
      .bind(crypto.randomUUID(), user.id, user.id, now, now)
      .run();
  }

  // Check collision
  const existing = await c.env.DB.prepare(
    `SELECT * FROM identities WHERE provider = 'facebook' AND provider_user_id = ?`,
  )
    .bind(link.provider_user_id)
    .first<IdentityRow>();

  if (existing && existing.user_id !== user.id) {
    await c.env.DB.prepare(`UPDATE pending_links SET consumed_at = ? WHERE code = ?`)
      .bind(now, payload.code)
      .run();
    return c.json({ error: 'Identity already linked to another account' }, 409);
  }

  if (!existing) {
    await c.env.DB.prepare(
      `INSERT INTO identities (id, user_id, provider, provider_user_id, created_at, updated_at)
       VALUES (?, ?, 'facebook', ?, ?, ?)`,
    )
      .bind(crypto.randomUUID(), user.id, link.provider_user_id, now, now)
      .run();
  }

  await c.env.DB.prepare(`UPDATE pending_links SET consumed_at = ? WHERE code = ?`)
    .bind(now, payload.code)
    .run();

  return c.json({ ok: true, returnTo: link.return_to });
});

app.post('/api/v1/auth/facebook/consume', async (c) => {
  let payload: { code: string };
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid request' }, 400);
  }
  if (!payload.code) {
    return c.json({ error: 'Invalid request' }, 400);
  }

  if (!(await enforceRateLimit(c, 'auth_link_facebook', 10, 60))) {
    return c.json({ error: 'Too many requests' }, 429);
  }

  const now = Math.floor(Date.now() / 1000);
  const loginCode = await c.env.DB.prepare(
    `SELECT * FROM oauth_login_codes WHERE code = ? AND provider = 'facebook'`,
  )
    .bind(payload.code)
    .first<OAuthLoginCodeRow>();

  if (!loginCode) return c.json({ error: 'Invalid code' }, 404);
  if (loginCode.expires_at < now) return c.json({ error: 'Code expired' }, 400);
  if (loginCode.consumed_at) return c.json({ error: 'Code already consumed' }, 400);

  const { meta } = await c.env.DB.prepare(
    `UPDATE oauth_login_codes
       SET consumed_at = ?
       WHERE code = ? AND consumed_at IS NULL AND expires_at >= ?`,
  )
    .bind(now, payload.code, now)
    .run();

  if (meta.changes === 0) {
    return c.json({ error: 'Code already consumed' }, 400);
  }

  const userRow = await c.env.DB.prepare(
    `SELECT user_id as userId, email, display_name as displayName, image_url as imageUrl
     FROM user_settings WHERE user_id = ? LIMIT 1`,
  )
    .bind(loginCode.user_id)
    .first<{
      userId: string;
      email: string;
      displayName?: string | null;
      imageUrl?: string | null;
    }>();

  if (!userRow) {
    return c.json({ error: 'User not found' }, 400);
  }

  const refreshToken = generateRefreshToken();
  const tokenHash = await hashToken(refreshToken);
  const expiresAt = Math.floor(Date.now() / 1000) + REFRESH_TOKEN_TTL_SECONDS;

  await c.env.DB.prepare(
    `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, last_used_at, provider)
     VALUES (?, ?, ?, ?, strftime('%s', 'now'), ?)`,
  )
    .bind(crypto.randomUUID(), userRow.userId, tokenHash, expiresAt, 'facebook')
    .run();

  const accessToken = await createJWT(
    userRow.userId,
    userRow.email,
    c.env.JWT_SECRET,
    3600,
    'facebook',
  );

  const { results: providerResults } = await c.env.DB.prepare(
    `SELECT provider FROM identities WHERE user_id = ?`,
  )
    .bind(userRow.userId)
    .all<{ provider: string }>();

  const providers = providerResults.map((row) => row.provider).filter(Boolean);
  if (!providers.includes('facebook')) {
    providers.push('facebook');
  }

  const role = await getUserRole(
    c.env.DB,
    { id: userRow.userId, email: userRow.email },
    normalizeEmail(c.env.ADMIN_EMAIL),
  );

  c.header('Set-Cookie', buildRefreshCookie(refreshToken));
  return c.json({
    accessToken,
    expiresIn: 3600,
    returnTo: loginCode.return_to,
    user: {
      id: userRow.userId,
      email: userRow.email,
      name: userRow.displayName ?? userRow.email,
      imageUrl: userRow.imageUrl ?? undefined,
      role,
      providers,
    },
  });
});

app.post('/api/v1/auth/link/google/consume', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  let payload: { code: string };
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid request' }, 400);
  }
  if (!payload.code) {
    return c.json({ error: 'Invalid request' }, 400);
  }

  if (!(await enforceRateLimit(c, 'auth_facebook_consume', 10, 60))) {
    return c.json({ error: 'Too many requests' }, 429);
  }

  const now = Math.floor(Date.now() / 1000);
  const link = await c.env.DB.prepare(
    `SELECT * FROM pending_links WHERE code = ? AND provider = 'google'`,
  )
    .bind(payload.code)
    .first<PendingLinkRow>();

  if (!link) return c.json({ error: 'Invalid code' }, 404);
  if (link.expires_at < now) return c.json({ error: 'Code expired' }, 400);
  if (link.consumed_at) return c.json({ error: 'Code already consumed' }, 400);

  const existing = await c.env.DB.prepare(
    `SELECT * FROM identities WHERE provider = 'google' AND provider_user_id = ?`,
  )
    .bind(link.provider_user_id)
    .first<IdentityRow>();

  if (existing && existing.user_id !== user.id) {
    await c.env.DB.prepare(`UPDATE pending_links SET consumed_at = ? WHERE code = ?`)
      .bind(now, payload.code)
      .run();
    return c.json({ error: 'Identity already linked to another account' }, 409);
  }

  if (!existing) {
    await c.env.DB.prepare(
      `INSERT INTO identities (id, user_id, provider, provider_user_id, created_at, updated_at)
       VALUES (?, ?, 'google', ?, ?, ?)`,
    )
      .bind(crypto.randomUUID(), user.id, link.provider_user_id, now, now)
      .run();
  }

  await c.env.DB.prepare(`UPDATE pending_links SET consumed_at = ? WHERE code = ?`)
    .bind(now, payload.code)
    .run();

  return c.json({ ok: true, returnTo: link.return_to });
});

app.delete('/api/v1/account', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const statements = [
    'DELETE FROM refresh_tokens WHERE user_id = ?',
    'DELETE FROM user_technique_progress WHERE user_id = ?',
    'DELETE FROM user_terminology_progress WHERE user_id = ?',
    'DELETE FROM user_wordquest_progress WHERE user_id = ?',
    'DELETE FROM user_game_state WHERE user_id = ?',
    'DELETE FROM user_cards WHERE user_id = ?',
    'DELETE FROM user_card_decks WHERE user_id = ?',
    'DELETE FROM user_training_sessions WHERE user_id = ?',
    'DELETE FROM user_gym_sessions WHERE user_id = ?',
    'DELETE FROM user_workout_plans WHERE user_id = ?',
    'DELETE FROM user_gym_exercises WHERE user_id = ?',
    'DELETE FROM user_gym_equipment WHERE user_id = ?',
    'DELETE FROM user_muscle_groups WHERE user_id = ?',
    'DELETE FROM user_equipment_categories WHERE user_id = ?',
    'DELETE FROM user_feedback WHERE user_id = ?',
    'DELETE FROM user_settings WHERE user_id = ?',
    'DELETE FROM user_roles WHERE user_id = ?',
    'DELETE FROM identities WHERE user_id = ?',
  ];

  const boundStatements = statements.map((sql) => c.env.DB.prepare(sql).bind(user.id));
  let transactionStarted = false;

  try {
    await c.env.DB.exec('BEGIN');
    transactionStarted = true;
  } catch (error) {
    console.warn('Account deletion transaction unavailable, falling back to batch', error);
  }

  if (!transactionStarted) {
    await c.env.DB.batch(boundStatements);
    return c.json({ ok: true });
  }

  try {
    for (const statement of boundStatements) {
      await statement.run();
    }
    await c.env.DB.exec('COMMIT');
  } catch (error) {
    try {
      await c.env.DB.exec('ROLLBACK');
    } catch (rollbackError) {
      console.warn('Account deletion rollback failed', rollbackError);
    }
    throw error;
  }

  return c.json({ ok: true });
});

app.get('/api/v1/settings', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const row = await c.env.DB.prepare(
    `SELECT settings_json as jsonBlob, updated_at as updatedAt, version FROM user_settings WHERE user_id = ? LIMIT 1`,
  )
    .bind(user.id)
    .first<{ jsonBlob: string; updatedAt: number | string; version: number } | null>();

  if (!row) {
    return c.json({ settings: null, updatedAt: null, version: 0 });
  }

  const parsed = parseSettings(row.jsonBlob);
  return c.json({ settings: parsed, updatedAt: row.updatedAt, version: row.version });
});

app.patch('/api/v1/settings', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  let payload: { expectedVersion: number; patch: Partial<PersistedSettings> };
  try {
    payload = await c.req.json();
    if (typeof payload.expectedVersion !== 'number')
      throw new Error('Missing associated expectedVersion');
  } catch {
    return c.json({ error: 'Invalid JSON or missing expectedVersion' }, 400);
  }

  // 1. Fetch current settings to merge and check version
  const current = await c.env.DB.prepare(
    `SELECT settings_json as jsonBlob, version, updated_at as updatedAt FROM user_settings WHERE user_id = ?`,
  )
    .bind(user.id)
    .first<{ jsonBlob: string; version: number; updatedAt: number | string } | null>();

  const currentVersion = current ? current.version : 0;

  if (
    currentVersion !== payload.expectedVersion &&
    !(currentVersion === 0 && payload.expectedVersion === 0)
  ) {
    // Conflict
    const currentSettings = current ? parseSettings(current.jsonBlob) : null;
    return c.json(
      {
        error: 'conflict',
        latest: {
          settings: currentSettings,
          version: currentVersion,
          updatedAt: current ? current.updatedAt : null,
        },
      },
      409,
    );
  }

  const currentSettings = current ? parseSettings(current.jsonBlob) : parseSettings('{}');
  const merged = { ...currentSettings, ...payload.patch };
  const sanitized = sanitizeSettings(merged);
  const serialized = JSON.stringify(sanitized);
  const now = new Date().toISOString();

  if (!current) {
    // Insert (Version starts at 1)
    await c.env.DB.prepare(
      `INSERT INTO user_settings (user_id, email, display_name, image_url, settings_json, version, updated_at)
         VALUES (?, ?, ?, ?, ?, 1, ?)`,
    )
      .bind(
        user.id,
        normalizeEmail(user.email),
        user.name || null,
        user.picture || null,
        serialized,
        now,
      )
      .run();

    return c.json({ settings: sanitized, version: 1, updatedAt: now });
  } else {
    // Update with version check
    const { meta } = await c.env.DB.prepare(
      `UPDATE user_settings 
         SET settings_json = ?, version = version + 1, updated_at = ?
         WHERE user_id = ? AND version = ?`,
    )
      .bind(serialized, now, user.id, payload.expectedVersion)
      .run();

    if (meta.changes === 0) {
      // Concurrent update happened
      const latest = await c.env.DB.prepare(
        `SELECT settings_json as jsonBlob, version, updated_at as updatedAt FROM user_settings WHERE user_id = ?`,
      )
        .bind(user.id)
        .first<{ jsonBlob: string; version: number; updatedAt: number | string }>();

      const latestSettings = latest ? parseSettings(latest.jsonBlob) : null;
      return c.json(
        {
          error: 'conflict',
          latest: {
            settings: latestSettings,
            version: latest?.version || 0,
            updatedAt: latest?.updatedAt || null,
          },
        },
        409,
      );
    }

    return c.json({ settings: sanitized, version: currentVersion + 1, updatedAt: now });
  }
});

// --- Admin Role Management ---

app.get('/api/v1/admin/users', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return unauthorized(c);

  const { results } = await c.env.DB.prepare(
    `SELECT user_id as userId,
            email,
            display_name as displayName,
            image_url as imageUrl,
            role,
            created_at as createdAt,
            updated_at as updatedAt
     FROM user_roles
     ORDER BY role DESC, email ASC`,
  ).all<{
    userId: string;
    email: string;
    displayName: string | null;
    imageUrl: string | null;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
  }>();

  // Fetch authentication methods for each user
  const usersWithAuthMethods = await Promise.all(
    (results || []).map(async (user) => {
      const { results: identities } = await c.env.DB.prepare(
        `SELECT provider FROM identities WHERE user_id = ?`,
      )
        .bind(user.userId)
        .all<{ provider: string }>();

      const providers = identities?.map((i) => i.provider) || [];

      return {
        ...user,
        authMethods: {
          google: providers.includes('google'),
          facebook: providers.includes('facebook'),
          email: providers.includes('email'),
        },
      };
    }),
  );

  return c.json({ users: usersWithAuthMethods });
});

app.post('/api/v1/admin/roles', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return unauthorized(c);

  let payload: { email: string; role: UserRole };
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid request' }, 400);
  }

  const normalizedEmail = normalizeEmail(payload?.email);
  if (!normalizedEmail) {
    return c.json({ error: 'Missing email' }, 400);
  }

  if (payload.role !== 'admin' && payload.role !== 'user') {
    return c.json({ error: 'Invalid role' }, 400);
  }

  const adminEmail = normalizeEmail(c.env.ADMIN_EMAIL);
  if (normalizedEmail === normalizeEmail(admin.email)) {
    return c.json({ error: 'Cannot change your own role' }, 400);
  }
  if (adminEmail && normalizedEmail === adminEmail && payload.role !== 'admin') {
    return c.json({ error: 'Cannot remove seeded admin role' }, 400);
  }

  const now = new Date().toISOString();
  await c.env.DB.prepare(
    `UPDATE user_roles
     SET role = ?, updated_at = ?
     WHERE email = ?`,
  )
    .bind(payload.role, now, normalizedEmail)
    .run();

  let updated = await c.env.DB.prepare(
    `SELECT user_id as userId,
            email,
            display_name as displayName,
            image_url as imageUrl,
            role,
            updated_at as updatedAt
     FROM user_roles
     WHERE email = ?`,
  )
    .bind(normalizedEmail)
    .first<{
      userId: string;
      email: string;
      displayName: string | null;
      imageUrl: string | null;
      role: UserRole;
      updatedAt: string;
    }>();

  if (!updated) {
    if (payload.role !== 'admin') {
      return c.json({ error: 'User not found' }, 404);
    }

    const pendingId = `pending:${normalizedEmail}`;
    await c.env.DB.prepare(
      `INSERT INTO user_roles (user_id, email, display_name, image_url, role, created_at, updated_at)
       VALUES (?, ?, NULL, NULL, ?, ?, ?)`,
    )
      .bind(pendingId, normalizedEmail, payload.role, now, now)
      .run();

    updated = await c.env.DB.prepare(
      `SELECT user_id as userId,
              email,
              display_name as displayName,
              image_url as imageUrl,
              role,
              updated_at as updatedAt
       FROM user_roles
       WHERE email = ?`,
    )
      .bind(normalizedEmail)
      .first<{
        userId: string;
        email: string;
        displayName: string | null;
        imageUrl: string | null;
        role: UserRole;
        updatedAt: string;
      }>();
  }

  return c.json({ user: updated });
});

// --- Technique Catalog Endpoints ---

app.get('/api/v1/techniques', async (c) => {
  const user = await requireUser(c);
  const role = user ? await getUserRole(c.env.DB, user, normalizeEmail(c.env.ADMIN_EMAIL)) : 'user';

  const query =
    role === 'admin'
      ? `SELECT id, data_json, kind, status, rank, created_at, updated_at, version FROM techniques`
      : `SELECT id, data_json, kind, status, rank, created_at, updated_at, version
         FROM techniques
         WHERE status = 'published'`;

  const { results } = await c.env.DB.prepare(query).all<TechniqueRow>();
  const techniques = (results || []).map((row) => techniqueFromRow(row));

  return c.json({ techniques });
});

app.post('/api/v1/techniques', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return unauthorized(c);

  let payload: Partial<TechniqueRecord> & { gradeId?: string; gradeIds?: string[] };
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid request' }, 400);
  }

  const technique = buildTechniqueForCreate(payload);
  if (!technique) {
    return c.json({ error: 'Invalid technique payload' }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO techniques (id, data_json, kind, status, rank, created_at, updated_at, version)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
  )
    .bind(
      technique.id,
      JSON.stringify(technique),
      technique.kind,
      technique.status,
      typeof technique.rank === 'number' ? technique.rank : null,
      technique.createdAt,
      technique.updatedAt,
    )
    .run();

  const gradeId =
    typeof payload.gradeId === 'string'
      ? payload.gradeId
      : Array.isArray(payload.gradeIds)
        ? payload.gradeIds[0]
        : undefined;
  await replaceTechniqueAssignments(c.env.DB, technique.id, gradeId);

  return c.json({ technique }, 201);
});

app.patch('/api/v1/techniques/:id', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return unauthorized(c);

  const id = c.req.param('id');
  if (!id) return c.json({ error: 'Missing technique id' }, 400);

  let payload: Partial<TechniqueRecord> & { gradeId?: string; gradeIds?: string[] };
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid request' }, 400);
  }

  const row = await c.env.DB.prepare(
    `SELECT id, data_json, kind, status, rank, created_at, updated_at, version
     FROM techniques
     WHERE id = ?`,
  )
    .bind(id)
    .first<TechniqueRow>();

  if (!row) return c.json({ error: 'Technique not found' }, 404);

  const existing = techniqueFromRow(row);
  const patch = parseTechniquePatch(payload);
  if (!patch) {
    return c.json({ error: 'Invalid technique patch' }, 400);
  }

  const updated = mergeTechnique(existing, patch);
  updated.updatedAt = new Date().toISOString();

  await c.env.DB.prepare(
    `UPDATE techniques
     SET data_json = ?, kind = ?, status = ?, rank = ?, updated_at = ?, version = version + 1
     WHERE id = ?`,
  )
    .bind(
      JSON.stringify(updated),
      updated.kind,
      updated.status,
      typeof updated.rank === 'number' ? updated.rank : null,
      updated.updatedAt,
      id,
    )
    .run();

  const gradeId =
    typeof payload.gradeId === 'string'
      ? payload.gradeId
      : Array.isArray(payload.gradeIds)
        ? payload.gradeIds[0]
        : undefined;
  await replaceTechniqueAssignments(c.env.DB, id, gradeId);

  return c.json({ technique: updated });
});

app.delete('/api/v1/techniques/:id', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return unauthorized(c);

  const id = c.req.param('id');
  if (!id) return c.json({ error: 'Missing technique id' }, 400);

  await c.env.DB.prepare(`DELETE FROM grade_techniques WHERE technique_id = ?`).bind(id).run();
  const { meta } = await c.env.DB.prepare(`DELETE FROM techniques WHERE id = ?`).bind(id).run();
  if (meta.changes === 0) {
    return c.json({ error: 'Technique not found' }, 404);
  }

  return c.json({ ok: true });
});

// --- Grade & Kata Catalog Endpoints ---

app.get('/api/v1/grades', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return unauthorized(c);

  const { results } = await c.env.DB.prepare(
    `SELECT id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version
     FROM grades`,
  ).all<GradeRow>();

  const curriculum = await loadCurriculumMap(c.env.DB);
  const grades = (results || []).map((row) => {
    const grade = gradeFromRow(row);
    const assignments = curriculum.get(grade.id) || { techniqueIds: [], kataIds: [] };
    return {
      ...grade,
      techniqueIds: assignments.techniqueIds,
      kataIds: assignments.kataIds,
    };
  });

  return c.json({ grades });
});

app.post('/api/v1/grades', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return unauthorized(c);

  let payload: Partial<GradeRecord> & { techniqueIds?: string[]; kataIds?: string[] };
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid request' }, 400);
  }

  const grade = buildGradeForCreate(payload);
  if (!grade) {
    return c.json({ error: 'Invalid grade payload' }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO grades (id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
  )
    .bind(
      grade.id,
      JSON.stringify(grade),
      grade.gradingSystemId,
      grade.kind,
      grade.number,
      typeof grade.rank === 'number' ? grade.rank : null,
      grade.beltColor,
      grade.sortOrder,
      grade.status,
      grade.createdAt,
      grade.updatedAt,
    )
    .run();

  await replaceGradeAssignments(c.env.DB, grade.id, payload.techniqueIds, payload.kataIds);

  return c.json({ grade }, 201);
});

app.patch('/api/v1/grades/:id', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return unauthorized(c);

  const id = c.req.param('id');
  if (!id) return c.json({ error: 'Missing grade id' }, 400);

  let payload: Partial<GradeRecord> & { techniqueIds?: string[]; kataIds?: string[] };
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid request' }, 400);
  }

  const row = await c.env.DB.prepare(
    `SELECT id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version
     FROM grades
     WHERE id = ?`,
  )
    .bind(id)
    .first<GradeRow>();

  if (!row) return c.json({ error: 'Grade not found' }, 404);

  const existing = gradeFromRow(row);
  const patch = parseGradePatch(payload);
  if (!patch && payload.techniqueIds === undefined && payload.kataIds === undefined) {
    return c.json({ error: 'Invalid grade patch' }, 400);
  }

  const updated = patch ? mergeGrade(existing, patch) : existing;
  updated.updatedAt = new Date().toISOString();

  if (patch) {
    await c.env.DB.prepare(
      `UPDATE grades
       SET data_json = ?, grading_system_id = ?, kind = ?, number = ?, rank = ?, belt_color = ?, sort_order = ?, status = ?, updated_at = ?, version = version + 1
       WHERE id = ?`,
    )
      .bind(
        JSON.stringify(updated),
        updated.gradingSystemId,
        updated.kind,
        updated.number,
        typeof updated.rank === 'number' ? updated.rank : null,
        updated.beltColor,
        updated.sortOrder,
        updated.status,
        updated.updatedAt,
        id,
      )
      .run();
  }

  await replaceGradeAssignments(c.env.DB, id, payload.techniqueIds, payload.kataIds);

  return c.json({ grade: updated });
});

app.delete('/api/v1/grades/:id', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return unauthorized(c);

  const id = c.req.param('id');
  if (!id) return c.json({ error: 'Missing grade id' }, 400);

  await c.env.DB.prepare(`DELETE FROM grade_techniques WHERE grade_id = ?`).bind(id).run();
  await c.env.DB.prepare(`DELETE FROM grade_katas WHERE grade_id = ?`).bind(id).run();
  const { meta } = await c.env.DB.prepare(`DELETE FROM grades WHERE id = ?`).bind(id).run();

  if (meta.changes === 0) {
    return c.json({ error: 'Grade not found' }, 404);
  }

  return c.json({ ok: true });
});

app.get('/api/v1/katas', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return unauthorized(c);

  const { results } = await c.env.DB.prepare(
    `SELECT id, data_json, status, rank, created_at, updated_at, version FROM katas`,
  ).all<KataRow>();

  const katas = (results || []).map((row) => kataFromRow(row));
  return c.json({ katas });
});

app.post('/api/v1/katas', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return unauthorized(c);

  let payload: Partial<KataRecord> & { gradeId?: string; gradeIds?: string[] };
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid request' }, 400);
  }

  const kata = buildKataForCreate(payload);
  if (!kata) {
    return c.json({ error: 'Invalid kata payload' }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO katas (id, data_json, status, rank, created_at, updated_at, version)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
  )
    .bind(
      kata.id,
      JSON.stringify(kata),
      kata.status,
      typeof kata.rank === 'number' ? kata.rank : null,
      kata.createdAt,
      kata.updatedAt,
    )
    .run();

  const gradeId =
    typeof payload.gradeId === 'string'
      ? payload.gradeId
      : Array.isArray(payload.gradeIds)
        ? payload.gradeIds[0]
        : undefined;
  await replaceKataAssignments(c.env.DB, kata.id, gradeId);

  return c.json({ kata }, 201);
});

app.patch('/api/v1/katas/:id', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return unauthorized(c);

  const id = c.req.param('id');
  if (!id) return c.json({ error: 'Missing kata id' }, 400);

  let payload: Partial<KataRecord> & { gradeId?: string; gradeIds?: string[] };
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid request' }, 400);
  }

  const row = await c.env.DB.prepare(
    `SELECT id, data_json, status, rank, created_at, updated_at, version FROM katas WHERE id = ?`,
  )
    .bind(id)
    .first<KataRow>();

  if (!row) return c.json({ error: 'Kata not found' }, 404);

  const existing = kataFromRow(row);
  const patch = parseKataPatch(payload);
  if (!patch) {
    return c.json({ error: 'Invalid kata patch' }, 400);
  }

  const updated = mergeKata(existing, patch);
  updated.updatedAt = new Date().toISOString();

  await c.env.DB.prepare(
    `UPDATE katas
     SET data_json = ?, status = ?, rank = ?, updated_at = ?, version = version + 1
     WHERE id = ?`,
  )
    .bind(
      JSON.stringify(updated),
      updated.status,
      typeof updated.rank === 'number' ? updated.rank : null,
      updated.updatedAt,
      id,
    )
    .run();

  const gradeId =
    typeof payload.gradeId === 'string'
      ? payload.gradeId
      : Array.isArray(payload.gradeIds)
        ? payload.gradeIds[0]
        : undefined;
  await replaceKataAssignments(c.env.DB, id, gradeId);

  return c.json({ kata: updated });
});

app.delete('/api/v1/katas/:id', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return unauthorized(c);

  const id = c.req.param('id');
  if (!id) return c.json({ error: 'Missing kata id' }, 400);

  await c.env.DB.prepare(`DELETE FROM grade_katas WHERE kata_id = ?`).bind(id).run();
  const { meta } = await c.env.DB.prepare(`DELETE FROM katas WHERE id = ?`).bind(id).run();

  if (meta.changes === 0) {
    return c.json({ error: 'Kata not found' }, 404);
  }

  return c.json({ ok: true });
});

// --- Catalog Endpoint ---

app.get('/api/v1/catalog', async (c) => {
  const user = await requireUser(c);
  const role = user ? await getUserRole(c.env.DB, user, normalizeEmail(c.env.ADMIN_EMAIL)) : 'user';

  const techniquesQuery =
    role === 'admin'
      ? `SELECT id, data_json, kind, status, rank, created_at, updated_at, version FROM techniques`
      : `SELECT id, data_json, kind, status, rank, created_at, updated_at, version
         FROM techniques
         WHERE status = 'published'`;
  const katasQuery =
    role === 'admin'
      ? `SELECT id, data_json, status, rank, created_at, updated_at, version FROM katas`
      : `SELECT id, data_json, status, rank, created_at, updated_at, version
         FROM katas
         WHERE status = 'published'`;
  const gradesQuery =
    role === 'admin'
      ? `SELECT id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version
         FROM grades`
      : `SELECT id, data_json, grading_system_id, kind, number, rank, belt_color, sort_order, status, created_at, updated_at, version
         FROM grades
         WHERE status = 'published'`;

  const [{ results: techniqueRows }, { results: kataRows }, { results: gradeRows }] =
    await Promise.all([
      c.env.DB.prepare(techniquesQuery).all<TechniqueRow>(),
      c.env.DB.prepare(katasQuery).all<KataRow>(),
      c.env.DB.prepare(gradesQuery).all<GradeRow>(),
    ]);

  const techniques = (techniqueRows || []).map((row) => techniqueFromRow(row));
  const katas = (kataRows || []).map((row) => kataFromRow(row));
  const grades = (gradeRows || []).map((row) => gradeFromRow(row));

  const techniqueMap = Object.fromEntries(techniques.map((technique) => [technique.id, technique]));
  const kataMap = Object.fromEntries(katas.map((kata) => [kata.id, kata]));
  const gradeMap = Object.fromEntries(grades.map((grade) => [grade.id, grade]));

  const curriculumMap = await loadCurriculumMap(c.env.DB);
  const curriculum: Record<string, { techIds: string[]; kataIds: string[] }> = {};

  for (const grade of grades) {
    const assignments = curriculumMap.get(grade.id) || { techniqueIds: [], kataIds: [] };
    const techIds = assignments.techniqueIds.filter((id) => Boolean(techniqueMap[id]));
    const kataIds = assignments.kataIds.filter((id) => Boolean(kataMap[id]));
    curriculum[grade.id] = { techIds, kataIds };
  }

  return c.json({
    store: {
      terms: {},
      techniques: techniqueMap,
      katas: kataMap,
      gradingSystems: {},
      grades: gradeMap,
      media: {},
      sources: {},
    },
    curriculum,
  });
});

// --- Quote Endpoints ---

app.get('/api/v1/quotes', async (c) => {
  const user = await requireUser(c);
  const role = user ? await getUserRole(c.env.DB, user, normalizeEmail(c.env.ADMIN_EMAIL)) : 'user';

  const query =
    role === 'admin'
      ? `SELECT id, data_json, author, status, created_at, updated_at, sort_order, version FROM quotes ORDER BY sort_order ASC`
      : `SELECT id, data_json, author, status, created_at, updated_at, sort_order, version
         FROM quotes
         WHERE status = 'published'
         ORDER BY sort_order ASC`;

  const { results } = await c.env.DB.prepare(query).all<QuoteRow>();
  const quotes = (results || []).map((row) => quoteFromRow(row));

  return c.json({ quotes });
});

app.post('/api/v1/quotes', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return unauthorized(c);

  let payload: Partial<QuoteRecord>;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid request' }, 400);
  }

  const quote = buildQuoteForCreate(payload);
  if (!quote) {
    return c.json({ error: 'Invalid quote payload' }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, sort_order, version)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
  )
    .bind(
      quote.id,
      JSON.stringify(quote),
      quote.author,
      quote.status,
      quote.createdAt,
      quote.updatedAt,
      quote.sortOrder,
    )
    .run();

  return c.json({ quote }, 201);
});

app.patch('/api/v1/quotes/:id', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return unauthorized(c);

  const id = c.req.param('id');
  if (!id) return c.json({ error: 'Missing quote id' }, 400);

  let payload: Partial<QuoteRecord>;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid request' }, 400);
  }

  const row = await c.env.DB.prepare(
    `SELECT id, data_json, author, status, created_at, updated_at, sort_order, version
     FROM quotes
     WHERE id = ?`,
  )
    .bind(id)
    .first<QuoteRow>();

  if (!row) return c.json({ error: 'Quote not found' }, 404);

  const existing = quoteFromRow(row);
  const patch = parseQuotePatch(payload);
  if (!patch) {
    return c.json({ error: 'Invalid quote patch' }, 400);
  }

  const updated = mergeQuote(existing, patch);
  updated.updatedAt = new Date().toISOString();

  await c.env.DB.prepare(
    `UPDATE quotes
     SET data_json = ?, author = ?, status = ?, updated_at = ?, sort_order = ?, version = version + 1
     WHERE id = ?`,
  )
    .bind(
      JSON.stringify(updated),
      updated.author,
      updated.status,
      updated.updatedAt,
      updated.sortOrder,
      id,
    )
    .run();

  return c.json({ quote: updated });
});

app.delete('/api/v1/quotes/:id', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return unauthorized(c);

  const id = c.req.param('id');
  if (!id) return c.json({ error: 'Missing quote id' }, 400);

  const { meta } = await c.env.DB.prepare(`DELETE FROM quotes WHERE id = ?`).bind(id).run();
  if (meta.changes === 0) {
    return c.json({ error: 'Quote not found' }, 404);
  }

  return c.json({ ok: true });
});

// --- Motto Endpoints ---

app.get('/api/v1/mottos', async (c) => {
  const user = await requireUser(c);
  const role = user ? await getUserRole(c.env.DB, user, normalizeEmail(c.env.ADMIN_EMAIL)) : 'user';

  const query =
    role === 'admin'
      ? `SELECT id, data_json, status, created_at, updated_at, sort_order, version FROM mottos ORDER BY sort_order ASC`
      : `SELECT id, data_json, status, created_at, updated_at, sort_order, version
         FROM mottos
         WHERE status = 'published'
         ORDER BY sort_order ASC`;

  const { results } = await c.env.DB.prepare(query).all<MottoRow>();
  const mottos = (results || []).map((row) => mottoFromRow(row));

  return c.json({ mottos });
});

app.post('/api/v1/mottos', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return unauthorized(c);

  let payload: Partial<MottoRecord>;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid request' }, 400);
  }

  const motto = buildMottoForCreate(payload);
  if (!motto) {
    return c.json({ error: 'Invalid motto payload' }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO mottos (id, data_json, status, created_at, updated_at, sort_order, version)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
  )
    .bind(
      motto.id,
      JSON.stringify(motto),
      motto.status,
      motto.createdAt,
      motto.updatedAt,
      motto.sortOrder,
    )
    .run();

  return c.json({ motto }, 201);
});

app.patch('/api/v1/mottos/:id', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return unauthorized(c);

  const id = c.req.param('id');
  if (!id) return c.json({ error: 'Missing motto id' }, 400);

  let payload: Partial<MottoRecord>;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid request' }, 400);
  }

  const row = await c.env.DB.prepare(
    `SELECT id, data_json, status, created_at, updated_at, sort_order, version
     FROM mottos
     WHERE id = ?`,
  )
    .bind(id)
    .first<MottoRow>();

  if (!row) return c.json({ error: 'Motto not found' }, 404);

  const existing = mottoFromRow(row);
  const patch = parseMottoPatch(payload);
  if (!patch) {
    return c.json({ error: 'Invalid motto patch' }, 400);
  }

  const updated = mergeMotto(existing, patch);
  updated.updatedAt = new Date().toISOString();

  await c.env.DB.prepare(
    `UPDATE mottos
     SET data_json = ?, status = ?, updated_at = ?, sort_order = ?, version = version + 1
     WHERE id = ?`,
  )
    .bind(JSON.stringify(updated), updated.status, updated.updatedAt, updated.sortOrder, id)
    .run();

  return c.json({ motto: updated });
});

app.delete('/api/v1/mottos/:id', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return unauthorized(c);

  const id = c.req.param('id');
  if (!id) return c.json({ error: 'Missing motto id' }, 400);

  const { meta } = await c.env.DB.prepare(`DELETE FROM mottos WHERE id = ?`).bind(id).run();
  if (meta.changes === 0) {
    return c.json({ error: 'Motto not found' }, 404);
  }

  return c.json({ ok: true });
});

// --- Technique Progress Endpoints ---

interface TechniqueProgressRow {
  techniqueId: string;
  status: string;
  rating: number;
  notes: string;
  tags: string | null;
  videoLinks: string | null;
  updatedAt: number;
  version: number;
}

app.get('/api/v1/technique-progress', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const { results } = await c.env.DB.prepare(
    `SELECT technique_id as techniqueId, status, rating, notes, tags, video_links as videoLinks, updated_at as updatedAt, version 
     FROM user_technique_progress 
     WHERE user_id = ?`,
  )
    .bind(user.id)
    .all<TechniqueProgressRow>();

  // Parse JSON fields
  const parsed = results.map((row) => ({
    ...row,
    tags: parseJsonSafely(row.tags, []),
    videoLinks: parseJsonSafely(row.videoLinks, []),
    // Ensure numbers/dates are correct types
    rating: Number(row.rating),
    updatedAt: row.updatedAt,
    version: row.version,
  }));

  return c.json({ progress: parsed });
});

app.patch('/api/v1/technique-progress/:techniqueId', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const techniqueId = c.req.param('techniqueId');

  let payload: {
    expectedVersion: number;
    patch: {
      status?: string;
      rating?: number;
      notes?: string;
      tags?: string[];
      videoLinks?: string[];
    };
  };

  try {
    payload = await c.req.json();
    if (typeof payload.expectedVersion !== 'number') throw new Error('Missing expectedVersion');
  } catch {
    return c.json({ error: 'Invalid JSON or missing expectedVersion' }, 400);
  }

  // Pre-process patch to match DB columns
  const dbPatch: Record<string, any> = {};
  if (payload.patch.status !== undefined) dbPatch.status = payload.patch.status;
  if (payload.patch.rating !== undefined) dbPatch.rating = payload.patch.rating;
  if (payload.patch.notes !== undefined) dbPatch.notes = payload.patch.notes;
  if (payload.patch.tags !== undefined) dbPatch.tags = JSON.stringify(payload.patch.tags);
  if (payload.patch.videoLinks !== undefined)
    dbPatch.video_links = JSON.stringify(payload.patch.videoLinks);

  // Allow list for DB columns
  const allowList = ['status', 'rating', 'notes', 'tags', 'video_links'];

  // Handle version 0 (create)
  if (payload.expectedVersion === 0) {
    const current = await c.env.DB.prepare(
      `SELECT version FROM user_technique_progress WHERE user_id = ? AND technique_id = ?`,
    )
      .bind(user.id, techniqueId)
      .first<{ version: number } | null>();

    if (!current) {
      const now = new Date().toISOString();
      const p = payload.patch;

      await c.env.DB.prepare(
        `INSERT INTO user_technique_progress 
             (user_id, technique_id, status, rating, notes, tags, video_links, version, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      )
        .bind(
          user.id,
          techniqueId,
          p.status ?? 'not-started',
          p.rating ?? 0,
          p.notes ?? '',
          JSON.stringify(p.tags ?? []),
          JSON.stringify(p.videoLinks ?? []),
          now,
        )
        .run();

      return c.json({
        status: p.status ?? 'not-started',
        rating: p.rating ?? 0,
        notes: p.notes ?? '',
        tags: p.tags ?? [],
        videoLinks: p.videoLinks ?? [],
        updatedAt: now,
        version: 1,
        techniqueId,
      });
    }
  }

  // Use helper
  const result = await performOptimisticUpdate(
    c.env.DB,
    'user_technique_progress',
    user.id,
    techniqueId,
    payload.expectedVersion,
    dbPatch,
    allowList,
    'technique_id',
  );

  if (result.ok) {
    const row = result.data as any;
    return c.json({
      techniqueId: row.technique_id,
      status: row.status,
      rating: row.rating,
      notes: row.notes,
      tags: parseJsonSafely(row.tags, []),
      videoLinks: parseJsonSafely(row.video_links, []),
      updatedAt: row.updated_at,
      version: row.version,
    });
  } else {
    const row = result.latest as any;
    if (!row) return c.json({ error: 'not_found' }, 404);

    const latest = {
      techniqueId: row.technique_id,
      status: row.status,
      rating: row.rating,
      notes: row.notes,
      tags: parseJsonSafely(row.tags, []),
      videoLinks: parseJsonSafely(row.video_links, []),
      updatedAt: row.updated_at,
      version: row.version,
    };
    return c.json({ error: 'conflict', latest }, 409);
  }
});

// --- Terminology Progress Endpoints ---

interface TerminologyProgressRow {
  termId: string;
  isBookmarked: number;
  updatedAt: number;
}

app.get('/api/v1/terminology-progress', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const { results } = await c.env.DB.prepare(
    `SELECT term_id as termId, is_bookmarked as isBookmarked, updated_at as updatedAt 
     FROM user_terminology_progress 
     WHERE user_id = ? AND is_bookmarked = 1`,
  )
    .bind(user.id)
    .all<TerminologyProgressRow>();

  // Use optional chaining to safely access results, defaulting to empty array if undefined
  const bookmarks = (results || []).map((row) => row.termId);

  return c.json({ bookmarks });
});

app.post('/api/v1/terminology-progress', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  let payload: {
    termId: string;
    isBookmarked: boolean;
  };

  try {
    payload = await c.req.json();
    if (!payload.termId) throw new Error('Missing termId');
  } catch {
    return c.json({ error: 'Invalid JSON or missing termId' }, 400);
  }

  const isBookmarkedInt = payload.isBookmarked ? 1 : 0;

  await c.env.DB.prepare(
    `INSERT INTO user_terminology_progress 
       (user_id, term_id, is_bookmarked, updated_at)
     VALUES (?, ?, ?, strftime('%s','now'))
     ON CONFLICT(user_id, term_id) DO UPDATE SET
       is_bookmarked = excluded.is_bookmarked,
       updated_at = excluded.updated_at`,
  )
    .bind(user.id, payload.termId, isBookmarkedInt)
    .run();

  return c.json({ ok: true });
});

// --- WordQuest Endpoints ---

interface WordQuestProgressRow {
  techniqueId: string;
}

app.get('/api/v1/wordquest/progress', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const { results } = await c.env.DB.prepare(
    `SELECT technique_id as techniqueId FROM user_wordquest_progress WHERE user_id = ?`,
  )
    .bind(user.id)
    .all<WordQuestProgressRow>();

  const solvedIds = (results || []).map((row) => row.techniqueId);
  return c.json({ solvedIds });
});

app.post('/api/v1/wordquest/progress', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  let payload: { techniqueId: string };
  try {
    payload = await c.req.json();
    if (!payload.techniqueId) throw new Error('Missing techniqueId');
  } catch {
    return c.json({ error: 'Invalid JSON or missing techniqueId' }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO user_wordquest_progress (user_id, technique_id, solved_at)
     VALUES (?, ?, strftime('%s','now'))
     ON CONFLICT(user_id, technique_id) DO NOTHING`,
  )
    .bind(user.id, payload.techniqueId)
    .run();

  return c.json({ ok: true });
});

app.get('/api/v1/wordquest/state/:gameId', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const gameId = c.req.param('gameId');

  const row = await c.env.DB.prepare(
    `SELECT data FROM user_game_state WHERE user_id = ? AND game_id = ?`,
  )
    .bind(user.id, gameId)
    .first<{ data: string } | null>();

  const state = row ? parseJsonSafely(row.data, {}) : {};
  return c.json({ state });
});

app.post('/api/v1/wordquest/state/:gameId', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const gameId = c.req.param('gameId');

  let payload: unknown;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  const dataJson = JSON.stringify(payload);

  await c.env.DB.prepare(
    `INSERT INTO user_game_state (user_id, game_id, data, updated_at)
     VALUES (?, ?, ?, strftime('%s','now'))
     ON CONFLICT(user_id, game_id) DO UPDATE SET
       data = excluded.data,
       updated_at = excluded.updated_at`,
  )
    .bind(user.id, gameId, dataJson)
    .run();

  return c.json({ ok: true });
});

// --- Card & Deck Endpoints ---

interface DeckRow {
  id: string;
  name: string;
  description: string | null;
  updatedAt: number;
  version: number;
}

interface CardRow {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  deckId: string | null;
  updatedAt: number;
  version: number;
}

// Decks
app.get('/api/v1/decks', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const { results } = await c.env.DB.prepare(
    `SELECT id, name, description, updated_at as updatedAt, version FROM user_card_decks WHERE user_id = ?`,
  )
    .bind(user.id)
    .all<DeckRow>();

  const decks = (results || []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    version: row.version,
    updatedAt: row.updatedAt,
    cardIds: [],
  }));
  return c.json({ decks });
});

app.post('/api/v1/decks', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  let payload: { id: string; name: string; description?: string };
  try {
    payload = await c.req.json();
    if (!payload.id || !payload.name) throw new Error('Missing fields');
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  const now = new Date().toISOString();

  try {
    await c.env.DB.prepare(
      `INSERT INTO user_card_decks (user_id, id, name, description, updated_at, version)
         VALUES (?, ?, ?, ?, ?, 0)`,
    )
      .bind(user.id, payload.id, payload.name, payload.description || null, now)
      .run();

    return c.json({ ok: true, version: 0, updatedAt: now });
  } catch (e: any) {
    if (e.message && e.message.includes('UNIQUE')) {
      return c.json({ error: 'conflict_exists' }, 409);
    }
    throw e;
  }
});

app.patch('/api/v1/decks/:id', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const id = c.req.param('id');

  let payload: { expectedVersion: number; patch: Record<string, any> };
  try {
    payload = await c.req.json();
    if (typeof payload.expectedVersion !== 'number') throw new Error('Missing expectedVersion');
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  const allowList = ['name', 'description'];

  const result = await performOptimisticUpdate(
    c.env.DB,
    'user_card_decks',
    user.id,
    id,
    payload.expectedVersion,
    payload.patch,
    allowList,
  );

  if (result.ok) {
    const row = result.data as any;
    return c.json({
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      updatedAt: row.updated_at,
      version: row.version,
    });
  } else {
    const row = result.latest as any;
    if (!row) return c.json({ error: 'not_found' }, 404);
    return c.json(
      {
        error: 'conflict',
        latest: {
          id: row.id,
          name: row.name,
          description: row.description,
          updatedAt: row.updated_at,
          version: row.version,
        },
      },
      409,
    );
  }
});

app.delete('/api/v1/decks/:id', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const id = c.req.param('id');

  await c.env.DB.batch([
    c.env.DB.prepare(`DELETE FROM user_card_decks WHERE user_id = ? AND id = ?`).bind(user.id, id),
    // Also remove deckId from cards, or delete cards?
    // Logic in frontend was: set deckId=undefined.
    // In DB, if we delete deck, we should update cards to have deck_id = NULL
    c.env.DB.prepare(`UPDATE user_cards SET deck_id = NULL WHERE user_id = ? AND deck_id = ?`).bind(
      user.id,
      id,
    ),
  ]);

  return c.json({ ok: true });
});

// Cards
app.get('/api/v1/cards', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const { results } = await c.env.DB.prepare(
    `SELECT id, question, answer, category, deck_id as deckId, updated_at as updatedAt, version FROM user_cards WHERE user_id = ?`,
  )
    .bind(user.id)
    .all<CardRow>();

  const cards = (results || []).map((row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category || undefined,
    deckId: row.deckId || undefined,
    version: row.version,
    updatedAt: row.updatedAt,
  }));
  return c.json({ cards });
});

app.post('/api/v1/cards', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  let payload: { id: string; question: string; answer: string; category?: string; deckId?: string };
  try {
    payload = await c.req.json();
    if (!payload.id || !payload.question || !payload.answer) throw new Error('Missing fields');
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  const now = new Date().toISOString();

  try {
    await c.env.DB.prepare(
      `INSERT INTO user_cards (user_id, id, question, answer, category, deck_id, updated_at, version)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    )
      .bind(
        user.id,
        payload.id,
        payload.question,
        payload.answer,
        payload.category || null,
        payload.deckId || null,
        now,
      )
      .run();

    return c.json({ ok: true, version: 0, updatedAt: now });
  } catch (e: any) {
    if (e.message && e.message.includes('UNIQUE')) {
      return c.json({ error: 'conflict_exists' }, 409);
    }
    throw e;
  }
});

app.patch('/api/v1/cards/:id', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const id = c.req.param('id');

  let payload: { expectedVersion: number; patch: Record<string, any> };
  try {
    payload = await c.req.json();
    if (typeof payload.expectedVersion !== 'number') throw new Error('Missing expectedVersion');
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  const allowList = ['question', 'answer', 'category', 'deck_id'];

  const dbPatch: Record<string, any> = { ...payload.patch };
  if (dbPatch.deckId !== undefined) {
    dbPatch.deck_id = dbPatch.deckId;
    delete dbPatch.deckId;
  }

  const result = await performOptimisticUpdate(
    c.env.DB,
    'user_cards',
    user.id,
    id,
    payload.expectedVersion,
    dbPatch,
    allowList,
  );

  if (result.ok) {
    const row = result.data as any;
    return c.json({
      id: row.id,
      question: row.question,
      answer: row.answer,
      category: row.category,
      deckId: row.deck_id,
      updatedAt: row.updated_at,
      version: row.version,
    });
  } else {
    const row = result.latest as any;
    if (!row) return c.json({ error: 'not_found' }, 404);
    return c.json(
      {
        error: 'conflict',
        latest: {
          id: row.id,
          question: row.question,
          answer: row.answer,
          category: row.category,
          deckId: row.deck_id,
          updatedAt: row.updated_at,
          version: row.version,
        },
      },
      409,
    );
  }
});

app.delete('/api/v1/cards/:id', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const id = c.req.param('id');

  await c.env.DB.prepare(`DELETE FROM user_cards WHERE user_id = ? AND id = ?`)
    .bind(user.id, id)
    .run();

  return c.json({ ok: true });
});

// --- TrainingSession Endpoints ---

interface TrainingSessionRow {
  id: string;
  date: string;
  type: string;
  duration: number;
  intensity: string | null;
  notes: string | null;
  updatedAt: number;
  version: number;
}

app.get('/api/v1/training-sessions', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const { results } = await c.env.DB.prepare(
    `SELECT id, date, type, duration, intensity, notes, updated_at as updatedAt, version 
     FROM user_training_sessions 
     WHERE user_id = ?
     ORDER BY date DESC`,
  )
    .bind(user.id)
    .all<TrainingSessionRow>();

  const sessions = (results || []).map((row) => ({
    id: row.id,
    date: row.date,
    type: row.type,
    duration: row.duration,
    intensity: row.intensity || undefined,
    notes: row.notes || undefined,
    version: row.version,
    updatedAt: row.updatedAt,
  }));
  return c.json({ sessions });
});

app.post('/api/v1/training-sessions', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  let payload: {
    id: string;
    date: string;
    type: string;
    duration: number;
    intensity?: string;
    notes?: string;
  };
  try {
    payload = await c.req.json();
    if (!payload.id || !payload.date || !payload.type) throw new Error('Missing fields');
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  const now = new Date().toISOString();

  try {
    await c.env.DB.prepare(
      `INSERT INTO user_training_sessions (user_id, id, date, type, duration, intensity, notes, created_at, updated_at, version)
         VALUES (?, ?, ?, ?, ?, ?, ?, strftime('%s','now'), ?, 0)`,
    )
      .bind(
        user.id,
        payload.id,
        payload.date,
        payload.type,
        payload.duration,
        payload.intensity || null,
        payload.notes || null,
        now,
      )
      .run();

    return c.json({ ok: true, version: 0, updatedAt: now });
  } catch (e: any) {
    if (e.message && e.message.includes('UNIQUE')) {
      return c.json({ error: 'conflict_exists' }, 409);
    }
    throw e;
  }
});

app.patch('/api/v1/training-sessions/:id', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const id = c.req.param('id');

  let payload: { expectedVersion: number; patch: Record<string, any> };
  try {
    payload = await c.req.json();
    if (typeof payload.expectedVersion !== 'number') throw new Error('Missing expectedVersion');
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  const allowList = ['date', 'type', 'duration', 'intensity', 'notes'];

  const result = await performOptimisticUpdate(
    c.env.DB,
    'user_training_sessions',
    user.id,
    id,
    payload.expectedVersion,
    payload.patch,
    allowList,
  );

  if (result.ok) {
    const row = result.data as any;
    return c.json({
      id: row.id,
      date: row.date,
      type: row.type,
      duration: row.duration,
      intensity: row.intensity || undefined,
      notes: row.notes || undefined,
      updatedAt: row.updated_at,
      version: row.version,
    });
  } else {
    const row = result.latest as any;
    if (!row) return c.json({ error: 'not_found' }, 404);

    const latest = {
      id: row.id,
      date: row.date,
      type: row.type,
      duration: row.duration,
      intensity: row.intensity || undefined,
      notes: row.notes || undefined,
      updatedAt: row.updated_at,
      version: row.version,
    };
    return c.json({ error: 'conflict', latest }, 409);
  }
});

app.delete('/api/v1/training-sessions/:id', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const id = c.req.param('id');

  await c.env.DB.prepare(`DELETE FROM user_training_sessions WHERE user_id = ? AND id = ?`)
    .bind(user.id, id)
    .run();

  return c.json({ ok: true });
});

// --- Gym Endpoints ---

// 1. Gym Sessions
app.get('/api/v1/gym/sessions', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM user_gym_sessions WHERE user_id = ? ORDER BY date DESC`,
  )
    .bind(user.id)
    .all();
  const sessions = (results || []).map((row: any) => ({
    ...row,
    exercises: parseJsonSafely(row.exercises, []),
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    workoutPlanId: row.workout_plan_id,
  }));
  return c.json({ sessions });
});

app.post('/api/v1/gym/sessions', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  let payload: any;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO user_gym_sessions (user_id, id, workout_plan_id, date, exercises, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, strftime('%s','now'), strftime('%s','now'))
     ON CONFLICT(user_id, id) DO UPDATE SET
       workout_plan_id = excluded.workout_plan_id,
       date = excluded.date,
       exercises = excluded.exercises,
       updated_at = excluded.updated_at`,
  )
    .bind(
      user.id,
      payload.id,
      payload.workoutPlanId || null,
      payload.date,
      JSON.stringify(payload.exercises || []),
    )
    .run();

  return c.json({ ok: true });
});

app.delete('/api/v1/gym/sessions/:id', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  await c.env.DB.prepare(`DELETE FROM user_gym_sessions WHERE user_id = ? AND id = ?`)
    .bind(user.id, c.req.param('id'))
    .run();
  return c.json({ ok: true });
});

// 2. Gym Workout Plans
app.get('/api/v1/gym/plans', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const { results } = await c.env.DB.prepare(`SELECT * FROM user_workout_plans WHERE user_id = ?`)
    .bind(user.id)
    .all();
  const plans = (results || []).map((row: any) => ({
    ...row,
    exercises: parseJsonSafely(row.exercises, []),
  }));
  return c.json({ plans });
});

app.post('/api/v1/gym/plans', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  let payload: any;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO user_workout_plans (user_id, id, name, exercises, created_at, updated_at)
     VALUES (?, ?, ?, ?, strftime('%s','now'), strftime('%s','now'))
     ON CONFLICT(user_id, id) DO UPDATE SET
       name = excluded.name,
       exercises = excluded.exercises,
       updated_at = excluded.updated_at`,
  )
    .bind(user.id, payload.id, payload.name, JSON.stringify(payload.exercises || []))
    .run();
  return c.json({ ok: true });
});

app.delete('/api/v1/gym/plans/:id', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  await c.env.DB.prepare(`DELETE FROM user_workout_plans WHERE user_id = ? AND id = ?`)
    .bind(user.id, c.req.param('id'))
    .run();
  return c.json({ ok: true });
});

// 3. Gym Exercises
app.get('/api/v1/gym/exercises', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const { results } = await c.env.DB.prepare(`SELECT * FROM user_gym_exercises WHERE user_id = ?`)
    .bind(user.id)
    .all();
  const exercises = (results || []).map((row: any) => ({
    ...row,
    muscleGroupIds: parseJsonSafely(row.muscle_group_ids, []),
    equipmentIds: parseJsonSafely(row.equipment_ids, []),
  }));
  return c.json({ exercises });
});

app.post('/api/v1/gym/exercises', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  let payload: any;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO user_gym_exercises (user_id, id, name, muscle_group_ids, equipment_ids, how, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, strftime('%s','now'), strftime('%s','now'))
     ON CONFLICT(user_id, id) DO UPDATE SET
       name = excluded.name,
       muscle_group_ids = excluded.muscle_group_ids,
       equipment_ids = excluded.equipment_ids,
       how = excluded.how,
       updated_at = excluded.updated_at`,
  )
    .bind(
      user.id,
      payload.id,
      payload.name,
      JSON.stringify(payload.muscleGroupIds || []),
      JSON.stringify(payload.equipmentIds || []),
      payload.how || '',
    )
    .run();
  return c.json({ ok: true });
});

app.delete('/api/v1/gym/exercises/:id', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  await c.env.DB.prepare(`DELETE FROM user_gym_exercises WHERE user_id = ? AND id = ?`)
    .bind(user.id, c.req.param('id'))
    .run();
  return c.json({ ok: true });
});

// 4. Gym Equipment
app.get('/api/v1/gym/equipment', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const { results } = await c.env.DB.prepare(`SELECT * FROM user_gym_equipment WHERE user_id = ?`)
    .bind(user.id)
    .all();

  // Map category_id to categoryId for frontend compatibility
  const equipment = results.map((item: any) => ({
    id: item.id,
    userId: item.user_id,
    name: item.name,
    description: item.description,
    categoryId: item.category_id,
  }));

  return c.json({ equipment });
});

app.post('/api/v1/gym/equipment', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  let payload: any;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO user_gym_equipment (user_id, id, name, description, category_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, strftime('%s','now'), strftime('%s','now'))
     ON CONFLICT(user_id, id) DO UPDATE SET
       name = excluded.name,
       description = excluded.description,
       category_id = excluded.category_id,
       updated_at = excluded.updated_at`,
  )
    .bind(user.id, payload.id, payload.name, payload.description || '', payload.categoryId || null)
    .run();
  return c.json({ ok: true });
});

app.delete('/api/v1/gym/equipment/:id', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  await c.env.DB.prepare(`DELETE FROM user_gym_equipment WHERE user_id = ? AND id = ?`)
    .bind(user.id, c.req.param('id'))
    .run();
  return c.json({ ok: true });
});

// 4b. Equipment Categories
app.get('/api/v1/gym/equipment-categories', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM user_equipment_categories WHERE user_id = ?`,
  )
    .bind(user.id)
    .all();
  return c.json({ categories: results });
});

app.post('/api/v1/gym/equipment-categories', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  let payload: any;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO user_equipment_categories (user_id, id, name, description, color, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, strftime('%s','now'), strftime('%s','now'))
     ON CONFLICT(user_id, id) DO UPDATE SET
       name = excluded.name,
       description = excluded.description,
       color = excluded.color,
       updated_at = excluded.updated_at`,
  )
    .bind(user.id, payload.id, payload.name, payload.description || '', payload.color || null)
    .run();
  return c.json({ ok: true });
});

app.delete('/api/v1/gym/equipment-categories/:id', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const categoryId = c.req.param('id');

  // Set category_id to null for all equipment in this category
  await c.env.DB.prepare(
    `UPDATE user_gym_equipment SET category_id = NULL WHERE user_id = ? AND category_id = ?`,
  )
    .bind(user.id, categoryId)
    .run();

  // Delete the category
  await c.env.DB.prepare(`DELETE FROM user_equipment_categories WHERE user_id = ? AND id = ?`)
    .bind(user.id, categoryId)
    .run();
  return c.json({ ok: true });
});

// 5. User Muscle Groups

app.get('/api/v1/gym/muscle-groups', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const { results } = await c.env.DB.prepare(`SELECT * FROM user_muscle_groups WHERE user_id = ?`)
    .bind(user.id)
    .all();
  return c.json({ muscleGroups: results });
});

app.post('/api/v1/gym/muscle-groups', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  let payload: any;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO user_muscle_groups (user_id, id, name, created_at, updated_at)
     VALUES (?, ?, ?, strftime('%s','now'), strftime('%s','now'))
     ON CONFLICT(user_id, id) DO UPDATE SET
       name = excluded.name,
       updated_at = excluded.updated_at`,
  )
    .bind(user.id, payload.id, payload.name)
    .run();
  return c.json({ ok: true });
});

app.delete('/api/v1/gym/muscle-groups/:id', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  await c.env.DB.prepare(`DELETE FROM user_muscle_groups WHERE user_id = ? AND id = ?`)
    .bind(user.id, c.req.param('id'))
    .run();
  return c.json({ ok: true });
});

// --- Feedback Endpoints ---

interface FeedbackRow {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  appVersion: string;
  browserInfo: string | null;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

type FeedbackRowWithEmail = FeedbackRow & {
  email: string | null;
};

const mapFeedbackRow = (row: FeedbackRow) => ({
  id: row.id,
  userId: row.userId,
  type: row.type,
  title: row.title,
  description: row.description,
  appVersion: row.appVersion,
  browserInfo: row.browserInfo || undefined,
  status: row.status,
  priority: row.priority,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  version: row.version,
});

const mapAdminFeedbackRow = (row: FeedbackRowWithEmail) => ({
  ...mapFeedbackRow(row),
  email: row.email || undefined,
});

app.get('/api/v1/feedback', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const { results } = await c.env.DB.prepare(
    `SELECT id, user_id as userId, type, title, description, app_version as appVersion, 
            browser_info as browserInfo, status, priority, created_at as createdAt, 
            updated_at as updatedAt, version
     FROM user_feedback 
     WHERE user_id = ?
     ORDER BY created_at DESC`,
  )
    .bind(user.id)
    .all<FeedbackRow>();

  const feedback = (results || []).map((row) => mapFeedbackRow(row));

  return c.json({ feedback });
});

app.post('/api/v1/feedback', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  let payload: {
    id: string;
    type: 'bug' | 'feature';
    title: string;
    description: string;
    appVersion: string;
    browserInfo?: string;
    priority?: string;
  };

  try {
    payload = await c.req.json();
    if (
      !payload.id ||
      !payload.type ||
      !payload.title ||
      !payload.description ||
      !payload.appVersion
    ) {
      throw new Error('Missing required fields');
    }
  } catch {
    return c.json({ error: 'Invalid JSON or missing required fields' }, 400);
  }

  const now = new Date().toISOString();

  try {
    await c.env.DB.prepare(
      `INSERT INTO user_feedback 
       (id, user_id, type, title, description, app_version, browser_info, status, priority, created_at, updated_at, version)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, 0)`,
    )
      .bind(
        payload.id,
        user.id,
        payload.type,
        payload.title,
        payload.description,
        payload.appVersion,
        payload.browserInfo || null,
        payload.priority || 'medium',
        now,
        now,
      )
      .run();

    return c.json({
      id: payload.id,
      userId: user.id,
      type: payload.type,
      title: payload.title,
      description: payload.description,
      appVersion: payload.appVersion,
      browserInfo: payload.browserInfo,
      status: 'open',
      priority: payload.priority || 'medium',
      createdAt: now,
      updatedAt: now,
      version: 0,
    });
  } catch (e: any) {
    if (e.message && e.message.includes('UNIQUE')) {
      return c.json({ error: 'conflict_exists' }, 409);
    }
    throw e;
  }
});

app.patch('/api/v1/feedback/:id', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const id = c.req.param('id');

  let payload: {
    expectedVersion: number;
    patch: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
    };
  };

  try {
    payload = await c.req.json();
    if (typeof payload.expectedVersion !== 'number') throw new Error('Missing expectedVersion');
  } catch {
    return c.json({ error: 'Invalid JSON or missing expectedVersion' }, 400);
  }

  const allowList = ['title', 'description', 'status', 'priority'];

  const result = await performOptimisticUpdate(
    c.env.DB,
    'user_feedback',
    user.id,
    id,
    payload.expectedVersion,
    payload.patch,
    allowList,
  );

  if (result.ok) {
    const row = result.data as any;
    return c.json({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      description: row.description,
      appVersion: row.app_version,
      browserInfo: row.browser_info || undefined,
      status: row.status,
      priority: row.priority,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      version: row.version,
    });
  } else {
    const row = result.latest as any;
    if (!row) return c.json({ error: 'not_found' }, 404);
    return c.json(
      {
        error: 'conflict',
        latest: {
          id: row.id,
          userId: row.user_id,
          type: row.type,
          title: row.title,
          description: row.description,
          appVersion: row.app_version,
          browserInfo: row.browser_info,
          status: row.status,
          priority: row.priority,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          version: row.version,
        },
      },
      409,
    );
  }
});

app.get('/api/v1/admin/feedback', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return unauthorized(c);

  const { results } = await c.env.DB.prepare(
    `SELECT user_feedback.id as id,
            user_feedback.user_id as userId,
            user_feedback.type as type,
            user_feedback.title as title,
            user_feedback.description as description,
            user_feedback.app_version as appVersion,
            user_feedback.browser_info as browserInfo,
            user_feedback.status as status,
            user_feedback.priority as priority,
            user_feedback.created_at as createdAt,
            user_feedback.updated_at as updatedAt,
            user_feedback.version as version,
            user_roles.email as email
     FROM user_feedback
     LEFT JOIN user_roles ON user_roles.user_id = user_feedback.user_id
     ORDER BY user_feedback.created_at DESC`,
  ).all<FeedbackRowWithEmail>();

  const feedback = (results || []).map((row) => mapAdminFeedbackRow(row));

  return c.json({ feedback });
});

app.patch('/api/v1/admin/feedback/:id', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return unauthorized(c);

  const id = c.req.param('id');

  let payload: {
    expectedVersion: number;
    patch: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
    };
  };

  try {
    payload = await c.req.json();
    if (typeof payload.expectedVersion !== 'number') throw new Error('Missing expectedVersion');
  } catch {
    return c.json({ error: 'Invalid JSON or missing expectedVersion' }, 400);
  }

  const allowList = ['title', 'description', 'status', 'priority'];

  const result = await performOptimisticUpdateById(
    c.env.DB,
    'user_feedback',
    id,
    payload.expectedVersion,
    payload.patch,
    allowList,
  );

  const row = await selectFeedbackWithEmail(c.env.DB, id);
  if (!row) return c.json({ error: 'not_found' }, 404);

  if (result.ok) {
    return c.json(mapAdminFeedbackRow(row));
  }

  return c.json(
    {
      error: 'conflict',
      latest: mapAdminFeedbackRow(row),
    },
    409,
  );
});

app.get('/api/v1/app-version', (c) => {
  // Return app version - can be enhanced to read from package.json or environment
  return c.json({ version: '1.0.0', name: 'kyokushin-kai' });
});

app.onError((err, c) => {
  console.error('Worker error', err);
  // Return actual error message for debugging
  return c.json({ error: err.message || 'Internal Server Error', stack: err.stack }, 500);
});

// Export removed - moved to end of file

/**
 * Verify user authorization from JWT token
 * Tries custom JWT first, falls back to Google ID token for backward compatibility
 */
async function requireUser(c: Context<{ Bindings: Bindings }>) {
  const header = c.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length);
  if (!token) return null;

  // Try custom JWT first
  const jwtSecret = c.env.JWT_SECRET;
  if (jwtSecret) {
    const customPayload = await verifyJWT(token, jwtSecret);
    if (customPayload) {
      return {
        id: customPayload.sub,
        email: customPayload.email,
        provider: customPayload.provider,
      };
    }
  }

  // Fall back to Google ID token verification (for backward compatibility)
  const clientId = c.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.warn('Neither JWT_SECRET nor GOOGLE_CLIENT_ID configured');
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      audience: clientId,
      issuer: googleIssuers,
    });

    if (!payload.sub || !payload.email) {
      throw new Error('Missing email or sub claim');
    }

    const profile: UserProfile = {
      id: String(payload.sub),
      email: String(payload.email),
      name: payload.name ? String(payload.name) : undefined,
      picture: payload.picture ? String(payload.picture) : undefined,
      provider: 'google',
    };

    return profile;
  } catch (error) {
    console.warn('Token verification failed', error);
    return null;
  }
}

function normalizeEmail(value?: string) {
  return (value ?? '').trim().toLowerCase();
}

async function getUserRole(
  db: D1Database,
  user: { id: string; email: string },
  adminEmail: string,
) {
  if (adminEmail && normalizeEmail(user.email) === adminEmail) return 'admin';

  const row = await db
    .prepare(`SELECT role FROM user_roles WHERE user_id = ? LIMIT 1`)
    .bind(user.id)
    .first<{ role: UserRole }>();

  return row?.role === 'admin' ? 'admin' : 'user';
}

async function upsertUserRole(
  db: D1Database,
  user: { id: string; email: string; name?: string; picture?: string },
  adminEmail: string,
): Promise<UserRole> {
  const normalizedEmail = normalizeEmail(user.email);
  const existingById = await db
    .prepare(`SELECT user_id as userId, role FROM user_roles WHERE user_id = ? LIMIT 1`)
    .bind(user.id)
    .first<{ userId: string; role: UserRole }>();
  const existingByEmail = await db
    .prepare(`SELECT user_id as userId, role FROM user_roles WHERE email = ? LIMIT 1`)
    .bind(normalizedEmail)
    .first<{ userId: string; role: UserRole }>();

  let role: UserRole = existingById?.role === 'admin' ? 'admin' : 'user';
  if (!existingById && existingByEmail?.role === 'admin') {
    role = 'admin';
  }
  if (adminEmail && normalizedEmail === adminEmail) {
    role = 'admin';
  }

  const now = new Date().toISOString();
  if (existingByEmail && existingByEmail.userId !== user.id) {
    await db
      .prepare(
        `UPDATE user_roles
         SET user_id = ?, display_name = ?, image_url = ?, role = ?, updated_at = ?
         WHERE email = ?`,
      )
      .bind(user.id, user.name || null, user.picture || null, role, now, normalizedEmail)
      .run();
    return role;
  }

  await db
    .prepare(
      `INSERT INTO user_roles (user_id, email, display_name, image_url, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         email = excluded.email,
         display_name = excluded.display_name,
         image_url = excluded.image_url,
         role = excluded.role,
         updated_at = excluded.updated_at`,
    )
    .bind(user.id, normalizedEmail, user.name || null, user.picture || null, role, now, now)
    .run();

  return role;
}

async function requireAdmin(c: Context<{ Bindings: Bindings }>) {
  const user = await requireUser(c);
  if (!user) return null;

  const role = await getUserRole(c.env.DB, user, normalizeEmail(c.env.ADMIN_EMAIL));
  if (role !== 'admin') return null;

  return user;
}

function parseAllowedOrigins(value?: string) {
  return (value ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function parseSettings(blob: string): PersistedSettings {
  try {
    const json = JSON.parse(blob) as PersistedSettings;
    return {
      gradeHistory: Array.isArray(json.gradeHistory)
        ? json.gradeHistory
            .filter(
              (entry) => typeof entry?.date === 'string' && typeof entry?.gradeId === 'string',
            )
            .map((entry) => ({ date: entry.date, gradeId: entry.gradeId }))
        : [],
      trainedDays: typeof json.trainedDays === 'number' ? json.trainedDays : 0,
      lastTrainedDate: typeof json.lastTrainedDate === 'string' ? json.lastTrainedDate : null,
      skipDeleteConfirmForComboItems: Boolean(json.skipDeleteConfirmForComboItems),
      skipDeleteConfirmForCombo: Boolean(json.skipDeleteConfirmForCombo),
    };
  } catch {
    return {
      gradeHistory: [],
      trainedDays: 0,
      lastTrainedDate: null,
      skipDeleteConfirmForComboItems: false,
      skipDeleteConfirmForCombo: false,
    };
  }
}

function sanitizeSettings(payload: Partial<PersistedSettings>): PersistedSettings {
  if (!payload || typeof payload !== 'object') {
    return {
      gradeHistory: [],
      trainedDays: 0,
      lastTrainedDate: null,
      skipDeleteConfirmForComboItems: false,
      skipDeleteConfirmForCombo: false,
    };
  }

  const gradeHistory = Array.isArray(payload.gradeHistory)
    ? payload.gradeHistory
        .filter(
          (entry) =>
            typeof entry?.date === 'string' &&
            entry?.date.length > 0 &&
            typeof entry?.gradeId === 'string',
        )
        .map((entry) => ({ date: entry.date, gradeId: entry.gradeId }))
    : [];

  const trainedDays =
    typeof payload.trainedDays === 'number' && Number.isFinite(payload.trainedDays)
      ? Math.max(0, Math.trunc(payload.trainedDays))
      : 0;
  const lastTrainedDate =
    typeof payload.lastTrainedDate === 'string' && payload.lastTrainedDate.length > 0
      ? payload.lastTrainedDate
      : null;

  const skipItems =
    typeof payload.skipDeleteConfirmForComboItems === 'boolean'
      ? payload.skipDeleteConfirmForComboItems
      : false;
  const skipCombo =
    typeof payload.skipDeleteConfirmForCombo === 'boolean'
      ? payload.skipDeleteConfirmForCombo
      : false;

  return {
    gradeHistory,
    trainedDays,
    lastTrainedDate,
    skipDeleteConfirmForComboItems: skipItems,
    skipDeleteConfirmForCombo: skipCombo,
  };
}

function unauthorized(c: Context<{ Bindings: Bindings }>) {
  return c.json({ error: 'Unauthorized' }, 401);
}

function parseJsonSafely<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function sanitizeLocalizedText(value: unknown): LocalizedText | undefined {
  if (!value || typeof value !== 'object') return undefined;

  const entries = Object.entries(value as Record<string, unknown>);
  const next: LocalizedText = {};

  for (const [key, val] of entries) {
    if (key !== 'romaji' && key !== 'ja' && key !== 'en' && key !== 'sv') continue;
    if (typeof val === 'string' && val.trim().length > 0) {
      next[key as Locale] = val.trim();
    }
  }

  return Object.keys(next).length ? next : undefined;
}

function parseNumberInput(value: unknown): number | undefined {
  const parsed = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return Number.isFinite(parsed) ? Number(parsed) : undefined;
}

function sanitizeStringInput(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function sanitizeStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const cleaned = value
    .filter((entry) => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
  return cleaned.length ? Array.from(new Set(cleaned)) : [];
}

function normalizeGradeRank(kind: string, rank: number): number {
  if (!Number.isFinite(rank)) return 0;
  const rounded = Math.round(rank);
  if (kind === 'Dan') return Math.min(Math.max(rounded, 11), 20);
  if (kind === 'Kyu') return Math.min(Math.max(rounded, 1), 10);
  return 0;
}

function deriveGradeNumber(kind: string, rank: number): number {
  if (!Number.isFinite(rank)) return 0;
  if (kind === 'Dan') return Math.max(rank - 10, 1);
  if (kind === 'Kyu') return 11 - rank;
  return 0;
}

function deriveGradeRank(kind: string, number: number): number {
  if (!Number.isFinite(number)) return 0;
  if (kind === 'Dan') return number > 0 ? 10 + number : 0;
  if (kind === 'Kyu') {
    if (number >= 1 && number <= 10) return 11 - number;
    return 0;
  }
  return 0;
}

function buildTechniqueForCreate(payload: Partial<TechniqueRecord> | null): TechniqueRecord | null {
  if (!payload || typeof payload !== 'object') return null;
  const kind = typeof payload.kind === 'string' ? payload.kind.trim() : '';
  if (!kind) return null;

  const name = sanitizeLocalizedText(payload.name);
  if (!name) return null;

  const rank = parseNumberInput(payload.rank);

  const status = PUBLISH_STATUSES.has(payload.status as PublishStatus)
    ? (payload.status as PublishStatus)
    : 'draft';

  const now = new Date().toISOString();
  const providedId = typeof payload.id === 'string' ? payload.id.trim() : '';

  return {
    id: providedId || crypto.randomUUID(),
    kind,
    rank,
    name,
    aliases: Array.isArray(payload.aliases) ? payload.aliases : undefined,
    nameParts: payload.nameParts,
    tags: Array.isArray(payload.tags) ? payload.tags : undefined,
    summary: payload.summary,
    history: payload.history,
    detailedDescription: payload.detailedDescription,
    relatedTermIds: Array.isArray(payload.relatedTermIds) ? payload.relatedTermIds : undefined,
    mediaIds: Array.isArray(payload.mediaIds) ? payload.mediaIds : undefined,
    sourceIds: Array.isArray(payload.sourceIds) ? payload.sourceIds : undefined,
    status,
    createdAt: now,
    updatedAt: now,
  };
}

function parseTechniquePatch(
  payload: Partial<TechniqueRecord> | null,
): Partial<TechniqueRecord> | null {
  if (!payload || typeof payload !== 'object') return null;

  const patch: Partial<TechniqueRecord> = {};

  if (typeof payload.kind === 'string' && payload.kind.trim().length > 0) {
    patch.kind = payload.kind.trim();
  }

  if (payload.rank !== undefined) {
    const rank = parseNumberInput(payload.rank);
    if (rank !== undefined) {
      patch.rank = rank;
    }
  }

  if (payload.status && PUBLISH_STATUSES.has(payload.status as PublishStatus)) {
    patch.status = payload.status as PublishStatus;
  }

  if (payload.name !== undefined) {
    const name = sanitizeLocalizedText(payload.name);
    if (!name) return null;
    patch.name = name;
  }

  if (Object.keys(patch).length === 0) return null;

  return patch;
}

function mergeTechnique(
  existing: TechniqueRecord,
  patch: Partial<TechniqueRecord>,
): TechniqueRecord {
  return {
    ...existing,
    ...patch,
    name: patch.name ? { ...existing.name, ...patch.name } : existing.name,
  };
}

function techniqueFromRow(row: TechniqueRow): TechniqueRecord {
  const parsed = parseJsonSafely<TechniqueRecord | null>(row.data_json, null);
  const base: TechniqueRecord = {
    id: row.id,
    kind: row.kind,
    rank: typeof row.rank === 'number' && Number.isFinite(row.rank) ? row.rank : undefined,
    name: {},
    status: PUBLISH_STATUSES.has(row.status as PublishStatus)
      ? (row.status as PublishStatus)
      : 'draft',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (!parsed || typeof parsed !== 'object') return base;

  return {
    ...base,
    ...parsed,
    id: row.id,
    kind: typeof parsed.kind === 'string' ? parsed.kind : base.kind,
    rank: Number.isFinite(parsed.rank) ? Number(parsed.rank) : base.rank,
    name: parsed.name && typeof parsed.name === 'object' ? parsed.name : base.name,
    status: PUBLISH_STATUSES.has(parsed.status as PublishStatus)
      ? (parsed.status as PublishStatus)
      : base.status,
    createdAt: parsed.createdAt || base.createdAt,
    updatedAt: parsed.updatedAt || base.updatedAt,
  };
}

function buildGradeForCreate(payload: Partial<GradeRecord> | null): GradeRecord | null {
  if (!payload || typeof payload !== 'object') return null;
  const gradingSystemId =
    typeof payload.gradingSystemId === 'string' ? payload.gradingSystemId.trim() : '';
  const kind = typeof payload.kind === 'string' ? payload.kind.trim() : '';
  if (!gradingSystemId || !kind) return null;

  const name = sanitizeLocalizedText(payload.name);
  if (!name) return null;

  const rankInput = parseNumberInput(payload.rank);
  const numberInput = parseNumberInput(payload.number);
  const normalizedRank =
    rankInput !== undefined
      ? normalizeGradeRank(kind, rankInput)
      : deriveGradeRank(kind, numberInput || 0);
  const normalizedNumber =
    rankInput !== undefined
      ? deriveGradeNumber(kind, normalizedRank)
      : Number.isFinite(numberInput)
        ? Number(numberInput)
        : deriveGradeNumber(kind, normalizedRank);

  const status = PUBLISH_STATUSES.has(payload.status as PublishStatus)
    ? (payload.status as PublishStatus)
    : 'draft';

  const now = new Date().toISOString();
  const providedId = typeof payload.id === 'string' ? payload.id.trim() : '';

  return {
    id: providedId || crypto.randomUUID(),
    gradingSystemId,
    kind,
    number: normalizedNumber,
    rank: normalizedRank,
    name,
    aliases: Array.isArray(payload.aliases) ? payload.aliases : undefined,
    beltColor: typeof payload.beltColor === 'string' ? payload.beltColor : 'white',
    sortOrder: Number.isFinite(payload.sortOrder) ? Number(payload.sortOrder) : 0,
    notes: payload.notes,
    status,
    createdAt: now,
    updatedAt: now,
  };
}

function parseGradePatch(payload: Partial<GradeRecord> | null): Partial<GradeRecord> | null {
  if (!payload || typeof payload !== 'object') return null;

  const patch: Partial<GradeRecord> = {};

  if (payload.name !== undefined) {
    const name = sanitizeLocalizedText(payload.name);
    if (!name) return null;
    patch.name = name;
  }

  if (typeof payload.gradingSystemId === 'string' && payload.gradingSystemId.trim().length > 0) {
    patch.gradingSystemId = payload.gradingSystemId.trim();
  }

  if (typeof payload.kind === 'string' && payload.kind.trim().length > 0) {
    patch.kind = payload.kind.trim();
  }

  if (Number.isFinite(payload.number)) {
    patch.number = Number(payload.number);
  }

  if (payload.rank !== undefined) {
    const rank = parseNumberInput(payload.rank);
    if (rank !== undefined) {
      patch.rank = rank;
    }
  }

  if (typeof payload.beltColor === 'string' && payload.beltColor.trim().length > 0) {
    patch.beltColor = payload.beltColor.trim();
  }

  if (Number.isFinite(payload.sortOrder)) {
    patch.sortOrder = Number(payload.sortOrder);
  }

  if (payload.status && PUBLISH_STATUSES.has(payload.status as PublishStatus)) {
    patch.status = payload.status as PublishStatus;
  }

  if (Object.keys(patch).length === 0) return null;
  return patch;
}

function mergeGrade(existing: GradeRecord, patch: Partial<GradeRecord>): GradeRecord {
  const merged: GradeRecord = {
    ...existing,
    ...patch,
    name: patch.name ? { ...existing.name, ...patch.name } : existing.name,
  };

  const nextKind = merged.kind;

  if (patch.rank !== undefined) {
    const normalizedRank = normalizeGradeRank(nextKind, Number(patch.rank));
    merged.rank = normalizedRank;
    merged.number = deriveGradeNumber(nextKind, normalizedRank);
  } else if (patch.number !== undefined || patch.kind !== undefined) {
    merged.rank = deriveGradeRank(nextKind, merged.number);
  }

  return merged;
}

function gradeFromRow(row: GradeRow): GradeRecord {
  const parsed = parseJsonSafely<GradeRecord | null>(row.data_json, null);
  const base: GradeRecord = {
    id: row.id,
    gradingSystemId: row.grading_system_id,
    kind: row.kind,
    number: row.number,
    rank:
      typeof row.rank === 'number' && Number.isFinite(row.rank)
        ? row.rank
        : deriveGradeRank(row.kind, row.number),
    name: {},
    beltColor: row.belt_color,
    sortOrder: row.sort_order,
    status: PUBLISH_STATUSES.has(row.status as PublishStatus)
      ? (row.status as PublishStatus)
      : 'draft',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (!parsed || typeof parsed !== 'object') return base;

  return {
    ...base,
    ...parsed,
    id: row.id,
    gradingSystemId:
      typeof parsed.gradingSystemId === 'string' ? parsed.gradingSystemId : base.gradingSystemId,
    kind: typeof parsed.kind === 'string' ? parsed.kind : base.kind,
    number: Number.isFinite(parsed.number) ? Number(parsed.number) : base.number,
    rank: Number.isFinite(parsed.rank) ? Number(parsed.rank) : base.rank,
    name: parsed.name && typeof parsed.name === 'object' ? parsed.name : base.name,
    beltColor: typeof parsed.beltColor === 'string' ? parsed.beltColor : base.beltColor,
    sortOrder: Number.isFinite(parsed.sortOrder) ? Number(parsed.sortOrder) : base.sortOrder,
    status: PUBLISH_STATUSES.has(parsed.status as PublishStatus)
      ? (parsed.status as PublishStatus)
      : base.status,
    createdAt: parsed.createdAt || base.createdAt,
    updatedAt: parsed.updatedAt || base.updatedAt,
  };
}

function buildKataForCreate(payload: Partial<KataRecord> | null): KataRecord | null {
  if (!payload || typeof payload !== 'object') return null;

  const name = sanitizeLocalizedText(payload.name);
  if (!name) return null;

  const rank = parseNumberInput(payload.rank);

  const status = PUBLISH_STATUSES.has(payload.status as PublishStatus)
    ? (payload.status as PublishStatus)
    : 'draft';

  const now = new Date().toISOString();
  const providedId = typeof payload.id === 'string' ? payload.id.trim() : '';

  return {
    id: providedId || crypto.randomUUID(),
    rank,
    name,
    aliases: Array.isArray(payload.aliases) ? payload.aliases : undefined,
    familyTermIds: Array.isArray(payload.familyTermIds) ? payload.familyTermIds : undefined,
    meaning: payload.meaning,
    history: payload.history,
    detailedDescription: payload.detailedDescription,
    tags: Array.isArray(payload.tags) ? payload.tags : undefined,
    difficulty: Number.isFinite(payload.difficulty) ? Number(payload.difficulty) : undefined,
    expectedDurationSec: Number.isFinite(payload.expectedDurationSec)
      ? Number(payload.expectedDurationSec)
      : undefined,
    mediaIds: Array.isArray(payload.mediaIds) ? payload.mediaIds : undefined,
    sourceIds: Array.isArray(payload.sourceIds) ? payload.sourceIds : undefined,
    status,
    createdAt: now,
    updatedAt: now,
  };
}

function parseKataPatch(payload: Partial<KataRecord> | null): Partial<KataRecord> | null {
  if (!payload || typeof payload !== 'object') return null;

  const patch: Partial<KataRecord> = {};

  if (payload.name !== undefined) {
    const name = sanitizeLocalizedText(payload.name);
    if (!name) return null;
    patch.name = name;
  }

  if (payload.status && PUBLISH_STATUSES.has(payload.status as PublishStatus)) {
    patch.status = payload.status as PublishStatus;
  }

  if (payload.rank !== undefined) {
    const rank = parseNumberInput(payload.rank);
    if (rank !== undefined) {
      patch.rank = rank;
    }
  }

  if (Object.keys(patch).length === 0) return null;
  return patch;
}

function mergeKata(existing: KataRecord, patch: Partial<KataRecord>): KataRecord {
  return {
    ...existing,
    ...patch,
    name: patch.name ? { ...existing.name, ...patch.name } : existing.name,
  };
}

function kataFromRow(row: KataRow): KataRecord {
  const parsed = parseJsonSafely<KataRecord | null>(row.data_json, null);
  const base: KataRecord = {
    id: row.id,
    rank: typeof row.rank === 'number' && Number.isFinite(row.rank) ? row.rank : undefined,
    name: {},
    status: PUBLISH_STATUSES.has(row.status as PublishStatus)
      ? (row.status as PublishStatus)
      : 'draft',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (!parsed || typeof parsed !== 'object') return base;

  return {
    ...base,
    ...parsed,
    id: row.id,
    rank: Number.isFinite(parsed.rank) ? Number(parsed.rank) : base.rank,
    name: parsed.name && typeof parsed.name === 'object' ? parsed.name : base.name,
    status: PUBLISH_STATUSES.has(parsed.status as PublishStatus)
      ? (parsed.status as PublishStatus)
      : base.status,
    createdAt: parsed.createdAt || base.createdAt,
    updatedAt: parsed.updatedAt || base.updatedAt,
  };
}

function buildQuoteForCreate(payload: Partial<QuoteRecord> | null): QuoteRecord | null {
  if (!payload || typeof payload !== 'object') return null;

  const author = sanitizeStringInput(payload.author);
  const text = sanitizeStringInput(payload.text);
  const meaning = sanitizeStringInput(payload.meaning);
  if (!author || !text || !meaning) return null;

  const tags = sanitizeStringArray(payload.tags) ?? [];
  const date = sanitizeStringInput(payload.date);
  const history = sanitizeStringInput(payload.history);
  const reference = sanitizeStringInput(payload.reference);

  const status = PUBLISH_STATUSES.has(payload.status as PublishStatus)
    ? (payload.status as PublishStatus)
    : 'draft';

  const sortOrder = parseNumberInput(payload.sortOrder);

  const now = new Date().toISOString();
  const providedId = typeof payload.id === 'string' ? payload.id.trim() : '';

  return {
    id: providedId || crypto.randomUUID(),
    author,
    tags,
    date,
    text,
    meaning,
    history,
    reference,
    status,
    sortOrder: sortOrder ?? 0,
    createdAt: now,
    updatedAt: now,
  };
}

function parseQuotePatch(payload: Partial<QuoteRecord> | null): Partial<QuoteRecord> | null {
  if (!payload || typeof payload !== 'object') return null;

  const patch: Partial<QuoteRecord> = {};

  if (payload.author !== undefined) {
    const author = sanitizeStringInput(payload.author);
    if (!author) return null;
    patch.author = author;
  }

  if (payload.text !== undefined) {
    const text = sanitizeStringInput(payload.text);
    if (!text) return null;
    patch.text = text;
  }

  if (payload.meaning !== undefined) {
    const meaning = sanitizeStringInput(payload.meaning);
    if (!meaning) return null;
    patch.meaning = meaning;
  }

  if (payload.tags !== undefined) {
    const tags = sanitizeStringArray(payload.tags);
    if (!tags) return null;
    patch.tags = tags;
  }

  if (payload.date !== undefined) {
    if (payload.date === null) {
      patch.date = undefined;
    } else if (typeof payload.date === 'string') {
      patch.date = payload.date.trim() || undefined;
    } else {
      return null;
    }
  }

  if (payload.history !== undefined) {
    if (payload.history === null) {
      patch.history = undefined;
    } else if (typeof payload.history === 'string') {
      patch.history = payload.history.trim() || undefined;
    } else {
      return null;
    }
  }

  if (payload.reference !== undefined) {
    if (payload.reference === null) {
      patch.reference = undefined;
    } else if (typeof payload.reference === 'string') {
      patch.reference = payload.reference.trim() || undefined;
    } else {
      return null;
    }
  }

  if (payload.status && PUBLISH_STATUSES.has(payload.status as PublishStatus)) {
    patch.status = payload.status as PublishStatus;
  }

  if (payload.sortOrder !== undefined) {
    if (typeof payload.sortOrder === 'number') {
      patch.sortOrder = payload.sortOrder;
    }
  }

  if (Object.keys(patch).length === 0) return null;
  return patch;
}

function mergeQuote(existing: QuoteRecord, patch: Partial<QuoteRecord>): QuoteRecord {
  return {
    ...existing,
    ...patch,
    tags: patch.tags ? [...patch.tags] : existing.tags,
  };
}

function quoteFromRow(row: QuoteRow): QuoteRecord {
  const parsed = parseJsonSafely<QuoteRecord | null>(row.data_json, null);
  const base: QuoteRecord = {
    id: row.id,
    author: row.author,
    tags: [],
    text: '',
    meaning: '',
    status: PUBLISH_STATUSES.has(row.status as PublishStatus)
      ? (row.status as PublishStatus)
      : 'draft',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (!parsed || typeof parsed !== 'object') return base;

  const tags = sanitizeStringArray(parsed.tags) ?? base.tags;

  return {
    ...base,
    ...parsed,
    id: row.id,
    author: typeof parsed.author === 'string' ? parsed.author : base.author,
    tags,
    text: typeof parsed.text === 'string' ? parsed.text : base.text,
    meaning: typeof parsed.meaning === 'string' ? parsed.meaning : base.meaning,
    date: typeof parsed.date === 'string' ? parsed.date : base.date,
    history: typeof parsed.history === 'string' ? parsed.history : base.history,
    reference: typeof parsed.reference === 'string' ? parsed.reference : base.reference,
    status: PUBLISH_STATUSES.has(parsed.status as PublishStatus)
      ? (parsed.status as PublishStatus)
      : base.status,
    sortOrder:
      row.sort_order !== null && row.sort_order !== undefined
        ? row.sort_order
        : typeof parsed.sortOrder === 'number'
          ? parsed.sortOrder
          : undefined,
    createdAt: parsed.createdAt || base.createdAt,
    updatedAt: parsed.updatedAt || base.updatedAt,
  };
}

function buildMottoForCreate(payload: Partial<MottoRecord> | null): MottoRecord | null {
  if (!payload || typeof payload !== 'object') return null;

  const shortTitle = sanitizeStringInput(payload.shortTitle);
  const text = sanitizeStringInput(payload.text);
  if (!shortTitle || !text) return null;

  const details = sanitizeStringInput(payload.details);
  const sortOrder = parseNumberInput(payload.sortOrder);
  const status = PUBLISH_STATUSES.has(payload.status as PublishStatus)
    ? (payload.status as PublishStatus)
    : 'draft';

  const now = new Date().toISOString();
  const providedId = typeof payload.id === 'string' ? payload.id.trim() : '';

  return {
    id: providedId || crypto.randomUUID(),
    shortTitle,
    text,
    details,
    sortOrder: sortOrder ?? 0,
    status,
    createdAt: now,
    updatedAt: now,
  };
}

function parseMottoPatch(payload: Partial<MottoRecord> | null): Partial<MottoRecord> | null {
  if (!payload || typeof payload !== 'object') return null;

  const patch: Partial<MottoRecord> = {};

  if (payload.shortTitle !== undefined) {
    const val = sanitizeStringInput(payload.shortTitle);
    if (!val) return null;
    patch.shortTitle = val;
  }

  if (payload.text !== undefined) {
    const val = sanitizeStringInput(payload.text);
    if (!val) return null;
    patch.text = val;
  }

  if (payload.details !== undefined) {
    if (payload.details === null) {
      patch.details = undefined;
    } else if (typeof payload.details === 'string') {
      patch.details = payload.details.trim() || undefined;
    } else {
      return null;
    }
  }

  if (payload.status && PUBLISH_STATUSES.has(payload.status as PublishStatus)) {
    patch.status = payload.status as PublishStatus;
  }

  if (payload.sortOrder !== undefined) {
    if (typeof payload.sortOrder === 'number') {
      patch.sortOrder = payload.sortOrder;
    }
  }

  if (Object.keys(patch).length === 0) return null;
  return patch;
}

function mergeMotto(existing: MottoRecord, patch: Partial<MottoRecord>): MottoRecord {
  return {
    ...existing,
    ...patch,
  };
}

function mottoFromRow(row: MottoRow): MottoRecord {
  const parsed = parseJsonSafely<MottoRecord | null>(row.data_json, null);
  const base: MottoRecord = {
    id: row.id,
    shortTitle: '',
    text: '',
    status: PUBLISH_STATUSES.has(row.status as PublishStatus)
      ? (row.status as PublishStatus)
      : 'draft',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (!parsed || typeof parsed !== 'object') return base;

  return {
    ...base,
    ...parsed,
    id: row.id,
    shortTitle: typeof parsed.shortTitle === 'string' ? parsed.shortTitle : base.shortTitle,
    text: typeof parsed.text === 'string' ? parsed.text : base.text,
    details: typeof parsed.details === 'string' ? parsed.details : base.details,
    sortOrder:
      row.sort_order !== null && row.sort_order !== undefined
        ? row.sort_order
        : typeof parsed.sortOrder === 'number'
          ? parsed.sortOrder
          : undefined,
    status: PUBLISH_STATUSES.has(parsed.status as PublishStatus)
      ? (parsed.status as PublishStatus)
      : base.status,
    createdAt: parsed.createdAt || base.createdAt,
    updatedAt: parsed.updatedAt || base.updatedAt,
  };
}

async function loadCurriculumMap(db: D1Database) {
  const { results: techRows } = await db
    .prepare(`SELECT grade_id as gradeId, technique_id as techniqueId FROM grade_techniques`)
    .all<{ gradeId: string; techniqueId: string }>();
  const { results: kataRows } = await db
    .prepare(`SELECT grade_id as gradeId, kata_id as kataId FROM grade_katas`)
    .all<{ gradeId: string; kataId: string }>();

  const map = new Map<string, { techniqueIds: string[]; kataIds: string[] }>();

  for (const row of techRows || []) {
    if (!map.has(row.gradeId)) {
      map.set(row.gradeId, { techniqueIds: [], kataIds: [] });
    }
    map.get(row.gradeId)!.techniqueIds.push(row.techniqueId);
  }

  for (const row of kataRows || []) {
    if (!map.has(row.gradeId)) {
      map.set(row.gradeId, { techniqueIds: [], kataIds: [] });
    }
    map.get(row.gradeId)!.kataIds.push(row.kataId);
  }

  return map;
}

async function replaceGradeAssignments(
  db: D1Database,
  gradeId: string,
  techniqueIds?: string[],
  kataIds?: string[],
) {
  if (Array.isArray(techniqueIds)) {
    await db.prepare(`DELETE FROM grade_techniques WHERE grade_id = ?`).bind(gradeId).run();
    for (const techniqueId of new Set(techniqueIds.filter(Boolean))) {
      await db
        .prepare(`DELETE FROM grade_techniques WHERE technique_id = ?`)
        .bind(techniqueId)
        .run();
      await db
        .prepare(
          `INSERT INTO grade_techniques (grade_id, technique_id, created_at)
           VALUES (?, ?, ?)`,
        )
        .bind(gradeId, techniqueId, new Date().toISOString())
        .run();
    }
  }

  if (Array.isArray(kataIds)) {
    await db.prepare(`DELETE FROM grade_katas WHERE grade_id = ?`).bind(gradeId).run();
    for (const kataId of new Set(kataIds.filter(Boolean))) {
      await db.prepare(`DELETE FROM grade_katas WHERE kata_id = ?`).bind(kataId).run();
      await db
        .prepare(
          `INSERT INTO grade_katas (grade_id, kata_id, created_at)
           VALUES (?, ?, ?)`,
        )
        .bind(gradeId, kataId, new Date().toISOString())
        .run();
    }
  }
}

async function replaceTechniqueAssignments(db: D1Database, techniqueId: string, gradeId?: string) {
  await db.prepare(`DELETE FROM grade_techniques WHERE technique_id = ?`).bind(techniqueId).run();
  if (!gradeId) return;

  await db
    .prepare(
      `INSERT INTO grade_techniques (grade_id, technique_id, created_at)
       VALUES (?, ?, ?)`,
    )
    .bind(gradeId, techniqueId, new Date().toISOString())
    .run();
}

async function replaceKataAssignments(db: D1Database, kataId: string, gradeId?: string) {
  await db.prepare(`DELETE FROM grade_katas WHERE kata_id = ?`).bind(kataId).run();
  if (!gradeId) return;

  await db
    .prepare(
      `INSERT INTO grade_katas (grade_id, kata_id, created_at)
       VALUES (?, ?, ?)`,
    )
    .bind(gradeId, kataId, new Date().toISOString())
    .run();
}

// --- Auth Utility Functions ---

type MergeProfile = {
  email: string;
  name?: string;
  picture?: string;
  providerUserId: string;
};

type MergeResult = {
  user: {
    id: string;
    email: string;
    name: string;
    imageUrl?: string;
  };
  role: UserRole;
  providers: string[];
};

async function tableExists(db: D1Database, tableName: string): Promise<boolean> {
  const row = await db
    .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`)
    .bind(tableName)
    .first<{ name: string }>();
  return Boolean(row?.name);
}

async function mergeUserTableRows(
  db: D1Database,
  tableName: string,
  sourceUserId: string,
  targetUserId: string,
): Promise<void> {
  if (!(await tableExists(db, tableName))) {
    return;
  }

  const { results } = await db.prepare(`PRAGMA table_info(${tableName})`).all<{ name: string }>();
  const columnNames = results?.map((column) => column.name).filter(Boolean) ?? [];
  if (!columnNames.includes('user_id')) {
    return;
  }

  const insertColumns = columnNames.join(', ');
  const selectColumns = columnNames
    .map((column) => (column === 'user_id' ? '?' : column))
    .join(', ');

  await db
    .prepare(
      `INSERT OR IGNORE INTO ${tableName} (${insertColumns})
       SELECT ${selectColumns} FROM ${tableName} WHERE user_id = ?`,
    )
    .bind(targetUserId, sourceUserId)
    .run();

  await db.prepare(`DELETE FROM ${tableName} WHERE user_id = ?`).bind(sourceUserId).run();
}

async function mergeUserAccounts(
  db: D1Database,
  sourceUserId: string,
  targetUserId: string,
  profile: MergeProfile,
  adminEmail: string,
): Promise<MergeResult> {
  if (sourceUserId === targetUserId) {
    throw new Error('Cannot merge identical users');
  }

  const nowIso = new Date().toISOString();
  const nowUnix = Math.floor(Date.now() / 1000);
  let transactionStarted = false;

  try {
    await db.exec('BEGIN');
    transactionStarted = true;
  } catch (error) {
    console.warn('Account merge transaction unavailable, falling back to sequential', error);
  }

  const finalize = async (error?: unknown) => {
    if (!transactionStarted) {
      if (error) {
        throw error;
      }
      return;
    }
    if (!error) {
      await db.exec('COMMIT');
      return;
    }
    try {
      await db.exec('ROLLBACK');
    } catch (rollbackError) {
      console.warn('Account merge rollback failed', rollbackError);
    }
    throw error;
  };

  try {
    const sourceSettings = await db
      .prepare(
        `SELECT user_id, email, display_name, image_url, settings_json, version
         FROM user_settings WHERE user_id = ?`,
      )
      .bind(sourceUserId)
      .first<{
        user_id: string;
        email: string;
        display_name?: string;
        image_url?: string;
        settings_json: string;
        version: number;
      }>();

    const targetSettings = await db
      .prepare(
        `SELECT user_id, email, display_name, image_url, settings_json, version
         FROM user_settings WHERE user_id = ?`,
      )
      .bind(targetUserId)
      .first<{
        user_id: string;
        email: string;
        display_name?: string;
        image_url?: string;
        settings_json: string;
        version: number;
      }>();

    const resolvedEmail = normalizeEmail(
      targetSettings?.email || profile.email || sourceSettings?.email || '',
    );
    const resolvedName =
      targetSettings?.display_name || sourceSettings?.display_name || profile.name || resolvedEmail;
    const resolvedImage =
      targetSettings?.image_url || sourceSettings?.image_url || profile.picture || undefined;

    if (!targetSettings) {
      const settingsJson = sourceSettings?.settings_json || JSON.stringify(sanitizeSettings({}));
      const settingsVersion = sourceSettings?.version ?? 1;
      await db
        .prepare(
          `INSERT INTO user_settings (user_id, email, display_name, image_url, settings_json, version, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          targetUserId,
          resolvedEmail,
          resolvedName || null,
          resolvedImage || null,
          settingsJson,
          settingsVersion,
          nowIso,
        )
        .run();
    } else {
      const updates: string[] = [];
      const values: Array<string | null> = [];

      if (!targetSettings.display_name && resolvedName) {
        updates.push('display_name = ?');
        values.push(resolvedName);
      }
      if (!targetSettings.image_url && resolvedImage) {
        updates.push('image_url = ?');
        values.push(resolvedImage);
      }

      if (updates.length > 0) {
        updates.push('updated_at = ?');
        values.push(nowIso);
        values.push(targetUserId);
        await db
          .prepare(`UPDATE user_settings SET ${updates.join(', ')} WHERE user_id = ?`)
          .bind(...values)
          .run();
      }
    }

    const sourceRole = await db
      .prepare(
        `SELECT user_id, email, display_name, image_url, role
         FROM user_roles WHERE user_id = ?`,
      )
      .bind(sourceUserId)
      .first<{
        user_id: string;
        email: string;
        display_name?: string;
        image_url?: string;
        role: UserRole;
      }>();

    const targetRole = await db
      .prepare(
        `SELECT user_id, email, display_name, image_url, role
         FROM user_roles WHERE user_id = ?`,
      )
      .bind(targetUserId)
      .first<{
        user_id: string;
        email: string;
        display_name?: string;
        image_url?: string;
        role: UserRole;
      }>();

    if (targetRole) {
      const updates: string[] = [];
      const values: Array<string | null> = [];
      if (sourceRole?.role === 'admin' && targetRole.role !== 'admin') {
        updates.push('role = ?');
        values.push('admin');
      }
      const roleDisplayName = sourceRole?.display_name || resolvedName;
      if (!targetRole.display_name && roleDisplayName) {
        updates.push('display_name = ?');
        values.push(roleDisplayName);
      }
      const roleImage = sourceRole?.image_url || resolvedImage;
      if (!targetRole.image_url && roleImage) {
        updates.push('image_url = ?');
        values.push(roleImage);
      }
      if (updates.length > 0) {
        updates.push('updated_at = ?');
        values.push(nowIso);
        values.push(targetUserId);
        await db
          .prepare(`UPDATE user_roles SET ${updates.join(', ')} WHERE user_id = ?`)
          .bind(...values)
          .run();
      }
    } else if (sourceRole) {
      const roleDisplayName = sourceRole.display_name || resolvedName || null;
      const roleImage = sourceRole.image_url || resolvedImage || null;
      const roleEmail = resolvedEmail || normalizeEmail(sourceRole.email);
      await db
        .prepare(
          `UPDATE user_roles SET user_id = ?, email = ?, display_name = ?, image_url = ?, role = ?, updated_at = ?
           WHERE user_id = ?`,
        )
        .bind(
          targetUserId,
          roleEmail,
          roleDisplayName,
          roleImage,
          sourceRole.role,
          nowIso,
          sourceUserId,
        )
        .run();
    }

    const mergeTables = [
      'user_technique_progress',
      'user_terminology_progress',
      'user_wordquest_progress',
      'user_game_state',
      'user_cards',
      'user_card_decks',
      'user_training_sessions',
      'user_gym_sessions',
      'user_workout_plans',
      'user_gym_exercises',
      'user_gym_equipment',
      'user_muscle_groups',
      'user_equipment_categories',
      'user_feedback',
      'user_flashcards',
      'user_flashcard_decks',
    ];

    for (const tableName of mergeTables) {
      await mergeUserTableRows(db, tableName, sourceUserId, targetUserId);
    }

    await db
      .prepare(`UPDATE identities SET user_id = ? WHERE user_id = ?`)
      .bind(targetUserId, sourceUserId)
      .run();

    await db.prepare(`DELETE FROM identities WHERE user_id = ?`).bind(sourceUserId).run();
    await db.prepare(`DELETE FROM refresh_tokens WHERE user_id = ?`).bind(sourceUserId).run();
    await db.prepare(`DELETE FROM user_roles WHERE user_id = ?`).bind(sourceUserId).run();
    await db.prepare(`DELETE FROM user_settings WHERE user_id = ?`).bind(sourceUserId).run();

    const { results: providerResults } = await db
      .prepare(`SELECT provider FROM identities WHERE user_id = ?`)
      .bind(targetUserId)
      .all<{ provider: string }>();

    const providers = providerResults.map((row) => row.provider);
    if (!providers.includes('google')) {
      await db
        .prepare(
          `INSERT INTO identities (id, user_id, provider, provider_user_id, created_at, updated_at)
           VALUES (?, ?, 'google', ?, ?, ?)
           ON CONFLICT(provider, provider_user_id) DO NOTHING`,
        )
        .bind(crypto.randomUUID(), targetUserId, profile.providerUserId, nowUnix, nowUnix)
        .run();
      providers.push('google');
    }

    await finalize();

    const role = await getUserRole(db, { id: targetUserId, email: resolvedEmail }, adminEmail);

    return {
      user: {
        id: targetUserId,
        email: resolvedEmail,
        name: resolvedName,
        imageUrl: resolvedImage,
      },
      role,
      providers,
    };
  } catch (error) {
    await finalize(error);
    throw error;
  }
}

function generateRefreshToken(): string {
  // Generate cryptographically secure random token
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a custom JWT token for API authorization
 *
 * @param userId - User's unique identifier
 * @param secret - JWT signing secret from environment
 * @param expiresIn - Token lifetime in seconds (default: 1 hour)
 * @returns Signed JWT token
 */
async function createJWT(
  userId: string,
  email: string,
  secret: string,
  expiresIn: number = 3600,
  provider?: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const payload: Record<string, string> = {
    sub: userId,
    email,
    type: 'access',
  };
  if (provider) {
    payload.provider = provider;
  }

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
    .sign(secretKey);

  return jwt;
}

/**
 * Verify a custom JWT token
 *
 * @param token - JWT token to verify
 * @param secret - JWT signing secret
 * @returns Decoded payload if valid, null if invalid
 */
async function verifyJWT(
  token: string,
  secret: string,
): Promise<{ sub: string; email: string; provider?: string } | null> {
  try {
    const encoder = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );

    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    });

    if (payload.sub && payload.email) {
      return {
        sub: String(payload.sub),
        email: String(payload.email),
        provider: payload.provider ? String(payload.provider) : undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Handle optimistic concurrency update for a table
 */
async function performOptimisticUpdate(
  db: D1Database,
  table: string,
  userId: string,
  id: string,
  expectedVersion: number,
  patch: Record<string, any>,
  allowList: string[],
  idColumn: string = 'id',
) {
  // Validate patch keys
  const keys = Object.keys(patch);
  for (const key of keys) {
    if (!allowList.includes(key)) {
      throw new Error(`Invalid patch key: ${key}`);
    }
  }
  if (keys.length === 0) throw new Error('Empty patch');

  // Build SET clause
  const setClauses = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => patch[k]);

  // ISO string for updated_at
  const now = new Date().toISOString();

  // Construct query
  // NOTE: version is incremented, updated_at is set to now
  const query = `
    UPDATE ${table}
    SET ${setClauses}, version = version + 1, updated_at = ?
    WHERE user_id = ? AND ${idColumn} = ? AND version = ?
  `;

  // Bind parameters: patch values, now, userId, id, expectedVersion
  const { meta } = await db
    .prepare(query)
    .bind(...values, now, userId, id, expectedVersion)
    .run();

  if (meta.changes === 0) {
    // Fetch current to maintain contract
    const current = await db
      .prepare(`SELECT * FROM ${table} WHERE user_id = ? AND ${idColumn} = ?`)
      .bind(userId, id)
      .first();

    // If doesn't exist at all, it's a 404 effectively, but return null so caller decides
    if (!current) {
      return { ok: false, error: 'not_found', latest: null };
    }
    // Conflict
    return { ok: false, error: 'conflict', latest: current };
  }

  // Success: Fetch updated row
  const updated = await db
    .prepare(`SELECT * FROM ${table} WHERE user_id = ? AND ${idColumn} = ?`)
    .bind(userId, id)
    .first();

  return { ok: true, data: updated };
}

async function performOptimisticUpdateById(
  db: D1Database,
  table: string,
  id: string,
  expectedVersion: number,
  patch: Record<string, any>,
  allowList: string[],
  idColumn: string = 'id',
) {
  const keys = Object.keys(patch);
  for (const key of keys) {
    if (!allowList.includes(key)) {
      throw new Error(`Invalid patch key: ${key}`);
    }
  }
  if (keys.length === 0) throw new Error('Empty patch');

  const setClauses = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => patch[k]);
  const now = new Date().toISOString();

  const query = `
    UPDATE ${table}
    SET ${setClauses}, version = version + 1, updated_at = ?
    WHERE ${idColumn} = ? AND version = ?
  `;

  const { meta } = await db
    .prepare(query)
    .bind(...values, now, id, expectedVersion)
    .run();

  if (meta.changes === 0) {
    const current = await db
      .prepare(`SELECT * FROM ${table} WHERE ${idColumn} = ?`)
      .bind(id)
      .first();
    if (!current) {
      return { ok: false, error: 'not_found', latest: null };
    }
    return { ok: false, error: 'conflict', latest: current };
  }

  const updated = await db.prepare(`SELECT * FROM ${table} WHERE ${idColumn} = ?`).bind(id).first();
  return { ok: true, data: updated };
}

async function selectFeedbackWithEmail(db: D1Database, id: string) {
  return db
    .prepare(
      `SELECT user_feedback.id as id,
              user_feedback.user_id as userId,
              user_feedback.type as type,
              user_feedback.title as title,
              user_feedback.description as description,
              user_feedback.app_version as appVersion,
              user_feedback.browser_info as browserInfo,
              user_feedback.status as status,
              user_feedback.priority as priority,
              user_feedback.created_at as createdAt,
              user_feedback.updated_at as updatedAt,
              user_feedback.version as version,
              user_roles.email as email
       FROM user_feedback
       LEFT JOIN user_roles ON user_roles.user_id = user_feedback.user_id
       WHERE user_feedback.id = ?`,
    )
    .bind(id)
    .first<FeedbackRowWithEmail>();
}

// --- Training Sessions (Logged) Endpoints ---

app.get('/api/v1/training-sessions', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const { results } = await c.env.DB.prepare(
    `SELECT * FROM user_training_sessions WHERE user_id = ? ORDER BY date DESC`,
  )
    .bind(user.id)
    .all();

  const camelCaseResults = results.map((row) => ({
    id: row.id,
    userId: row.user_id,
    date: row.date,
    type: row.type,
    duration: row.duration,
    intensity: row.intensity,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version,
  }));

  return c.json(camelCaseResults);
});

app.post('/api/v1/training-sessions', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const payload = await c.req.json();
  const id = payload.id || crypto.randomUUID();
  const now = Date.now();

  try {
    await c.env.DB.prepare(
      `INSERT INTO user_training_sessions (
         id, user_id, date, type, duration, intensity, notes, created_at, updated_at, version
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    )
      .bind(
        id,
        user.id,
        payload.date,
        payload.type,
        payload.duration,
        payload.intensity || null,
        payload.notes || '',
        now,
        now,
      )
      .run();

    return c.json({ ok: true, id, version: 1 });
  } catch (e) {
    console.error('Create training session error:', e);
    return c.json({ error: 'Failed to create session' }, 500);
  }
});

app.put('/api/v1/training-sessions/:id', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const id = c.req.param('id');
  const payload = await c.req.json();

  const now = Date.now();

  // Manual update with versioning
  const current = await c.env.DB.prepare(
    `SELECT version FROM user_training_sessions WHERE user_id = ? AND id = ?`,
  )
    .bind(user.id, id)
    .first<{ version: number }>();

  if (!current) {
    return c.json({ error: 'Not found' }, 404);
  }

  try {
    const updates: string[] = [];
    const values: any[] = [];

    if (payload.date !== undefined) {
      updates.push('date = ?');
      values.push(payload.date);
    }
    if (payload.type !== undefined) {
      updates.push('type = ?');
      values.push(payload.type);
    }
    if (payload.duration !== undefined) {
      updates.push('duration = ?');
      values.push(payload.duration);
    }
    if (payload.intensity !== undefined) {
      updates.push('intensity = ?');
      values.push(payload.intensity);
    }
    if (payload.notes !== undefined) {
      updates.push('notes = ?');
      values.push(payload.notes);
    }

    if (updates.length === 0) return c.json({ ok: true }); // No changes

    updates.push('version = version + 1');
    updates.push('updated_at = ?');
    values.push(now);

    // Where clause
    values.push(user.id);
    values.push(id);

    // Only check version if provided
    let versionSql = '';
    if (payload.version !== undefined) {
      versionSql = ' AND version = ?';
      values.push(payload.version);
    }

    const { meta } = await c.env.DB.prepare(
      `UPDATE user_training_sessions SET ${updates.join(', ')} WHERE user_id = ? AND id = ?${versionSql}`,
    )
      .bind(...values)
      .run();

    if (meta.changes === 0) {
      const updatedCurrent = await c.env.DB.prepare(
        `SELECT * FROM user_training_sessions WHERE user_id = ? AND id = ?`,
      )
        .bind(user.id, id)
        .first();
      if (updatedCurrent) {
        return c.json({ error: 'Conflict', latest: updatedCurrent }, 409);
      }
      return c.json({ error: 'Not found' }, 404);
    }

    const updated = await c.env.DB.prepare(
      `SELECT * FROM user_training_sessions WHERE user_id = ? AND id = ?`,
    )
      .bind(user.id, id)
      .first();

    if (!updated) {
      throw new Error('Failed to retrieve updated session');
    }

    const camelUpdated = {
      id: updated.id,
      userId: updated.user_id,
      date: updated.date,
      type: updated.type,
      duration: updated.duration,
      intensity: updated.intensity,
      notes: updated.notes,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
      version: updated.version,
    };

    return c.json({ ok: true, data: camelUpdated });
  } catch (e) {
    console.error('Update training session error:', e);
    return c.json({ error: 'Update failed' }, 500);
  }
});

app.delete('/api/v1/training-sessions/:id', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const id = c.req.param('id');

  await c.env.DB.prepare(`DELETE FROM user_training_sessions WHERE user_id = ? AND id = ?`)
    .bind(user.id, id)
    .run();

  return c.json({ ok: true });
});

// --- Scheduled Sessions Endpoints ---

app.get('/api/v1/scheduled-sessions', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const { results } = await c.env.DB.prepare(
    `SELECT id, user_id, name, type, start_date, end_date, start_time, duration_minutes, recurrence, color, created_at, updated_at, version, selected_weekdays FROM user_scheduled_sessions WHERE user_id = ?`,
  )
    .bind(user.id)
    .all();

  const camelCaseResults = results.map((row) => {
    let selectedWeekdays: number[] | undefined = undefined;
    if (row.selected_weekdays) {
      try {
        const parsed = JSON.parse(String(row.selected_weekdays));
        if (Array.isArray(parsed)) {
          selectedWeekdays = parsed;
        }
      } catch (e) {
        console.warn('Failed to parse selected_weekdays', e);
      }
    }

    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      type: row.type,
      startDate: row.start_date,
      endDate: row.end_date,
      startTime: row.start_time,
      durationMinutes: row.duration_minutes,
      recurrence: row.recurrence,
      color: row.color,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      version: row.version,
      selectedWeekdays,
    };
  });

  return c.json(camelCaseResults);
});

app.post('/api/v1/scheduled-sessions', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const payload = await c.req.json();
  const id = payload.id || crypto.randomUUID();
  const now = Date.now();

  try {
    await c.env.DB.prepare(
      `INSERT INTO user_scheduled_sessions (
         id, user_id, name, type, start_date, end_date, start_time, 
         duration_minutes, recurrence, color, created_at, updated_at, version, selected_weekdays
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    )
      .bind(
        id,
        user.id,
        payload.name,
        payload.type || null,
        payload.startDate,
        payload.endDate || null,
        payload.startTime,
        payload.durationMinutes,
        payload.recurrence,
        payload.color || null,
        now,
        now,
        payload.selectedWeekdays ? JSON.stringify(payload.selectedWeekdays) : null,
      )
      .run();

    return c.json({ ok: true, id, version: 1 });
  } catch (e) {
    console.error('Create scheduled session error:', e);
    return c.json({ error: 'Failed to create session' }, 500);
  }
});

app.put('/api/v1/scheduled-sessions/:id', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const id = c.req.param('id');
  const payload = await c.req.json();
  const now = Date.now();

  const updates: string[] = [];
  const values: any[] = [];

  if (payload.name !== undefined) {
    updates.push('name = ?');
    values.push(payload.name);
  }
  if (payload.type !== undefined) {
    updates.push('type = ?');
    values.push(payload.type);
  }
  if (payload.startDate !== undefined) {
    updates.push('start_date = ?');
    values.push(payload.startDate);
  }
  if (payload.endDate !== undefined) {
    updates.push('end_date = ?');
    values.push(payload.endDate);
  }
  if (payload.startTime !== undefined) {
    updates.push('start_time = ?');
    values.push(payload.startTime);
  }
  if (payload.durationMinutes !== undefined) {
    updates.push('duration_minutes = ?');
    values.push(payload.durationMinutes);
  }
  if (payload.recurrence !== undefined) {
    updates.push('recurrence = ?');
    values.push(payload.recurrence);
  }
  if (payload.color !== undefined) {
    updates.push('color = ?');
    values.push(payload.color);
  }
  if (payload.selectedWeekdays !== undefined) {
    updates.push('selected_weekdays = ?');
    values.push(payload.selectedWeekdays ? JSON.stringify(payload.selectedWeekdays) : null);
  }

  if (updates.length === 0) return c.json({ ok: true });

  updates.push('version = version + 1');
  updates.push('updated_at = ?');
  values.push(now);

  values.push(user.id);
  values.push(id);

  let versionSql = '';
  if (payload.version !== undefined) {
    versionSql = ' AND version = ?';
    values.push(payload.version);
  }

  try {
    const { meta } = await c.env.DB.prepare(
      `UPDATE user_scheduled_sessions SET ${updates.join(', ')} WHERE user_id = ? AND id = ?${versionSql}`,
    )
      .bind(...values)
      .run();

    if (meta.changes === 0) {
      const updatedCurrent = await c.env.DB.prepare(
        `SELECT * FROM user_scheduled_sessions WHERE user_id = ? AND id = ?`,
      )
        .bind(user.id, id)
        .first();
      if (updatedCurrent) {
        return c.json({ error: 'Conflict', latest: updatedCurrent }, 409);
      }
      return c.json({ error: 'Not found' }, 404);
    }

    const updated = await c.env.DB.prepare(
      `SELECT * FROM user_scheduled_sessions WHERE user_id = ? AND id = ?`,
    )
      .bind(user.id, id)
      .first();

    if (!updated) {
      throw new Error('Failed to retrieve updated scheduled session');
    }

    const camelUpdated = {
      id: updated.id,
      userId: updated.user_id,
      name: updated.name,
      type: updated.type,
      startDate: updated.start_date,
      endDate: updated.end_date,
      startTime: updated.start_time,
      durationMinutes: updated.duration_minutes,
      recurrence: updated.recurrence,
      color: updated.color,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
      version: updated.version,
    };

    return c.json({ ok: true, data: camelUpdated });
  } catch (e) {
    console.error('Update scheduled session error:', e);
    return c.json({ error: 'Update failed' }, 500);
  }
});

app.delete('/api/v1/scheduled-sessions/:id', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const id = c.req.param('id');

  await c.env.DB.prepare(`DELETE FROM user_scheduled_sessions WHERE user_id = ? AND id = ?`)
    .bind(user.id, id)
    .run();

  return c.json({ ok: true });
});

export const __test__ = {
  mergeUserAccounts,
};
// Explicit export for Workers Assets support
export default {
  async fetch(request: Request, env: Bindings, ctx: ExecutionContext) {
    console.log(`[Worker Fetch] ${request.method} ${request.url}`);

    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) {
      // Pass to Hono for API routes
      return app.fetch(request, env, ctx);
    }

    // For non-API routes, attempt to serve asset
    try {
      // First try to serve the exact asset
      const asset = await env.ASSETS.fetch(request);
      if (asset.status >= 200 && asset.status < 400) {
        return asset;
      }

      // If not found and it's a navigation (HTML), serve index.html (SPA Fallback)
      // We can infer navigation by checking file extension or Accept header,
      // but simplistic approach: if it's 404 and not an API call, serve index.html
      // However, we already filtered API calls above.

      // Check if it's a file request (has extension)
      const isFile = /\.[a-zA-Z0-9]+$/.test(url.pathname);
      if (isFile) {
        return asset; // Return the 404 from assets if it was a file request
      }

      // SPA Fallback
      const index = await env.ASSETS.fetch(new URL('/index.html', request.url));
      return index;
    } catch (e) {
      // Fallback to Hono if asset fetch fails completely (shouldn't happen often)
      return app.fetch(request, env, ctx);
    }
  },
  async scheduled(_event: any, env: Bindings, _ctx: any) {
    const now = Math.floor(Date.now() / 1000);
    await env.DB.prepare(`DELETE FROM oauth_transactions WHERE expires_at < ?`).bind(now).run();
    await env.DB.prepare(`DELETE FROM pending_links WHERE expires_at < ?`).bind(now).run();
    await env.DB.prepare(`DELETE FROM oauth_login_codes WHERE expires_at < ?`).bind(now).run();
    await env.DB.prepare(`DELETE FROM rate_limits WHERE reset_at < ?`).bind(now).run();
  },
};
