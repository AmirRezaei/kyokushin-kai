# JWT_SECRET Environment Variable Setup

## ⚠️ CRITICAL: Add JWT_SECRET Before Testing

The custom JWT implementation requires a `JWT_SECRET` environment variable.

---

## Local Development

Add to `.dev.vars` file (create if doesn't exist):

```
JWT_SECRET=your-super-secret-key-change-in-production-minimum-32-characters
```

**Important**:

- Minimum 32 characters recommended
- Use a cryptographically secure random string
- **Never commit this file to git** (should be in `.gitignore`)

### Generate Secure Secret

**PowerShell:**

```powershell
-join((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Node/Bun:**

```javascript
require("crypto").randomBytes(32).toString("hex");
```

---

## Production (Cloudflare Workers)

### Option 1: Using Wrangler CLI

```bash
bun wrangler secret put JWT_SECRET
# Then paste your secret when prompted
```

### Option 2: Cloudflare Dashboard

1. Go to Workers & Pages
2. Select your worker
3. Settings → Variables → Environment Variables
4. Add variable: `JWT_SECRET` = `your-production-secret`
5. Mark as "Encrypt"

---

## Security Best Practices

✅ **DO**:

- Use different secrets for dev/staging/production
- Use minimum 32 characters (64+ recommended)
- Use cryptographically random strings
- Rotate secrets periodically

❌ **DON'T**:

- Use simple passwords
- Commit secrets to git
- Share secrets between environments
- Reuse secrets from other projects

---

## Testing After Setup

1. Add `JWT_SECRET` to `.dev.vars`
2. Restart `bun dev:all`
3. Log out and log in again
4. Check browser DevTools → Network → `/auth/login` response
5. Should see `accessToken` as a JWT (format: `xxx.yyy.zzz`)

---

## Troubleshooting

**Error: "Server configuration error" on login**

- `JWT_SECRET` not set in `.dev.vars`
- Restart dev server after adding it

**Error: "Token verification failed"**

- `JWT_SECRET` mismatch between token creation and verification
- Clear site data (including cached user profile) and re-login

**Still getting 401 after 1 hour**

- Stale cached profile or legacy tokens still stored
- Clear browser storage and re-login to refresh tokens
