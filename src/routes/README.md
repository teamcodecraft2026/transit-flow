# Routes

TanStack Start uses **file-based routing**. Every `.tsx` file in this directory
defines a route. Do **not** create `src/pages/`, `src/routes/_app/index.tsx`, or
`app/layout.tsx` — those are Next.js / Remix conventions. The only root layout
is `src/routes/__root.tsx`.

## Conventions

| File                     | URL                                                     |
| ------------------------ | ------------------------------------------------------- |
| `index.tsx`              | `/`                                                     |
| `about.tsx`              | `/about`                                                |
| `users/index.tsx`        | `/users`                                                |
| `users/$id.tsx`          | `/users/:id` (dynamic — bare `$`, no curly braces)      |
| `posts/{-$category}.tsx` | `/posts/:category?` (optional segment)                  |
| `files/$.tsx`            | `/files/*` (splat — read via `_splat` param, never `*`) |
| `_layout.tsx`            | layout route (renders children via `<Outlet />`)        |
| `__root.tsx`             | app shell — wraps every page; preserve `<Outlet />`     |

`routeTree.gen.ts` is auto-generated. Don't edit it by hand.

## Application Routes

| File                  | URL                | Role                                         |
| --------------------- | ------------------ | -------------------------------------------- |
| `home.tsx`            | `/home`            | Passenger — landing page                     |
| `book.tsx`            | `/book`            | Passenger — search routes and book tickets   |
| `trips.tsx`           | `/trips`           | Passenger — view upcoming and past tickets   |
| `pink-card.tsx`       | `/pink-card`       | Passenger — Pink Card info and status check  |
| `pink-card-apply.tsx` | `/pink-card-apply` | Passenger — 4-step eligibility application   |
| `conductor.tsx`       | `/conductor`       | Conductor — QR scanner and ticket validation |
| `service-portal.tsx`  | `/service-portal`  | Officer — Pink Card application review       |
| `admin.tsx`           | `/admin`           | Admin — revenue analytics dashboard          |
