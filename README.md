# Pharmaceutical Delivery System API Documentation

## Overview

This documentation provides details on the RESTful API endpoints for the Pharmaceutical Delivery System. The API enables communication between pharmacies and vendors, facilitating medication ordering, tracking, and delivery management.

## Base URL

```
http://localhost:3000/api
```

## Authentication

The API uses JWT (JSON Web Token) for authentication. Most endpoints require authentication using a Bearer token.

### Getting a Token

1. Register as a vendor or pharmacy
2. Login with your credentials
3. Use the returned access token in subsequent requests

### Using the Token

Include the token in the Authorization header of your requests:

```
Authorization: Bearer your_access_token_here
```

## API Endpoints

### Authentication

#### Register a Vendor

```
POST /auth/register/vendor
```

**Request Body:**
```json
{
  "email": "vendor@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "1234567890",
  "address": {
    "street": "123 Vendor St",
    "city": "Vendor City",
    "state": "VS",
    "zip": "12345",
    "coordinates": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  },
  "businessName": "MedSupply Inc",
  "businessLicense": "VSL123456",
  "deliveryCapability": true
}
```

**Response:**
```json
{
  "user": {
    "id": "vendor_id_here",
    "email": "vendor@example.com",
    "name": "John Doe",
    "role": "vendor",
    "businessName": "MedSupply Inc"
  },
  "accessToken": "access_token_here",
  "refreshToken": "refresh_token_here"
}
```

#### Register a Pharmacy

```
POST /auth/register/pharmacy
```

**Request Body:**
```json
{
  "email": "pharmacy@example.com",
  "password": "securePassword123",
  "name": "Jane Smith",
  "phone": "0987654321",
  "address": {
    "street": "456 Pharmacy Ave",
    "city": "Pharmacy City",
    "state": "PC",
    "zip": "54321",
    "coordinates": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  },
  "businessName": "City Pharmacy",
  "pharmacyLicense": "PHL654321",
  "preferredVendors": []
}
```

**Response:**
```json
{
  "user": {
    "id": "pharmacy_id_here",
    "email": "pharmacy@example.com",
    "name": "Jane Smith",
    "role": "pharmacy",
    "businessName": "City Pharmacy"
  },
  "accessToken": "access_token_here",
  "refreshToken": "refresh_token_here"
}
```

#### Login

```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id_here",
    "email": "user@example.com",
    "name": "User Name",
    "role": "vendor|pharmacy"
  },
  "accessToken": "access_token_here",
  "refreshToken": "refresh_token_here"
}
```

#### Refresh Token

```
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "accessToken": "new_access_token_here",
  "refreshToken": "new_refresh_token_here"
}
```

#### Logout

```
POST /auth/logout
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### User Management

#### Get Current User Profile

```
GET /users/me
```

**Response:**
```json
{
  "id": "user_id_here",
  "email": "user@example.com",
  "name": "User Name",
  "phone": "1234567890",
  "address": {
    "street": "123 Street",
    "city": "City",
    "state": "ST",
    "zip": "12345",
    "coordinates": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  },
  "role": "vendor|pharmacy",
  "createdAt": "2025-03-01T00:00:00.000Z",
  "updatedAt": "2025-03-01T00:00:00.000Z"
}
```

#### Update User Profile

```
PUT /users/me
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "9876543210",
  "address": {
    "street": "456 New Street",
    "city": "New City",
    "state": "NS",
    "zip": "54321",
    "coordinates": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  }
}
```

**Response:**
```json
{
  "id": "user_id_here",
  "email": "user@example.com",
  "name": "Updated Name",
  "phone": "9876543210",
  "address": {
    "street": "456 New Street",
    "city": "New City",
    "state": "NS",
    "zip": "54321",
    "coordinates": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  },
  "role": "vendor|pharmacy",
  "createdAt": "2025-03-01T00:00:00.000Z",
  "updatedAt": "2025-03-01T00:00:00.000Z"
}
```

#### Change Password

```
PUT /users/me/password
```

**Request Body:**
```json
{
  "currentPassword": "currentPassword123",
  "newPassword": "newPassword456"
}
```

**Response:**
```json
{
  "message": "Password updated successfully"
}
```

### Vendor Management

#### List All Vendors

```
GET /vendors
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)
- `rating` (optional): Minimum rating
- `deliveryCapability` (optional): true/false
- `search` (optional): Search term for name, business name, or email

