# Postman API Testing Guide - Order on the Go

## Quick Start

### Step 1: Import the Collection
1. Open Postman
2. Click **Import** button (top-left)
3. Select **Upload Files** and choose `Order_on_the_Go_API_Collection.postman_collection.json`
4. The complete collection with all endpoints will be imported

### Step 2: Configure Environment Variables
Before testing, ensure your Postman environment variables are set:

1. Click **Environments** (left sidebar)
2. Select or create a new environment
3. Set these variables:
   - `baseURL`: `http://localhost:5000/api`
   - Leave other variables empty; they'll auto-populate after login

4. Make sure your backend server is running on `http://localhost:5000`

---

## Testing Order & Workflow

### **Phase 1: Authentication (Start Here)**

This phase establishes credentials for all subsequent tests.

#### 1.1 Register a User
- **Request**: `POST /auth/register/user`
- **Test Data**:
  ```json
  {
    "username": "John Doe",
    "email": "testuser@example.com",
    "password": "TestPassword123!",
    "userType": "USER",
    "phone": "+91-9876543210",
    "address": "123 Main Street"
  }
  ```
- **Expected Response**: Status `201` with `token` (auto-saved to `{{token}}`)
- **Postman Note**: The test script auto-captures the token. Check `Tests` tab to see this happens.

#### 1.2 Register a Restaurant
- **Request**: `POST /auth/register/restaurant`
- **Test Data**:
  ```json
  {
    "username": "Pizza Owner",
    "email": "owner@pizzapalace.com",
    "password": "TestPassword123!",
    "userType": "RESTAURANT",
    "phone": "+1-2125551234",
    "address": "456 Broadway",
    "restaurantName": "Pizza Palace",
    "restaurantAddress": "456 Broadway",
    "cuisineType": "Italian",
    "description": "Authentic Italian Pizzeria"
  }
  ```
- **Expected Response**: Status `201` with `token` (auto-saved to `{{restaurantToken}}`)

#### 1.3 Login User
- **Request**: `POST /auth/login/user`
- **Body**:
  ```json
  {
    "email": "testuser@example.com",
    "password": "TestPassword123!"
  }
  ```
- **Expected**: Status `200`, token refreshed

#### 1.4 Login Restaurant
- **Request**: `POST /auth/login/restaurant`
- **Body**:
  ```json
  {
    "email": "owner@pizzapalace.com",
    "password": "TestPassword123!"
  }
  ```
- **Expected**: Status `200`, `{{restaurantToken}}` and `{{restaurantId}}` auto-captured

#### 1.5 Get User Profile
- **Request**: `GET /auth/profile`
- **Headers**: Uses `Authorization: Bearer {{token}}`
- **Expected**: Status `200`, returns your complete profile

#### 1.6 Update User Profile
- **Request**: `PUT /auth/profile`
- **Body**: Update any fields (username, phone, address)
- **Expected**: Status `200`, new data reflected

---

### **Phase 2: Food Management (Restaurant Only)**

These tests require `{{restaurantToken}}` from Phase 1.

#### 2.1 Create Food Item
- **Request**: `POST /foods`
- **Required Fields**:
  ```json
  {
    "title": "Margherita Pizza",
    "description": "Classic Italian pizza",
    "price": 299,
    "category": "Pizza",
    "menuType": "Main",
    "mainImg": "https://example.com/pizza.jpg",
    "discount": 0
  }
  ```
- **Expected**: Status `201`, returns food object with `_id` (saved to `{{foodId}}`)
- **Note**: Price must be > 0; discount is optional

#### 2.2 Get All Foods
- **Request**: `GET /foods?page=1&limit=10`
- **Query Params**: `page`, `limit`, `category` (optional), `searchTerm` (optional)
- **Expected**: Status `200`, returns array with pagination

#### 2.3 Get Single Food Item
- **Request**: `GET /foods/{{foodId}}`
- **Expected**: Status `200`, returns detailed food object with restaurant info

#### 2.4 Get Foods by Restaurant
- **Request**: `GET /foods/restaurant/{{restaurantId}}`
- **Expected**: Status `200`, returns all foods from that restaurant

#### 2.5 Get My Foods (Restaurant Only)
- **Request**: `GET /foods/my-foods` (requires `{{restaurantToken}}`)
- **Expected**: Status `200`, returns only this restaurant's foods

#### 2.6 Update Food Item
- **Request**: `PUT /foods/{{foodId}}`
- **Requires Owner**: Must use `{{restaurantToken}}` that created the food
- **Body**: Any updatable fields (title, price, description, etc.)
- **Expected**: Status `200`, updated food object

