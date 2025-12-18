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


// --- Technique Progress Endpoints ---

interface TechniqueProgressRow {
  techniqueId: string;
  status: string;
  rating: number;
  notes: string;
  tags: string | null;
  videoLinks: string | null;
  updatedAt: number;
}

app.get('/api/v1/technique-progress', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const { results } = await c.env.DB.prepare(
    `SELECT technique_id as techniqueId, status, rating, notes, tags, video_links as videoLinks, updated_at as updatedAt 
     FROM user_technique_progress 
     WHERE user_id = ?`
  )
    .bind(user.id)
    .all<TechniqueProgressRow>();

  // Parse JSON fields
  const parsed = results.map(row => ({
    ...row,
    tags: parseJsonSafely(row.tags, []),
    videoLinks: parseJsonSafely(row.videoLinks, []),
    // Ensure numbers/dates are correct types
    rating: Number(row.rating),
    updatedAt: Number(row.updatedAt)
  }));

  return c.json({ progress: parsed });
});

app.post('/api/v1/technique-progress', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  let payload: {
    techniqueId: string;
    status?: string;
    rating?: number;
    notes?: string;
    tags?: string[];
    videoLinks?: string[];
  };

  try {
    payload = await c.req.json();
    if (!payload.techniqueId) throw new Error('Missing techniqueId');
  } catch {
    return c.json({ error: 'Invalid JSON or missing techniqueId' }, 400);
  }

  const existing = await c.env.DB.prepare(
    'SELECT * FROM user_technique_progress WHERE user_id = ? AND technique_id = ?'
  )
  .bind(user.id, payload.techniqueId)
  .first<{tags: string | null; video_links: string | null; status: string; rating: number; notes: string} | null>();

  const currentTags = existing ? parseJsonSafely(existing.tags, []) : [];
  const currentVideoLinks = existing ? parseJsonSafely(existing.video_links, []) : [];

  const newStatus = payload.status ?? existing?.status ?? 'not-started';
  const newRating = payload.rating ?? existing?.rating ?? 0;
  const newNotes = payload.notes ?? existing?.notes ?? '';
  const newTags = payload.tags ?? currentTags;
  const newVideoLinks = payload.videoLinks ?? currentVideoLinks; 

  const tagsJson = JSON.stringify(newTags);
  const videoLinksJson = JSON.stringify(newVideoLinks);

  await c.env.DB.prepare(
    `INSERT INTO user_technique_progress 
       (user_id, technique_id, status, rating, notes, tags, video_links, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, strftime('%s','now'))
     ON CONFLICT(user_id, technique_id) DO UPDATE SET
       status = excluded.status,
       rating = excluded.rating,
       notes = excluded.notes,
       tags = excluded.tags,
       video_links = excluded.video_links,
       updated_at = excluded.updated_at`
  )
  .bind(user.id, payload.techniqueId, newStatus, newRating, newNotes, tagsJson, videoLinksJson)
  .run();

  return c.json({ ok: true });
});

// --- Terminology Progress Endpoints ---

interface TerminologyProgressRow {
  termId: string;
  isBookmarked: number;
  updatedAt: number;
}

app.get('/api/v1/terminology-progress', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const { results } = await c.env.DB.prepare(
    `SELECT term_id as termId, is_bookmarked as isBookmarked, updated_at as updatedAt 
     FROM user_terminology_progress 
     WHERE user_id = ? AND is_bookmarked = 1`
  )
    .bind(user.id)
    .all<TerminologyProgressRow>();

  // Use optional chaining to safely access results, defaulting to empty array if undefined
  const bookmarks = (results || []).map(row => row.termId);

  return c.json({ bookmarks });
});

app.post('/api/v1/terminology-progress', async c => {
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
       updated_at = excluded.updated_at`
  )
  .bind(user.id, payload.termId, isBookmarkedInt)
  .run();

  return c.json({ ok: true });
});

// --- WordQuest Endpoints ---

interface WordQuestProgressRow {
  techniqueId: string;
}

app.get('/api/v1/wordquest/progress', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const { results } = await c.env.DB.prepare(
    `SELECT technique_id as techniqueId FROM user_wordquest_progress WHERE user_id = ?`
  )
    .bind(user.id)
    .all<WordQuestProgressRow>();

  const solvedIds = (results || []).map(row => row.techniqueId);
  return c.json({ solvedIds });
});

app.post('/api/v1/wordquest/progress', async c => {
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
     ON CONFLICT(user_id, technique_id) DO NOTHING`
  )
  .bind(user.id, payload.techniqueId)
  .run();

  return c.json({ ok: true });
});