**Response:**
```json
{
  "vendors": [
    {
      "id": "vendor_id_here",
      "email": "vendor@example.com",
      "name": "Vendor Name",
      "businessName": "Vendor Business",
      "deliveryCapability": true,
      "rating": 4.5
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

#### Get Vendor Details

```
GET /vendors/:id
```

**Response:**
```json
{
  "id": "vendor_id_here",
  "email": "vendor@example.com",
  "name": "Vendor Name",
  "phone": "1234567890",
  "address": {
    "street": "123 Vendor St",
    "city": "Vendor City",
    "state": "VS",
    "zip": "12345",
    "coordinates": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  },
  "businessName": "MedSupply Inc",
  "businessLicense": "VSL123456",
  "deliveryCapability": true,
  "rating": 4.5,
  "createdAt": "2025-03-01T00:00:00.000Z",
  "updatedAt": "2025-03-01T00:00:00.000Z"
}
```

#### Update Vendor

```
PUT /vendors/:id
```

**Request Body:**
```json
{
  "businessName": "Updated MedSupply Inc",
  "deliveryCapability": false
}
```

**Response:**
```json
{
  "id": "vendor_id_here",
  "email": "vendor@example.com",
  "name": "Vendor Name",
  "phone": "1234567890",
  "address": {
    "street": "123 Vendor St",
    "city": "Vendor City",
    "state": "VS",
    "zip": "12345",
    "coordinates": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  },
  "businessName": "Updated MedSupply Inc",
  "businessLicense": "VSL123456",
  "deliveryCapability": false,
  "rating": 4.5,
  "createdAt": "2025-03-01T00:00:00.000Z",
  "updatedAt": "2025-03-01T00:00:00.000Z"
}
```

#### Get Vendor Reviews

```
GET /vendors/:id/reviews
```

**Response:**
```json
[
  {
    "pharmacyId": "pharmacy_id_here",
    "rating": 4,
    "comment": "Great service and fast delivery",
    "date": "2025-03-01T00:00:00.000Z"
  }
]
```

#### Add Review for Vendor

```
POST /vendors/:id/reviews
```

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Excellent service and product quality!"
}
```

**Response:**
```json
[
  {
    "pharmacyId": "pharmacy_id_here",
    "rating": 5,
    "comment": "Excellent service and product quality!",
    "date": "2025-03-05T00:00:00.000Z"
  }
]
```

### Pharmacy Management

#### List All Pharmacies

