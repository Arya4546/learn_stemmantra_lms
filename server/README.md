# Stem Mantra LMS — Backend

Production-grade Learning Management System backend for **Stem Mantra**, an ed-tech company. Built with Node.js, TypeScript, Express 5, Prisma, and PostgreSQL.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials and secrets

# 3. Generate Prisma client
npx prisma generate

# 4. Push schema to database (create the DB first: CREATE DATABASE stemmantra_lms;)
npx prisma db push

# 5. Start development server
npm run dev
```

The server will:
- Connect to PostgreSQL
- Seed a default admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` (skips if admin already exists)
- Start listening on the configured `PORT` (default: 3000)
- Schedule periodic cleanup of expired content access tokens (every 30 minutes)

---

## Architecture

### Project Structure

```
src/
├── server.ts                    # Entry: DB connect, seed admin, start Express, graceful shutdown
├── app.ts                       # Express app factory: middleware stack → routes → error handling
├── config/
│   ├── env.ts                   # Zod-validated env parsing (crashes on invalid config)
│   ├── logger.ts                # Winston: colored dev output, JSON prod output, file transports
│   ├── cors.ts                  # Strict origin whitelist from CORS_ORIGIN env var
│   └── rate-limit.ts            # Rate limit presets: global, auth, upload, content-serve
├── database/
│   └── prisma.ts                # Singleton PrismaClient with event logging
├── shared/
│   ├── types/
│   │   ├── express.d.ts         # Augments Express.Request with typed user payload
│   │   └── api-response.ts      # Standard response shape + pagination meta
│   ├── errors/
│   │   └── app-error.ts         # Custom error class with static factories (badRequest, notFound, etc.)
│   ├── middleware/
│   │   ├── authenticate.ts      # JWT Bearer verification → req.user
│   │   ├── authorize.ts         # Role-based access: authorize(Role.ADMIN)
│   │   ├── validate.ts          # Zod schema validation for body/params/query
│   │   ├── error-handler.ts     # Global error handler (AppError-aware, hides stack in prod)
│   │   ├── not-found.ts         # 404 catch-all
│   │   └── request-logger.ts    # HTTP request logging (method, path, status, duration, IP)
│   └── utils/
│       ├── response.ts          # sendSuccess / sendPaginated helpers
│       ├── async-handler.ts     # Wraps async routes → no try/catch boilerplate
│       ├── token.ts             # JWT sign/verify for access + refresh tokens
│       ├── hash.ts              # bcrypt password hashing
│       ├── file-cleanup.ts      # File/directory removal, move, ensure-dir utilities
│       └── content-token.ts     # Single-use expiring content access tokens (DB-backed)
└── modules/
    ├── auth/                    # Login, refresh, logout
    ├── users/                   # Student account CRUD (admin-only)
    ├── courses/                 # Course CRUD with auto-slug
    ├── sections/                # Section CRUD + reordering within courses
    ├── content/                 # File upload, content serving, streaming, access tokens
    └── enrollments/             # Student ↔ Course enrollment management
```

Each module follows the pattern: `*.routes.ts` → `*.controller.ts` → `*.service.ts` + `*.validators.ts`

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Express 5** | Native async error handling, improved routing |
| **Zod over class-validator** | Better TypeScript inference, composable schemas, no decorators |
| **Content tokens in DB (not Redis)** | Zero infra overhead for local dev. Single-file swap to Redis later (`content-token.ts`) |
| **File-then-DB pattern** | Upload to temp → DB write → move to final path. Failure at any stage cleans up |
| **BigInt for file sizes** | Videos can exceed 2GB; `number` would overflow |
| **UUID primary keys** | No sequential ID enumeration attacks |
| **Soft-delete for users** | `isActive: false` preserves audit trail and enrollment history |
| **Slug for courses** | SEO-friendly URLs, auto-generated with uniqueness guarantee |

---

## Authentication & Authorization

### Flow

