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
};

const PUBLISH_STATUSES = new Set<PublishStatus>(['draft', 'published', 'inactive']);

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
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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
    const role = await upsertUserRole(
      c.env.DB,
      { id: userId, email, name, picture },
      normalizeEmail(c.env.ADMIN_EMAIL),
    );

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
        role,
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
    const role = await getUserRole(c.env.DB, { id: row.userId, email: row.email }, normalizeEmail(c.env.ADMIN_EMAIL));

    return c.json({
      accessToken,
      expiresIn: 3600,
      role,
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

app.get('/api/v1/auth/me', async (c) => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const role = await getUserRole(c.env.DB, user, normalizeEmail(c.env.ADMIN_EMAIL));

  return c.json({
    user: {
      id: user.id,
      email: user.email,
    },
    role,
  });
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
            updated_at as updatedAt
     FROM user_roles
     ORDER BY role DESC, email ASC`,
  ).all<{
    userId: string;
    email: string;
    displayName: string | null;
    imageUrl: string | null;
    role: UserRole;
    updatedAt: string;
  }>();

  return c.json({ users: results || [] });
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
  const role = user
    ? await getUserRole(c.env.DB, user, normalizeEmail(c.env.ADMIN_EMAIL))
    : 'user';

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

// --- Quote Endpoints ---

app.get('/api/v1/quotes', async (c) => {
  const user = await requireUser(c);
  const role = user
    ? await getUserRole(c.env.DB, user, normalizeEmail(c.env.ADMIN_EMAIL))
    : 'user';

  const query =
    role === 'admin'
      ? `SELECT id, data_json, author, status, created_at, updated_at, version FROM quotes`
      : `SELECT id, data_json, author, status, created_at, updated_at, version
         FROM quotes
         WHERE status = 'published'`;

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
    `INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
  )
    .bind(
      quote.id,
      JSON.stringify(quote),
      quote.author,
      quote.status,
      quote.createdAt,
      quote.updatedAt,
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
    `SELECT id, data_json, author, status, created_at, updated_at, version
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
     SET data_json = ?, author = ?, status = ?, updated_at = ?, version = version + 1
     WHERE id = ?`,
  )
    .bind(JSON.stringify(updated), updated.author, updated.status, updated.updatedAt, id)
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

function normalizeEmail(value?: string) {
  return (value ?? '').trim().toLowerCase();
}

async function getUserRole(db: D1Database, user: { id: string; email: string }, adminEmail: string) {
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

function parseTechniquePatch(payload: Partial<TechniqueRecord> | null): Partial<TechniqueRecord> | null {
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

function mergeTechnique(existing: TechniqueRecord, patch: Partial<TechniqueRecord>): TechniqueRecord {
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
    rankInput !== undefined ? normalizeGradeRank(kind, rankInput) : deriveGradeRank(kind, numberInput || 0);
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
      await db.prepare(`DELETE FROM grade_techniques WHERE technique_id = ?`).bind(techniqueId).run();
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

async function replaceTechniqueAssignments(
  db: D1Database,
  techniqueId: string,
  gradeId?: string,
) {
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

async function replaceKataAssignments(
  db: D1Database,
  kataId: string,
  gradeId?: string,
) {
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

  const { meta } = await db.prepare(query).bind(...values, now, id, expectedVersion).run();

  if (meta.changes === 0) {
    const current = await db.prepare(`SELECT * FROM ${table} WHERE ${idColumn} = ?`).bind(id).first();
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
