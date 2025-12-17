// file: cloudflare/pm-api/src/index.ts
import {Hono, type Context} from 'hono';
import {cors} from 'hono/cors';
import {createRemoteJWKSet, jwtVerify} from 'jose';

type Bindings = {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  VITE_GOOGLE_CLIENT_ID?: string;
  VITE_API_BASE_URL?: string;
  ALLOWED_ORIGINS?: string;
};

export type PersistedSettings = {
  gradeHistory: Array<{date: string; gradeId: string}>;
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

const app = new Hono<{Bindings: Bindings}>();

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

app.get('/api/v1/health', async c => {
  const dbOk = await c.env.DB.prepare('SELECT 1 as ok').first<{ok: number}>();
  return c.json({ok: true, db: dbOk?.ok === 1});
});

app.get('/api/v1/public-config', c => {
  const requestUrl = new URL(c.req.url);
  const payload = {
    googleClientId: c.env.VITE_GOOGLE_CLIENT_ID ?? c.env.GOOGLE_CLIENT_ID ?? '',
    apiBaseUrl: c.env.VITE_API_BASE_URL ?? requestUrl.origin,
  };
  return c.json(payload, 200);
});

app.get('/api/v1/settings', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const row = await c.env.DB.prepare(
    `SELECT settings_json as jsonBlob, updated_at as updatedAt FROM user_settings WHERE user_id = ? LIMIT 1`,
  )
    .bind(user.id)
    .first<{jsonBlob: string; updatedAt: number} | null>();

  if (!row) {
    return c.json({settings: null, updatedAt: null});
  }

  const parsed = parseSettings(row.jsonBlob);
  return c.json({settings: parsed, updatedAt: row.updatedAt});
});

app.put('/api/v1/settings', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  let payload: Partial<PersistedSettings>;
  try {
    payload = await c.req.json<Partial<PersistedSettings>>();
  } catch {
    return c.json({error: 'Invalid JSON body'}, 400);
  }

  const sanitized = sanitizeSettings(payload);

  const serialized = JSON.stringify(sanitized);
  await c.env.DB.prepare(
    `INSERT INTO user_settings (user_id, email, display_name, image_url, settings_json, updated_at)
     VALUES (?, ?, ?, ?, ?, strftime('%s','now'))
     ON CONFLICT(user_id) DO UPDATE SET
       email = excluded.email,
       display_name = excluded.display_name,
       image_url = excluded.image_url,
       settings_json = excluded.settings_json,
       updated_at = strftime('%s','now')`,
  )
    .bind(user.id, user.email, user.name ?? null, user.picture ?? null, serialized)
    .run();

  return c.json({ok: true});
});

app.onError((err, c) => {
  console.error('Worker error', err);
  return c.json({error: 'Internal Server Error'}, 500);
});

export default app;

async function requireUser(c: Context<{Bindings: Bindings}>) {
  const header = c.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length);
  if (!token) return null;
  const clientId = c.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.warn('GOOGLE_CLIENT_ID is not configured');
    return null;
  }

  try {
    const {payload} = await jwtVerify(token, jwks, {
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
    console.warn('Google token verification failed', error);
    return null;
  }
}

function parseAllowedOrigins(value?: string) {
  return (value ?? '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
}

function parseSettings(blob: string): PersistedSettings {
  try {
    const json = JSON.parse(blob) as PersistedSettings;
    return {
      gradeHistory: Array.isArray(json.gradeHistory)
        ? json.gradeHistory
            .filter(entry => typeof entry?.date === 'string' && typeof entry?.gradeId === 'string')
            .map(entry => ({date: entry.date, gradeId: entry.gradeId}))
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
        .filter(entry => typeof entry?.date === 'string' && entry?.date.length > 0 && typeof entry?.gradeId === 'string')
        .map(entry => ({date: entry.date, gradeId: entry.gradeId}))
    : [];

  const trainedDays =
    typeof payload.trainedDays === 'number' && Number.isFinite(payload.trainedDays)
      ? Math.max(0, Math.trunc(payload.trainedDays))
      : 0;
  const lastTrainedDate =
    typeof payload.lastTrainedDate === 'string' && payload.lastTrainedDate.length > 0 ? payload.lastTrainedDate : null;

  const skipItems =
    typeof payload.skipDeleteConfirmForComboItems === 'boolean' ? payload.skipDeleteConfirmForComboItems : false;
  const skipCombo = typeof payload.skipDeleteConfirmForCombo === 'boolean' ? payload.skipDeleteConfirmForCombo : false;

  return {
    gradeHistory,
    trainedDays,
    lastTrainedDate,
    skipDeleteConfirmForComboItems: skipItems,
    skipDeleteConfirmForCombo: skipCombo,
  };
}

function unauthorized(c: Context<{Bindings: Bindings}>) {
  return c.json({error: 'Unauthorized'}, 401);
}
