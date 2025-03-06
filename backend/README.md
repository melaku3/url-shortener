# URL Shortener API

A RESTful API built with Node.js, Express.js, and MongoDB that allows users to shorten URLs and track analytics.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
  - [User Authentication](#user-authentication)
  - [URL Management](#url-management)
  - [Analytics](#analytics)
- [Authentication & Security](#authentication--security)
- [Error Handling](#error-handling)
- [Contributing](#contributing)
- [Contact](#contact)

## Features
- URL Shortening: Shorten long URLs.
- URL Redirection: Redirect to the original URL using the shortened URL.
- Analytics: Track clicks, referrers, and devices.
- User Authentication: Register and login with JWT-based authentication.
- Security: Passwords are securely hashed, and users can access only their own data.

## Tech Stack
- Backend: Node.js, Express.js
- Database: MongoDB (Mongoose)
- Authentication: JWT (jsonwebtoken) & bcrypt for password hashing
- Validation: Zod
- Caching: Redis
- Error Handling: Centralized middleware

## Project Structure
```
url-shortener/
│── backend/
│   ├── controllers/        # Request handling logic
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API route handlers
│   ├── middlewares/        # Authentication & validation
│   ├── utils/              # Utility functions
│   ├── config/             # Database & environment config
│   ├── app.ts              # Express app setup
│   ├── server.ts           # Main entry point
│── .env                    # Environment variables
│── package.json
│── README.md
```

## Installation & Setup
### 1. Clone the repository
```sh
git clone https://github.com/melaku3/url-shortener.git
cd url-shortener/backend
```

### 2. Install dependencies
```sh
npm install
```

### 3. Set up environment variables
Create a `.env` file in the `backend` directory and configure:
```
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
REDIS_URL=your_redis_connection_string
BASE_URL=http://localhost:3000
```

### 4. Start the server
```sh
npm start
```
The API will run at `http://localhost:3000`.

## API Documentation

### User Authentication

#### Register a New User
```http
POST /api/auth/register
```
**Request Body (JSON):**
```json
{
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "securepassword"
}
```
**Response:**
```json
{
    "message": "User registered successfully"
}
```

#### User Login
```http
POST /api/auth/login
```
**Request Body (JSON):**
```json
{
    "email": "johndoe@example.com",
    "password": "securepassword"
}
```
**Response:**
```json
{
    "message": "Login successful"
}
```

#### Get Current User Profile
```http
GET /api/auth/profile
```
**Headers:**
```
Cookie: token=your_jwt_token
```
**Response:**
```json
{
    "message": {
        "_id": "651234abcd",
        "name": "John Doe",
        "email": "johndoe@example.com",
        "role": "user"
    }
}
```

#### User Logout
```http
POST /api/auth/logout
```
**Headers:**
```
Cookie: token=your_jwt_token
```
**Response:**
```json
{
    "message": "Logout successful"
}
```

### URL Management

#### Shorten a URL
```http
POST /api/url/shorten
```
**Request Body (JSON):**
```json
{
    "url": "https://example.com"
}
```
**Response:**
```json
{
    "message": "URL shortened successfully",
    "shortUrl": "http://localhost:3000/abc123"
}
```

#### Redirect to the Original URL
```http
GET /:shortId
```
**Response:**
Redirects to the original URL.

### Analytics

#### Get URL Analytics
```http
GET /api/url/stats/:shortId
```
**Headers:**
```
Cookie: token=your_jwt_token
```
**Response:**
```json
{
    "shortId": "abc123",
    "totalClicks": 10,
    "topReferrers": {
        "Direct": 5,
        "https://google.com": 3,
        "https://facebook.com": 2
    },
    "topDevices": {
        "Unknown": 6,
        "Mozilla/5.0": 4
    },
    "visitsOverTime": [
        "2023-10-01T00:00:00.000Z",
        "2023-10-02T00:00:00.000Z"
    ]
}
```

## Authentication & Security
- JWT Authentication: Users must include a valid JWT token in the Cookie header to access protected routes.
- Password Hashing: Uses bcrypt to securely hash passwords.
- Access Control: Users can only manage their own URLs and analytics.

## Error Handling
| Error Type                | Response Code | Example Message |
|---------------------------|--------------|----------------|
| Invalid Credentials       | 401          | "Invalid email or password" |
| Unauthorized Access       | 403          | "Access denied" |
| Resource Not Found        | 404          | "URL not found" |
| Validation Error          | 400          | "Field is required" |
| Server Error              | 500          | "Internal server error" |

## Contributing
Contributions are welcome! Please fork the repository and create a pull request.
<!-- https://roadmap.sh/projects/url-shortening-service -->

## Contact
For any issues, feel free to reach out! 🚀  
Email: [emelaku63@gmail.com](mailto:emelaku63@gmail.com)  
GitHub: [melaku3](https://github.com/melaku3)