# Order On The Go - Manual Testing Guide

## Overview
This guide covers end-to-end manual testing for all user roles in the Order On The Go application.

**Roles to Test:**
1. **Regular User** - Customer browsing and ordering food
2. **Restaurant Owner** - Managing restaurants and orders
3. **Staff** - Managing deliveries and order status
4. **Admin** - System administration and analytics

---

## Pre-Testing Setup

### Environment Variables
Ensure these are configured:
- **Frontend**: `VITE_API_URL=https://api-url-here/api` (or `http://localhost:5000/api` for local)
- **Backend**: `FRONTEND_BASE_URL=https://frontend-url-here` (or `http://localhost:5173` for local)

### Database State
- Clear test data or use a dedicated test database
- Have at least 2-3 restaurants with food items pre-seeded
- Ensure subscriptions are available

### Test Accounts (Pre-create or use registration)
```
User Account:
- Email: testuser@example.com
- Password: Test@123456

Restaurant Account:
- Email: restaurant1@example.com
- Password: Test@123456

Staff Account:
- Email: staff1@example.com
- Password: Test@123456

Admin Account:
- Email: admin@example.com
- Password: Test@123456
```

---

## 1. USER (CUSTOMER) TESTING

### 1.1 Authentication Flow
- [ ] **Register as New User**
  1. Navigate to `/register/user`
  2. Fill in: Username, Email, Phone, Password, Confirm Password
  3. Click "Register"
  4. Verify: Success message appears
  5. Verify: Email verification code sent (if SendGrid configured)

- [ ] **Login as User**
  1. Navigate to `/login/user`
  2. Enter email and password
  3. Click "Login"
  4. Verify: JWT token stored in localStorage
  5. Verify: Redirected to user dashboard

- [ ] **Logout**
  1. From any page, click logout button
  2. Verify: Token removed from localStorage
  3. Verify: Redirected to login page

### 1.2 Browse Food & Restaurants
- [ ] **View Home Page**
  1. After login, view home/dashboard
  2. Verify: List of restaurants displayed
  3. Verify: Each restaurant card shows name, image, cuisines
  4. Verify: Search bar is functional

- [ ] **Search Functionality**
  1. Use search bar to filter restaurants/food
  2. Enter "pizza" or another food
  3. Verify: Results filtered correctly
  4. Verify: No results message if search has no matches

- [ ] **View Restaurant Details**
  1. Click on a restaurant card
  2. Verify: Restaurant name, address, cuisines displayed
  3. Verify: List of food items shown with images and prices
  4. Verify: Ratings/reviews visible

### 1.3 Food & Cart Management
- [ ] **Add Food to Cart**
  1. Click "Add to Cart" on a food item
  2. Verify: Item added to cart
  3. Verify: Cart count incremented in navbar
  4. Verify: Toast/notification shows success

- [ ] **View Cart**
  1. Click cart icon in navbar
  2. Verify: All added items displayed
  3. Verify: Item quantity, price, subtotal shown
  4. Verify: Total amount calculated correctly
  5. Verify: "Remove" button works for each item

- [ ] **Update Quantity**
  1. In cart, increase/decrease quantity of an item
  2. Verify: Total updates immediately
  3. Verify: Minimum quantity is 1



### 1.4 Checkout & Payment
- [ ] **Proceed to Checkout**
  1. Click "Checkout" button from cart
  2. Verify: Order summary displayed
  3. Verify: Delivery address form shown
  4. Verify: Address populated from profile (if exists)

- [ ] **Enter Delivery Details**
  1. Fill in/update delivery address
  2. Click "Continue"
  3. Verify: Payment page appears

- [ ] **Payment Processing**
  1. Select online payment (Razorpay)
  2. Complete test payment flow
  3. Verify: Order created successfully
  4. Verify: Order ID shown and saved
  5. Verify: Confirmation email sent (if SendGrid configured)

### 1.5 Order Tracking
- [ ] **View Order Status**
  1. Login and navigate to "My Orders"
  2. Verify: All past orders listed with status
  3. Verify: Status shows: Placed, Pending, Confirmed, Preparing, Ready, Out for Delivery, Delivered
  4. Verify: Order timestamp displayed



