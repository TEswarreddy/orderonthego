# Order on the Go - Database Schema

## Overview

This document describes the MongoDB schema used by the Order on the Go backend. The backend uses Mongoose models with schema validation, references, and indexes.

**Database:** MongoDB
**ODM:** Mongoose

---

## Collections Summary

- `users`
- `restaurants`
- `foods`
- `carts`
- `orders`
- `payments`
- `reviews`
- `staffinvites`
- `subscriptions`
- `orderstatusrequests`

---

## Relationships (High Level)

- A `User` can be a CUSTOMER, RESTAURANT owner, STAFF, or ADMIN.
- A `Restaurant` belongs to a restaurant owner (`User`).
- A `Food` item belongs to a `Restaurant`.
- A `Cart` belongs to a `User` and contains `Food` items.
- An `Order` belongs to a `User` and a `Restaurant` and can reference a `Payment`.
- A `Payment` references a `User`, `Restaurant`, and optionally an `Order`.
- A `Review` belongs to a `User` and a `Food` item.
- A `StaffInvite` references the inviting `User` and a `Restaurant` (owner user).
- A `Subscription` belongs to a restaurant owner (`User`).
- An `OrderStatusRequest` references `Order` and `User` for audit and approval flow.

---

## User (users)

**Model:** `User`

### Fields
| Field | Type | Required | Default | Notes |
|------|------|----------|---------|------|
| `username` | String | Yes | - | Display name |
| `email` | String | Yes | - | Unique; login identity |
| `password` | String | Yes | - | Hashed password |
| `phone` | String | No | - | Phone number |
| `address` | String | No | - | Address text |
| `profileImage` | String | No | - | URL/path of profile image |
| `profileImageBuffer` | Buffer | No | - | Binary image storage |
| `profileImageMimeType` | String | No | - | Image content type |
| `emailVerified` | Boolean | No | `false` | Email verification state |
| `phoneVerified` | Boolean | No | `false` | Phone verification state |
| `emailVerificationToken` | String | No | - | Email OTP/token |
| `phoneVerificationToken` | String | No | - | Phone OTP/token |
| `verificationTokenExpiry` | Date | No | - | Token expiry time |
| `userType` | String | No | `USER` | Enum: `USER`, `RESTAURANT`, `ADMIN`, `STAFF` |
| `staffRole` | String | No | - | Enum: `MANAGER`, `CHEF`, `DELIVERY`, `STAFF` |
| `restaurantId` | ObjectId | No | - | Ref: `User` (owner for staff) |
| `invitedBy` | ObjectId | No | - | Ref: `User` (inviter) |
| `status` | String | No | `active` | Enum: `active`, `inactive`, `banned` |
| `approval` | Boolean | No | `true` | Approval flag (restaurants/staff) |
| `createdAt` | Date | Auto | - | Created timestamp |
| `updatedAt` | Date | Auto | - | Updated timestamp |

### Indexes
- `email` is unique

---

## Restaurant (restaurants)

**Model:** `Restaurant`

### Fields
| Field | Type | Required | Default | Notes |
|------|------|----------|---------|------|
| `ownerId` | ObjectId | Yes | - | Ref: `User` (restaurant owner) |
| `title` | String | Yes | - | Restaurant name |
| `address` | String | Yes | - | Address text |
| `phone` | String | No | - | Contact number |
| `cuisineType` | String | No | - | Cuisine label |
| `description` | String | No | - | Restaurant description |
| `mainImg` | String | No | - | Main image URL/path |
| `profileImage` | String | No | - | Profile image URL/path |
| `profileImageBuffer` | Buffer | No | - | Binary image storage |
| `profileImageMimeType` | String | No | - | Image content type |
| `menu` | Array | No | - | Additional menu data |
| `status` | String | No | `pending` | Enum: `pending`, `approved` |
| `createdAt` | Date | Auto | - | Created timestamp |
| `updatedAt` | Date | Auto | - | Updated timestamp |

---

## Food (foods)

**Model:** `Food`

### Fields
| Field | Type | Required | Default | Notes |
|------|------|----------|---------|------|
| `restaurantId` | ObjectId | Yes | - | Ref: `Restaurant` |
| `title` | String | Yes | - | Food name |
| `description` | String | No | - | Food description |
| `mainImg` | String | No | - | Food image URL/path |
| `menuType` | String | No | - | Menu type/category grouping |
| `category` | String | No | - | Category (e.g. Pizza) |
| `price` | Number | Yes | - | Base price |
| `discount` | Number | No | `0` | Discount amount |
| `rating` | Number | No | `0` | Aggregated rating |
| `isAvailable` | Boolean | No | `true` | Availability flag |
| `createdAt` | Date | Auto | - | Created timestamp |
| `updatedAt` | Date | Auto | - | Updated timestamp |