#### 2.7 Update Food Availability
- **Request**: `PUT /foods/{{foodId}}/availability`
- **Body**: `{ "isAvailable": true/false }`
- **Expected**: Status `200`, food toggled

#### 2.8 Delete Food Item
- **Request**: `DELETE /foods/{{foodId}}`
- **Expected**: Status `200`, food removed

---

### **Phase 3: Cart & Orders (User)**

These tests require `{{token}}` from Phase 1.

#### 3.1 Add to Cart
- **Request**: `POST /cart`
- **Body**: 
  ```json
  {
    "foodId": "{{foodId}}",
    "quantity": 2
  }
  ```
- **Expected**: Status `201`, returns cart with items

#### 3.2 Get Cart
- **Request**: `GET /cart`
- **Expected**: Status `200`, current cart with all items

#### 3.3 Remove from Cart
- **Request**: `DELETE /cart/{{foodId}}`
- **Expected**: Status `200`, item removed from cart

#### 3.4 Place Order
- **Request**: `POST /orders`
- **Body**:
  ```json
  {
    "address": "123 Main Street, Apt 4B",
    "paymentMethod": "RAZORPAY"
  }
  ```
- **Expected**: Status `201`, order created with:
  - `status`: "PLACED"
  - `paymentStatus`: "PENDING"
  - `_id` saved to `{{orderId}}`

#### 3.5 Get My Orders (User)
- **Request**: `GET /orders/my-orders`
- **Expected**: Status `200`, all orders placed by this user

#### 3.6 Get Restaurant Orders
- **Request**: `GET /orders/restaurant` (requires `{{restaurantToken}}`)
- **Expected**: Status `200`, all orders received by restaurant

---

### **Phase 4: Payments (Razorpay Flow)**

These tests require a valid `{{orderId}}` and `{{token}}`.

#### 4.1 Create Razorpay Order
- **Request**: `POST /payment/create-order`
- **Expected**: Status `201`, returns:
  ```json
  {
    "razorpayOrder": { "id": "order_xxx", "amount": 29900, ... },
    "paymentId": "payment_xxx"
  }
  ```
- **Auto-saved**: `{{razorpayOrderId}}` and `{{paymentId}}`

#### 4.2 Verify Payment (Test Only)
- **Request**: `POST /payment/verify`
- **Note**: In production, you'd get real Razorpay signature from payment gateway
- **Body**:
  ```json
  {
    "razorpay_order_id": "{{razorpayOrderId}}",
    "razorpay_payment_id": "pay_test_xxx",
    "razorpay_signature": "test_signature",
    "paymentId": "{{paymentId}}",
    "address": "123 Main Street, Apt 4B"
  }
  ```
- **Expected**: Status `200`, order placed with `paymentStatus: "PAID"`

---

### **Phase 5: Order Status Updates (Restaurant/Staff)**

These require `{{restaurantToken}}` and `{{orderId}}`.

#### 5.1 Update Order Status (Restaurant)
- **Request**: `PUT /orders/{{orderId}}/status`
- **Valid Statuses** (in order): PLACED → PENDING → CONFIRMED → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED
- **Body**: 
  ```json
  { "status": "CONFIRMED" }
  ```
- **Expected**: Status `200`, order status updated
- **Note**: Only RESTAURANT role can directly update (with restrictions)

#### 5.2 Request Status Change (Staff)
- **Request**: `POST /orders/{{orderId}}/status-request` (requires `{{staffToken}}`)
- **Staff Limitation**: CHEF/DELIVERY can't jump statuses; must request approval
- **Body**: 
  ```json
  { "status": "READY" }
  ```
- **Expected**: Status `201`, request pending restaurant approval

---

### **Phase 6: Reviews (User)**

These require `{{token}}` and `{{foodId}}`.

#### 6.1 Add Review
- **Request**: `POST /reviews`
- **Body**:
  ```json
  {
    "foodId": "{{foodId}}",
    "rating": 5,
    "comment": "Absolutely delicious!"
  }
  ```
- **Expected**: Status `201`, review saved with `_id` (saved to `{{reviewId}}`)
- **Rating**: 1-5 stars only

#### 6.2 Get Food Reviews
- **Request**: `GET /reviews/food/{{foodId}}?page=1&limit=10`
- **Expected**: Status `200`, paginated list of reviews

#### 6.3 Get Review Stats
- **Request**: `GET /reviews/food/{{foodId}}/stats`
- **Expected**: Status `200`, returns `{ "averageRating": 4.6, "totalReviews": 25 }`

#### 6.4 Update Review
- **Request**: `PUT /reviews/{{reviewId}}`
- **Body**: Update rating and/or comment
- **Expected**: Status `200`, review updated

