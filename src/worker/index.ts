// file: cloudflare/pm-api/src/index.ts
import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { createRemoteJWKSet, jwtVerify, SignJWT } from 'jose';

type Bindings = {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  JWT_SECRET: string;
  VITE_GOOGLE_CLIENT_ID?: string;
  VITE_API_BASE_URL?: string;
  ALLOWED_ORIGINS?: string;
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
};

const jwks = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  '*',
  cors({
    origin: (origin, c) => {
      const allowed = parseAllowedOrigins(c.env.ALLOWED_ORIGINS);
      if (!allowed.length) return '*';
      if (!origin) return allowed[0];
      return allowed.includes(origin) ? origin : allowed[0];
    },
    allowMethods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  }),
);

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
   * - No rate limiting (add Cloudflare rate limiting rules)
   * - No old token cleanup (consider adding on login)
   *
   * @body {idToken: string} - Google ID token from OAuth flow
   * @returns {accessToken: JWT, refreshToken, expiresIn, user}
   */
  let payload: { idToken: string };
  try {
    payload = await c.req.json();
    if (!payload.idToken) throw new Error('Missing idToken');
  } catch {
    return c.json({ error: 'Invalid request' }, 400);
  }

  const clientId = c.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return c.json({ error: 'Server configuration error' }, 500);
  }

  try {
    // Verify Google ID token
    const { payload: googlePayload } = await jwtVerify(payload.idToken, jwks, {
      audience: clientId,
    });

    if (!googlePayload.sub || !googlePayload.email) {
      throw new Error('Missing email or sub claim');
    }

    const userId = String(googlePayload.sub);
    const email = String(googlePayload.email);
    const name = googlePayload.name ? String(googlePayload.name) : undefined;
    const picture = googlePayload.picture ? String(googlePayload.picture) : undefined;

    // Generate refresh token (30 days)
    const refreshToken = generateRefreshToken();
    const tokenHash = await hashToken(refreshToken);
    const expiresAt = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days

    // Store in database
    await c.env.DB.prepare(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, last_used_at)
       VALUES (?, ?, ?, ?, strftime('%s', 'now'))`,
    )
      .bind(crypto.randomUUID(), userId, tokenHash, expiresAt)
      .run();

    // Create custom JWT token (1 hour expiry)
    const accessToken = await createJWT(userId, email, c.env.JWT_SECRET, 3600);

    return c.json({
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour
      user: {
        id: userId,
        email,
        name,
        picture,
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
   * - No token rotation (same refresh token reused)
   * - No rate limiting
   *
   * @body {refreshToken: string}
   * @returns {accessToken, expiresIn}
   */
  let payload: { refreshToken: string };
  try {
    payload = await c.req.json();
    if (!payload.refreshToken) throw new Error('Missing refreshToken');
  } catch {
    return c.json({ error: 'Invalid request' }, 400);
  }

  try {
    const tokenHash = await hashToken(payload.refreshToken);
    const now = Math.floor(Date.now() / 1000);

    // Find and validate refresh token + get user email
    const row = await c.env.DB.prepare(
      `SELECT rt.user_id as userId, rt.expires_at as expiresAt, us.email as email
       FROM refresh_tokens rt
       JOIN user_settings us ON rt.user_id = us.user_id
       WHERE rt.token_hash = ? AND rt.expires_at > ?
       LIMIT 1`,
    )
      .bind(tokenHash, now)
      .first<{ userId: string; expiresAt: number; email: string }>();

    if (!row) {
      return c.json({ error: 'Invalid or expired refresh token' }, 401);
    }

    //Update last_used_at
    await c.env.DB.prepare(
      `UPDATE refresh_tokens SET last_used_at = strftime('%s', 'now') WHERE token_hash = ?`,
    )
      .bind(tokenHash)
      .run();

    // Issue new custom JWT token (1 hour expiry)
    const accessToken = await createJWT(row.userId, row.email, c.env.JWT_SECRET, 3600);

    return c.json({
      accessToken,
      expiresIn: 3600,
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
   * @body {refreshToken: string}
   * @returns {ok: boolean}
   */
  let payload: { refreshToken: string };
  try {
    payload = await c.req.json();
    if (!payload.refreshToken) throw new Error('Missing refreshToken');
  } catch {
    return c.json({ error: 'Invalid request' }, 400);
  }

  try {
    const tokenHash = await hashToken(payload.refreshToken);

    // Delete refresh token
    await c.env.DB.prepare(`DELETE FROM refresh_tokens WHERE token_hash = ?`).bind(tokenHash).run();

    return c.json({ ok: true });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ error: 'Logout failed' }, 500);
  }
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
      .bind(user.id, user.email, user.name || null, user.picture || null, serialized, now)
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

// --- FlashCard & Deck Endpoints ---

interface DeckRow {
  id: string;
  name: string;
  description: string | null;
  updatedAt: number;
  version: number;
}

interface FlashCardRow {
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
    `SELECT id, name, description, updated_at as updatedAt, version FROM user_flashcard_decks WHERE user_id = ?`,
  )
    .bind(user.id)
    .all<DeckRow>();

  const decks = (results || []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    version: row.version,
    updatedAt: row.updatedAt,
    flashCardIds: [],
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
      `INSERT INTO user_flashcard_decks (user_id, id, name, description, updated_at, version)
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
    'user_flashcard_decks',
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
    c.env.DB.prepare(`DELETE FROM user_flashcard_decks WHERE user_id = ? AND id = ?`).bind(
      user.id,
      id,
    ),
    // Also remove deckId from cards, or delete cards?
    // Logic in frontend was: set deckId=undefined.
    // In DB, if we delete deck, we should update cards to have deck_id = NULL
    c.env.DB.prepare(
      `UPDATE user_flashcards SET deck_id = NULL WHERE user_id = ? AND deck_id = ?`,
    ).bind(user.id, id),
  ]);

  return c.json({ ok: true });
});