### 1.6 Reviews & Ratings
- [ ] **Write Review for Food**
  1. Go to "My Orders" and completed orders
  2. Click "Rate & Review" button
  3. Select rating (1-5 stars)
  4. Add comment text
  5. Click "Submit"
  6. Verify: Review appears on food item page
  7. Verify: Rating count updated

### 1.7 User Profile
- [ ] **View Profile**
  1. Click profile icon → "My Profile"
  2. Verify: Username, email, phone displayed

- [ ] **Update Profile**
  1. Edit name, phone, address
  2. Click "Save"
  3. Verify: Changes saved and reflected
  4. Verify: Success notification shown



---

## 2. RESTAURANT OWNER TESTING

### 2.1 Authentication
- [ ] **Register as Restaurant**
  1. Navigate to `/register/restaurant`
  2. Fill: Restaurant Name, Cuisines, Email, Password, Phone, Address
  3. Click Register
  4. Verify: Account created and email verification sent
  5. Verify: Login requires admin approval

- [ ] **Restaurant Login**
  1. Navigate to `/login/restaurant`
  2. Enter email and password
  3. Verify: Logged in and token stored
  4. Verify: Redirected to dashboard

### 2.2 Restaurant Management
- [ ] **View Restaurant Profile**
  1. Click "Profile" from sidebar
  2. Verify: Restaurant details displayed (name, cuisines, address, phone)
  3. Verify: Edit button available

- [ ] **Edit Restaurant Details** (NEW FEATURE)
  1. Click "Edit" in restaurant profile
  2. Update: Title, Cuisines, Description, Address, Phone
  3. Click "Save"
  4. Verify: Changes saved
  5. Verify: Success message shown
  6. Verify: Changes reflected on public restaurant page

### 2.3 Food Management
- [ ] **Add New Food Item**
  1. Click "Add Food" from dashboard
  2. Fill: Name, Description, Price, Category, Image
  3. Add tags/cuisines
  4. Click "Save"
  5. Verify: Food appears in restaurant menu
  6. Verify: Visible to customers

- [ ] **Edit Food Item**
  1. Click edit icon on food item
  2. Update price, description, image
  3. Click "Save"
  4. Verify: Changes visible to customers immediately

- [ ] **Toggle Food Availability**
  1. Click availability toggle on food item
  2. Verify: Available/Unavailable status shown
  3. Verify: Unavailable items not shown to customers

- [ ] **Delete Food Item**
  1. Click delete icon on food item
  2. Confirm deletion
  3. Verify: Item removed from menu

### 2.4 Order Management
- [ ] **View Incoming Orders**
  1. Navigate to "Orders" section
  2. Verify: List of all orders (Placed, Pending, Confirmed, Preparing, Ready, Out for Delivery, Delivered)
  3. Verify: Each order shows customer name, items, amount, time

- [ ] **Accept/Confirm Order**
  1. Click on pending order
  2. Click "Confirm Order"
  3. Verify: Status changes to Confirmed
  4. Verify: Estimated prep time displayed

- [ ] **View Order Details**
  1. Click on any order
  2. Verify: All items, quantities, total shown
  3. Verify: Customer name and delivery address visible
  4. Verify: Order timeline displayed

### 2.5 Restaurant Analytics (VIEW ONLY)
- [ ] **View Analytics Data (if enabled)**
  1. Navigate to "Analytics" section
  2. Verify: Access depends on subscription plan
  3. Verify: Charts render without errors

---

## 3. STAFF TESTING

### 3.1 Staff Authentication & Invitation
- [ ] **Receive Staff Invitation**
  1. Restaurant owner clicks "Invite Staff"
  2. Enters staff email
  3. Check email for invitation link
  4. Click invitation link
  5. Create account with password
  6. Verify: Staff account created and linked to restaurant

- [ ] **Staff Login**
  1. Navigate to `/login` or use invite link
  2. Enter email and password
  3. Verify: Logged in and token stored
  4. Verify: Redirected to staff dashboard

### 3.2 Order Management
- [ ] **View Restaurant Orders**
  1. From staff dashboard, view orders list
  2. Verify: Shows orders for the restaurant
  3. Verify: Status, customer, delivery address shown

- [ ] **Request Status Change (Staff)**
  1. Select an order
  2. Submit status change request (e.g., PREPARING, READY, OUT_FOR_DELIVERY)
  3. Verify: Request appears in owner approval list

