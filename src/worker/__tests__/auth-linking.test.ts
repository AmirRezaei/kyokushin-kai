import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { SignJWT } from 'jose';

import worker, { __test__ } from '../index.ts';
import { createTestDb, TestD1Database } from './utils/d1';

const jwtSecret = 'test-secret';
const adminEmail = 'admin@example.com';

type TestEnv = {
  DB: TestD1Database;
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  JWT_SECRET: string;
  AUTH_COOKIE_SECRET: string;
  ADMIN_EMAIL: string;
  GOOGLE_CLIENT_ID: string;
  VITE_GOOGLE_CLIENT_ID: string;
  ALLOWED_ORIGINS: string;
  FACEBOOK_APP_ID: string;
  FACEBOOK_APP_SECRET: string;
  FACEBOOK_GRAPH_VERSION: string;
  FACEBOOK_REDIRECT_URI: string;
};

const ctx = {
  waitUntil() {},
  passThroughOnException() {},
};

async function signJwt(userId: string, email: string, provider?: string) {
  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(jwtSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const payload: Record<string, string> = { sub: userId, email };
  if (provider) {
    payload.provider = provider;
  }

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + 3600)
    .sign(secretKey);
}

function createEnv(db: TestD1Database): TestEnv {
  return {
    DB: db,
    ASSETS: {
      fetch: async () => new Response('Not found', { status: 404 }),
    },
    JWT_SECRET: jwtSecret,
    AUTH_COOKIE_SECRET: 'cookie-secret',
    ADMIN_EMAIL: adminEmail,
    GOOGLE_CLIENT_ID: 'test-google-client-id',
    VITE_GOOGLE_CLIENT_ID: 'test-google-client-id',
    ALLOWED_ORIGINS: '',
    FACEBOOK_APP_ID: 'test-fb-app-id',
    FACEBOOK_APP_SECRET: 'test-fb-app-secret',
    FACEBOOK_GRAPH_VERSION: 'v19.0',
    FACEBOOK_REDIRECT_URI: 'https://example.com/oauth/facebook/callback',
  };
}

