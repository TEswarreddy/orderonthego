🔹 PHASE 0: Installations & Environment Setup

1️⃣ Install Node.js (LTS)

This is required for both backend & frontend.

🔗 Download:
👉 https://nodejs.org

✔ Choose LTS version  
✔ After install, verify:

  node -v  
  npm -v  

You should see version numbers.


2️⃣ Install MongoDB (Choose ONE option)

✅ Option A (Recommended – Real World)

MongoDB Atlas (Cloud Database)

🔗 https://www.mongodb.com/atlas/database

Steps:

Create account  

Create Free Cluster  

Create DB user (username + password)  

Allow IP access (0.0.0.0/0)  

Copy connection string  

We’ll use this later.


3️⃣ Install Git (Version Control)

Mandatory for real projects.

🔗 https://git-scm.com/downloads

Verify:

git --version


4️⃣ Install VS Code (IDE)

🔗 https://code.visualstudio.com/

Must-have extensions:

ES7+ React Snippets  

Prettier  

ESLint  

MongoDB for VS Code  

GitLens  


5️⃣ Install Postman (API Testing)

🔗 https://www.postman.com/downloads/

We’ll test Auth, Cart, Orders, Admin APIs here.


6️⃣ Browser (Chrome Recommended)

For DevTools & debugging.

---

# Order on the Go - Complete Project Documentation

## Overview

Order on the Go is a food ordering and restaurant management platform with role-based access for customers, restaurant owners, staff, and administrators. It includes menu management, cart and order flow, payments, subscriptions, reviews, verification, and admin analytics.

## Project Structure

```
orderonthego/
├── backend/           # Node.js + Express API
│   ├── server.js
│   ├── src/
│   │   ├── app.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seeds/
│   │   └── utils/
│   └── uploads/
├── frontend/          # React + Vite app
│   ├── public/
│   └── src/
│       ├── api/
│       ├── assets/
│       ├── components/
│       ├── context/
│       └── pages/
└── README.md
```

## Tech Stack

- Backend: Node.js, Express, MongoDB (Mongoose), JWT
- Frontend: React, Vite, Tailwind CSS, Axios
- Payments: Razorpay
- Messaging: SendGrid (email), Twilio (SMS)

## Roles and Access

- USER: browse foods, manage cart, place orders, review foods
- RESTAURANT: manage profile, menu, orders, staff, subscriptions
- STAFF: assist with orders and status updates
- ADMIN: manage users, restaurants, orders, analytics

## Key Features

- Authentication with JWT and role-based authorization
- Restaurant registration and admin approval
- Food menu management and availability
- Cart and checkout flow
- Order lifecycle tracking
- Razorpay payment integration
- Reviews and ratings
- Staff invites and approval workflow
- Subscription plans and feature limits
- Admin dashboard and analytics
- Email and SMS verification

## Getting Started (Quick)

1) Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

2) Create backend environment file

```bash
cd backend
copy .env.example .env
```

3) Start the app

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

## Environment Variables (Backend)

See backend/.env.example for full list. Required keys:

- PORT
- MONGO_URI
- JWT_SECRET
- FRONTEND_BASE_URL

Optional services:

- Razorpay: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
- SendGrid: SENDGRID_API_KEY, SENDGRID_SENDER
- Twilio: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER

## Backend Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server (nodemon)
npm run seed:foods # Seed sample food data
```

## Frontend Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run preview    # Preview build
npm run lint       # Run ESLint
```

## API Reference

Complete API documentation is available in:
- API_DOCUMENTATION.md

## Database Schema

Complete schema reference is available in:
- DATABASE_SCHEMA.md

## Feature Documentation

Feature-level documentation is available in:
- FEATURE_DOCUMENTATION.md

## Admin Setup

Admin setup guidance is available in:
- ADMIN_SETUP_GUIDE.md

## Subscription Model

Subscription plan details are available in:
- SUBSCRIPTION_MODEL_DOCUMENTATION.md

## Manual Testing

Test scenarios are available in:
- MANUAL_TESTING_GUIDE.md

## Common Endpoints (Quick Reference)

- Auth: /api/auth
- Foods: /api/foods
- Cart: /api/cart
- Orders: /api/orders
- Payment: /api/payment
- Reviews: /api/reviews
- Admin: /api/admin
- Restaurants: /api/restaurants
- Staff: /api/staff
- Subscriptions: /api/subscriptions
- Verification: /api/verification

## Deployment Notes

- Update FRONTEND_BASE_URL to your deployed frontend URL.
- Use production MongoDB URI and secrets.
- Build frontend with npm run build and serve the dist/ directory.

## Support

For help or issues, review the documentation files listed above, or open a project issue.
