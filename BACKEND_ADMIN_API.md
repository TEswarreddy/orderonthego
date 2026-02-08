# Admin Dashboard Backend API Documentation

## Base URL
```
http://localhost:5000/api/admin
```

## Authentication
All endpoints require:
- JWT token in `Authorization` header: `Bearer <token>`
- User must have `ADMIN` role

## Endpoints

### Dashboard Statistics
**GET** `/admin/stats`
- Returns: Dashboard statistics (total orders, users, revenue, pending orders, etc.)
- Response:
```json
{
  "totalUsers": 150,
  "totalOrders": 42,
  "totalRevenue": 15250,
  "pendingOrders": 5,
  "deliveredToday": 8,
  "avgOrderValue": 363,
  "conversionRate": "28.00"
}
```

### Users Management

#### Get All Users
**GET** `/admin/users?page=1&limit=10&search=john`
- Query Parameters:
  - `page`: Page number (default: 1)
  - `limit`: Records per page (default: 10)
  - `search`: Search by username or email
- Response:
```json
{
  "users": [
    {
      "_id": "user_id",
      "username": "john",
      "email": "john@example.com",
      "userType": "USER",
      "status": "active",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 150,
  "pages": 15,
  "currentPage": 1
}
```

#### Get User by ID
**GET** `/admin/users/:id`
- Response: Single user object

#### Update User Status
**PUT** `/admin/users/:id/status`
- Body: `{ "status": "active|inactive|banned" }`
- Response: Updated user object

#### Delete User
**DELETE** `/admin/users/:id`
- Response: `{ "message": "User deleted successfully" }`

### Orders Management

#### Get All Orders
**GET** `/admin/orders?page=1&limit=10&status=all&search=term`
- Query Parameters:
  - `page`: Page number (default: 1)
  - `limit`: Records per page (default: 10)
  - `status`: Filter by status (all, PLACED, PREPARING, OUT_FOR_DELIVERY, DELIVERED)
  - `search`: Search by order ID or address
- Response:
```json
{
  "orders": [
    {
      "_id": "order_id",
      "userId": { "username": "john", "email": "john@example.com" },
      "restaurantId": "restaurant_id",
      "items": [...],
      "address": "123 Main St",
      "totalAmount": 250,
      "status": "PLACED",
      "paymentStatus": "PAID",
      "createdAt": "2024-02-08T10:00:00Z"
    }
  ],
  "total": 42,
  "pages": 5,
  "currentPage": 1
}
```

#### Get Order by ID
**GET** `/admin/orders/:id`
- Response: Single order object with populated user and restaurant details

#### Update Order Status
**PUT** `/admin/orders/:id/status`
- Body: `{ "status": "PLACED|PREPARING|OUT_FOR_DELIVERY|DELIVERED" }`
- Response: Updated order object

#### Delete Order
**DELETE** `/admin/orders/:id`
- Response: `{ "message": "Order deleted successfully" }`

### Restaurant Management

#### Approve Restaurant
**PUT** `/admin/approve-restaurant/:id`
- Response: `{ "message": "Restaurant approved successfully" }`

### Analytics

#### Revenue Analytics
**GET** `/admin/analytics/revenue`
- Returns: Last 7 days revenue data
- Response:
```json
[
  { "date": "2024-02-01", "revenue": 5200 },
  { "date": "2024-02-02", "revenue": 4800 },
  ...
]
```

#### Order Distribution
**GET** `/admin/analytics/orders-distribution`
- Returns: Order count by status
- Response:
```json
[
  { "status": "PLACED", "count": 5 },
  { "status": "PREPARING", "count": 3 },
  { "status": "OUT_FOR_DELIVERY", "count": 2 },
  { "status": "DELIVERED", "count": 32 }
]
```

## Error Responses

### 401 Unauthorized
```json
{ "message": "Not authorized" }
```

### 403 Forbidden
```json
{ "message": "Access denied" }
```

### 404 Not Found
```json
{ "message": "User/Order not found" }
```

### 500 Server Error
```json
{ "message": "Failed to [operation]", "error": "error details" }
```

## Status Constants

### User Statuses
- `active` - User is active
- `inactive` - User account is inactive
- `banned` - User is banned from platform

### Order Statuses
- `PLACED` - Order just placed
- `PREPARING` - Restaurant is preparing order
- `OUT_FOR_DELIVERY` - Order is with delivery person
- `DELIVERED` - Order delivered successfully

## Implementation Notes

1. **User Model** - Updated with `status` field (active, inactive, banned)
2. **Order Model** - Uses uppercase status values
3. **Auth Middleware** - Protects all admin endpoints, checks for ADMIN role
4. **Pagination** - All list endpoints support pagination with page and limit
5. **Search** - Search functionality implemented for users and orders
6. **Filtering** - Orders can be filtered by status

## Usage Example

```javascript
// Get dashboard stats
const stats = await axios.get('/admin/stats', {
  headers: { Authorization: `Bearer ${token}` }
});

// Get paginated orders with status filter
const orders = await axios.get('/admin/orders', {
  params: { page: 1, limit: 10, status: 'PLACED' },
  headers: { Authorization: `Bearer ${token}` }
});

// Update order status
await axios.put(`/admin/orders/${orderId}/status`, 
  { status: 'DELIVERED' },
  { headers: { Authorization: `Bearer ${token}` } }
);
```
