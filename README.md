# Art Wall Designer

[![Frontend Deployed on Render](https://img.shields.io/badge/Frontend-Deployed-blue)](https://artwalldesigner.onrender.com/)

A web application that allows users to upload a photo of their wall and visualize artworks from a curated collection. Supports drag‑and‑drop placement on the wall, resizing artworks, shopping cart integration, and role‑based admin/seller/customer functionality.

---

## 🚀 Live Demo

* Frontend: [https://artwalldesigner.onrender.com/](https://artwalldesigner.onrender.com/)

---

## 🛠️ Tech Stack

* **Frontend:** React, TypeScript, Tailwind CSS, React Konva, React Router
* **Authentication:** JWT, Google OAuth 2.0, role‑based access control (admin, seller, customer)
* **Backend:** Node.js, Express.js, MongoDB (Atlas), Mongoose
* **Storage:** Multer for image uploads
* **Deployment:** Render (frontend & backend)

---

## ✨ Features

### Designer (Customer)

* Upload a photo of your wall
* Browse art collection, drag & drop onto wall
* Resize, rotate, and frame previews
* Save layout locally & sync with shopping cart
* Checkout & order history
* **Login / Signup with Google OAuth**

### Seller Dashboard

* Create, read, update, delete (CRUD) your own products
* Manage artwork sizes, orientations, pricing
* View orders containing your products

### Admin Dashboard

* Manage all users, products, and orders
* Role‑based access control

---

## ⚙️ Local Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/Kalebtes2031/art-wall-designer.git
   cd art-wall-designer
   ```

2. **Backend**

   ```bash
   cd backend
   npm install
   # Set MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, PORT
   npm run dev
   ```

3. **Frontend**

   ```bash
   cd ../frontend
   npm install
   # Set VITE_API_BASE_URL, VITE_GOOGLE_CLIENT_ID
   npm run dev
   ```

4. **Access**

   * Frontend: [http://localhost:5173](http://localhost:5173)
   * Backend API: [http://localhost:5000/api](http://localhost:5000/api)

---

## 📂 Environment Variables

* **Backend .env**

  ```ini
  MONGODB_URI=your_mongodb_atlas_connection_string
  JWT_SECRET=your_jwt_secret
  GOOGLE_CLIENT_ID=your_google_oauth_client_id
  GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
  PORT=5000
  ```

* **Frontend .env.local**

  ```ini
  VITE_API_BASE_URL=http://localhost:5000/api
  VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
  ```

---

## 📝 API Reference

### Auth

* `POST /auth/signup` (email/password)
* `POST /auth/login` (email/password)
* `GET  /auth/users` (admin only)
* **`GET  /auth/google`** — Redirect to Google OAuth consent screen
* **`GET  /auth/google/callback`** — OAuth callback endpoint

### Products

* `GET    /products` (with filters, search, pagination)
* `GET    /products/:id`
* `POST   /products` (seller or admin)
* `PATCH  /products/:id` (seller owns or admin)
* `DELETE /products/:id` (seller owns or admin)

### Cart (customer only)

* `GET    /cart`
* `POST   /cart/items`
* `PATCH  /cart/items/:itemId/size`
* `PATCH  /cart/items/:itemId/quantity`
* `DELETE /cart/items/:itemId`

### Orders

* `POST   /orders` (create)
* `POST   /orders/:id/pay`
* `GET    /orders` (role‑aware)
* `PATCH  /orders/:id` (admin or seller)

---

## 🛡️ Security & Best Practices

* Passwords hashed with bcrypt
* JWT tokens with 1‑day expiry
* **Google OAuth** for secure social login
* Role‑based middleware for protected routes
* Input validation and error handling

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/foo`)
3. Commit your changes (`git commit -am 'feat: add foo'`)
4. Push to the branch (`git push origin feature/foo`)
5. Open a pull request

---
