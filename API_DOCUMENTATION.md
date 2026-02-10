# Order on the Go - API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Base URL](#api-base-url)
4. [Authentication Endpoints](#authentication-endpoints)
5. [User Management](#user-management)
6. [Food Management](#food-management)
7. [Cart Management](#cart-management)
8. [Order Management](#order-management)
9. [Payment Processing](#payment-processing)
10. [Reviews](#reviews)
11. [Admin Management](#admin-management)
12. [Restaurant Management](#restaurant-management)
13. [Staff Management](#staff-management)
14. [Subscriptions](#subscriptions)
15. [Verification](#verification)
16. [Error Handling](#error-handling)
17. [Status Codes](#status-codes)

---

## Overview

Order on the Go is a comprehensive food delivery and restaurant management platform. The API follows RESTful principles and uses JSON for request and response bodies.

**API Version:** 1.0  
**Technology Stack:** Node.js, Express, MongoDB  
**Authentication:** JWT (JSON Web Tokens)

---

## Authentication

### JWT Token Format
The API uses JWT tokens for authentication. After login, you'll receive a JWT token that must be included in all protected endpoints.

**Token Header:**
```
Authorization: Bearer <your_jwt_token>
```

### Token Expiration
Tokens are valid for a configurable duration. When expired, users must re-login.

### User Roles
The system supports the following user roles:
- `USER` - Regular customer
- `RESTAURANT` - Restaurant owner
- `STAFF` - Restaurant staff member
- `ADMIN` - System administrator

---

## API Base URL

```
http://localhost:5000/api
```

In production, replace with your production domain.

---

## Authentication Endpoints

### 1. User Registration

**Endpoint:** `POST /auth/register`  
**Authentication:** Not required  
**Description:** Register a new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+91-9876543210"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user_id_12345",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91-9876543210",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. User Login

**Endpoint:** `POST /auth/login`  
**Authentication:** Not required  
**Description:** Login with email and password

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_id_12345",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91-9876543210",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Get User Profile

**Endpoint:** `GET /auth/profile`  
**Authentication:** Required (USER, RESTAURANT, STAFF, ADMIN role)  
**Description:** Retrieve the authenticated user's profile information

**Response (Success - 200):**
```json
{
  "success": true,
  "user": {
    "id": "user_id_12345",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91-9876543210",
    "role": "USER",
    "profileImage": "https://cdn.example.com/profiles/user_id_12345.jpg",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 4. Update User Profile

**Endpoint:** `PUT /auth/profile`  
**Authentication:** Required (USER, RESTAURANT, STAFF, ADMIN role)  
**Description:** Update user's profile information

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+91-9876543211"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "user_id_12345",
    "name": "John Updated",
    "email": "john@example.com",
    "phone": "+91-9876543211",
    "role": "USER"
  }
}
```

---

### 5. Upload Profile Image

**Endpoint:** `POST /auth/profile/image`  
**Authentication:** Required (USER, RESTAURANT, STAFF, ADMIN role)  
**Content-Type:** `image/*` (image/jpeg, image/png, etc.)  
**Description:** Upload a profile image for the user

**Request:**
- Raw image data in request body
- Content-Type: image/jpeg (or other image type)
- Max file size: 5MB

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Profile image uploaded successfully",
  "imageUrl": "https://cdn.example.com/profiles/user_id_12345.jpg"
}
```

---

### 6. Delete Profile Image

**Endpoint:** `DELETE /auth/profile/image`  
**Authentication:** Required (USER, RESTAURANT, STAFF, ADMIN role)  
**Description:** Remove the user's profile image

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Profile image deleted successfully"
}
```

---

## User Management

### Get User Profile (via Auth)
See Authentication Endpoints section above.

---

## Food Management

### 1. Create Food Item

**Endpoint:** `POST /foods`  
**Authentication:** Required (RESTAURANT, STAFF role)  
**Description:** Add a new food item to the restaurant menu

**Request Body:**
```json
{
  "name": "Margherita Pizza",
  "description": "Classic Italian pizza with fresh mozzarella",
  "price": 299,
  "category": "Pizza",
  "image": "https://cdn.example.com/foods/pizza.jpg",
  "cuisine": "Italian",
  "isVegan": false,
  "isVegetarian": true,
  "spicyLevel": 2,
  "servingSize": "1 Large"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Food item created successfully",
  "food": {
    "id": "food_id_12345",
    "name": "Margherita Pizza",
    "description": "Classic Italian pizza with fresh mozzarella",
    "price": 299,
    "category": "Pizza",
    "cuisine": "Italian",
    "isVegan": false,
    "isVegetarian": true,
    "spicyLevel": 2,
    "servingSize": "1 Large",
    "restaurant": "restaurant_id_12345",
    "available": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Note:** Menu item limit is enforced based on restaurant's subscription plan.

---

### 2. Get All Foods

**Endpoint:** `GET /foods`  
**Authentication:** Not required  
**Description:** Retrieve all available food items from all restaurants

**Query Parameters:**
```
GET /foods?page=1&limit=10&category=Pizza&cuisine=Italian&sortBy=name&searchTerm=margherita
```

**Response (Success - 200):**
```json
{
  "success": true,
  "foods": [
    {
      "id": "food_id_12345",
      "name": "Margherita Pizza",
      "description": "Classic Italian pizza with fresh mozzarella",
      "price": 299,
      "category": "Pizza",
      "image": "https://cdn.example.com/foods/pizza.jpg",
      "cuisine": "Italian",
      "restaurant": {
        "id": "restaurant_id_12345",
        "name": "Pizza Palace"
      },
      "available": true,
      "averageRating": 4.5,
      "reviewCount": 25
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 45
  }
}
```

---

### 3. Get Foods by Restaurant

**Endpoint:** `GET /foods/restaurant/:id`  
**Authentication:** Not required  
**Description:** Get all food items from a specific restaurant

**Response (Success - 200):**
```json
{
  "success": true,
  "restaurant": "Pizza Palace",
  "foods": [
    {
      "id": "food_id_12345",
      "name": "Margherita Pizza",
      "price": 299,
      "image": "https://cdn.example.com/foods/pizza.jpg",
      "available": true,
      "averageRating": 4.5
    }
  ]
}
```

---

### 4. Get Single Food Item

**Endpoint:** `GET /foods/:id`  
**Authentication:** Not required  
**Description:** Get detailed information about a specific food item

**Response (Success - 200):**
```json
{
  "success": true,
  "food": {
    "id": "food_id_12345",
    "name": "Margherita Pizza",
    "description": "Classic Italian pizza with fresh mozzarella",
    "price": 299,
    "category": "Pizza",
    "image": "https://cdn.example.com/foods/pizza.jpg",
    "cuisine": "Italian",
    "isVegan": false,
    "isVegetarian": true,
    "spicyLevel": 2,
    "servingSize": "1 Large",
    "restaurant": {
      "id": "restaurant_id_12345",
      "name": "Pizza Palace",
      "image": "https://cdn.example.com/restaurants/pizza-palace.jpg"
    },
    "available": true,
    "reviews": [
      {
        "id": "review_id_12345",
        "user": "John Doe",
        "rating": 5,
        "comment": "Amazing pizza!",
        "createdAt": "2024-01-10T08:00:00Z"
      }
    ],
    "averageRating": 4.5,
    "reviewCount": 25
  }
}
```

---

### 5. Get Own Foods

**Endpoint:** `GET /foods/my-foods`  
**Authentication:** Required (RESTAURANT, STAFF role)  
**Description:** Retrieve all food items created by the current restaurant

**Response (Success - 200):**
```json
{
  "success": true,
  "foods": [
    {
      "id": "food_id_12345",
      "name": "Margherita Pizza",
      "price": 299,
      "category": "Pizza",
      "available": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 6. Update Food Item

**Endpoint:** `PUT /foods/:id`  
**Authentication:** Required (RESTAURANT role)  
**Description:** Update an existing food item

**Request Body:**
```json
{
  "name": "Margherita Pizza Premium",
  "price": 349,
  "description": "Premium classic Italian pizza with fresh mozzarella"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Food item updated successfully",
  "food": {
    "id": "food_id_12345",
    "name": "Margherita Pizza Premium",
    "price": 349,
    "description": "Premium classic Italian pizza with fresh mozzarella"
  }
}
```

---

### 7. Update Food Availability

**Endpoint:** `PUT /foods/:id/availability`  
**Authentication:** Required (RESTAURANT, STAFF role)  
**Description:** Toggle food item availability (in stock / out of stock)

**Request Body:**
```json
{
  "available": false
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Availability updated",
  "available": false
}
```

---

### 8. Delete Food Item

**Endpoint:** `DELETE /foods/:id`  
**Authentication:** Required (RESTAURANT role)  
**Description:** Remove a food item from the menu

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Food item deleted successfully"
}
```

---

## Cart Management

### 1. Add to Cart

**Endpoint:** `POST /cart`  
**Authentication:** Required (USER role)  
**Description:** Add a food item to the shopping cart

**Request Body:**
```json
{
  "foodId": "food_id_12345",
  "quantity": 2,
  "specialInstructions": "Extra cheese, light onions",
  "restaurantId": "restaurant_id_12345"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Item added to cart",
  "cart": {
    "id": "cart_id_12345",
    "user": "user_id_12345",
    "items": [
      {
        "id": "cart_item_12345",
        "food": {
          "id": "food_id_12345",
          "name": "Margherita Pizza",
          "price": 299,
          "image": "https://cdn.example.com/foods/pizza.jpg"
        },
        "quantity": 2,
        "subtotal": 598,
        "specialInstructions": "Extra cheese, light onions"
      }
    ],
    "restaurant": {
      "id": "restaurant_id_12345",
      "name": "Pizza Palace"
    },
    "totalPrice": 598,
    "itemCount": 2
  }
}
```

---

### 2. Get Cart

**Endpoint:** `GET /cart`  
**Authentication:** Required (USER role)  
**Description:** Retrieve the current user's shopping cart

**Response (Success - 200):**
```json
{
  "success": true,
  "cart": {
    "id": "cart_id_12345",
    "user": "user_id_12345",
    "items": [
      {
        "id": "cart_item_12345",
        "food": {
          "id": "food_id_12345",
          "name": "Margherita Pizza",
          "price": 299,
          "image": "https://cdn.example.com/foods/pizza.jpg"
        },
        "quantity": 2,
        "subtotal": 598,
        "specialInstructions": "Extra cheese, light onions"
      },
      {
        "id": "cart_item_12346",
        "food": {
          "id": "food_id_12346",
          "name": "Caesar Salad",
          "price": 199,
          "image": "https://cdn.example.com/foods/salad.jpg"
        },
        "quantity": 1,
        "subtotal": 199,
        "specialInstructions": ""
      }
    ],
    "restaurant": {
      "id": "restaurant_id_12345",
      "name": "Pizza Palace"
    },
    "totalPrice": 797,
    "itemCount": 3
  }
}
```

---

### 3. Remove from Cart

**Endpoint:** `DELETE /cart/:id`  
**Authentication:** Required (USER role)  
**Description:** Remove a specific item from the cart

**Path Parameters:**
- `id`: Cart item ID to remove

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Item removed from cart",
  "cart": {
    "totalPrice": 199,
    "itemCount": 1
  }
}
```

---

## Order Management

### 1. Place Order

**Endpoint:** `POST /orders`  
**Authentication:** Required (USER role)  
**Description:** Create a new order from the shopping cart

**Request Body:**
```json
{
  "deliveryAddress": "123 Main Street, Apartment 4B",
  "deliveryInstructions": "Ring doorbell twice",
  "paymentMethod": "ONLINE",
  "cityName": "New York"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "id": "order_id_12345",
    "user": "user_id_12345",
    "restaurant": {
      "id": "restaurant_id_12345",
      "name": "Pizza Palace"
    },
    "items": [
      {
        "food": {
          "id": "food_id_12345",
          "name": "Margherita Pizza"
        },
        "quantity": 2,
        "subtotal": 598
      }
    ],
    "totalPrice": 798,
    "deliveryFee": 1,
    "finalPrice": 799,
    "status": "PENDING",
    "deliveryAddress": "123 Main Street, Apartment 4B",
    "deliveryInstructions": "Ring doorbell twice",
    "paymentMethod": "ONLINE",
    "createdAt": "2024-01-15T10:30:00Z",
    "estimatedDeliveryTime": "30-45 minutes"
  }
}
```

---

### 2. Get User Orders

**Endpoint:** `GET /orders/my-orders`  
**Authentication:** Required (USER role)  
**Description:** Retrieve all orders placed by the current user

**Query Parameters:**
```
GET /orders/my-orders?status=DELIVERED&limit=10&page=1
```

**Response (Success - 200):**
```json
{
  "success": true,
  "orders": [
    {
      "id": "order_id_12345",
      "restaurant": {
        "id": "restaurant_id_12345",
        "name": "Pizza Palace"
      },
      "totalPrice": 799,
      "status": "DELIVERED",
      "createdAt": "2024-01-10T10:30:00Z",
      "deliveredAt": "2024-01-10T11:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 15
  }
}
```

---

### 3. Get Restaurant Orders

**Endpoint:** `GET /orders/restaurant`  
**Authentication:** Required (RESTAURANT, STAFF role)  
**Description:** Get all orders for the restaurant

**Query Parameters:**
```
GET /orders/restaurant?status=PREPARING&limit=20
```

**Response (Success - 200):**
```json
{
  "success": true,
  "orders": [
    {
      "id": "order_id_12345",
      "user": {
        "id": "user_id_12345",
        "name": "John Doe",
        "phone": "+91-9876543210"
      },
      "items": [
        {
          "food": {
            "name": "Margherita Pizza"
          },
          "quantity": 2
        }
      ],
      "status": "PREPARING",
      "totalPrice": 799,
      "deliveryAddress": "123 Main Street, Apartment 4B",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 4. Update Order Status

**Endpoint:** `PUT /orders/:id/status`  
**Authentication:** Required (RESTAURANT, STAFF role)  
**Description:** Update the status of an order

**Request Body:**
```json
{
  "status": "PREPARING"
}
```

**Valid Status Values:**
- `PENDING` - Order received but not yet accepted
- `PREPARING` - Restaurant is preparing the food
- `READY_FOR_PICKUP` - Food is ready
- `OUT_FOR_DELIVERY` - Order is being delivered
- `DELIVERED` - Order delivered successfully
- `CANCELLED` - Order cancelled

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "order": {
    "id": "order_id_12345",
    "status": "PREPARING",
    "updatedAt": "2024-01-15T10:35:00Z"
  }
}
```

---

### 5. Request Status Change (Staff)

**Endpoint:** `POST /orders/:id/status-request`  
**Authentication:** Required (STAFF role)  
**Description:** Staff member requests to change order status (needs approval from restaurant owner)

**Request Body:**
```json
{
  "requestedStatus": "READY_FOR_PICKUP",
  "reason": "Food is ready for delivery"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Status change request submitted",
  "request": {
    "id": "status_request_12345",
    "order": "order_id_12345",
    "requestedStatus": "READY_FOR_PICKUP",
    "reason": "Food is ready for delivery",
    "status": "PENDING",
    "createdAt": "2024-01-15T10:35:00Z"
  }
}
```

---

## Payment Processing

### 1. Create Razorpay Order

**Endpoint:** `POST /payment/create-order`  
**Authentication:** Required (USER role)  
**Description:** Create a Razorpay payment order (requires existing order in the system)

**Request Body:**
```json
{
  "orderId": "order_id_12345",
  "amount": 79900
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "razorpayOrder": {
    "id": "order_xxxxxxxxxx",
    "entity": "order",
    "amount": 79900,
    "amount_paid": 0,
    "amount_due": 79900,
    "currency": "INR",
    "receipt": "order_id_12345",
    "status": "created",
    "attempts": 0,
    "notes": {},
    "created_at": 1705315200
  }
}
```

---

### 2. Verify Payment

**Endpoint:** `POST /payment/verify`  
**Authentication:** Required (USER role)  
**Description:** Verify and process Razorpay payment response

**Request Body:**
```json
{
  "razorpay_order_id": "order_xxxxxxxxxx",
  "razorpay_payment_id": "pay_xxxxxxxxxx",
  "razorpay_signature": "signature_xxxxxxxxxxxxxx",
  "orderId": "order_id_12345"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Payment verified and processed successfully",
  "payment": {
    "id": "payment_id_12345",
    "order": "order_id_12345",
    "razorpayPaymentId": "pay_xxxxxxxxxx",
    "amount": 79900,
    "currency": "INR",
    "status": "COMPLETED",
    "createdAt": "2024-01-15T10:40:00Z"
  },
  "order": {
    "id": "order_id_12345",
    "status": "CONFIRMED",
    "paymentStatus": "PAID"
  }
}
```

---

## Reviews

### 1. Add Review

**Endpoint:** `POST /reviews`  
**Authentication:** Required (USER role)  
**Description:** Submit a review and rating for a food item

**Request Body:**
```json
{
  "foodId": "food_id_12345",
  "rating": 5,
  "comment": "Absolutely delicious! Best pizza I've had in a long time.",
  "deliveryExperience": 4
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Review added successfully",
  "review": {
    "id": "review_id_12345",
    "food": "food_id_12345",
    "user": {
      "id": "user_id_12345",
      "name": "John Doe"
    },
    "rating": 5,
    "comment": "Absolutely delicious! Best pizza I've had in a long time.",
    "deliveryExperience": 4,
    "createdAt": "2024-01-15T10:45:00Z"
  }
}
```

---

### 2. Get Food Reviews

**Endpoint:** `GET /reviews/food/:foodId`  
**Authentication:** Not required  
**Description:** Get all reviews for a specific food item

**Query Parameters:**
```
GET /reviews/food/food_id_12345?limit=10&page=1&sortBy=-createdAt
```

**Response (Success - 200):**
```json
{
  "success": true,
  "food": "food_id_12345",
  "reviews": [
    {
      "id": "review_id_12345",
      "user": {
        "id": "user_id_12345",
        "name": "John Doe"
      },
      "rating": 5,
      "comment": "Absolutely delicious!",
      "deliveryExperience": 4,
      "createdAt": "2024-01-15T10:45:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25
  }
}
```

---

### 3. Get Review Stats

**Endpoint:** `GET /reviews/food/:foodId/stats`  
**Authentication:** Not required  
**Description:** Get aggregated review statistics for a food item

**Response (Success - 200):**
```json
{
  "success": true,
  "stats": {
    "foodId": "food_id_12345",
    "averageRating": 4.6,
    "totalReviews": 25,
    "ratingsBreakdown": {
      "5": 15,
      "4": 8,
      "3": 2,
      "2": 0,
      "1": 0
    },
    "averageDeliveryExperience": 4.4
  }
}
```

---

### 4. Update Review

**Endpoint:** `PUT /reviews/:id`  
**Authentication:** Required (USER role)  
**Description:** Update a review comment or rating

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Good pizza, but a bit pricey"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Review updated successfully",
  "review": {
    "id": "review_id_12345",
    "rating": 4,
    "comment": "Good pizza, but a bit pricey",
    "updatedAt": "2024-01-15T10:50:00Z"
  }
}
```

---

### 5. Delete Review

**Endpoint:** `DELETE /reviews/:id`  
**Authentication:** Required (USER role)  
**Description:** Delete a review

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

## Admin Management

### 1. Get Dashboard Stats

**Endpoint:** `GET /admin/stats`  
**Authentication:** Required (ADMIN role)  
**Description:** Get overall platform statistics

**Response (Success - 200):**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 1250,
    "totalRestaurants": 85,
    "totalOrders": 3450,
    "totalRevenue": 5425000,
    "totalReviews": 2890,
    "activeRestaurants": 72,
    "pendingApprovals": 8,
    "monthlyGrowth": {
      "users": 12.5,
      "orders": 18.3,
      "revenue": 22.1
    }
  }
}
```

---

### 2. Get All Users

**Endpoint:** `GET /admin/users`  
**Authentication:** Required (ADMIN role)  
**Description:** List all users in the system

**Query Parameters:**
```
GET /admin/users?role=USER&status=ACTIVE&limit=20&page=1
```

**Response (Success - 200):**
```json
{
  "success": true,
  "users": [
    {
      "id": "user_id_12345",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+91-9876543210",
      "role": "USER",
      "status": "ACTIVE",
      "createdAt": "2024-01-10T08:00:00Z",
      "lastLogin": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 185
  }
}
```

---

### 3. Get User By ID

**Endpoint:** `GET /admin/users/:id`  
**Authentication:** Required (ADMIN role)  
**Description:** Get detailed information about a specific user

**Response (Success - 200):**
```json
{
  "success": true,
  "user": {
    "id": "user_id_12345",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91-9876543210",
    "role": "USER",
    "status": "ACTIVE",
    "profileImage": "https://cdn.example.com/profiles/user_id_12345.jpg",
    "totalOrders": 12,
    "totalSpent": 4500,
    "createdAt": "2024-01-10T08:00:00Z"
  }
}
```

---

### 4. Update User Status

**Endpoint:** `PUT /admin/users/:id/status`  
**Authentication:** Required (ADMIN role)  
**Description:** Update user status (ACTIVE, SUSPENDED, etc.)

**Request Body:**
```json
{
  "status": "SUSPENDED",
  "reason": "Violation of terms"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "User status updated",
  "user": {
    "id": "user_id_12345",
    "status": "SUSPENDED"
  }
}
```

---

### 5. Delete User

**Endpoint:** `DELETE /admin/users/:id`  
**Authentication:** Required (ADMIN role)  
**Description:** Delete a user account

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### 6. Approve Restaurant

**Endpoint:** `PUT /admin/approve-restaurant/:id`  
**Authentication:** Required (ADMIN role)  
**Description:** Approve a pending restaurant registration

**Request Body:**
```json
{
  "approved": true,
  "comments": "All documents verified"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Restaurant approved successfully",
  "restaurant": {
    "id": "restaurant_id_12345",
    "name": "Pizza Palace",
    "status": "APPROVED"
  }
}
```

---

### 7. Get All Orders

**Endpoint:** `GET /admin/orders`  
**Authentication:** Required (ADMIN role)  
**Description:** List all orders across the platform

**Query Parameters:**
```
GET /admin/orders?status=DELIVERED&limit=20&page=1&sortBy=-createdAt
```

**Response (Success - 200):**
```json
{
  "success": true,
  "orders": [
    {
      "id": "order_id_12345",
      "user": {
        "id": "user_id_12345",
        "name": "John Doe"
      },
      "restaurant": {
        "id": "restaurant_id_12345",
        "name": "Pizza Palace"
      },
      "totalPrice": 799,
      "status": "DELIVERED",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 8. Get Revenue Analytics

**Endpoint:** `GET /admin/analytics/revenue`  
**Authentication:** Required (ADMIN role)  
**Description:** Get revenue statistics and trends

**Response (Success - 200):**
```json
{
  "success": true,
  "analytics": {
    "totalRevenue": 5425000,
    "monthlyRevenue": [
      {
        "month": "January 2024",
        "revenue": 850000
      }
    ],
    "dailyRevenue": [
      {
        "date": "2024-01-15",
        "revenue": 25000
      }
    ]
  }
}
```

---

### 9. Get Order Distribution

**Endpoint:** `GET /admin/analytics/orders-distribution`  
**Authentication:** Required (ADMIN role)  
**Description:** Get order status distribution analytics

**Response (Success - 200):**
```json
{
  "success": true,
  "distribution": {
    "PENDING": 45,
    "PREPARING": 32,
    "READY_FOR_PICKUP": 18,
    "OUT_FOR_DELIVERY": 12,
    "DELIVERED": 3447,
    "CANCELLED": 8
  }
}
```

---

### 10. Get Food Revenue Analytics

**Endpoint:** `GET /admin/analytics/revenue/food`  
**Authentication:** Required (ADMIN role)  
**Description:** Get revenue by food item

**Response (Success - 200):**
```json
{
  "success": true,
  "foodRevenue": [
    {
      "foodId": "food_id_12345",
      "name": "Margherita Pizza",
      "totalOrders": 145,
      "totalRevenue": 43455,
      "averagePrice": 299
    }
  ]
}
```

---

### 11. Get Admin Profile

**Endpoint:** `GET /admin/profile`  
**Authentication:** Required (ADMIN role)  
**Description:** Get the admin's profile information

**Response (Success - 200):**
```json
{
  "success": true,
  "admin": {
    "id": "admin_id_12345",
    "name": "Admin User",
    "email": "admin@example.com",
    "phone": "+91-9876543210",
    "role": "ADMIN",
    "profileImage": "https://cdn.example.com/profiles/admin_id_12345.jpg"
  }
}
```

---

### 12. Update Admin Profile

**Endpoint:** `PUT /admin/profile`  
**Authentication:** Required (ADMIN role)  
**Description:** Update admin's profile information

**Request Body:**
```json
{
  "name": "Admin Updated",
  "phone": "+91-9876543211"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Admin profile updated successfully"
}
```

---

## Restaurant Management

### 1. Get All Restaurants

**Endpoint:** `GET /restaurants`  
**Authentication:** Not required  
**Description:** List all approved restaurants

**Query Parameters:**
```
GET /restaurants?cuisine=Italian&city=NewYork&limit=10&page=1&searchTerm=pizza
```

**Response (Success - 200):**
```json
{
  "success": true,
  "restaurants": [
    {
      "id": "restaurant_id_12345",
      "name": "Pizza Palace",
      "description": "Authentic Italian pizzeria",
      "cuisines": ["Italian", "Mediterranean"],
      "image": "https://cdn.example.com/restaurants/pizza-palace.jpg",
      "deliveryTime": "30-45 minutes",
      "deliveryFee": 50,
      "rating": 4.7,
      "reviewCount": 245,
      "isOpen": true,
      "address": "123 Main Street"
    }
  ]
}
```

---

### 2. Get Restaurant Profile

**Endpoint:** `GET /restaurants/profile`  
**Authentication:** Required (RESTAURANT role)  
**Description:** Get the restaurant owner's profile

**Response (Success - 200):**
```json
{
  "success": true,
  "restaurant": {
    "id": "restaurant_id_12345",
    "name": "Pizza Palace",
    "description": "Authentic Italian pizzeria",
    "cuisines": ["Italian", "Mediterranean"],
    "address": "123 Main Street",
    "city": "New York",
    "phone": "+1-2125551234",
    "email": "owner@pizzapalace.com",
    "image": "https://cdn.example.com/restaurants/pizza-palace.jpg",
    "licenseNumber": "REST123456",
    "status": "APPROVED",
    "owner": {
      "id": "user_id_12345",
      "name": "Pizza Owner",
      "email": "owner@example.com"
    }
  }
}
```

---

### 3. Update Restaurant Profile

**Endpoint:** `PUT /restaurants/profile`  
**Authentication:** Required (RESTAURANT role)  
**Description:** Update restaurant details

**Request Body:**
```json
{
  "description": "Premium Italian restaurant with wood-fired oven",
  "cuisines": ["Italian", "Mediterranean"],
  "phone": "+1-2125551234",
  "address": "456 Broadway"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Restaurant profile updated successfully"
}
```

---

### 4. Upload Restaurant Profile Image

**Endpoint:** `POST /restaurants/profile/image`  
**Authentication:** Required (RESTAURANT role)  
**Content-Type:** `image/*`  
**Description:** Upload restaurant images

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "imageUrl": "https://cdn.example.com/restaurants/pizza-palace.jpg"
}
```

---

### 5. Delete Restaurant Profile Image

**Endpoint:** `DELETE /restaurants/profile/image`  
**Authentication:** Required (RESTAURANT role)  
**Description:** Remove restaurant image

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

---

## Staff Management

### 1. Create Staff Invite

**Endpoint:** `POST /staff/invites`  
**Authentication:** Required (RESTAURANT role)  
**Description:** Send an invitation to a staff member

**Request Body:**
```json
{
  "email": "staff@example.com",
  "name": "John Staff",
  "phone": "+91-9876543210",
  "role": "KITCHEN_STAFF"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "invite": {
    "id": "invite_id_12345",
    "email": "staff@example.com",
    "status": "PENDING",
    "inviteToken": "token_xxxxxxxxxx",
    "inviteLink": "https://orderonthego.com/staff-invite/token_xxxxxxxxxx"
  }
}
```

---

### 2. Complete Staff Invite

**Endpoint:** `POST /staff/invites/:token/complete`  
**Authentication:** Not required  
**Description:** Complete staff registration with invite token

**Request Body:**
```json
{
  "password": "securePassword123",
  "phone": "+91-9876543210"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Staff account created successfully",
  "user": {
    "id": "staff_id_12345",
    "name": "John Staff",
    "email": "staff@example.com",
    "role": "STAFF",
    "status": "PENDING_APPROVAL"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. List Staff Members

**Endpoint:** `GET /staff/members`  
**Authentication:** Required (RESTAURANT role)  
**Description:** Get all staff members of the restaurant

**Response (Success - 200):**
```json
{
  "success": true,
  "staff": [
    {
      "id": "staff_id_12345",
      "name": "John Staff",
      "email": "staff@example.com",
      "phone": "+91-9876543210",
      "status": "ACTIVE",
      "joinedAt": "2024-01-10T08:00:00Z",
      "profileImage": "https://cdn.example.com/profiles/staff_id_12345.jpg"
    }
  ]
}
```

---

### 4. Approve Staff Member

**Endpoint:** `PUT /staff/members/:id/approve`  
**Authentication:** Required (RESTAURANT role)  
**Description:** Approve a pending staff member

**Request Body:**
```json
{
  "approved": true
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Staff approved successfully",
  "staff": {
    "id": "staff_id_12345",
    "status": "ACTIVE"
  }
}
```

---

### 5. Get Staff Profile

**Endpoint:** `GET /staff/profile`  
**Authentication:** Required (STAFF role)  
**Description:** Get the staff member's profile

**Response (Success - 200):**
```json
{
  "success": true,
  "staff": {
    "id": "staff_id_12345",
    "name": "John Staff",
    "email": "staff@example.com",
    "phone": "+91-9876543210",
    "restaurant": {
      "id": "restaurant_id_12345",
      "name": "Pizza Palace"
    },
    "status": "ACTIVE",
    "profileImage": "https://cdn.example.com/profiles/staff_id_12345.jpg",
    "joinedAt": "2024-01-10T08:00:00Z"
  }
}
```

---

### 6. Update Staff Profile

**Endpoint:** `PUT /staff/profile`  
**Authentication:** Required (STAFF role)  
**Description:** Update staff profile information

**Request Body:**
```json
{
  "phone": "+91-9876543211",
  "name": "John Updated"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Staff profile updated"
}
```

---

### 7. Get Pending Status Requests

**Endpoint:** `GET /staff/status-requests`  
**Authentication:** Required (RESTAURANT role)  
**Description:** Get pending order status change requests from staff

**Response (Success - 200):**
```json
{
  "success": true,
  "requests": [
    {
      "id": "status_request_12345",
      "order": {
        "id": "order_id_12345",
        "user": "John Doe"
      },
      "requestedStatus": "READY_FOR_PICKUP",
      "reason": "Food is ready for delivery",
      "staff": {
        "id": "staff_id_12345",
        "name": "John Staff"
      },
      "status": "PENDING",
      "createdAt": "2024-01-15T10:35:00Z"
    }
  ]
}
```

---

### 8. Approve Status Request

**Endpoint:** `PUT /staff/status-requests/:id/approve`  
**Authentication:** Required (RESTAURANT role)  
**Description:** Approve a staff status change request

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Status request approved",
  "order": {
    "id": "order_id_12345",
    "status": "READY_FOR_PICKUP"
  }
}
```

---

### 9. Reject Status Request

**Endpoint:** `PUT /staff/status-requests/:id/reject`  
**Authentication:** Required (RESTAURANT role)  
**Description:** Reject a staff status change request

**Request Body:**
```json
{
  "reason": "Not ready yet, needs 5 more minutes"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Status request rejected"
}
```

---

## Subscriptions

### 1. Get Subscription Plans

**Endpoint:** `GET /subscriptions/plans`  
**Authentication:** Not required  
**Description:** Get all available subscription plans

**Response (Success - 200):**
```json
{
  "success": true,
  "plans": [
    {
      "id": "plan_basic",
      "name": "Basic",
      "price": 499,
      "billingCycle": "monthly",
      "features": {
        "maxMenuItems": 50,
        "maxStaffMembers": 2,
        "analytics": false,
        "prioritySupport": false
      },
      "description": "Perfect for small restaurants"
    },
    {
      "id": "plan_pro",
      "name": "Professional",
      "price": 1299,
      "billingCycle": "monthly",
      "features": {
        "maxMenuItems": 200,
        "maxStaffMembers": 10,
        "analytics": true,
        "prioritySupport": true
      },
      "description": "For growing restaurants"
    },
    {
      "id": "plan_enterprise",
      "name": "Enterprise",
      "price": 3999,
      "billingCycle": "monthly",
      "features": {
        "maxMenuItems": "unlimited",
        "maxStaffMembers": "unlimited",
        "analytics": true,
        "prioritySupport": true,
        "customBranding": true
      },
      "description": "For large restaurant chains"
    }
  ]
}
```

---

### 2. Get My Subscription

**Endpoint:** `GET /subscriptions/my-subscription`  
**Authentication:** Required (RESTAURANT role)  
**Description:** Get the restaurant's current subscription

**Response (Success - 200):**
```json
{
  "success": true,
  "subscription": {
    "id": "subscription_id_12345",
    "plan": {
      "id": "plan_pro",
      "name": "Professional"
    },
    "status": "ACTIVE",
    "startDate": "2024-01-01T00:00:00Z",
    "renewalDate": "2024-02-01T00:00:00Z",
    "price": 1299,
    "features": {
      "maxMenuItems": 200,
      "currentMenuItems": 45,
      "maxStaffMembers": 10,
      "currentStaffMembers": 3,
      "analytics": true,
      "prioritySupport": true
    }
  }
}
```

---

### 3. Create Subscription

**Endpoint:** `POST /subscriptions/subscribe`  
**Authentication:** Required (RESTAURANT role)  
**Description:** Subscribe to a plan

**Request Body:**
```json
{
  "planId": "plan_pro",
  "paymentMethodId": "payment_method_12345"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "subscription": {
    "id": "subscription_id_12345",
    "plan": "plan_pro",
    "status": "ACTIVE",
    "startDate": "2024-01-15T10:30:00Z"
  }
}
```

---

### 4. Cancel Subscription

**Endpoint:** `PUT /subscriptions/cancel`  
**Authentication:** Required (RESTAURANT role)  
**Description:** Cancel the restaurant's subscription

**Request Body:**
```json
{
  "reason": "Switching to competitor",
  "feedback": "Pricing was too high"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "subscription": {
    "id": "subscription_id_12345",
    "status": "CANCELLED",
    "cancelledAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 5. Check Feature Limit

**Endpoint:** `GET /subscriptions/check-limit/:featureName`  
**Authentication:** Required (RESTAURANT role)  
**Description:** Check if restaurant has reached feature limit

**Path Parameters:**
- `featureName`: `menuItems`, `staffMembers`

**Response (Success - 200):**
```json
{
  "success": true,
  "feature": "menuItems",
  "limit": 200,
  "current": 45,
  "remaining": 155,
  "hasReachedLimit": false
}
```

---

### 6. Get Usage Stats

**Endpoint:** `GET /subscriptions/usage`  
**Authentication:** Required (RESTAURANT role)  
**Description:** Get subscription usage statistics

**Response (Success - 200):**
```json
{
  "success": true,
  "usage": {
    "menuItems": {
      "limit": 200,
      "used": 45,
      "percentage": 22.5
    },
    "staffMembers": {
      "limit": 10,
      "used": 3,
      "percentage": 30
    },
    "orders": {
      "monthlyLimit": 1000,
      "monthlyUsed": 235,
      "percentage": 23.5
    }
  }
}
```

---

## Verification

### 1. Send Email Verification

**Endpoint:** `POST /verification/send-email`  
**Authentication:** Not required  
**Description:** Send email verification code

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Verification code sent to email",
  "verificationId": "verification_id_12345"
}
```

---

### 2. Verify Email

**Endpoint:** `POST /verification/verify-email`  
**Authentication:** Not required  
**Description:** Verify email with code

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "verified": true
}
```

---

### 3. Send Phone Verification

**Endpoint:** `POST /verification/send-phone`  
**Authentication:** Not required  
**Description:** Send phone verification code via SMS

**Request Body:**
```json
{
  "phone": "+91-9876543210"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Verification code sent to phone",
  "verificationId": "verification_id_12345"
}
```

---

### 4. Verify Phone

**Endpoint:** `POST /verification/verify-phone`  
**Authentication:** Not required  
**Description:** Verify phone with code

**Request Body:**
```json
{
  "phone": "+91-9876543210",
  "code": "123456"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Phone verified successfully",
  "verified": true
}
```

---

### 5. Resend Verification

**Endpoint:** `POST /verification/resend`  
**Authentication:** Not required  
**Description:** Resend verification code

**Request Body:**
```json
{
  "email": "user@example.com",
  "type": "email"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Verification code resent",
  "verificationId": "verification_id_12345"
}
```

---

## Error Handling

The API returns error responses in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_CREDENTIALS` | 401 | Invalid email or password |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `UNAUTHORIZED` | 403 | User doesn't have permission |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `DUPLICATE_EMAIL` | 409 | Email already exists |
| `INSUFFICIENT_BALANCE` | 402 | Insufficient account balance |
| `ITEM_OUT_OF_STOCK` | 400 | Food item is out of stock |
| `ORDER_NOT_FOUND` | 404 | Order doesn't exist |
| `PAYMENT_FAILED` | 402 | Payment processing failed |
| `SUBSCRIPTION_LIMIT_REACHED` | 429 | Feature limit reached |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK - Request successful |
| `201` | Created - Resource created successfully |
| `400` | Bad Request - Invalid request data |
| `401` | Unauthorized - Authentication required |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - Resource already exists |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error - Server error |

---

## Request/Response Examples

### Image Upload Example

For image uploads, send the raw image file as the request body:

```bash
curl -X POST http://localhost:5000/api/auth/profile/image \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: image/jpeg" \
  --data-binary @/path/to/image.jpg
```

### Pagination

For endpoints that support pagination:

```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 45,
    "limit": 10
  }
}
```

Use query parameters for pagination:
```
GET /api/endpoint?page=1&limit=10
```

---

## Best Practices

1. **Always include authentication token** for protected endpoints
2. **Validate request data** before sending
3. **Handle errors gracefully** with appropriate try-catch blocks
4. **Implement rate limiting** to prevent abuse
5. **Use environment variables** for API base URLs
6. **Keep tokens secure** and never expose them
7. **Implement token refresh** for long-running sessions
8. **Log API errors** for debugging purposes
9. **Use request IDs** for tracking issues
10. **Test with different user roles** to ensure proper authorization

---

## Support & Documentation

For additional help or to report issues:
- **Email:** support@orderonthego.com
- **Documentation:** https://docs.orderonthego.com
- **Status Page:** https://status.orderonthego.com

---

**Last Updated:** February 10, 2026  
**API Version:** 1.0
