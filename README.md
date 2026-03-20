# 🥦 Smart Sabji — Online Vegetable Delivery System

A full-stack, production-ready eCommerce application built with the **MERN stack** (MongoDB, Express.js, React, Node.js).

---

## 📁 Project Structure

```
smart-sabji/
├── backend/                   # Express + MongoDB API
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Register, Login, Profile
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   └── adminController.js # Dashboard, Order mgmt, Users
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT protect + admin guard
│   │   └── errorMiddleware.js # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── adminRoutes.js
│   │   └── uploadRoutes.js
│   ├── utils/
│   │   ├── helpers.js         # generateToken, successResponse
│   │   └── seeder.js          # Seed DB with sample data
│   ├── uploads/               # Local image fallback
│   ├── .env.example
│   ├── package.json
│   └── server.js              # Entry point
│
└── frontend/                  # React + Vite + Tailwind CSS
    ├── src/
    │   ├── app/
    │   │   └── store.js       # Redux store
    │   ├── components/
    │   │   ├── admin/
    │   │   │   └── AdminLayout.jsx
    │   │   ├── common/
    │   │   │   ├── index.jsx  # Spinner, EmptyState, Badge, Pagination, Modal
    │   │   │   └── ProductCard.jsx
    │   │   └── layout/
    │   │       ├── Navbar.jsx
    │   │       └── Footer.jsx
    │   ├── features/
    │   │   ├── auth/authSlice.js
    │   │   ├── cart/cartSlice.js
    │   │   ├── products/productSlice.js
    │   │   └── orders/orderSlice.js
    │   ├── pages/
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── AdminProducts.jsx
    │   │   │   ├── AdminOrders.jsx
    │   │   │   └── AdminUsers.jsx
    │   │   ├── HomePage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── ProductsPage.jsx
    │   │   ├── ProductDetailPage.jsx
    │   │   ├── CartPage.jsx
    │   │   ├── CheckoutPage.jsx
    │   │   ├── OrderSuccessPage.jsx
    │   │   ├── OrdersPage.jsx
    │   │   ├── OrderDetailPage.jsx
    │   │   └── ProfilePage.jsx
    │   ├── utils/
    │   │   └── api.js         # Axios instance with JWT interceptor
    │   ├── App.jsx            # Routes + Guards
    │   ├── main.jsx
    │   └── index.css          # Tailwind + custom utilities
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## ⚙️ Setup Instructions

### Prerequisites
- **Node.js** v18+
- **MongoDB** (Atlas or local)
- **npm** or **yarn**

---

### 1. Clone & Install

```bash
# Clone the repo
git clone <your-repo-url>
cd smart-sabji

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 2. Configure Environment Variables

#### Backend — `backend/.env`
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/smart-sabji
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Optional: Cloudinary for image uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@smartsabji.com
ADMIN_PASSWORD=Admin@123
```

#### Frontend — `frontend/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

### 3. Seed the Database

```bash
cd backend
node utils/seeder.js
```

This creates:
- ✅ Admin account: `admin@smartsabji.com` / `Admin@123`
- ✅ Test user: `user@smartsabji.com` / `User@123`
- ✅ 12 sample vegetable products

---

### 4. Create Uploads Directory

```bash
cd backend
mkdir -p uploads
```

---

### 5. Run the Application

#### Option A: Run separately (recommended for development)

```bash
# Terminal 1 — Backend
cd backend
npm run dev      # starts on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev      # starts on http://localhost:5173
```

#### Option B: Run concurrently (install concurrently at root)
```bash
npm install -g concurrently
concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

---

## 📡 API Routes Documentation

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login & get JWT |
| GET | `/api/auth/me` | Private | Get current user |
| PUT | `/api/auth/profile` | Private | Update profile |

### Products
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/products` | Public | Get all products (with filters, pagination) |
| GET | `/api/products/featured` | Public | Get featured products |
| GET | `/api/products/categories` | Public | Get all categories |
| GET | `/api/products/:id` | Public | Get single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |

**Query Params for GET /api/products:**
- `page` (default: 1)
- `limit` (default: 12)
- `search` — text search
- `category` — filter by category
- `minPrice`, `maxPrice` — price range
- `sort` — field to sort by (default: `createdAt`)
- `order` — `asc` or `desc`
- `featured=true` — only featured
- `available=true` — only available

### Cart
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/cart` | Private | Get user's cart |
| POST | `/api/cart/add` | Private | Add item to cart |
| PUT | `/api/cart/update` | Private | Update item quantity |
| DELETE | `/api/cart/remove/:productId` | Private | Remove item |
| DELETE | `/api/cart/clear` | Private | Clear cart |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/orders` | Private | Place new order |
| GET | `/api/orders/myorders` | Private | Get user's orders |
| GET | `/api/orders/:id` | Private | Get order by ID |
| PUT | `/api/orders/:id/cancel` | Private | Cancel order |

### Admin
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/admin/dashboard` | Admin | Dashboard stats |
| GET | `/api/admin/orders` | Admin | All orders |
| PUT | `/api/admin/orders/:id/status` | Admin | Update order status |
| GET | `/api/admin/users` | Admin | All users |
| PUT | `/api/admin/users/:id/toggle` | Admin | Toggle user active |

### Upload
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/upload/image` | Admin | Upload product image |

---

## 🚀 Deployment

### Backend — Render / Railway

1. Push `backend/` to GitHub
2. Create a new Web Service on [Render](https://render.com)
3. Set environment variables
4. Build command: `npm install`
5. Start command: `npm start`

### Frontend — Vercel

1. Push `frontend/` to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
4. Deploy!

---

## 🔐 Role-Based Access Control

| Feature | Guest | User | Admin |
|---------|-------|------|-------|
| Browse products | ✅ | ✅ | ✅ |
| View product detail | ✅ | ✅ | ✅ |
| Add to cart | ❌ | ✅ | ✅ |
| Place orders | ❌ | ✅ | ✅ |
| View own orders | ❌ | ✅ | ✅ |
| Cancel own orders | ❌ | ✅ | ✅ |
| Admin dashboard | ❌ | ❌ | ✅ |
| Manage products | ❌ | ❌ | ✅ |
| Manage all orders | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## 🧪 Testing the App

### Demo Credentials (after seeding)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartsabji.com | Admin@123 |
| User | user@smartsabji.com | User@123 |

### Test Flow
1. **Register** or login as test user
2. **Browse** products, use search and filters
3. **Add** vegetables to cart
4. **Checkout** with a shipping address
5. **View** order history and status
6. Login as **admin** to manage products and orders

---

## 🛠️ Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| State Management | Redux Toolkit |
| HTTP Client | Axios |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcryptjs |
| Image Upload | Cloudinary (with local fallback) |
| Notifications | react-hot-toast |
| Icons | react-icons (Feather) |

---

## 📝 Additional Notes

- **Free delivery** on orders above ₹200 (configurable in `orderController.js`)
- **JWT tokens** expire in 7 days (configurable via `JWT_EXPIRES_IN`)
- **Image uploads** use Cloudinary if configured; otherwise serve locally from `/uploads`
- **Text search** uses MongoDB's `$text` index on product name, description, and tags
- **Stock management** automatically decrements on order and restores on cancellation
- **Password hashing** uses bcrypt with 12 salt rounds
