const express = require('express')
const {open} = require('sqlite')
const path = require('path')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'database.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    // Ensure database table exists with the specified schema
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        author TEXT,
        price INTEGER,
        pages INTEGER
      );
    `)

    // Seed sample records if database table is empty
    const bookCount = await db.get(`SELECT COUNT(*) as count FROM book;`)
    if (bookCount && bookCount.count === 0) {
      await db.exec(`
        INSERT INTO book (title, author, price, pages) VALUES
        ('The Pragmatic Programmer', 'Andrew Hunt & David Thomas', 45, 352),
        ('Clean Code', 'Robert C. Martin', 40, 464),
        ('JavaScript: The Good Parts', 'Douglas Crockford', 30, 176),
        ('Design Patterns', 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', 55, 395),
        ('Introduction to Algorithms', 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein', 85, 1312),
        ('You Don''t Know JS Yet', 'Kyle Simpson', 25, 142),
        ('Designing Data-Intensive Applications', 'Martin Kleppmann', 50, 616),
        ('Refactoring: Improving the Design of Existing Code', 'Martin Fowler', 48, 448),
        ('Node.js Design Patterns', 'Mario Casciaro & Luciano Mammino', 42, 520),
        ('Eloquent JavaScript', 'Marijn Haverbeke', 35, 472);
      `)
    }

    app.listen(3000, () => {
      console.log('Server running on port 3000')
    })
  } catch (error) {
    console.log(`Database error: ${error.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

// API 1: Get all books
// GET /books/
app.get('/books/', async (request, response) => {
  try {
    const getBooksQuery = `
      SELECT *
      FROM book;
    `
    const books = await db.all(getBooksQuery)
    response.send(books)
  } catch (error) {
    response.status(500).json({error: error.message})
  }
})

// API 2: Add a book
// POST /books/
app.post('/books/', async (request, response) => {
  try {
    const {title, author, price, pages} = request.body

    const addBookQuery = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `
    await db.run(addBookQuery, [title, author, price, pages])
    response.status(201).send('Book Added Successfully')
  } catch (error) {
    response.status(500).json({error: error.message})
  }
})

// API 3: Get a single book by ID
// GET /books/:bookId/
app.get('/books/:bookId/', async (request, response) => {
  try {
    const {bookId} = request.params

    if (isNaN(bookId)) {
      return response.status(400).json({error: 'Invalid book ID'})
    }

    const getBookQuery = `
      SELECT *
      FROM book
      WHERE id = ?;
    `
    const book = await db.get(getBookQuery, [bookId])

    if (!book) {
      return response.status(404).json({error: 'Book not found'})
    }

    response.send(book)
  } catch (error) {
    response.status(500).json({error: error.message})
  }
})

// API 4: Update an existing book by ID
// PUT /books/:bookId/
app.put('/books/:bookId/', async (request, response) => {
  try {
    const {bookId} = request.params
    const {title, author, price, pages} = request.body

    if (isNaN(bookId)) {
      return response.status(400).json({error: 'Invalid book ID'})
    }

    const updateBookQuery = `
      UPDATE book
      SET title = ?,
          author = ?,
          price = ?,
          pages = ?
      WHERE id = ?;
    `
    const result = await db.run(updateBookQuery, [
      title,
      author,
      price,
      pages,
      bookId,
    ])

    if (result.changes === 0) {
      return response.status(404).json({error: 'Book not found'})
    }

    response.send('Book Details Updated')
  } catch (error) {
    response.status(500).json({error: error.message})
  }
})

// API 5: Delete a book by ID
// DELETE /books/:bookId/
app.delete('/books/:bookId/', async (request, response) => {
  try {
    const {bookId} = request.params

    if (isNaN(bookId)) {
      return response.status(400).json({error: 'Invalid book ID'})
    }

    const deleteBookQuery = `
      DELETE FROM book
      WHERE id = ?;
    `
    const result = await db.run(deleteBookQuery, [bookId])

    if (result.changes === 0) {
      return response.status(404).json({error: 'Book not found'})
    }

    response.send('Book Removed')
  } catch (error) {
    response.status(500).json({error: error.message})
  }
})

module.exports = app