### 3.3 Staff Profile
- [ ] **View Staff Profile**
  1. Click "Profile" button
  2. Verify: Name, email, phone displayed
  3. Verify: Associated restaurant shown

- [ ] **Update Profile**
  1. Edit phone number or other details
  2. Click "Save"
  3. Verify: Changes saved

---

## 4. ADMIN TESTING

### 4.1 Admin Authentication
- [ ] **Admin Login**
  1. Navigate to `/admin-access`
  2. Enter admin credentials
  3. Verify: Logged in and redirected to admin dashboard
  4. Verify: Full dashboard access

### 4.2 Dashboard Overview
- [ ] **View Dashboard Overview**
  1. From admin dashboard, check "Overview" tab
  2. Verify: Stats cards visible (Total Users, Total Orders, Revenue)
  3. Verify: Key metrics displayed (Conversion Rate, Avg Order Value, etc.)
  4. Verify: Recent orders table shown

- [ ] **View Metrics**
  1. Check conversion rate calculation
  2. Verify: Average order value accurate
  3. Verify: Pending/Delivered today counts correct
  4. Verify: All calculations match backend data

### 4.3 Revenue Analytics
- [ ] **Access Revenue Analytics**
  1. Open analytics section
  2. Verify: Revenue endpoints respond
  3. Verify: Charts render without errors
  3. Verify: Tooltip shows data on hover
  4. Verify: X-axis shows dates
  5. Verify: Y-axis shows rupee amounts properly scaled

- [ ] **View Revenue by Restaurant**
  1. Click "By Restaurant" tab in Revenue section
  2. Verify: Bar chart shows restaurants with revenue amounts
  3. Verify: Table appears below chart
  4. Verify: Table columns: Restaurant, Food Revenue, Orders, Subscription Revenue, Subscriptions, Total
  5. Verify: Table is sortable by clicking headers
  6. Verify: Pagination works if many restaurants

- [ ] **Filter & Export Revenue Data**
  1. Check if filter options available (date range, restaurant)
  2. Click "Export" button
  3. Verify: CSV or PDF downloads with revenue data
  4. Verify: File contains complete dataset

### 4.4 User Management
- [ ] **View All Users**
  1. Navigate to "Users" section
  2. Verify: List of all registered users
  3. Verify: Email, phone, registration date shown
  4. Verify: Search and filter functionality works

- [ ] **View User Details**
  1. Click on a user
  2. Verify: Profile information displayed
  3. Verify: Status and role shown

- [ ] **Manage User Account**
  1. From user details, verify edit option
  2. Update user information if needed
  3. Verify: Changes saved

### 4.5 Restaurant Management
- [ ] **View All Restaurants**
  1. Navigate to "Restaurants" section in sidebar
  2. Verify: All restaurants listed
  3. Verify: Restaurant name, owner, phone shown
  4. Verify: Status visible (pending/approved)

- [ ] **View Restaurant Details**
  1. Click on a restaurant
  2. Verify: Full details displayed
  3. Verify: Address, cuisines, phone shown
  4. Verify: Food items count

- [ ] **Edit Restaurant Details** (NEW FEATURE)
  1. Click "Edit" button on restaurant
  2. Modal opens with form
  3. Update fields: Title, Cuisines, Description, Address, Phone
  4. Click "Save"
  5. Verify: Changes saved to database
  6. Verify: Success notification shown
  7. Verify: Restaurant update reflected on public page

- [ ] **Update Restaurant Status**
  1. From restaurant edit modal, update status (pending/approved)
  2. Click "Save"
  3. Verify: Status changes

### 4.6 Order Management
- [ ] **View All Orders**
  1. Navigate to "Orders" section
  2. Verify: All orders listed with status
  3. Verify: Order ID, customer, amount, date shown

- [ ] **Filter Orders**
  1. Filter by: Status (Placed, Pending, Confirmed, Preparing, Ready, Out for Delivery, Delivered)
  2. Verify: Correct orders displayed for each filter

- [ ] **View Order Details**
  1. Click on an order
  2. Verify: Items, quantities, prices shown
  3. Verify: Customer details visible
  4. Verify: Delivery address shown
  5. Verify: Status timeline displayed

- [ ] **Modify Order Status** (if admin permission)
  1. Click order
  2. Update status manually if needed
  3. Verify: Changes reflected to customer