#### 6.5 Delete Review
- **Request**: `DELETE /reviews/{{reviewId}}`
- **Expected**: Status `200`, review removed

---

### **Phase 7: Subscriptions (Restaurant)**

These require `{{restaurantToken}}`.

#### 7.1 Get Subscription Plans
- **Request**: `GET /subscriptions/plans`
- **Public Endpoint**: No auth needed
- **Expected**: Status `200`, returns:
  ```json
  {
    "plans": [
      {
        "name": "FREE",
        "maxMenuItems": 5,
        "maxOrdersPerDay": 10,
        "price": 0
      },
      {
        "name": "BASIC",
        "maxMenuItems": 25,
        "price": 999,
        "duration": 30
      },
      ...
    ]
  }
  ```

#### 7.2 Get My Subscription
- **Request**: `GET /subscriptions/my-subscription` (requires `{{restaurantToken}}`)
- **Expected**: Status `200`, current plan details with usage

#### 7.3 Check Feature Limit
- **Request**: `GET /subscriptions/check-limit/maxMenuItems`
- **Features To Check**: `maxMenuItems`, `maxOrdersPerDay`
- **Expected**: Status `200`, returns:
  ```json
  {
    "canProceed": true,
    "currentUsage": 12,
    "limit": 25,
    "remaining": 13
  }
  ```

#### 7.4 Get Usage Stats
- **Request**: `GET /subscriptions/usage` (requires `{{restaurantToken}}`)
- **Expected**: Status `200`, breakdown of menu items, staff, orders usage

#### 7.5 Create Subscription
- **Request**: `POST /subscriptions/subscribe` (requires `{{restaurantToken}}`)
- **Plans**: FREE, BASIC, or PREMIUM
- **Body**:
  ```json
  {
    "plan": "BASIC",
    "paymentDetails": {
      "paymentId": "{{paymentId}}",
      "orderId": "{{razorpayOrderId}}",
      "signature": "signature_xxx"
    }
  }
  ```
- **Expected**: Status `201`, subscription active

#### 7.6 Cancel Subscription
- **Request**: `PUT /subscriptions/cancel`
- **Body**: Provide reason & feedback
- **Expected**: Status `200`, subscription cancelled

---

### **Phase 8: Staff Management (Restaurant)**

These require `{{restaurantToken}}`.

#### 8.1 Create Staff Invite
- **Request**: `POST /staff/invites`
- **Roles**: MANAGER, CHEF, DELIVERY, STAFF
- **Body**:
  ```json
  {
    "email": "chef@restaurant.com",
    "role": "CHEF"
  }
  ```
- **Expected**: Status `201`, returns `inviteToken` (save to `{{inviteToken}}`)

#### 8.2 Complete Staff Invite
- **Request**: `POST /staff/invites/{{inviteToken}}/complete`
- **Body**:
  ```json
  {
    "username": "John Chef",
    "password": "StaffPass123!"
  }
  ```
- **Expected**: Status `201`, staff account created (pending approval)

#### 8.3 List Staff Members
- **Request**: `GET /staff/members` (requires `{{restaurantToken}}`)
- **Expected**: Status `200`, all staff for this restaurant

#### 8.4 Approve Staff Member
- **Request**: `PUT /staff/members/{{staffId}}/approve` (requires `{{restaurantToken}}`)
- **Body**: `{ "approved": true }`
- **Expected**: Status `200`, staff activated

#### 8.5 Get Staff Profile
- **Request**: `GET /staff/profile` (requires `{{staffToken}}` from Phase 8.2)
- **Expected**: Status `200`, staff member's profile

#### 8.6 Get Pending Status Requests
- **Request**: `GET /staff/status-requests` (requires `{{restaurantToken}}`)
- **Expected**: Status `200`, list of pending status change requests from staff

#### 8.7 Approve Status Request
- **Request**: `PUT /staff/status-requests/{{statusRequestId}}/approve` (requires `{{restaurantToken}}`)
- **Expected**: Status `200`, order status updated as requested

---

### **Phase 9: Verification (Public)**

#### 9.1 Send Email Verification
- **Request**: `POST /verification/send-email`
- **Body**: `{ "email": "user@example.com" }`
- **Expected**: Status `200`, 6-digit code sent (check terminal/logs)

#### 9.2 Verify Email
- **Request**: `POST /verification/verify-email`
- **Body**: 
  ```json
  {
    "email": "user@example.com",
    "code": "123456"
  }
  ```
- **Expected**: Status `200`, email verified

---

### **Phase 10: Admin (Admin Role Only)**

Create an admin account via backend or direct database. Then use `{{adminToken}}`.

