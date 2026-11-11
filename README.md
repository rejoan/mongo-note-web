# Mongo Note — Web Client

React + Vite client for the [Mongo Note API](../mongo-note). It covers the full task: authentication, note CRUD, the public posts feed, per-user posts, admin user management, the admin all-notes view, and the grouped-by-interests report.

## Requirements

- **Node.js 20.19+**, 22.12+ or 24.x (Vite 8 requirement; developed on Node 24)
- npm 10+
- A running Mongo Note API (see the backend README)

## Setup

```bash
npm install

# optional: point at a different API
cp .env.example .env
```

`.env`:

```dotenv
VITE_API_URL=https://mongo-note.test/api
```

If `VITE_API_URL` is omitted, the client defaults to `https://mongo-note.test/api`. For `php artisan serve`, use:

```dotenv
VITE_API_URL=http://127.0.0.1:8000/api
```

Make sure the API's `CORS_ALLOWED_ORIGINS` includes this app's origin (default dev origin: `http://localhost:5173`).

## Run

```bash
npm run dev
```

Vite prints the local URL (normally `http://localhost:5173`).

## Build

```bash
npm run build     # outputs dist/
npm run preview   # serves the production build locally
```

`dist/` is a static SPA. Serve it from any static host, and configure a **history-API fallback** so unknown paths return `index.html`. If the app is mounted under a sub-path, set Vite's `base` option; the router already uses `import.meta.env.BASE_URL` as its `basename`.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `Password123!` |
| User | `user@example.com` | `Password123!` |

Registering from the UI always creates a standard **user**; admin accounts are created through the admin UI or the seeder.

## Features

### Everyone

- Register and log in with email + password.
- JWT is stored in `localStorage` and attached as `Authorization: Bearer …`; logging out clears it.
- Protected routes redirect to `/login` when there is no session.
- **My notes** — create, edit and delete your own notes, with pagination.
- **Posts** — public feed of everyone's posts, newest first, with pagination; authenticated users can publish a post, and authors can delete their own.
- Clicking an author opens **that user's posts** (Scenario 2, `$lookup`).

### Admins

- Everything above.
- **Users** — create, edit and delete users, set roles and interests, paginated list.
- **All notes** — read every note and filter the list by author; editing and deleting stay owner-only.
- **Interests** — users grouped by interest (Scenario 1, single aggregation), paginated.

Notes are private: a standard user only ever sees their own. The UI hides admin navigation and admin routes from non-admins, and the API enforces the same rules independently.

## Routes

| Path | Access | Page |
|---|---|---|
| `/login` | public | Login |
| `/register` | public | Registration |
| `/notes` | authenticated | My notes (CRUD) |
| `/posts` | authenticated | Public posts feed + create/delete |
| `/users/:id/posts` | public (UI requires login) | Posts by one user |
| `/admin/users` | admin | User management |
| `/admin/notes` | admin | All notes + author filter |
| `/admin/interests` | admin | Users grouped by interest |

## Project structure

```text
src/
  api.js                  # fetch wrapper, API_URL, ApiError
  auth.jsx                # AuthProvider/useAuth, localStorage session
  App.jsx                 # routes, protected + admin route guards
  format.js               # date formatting helpers
  index.css               # layout, forms, cards, responsive rules
  components/
    Layout.jsx            # top bar, navigation, account menu
    Pagination.jsx        # shared previous/next pagination
    Ui.jsx                # small shared UI primitives
  pages/
    LoginPage.jsx
    RegisterPage.jsx
    NotesPage.jsx
    PostsPage.jsx
    UserPostsPage.jsx
    AdminUsersPage.jsx
    AdminNotesPage.jsx
    InterestsPage.jsx
```

## API contract used

- `POST /auth/login`, `POST /auth/register` → `{ user, access_token, token_type, expires_in }`
- `GET /auth/me`, `POST /auth/logout`
- `GET|POST /notes`, `GET|PUT|PATCH|DELETE /notes/{id}` (`?page`, `?per_page`, admin `?user_id`)
- `GET|POST /posts`, `DELETE /posts/{id}`, `GET /users/{id}/posts`
- `GET|POST /users`, `GET|PUT|PATCH|DELETE /users/{id}` (admin)
- `GET /users/grouped-by-interests` (admin)

Paginated responses use `{ data, meta: { current_page, last_page, per_page, total, from, to } }`. Validation errors arrive as `422` with `{ message, errors }`; the UI surfaces the first error.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run Oxlint |
