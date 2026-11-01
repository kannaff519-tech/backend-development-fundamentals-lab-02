# Lab 2: SQLite database and CRUD routes

## Student Details

- **Student Name:** [Your Name / VIJAY]
- **Registration Number:** [Your Registration Number / 252U1R9153]
- **Section:** [Your Section / CSE GEN AI (2C)]
- **Course:** Backend Development Fundamentals
- **Academic Term:** Year II – Term II
- **Faculty:** Joel Prashanth D

---

## Live Link

- **Live Link:** Not applicable
- **Reason:** SQLite is a serverless, single-file embedded database stored locally in `database.db`. Typical free cloud application hosting providers (such as Render or Vercel) utilize ephemeral file systems that discard locally written files whenever containers restart or scale down. Production deployments for SQLite require persistent block storage volumes. All CRUD routes and database operations have been fully verified locally.

---

## Objective

To build an Express.js REST API integrated with an embedded SQLite database (`database.db`) using the `sqlite` and `sqlite3` packages. The database connection is established asynchronously via `open()`, and five standard RESTful CRUD routes are implemented using secure parameterized SQL queries with `?` placeholders.

---

## Technologies Used

- **Node.js** — JavaScript runtime environment
- **Express.js** (`express`) — Fast, unopinionated web framework for Node.js
- **SQLite3** (`sqlite3`) — SQLite database driver
- **SQLite Wrapper** (`sqlite`) — Promise-based SQLite client library for Node.js
- **Nodemon** (`nodemon`) — Development monitor to automatically restart the server on file changes

---

## Project Structure

```text
lab-02/
├── database.db          # Persistent SQLite database file
├── seed.sql             # SQL schema definitions and sample seed data
├── server.js            # Express server initialization and 5 CRUD endpoints
├── package.json         # Node.js project configuration and scripts
├── package-lock.json    # Resolved dependency tree lockfile
├── .gitignore           # Ignores node_modules/ and temporary files
├── README.md            # Lab documentation, run guide, and screenshots
└── screenshots/         # Verified endpoint execution screenshots
    ├── 01-get-all-books.png
    ├── 02-get-single-book.png
    ├── 03-get-book-404.png
    ├── 04-invalid-id-400.png
    ├── 05-post-create-book.png
    ├── 06-put-update-book.png
    ├── 07-delete-book.png
    └── 08-sqlite-cli-verification.png
```

---

## Database Schema & Seed Data

### Table: `book`

```sql
CREATE TABLE IF NOT EXISTS book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    author TEXT,
    price INTEGER,
    pages INTEGER
);
```

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Auto-incrementing unique identifier for each book |
| `title` | `TEXT` | | Title of the book |
| `author` | `TEXT` | | Author(s) of the book |
| `price` | `INTEGER` | | Price of the book |
| `pages` | `INTEGER` | | Total number of pages |

The database is pre-seeded with 10 realistic sample book records via `seed.sql` (e.g. *The Pragmatic Programmer*, *Clean Code*, *JavaScript: The Good Parts*, etc.).

---

## How to Run

### 1. Install Dependencies
Navigate into the `lab-02` directory and install the required npm packages:
```bash
cd lab-02
npm install
```

### 2. Start the Server
- **Production / Standard Mode:**
  ```bash
  npm start
  ```
  Runs `node server.js`.

- **Development Mode (Auto-reload on file edits):**
  ```bash
  npm run dev
  ```
  Runs `nodemon server.js`.

Upon successful database connection, the terminal outputs:
```text
Server running on port 3000
```

---

## Endpoints Table

| Method | Path | Description | Expected Status |
|---|---|---|---|
| `GET` | `/books/` | Retrieve all books from the database | `200 OK` |
| `GET` | `/books/:bookId/` | Retrieve a single book by its ID | `200 OK` / `404 Not Found` / `400 Bad Request` |
| `POST` | `/books/` | Add a new book (`title`, `author`, `price`, `pages`) | `201 Created` |
| `PUT` | `/books/:bookId/` | Update an existing book's details by ID | `200 OK` / `404 Not Found` / `400 Bad Request` |
| `DELETE` | `/books/:bookId/` | Remove a book by ID | `200 OK` / `404 Not Found` / `400 Bad Request` |

---

## Parameterized SQL Queries & Security

To prevent **SQL Injection (SQLi)** vulnerabilities, user-supplied route parameters and request bodies are never directly concatenated into SQL query strings. Instead, parameterized queries with `?` placeholders are utilized:

- **Parameterized SELECT:**
  ```javascript
  const getBookQuery = `SELECT * FROM book WHERE id = ?;`
  const book = await db.get(getBookQuery, [bookId])
  ```
- **Parameterized INSERT:**
  ```javascript
  const addBookQuery = `INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);`
  await db.run(addBookQuery, [title, author, price, pages])
  ```
- **Parameterized UPDATE:**
  ```javascript
  const updateBookQuery = `UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;`
  await db.run(updateBookQuery, [title, author, price, pages, bookId])
  ```