// FlashCards
app.get('/api/v1/flashcards', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const { results } = await c.env.DB.prepare(
    `SELECT id, question, answer, category, deck_id as deckId, updated_at as updatedAt, version FROM user_flashcards WHERE user_id = ?`,
  )
    .bind(user.id)
    .all<FlashCardRow>();

  const flashCards = (results || []).map((row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category || undefined,
    deckId: row.deckId || undefined,
    version: row.version,
    updatedAt: row.updatedAt,
  }));
  return c.json({ flashCards });
});

app.post('/api/v1/flashcards', async (c) => {
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
      `INSERT INTO user_flashcards (user_id, id, question, answer, category, deck_id, updated_at, version)
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

app.patch('/api/v1/flashcards/:id', async (c) => {
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
    'user_flashcards',
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

app.delete('/api/v1/flashcards/:id', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const id = c.req.param('id');

  await c.env.DB.prepare(`DELETE FROM user_flashcards WHERE user_id = ? AND id = ?`)
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
  return c.json({ equipment: results });
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
    `INSERT INTO user_gym_equipment (user_id, id, name, description, created_at, updated_at)
     VALUES (?, ?, ?, ?, strftime('%s','now'), strftime('%s','now'))
     ON CONFLICT(user_id, id) DO UPDATE SET
       name = excluded.name,
       description = excluded.description,
       updated_at = excluded.updated_at`,
  )
    .bind(user.id, payload.id, payload.name, payload.description || '')
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

app.onError((err, c) => {
  console.error('Worker error', err);
  // Return actual error message for debugging
  return c.json({ error: err.message || 'Internal Server Error', stack: err.stack }, 500);
});

export default app;

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
    });

    if (!payload.sub || !payload.email) {
      throw new Error('Missing email or sub claim');
    }

    const profile: UserProfile = {
      id: String(payload.sub),
      email: String(payload.email),
      name: payload.name ? String(payload.name) : undefined,
      picture: payload.picture ? String(payload.picture) : undefined,
    };

    return profile;
  } catch (error) {
    console.warn('Token verification failed', error);
    return null;
  }
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

// --- Auth Utility Functions ---

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
): Promise<string> {
  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const jwt = await new SignJWT({
    sub: userId,
    email,
    type: 'access',
  })
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
): Promise<{ sub: string; email: string } | null> {
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
