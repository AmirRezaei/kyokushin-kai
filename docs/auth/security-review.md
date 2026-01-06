# Refresh Token Implementation - Security & Design Review

Update: Items 1, 2, 3, 4, and 6 have been addressed (custom JWT refresh, functional refreshAccessToken,
httpOnly refresh cookie + rotation, and rate limiting). Remaining items are kept for reference.

## 🚨 CRITICAL ISSUES

### 1. **The Refresh Endpoint Doesn't Actually Refresh the Access Token**

**Problem**: The `/auth/refresh` endpoint validates the refresh token but returns the **same expired Google ID token**.

**Location**: `src/worker/index.ts` lines 157-166

**Impact**: HIGH - The entire refresh mechanism is **non-functional**. Users will still get 401 errors after 1 hour.

**Status**: Fixed - /auth/refresh now issues custom JWTs.

**Why?**: Google ID tokens cannot be refreshed server-side without Google's refresh token (which we don't have).

**Solutions**:

1. **Issue our own JWTs** instead of using Google ID tokens (RECOMMENDED)
2. Get Google OAuth refresh tokens (requires different OAuth flow)
3. Re-authenticate user every hour (defeats purpose)

---

### 2. **Stale Closure in refreshAccessToken**

**Problem**: `refreshAccessToken` captures `user` from closure, but user state may have changed.

**Location**: `AuthContext.tsx` line 107

**Impact**: MEDIUM - Race condition if token refreshes while user state is updating

**Status**: Fixed - refreshAccessToken uses functional state updates.

**Fix**: Use `setUser` functional update or `useRef` for latest user

---

## 🔐 SECURITY VULNERABILITIES

### 3. **Refresh Tokens in localStorage (XSS Risk)**

**Problem**: Refresh tokens stored in localStorage are vulnerable to XSS attacks

**Impact**: MEDIUM - If attacker injects script, they can steal 30-day tokens

**Status**: Fixed - refresh tokens use httpOnly cookies; client no longer stores tokens in localStorage.

**Mitigation**:

- Use httpOnly cookies instead (requires backend changes)
- Implement Content Security Policy (CSP)
- Currently acceptable for dev, needs improvement for production

---

### 4. **No Token Rotation**

**Problem**: Same refresh token reused indefinitely for 30 days

**Impact**: LOW-MEDIUM - Stolen token remains valid until expiry

**Best Practice**: Issue new refresh token on each refresh, invalidate old one

**Status**: Fixed - refresh token rotation implemented.

---

### 5. **Multiple Refresh Tokens Per User**

**Problem**: No cleanup of old refresh tokens on new login

**Location**: `index.ts` line 99-104

**Impact**: LOW - Token accumulation in database

**Fix**: Delete old tokens for same user on login

---

### 6. **No Rate Limiting**

**Problem**: Auth endpoints lack rate limiting

**Impact**: MEDIUM - Vulnerable to brute force attacks

**Status**: Fixed - auth endpoints rate limited.

**Fix**: Add rate limiting middleware (e.g., 5 login attempts per minute)

---

## 🎨 DESIGN FLAWS

### 7. **Race Condition During Concurrent Requests**

**Problem**: Multiple API calls during token refresh may use expired token

**Impact**: LOW - Some requests may fail with 401

**Solution**: Queue requests during refresh or use request interceptor

---

### 8. **No Retry Logic**

**Problem**: Failed refresh immediately logs out user

**Location**: `AuthContext.tsx` line 100-105

**Impact**: MEDIUM - Poor UX if network hiccup

**Fix**: Retry refresh 1-2 times before logout

---

### 9. **Missing Session/Device Tracking**

**Problem**: No per-device session management (only a summary view)

**Impact**: LOW - Limited user control over multi-device sessions

**Enhancement**: Store device info, allow multi-session management and targeted revocation

---

## ✅ GOOD PRACTICES IMPLEMENTED

✅ **Hashed token storage** (SHA-256)  
✅ **Server-side expiry validation**  
✅ **Automatic cleanup on logout**  
✅ **Graceful error handling**  
✅ **Clear timer cleanup**

---

## 📝 RECOMMENDATIONS

### Immediate (Before Production)

1. **FIX CRITICAL: Implement JWT issuance**

   - Create custom JWT signing with long expiry (1 hour)
   - Include user claims (id, email, etc.)
   - Sign with server secret

2. **Fix stale closure**

   - Use functional setState updates

3. **Add rate limiting**
   - 5 login attempts per IP per minute
   - 10 refresh attempts per token per minute

### Medium Priority

4. **Implement token rotation**
5. **Add retry logic to refresh**
6. **Clean up old tokens on login**

### Long Term

7. **Move to httpOnly cookies**
8. **Add session management UI**
9. **Implement device tracking**

---

## 🔧 QUICK FIX for Critical Issue #1

Replace the refresh endpoint to issue custom JWTs:

```typescript
// Install: bun add jsonwebtoken @types/jsonwebtoken

import { sign } from "jsonwebtoken";

app.post("/api/v1/auth/refresh", async (c) => {
  // ... validation code ...

  // Issue new JWT access token
  const accessToken = sign(
    { userId: row.userId },
    c.env.JWT_SECRET, // Add to wrangler.toml
    { expiresIn: "1h" }
  );

  return c.json({
    accessToken,
    expiresIn: 3600,
  });
});
```

Then update `requireUser` to verify custom JWTs or Google tokens.
