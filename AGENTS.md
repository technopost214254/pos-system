# POS System — Agent Reference

## Stack
- **Backend**: Laravel 13.8 (PHP 8.3+)
- **Frontend**: React 18.3 + Inertia.js 2 + TailwindCSS v4
- **Bundler**: Vite 6
- **Auth**: Laravel Breeze + Sanctum (two guards: `web` for admin, `pos` for POS agents)
- **Database**: SQLite (dev) / MySQL (prod)

## Auth & Guards

| Guard | Login Route | Purpose |
|-------|------------|---------|
| `web` | `/login` | Admin/staff management area |
| `pos` | `/pos/login` | POS terminal agents |

All guests are redirected to `/pos/login` by default (see `bootstrap/app.php:redirectGuestsTo`).

- **`pos` guard** checks `is_active` on login (PosLoginController) and via `EnsureUserIsActive` middleware on every request.
- Users with `can_access_pos = true` are "POS agents" — blocked from admin routes by `PreventPosAccess` middleware.
- Users with `can_access_pos = false` (admins) have full access.

## Middleware (applied in order)

| Alias | Class | Purpose |
|-------|-------|---------|
| `auth:pos` | — | Guards all authenticated routes |
| `inertia` | `HandleInertiaRequests` | Shares `auth.user`, `is_admin`, `flash` with Inertia |
| `check.outlet` | `CheckOutletAccess` | Ensures user is authenticated (currently a pass-through) |
| `active.user` | `EnsureUserIsActive` | Logs out disabled accounts |
| `prevent.pos` | `PreventPosAccess` | Redirects POS agents away from admin CRUD routes |
| `role` | `CheckRole` | Checks user has a specific role |
| `permission` | `CheckPermission` | Checks user has a specific permission (skipped for `admin` role) |

## Roles & Permissions
- Custom RBAC: `roles`, `permissions`, `role_user`, `permission_role` tables.
- `User::hasRole($slug)` / `User::hasPermission($slug)` methods.
- Roles and permissions are **user-scoped** (`user_id` on roles/permissions).
- `Gate::define('access-admin', fn($user) => $user->hasRole('admin'))` in AppServiceProvider.

## Outlet Scoping

All data is scoped by `outlet_id`:
- **Admins** (`user.outlet_id = null`) see all data across all outlets.
- **POS agents** (`user.outlet_id` set) only see data matching their outlet.
- Scoping is enforced manually in controllers via `if ($outletId && $model->outlet_id !== $outletId) abort(403)`.

## Route Structure (`routes/web.php`)

```
/                                   → Redirects to /pos/login (or /dashboard if logged in)
/pos/login                          → POS login (GET/POST)
/dashboard                          → Stats overview
/pos                                → POS terminal
/payment                            → Payment confirmation page
/orders/place (POST)                → Dispatches ProcessOrderJob
/customers/*                        → Customer CRUD + search API
/orders/*                           → Order view/manage (no create/store/edit)
/orders/{id}/invoice                → Printable invoice
/offers/available/list              → Active offers API

# Admin-only (behind prevent.pos middleware):
/products/*                         → Product CRUD (no show)
/users/*                            → User CRUD (no show) + toggle active
/outlets/*                          → Outlet CRUD (no show)
/offers/*                           → Offer CRUD (no show)
/categories/*                       → Category CRUD (no show)
```

## Cart System (AJAX/JSON API)

Cart endpoints return JSON, NOT Inertia responses:
- `GET  /cart`                → List cart items
- `POST /cart/items`          → Add item (product_id, qty)
- `PUT  /cart/items/{item}`   → Update qty
- `DELETE /cart/items/{item}` → Remove item
- `DELETE /cart/clear`        → Clear cart

Each user has one cart per outlet. Cart items calculate `subtotal = qty * unit_price`.

## Order Flow

1. **POS Terminal** (`Pos/Index.jsx`) — Products grid + cart sidebar.
2. **Customer selection/inline creation** via `CustomerSelect` component + `/customers` JSON API.
3. **Offer selection** — Discounts calculated client-side (fixed, percentage).
4. **Proceed to Payment** — Data stored in `sessionStorage`, redirects to `/payment`.
5. **Payment page** (`Payment/Index.jsx`) — Review order, confirm.
6. **Order placement** (`POST /orders/place`) — Dispatches `ProcessOrderJob` to queue.
7. **ProcessOrderJob** — Creates order + order items, decrements stock in a DB transaction.

### Order statuses
- `pending` → default on creation
- `completed` / `cancelled` — updated manually via order show page

## Key Models & Relationships

- **User**: `belongsTo(Outlet)`, `belongsToMany(Role)`, has `can_access_pos`, `is_active`, `outlet_id`
- **Product**: `belongsTo(Outlet)`, `belongsTo(Category)`, fields: name, sku, price, stock, description, image, category_id
- **Customer**: `belongsTo(Outlet)`, `hasMany(Order)`, fields: name, phone, email, address
- **Order**: `belongsTo(User)`, `belongsTo(Outlet)`, `belongsTo(Customer)`, `belongsTo(Offer)`, `hasMany(OrderItem)`, fields: status, payment_method, payment_status, total_amount, discount_amount
- **OrderItem**: `belongsTo(Order)`, `belongsTo(Product)`, fields: quantity, unit_price, subtotal
- **Cart**: `belongsTo(User)`, `belongsTo(Outlet)`, `hasMany(CartItem)`
- **CartItem**: `belongsTo(Cart)`, fields: product_id, quantity, unit_price, subtotal
- **Offer**: `belongsTo(Outlet)`, `belongsTo(Product)` (optional), types: fixed, percentage
- **Role**: `belongsToMany(User)`, `belongsToMany(Permission)`, user-scoped (`user_id`)
- **Permission**: `belongsToMany(Role)`, user-scoped (`user_id`)
- **Category**: `belongsTo(User)`, `hasMany(Product)`, user-scoped (`user_id`), fields: name, slug, description
- **Outlet**: `hasMany(User)`, `hasMany(Product)`, `hasMany(Customer)`, `hasMany(Order)`

