# Book Review API

A RESTful API for managing books, user authentication, and book reviews. Built with **Node.js**, **Express**, and **MongoDB**.

---

## 🚀 Features

- **User Authentication**: Register, login, and logout with JWT-based authentication.
- **Book Management**: Add, get, and search books by author or genre.
- **Review System**: Add, update, and delete reviews for books.
- **Secure**: Uses hashed passwords and secure cookies for authentication.
- **Pagination**: Get books with pagination support.

---

## 🏗️ Project Structure

```
backend/
  ├── .env
  ├── package.json
  ├── src/
  │   ├── app.js
  │   ├── index.js
  │   ├── controllers/
  │   │   ├── auth.controllers.js
  │   │   └── book.controllers.js
  │   ├── db/
  │   │   └── db.js
  │   ├── middlewares/
  │   │   └── auth.middlewares.js
  │   ├── models/
  │   │   ├── book.models.js
  │   │   ├── review.models.js
  │   │   └── user.models.js
  │   └── routes/
  │       ├── auth.routes.js
  │       └── book.routes.js
```

---

## ⚙️ Getting Started

### 1. Clone the repository

```sh
git clone https://github.com/raheelhparekh/assignment
cd backend
```

### 2. Install dependencies

```sh
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `backend/` directory (see `.env.example` for reference):

```
PORT=8000
BASE_URL=http://127.0.0.1:3000
MONGO_URI=mongodb://localhost:27017/assignment
ACCESS_TOKEN_SECRET=youraccesstokensecret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=yourrefreshtokensecret
REFRESH_TOKEN_EXPIRY=7d
```

### 4. Start the server

```sh
npm start
```

The server will run on `http://localhost:8000`.

---

## 📚 API Endpoints

### Auth

- `POST /api/v1/auth/signup` — Register a new user
- `POST /api/v1/auth/login` — Login user
- `GET /api/v1/auth/logout` — Logout user

### Books

- `POST /api/v1/books/addBook` — Add a new book (auth required)
- `GET /api/v1/books/getBooks` — Get all books (with optional `author`, `genre`, `page`, `limit`)
- `GET /api/v1/books/getBook/:id` — Get a book by ID
- `GET /api/v1/books/getAllBooks-by-author/:author` — Get books by author
- `GET /api/v1/books/getAllBooks-by-genre/:genre` — Get books by genre

### Reviews

- `POST /api/v1/books/review/book/:bookId` — Add a review to a book (auth required)
- `PUT /api/v1/books/update-review/:reviewId` — Update a review (auth required)
- `DELETE /api/v1/books/delete-review/:reviewId` — Delete a review (auth required)

---

## 🛡️ Tech Stack

- **Node.js**
- **Express**
- **MongoDB** & **Mongoose**
- **JWT** for authentication
- **bcrypt** for password hashing
- **dotenv**, **cookie-parser**, **cors**

---
...existing code...

---

## 📝 Design Decisions & Assumptions

- **RESTful API**: The API follows REST principles for clear and predictable endpoints.
- **Authentication**: JWT-based authentication is used for stateless and secure user sessions. Passwords are hashed using bcrypt.
- **Authorization**: Only authenticated users can add books and reviews. Users can only update or delete their own reviews.
- **No User Roles**: All users have the same permissions; there are no admin or moderator roles.
- **Input Validation**: All endpoints are expected to validate input to ensure data integrity.
- **Error Handling**: Standardized error responses are implemented for authentication, validation, and resource errors.
- **Environment Variables**: Sensitive data such as database URIs and JWT secrets are managed via environment variables.
- **CORS**: Enabled to allow frontend applications to interact with the API.
- **Modular Structure**: The codebase is organized into controllers, models, routes, and middlewares for maintainability.
- **Database**: MongoDB is used for flexible document storage, with Mongoose for schema enforcement.

---