```
GET /pharmacies
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)
- `search` (optional): Search term for name, business name, or email

**Response:**
```json
{
  "pharmacies": [
    {
      "id": "pharmacy_id_here",
      "email": "pharmacy@example.com",
      "name": "Pharmacy Name",
      "businessName": "Pharmacy Business"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

#### Get Pharmacy Details

```
GET /pharmacies/:id
```

**Response:**
```json
{
  "id": "pharmacy_id_here",
  "email": "pharmacy@example.com",
  "name": "Pharmacy Name",
  "phone": "1234567890",
  "address": {
    "street": "123 Pharmacy St",
    "city": "Pharmacy City",
    "state": "PC",
    "zip": "12345",
    "coordinates": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  },
  "businessName": "City Pharmacy",
  "pharmacyLicense": "PHL654321",
  "preferredVendors": ["vendor_id_1", "vendor_id_2"],
  "createdAt": "2025-03-01T00:00:00.000Z",
  "updatedAt": "2025-03-01T00:00:00.000Z"
}
```

#### Update Pharmacy

```
PUT /pharmacies/:id
```

**Request Body:**
```json
{
  "businessName": "Updated City Pharmacy",
  "preferredVendors": ["vendor_id_1", "vendor_id_3"]
}
```

**Response:**
```json
{
  "id": "pharmacy_id_here",
  "email": "pharmacy@example.com",
  "name": "Pharmacy Name",
  "phone": "1234567890",
  "address": {
    "street": "123 Pharmacy St",
    "city": "Pharmacy City",
    "state": "PC",
    "zip": "12345",
    "coordinates": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  },
  "businessName": "Updated City Pharmacy",
  "pharmacyLicense": "PHL654321",
  "preferredVendors": ["vendor_id_1", "vendor_id_3"],
  "createdAt": "2025-03-01T00:00:00.000Z",
  "updatedAt": "2025-03-01T00:00:00.000Z"
}
```

### Medication Management

#### List All Medications

```
GET /medications
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)
- `vendorId` (optional): Filter by vendor
- `category` (optional): Filter by category
- `requiresPrescription` (optional): true/false
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `search` (optional): Search term for name, generic name, or description
- `sort` (optional): Field to sort by (default: 'name')
- `order` (optional): Sort order 'asc' or 'desc' (default: 'asc')

**Response:**
```json
{
  "medications": [
    {
      "id": "medication_id_here",
      "vendorId": "vendor_id_here",
      "name": "Medication Name",
      "genericName": "Generic Name",
      "dosageForm": "tablet",
      "strength": "500mg",
      "price": 19.99,
      "discountPrice": 17.99,
      "stock": 100,
      "requiresPrescription": false
    }
  ],
  "pagination": {
    "total": 200,
    "page": 1,
    "limit": 10,
    "pages": 20
  }
}
```

#### Get Medication Details

```
GET /medications/:id
```

**Response:**
```json
{
  "id": "medication_id_here",
  "vendorId": "vendor_id_here",
  "name": "Medication Name",
  "genericName": "Generic Name",
  "description": "Detailed description of the medication",
  "dosageForm": "tablet",
  "strength": "500mg",
  "packageSize": 30,
  "manufacturer": "Manufacturer Name",
  "category": ["pain relief", "fever reducer"],
  "requiresPrescription": false,
  "price": 19.99,
  "discountPrice": 17.99,
  "stock": 100,
  "images": ["image_url_1", "image_url_2"],
  "createdAt": "2025-03-01T00:00:00.000Z",
  "updatedAt": "2025-03-01T00:00:00.000Z"
}
```

#### Create Medication

```
POST /medications
```

**Request Body:**
```json
{
  "name": "New Medication",
  "genericName": "Generic Name",
  "description": "Detailed description of the medication",
  "dosageForm": "capsule",
  "strength": "250mg",
  "packageSize": 60,
  "manufacturer": "Manufacturer Name",
  "category": ["antibiotic"],
  "requiresPrescription": true,
  "price": 29.99,
  "stock": 50,
  "images": ["image_url_1"]
}
```

**Response:**
```json
{
  "id": "new_medication_id_here",
  "vendorId": "vendor_id_here",
  "name": "New Medication",
  "genericName": "Generic Name",
  "description": "Detailed description of the medication",
  "dosageForm": "capsule",
  "strength": "250mg",
  "packageSize": 60,
  "manufacturer": "Manufacturer Name",
  "category": ["antibiotic"],
  "requiresPrescription": true,
  "price": 29.99,
  "stock": 50,
  "images": ["image_url_1"],
  "createdAt": "2025-03-05T00:00:00.000Z",
  "updatedAt": "2025-03-05T00:00:00.000Z"
}
```

#### Update Medication

```
PUT /medications/:id
```

**Request Body:**
```json
{
  "price": 27.99,
  "discountPrice": 24.99,
  "stock": 75
}
```

**Response:**
```json
{
  "id": "medication_id_here",
  "vendorId": "vendor_id_here",
  "name": "Medication Name",
  "genericName": "Generic Name",
  "description": "Detailed description of the medication",
  "dosageForm": "capsule",
  "strength": "250mg",
  "packageSize": 60,
  "manufacturer": "Manufacturer Name",
  "category": ["antibiotic"],
  "requiresPrescription": true,
  "price": 27.99,
  "discountPrice": 24.99,
  "stock": 75,
  "images": ["image_url_1"],
  "createdAt": "2025-03-01T00:00:00.000Z",
  "updatedAt": "2025-03-05T00:00:00.000Z"
}
```

#### Delete Medication

```
DELETE /medications/:id
```

**Response:**
```json
{
  "message": "Medication deleted successfully"
}
```

#### Get Medications by Vendor

```
GET /medications/vendor/:id
```

**Query Parameters:**
- Same as List All Medications

**Response:**
```json
{
  "medications": [
    {
      "id": "medication_id_here",
      "vendorId": "vendor_id_here",
      "name": "Medication Name",
      "genericName": "Generic Name",
      "dosageForm": "tablet",
      "strength": "500mg",
      "price": 19.99,
      "discountPrice": 17.99,
      "stock": 100,
      "requiresPrescription": false
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### Order Management

#### Create Order

```
POST /orders
```

**Request Body:**
```json
{
  "vendorId": "vendor_id_here",
  "items": [
    {
      "medicationId": "medication_id_1",
      "quantity": 2
    },
    {
      "medicationId": "medication_id_2",
      "quantity": 1
    }
  ],
  "paymentMethod": "creditCard",
  "deliveryInfo": {
    "address": {
      "street": "123 Delivery St",
      "city": "Delivery City",
      "state": "DC",
      "zip": "12345",
      "coordinates": {
        "latitude": 37.7749,
        "longitude": -122.4194
      }
    },
    "contactName": "Contact Person",
    "contactPhone": "1234567890",
    "deliveryNotes": "Leave at reception"
  }
}
```

**Response:**
```json
{
  "id": "order_id_here",
  "pharmacyId": "pharmacy_id_here",
  "vendorId": "vendor_id_here",
  "items": [
    {
      "medicationId": "medication_id_1",
      "name": "Medication Name 1",
      "quantity": 2,
      "unitPrice": 19.99,
      "totalPrice": 39.98
    },
    {
      "medicationId": "medication_id_2",
      "name": "Medication Name 2",
      "quantity": 1,
      "unitPrice": 29.99,
      "totalPrice": 29.99
    }
  ],
  "subtotal": 69.97,
  "tax": 3.50,
  "deliveryFee": 5.00,
  "total": 78.47,
  "paymentStatus": "pending",
  "paymentMethod": "creditCard",
  "status": "pending",
  "deliveryInfo": {
    "address": {
      "street": "123 Delivery St",
      "city": "Delivery City",
      "state": "DC",
      "zip": "12345",
      "coordinates": {
        "latitude": 37.7749,
        "longitude": -122.4194
      }
    },
    "contactName": "Contact Person",
    "contactPhone": "1234567890",
    "deliveryNotes": "Leave at reception"
  },
  "createdAt": "2025-03-05T00:00:00.000Z",
  "updatedAt": "2025-03-05T00:00:00.000Z"
}
```

#### Get Orders

```
GET /orders
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)
- `status` (optional): Filter by status
- `paymentStatus` (optional): Filter by payment status
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `sort` (optional): Field to sort by (default: 'createdAt')
- `order` (optional): Sort order 'asc' or 'desc' (default: 'desc')

**Response:**
```json
{
  "orders": [
    {
      "id": "order_id_here",
      "pharmacyId": {
        "_id": "pharmacy_id_here",
        "businessName": "Pharmacy Business"
      },
      "vendorId": {
        "_id": "vendor_id_here",
        "businessName": "Vendor Business"
      },
      "total": 78.47,
      "status": "pending",
      "paymentStatus": "pending",
      "createdAt": "2025-03-05T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 20,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

#### Get Order by ID

```
GET /orders/:id
```

**Response:**
```json
{
  "id": "order_id_here",
  "pharmacyId": {
    "_id": "pharmacy_id_here",
    "businessName": "Pharmacy Business",
    "email": "pharmacy@example.com",
    "phone": "1234567890",
    "address": {
      "street": "123 Pharmacy St",
      "city": "Pharmacy City",
      "state": "PC",
      "zip": "12345"
    }
  },
  "vendorId": {
    "_id": "vendor_id_here",
    "businessName": "Vendor Business",
    "email": "vendor@example.com",
    "phone": "0987654321",
    "address": {
      "street": "123 Vendor St",
      "city": "Vendor City",
      "state": "VC",
      "zip": "54321"
    }
  },
  "items": [
    {
      "medicationId": "medication_id_1",
      "name": "Medication Name 1",
      "quantity": 2,
      "unitPrice": 19.99,
      "totalPrice": 39.98
    },
    {
      "medicationId": "medication_id_2",
      "name": "Medication Name 2",
      "quantity": 1,
      "unitPrice": 29.99,
      "totalPrice": 29.99
    }
  ],
  "subtotal": 69.97,
  "tax": 3.50,
  "deliveryFee": 5.00,
  "total": 78.47,
  "paymentStatus": "pending",
  "paymentMethod": "creditCard",
  "status": "pending",
  "deliveryInfo": {
    "address": {
      "street": "123 Delivery St",
      "city": "Delivery City",
      "state": "DC",
      "zip": "12345",
      "coordinates": {
        "latitude": 37.7749,
        "longitude": -122.4194
      }
    },
    "contactName": "Contact Person",
    "contactPhone": "1234567890",
    "deliveryNotes": "Leave at reception",
    "estimatedDeliveryTime": null,
    "actualDeliveryTime": null,
    "deliveryPersonName": null,
    "deliveryPersonPhone": null,
    "currentLocation": null
  },
  "createdAt": "2025-03-05T00:00:00.000Z",
  "updatedAt": "2025-03-05T00:00:00.000Z"
}
```

#### Update Order Status

```
PUT /orders/:id/status
```

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Response:**
```json
{
  "id": "order_id_here",
  "status": "confirmed",
  "updatedAt": "2025-03-05T00:00:00.000Z"
}
```

#### Cancel Order

```
PUT /orders/:id/cancel
```

**Response:**
```json
{
  "id": "order_id_here",
  "status": "cancelled",
  "updatedAt": "2025-03-05T00:00:00.000Z"
}
```

#### Update Delivery Status

```
PUT /orders/:id/delivery/status
```

**Request Body:**
```json
{
  "status": "out_for_delivery"
}
```

**Response:**
```json
{
  "id": "order_id_here",
  "status": "out_for_delivery",
  "updatedAt": "2025-03-05T00:00:00.000Z"
}
```

#### Update Delivery Location

```
PUT /orders/:id/delivery/location
```

**Request Body:**
```json
{
  "latitude": 37.7750,
  "longitude": -122.4195
}
```

**Response:**
```json
{
  "id": "order_id_here",
  "deliveryInfo": {
    "currentLocation": {
      "latitude": 37.7750,
      "longitude": -122.4195,
      "updatedAt": "2025-03-05T00:00:00.000Z"
    }
  }
}
```

#### Get Delivery Tracking

```
GET /orders/:id/delivery/tracking
```

**Response:**
```json
{
  "orderId": "order_id_here",
  "status": "out_for_delivery",
  "deliveryInfo": {
    "estimatedDeliveryTime": "2025-03-05T12:00:00.000Z",
    "actualDeliveryTime": null,
    "deliveryPersonName": "Delivery Person",
    "deliveryPersonPhone": "1234567890",
    "currentLocation": {
      "latitude": 37.7750,
      "longitude": -122.4195,
      "updatedAt": "2025-03-05T10:30:00.000Z"
    }
  },
  "destination": {
    "street": "123 Delivery St",
    "city": "Delivery City",
    "state": "DC",
    "zip": "12345",
    "coordinates": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  }
}
```

#### Assign Delivery Person

```
PUT /orders/:id/delivery/person
```

**Request Body:**
```json
{
  "id": "delivery_person_id",
  "name": "Delivery Person",
  "phone": "1234567890"
}
```

**Response:**
```json
{
  "id": "order_id_here",
  "deliveryInfo": {
    "deliveryPersonId": "delivery_person_id",
    "deliveryPersonName": "Delivery Person",
    "deliveryPersonPhone": "1234567890"
  }
}
```

#### Update Estimated Delivery Time

```
PUT /orders/:id/delivery/estimated-time
```

**Request Body:**
```json
{
  "estimatedTime": "2025-03-05T12:00:00.000Z"
}
```

**Response:**
```json
{
  "id": "order_id_here",
  "deliveryInfo": {
    "estimatedDeliveryTime": "2025-03-05T12:00:00.000Z"
  }
}
```

#### Get Order Analytics

```
GET /orders/analytics
```

**Response:**
```json
{
  "totalOrders": 120,
  "ordersByStatus": {
    "pending": 5,
    "confirmed": 10,
    "preparing": 15,
    "out_for_delivery": 20,
    "delivered": 60,
    "cancelled": 10
  },
  "ordersByPaymentStatus": {
    "pending": 5,
    "paid": 105,
    "failed": 10
  },
  "financial": {
    "total": 10500.50,
    "subtotal": 9500.00,
    "tax": 500.50,
    "deliveryFee": 500.00
  },
  "monthlyData": [
    {
      "year": 2025,
      "month": 1,
      "count": 40,
      "revenue": 3500.00
    },
    {
      "year": 2025,
      "month": 2,
      "count": 35,
      "revenue": 3000.50
    },
    {
      "year": 2025,
      "month": 3,
      "count": 45,
      "revenue": 4000.00
    }
  ]
}
```

#### Get Top Selling Medications

```
GET /orders/vendor/:id/top-selling
```

**Response:**
```json
[
  {
    "medicationId": "medication_id_1",
    "medicationName": "Medication Name 1",
    "totalQuantity": 250,
    "totalRevenue": 4997.50,
    "orderCount": 120
  },
  {
    "medicationId": "medication_id_2",
    "medicationName": "Medication Name 2",
    "totalQuantity": 180,
    "totalRevenue": 3598.20,
    "orderCount": 90
  }
]
```

## Real-time Communication

The system uses Socket.IO for real-time updates. Clients should:

1. Connect to the WebSocket server
2. Authenticate using the JWT token
3. Listen for events

### Socket.IO Connection

```javascript
// JavaScript example
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token_here'
  }
});

// Listen for events
