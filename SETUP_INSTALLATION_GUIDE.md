# Order on the Go - Setup & Installation Guide

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Prerequisites](#prerequisites)
3. [Installation Steps](#installation-steps)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [Database Configuration](#database-configuration)
7. [Environment Variables](#environment-variables)
8. [Running the Application](#running-the-application)
9. [Verification](#verification)
10. [Common Issues & Troubleshooting](#common-issues--troubleshooting)
11. [Additional Configuration](#additional-configuration)
12. [Deployment](#deployment)

---

## System Requirements

### Minimum Requirements
- **Operating System:** Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM:** 4GB (8GB recommended)
- **Disk Space:** 2GB free space
- **Internet Connection:** Required for initial setup and database access

### Software Requirements
- **Node.js:** v18.x or higher (LTS recommended)
- **npm:** v9.x or higher (comes with Node.js)
- **Git:** Latest version
- **Modern Web Browser:** Chrome, Firefox, Safari, or Edge (latest versions)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### 1. Node.js & npm

**Download & Install:**
🔗 https://nodejs.org (Choose LTS version)

**Verify Installation:**
```bash
node -v
# Expected output: v18.x.x or higher

npm -v
# Expected output: v9.x.x or higher
```

### 2. Git

**Download & Install:**
🔗 https://git-scm.com/downloads

**Verify Installation:**
```bash
git --version
# Expected output: git version 2.x.x
```

### 3. Code Editor (Recommended)

- **Visual Studio Code:** https://code.visualstudio.com/
- **WebStorm:** https://www.jetbrains.com/webstorm/
- **Sublime Text:** https://www.sublimetext.com/

### 4. MongoDB Atlas Account (Cloud Database)

**Sign Up:**
🔗 https://www.mongodb.com/atlas/database

You'll need this for the database connection. See [Database Configuration](#database-configuration) section below.

---

## Installation Steps

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <your-repository-url>

# Navigate to the project directory
cd orderonthego
```

If you don't have a Git repository yet, simply extract the project folder.

### Step 2: Project Structure

Your project should have this structure:
```
orderonthego/
├── backend/           # Node.js + Express API
├── frontend/          # React + Vite application
├── README.md
└── ...
```

---

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install the following key packages:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `cors` - Cross-origin resource sharing
- `razorpay` - Payment gateway
- `@sendgrid/mail` - Email service
- `twilio` - SMS service
- `dotenv` - Environment variables

**Expected Output:**
```
added 200+ packages in 30s
```

### Step 3: Create Environment File

Create a `.env` file in the `backend/` directory:

```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

If `.env.example` doesn't exist, create `.env` manually with the following content:

```env
# Server Configuration
PORT=5000

# Database
MONGO_URI=your_mongodb_connection_string
MONGO_DNS_SERVERS=8.8.8.8,1.1.1.1

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Frontend URL
FRONTEND_BASE_URL=http://localhost:5173

# Razorpay (Payment Gateway)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# SendGrid (Email Service)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_SENDER=your_verified_sender_email@example.com

# Twilio (SMS Service)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

See [Environment Variables](#environment-variables) section for detailed configuration.

### Step 4: Update Configuration Files

Ensure your `backend/src/config/db.js` exists and is properly configured (it should be included in the project).

---

## Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
# From project root
cd frontend

# Or from backend directory
cd ../frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- `react` & `react-dom` - React framework
- `react-router-dom` - Routing
- `axios` - HTTP client
- `framer-motion` - Animations
- `lucide-react` - Icons
- `recharts` - Charts
- `tailwindcss` - CSS framework
- `vite` - Build tool

**Expected Output:**
```
added 300+ packages in 45s
```

### Step 3: Configure API Base URL

Verify that `frontend/src/api/axios.js` points to your backend:

```javascript
// Should point to backend URL
const API_BASE_URL = 'http://localhost:5000/api';
```

Alternatively, define a frontend environment variable in `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Restart the frontend dev server after changing `.env`.

---

## Database Configuration

### Option 1: MongoDB Atlas (Recommended - Cloud)

#### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/atlas/database
2. Sign up for a free account
3. Create a new cluster (Free tier is sufficient)

#### Step 2: Create Database User

1. Go to **Database Access** in the left sidebar
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Set username: `orderonthego_db_user` (or your choice)
5. Generate a strong password
6. Set user privileges to: **Read and write to any database**
7. Click **Add User**

#### Step 3: Whitelist IP Address

1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (for development)
   - IP: `0.0.0.0/0`
4. Click **Confirm**

⚠️ **Security Note:** In production, restrict to specific IP addresses.

#### Step 4: Get Connection String

1. Go to **Database** in the left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Select **Driver:** Node.js, **Version:** 4.1 or later
5. Copy the connection string:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. Replace `<username>` with your database username
7. Replace `<password>` with your database password
8. Add `&appName=OrderOnTheGo` at the end
9. Update this in your `backend/.env` file:

```env
MONGO_URI=mongodb+srv://orderonthego_db_user:yourpassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=OrderOnTheGo
```

### Option 2: Local MongoDB (Alternative)

If you prefer local development:

#### Step 1: Install MongoDB Community Edition

**Windows:**
- Download: https://www.mongodb.com/try/download/community
- Run installer with default settings
- MongoDB will run as a Windows service

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
# Import MongoDB public GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

# Create list file
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
```

#### Step 2: Update Environment Variable

```env
MONGO_URI=mongodb://localhost:27017/orderonthego
```

---

## Environment Variables

### Backend Environment Variables (`.env`)

Create a `backend/.env` file with the following variables:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Server port | Yes | `5000` |
| `MONGO_URI` | MongoDB connection string | Yes | See Database Configuration |
| `MONGO_DNS_SERVERS` | DNS servers for MongoDB | No | `8.8.8.8,1.1.1.1` |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | `your_super_secret_key_min_32_chars` |
| `FRONTEND_BASE_URL` | Frontend URL for CORS | Yes | `http://localhost:5173` |
| `RAZORPAY_KEY_ID` | Razorpay API key | Optional* | `rzp_test_xxxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret | Optional* | `xxxxxxxxxxxxxx` |
| `SENDGRID_API_KEY` | SendGrid API key | Optional* | `SG.xxxxxxxxxxxxxxx` |
| `SENDGRID_SENDER` | Verified sender email | Optional* | `noreply@yourapp.com` |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | Optional* | `ACxxxxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | Optional* | `xxxxxxxxxxxxxx` |
| `TWILIO_PHONE_NUMBER` | Twilio Phone Number | Optional* | `+1234567890` |

\* Optional services can be configured later. The app will work without them, but related features will be disabled.

### Getting API Keys

#### Razorpay (Payment Gateway)
1. Sign up at https://razorpay.com/
2. Go to **Settings** → **API Keys**
3. Generate **Test Mode** keys for development
4. Copy **Key ID** and **Key Secret**

#### SendGrid (Email Service)
1. Sign up at https://sendgrid.com/
2. Go to **Settings** → **API Keys**
3. Create new API key with **Full Access**
4. Copy the API key (shown only once!)
5. Verify sender email in **Settings** → **Sender Authentication**

#### Twilio (SMS Service)
1. Sign up at https://www.twilio.com/
2. Get free trial account with $15 credit
3. Go to **Console Dashboard**
4. Copy **Account SID** and **Auth Token**
5. Get a phone number from **Phone Numbers** section

### Security Best Practices

⚠️ **Important Security Notes:**

1. **Never commit `.env` file to Git**
   ```bash
   # Add to .gitignore
   echo ".env" >> .gitignore
   ```

2. **Use strong JWT secret** (minimum 32 characters):
   ```bash
   # Generate secure random string
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Change default secrets** before production
4. **Use environment-specific `.env` files**:
   - `.env.development`
   - `.env.production`
   - `.env.test`

---

## Running the Application

### Development Mode (Recommended)

#### Terminal 1 - Backend Server

```bash
# Navigate to backend
cd backend

# Start development server with auto-reload
npm run dev
```

**Expected Output:**
```
[nodemon] 3.1.11
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node server.js`
Server is running on port 5000
MongoDB Connected: cluster0.xxxxx.mongodb.net
```

The backend API will be available at: **http://localhost:5000**

#### Terminal 2 - Frontend Development Server

```bash
# Open new terminal
# Navigate to frontend
cd frontend

# Start Vite development server
npm run dev
```

**Expected Output:**
```
  VITE v7.2.4  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

The frontend will be available at: **http://localhost:5173**

### Production Mode

#### Build Frontend

```bash
cd frontend
npm run build
```

This creates optimized production files in `frontend/dist/`

#### Run Backend

```bash
cd backend
npm start
```

#### Serve Frontend (Choose one option)

**Option 1: Using serve package**
```bash
npm install -g serve
cd frontend
serve -s dist -l 3000
```

**Option 2: Use nginx or Apache** to serve the `dist` folder

---

## Verification

### 1. Check Backend Health

Open browser or use curl:
```bash
curl http://localhost:5000
```

**Expected Response:**
```
SB Foods API is running 🚀
```

### 2. Check Database Connection

Look for this in backend terminal:
```
MongoDB Connected: cluster0.xxxxx.mongodb.net
```

### 3. Check Frontend

Open browser: http://localhost:5173

You should see the Order on the Go landing page.

### 4. Test API Endpoints

```bash
# Test user registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!@#",
    "phone": "+91-9876543210"
  }'
```

### 5. Check Browser Console

Press `F12` in browser → Console tab
Should see no errors.

---

## Common Issues & Troubleshooting

### Issue 1: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Or change port in .env
PORT=5001
```

### Issue 2: MongoDB Connection Failed

**Error:**
```
MongooseServerSelectionError: connect ECONNREFUSED
```

**Solutions:**

1. **Check MongoDB Atlas IP Whitelist:**
   - Ensure `0.0.0.0/0` is added (or your specific IP)

2. **Verify Connection String:**
   - Check username and password are correct
   - Ensure password is URL encoded (replace special characters)
   - Example: `password@123` → `password%40123`

3. **Check DNS Resolution:**
   ```bash
   # Test DNS
   nslookup cluster0.xxxxx.mongodb.net
   ```

4. **Try Alternative DNS:**
   ```env
   MONGO_DNS_SERVERS=8.8.8.8,1.1.1.1
   ```

### Issue 3: CORS Error

**Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**

1. Verify `FRONTEND_BASE_URL` in backend `.env`:
   ```env
   FRONTEND_BASE_URL=http://localhost:5173
   ```

2. Check frontend API configuration in `frontend/src/api/axios.js`

3. Restart backend server after changing `.env`

### Issue 4: Module Not Found

**Error:**
```
Error: Cannot find module 'express'
```

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or on Windows
rmdir /s node_modules
del package-lock.json
npm install
```

### Issue 5: Frontend Build Fails

**Error:**
```
Error: Failed to load config
```

**Solution:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Reinstall dependencies
npm install

# Try building again
npm run build
```

### Issue 6: Environment Variables Not Loading

**Symptoms:**
- `undefined` errors for environment variables
- Connection failures

**Solution:**
```bash
# Verify .env file exists
ls -la | grep .env

# Check file is in correct directory
# backend/.env for backend
# Not in root or frontend

# Restart server after changes
```

### Issue 7: Payment Gateway Not Working

**Solution:**

1. Verify Razorpay keys in `.env`
2. Use **Test Mode** keys for development
3. Check Razorpay dashboard for error logs
4. Ensure amount is in **paise** (multiply by 100)

### Issue 8: Emails Not Sending

**Solution:**

1. Verify SendGrid API key
2. Check sender email is verified
3. Check SendGrid dashboard → **Activity**
4. Verify email quota (free tier: 100/day)
5. Check spam folder

---

## Additional Configuration

### Seeding Initial Data

To populate the database with sample food items:

```bash
cd backend
npm run seed:foods
```

**Expected Output:**
```
✅ Sample foods seeded successfully!
```

### Available npm Scripts

**Backend:**
```bash
npm start          # Start production server
npm run dev        # Start development server (auto-reload)
npm run seed:foods # Seed sample food data
```

**Frontend:**
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### VS Code Extensions (Recommended)

Install these extensions for better development experience:

1. **ESLint** - Code linting
2. **Prettier** - Code formatting
3. **ES7+ React/Redux/React-Native snippets** - React snippets
4. **Tailwind CSS IntelliSense** - Tailwind autocomplete
5. **MongoDB for VS Code** - Database management
6. **Thunder Client** - API testing
7. **GitLens** - Git integration

### Database GUI Tools (Optional)

**MongoDB Compass** (Official MongoDB GUI)
- Download: https://www.mongodb.com/try/download/compass
- Connect using your `MONGO_URI`

**Alternatives:**
- **Studio 3T:** https://studio3t.com/
- **Robo 3T:** https://robomongo.org/

### API Testing Tools

**Recommended:**
- **Thunder Client** (VS Code Extension)
- **Postman:** https://www.postman.com/
- **Insomnia:** https://insomnia.rest/

---

## Deployment

### Backend Deployment (Render/Railway/Heroku)

1. **Prepare for Production:**
   ```bash
   # Ensure production dependencies are specified
   npm install --production
   ```

2. **Environment Variables:**
   - Set all `.env` variables in hosting platform
   - Use production MongoDB URI
   - Update `FRONTEND_BASE_URL` to production frontend URL

3. **Create `Procfile` (for Heroku):**
   ```
   web: node server.js
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Build the Application:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Configure Build Settings:**
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Environment Variables:**
   - Update backend API URL in `src/api/axios.js`
   - Or use environment variable for API URL

4. **Deploy `_redirects` file:**
   ```
   # frontend/public/_redirects
   /*  /index.html  200
   ```

### Recommended Hosting Platforms

**Backend:**
- ✅ **Render** (Free tier available)
- ✅ **Railway** (Free tier available)
- ✅ **Heroku** (Paid)
- ✅ **AWS EC2** (Full control)
- ✅ **DigitalOcean** (VPS)

**Frontend:**
- ✅ **Vercel** (Recommended for React)
- ✅ **Netlify** (Great for static sites)
- ✅ **AWS S3 + CloudFront**
- ✅ **GitHub Pages** (Static only)

**Database:**
- ✅ **MongoDB Atlas** (Already using - has free tier)

---

## Support & Resources

### Documentation
- **API Documentation:** See `API_DOCUMENTATION.md`
- **Subscription Model:** See `SUBSCRIPTION_MODEL_DOCUMENTATION.md`
- **Admin Setup:** See `ADMIN_SETUP_GUIDE.md`

### Learning Resources
- **Node.js Docs:** https://nodejs.org/docs
- **Express.js Guide:** https://expressjs.com/
- **React Docs:** https://react.dev/
- **MongoDB University:** https://university.mongodb.com/
- **Vite Docs:** https://vitejs.dev/

### Community Support
- **Stack Overflow:** Tag questions with `mern-stack`
- **Discord Communities:** MERN Stack developers
- **GitHub Issues:** Report bugs and issues

### Contact
For project-specific help:
- **Email:** support@orderonthego.com
- **GitHub:** [Your Repository URL]

---

## Next Steps

After successful installation:

1. ✅ **Review API Documentation** - `API_DOCUMENTATION.md`
2. ✅ **Configure Admin Account** - See `ADMIN_SETUP_GUIDE.md`
3. ✅ **Set Up Subscriptions** - See `SUBSCRIPTION_MODEL_DOCUMENTATION.md`
4. ✅ **Seed Sample Data** - Run `npm run seed:foods`
5. ✅ **Test All Features** - See `MANUAL_TESTING_GUIDE.md`
6. ✅ **Configure Payment Gateway** - Test Razorpay integration
7. ✅ **Set Up Email/SMS** - Configure SendGrid and Twilio
8. ✅ **Deploy to Production** - Follow deployment guide above

---

## Quick Start Checklist

Use this checklist to ensure proper setup:

- [ ] Node.js and npm installed
- [ ] Git installed
- [ ] MongoDB Atlas account created
- [ ] Database cluster created
- [ ] Database user created with password
- [ ] IP whitelist configured (0.0.0.0/0 for dev)
- [ ] Connection string obtained
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend `.env` file created and configured
- [ ] All required environment variables set
- [ ] JWT_SECRET generated (32+ characters)
- [ ] Backend server starts successfully
- [ ] MongoDB connection successful
- [ ] Frontend server starts successfully
- [ ] Frontend can connect to backend
- [ ] Test registration/login works
- [ ] Optional: Razorpay keys configured
- [ ] Optional: SendGrid configured
- [ ] Optional: Twilio configured

---

**Installation Complete! 🎉**

Your Order on the Go application should now be running successfully!

**Quick Start:**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Test: http://localhost:5000/api

---

**Last Updated:** February 10, 2026  
**Version:** 1.0.0