async function seedUser(
  db: TestD1Database,
  user: { id: string; email: string; name?: string; imageUrl?: string; role?: string },
) {
  const nowIso = new Date().toISOString();
  const settingsPayload = JSON.stringify({});

  await db
    .prepare(
      `INSERT INTO user_settings (user_id, email, display_name, image_url, settings_json, version, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, ?)`,
    )
    .bind(user.id, user.email, user.name || null, user.imageUrl || null, settingsPayload, nowIso)
    .run();

  if (user.role) {
    await db
      .prepare(
        `INSERT INTO user_roles (user_id, email, display_name, image_url, role, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        user.id,
        user.email,
        user.name || null,
        user.imageUrl || null,
        user.role,
        nowIso,
        nowIso,
      )
      .run();
  }
}

describe('auth link/unlink flows', () => {
  let db: TestD1Database;
  let env: TestEnv;

  beforeEach(() => {
    db = createTestDb();
    env = createEnv(db);
  });

  afterEach(() => {
    db.close();
  });

  it('links Facebook via consume and backfills Google identity', async () => {
    const userId = 'user-1';
    const fbId = 'fb-123';
    const code = 'fb-code';
    const now = Math.floor(Date.now() / 1000);

    await seedUser(db, { id: userId, email: 'user1@example.com' });

    await db
      .prepare(
        `INSERT INTO pending_links (code, provider, provider_user_id, return_to, expires_at)
         VALUES (?, 'facebook', ?, ?, ?)`,
      )
      .bind(code, fbId, '/account', now + 600)
      .run();

    const token = await signJwt(userId, 'user1@example.com', 'google');
    const res = await worker.fetch(
      new Request('http://localhost/api/v1/auth/link/facebook/consume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      }),
      env,
      ctx,
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.returnTo).toBe('/account');

    const { results } = await db
      .prepare(`SELECT provider FROM identities WHERE user_id = ?`)
      .bind(userId)
      .all<{ provider: string }>();
    const providers = results.map((row) => row.provider).sort();
    expect(providers).toEqual(['facebook', 'google']);
  });

  it('links Google via consume', async () => {
    const userId = 'user-2';
    const googleId = 'google-456';
    const code = 'google-code';
    const now = Math.floor(Date.now() / 1000);

    await seedUser(db, { id: userId, email: 'user2@example.com' });

    await db
      .prepare(
        `INSERT INTO pending_links (code, provider, provider_user_id, return_to, expires_at)
         VALUES (?, 'google', ?, ?, ?)`,
      )
      .bind(code, googleId, '/settings', now + 600)
      .run();

    const token = await signJwt(userId, 'user2@example.com', 'facebook');
    const res = await worker.fetch(
      new Request('http://localhost/api/v1/auth/link/google/consume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      }),
      env,
      ctx,
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.returnTo).toBe('/settings');

    const identity = await db
      .prepare(
        `SELECT provider_user_id FROM identities WHERE user_id = ? AND provider = 'google'`,
      )
      .bind(userId)
      .first<{ provider_user_id: string }>();
    expect(identity?.provider_user_id).toBe(googleId);
  });

  it('prevents unlinking the last provider', async () => {
    const userId = 'user-3';
    const now = Math.floor(Date.now() / 1000);

    await seedUser(db, { id: userId, email: 'user3@example.com' });
    await db
      .prepare(
        `INSERT INTO identities (id, user_id, provider, provider_user_id, created_at, updated_at)
         VALUES (?, ?, 'google', ?, ?, ?)`,
      )
      .bind('id-1', userId, userId, now, now)
      .run();

    const token = await signJwt(userId, 'user3@example.com', 'google');
    const res = await worker.fetch(
      new Request('http://localhost/api/v1/auth/link/google', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      env,
      ctx,
    );

    expect(res.status).toBe(400);
    const remaining = await db
      .prepare(`SELECT COUNT(*) as count FROM identities WHERE user_id = ?`)
      .bind(userId)
      .first<{ count: number }>();
    expect(remaining?.count).toBe(1);
  });

  it('unlinks Facebook when another provider remains', async () => {
    const userId = 'user-4';
    const now = Math.floor(Date.now() / 1000);

    await seedUser(db, { id: userId, email: 'user4@example.com' });
    await db
      .prepare(
        `INSERT INTO identities (id, user_id, provider, provider_user_id, created_at, updated_at)
         VALUES (?, ?, 'google', ?, ?, ?)`,
      )
      .bind('id-2', userId, userId, now, now)
      .run();
    await db
      .prepare(
        `INSERT INTO identities (id, user_id, provider, provider_user_id, created_at, updated_at)
         VALUES (?, ?, 'facebook', ?, ?, ?)`,
      )
      .bind('id-3', userId, 'fb-999', now, now)
      .run();

    const token = await signJwt(userId, 'user4@example.com', 'google');
    const res = await worker.fetch(
      new Request('http://localhost/api/v1/auth/link/facebook', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      env,
      ctx,
    );

    expect(res.status).toBe(200);
    const identities = await db
      .prepare(`SELECT provider FROM identities WHERE user_id = ? ORDER BY provider`)
      .bind(userId)
      .all<{ provider: string }>();
    const providers = identities.results.map((row) => row.provider);
    expect(providers).toEqual(['google']);
  });
});

describe('account merge behavior', () => {
  let db: TestD1Database;

  beforeEach(() => {
    db = createTestDb();
  });

  afterEach(() => {
    db.close();
  });

  it('merges identities, settings, and roles into target user', async () => {
    const sourceUserId = 'source-user';
    const targetUserId = 'target-user';
    const now = Math.floor(Date.now() / 1000);

    await seedUser(db, {
      id: sourceUserId,
      email: 'source@example.com',
      name: 'Source Name',
      role: 'admin',
    });
    await seedUser(db, { id: targetUserId, email: 'target@example.com', role: 'user' });

    await db
      .prepare(
        `INSERT INTO identities (id, user_id, provider, provider_user_id, created_at, updated_at)
         VALUES (?, ?, 'google', ?, ?, ?)`,
      )
      .bind('google-1', sourceUserId, 'google-111', now, now)
      .run();
    await db
      .prepare(
        `INSERT INTO identities (id, user_id, provider, provider_user_id, created_at, updated_at)
         VALUES (?, ?, 'facebook', ?, ?, ?)`,
      )
      .bind('facebook-1', targetUserId, 'fb-222', now, now)
      .run();

    const result = await __test__.mergeUserAccounts(
      db,
      sourceUserId,
      targetUserId,
      {
        email: 'source@example.com',
        name: 'Source Name',
        picture: undefined,
        providerUserId: 'google-111',
      },
      adminEmail,
    );

    expect(result.user.id).toBe(targetUserId);
    expect(result.providers.sort()).toEqual(['facebook', 'google']);
    expect(result.role).toBe('admin');

    const sourceSettings = await db
      .prepare(`SELECT user_id FROM user_settings WHERE user_id = ?`)
      .bind(sourceUserId)
      .first<{ user_id: string }>();
    expect(sourceSettings).toBeNull();

    const targetRole = await db
      .prepare(`SELECT role FROM user_roles WHERE user_id = ?`)
      .bind(targetUserId)
      .first<{ role: string }>();
    expect(targetRole?.role).toBe('admin');

    const identities = await db
      .prepare(`SELECT provider FROM identities WHERE user_id = ? ORDER BY provider`)
      .bind(targetUserId)
      .all<{ provider: string }>();
    const providers = identities.results.map((row) => row.provider);
    expect(providers).toEqual(['facebook', 'google']);
  });
});