### 4.7 Analytics & Reports
- [ ] **View Dashboard Graphs**
  1. Check revenue trend line chart
  2. Verify: 7 days of data shown
  3. Check order distribution chart
  4. Verify: Charts render correctly

### 4.8 Staff Management
- [ ] **View All Staff**
  1. Navigate to "Staff" section
  2. Verify: List of all staff members
  3. Verify: Associated restaurant shown

- [ ] **View Staff Details**
  1. Click on staff member
  2. Verify: Email, role, restaurant displayed

- [ ] **Remove Staff**
  1. Click "Delete" or "Remove" action
  2. Confirm action
  3. Verify: Staff removed from list

---

## 5. CROSS-FUNCTIONAL TESTING

### 5.2 Payment & Transactions
- [ ] **Successful Payment**
  1. Complete order with online payment
  2. Verify: Order created immediately
  3. Verify: Payment recorded in database
  4. Verify: Confirmation shown to user

- [ ] **Failed Payment**
  1. Attempt payment with invalid card
  2. Verify: Error message shown
  3. Verify: User can retry
  4. Verify: Order not created until payment succeeds


### 5.3 URL & Routing
- [ ] **Production URL Routing**
  1. Test all major routes with production URL
  2. Verify: CORS headers present in responses
  3. Verify: Trailing slash handling (both with and without)
  4. Verify: Deep links work (e.g., `/admin`, `/restaurants/123`)

- [ ] **API Endpoint Configuration**
  1. Verify: API calls use environment variable (VITE_API_URL)
  2. Verify: Switching API URL works correctly
  3. Verify: Error handling for unreachable API

---

## 6. EDGE CASES & ERROR HANDLING

- [ ] **Item Out of Stock**
  1. Verify: Out of stock items not orderable
  2. Verify: Clear indication in UI


- [ ] **Expired Session**
  1. Login and wait for token expiration
  2. Verify: User redirected to login
  3. Verify: Previous action attempted after re-login

- [ ] **Network Failure**
  1. Simulate network disconnection during order
  2. Verify: Graceful error message
  3. Verify: Retry option available

- [ ] **Multiple Browser Tabs/Sessions**
  1. Login in two different tabs
  2. Logout from one tab
  3. Verify: Other session invalidated

- [ ] **Invalid Input Data**
  1. Try SQL injection in search box
  2. Verify: Input sanitized and no errors
  3. Try XSS payload in review
  4. Verify: Payload escaped and displayed safely

---

## 7. PERFORMANCE & LOAD TESTING

- [ ] **Page Load Times**
  - Home page: < 2 seconds
  - Restaurant page: < 2 seconds
  - Dashboard: < 3 seconds
  - Analytics page: < 3 seconds

- [ ] **Concurrent Users**
  - 10+ simultaneous users browsing
  - Verify: No timeouts or crashes
  - Verify: Response times acceptable

- [ ] **Large Data Sets**
  - View dashboard with 1000+ orders
  - Verify: Page loads and scrolls smoothly
  - Verify: Pagination works correctly

---

## 8. BROWSER & DEVICE COMPATIBILITY

### Desktop
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Responsive design verified

### Tablets
- [ ] iPad
- [ ] Android tablets

---

## 9. ACCESSIBILITY

- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast adequate
- [ ] Form labels associated with inputs
- [ ] Alt text on images

---

## 10. BUG REPORTING TEMPLATE

If issues found, document with:

```
**Issue**: [Brief description]
**Severity**: Critical/High/Medium/Low
**Role Affected**: [User/Restaurant/Staff/Admin]
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**: 

**Actual Result**: 

**Screenshot**: [if applicable]

**Browser/Device**: [specific details]

**Timestamp**: [when issue occurred]
```

---

## Testing Sign-Off

Once all tests pass:

| Role | Tested | Date | Tester | Notes |
|------|--------|------|--------|-------|
| User | [ ] | | | |
| Restaurant | [ ] | | | |
| Staff | [ ] | | | |
| Admin | [ ] | | | |
| Cross-functional | [ ] | | | |
| Performance | [ ] | | | |
| Mobile | [ ] | | | |

---

**Test Environment**: [Local/Staging/Production]
**Test Date**: [Date]
**Tested By**: [Name]
**Status**: [Pass/Fail/Partial]