1. **Login** → `POST /api/auth/login` with email + password → returns `accessToken` (15min) + `refreshToken` (7d)
2. **Authenticated requests** → `Authorization: Bearer <accessToken>` header
3. **Refresh** → `POST /api/auth/refresh` with `refreshToken` in body → new token pair (old refresh token revoked)
4. **Logout** → `POST /api/auth/logout` → revokes refresh token

### Roles

| Role | Permissions |
|------|-------------|
| `ADMIN` | Everything: user management, course/content CRUD, enrollments |
| `STUDENT` | View enrolled courses, sections, content metadata. Request content access tokens. Stream/view content |

No public signup. Admin creates student accounts via `POST /api/users`.

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Login with email + password |
| POST | `/api/auth/refresh` | — | Refresh token pair |
| POST | `/api/auth/logout` | JWT | Revoke refresh token |

### Users (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create student account |
| GET | `/api/users` | List students (paginated: `?page=1&limit=20`) |
| GET | `/api/users/:id` | Get student with enrollments |
| PATCH | `/api/users/:id` | Update student |
| DELETE | `/api/users/:id` | Deactivate student (soft-delete) |

### Courses
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/courses` | Admin | Create course |
| GET | `/api/courses` | JWT | List courses (admin: all, student: enrolled only) |
| GET | `/api/courses/:id` | JWT | Course detail with sections + content |
| PATCH | `/api/courses/:id` | Admin | Update course |
| DELETE | `/api/courses/:id` | Admin | Delete course + all content files |

### Sections
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/courses/:courseId/sections` | Admin | Create section |
| GET | `/api/courses/:courseId/sections` | JWT | List sections |
| PATCH | `/api/courses/:courseId/sections/:id` | Admin | Update section |
| DELETE | `/api/courses/:courseId/sections/:id` | Admin | Delete section + files |
| PATCH | `/api/courses/:courseId/sections/reorder` | Admin | Reorder sections |

### Content
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/sections/:sectionId/content` | Admin | Upload file (multipart, field: `file`) |
| GET | `/api/sections/:sectionId/content` | JWT | List content items |
| DELETE | `/api/content/:id` | Admin | Delete content + file |
| POST | `/api/content/:id/access-token` | JWT (enrolled) | Generate one-time content access token |
| GET | `/api/content/serve/:token` | Token | Serve content inline (streaming for video) |

### Enrollments (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/enrollments` | Enroll student in course |
| DELETE | `/api/enrollments` | Unenroll student |
| GET | `/api/enrollments/course/:courseId` | List enrolled students |
| GET | `/api/enrollments/user/:userId` | List student's courses |

### Response Shape

Every response follows:
```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { ... },
  "meta": { "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 } }
}
```

---

## Content Protection

Content (videos, PDFs, images) is never served through direct file URLs. The protection flow:

1. **Student requests a content access token** → `POST /api/content/:id/access-token`
   - Server verifies JWT auth + course enrollment
   - Creates a single-use, 5-minute token in the DB
   - Returns the token string

2. **Student uses the token to access content** → `GET /api/content/serve/:token`
   - Server validates: token exists, not used, not expired
   - Marks token as used (single-use)
   - Logs access (userId, contentItemId, IP, userAgent, timestamp)
   - Validates `Referer` header against allowed origins (blocks hotlinking)
   - Serves file with anti-download headers:
     - `Content-Disposition: inline` (never `attachment`)
     - `X-Content-Type-Options: nosniff`
     - `Cache-Control: no-store, no-cache, must-revalidate, private`
     - `X-Frame-Options: SAMEORIGIN`
     - `Content-Security-Policy: default-src 'none'`
     - `X-Download-Options: noopen`
   - Videos: HTTP 206 range-request streaming
   - PDFs/Images: inline serving

### Supported File Types
| Type | MIME Types |
|------|-----------|
| Video | `video/mp4`, `video/webm`, `video/ogg`, `video/quicktime` |
| PDF | `application/pdf` |
| Image | `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml` |

---

## File Storage

```
uploads/
├── temp/                                    # Staging area (multer writes here first)
└── courses/
    └── {courseId}/
        └── {sectionId}/
            ├── videos/{contentItemId}.mp4
            ├── pdfs/{contentItemId}.pdf
            └── images/{contentItemId}.png
```