## Shared UI Components

| Component | Location | Props |
|-----------|----------|-------|
| `AppLayout` | `Layouts/AppLayout.jsx` | Sidebar nav (admin vs agent), top header, flash messages |
| `DataTable` | `Components/DataTable.jsx` | `columns`, `data`, `actions`, `links` (pagination) |
| `PageHeader` | `Components/PageHeader.jsx` | `title`, `description`, `actionLabel`, `actionHref` |
| `Card` | `Components/Card.jsx` | `title`, `footer`, `className` |
| `FormField` | `Components/FormField.jsx` | `label`, `error`, `type`, wraps TextInput |
| `Modal` | `Components/Modal.jsx` | `show`, `maxWidth`, `onClose`, wraps HeadlessUI Dialog |
| `Badge` | `Components/Badge.jsx` | `variant` (blue/green/red/yellow/purple/gray/teal), `size` |
| `CustomerSelect` | `Components/CustomerSelect.jsx` | Search + inline create, uses `/customers` JSON API |
| `DashboardCard` | `Components/DashboardCard.jsx` | `href`, `icon`, `title`, `description`, `color` |
| `Dropdown` | `Components/Dropdown.jsx` | Compound: `.Trigger`, `.Content`, `.Link` |

## POS Terminal (`Pos/Index.jsx`)

- Full-screen mode supported via the Fullscreen API (`requestFullscreen` / `exitFullscreen`).
- When fullscreen, the component renders in a `fixed inset-0 z-[9999]` wrapper that overlays the entire app (including sidebar).
- When not fullscreen, it renders inside `AppLayout` using negative margins to fill the content area (`h-[calc(100vh-100px)] -mx-8 -mb-8`).
- Real-time clock updates every 30 seconds.
- Product search filters by name and SKU.
- **Category filter**: Row of pill buttons (All, plus each category) above the product grid. Products are filtered client-side by `category_id`. Categories are passed via Inertia from `PosController`.
- Cart syncs with the server (AJAX) but also uses `sessionStorage` for persistence between POS → Payment flow.

## Frontend Patterns

- All admin/POS pages use `AppLayout`; profile pages use `AuthenticatedLayout`.
- Forms use `@inertiajs/react` `useForm` hook with `post`/`put`/`delete`.
- `router` from `@inertiajs/react` used for imperative navigation.
- Session storage (`pos_cart`, `pos_customer`, `pos_offer`, `pos_offer_data`) used to persist cart/customer between POS → Payment flow.
- **Auto-apply offers**: When an offer has a `product_id` and that product is in the cart, the offer is automatically selected (no manual dropdown needed). Auto-applied offers are tracked via `autoAppliedOffer` state flag. If the user manually changes the offer, `autoAppliedOffer` is set to `false` and the auto-apply effect stops overriding. If the triggering product is removed from cart, the auto-applied offer is cleared.
- `is_admin` flag from `auth` prop (set in `HandleInertiaRequests`) controls admin vs agent UI.

### Delete Pattern (consistent across all index pages)

All delete buttons use a **two-step confirmation** pattern — never `confirm()` dialogs:

```jsx
const [confirmDelete, setConfirmDelete] = useState(null);

const handleDelete = (id) => {
    if (confirmDelete === id) {
        router.delete(`/resource/${id}`);
        setConfirmDelete(null);
    } else {
        setConfirmDelete(id);
    }
};

// In actions JSX:
<button
    onClick={() => handleDelete(row.id)}
    className={`font-medium text-sm transition-colors ${
        confirmDelete === row.id
            ? 'bg-red-600 text-white px-2 py-1 rounded'
            : 'text-red-600 hover:text-red-800'
    }`}
>
    {confirmDelete === row.id ? 'Confirm' : 'Delete'}
</button>
```

- Actions wrapper is always `<div className="space-x-3 flex justify-end">`
- This pattern is used in: Customers, Products, Orders, Offers, Users, Outlets, Roles, Permissions, Categories
- **Always use this pattern** — never `window.confirm()` or inline delete without confirmation

## Offer Types

| Type | Calculation |
|------|-------------|
| `fixed` | Flat amount off (capped at subtotal) |
| `percentage` | `subtotal * value / 100` |

## Queue
- Orders processed via `ProcessOrderJob` (implements `ShouldQueue`).
- Needs `php artisan queue:listen` running (included in `composer dev`).

## Dev Commands

| Command | Description |
|---------|-------------|
| `composer dev` | Full dev stack (server + queue + logs + Vite) |
| `npm run dev` | Vite dev server only |
| `composer test` | PHPUnit tests |
| `npm run build` | Production frontend build |

## ⚠️ Agent Instructions — Required Updates

Whenever you implement a new feature, fix a bug, or make any significant change to this codebase, you **MUST** update this AGENTS.md file with:
- New routes, new pages, or new components added
- Changes to middleware, guards, or auth flow
- New relationships or model changes
- New environment variables or config changes
- New console commands or dev scripts
- Any new patterns or conventions introduced

This file is the source of truth for all AI agents working on this project. Keep it accurate and up to date.

## Exception Handling (`bootstrap/app.php`)

JSON is returned for API/fetch requests only:
- `api/*`, `customers/*`, `cart/*`, `offers/*` paths
- Requests with `Accept: application/json` but WITHOUT `X-Inertia` header
- Inertia visits always get redirect responses with errors in session flash