app.get('/api/v1/wordquest/state/:gameId', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const gameId = c.req.param('gameId');

  const row = await c.env.DB.prepare(
    `SELECT data FROM user_game_state WHERE user_id = ? AND game_id = ?`
  )
  .bind(user.id, gameId)
  .first<{data: string} | null>();

  const state = row ? parseJsonSafely(row.data, {}) : {};
  return c.json({ state });
});

app.post('/api/v1/wordquest/state/:gameId', async c => {
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
       updated_at = excluded.updated_at`
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
}

interface FlashCardRow {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  deckId: string | null;
  updatedAt: number;
}

// Decks
app.get('/api/v1/decks', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const { results } = await c.env.DB.prepare(
    `SELECT id, name, description, updated_at as updatedAt FROM user_flashcard_decks WHERE user_id = ?`
  )
    .bind(user.id)
    .all<DeckRow>();

  // Use optional chaining default
  const decks = (results || []).map(row => ({
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    flashCardIds: [], // Populated by frontend from flashcards list
  }));
  return c.json({ decks });
});

app.post('/api/v1/decks', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  let payload: { id: string; name: string; description?: string };
  try {
    payload = await c.req.json();
    if (!payload.id || !payload.name) throw new Error('Missing fields');
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO user_flashcard_decks (user_id, id, name, description, updated_at)
     VALUES (?, ?, ?, ?, strftime('%s','now'))
     ON CONFLICT(user_id, id) DO UPDATE SET
       name = excluded.name,
       description = excluded.description,
       updated_at = excluded.updated_at`
  )
  .bind(user.id, payload.id, payload.name, payload.description || null)
  .run();

  return c.json({ ok: true });
});

app.delete('/api/v1/decks/:id', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const id = c.req.param('id');

  await c.env.DB.batch([
    c.env.DB.prepare(`DELETE FROM user_flashcard_decks WHERE user_id = ? AND id = ?`).bind(user.id, id),
    // Also remove deckId from cards, or delete cards? 
    // Logic in frontend was: set deckId=undefined. 
    // In DB, if we delete deck, we should update cards to have deck_id = NULL
    c.env.DB.prepare(`UPDATE user_flashcards SET deck_id = NULL WHERE user_id = ? AND deck_id = ?`).bind(user.id, id)
  ]);

  return c.json({ ok: true });
});

// FlashCards
app.get('/api/v1/flashcards', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const { results } = await c.env.DB.prepare(
    `SELECT id, question, answer, category, deck_id as deckId, updated_at as updatedAt FROM user_flashcards WHERE user_id = ?`
  )
    .bind(user.id)
    .all<FlashCardRow>();

  const flashCards = (results || []).map(row => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category || undefined,
    deckId: row.deckId || undefined,
  }));
  return c.json({ flashCards });
});