- **Parameterized DELETE:**
  ```javascript
  const deleteBookQuery = `DELETE FROM book WHERE id = ?;`
  await db.run(deleteBookQuery, [bookId])
  ```

---

## Testing & Request Examples

### 1. GET All Books (`GET /books/`)
- **URL:** `http://localhost:3000/books/`
- **Response:** Array of all book objects in JSON format (`200 OK`).

### 2. GET Single Book (`GET /books/:bookId/`)
- **URL:** `http://localhost:3000/books/1/`
- **Response:**
  ```json
  {
    "id": 1,
    "title": "The Pragmatic Programmer",
    "author": "Andrew Hunt & David Thomas",
    "price": 45,
    "pages": 352
  }
  ```
- **Error (Non-Existent Book):** `GET http://localhost:3000/books/9999/` -> `404 Not Found` with `{"error": "Book not found"}`.
- **Error (Invalid ID):** `GET http://localhost:3000/books/abc/` -> `400 Bad Request` with `{"error": "Invalid book ID"}`.

### 3. POST Add a Book (`POST /books/`)
- **URL:** `http://localhost:3000/books/`
- **Header:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "title": "Learning Node.js",
    "author": "Nanda Kishore",
    "price": 30,
    "pages": 200
  }
  ```
- **Response:** `Book Added Successfully` (`201 Created`).

### 4. PUT Update a Book (`PUT /books/:bookId/`)
- **URL:** `http://localhost:3000/books/19/`
- **Header:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "title": "Learning Node.js Updated",
    "author": "Nanda Kishore",
    "price": 35,
    "pages": 220
  }
  ```
- **Response:** `Book Details Updated` (`200 OK`).

### 5. DELETE a Book (`DELETE /books/:bookId/`)
- **URL:** `http://localhost:3000/books/19/`
- **Response:** `Book Removed` (`200 OK`).

---

## Screenshots

The verification of all five routes and the database state is documented in the `screenshots/` directory:

### 1. GET All Books (`GET /books/`)
![Get All Books](screenshots/01-get-all-books.png)

### 2. GET Single Book (`GET /books/1/`)
![Get Single Book](screenshots/02-get-single-book.png)

### 3. Non-Existent Book (`GET /books/9999/` — 404 Not Found)
![Book Not Found](screenshots/03-get-book-404.png)

### 4. Invalid Book ID (`GET /books/abc/` — 400 Bad Request)
![Invalid Book ID](screenshots/04-invalid-id-400.png)

### 5. Create New Book Verification (`POST /books/` -> verified in `GET /books/`)
![Post Create Book](screenshots/05-post-create-book.png)

### 6. Update Book Verification (`PUT /books/19/` -> verified in `GET /books/`)
![Put Update Book](screenshots/06-put-update-book.png)

### 7. Delete Book Verification (`DELETE /books/19/` -> verified in `GET /books/`)
![Delete Book](screenshots/07-delete-book.png)

### 8. SQLite CLI Database Verification (`.tables` & Schema Query)
![SQLite CLI Verification](screenshots/08-sqlite-cli-verification.png)

---

## Problems Faced and Solutions

1. **Server-Database Startup Synchronization:**
   - *Problem:* Starting the Express HTTP server before SQLite completes opening the database connection caused unhandled promise rejections and `db is null` runtime errors on initial requests.
   - *Solution:* Encapsulated server initialization inside the asynchronous function `initializeDBAndServer()`. The Express listener `app.listen(3000)` is only invoked after `open()` resolves successfully.

2. **Detecting Missing Records for Updates and Deletions:**
   - *Problem:* Standard SQL `UPDATE` and `DELETE` commands do not throw errors when matching rows are not found; executing them against non-existent IDs silently returned success.
   - *Solution:* Checked `result.changes` on the database execution object returned by `db.run()`. When `result.changes === 0`, the endpoint returns a `404 Not Found` response with `{"error": "Book not found"}`.

3. **Handling Non-Numeric IDs:**
   - *Problem:* Passing non-numeric inputs (e.g., `/books/abc/`) to parameterized queries causes unexpected SQL behavior.
   - *Solution:* Implemented validation via `isNaN(bookId)` to immediately reject malformed requests with `400 Bad Request` and `{"error": "Invalid book ID"}`.

4. **Preventing SQL Injection (SQLi):**
   - *Problem:* Concatenating route parameters or JSON request body values directly into raw SQL query strings exposes the application to SQL injection attacks.
   - *Solution:* Replaced string concatenation with parameterized SQL queries utilizing `?` placeholders across all `SELECT`, `INSERT`, `UPDATE`, and `DELETE` statements.

5. **Local Persistent Storage vs Cloud Ephemeral Filesystems:**
   - *Problem:* Deploying file-based SQLite databases to free cloud container platforms results in data loss whenever containers recycle or sleep.
   - *Solution:* Maintained `database.db` as a tracked local database file for development and laboratory evaluation, ensuring persistent testing across runs.
