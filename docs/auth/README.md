# Authentication Documentation

This directory contains documentation for the authentication system implementation.

## Documents

- **[jwt-implementation-review.md](./jwt-implementation-review.md)** - Comprehensive review of the custom JWT implementation including security analysis, code quality assessment, and recommendations
- **[security-review.md](./security-review.md)** - Initial security and design review that identified the need for custom JWT tokens
- **[jwt-secret-setup.md](./jwt-secret-setup.md)** - Setup instructions for JWT_SECRET environment variable

## Quick Reference

### Authentication Flow

1. User logs in with Google OAuth
2. Backend validates Google ID token
3. Backend issues custom JWT (1h) + refresh token (30d)
4. Client stores both in localStorage
5. Client automatically refreshes JWT 5min before expiry
6. Refresh token enables 30-day sessions

### Technology Stack

- **Authentication**: Google Sign-In
- **Authorization**: Custom JWT (HMAC-SHA256)
- **Token Management**: Refresh tokens (server-side)
- **Library**: `jose` for JWT operations

### Key Files

- Backend: `src/worker/index.ts` (auth endpoints)
- Frontend: `src/react-app/components/context/AuthContext.tsx`
- Database: `src/worker/migrations/0009_refresh_tokens.sql`

### Environment Setup

```bash
# .dev.vars (local development)
JWT_SECRET=your-64-character-random-string

# Production (Cloudflare)
bun wrangler secret put JWT_SECRET
```

---

_Last Updated: 2025-12-19_