app.post('/api/v1/flashcards', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  let payload: { id: string; question: string; answer: string; category?: string; deckId?: string };
  try {
    payload = await c.req.json();
    if (!payload.id || !payload.question || !payload.answer) throw new Error('Missing fields');
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO user_flashcards (user_id, id, question, answer, category, deck_id, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, strftime('%s','now'))
     ON CONFLICT(user_id, id) DO UPDATE SET
       question = excluded.question,
       answer = excluded.answer,
       category = excluded.category,
       deck_id = excluded.deck_id,
       updated_at = excluded.updated_at`
  )
  .bind(user.id, payload.id, payload.question, payload.answer, payload.category || null, payload.deckId || null)
  .run();

  return c.json({ ok: true });
});

app.delete('/api/v1/flashcards/:id', async c => {
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
}

app.get('/api/v1/training-sessions', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  const { results } = await c.env.DB.prepare(
    `SELECT id, date, type, duration, intensity, notes, updated_at as updatedAt 
     FROM user_training_sessions 
     WHERE user_id = ?
     ORDER BY date DESC`
  )
    .bind(user.id)
    .all<TrainingSessionRow>();

  const sessions = (results || []).map(row => ({
    id: row.id,
    date: row.date,
    type: row.type,
    duration: row.duration,
    intensity: row.intensity || undefined,
    notes: row.notes || undefined,
  }));
  return c.json({ sessions });
});

app.post('/api/v1/training-sessions', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);

  let payload: { id: string; date: string; type: string; duration: number; intensity?: string; notes?: string };
  try {
    payload = await c.req.json();
    if (!payload.id || !payload.date || !payload.type) throw new Error('Missing fields');
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO user_training_sessions (user_id, id, date, type, duration, intensity, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, strftime('%s','now'), strftime('%s','now'))
     ON CONFLICT(user_id, id) DO UPDATE SET
       date = excluded.date,
       type = excluded.type,
       duration = excluded.duration,
       intensity = excluded.intensity,
       notes = excluded.notes,
       updated_at = excluded.updated_at`
  )
  .bind(user.id, payload.id, payload.date, payload.type, payload.duration, payload.intensity || null, payload.notes || null)
  .run();

  return c.json({ ok: true });
});