---

## Cart (carts)

**Model:** `Cart`

### Fields
| Field | Type | Required | Default | Notes |
|------|------|----------|---------|------|
| `userId` | ObjectId | Yes | - | Ref: `User` |
| `restaurantId` | ObjectId | No | - | Ref: `Restaurant` |
| `items` | Array | No | - | Cart item list |
| `items[].foodId` | ObjectId | No | - | Ref: `Food` |
| `items[].itemName` | String | No | - | Cached food name |
| `items[].itemImg` | String | No | - | Cached food image |
| `items[].quantity` | Number | No | - | Quantity |
| `items[].price` | Number | No | - | Unit price |
| `items[].discount` | Number | No | - | Discount |
| `createdAt` | Date | Auto | - | Created timestamp |
| `updatedAt` | Date | Auto | - | Updated timestamp |

---

## Order (orders)

**Model:** `Order`

### Fields
| Field | Type | Required | Default | Notes |
|------|------|----------|---------|------|
| `userId` | ObjectId | Yes | - | Ref: `User` |
| `restaurantId` | ObjectId | Yes | - | Ref: `Restaurant` |
| `items` | Array | No | - | Ordered items |
| `items[].foodId` | ObjectId | No | - | Food id |
| `items[].title` | String | No | - | Food title snapshot |
| `items[].image` | String | No | - | Food image snapshot |
| `items[].quantity` | Number | No | - | Quantity |
| `items[].price` | Number | No | - | Unit price |
| `address` | String | No | - | Delivery address |
| `paymentMethod` | String | No | - | Payment method label |
| `totalAmount` | Number | No | - | Order total |
| `status` | String | No | `PLACED` | Enum: `PLACED`, `PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `OUT_FOR_DELIVERY`, `DELIVERED` |
| `paymentId` | ObjectId | No | - | Ref: `Payment` |
| `paymentStatus` | String | No | `PENDING` | Enum: `PENDING`, `PAID`, `FAILED` |
| `createdAt` | Date | Auto | - | Created timestamp |
| `updatedAt` | Date | Auto | - | Updated timestamp |

---

## Payment (payments)

**Model:** `Payment`

### Fields
| Field | Type | Required | Default | Notes |
|------|------|----------|---------|------|
| `userId` | ObjectId | Yes | - | Ref: `User` |
| `orderId` | ObjectId | No | `null` | Ref: `Order` |
| `restaurantId` | ObjectId | Yes | - | Ref: `Restaurant` |
| `amount` | Number | Yes | - | Amount paid |
| `currency` | String | No | `INR` | Currency code |
| `paymentMethod` | String | Yes | - | Enum: `RAZORPAY`, `STRIPE`, `COD` |
| `gatewayOrderId` | String | No | - | Gateway order id |
| `gatewayPaymentId` | String | No | - | Gateway payment id |
| `gatewaySignature` | String | No | - | Gateway signature |
| `paymentStatus` | String | No | `CREATED` | Enum: `CREATED`, `SUCCESS`, `FAILED`, `REFUNDED` |
| `paidAt` | Date | No | - | Payment timestamp |
| `meta` | Object | No | - | Additional metadata |
| `createdAt` | Date | Auto | - | Created timestamp |
| `updatedAt` | Date | Auto | - | Updated timestamp |

---

## Review (reviews)

**Model:** `Review`

### Fields
| Field | Type | Required | Default | Notes |
|------|------|----------|---------|------|
| `foodId` | ObjectId | Yes | - | Ref: `Food` |
| `userId` | ObjectId | Yes | - | Ref: `User` |
| `rating` | Number | Yes | - | Min 1, Max 5 |
| `comment` | String | Yes | - | Trimmed comment |
| `createdAt` | Date | Auto | - | Created timestamp |
| `updatedAt` | Date | Auto | - | Updated timestamp |

### Indexes
- Unique compound index on `(foodId, userId)` to prevent duplicate reviews per user per food

---

## StaffInvite (staffinvites)

**Model:** `StaffInvite`

### Fields
| Field | Type | Required | Default | Notes |
|------|------|----------|---------|------|
| `email` | String | Yes | - | Lowercased and trimmed |
| `restaurantId` | ObjectId | Yes | - | Ref: `User` (owner) |
| `role` | String | Yes | - | Enum: `MANAGER`, `CHEF`, `DELIVERY`, `STAFF` |
| `token` | String | Yes | - | Unique invite token |
| `status` | String | No | `PENDING` | Enum: `PENDING`, `ACCEPTED`, `EXPIRED` |
| `invitedBy` | ObjectId | Yes | - | Ref: `User` (inviter) |
| `expiresAt` | Date | Yes | - | Expiration time |
| `acceptedAt` | Date | No | - | Accepted time |
| `createdAt` | Date | Auto | - | Created timestamp |
| `updatedAt` | Date | Auto | - | Updated timestamp |

### Indexes
- `token` is unique

---

## Subscription (subscriptions)

**Model:** `Subscription`

### Fields
| Field | Type | Required | Default | Notes |
|------|------|----------|---------|------|
| `restaurantId` | ObjectId | Yes | - | Ref: `User` (owner); unique |
| `plan` | String | Yes | `FREE` | Enum: `FREE`, `BASIC`, `PREMIUM` |
| `status` | String | Yes | `ACTIVE` | Enum: `ACTIVE`, `EXPIRED`, `CANCELLED`, `PENDING` |
| `startDate` | Date | No | `Date.now` | Start date |
| `endDate` | Date | Conditional | - | Required unless plan is `FREE` |
| `features.maxMenuItems` | Number | No | `5` | Menu item limit |
| `features.maxOrdersPerDay` | Number | No | `10` | Daily order limit |
| `features.analyticsAccess` | Boolean | No | `false` | Analytics access |
| `features.prioritySupport` | Boolean | No | `false` | Priority support |
| `features.customBranding` | Boolean | No | `false` | Custom branding |
| `paymentDetails.amount` | Number | No | - | Payment amount |
| `paymentDetails.currency` | String | No | `INR` | Currency code |
| `paymentDetails.paymentId` | String | No | - | Gateway payment id |
| `paymentDetails.orderId` | String | No | - | Gateway order id |
| `paymentDetails.signature` | String | No | - | Gateway signature |
| `paymentDetails.paymentDate` | Date | No | - | Payment time |
| `autoRenew` | Boolean | No | `false` | Auto renewal |
| `createdAt` | Date | Auto | - | Created timestamp |
| `updatedAt` | Date | Auto | - | Updated timestamp |

### Indexes
- `restaurantId` is unique

---

## OrderStatusRequest (orderstatusrequests)

**Model:** `OrderStatusRequest`

### Fields
| Field | Type | Required | Default | Notes |
|------|------|----------|---------|------|
| `orderId` | ObjectId | Yes | - | Ref: `Order` |
| `restaurantId` | ObjectId | Yes | - | Ref: `User` (owner) |
| `requestedBy` | ObjectId | Yes | - | Ref: `User` (staff) |
| `fromStatus` | String | Yes | - | Previous status |
| `toStatus` | String | Yes | - | Requested status |
| `status` | String | No | `PENDING` | Enum: `PENDING`, `APPROVED`, `REJECTED` |
| `reviewedBy` | ObjectId | No | - | Ref: `User` (owner) |
| `reviewedAt` | Date | No | - | Decision time |
| `createdAt` | Date | Auto | - | Created timestamp |
| `updatedAt` | Date | Auto | - | Updated timestamp |

---

## Notes on References

- References use `ObjectId` with `ref` to enable population.
- Restaurant owner references use the `User` model.
- Staff members are also `User` records with `userType: STAFF` and a `restaurantId` pointing to the owner.

---

## File References

Schema definitions are in:
- [backend/src/models/User.js](backend/src/models/User.js)
- [backend/src/models/Restaurant.js](backend/src/models/Restaurant.js)
- [backend/src/models/Food.js](backend/src/models/Food.js)
- [backend/src/models/Cart.js](backend/src/models/Cart.js)
- [backend/src/models/Order.js](backend/src/models/Order.js)
- [backend/src/models/Payment.js](backend/src/models/Payment.js)
- [backend/src/models/Review.js](backend/src/models/Review.js)
- [backend/src/models/StaffInvite.js](backend/src/models/StaffInvite.js)
- [backend/src/models/Subscription.js](backend/src/models/Subscription.js)
- [backend/src/models/OrderStatusRequest.js](backend/src/models/OrderStatusRequest.js)

---

**Last Updated:** February 10, 2026
