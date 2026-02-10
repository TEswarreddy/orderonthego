# Order on the Go - Feature Documentation

## Table of Contents
1. [Overview](#overview)
2. [User Roles](#user-roles)
3. [Authentication & Accounts](#authentication--accounts)
4. [Restaurant Management](#restaurant-management)
5. [Food & Menu Management](#food--menu-management)
6. [Cart & Checkout](#cart--checkout)
7. [Order Management](#order-management)
8. [Payment Processing](#payment-processing)
9. [Reviews & Ratings](#reviews--ratings)
10. [Staff Management](#staff-management)
11. [Subscription Plans & Limits](#subscription-plans--limits)
12. [Admin Dashboard & Analytics](#admin-dashboard--analytics)
13. [Verification Services](#verification-services)
14. [Images & Media Uploads](#images--media-uploads)
15. [Notifications](#notifications)
16. [Security & Access Control](#security--access-control)
17. [Operational & Dev Tools](#operational--dev-tools)

---

## Overview

Order on the Go is a food ordering and restaurant management platform that connects customers, restaurant owners, staff, and administrators in a single system. The platform supports menu management, online ordering, payments, subscriptions, staff workflows, and admin analytics.

---

## User Roles

The system is role-based with access controls for each role:

- **USER**: End customers who browse menus, place orders, and write reviews.
- **RESTAURANT**: Restaurant owners who manage menus, staff, and orders.
- **STAFF**: Restaurant staff who assist with order processing.
- **ADMIN**: Platform administrators who oversee the entire system.

---

## Authentication & Accounts

### Key Features
- **User Registration & Login**: Email/password authentication using JWT.
- **Role-Based Access**: Secure access control for protected endpoints.
- **Profile Management**: Users can view and update profile details.
- **Profile Image Upload**: Users can upload or delete profile images.

### Supported Roles
- Users (customers)
- Restaurant owners
- Staff members
- Admins

---

## Restaurant Management

### Key Features
- **Restaurant Profiles**: Owners can update restaurant details, address, and contact info.
- **Public Restaurant Listings**: Customers can browse all restaurants.
- **Restaurant Image Uploads**: Owners can upload a restaurant profile image.
- **Owner Profile Image**: Owners can also manage their personal profile image.
- **Admin Approval Workflow**: Admins approve or reject restaurant registrations.

---

## Food & Menu Management

### Key Features
- **Create Food Items**: Add menu items with price, category, and description.
- **Manage Food Items**: Update, delete, or toggle availability.
- **Restaurant-Specific Menus**: Each restaurant maintains its own menu.
- **Public Food Listings**: Customers can browse all available foods.
- **Food Details**: Each food item supports detailed metadata.

### Subscription Limits
- Menu item creation is limited by subscription plan.

---

## Cart & Checkout

### Key Features
- **Add to Cart**: Customers add food items to the cart.
- **View Cart**: Customers can view cart details and totals.
- **Remove Items**: Remove specific items from the cart.

---

## Order Management

### Customer Features
- **Place Orders**: Create orders from cart.
- **Track Orders**: View all personal orders and status updates.

### Restaurant Features
- **Order Queue**: Restaurant and staff view all incoming orders.
- **Update Status**: Update order status through each stage.

### Status Flow
- `PLACED` -> `PENDING` -> `CONFIRMED` -> `PREPARING` -> `READY` -> `OUT_FOR_DELIVERY` -> `DELIVERED`

### Staff Workflow
- **Status Change Requests**: Staff can request a status change, subject to owner approval.

---

## Payment Processing

### Key Features
- **Razorpay Integration**: Secure online payment processing.
- **Order Creation**: Backend creates a Razorpay order.
- **Payment Verification**: Verifies payment signatures for security.
- **Payment Tracking**: Payment status updates are tied to orders.

---

## Reviews & Ratings

### Key Features
- **Submit Reviews**: Customers can review and rate foods.
- **Update or Delete Reviews**: Customers can manage their reviews.
- **Review Listings**: Customers can view reviews for each food.
- **Review Analytics**: Aggregated review stats per food item.

---

## Staff Management

### Key Features
- **Staff Invitations**: Owners invite staff via secure token.
- **Invite Completion**: Staff register using invite token.
- **Staff Approval**: Owners approve staff accounts.
- **Staff Profiles**: Staff can update their profiles.
- **Order Status Requests**: Staff request status changes for approval.

---

## Subscription Plans & Limits

### Key Features
- **Subscription Plans**: Tiered plans (FREE, BASIC, PREMIUM) with different limits.
- **Subscribe / Cancel**: Restaurant owners can manage subscriptions.
- **Usage Tracking**: Track usage of menu items and staff capacity.
- **Limit Checks**: API enforces feature limits by plan.

---

## Admin Dashboard & Analytics

### Management Features
- **User Management**: View, update, suspend, or delete users.
- **Restaurant Approvals**: Approve or reject restaurant registrations.
- **Order Management**: View and manage all orders.
- **Food Management**: Manage food items across restaurants.
- **Staff Management**: Manage staff accounts.

### Analytics Features
- **Revenue Analytics**: View revenue trends and stats.
- **Order Distribution**: Distribution by order status.
- **Food Revenue**: Top items by revenue.
- **Subscription Revenue**: Track subscription income.
- **Revenue by Restaurant**: Compare restaurant performance.

---

## Verification Services

### Key Features
- **Email Verification**: Send and verify email codes.
- **Phone Verification**: Send and verify SMS codes.
- **Resend Codes**: Re-issue verification codes.

---

## Images & Media Uploads

### Key Features
- **Profile Images**: Users, staff, admins, and restaurants can upload images.
- **Validation**: Content-type validation for images.
- **Size Limits**: Max file size 5MB.

### Upload Rules
- Only image content types are allowed.
- Payload must be raw image data.

---

## Notifications

### Email Notifications
- SendGrid integration for email verification and communication.

### SMS Notifications
- Twilio integration for SMS verification and alerts.

---

## Security & Access Control

### Key Features
- **JWT Authentication**: Secure access to protected endpoints.
- **Role-Based Access**: Access restricted by role.
- **Middleware Protection**: Route-level access control.
- **Input Validation**: Validation on critical request data.

---

## Operational & Dev Tools

### Development Scripts
- **Backend**: `npm run dev` (nodemon)
- **Frontend**: `npm run dev` (Vite)
- **Seed Data**: `npm run seed:foods`

### Diagnostics
- MongoDB DNS configuration support.
- CORS configured per frontend base URL.

---

## Related Documentation

- **Setup & Installation**: `SETUP_INSTALLATION_GUIDE.md`
- **API Documentation**: `API_DOCUMENTATION.md`
- **Admin Setup**: `ADMIN_SETUP_GUIDE.md`
- **Subscription Model**: `SUBSCRIPTION_MODEL_DOCUMENTATION.md`
- **Manual Testing**: `MANUAL_TESTING_GUIDE.md`

---

**Last Updated:** February 10, 2026