app.delete('/api/v1/training-sessions/:id', async c => {
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
app.get('/api/v1/gym/sessions', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM user_gym_sessions WHERE user_id = ? ORDER BY date DESC`
  ).bind(user.id).all();
  const sessions = (results || []).map((row: any) => ({
    ...row,
    exercises: parseJsonSafely(row.exercises, []),
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    workoutPlanId: row.workout_plan_id
  }));
  return c.json({ sessions });
});

app.post('/api/v1/gym/sessions', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  let payload: any;
  try { payload = await c.req.json(); } catch { return c.json({error: 'Invalid JSON'}, 400); }
  
  await c.env.DB.prepare(
    `INSERT INTO user_gym_sessions (user_id, id, workout_plan_id, date, exercises, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, strftime('%s','now'), strftime('%s','now'))
     ON CONFLICT(user_id, id) DO UPDATE SET
       workout_plan_id = excluded.workout_plan_id,
       date = excluded.date,
       exercises = excluded.exercises,
       updated_at = excluded.updated_at`
  ).bind(user.id, payload.id, payload.workoutPlanId || null, payload.date, JSON.stringify(payload.exercises || []),).run();
  
  return c.json({ ok: true });
});

app.delete('/api/v1/gym/sessions/:id', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  await c.env.DB.prepare(`DELETE FROM user_gym_sessions WHERE user_id = ? AND id = ?`).bind(user.id, c.req.param('id')).run();
  return c.json({ ok: true });
});

// 2. Gym Workout Plans
app.get('/api/v1/gym/plans', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const { results } = await c.env.DB.prepare(`SELECT * FROM user_workout_plans WHERE user_id = ?`).bind(user.id).all();
  const plans = (results || []).map((row: any) => ({
    ...row,
    exercises: parseJsonSafely(row.exercises, [])
  }));
  return c.json({ plans });
});

app.post('/api/v1/gym/plans', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  let payload: any;
  try { payload = await c.req.json(); } catch { return c.json({error: 'Invalid JSON'}, 400); }

  await c.env.DB.prepare(
    `INSERT INTO user_workout_plans (user_id, id, name, exercises, created_at, updated_at)
     VALUES (?, ?, ?, ?, strftime('%s','now'), strftime('%s','now'))
     ON CONFLICT(user_id, id) DO UPDATE SET
       name = excluded.name,
       exercises = excluded.exercises,
       updated_at = excluded.updated_at`
  ).bind(user.id, payload.id, payload.name, JSON.stringify(payload.exercises || [])).run();
  return c.json({ ok: true });
});

app.delete('/api/v1/gym/plans/:id', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  await c.env.DB.prepare(`DELETE FROM user_workout_plans WHERE user_id = ? AND id = ?`).bind(user.id, c.req.param('id')).run();
  return c.json({ ok: true });
});

// 3. Gym Exercises
app.get('/api/v1/gym/exercises', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const { results } = await c.env.DB.prepare(`SELECT * FROM user_gym_exercises WHERE user_id = ?`).bind(user.id).all();
  const exercises = (results || []).map((row: any) => ({
    ...row,
    muscleGroupIds: parseJsonSafely(row.muscle_group_ids, []),
    equipmentIds: parseJsonSafely(row.equipment_ids, [])
  }));
  return c.json({ exercises });
});

app.post('/api/v1/gym/exercises', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  let payload: any;
  try { payload = await c.req.json(); } catch { return c.json({error: 'Invalid JSON'}, 400); }

  await c.env.DB.prepare(
    `INSERT INTO user_gym_exercises (user_id, id, name, muscle_group_ids, equipment_ids, how, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, strftime('%s','now'), strftime('%s','now'))
     ON CONFLICT(user_id, id) DO UPDATE SET
       name = excluded.name,
       muscle_group_ids = excluded.muscle_group_ids,
       equipment_ids = excluded.equipment_ids,
       how = excluded.how,
       updated_at = excluded.updated_at`
  ).bind(user.id, payload.id, payload.name, JSON.stringify(payload.muscleGroupIds || []), JSON.stringify(payload.equipmentIds || []), payload.how || '').run();
  return c.json({ ok: true });
});

app.delete('/api/v1/gym/exercises/:id', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  await c.env.DB.prepare(`DELETE FROM user_gym_exercises WHERE user_id = ? AND id = ?`).bind(user.id, c.req.param('id')).run();
  return c.json({ ok: true });
});

// 4. Gym Equipment
app.get('/api/v1/gym/equipment', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const { results } = await c.env.DB.prepare(`SELECT * FROM user_gym_equipment WHERE user_id = ?`).bind(user.id).all();
  return c.json({ equipment: results });
});

app.post('/api/v1/gym/equipment', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  let payload: any;
  try { payload = await c.req.json(); } catch { return c.json({error: 'Invalid JSON'}, 400); }

  await c.env.DB.prepare(
    `INSERT INTO user_gym_equipment (user_id, id, name, description, created_at, updated_at)
     VALUES (?, ?, ?, ?, strftime('%s','now'), strftime('%s','now'))
     ON CONFLICT(user_id, id) DO UPDATE SET
       name = excluded.name,
       description = excluded.description,
       updated_at = excluded.updated_at`
  ).bind(user.id, payload.id, payload.name, payload.description || '').run();
  return c.json({ ok: true });
});

app.delete('/api/v1/gym/equipment/:id', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  await c.env.DB.prepare(`DELETE FROM user_gym_equipment WHERE user_id = ? AND id = ?`).bind(user.id, c.req.param('id')).run();
  return c.json({ ok: true });
});

// 5. User Muscle Groups
app.get('/api/v1/gym/muscle-groups', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  const { results } = await c.env.DB.prepare(`SELECT * FROM user_muscle_groups WHERE user_id = ?`).bind(user.id).all();
  return c.json({ muscleGroups: results });
});

app.post('/api/v1/gym/muscle-groups', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  let payload: any;
  try { payload = await c.req.json(); } catch { return c.json({error: 'Invalid JSON'}, 400); }

  await c.env.DB.prepare(
    `INSERT INTO user_muscle_groups (user_id, id, name, created_at, updated_at)
     VALUES (?, ?, ?, strftime('%s','now'), strftime('%s','now'))
     ON CONFLICT(user_id, id) DO UPDATE SET
       name = excluded.name,
       updated_at = excluded.updated_at`
  ).bind(user.id, payload.id, payload.name).run();
  return c.json({ ok: true });
});

app.delete('/api/v1/gym/muscle-groups/:id', async c => {
  const user = await requireUser(c);
  if (!user) return unauthorized(c);
  await c.env.DB.prepare(`DELETE FROM user_muscle_groups WHERE user_id = ? AND id = ?`).bind(user.id, c.req.param('id')).run();
  return c.json({ ok: true });
});

app.onError((err, c) => {
  console.error('Worker error', err);
  // Return actual error message for debugging
  return c.json({error: err.message || 'Internal Server Error', stack: err.stack}, 500);
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

function parseJsonSafely<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}
