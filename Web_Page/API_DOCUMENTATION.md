# API Documentation

Base URL: `https://{projectId}.supabase.co/functions/v1/make-server-d0c59136`

## Authentication

Most endpoints use Bearer token authentication with Supabase access tokens.

```javascript
Authorization: `Bearer ${accessToken}`
```

## Endpoints

### Health Check
**GET** `/health`

Returns server status.

**Response:**
```json
{
  "status": "ok"
}
```

---

### User Management

#### Sign Up
**POST** `/signup`

Create a new user account.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": { /* Supabase user object */ }
}
```

---

### Cars

#### Get All Cars
**GET** `/cars`

Returns all car listings (public endpoint).

**Response:**
```json
{
  "cars": [
    {
      "id": "car:timestamp-id",
      "name": "BMW M5 Competition",
      "brand": "BMW",
      "model": "M5",
      "year": 2023,
      "price": 89500,
      "mileage": "12,000 km",
      "fuelType": "Petrol",
      "imageUrl": "https://...",
      "condition": "Certified Pre-Owned",
      "description": "...",
      "transmission": "Automatic",
      "color": "Black",
      "createdAt": "2026-02-12T..."
    }
  ]
}
```

#### Add Car (Admin Only)
**POST** `/cars`

**Headers:** `Authorization: Bearer {accessToken}`

**Body:**
```json
{
  "name": "BMW M5 Competition",
  "brand": "BMW",
  "model": "M5",
  "year": 2023,
  "price": 89500,
  "mileage": "12,000 km",
  "fuelType": "Petrol",
  "imageUrl": "https://...",
  "condition": "Used",
  "description": "...",
  "transmission": "Automatic",
  "color": "Black"
}
```

**Response:**
```json
{
  "success": true,
  "carId": "car:timestamp-id"
}
```

#### Delete Car (Admin Only)
**DELETE** `/cars/:id`

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true
}
```

---

### Enquiries

#### Submit Enquiry (Authenticated)
**POST** `/enquiries`

**Headers:** `Authorization: Bearer {accessToken}`

**Body:**
```json
{
  "carId": "car:timestamp-id",
  "carName": "BMW M5 Competition",
  "message": "Interested in this car"
}
```

**Response:**
```json
{
  "success": true,
  "enquiryId": "enquiry:timestamp-id"
}
```

#### Get All Enquiries (Admin Only)
**GET** `/enquiries`

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "enquiries": [
    {
      "id": "enquiry:timestamp-id",
      "carId": "car:timestamp-id",
      "carName": "BMW M5 Competition",
      "userId": "user-uuid",
      "userEmail": "user@example.com",
      "userName": "John Doe",
      "status": "pending",
      "createdAt": "2026-02-12T..."
    }
  ]
}
```

#### Update Enquiry Status (Admin Only)
**PUT** `/enquiries/:id`

**Headers:** `Authorization: Bearer {accessToken}`

**Body:**
```json
{
  "status": "contacted" // or "converted", "pending"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### Sales

#### Add Sale Record (Admin Only)
**POST** `/sales`

**Headers:** `Authorization: Bearer {accessToken}`

**Body:**
```json
{
  "carBrand": "BMW",
  "carName": "BMW M5 Competition",
  "salePrice": 89500,
  "profit": 12500,
  "customerName": "John Doe",
  "saleDate": "2026-02-12"
}
```

**Response:**
```json
{
  "success": true,
  "saleId": "sale:timestamp-id"
}
```

#### Get All Sales (Admin Only)
**GET** `/sales`

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "sales": [
    {
      "id": "sale:timestamp-id",
      "carBrand": "BMW",
      "carName": "BMW M5 Competition",
      "salePrice": 89500,
      "profit": 12500,
      "customerName": "John Doe",
      "saleDate": "2026-02-12",
      "createdAt": "2026-02-12T..."
    }
  ]
}
```

---

### Testimonials

#### Get All Testimonials
**GET** `/testimonials`

Returns all testimonials (public endpoint).

**Response:**
```json
{
  "testimonials": [
    {
      "id": "testimonial:timestamp-id",
      "customerName": "Sarah Johnson",
      "carPurchased": "BMW M5 Competition",
      "rating": 5,
      "feedback": "Exceptional service...",
      "imageUrl": "https://...",
      "purchaseDate": "2026-01-15",
      "createdAt": "2026-02-12T..."
    }
  ]
}
```

#### Add Testimonial (Admin Only)
**POST** `/testimonials`

**Headers:** `Authorization: Bearer {accessToken}`

**Body:**
```json
{
  "customerName": "Sarah Johnson",
  "carPurchased": "BMW M5 Competition",
  "rating": 5,
  "feedback": "Exceptional service...",
  "imageUrl": "https://...",
  "purchaseDate": "2026-01-15"
}
```

**Response:**
```json
{
  "success": true,
  "testimonialId": "testimonial:timestamp-id"
}
```

---

### Admin

#### Check Admin Status
**GET** `/check-admin`

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "isAdmin": true
}
```

#### Set Admin (Setup Only)
**POST** `/set-admin`

**Body:**
```json
{
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "success": true
}
```

**Note:** This endpoint should be secured in production. It's provided for initial setup only.

---

## Error Responses

All endpoints return error responses in this format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (Admin access required)
- `404` - Not Found
- `500` - Internal Server Error

---

## Data Prefixes

The KV store uses these prefixes:
- `car:` - Car listings
- `enquiry:` - Customer enquiries
- `sale:` - Sales records
- `testimonial:` - Customer testimonials
- `admin:` - Admin user records
