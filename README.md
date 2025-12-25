# Bookarry Server

Bookarry Server is the backend API for the Bookarry book marketplace/library. It powers book catalog browsing, wishlist management, order creation, and Stripe payments with role-based access for admins and librarians.

Live API: [https://bookarry-server.vercel.app/]([https://bookarry-server.vercel.app/]())

## Features

- Books catalog with latest, list, detail, create, publish status, and delete endpoints.
- Role-based access control for admins and librarians.
- Order management with cancellation flow.
- Stripe checkout and payment confirmation.
- Wishlist support per authenticated user.
- Firebase Admin token verification for protected routes.

## Tech Stack

- Node.js + Express
- MongoDB (native driver)
- Firebase Admin SDK (auth)
- Stripe (payments)

## API Base URL

- Local: `http://localhost:5000`
- Production: `https://bookarry-server.vercel.app/`

## Authentication

Protected endpoints require a Firebase ID token:

```
Authorization: Bearer <firebase_id_token>
```

The server extracts the user email from the token and uses it for authorization checks.

## Roles

- `admin`: full access to users and books management.
- `librarian`: can create books and update book status.
- `user`: standard access for orders and wishlist.

## Endpoints

All routes are prefixed with `/api/v1`.

So the all the API route will be like: `https://bookarry-server.vercel.app/api/v1`

### Books

- `GET /books/latest` - latest 8 books.
- `GET /books` - all books.
- `GET /books/:id` - book details.
- `POST /books` - add a book (admin or librarian).
- `PATCH /books/:id/status` - update publish status (admin or librarian).
- `DELETE /books/:id` - remove a book (admin only).

### Orders

- `GET /orders?email=user@example.com` - get orders for the logged-in user.
- `GET /orders/all` - get all orders (token required).
- `POST /orders` - create an order (token required).
- `PUT /orders/:orderId/cancel` - cancel an order.

### Payments

- `GET /payments?email=user@example.com` - list payments for a user.
- `POST /payments/create-checkout-session` - Stripe checkout session.
- `PATCH /payments/confirm-payments?session_id=...` - confirm payment and update order.
- `GET /payments/invoices?email=user@example.com` - payment invoices.

### Users

- `POST /users/register` - register a user.
- `GET /users` - list all users (admin only).
- `GET /users/role?email=user@example.com` - get user role.
- `PATCH /users/:id/role` - update user role (admin only).

### Wishlist

- `GET /wishlist?email=user@example.com` - list wishlist (token required).
- `POST /wishlist/:bookId/add` - add book to wishlist.

## Environment Variables

Create a `.env` file in the project root:

```
PORT=5000
MONGO_USER=your_mongo_user
MONGO_PASSWORD=your_mongo_password
MONGO_DB_NAME=bookarrydb
STRIPE_SECRET_KEY=your_stripe_secret
PAYMENT_DOMAIN=http://localhost:5173
```

Firebase Admin also requires a service account JSON file at:

```
bookarry-service-key.json
```

## Run Locally

```
npm install
npm run dev
```

The server will start at `http://localhost:3000`.

## Health Check

```
GET /
```

Returns:

```
{ "status": "ok", "message": "Bookarry API is running" }
```
