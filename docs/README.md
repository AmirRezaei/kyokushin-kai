# Kyokushin-Kai Application

> Full-stack Kyokushin Karate training application with technique tracking, flashcards, training management, and educational games.

## Quick Start

```bash
# Install dependencies
bun install

# Set up environment
# Create .dev.vars with: GOOGLE_CLIENT_ID, JWT_SECRET
# Create .env with: VITE_GOOGLE_CLIENT_ID, VITE_API_BASE_URL

# Initialize local database
bun run db:local:migrate

# Start dev servers (frontend + backend)
bun run dev:all
```

**Access**: http://localhost:3000 (frontend), http://localhost:8787 (API)

---

## Tech Stack

- **Frontend**: React 19, Vite 6, MUI v6, TypeScript 5.8
- **Backend**: Cloudflare Workers, Hono 4.10
- **Database**: Cloudflare D1 (SQLite)
- **Auth**: Google OAuth + Custom JWT

---

## Architecture

```
React SPA (localhost:3000)
    ↓ HTTPS
Cloudflare Worker API (localhost:8787)
    ↓
D1 Database (SQLite)
```

### Key Patterns

- **Static Data**: Pre-compiled curriculum ([`catalog.json`](file:///c:/Users/itkom/source/kyokushin-kai/src/data/repo/catalog.json)) via `KyokushinRepository`
- **Dynamic Data**: User progress via API repositories (e.g., `TrainingSessionRepository`)
- **Auth**: OAuth 2.0 → Custom JWT (1h) + Refresh token (30d)
- **State**: React Context API (`AuthContext`, `LanguageContext`, `CustomThemeProvider`, `SnackbarContext`)
- **Offline**: LocalStorage fallback for user data
- **Concurrency**: Optimistic Concurrency Control (OCC) via versioning
  - **Read**: Returns `version`
  - **Write**: Requires `expectedVersion`, increments on success
  - **Conflict**: Returns `409` with latest data if versions mismatch

---

## Project Structure

```
src/
├── react-app/              # Frontend
│   ├── app/                # Feature modules (Technique, TrainingManager, WordQuest, etc.)
│   ├── components/         # Shared components
│   │   ├── context/        # Context providers (Auth, Theme, Language, Snackbar)
│   │   └── UI/             # Reusable UI components
│   ├── hooks/              # Custom hooks (useTrainingSessions, etc.)
│   ├── App.tsx             # Main app with routes
│   └── main.tsx            # Entry point
├── data/                   # Data layer
│   ├── model/              # TypeScript models (grade, technique, kata, etc.)
│   └── repo/               # Repositories (KyokushinRepository, TrainingSessionRepository)
│       └── catalog.json    # Static curriculum data
└── worker/                 # Backend
    ├── index.ts            # Hono API server
    └── migrations/         # D1 database migrations
```

---

## Key Routes

| Path                 | Component                    | Auth      | Description                                                                                  |
| -------------------- | ---------------------------- | --------- | -------------------------------------------------------------------------------------------- |
| `/`                  | `Home`                       | Public    | Landing page                                                                                 |
| `/technique`         | `TechniquePage`              | Protected | Technique browser with progress                                                              |
| `/training-manager`  | `TrainingManagerPage`        | Protected | Training session management                                                                  |
| `/flashcards`        | `FlashCardPage`              | Protected | Flashcard study system with Practice, Match, Crossword, Flashcards, and Deck management tabs |
| `/WordQuest`         | `WordPlayPage`               | Protected | Language learning game                                                                       |
| `/settings`          | `SettingsPage`               | Protected | User preferences                                                                             |
| `/ten-thousand-days` | `TenThousandDaysTrackerPage` | Protected | Long-term progress                                                                           |
| `/timer`             | `TimerPage`                  | Public    | Training timers                                                                              |
| `/breathing`         | `BreathingTechniquesPage`    | Public    | Breathing exercises                                                                          |

**Protected routes**: Use `ProtectedRoute` wrapper → checks `AuthContext`

**Full route list**: See [`App.tsx`](file:///c:/Users/itkom/source/kyokushin-kai/src/react-app/App.tsx)

---

## Data Layer

### Static Curriculum (KyokushinRepository)

**Source**: [`catalog.json`](file:///c:/Users/itkom/source/kyokushin-kai/src/data/repo/catalog.json)

```typescript
KyokushinRepository.getCurriculumGrades(); // All grades with techniques/katas
KyokushinRepository.getAllTechniques(); // All techniques
KyokushinRepository.getGradeForTechnique(id);
KyokushinRepository.getMedia(id);
```

**No API calls** - instant access, bundle-included

### Dynamic User Data (API Repositories)

**Example**: [`TrainingSessionRepository.ts`](file:///c:/Users/itkom/source/kyokushin-kai/src/data/repo/TrainingSessionRepository.ts)

```typescript
TrainingSessionRepository.fetchSessions(); // GET /api/v1/training-sessions
TrainingSessionRepository.createSession(data); // POST
TrainingSessionRepository.updateSession(id, updates); // PUT
TrainingSessionRepository.deleteSession(id); // DELETE
```

**Pattern**: Repository → API endpoint → D1 database

**Auth**: Uses `Authorization: Bearer <token>` from `AuthContext`

---

## Database

**Tables**: `user_settings`, `user_training_sessions`, `user_technique_progress`, `user_flashcard_decks`, `user_flashcards`, `user_wordquest_decks`, `user_wordquest_cards`, `user_gym_assignments`, `user_gym_equipment`, `refresh_tokens`

**Migrations**: [`src/worker/migrations/*.sql`](file:///c:/Users/itkom/source/kyokushin-kai/src/worker/migrations/)

**Commands**:

```bash
bun run db:create <name>        # Create migration
bun run db:local:migrate        # Apply locally
bun run db:prod:migrate         # Apply to production
```

---

## Development

### Scripts

| Command           | Purpose                                |
| ----------------- | -------------------------------------- |
| `bun run dev:all` | Start frontend (3000) + backend (8787) |
| `bun run dev`     | Frontend only                          |
| `bun run dev:api` | Backend only                           |
| `bun run build`   | Build production                       |
| `bun run deploy`  | Deploy to Cloudflare                   |
| `bun run lint`    | Lint codebase                          |

### Adding a New Feature

**1. Create page**:

```typescript
// src/react-app/app/my-feature/MyFeaturePage.tsx
export default function MyFeaturePage() {
  /* ... */
}
```

**2. Add route** in [`App.tsx`](file:///c:/Users/itkom/source/kyokushin-kai/src/react-app/App.tsx):

```typescript
<Route path="/my-feature" element={<MyFeaturePage />} />
```

**3. Create Database Migration**:

- Run `bun run db:create my_feature_init`
- Define table with `version` column for OCC:

```sql
CREATE TABLE user_my_feature (
  user_id TEXT NOT NULL,
  id TEXT PRIMARY KEY,
  data TEXT,
  updated_at INTEGER,
  version INTEGER DEFAULT 0 -- Required for concurrency control
);
```

**4. Add API endpoint** in [`worker/index.ts`](file:///c:/Users/itkom/source/kyokushin-kai/src/worker/index.ts):

- Use `performOptimisticUpdate` for writes:

```typescript
app.patch('/api/v1/my-feature/:id', async (c) => {
  const user = await requireUser(c);
  // ... parse payload with expectedVersion ...

  const result = await performOptimisticUpdate(
    c.env.DB,
    'user_my_feature',
    user.id,
    id,
    payload.expectedVersion,
    payload.patch,
    ['data'],
  );

  if (!result.ok) return c.json({ error: 'conflict', latest: result.latest }, 409);
  return c.json(result.data);
});
```

**5. Create repository**:

```typescript
// src/data/repo/MyFeatureRepository.ts
export const MyFeatureRepository = {
  async fetch() {
    const token = getAccessToken();
    const res = await fetch('/api/v1/my-feature', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};
```

**6. Create hook**:

```typescript
// src/react-app/hooks/useMyFeature.ts
export function useMyFeature() {
  const [data, setData] = useState([]);
  useEffect(() => {
    MyFeatureRepository.fetch().then(setData);
  }, []);
  return { data };
}
```

### Common Patterns

**Fetch with loading/error**:

```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  Repository.fetch()
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);
```

**LocalStorage fallback**:

```typescript
try {
  const apiData = await Repository.fetch();
  localStorage.setItem('key', JSON.stringify(apiData));
  return apiData;
} catch {
  return JSON.parse(localStorage.getItem('key') || '[]');
}
```

**Multi-language display** (see [`LanguageContext.tsx`](file:///c:/Users/itkom/source/kyokushin-kai/src/react-app/components/context/LanguageContext.tsx)):

```typescript
const { selectedLanguages } = useLanguage();
const name =
  selectedLanguages.map((lang) => technique.names[lang]).find((n) => n) || technique.names.romaji;
```

---

## UI/UX Best Practices

### Design Principles

**Material UI (MUI v6)**: Use MUI components as base - customize via `sx` prop and theme overrides

**Units & Metrics**:

- **Spacing/Margins/Padding**: Use `theme.spacing(n)` (multiplier of 8px) - NEVER hardcode `px`
- **Font Sizes**: Use theme typography variants or `rem` units (scales with user preferences)
- **Component Dimensions**: Prefer `rem` for accessibility, or `%`/`vh`/`vw` for fluid layouts
- **Border/Shadow**: `px` acceptable for small fixed values (1px borders, etc.)

**Typography**:

- Use theme variants: `h1`-`h6` for headings, `body1`/`body2` for text
- Maintain hierarchy: one `h1` per page, logical nesting

**Spacing**: Use theme spacing units (`theme.spacing(n)`) for consistency

**Colors**: Reference theme palette (`primary`, `secondary`, `error`, etc.) - avoid hardcoded values

**Responsive**: Mobile-first approach - use `theme.breakpoints` for adaptive layouts

### Component Standards

**Loading States**: Show `CircularProgress` or skeleton loaders during data fetch

**Error Handling**: Display user-friendly messages via `useSnackbar` (from `SnackbarContext`)

**Empty States**: Provide helpful empty state UI when no data exists

**Accessibility**:

- Add `aria-label` to icon-only buttons
- Ensure keyboard navigation works
- Maintain color contrast ratios (WCAG AA minimum)

**Forms**:

- Use controlled components with validation
- Provide clear error messages
- Disable submit during processing

### Interaction Patterns

**Feedback**: Immediate visual response to user actions (hover, active states, animations)

**Confirmation**: Require confirmation for destructive actions (delete, reset)

**Progress**: Show progress indicators for multi-step processes

**Navigation**: Clear breadcrumbs/back buttons for nested views

### Performance

**Lazy Loading**: Use `React.lazy()` for route-based code splitting

**Memoization**: Apply `useMemo`/`useCallback` for expensive computations

**Virtualization**: Use virtual lists for large datasets (e.g., `react-window`)

---

## Authentication

**Flow**: Google OAuth → Google ID token → Backend verifies → Issues custom JWT + refresh token

**Access Token**: 1 hour lifetime, stored in memory  
**Refresh Token**: 30 days, stored in database (hashed) + localStorage

**API Auth**: All protected endpoints check `Authorization: Bearer <token>` via `requireUser()` middleware

**See**: [`AuthContext.tsx`](file:///c:/Users/itkom/source/kyokushin-kai/src/react-app/components/context/AuthContext.tsx), [`worker/index.ts`](file:///c:/Users/itkom/source/kyokushin-kai/src/worker/index.ts)

---

## Deployment

```bash
# 1. Run production migrations
bun run db:prod:migrate

# 2. Set secrets
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put JWT_SECRET

# 3. Deploy
bun run build
bun run deploy

# 4. Monitor
npx wrangler tail
```

**Config**: [`wrangler.json`](file:///c:/Users/itkom/source/kyokushin-kai/wrangler.json)

---

## Troubleshooting

**Port in use**: Change port in `package.json` or kill process  
**Module not found**: `rm -rf node_modules bun.lock && bun install`  
**Database errors**: Run `bun run db:local:migrate`  
**CORS errors**: Check `origin` in worker CORS middleware  
**Auth fails**: Verify `GOOGLE_CLIENT_ID` in `.dev.vars` and `.env`

**Reset all**:

```bash
rm -rf node_modules dist .wrangler bun.lock
bun install
bun run db:local:migrate
bun run dev:all
```

---

## Key Files Reference

- **Routes**: [`App.tsx`](file:///c:/Users/itkom/source/kyokushin-kai/src/react-app/App.tsx)
- **API Endpoints**: [`worker/index.ts`](file:///c:/Users/itkom/source/kyokushin-kai/src/worker/index.ts)
- **Auth**: [`AuthContext.tsx`](file:///c:/Users/itkom/source/kyokushin-kai/src/react-app/components/context/AuthContext.tsx)
- **Static Data**: [`KyokushinRepository.ts`](file:///c:/Users/itkom/source/kyokushin-kai/src/data/repo/KyokushinRepository.ts)
- **Curriculum**: [`catalog.json`](file:///c:/Users/itkom/source/kyokushin-kai/src/data/repo/catalog.json)
- **Database Migrations**: [`migrations/`](file:///c:/Users/itkom/source/kyokushin-kai/src/worker/migrations/)
- **Config**: [`wrangler.json`](file:///c:/Users/itkom/source/kyokushin-kai/wrangler.json), [`package.json`](file:///c:/Users/itkom/source/kyokushin-kai/package.json)