- Filenames are UUIDs (content item IDs), never user-supplied names
- Original filename stored in DB (`originalName` field), never in the filesystem
- `uploads/` is git-ignored

---

## Transaction Safety

| Operation | Strategy |
|-----------|----------|
| **Content upload** | File → temp/ → DB create → move to final path. If DB fails: delete temp file. If move fails: delete DB record + temp file |
| **Course/section delete** | DB cascade delete first (source of truth) → then delete file directory. File deletion failure is logged but doesn't fail the operation |
| **Section reorder** | Batch `$transaction` — all sort orders updated atomically |
| **Token refresh** | Old token revoked → new pair issued. If new creation fails, old token stays revoked (safe side) |

---

## Security

| Layer | Implementation |
|-------|---------------|
| **Headers** | Helmet (default security headers) |
| **CORS** | Strict origin whitelist from `CORS_ORIGIN` env var |
| **Rate limiting** | Per-route: auth (15/15min), uploads (30/15min), content serve (60/min), global (200/15min) |
| **Input validation** | Zod schemas on every route (body, params, query) |
| **Auth** | JWT with access/refresh token rotation |
| **Authorization** | Role-based middleware |
| **SQL injection** | Prisma parameterized queries + Zod input validation |
| **Content protection** | Single-use expiring tokens, referer validation, anti-download headers |
| **Error handling** | No stack traces in production, consistent error shape |
| **Logging** | Winston: all requests, errors, content access, file operations |

---

## Environment Variables

See `.env.example` for the full list with descriptions. Key variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | ✅ | Access token signing key (min 32 chars) |
| `JWT_REFRESH_SECRET` | ✅ | Refresh token signing key (min 32 chars) |
| `ADMIN_EMAIL` | ✅ | Default admin email (seeded on startup) |
| `ADMIN_PASSWORD` | ✅ | Default admin password (min 8 chars) |
| `CORS_ORIGIN` | ✅ | Allowed frontend origin(s), comma-separated |
| `MAX_FILE_SIZE` | — | Upload size limit in bytes (default: 500MB) |

---

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run typecheck` | Run `tsc --noEmit` — zero errors expected |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:push` | Push schema to DB (dev) |
| `npm run db:migrate` | Create and run migration (production) |
| `npm run db:studio` | Open Prisma Studio GUI |

---

## Extending the System

### Adding a new role
1. Add to `Role` enum in `prisma/schema.prisma`
2. Run `npx prisma db push` + `npx prisma generate`
3. Update `authorize()` calls in route files where the new role should have access

### Adding a new content type
1. Add to `ContentType` enum in schema
2. Add MIME type mapping in `src/modules/content/content.service.ts` → `MIME_TYPE_MAP`
3. Add directory mapping in `CONTENT_TYPE_DIRS`
4. Add to `ALLOWED_MIMES` in `content.routes.ts`

### Adding a new module
1. Create `src/modules/{name}/` with the 4-file pattern: `*.routes.ts`, `*.controller.ts`, `*.service.ts`, `*.validators.ts`
2. Register routes in `src/app.ts`
3. Add Prisma models if needed, regenerate client

### Switching to Redis for content tokens
1. Install `ioredis`
2. Replace DB calls in `src/shared/utils/content-token.ts` with Redis SET/GET/DEL
3. Remove `ContentAccessToken` model from schema (or keep for audit)
4. No other files change

### Adding PDF watermarking
1. Install `pdf-lib`
2. In `content.streaming.ts` → `serveInline()`, intercept PDF serving
3. Load PDF with `pdf-lib`, overlay user info (email, timestamp) on each page
4. Pipe modified buffer instead of file stream

---

## Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | 18+ |
| Language | TypeScript | 5.x (strict mode) |
| Framework | Express | 5.x |
| ORM | Prisma | 6.x |
| Database | PostgreSQL | 16+ |
| Auth | jsonwebtoken | 9.x |
| Validation | Zod | 3.x |
| Logging | Winston | 3.x |
| File upload | Multer | 2.x |
| Security | Helmet, CORS, express-rate-limit | Latest |


test