#### 10.1 Get Dashboard Stats
- **Request**: `GET /admin/stats` (requires `{{adminToken}}`)
- **Expected**: Status `200`, platform statistics

#### 10.2 Get All Users
- **Request**: `GET /admin/users?page=1&limit=20`
- **Expected**: Status `200`, paginated user list

#### 10.3 Get User By ID
- **Request**: `GET /admin/users/{{userId}}`
- **Expected**: Status `200`, detailed user info

#### 10.4 Update User Status
- **Request**: `PUT /admin/users/{{userId}}/status`
- **Valid Statuses**: `active`, `inactive`, `banned`
- **Body**: `{ "status": "banned" }`
- **Expected**: Status `200`

#### 10.5 Approve Restaurant
- **Request**: `PUT /admin/approve-restaurant/{{restaurantId}}`
- **Body**:
  ```json
  {
    "approved": true,
    "comments": "All docs verified"
  }
  ```
- **Expected**: Status `200`

#### 10.6 Get All Orders
- **Request**: `GET /admin/orders?page=1&limit=20`
- **Query**: Optional `status` filter
- **Expected**: Status `200`, all platform orders

#### 10.7 Analytics Endpoints
- **Revenue**: `GET /admin/analytics/revenue`
- **Order Distribution**: `GET /admin/analytics/orders-distribution`
- **Food Revenue**: `GET /admin/analytics/revenue/food`
- All return `200` with analytics data

---

## Testing Checklist

### Authentication
- [ ] Register User
- [ ] Register Restaurant
- [ ] Login User
- [ ] Login Restaurant
- [ ] Get User Profile
- [ ] Update User Profile

### Food Management
- [ ] Create Food Item
- [ ] Get All Foods
- [ ] Get Single Food
- [ ] Get My Foods (Restaurant)
- [ ] Update Food
- [ ] Toggle Availability
- [ ] Delete Food

### Cart & Orders
- [ ] Add to Cart
- [ ] View Cart
- [ ] Remove from Cart
- [ ] Place Order
- [ ] Get My Orders (User)
- [ ] Get Restaurant Orders

### Payments
- [ ] Create Razorpay Order
- [ ] Verify Payment

### Reviews
- [ ] Add Review
- [ ] Get Reviews
- [ ] Update Review
- [ ] Delete Review

### Subscriptions
- [ ] Get Plans
- [ ] Get My Subscription
- [ ] Check Feature Limit
- [ ] Get Usage Stats

### Staff
- [ ] Create Invite
- [ ] Complete Invite
- [ ] List Staff
- [ ] Approve Staff
- [ ] Get Status Requests
- [ ] Approve Request

### Admin
- [ ] Get Dashboard Stats
- [ ] List Users
- [ ] Update User Status
- [ ] Get Analytics

---

## Common Issues & Solutions

### Issue: 401 Unauthorized
**Cause**: Token expired or missing  
**Solution**: Re-login using Phase 1.3 or 1.4 to refresh token

### Issue: 403 Forbidden
**Cause**: User role doesn't have permission  
**Solution**: Ensure you're using correct token for endpoint:
- `{{token}}` for USER endpoints
- `{{restaurantToken}}` for RESTAURANT endpoints
- `{{staffToken}}` for STAFF endpoints
- `{{adminToken}}` for ADMIN endpoints

### Issue: 404 Not Found
**Cause**: Resource ID doesn't exist  
**Solution**: Verify `{{foodId}}`, `{{orderId}}`, etc. are populated

### Issue: Variables Not Auto-Populating
**Cause**: Test script in response didn't execute  
**Solution**: Manually set variables in Postman:
1. Click **Environments**
2. Edit active environment
3. Set `token`, `foodId`, etc. manually

### Issue: Cart/Order Not Found
**Cause**: Each user/restaurant has separate cart/orders  
**Solution**: Ensure you're logged in with correct user's token

---

## Pro Tips

1. **Run Tests in Order**: Start with Phase 1 (Auth) before jumping to Phase 3 (Orders)
2. **Use Pre-request Scripts**: Postman auto-populate vars from response tests
3. **Check Response Codes**: 200/201 = success, 400/401/403 = errors
4. **Save Your Postman Collection**: File → Export → Save `.json` locally
5. **Test Edge Cases**: Try invalid data (empty fields, wrong types, duplicates)
6. **Monitor Backend Logs**: Watch terminal for detailed error messages

---

## API Response Format

All responses follow this pattern:
```json
{
  "success": true/false,
  "message": "Description",
  "data": { ... },
  "error": { "code": "ERROR_CODE" }
}
```

Check the [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete request/response examples.

---

**Last Updated**: February 10, 2026  
**Status**: All endpoints tested and documented ✅
