# Book Review API

A RESTful API for a book review system built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT
- Book management (add, list, search)
- Review system (add, update, delete)
- Pagination and filtering
- Search functionality

## Prerequisites

- Node.js
- MongoDB
- npm

## Setup

1. Clone the repository:
```bash
git clone https://github.com/SSShogunn/books.git
cd books
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=8879
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Start the server:
```bash
npm start
```

## API Documentation

### Authentication

#### Register User
```http
POST /auth/signup
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123"
}
```

### Books

#### Add Book (Authenticated)
```http
POST /books
Authorization: Bearer <token>
Content-Type: application/json

{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "genre": "Fiction",
    "description": "A story of the fabulously wealthy Jay Gatsby"
}
```

#### Get All Books
```http
GET /books?page=1&limit=5&author=Fitzgerald&genre=Fiction
```

#### Get Book by ID
```http
GET /books/:id?page=1&limit=5
```

### Reviews

#### Add Review (Authenticated)
```http
POST /books/:id/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
    "rating": 5,
    "comment": "Great book!"
}
```

#### Update Review (Authenticated)
```http
PUT /reviews/:id
Authorization: Bearer <token>
Content-Type: application/json

{
    "rating": 4,
    "comment": "Updated review"
}
```

#### Delete Review (Authenticated)
```http
DELETE /reviews/:id
Authorization: Bearer <token>
```

### Search

#### Search Books
```http
GET /search?query=gatsby&page=1&limit=5
```

## Database Schema

### User
```javascript
{
    name: String,
    email: String (unique),
    password: String (hashed)
}
```

### Book
```javascript
{
    title: String,
    author: String,
    genre: String,
    description: String,
    createdBy: ObjectId (ref: User)
}
```

### Review
```javascript
{
    book: ObjectId (ref: Book),
    user: ObjectId (ref: User),
    rating: Number (1-5),
    comment: String
}
```

## Design Decisions

1. **Authentication**: JWT is used for stateless authentication, making it scalable and easy to implement.

2. **Database**: MongoDB is chosen for its flexibility with document-based storage, which works well for book and review data.

3. **Pagination**: All list endpoints support pagination to handle large datasets efficiently.

4. **Search**: Case-insensitive search using MongoDB's regex capabilities for flexible matching.

5. **Error Handling**: Consistent error responses with appropriate HTTP status codes.

6. **Security**: Passwords are hashed using bcrypt, and sensitive routes are protected with JWT authentication. 