import { logger } from '../../services/logger.service.js'
import { bookService } from './book.service.js'

export async function getBooks(req, res) {
    try {
        const filterBy = {
            // hostId: req.query?.hostId || '',
            // userId: req.query?.userId || '',
        }

        const books = await bookService.query(filterBy)
        res.json(books)
    } catch (err) {
        logger.error('Failed to get books', err)
        res.status(400).send({ err: 'Failed to get books' })
    }
}

export async function getBookById(req, res) {
    try {
        const bookId = req.params.id
        const book = await bookService.getById(bookId)
        res.json(book)
    } catch (err) {
        logger.error('Failed to get book', err)
        res.status(400).send({ err: 'Failed to get book' })
    }
}

export async function addBook(req, res) {
    const { loggedinUser, body: book } = req

    try {
        book.user = loggedinUser
        const addedBook = await bookService.add(book)
        res.json(addedBook)
    } catch (err) {
        logger.error('Failed to add book', err)
        res.status(400).send({ err: 'Failed to add book' })
    }
}

export async function updateBook(req, res) {
    const { loggedinUser, body: book } = req
    const { _id: userId } = loggedinUser


    if (book.host._id !== userId) {
        res.status(403).send('Not your book...')
        return
    }

    try {
        const updatedBook = await bookService.update(book)
        res.json(updatedBook)
    } catch (err) {
        logger.error('Failed to update book', err)
        res.status(400).send({ err: 'Failed to update book' })
    }
}

export async function removeBook(req, res) {
console.log('hi')
    
    try {
        const bookId = req.params.id
        const removedId = await bookService.remove(bookId)

        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove book', err)
        res.status(400).send({ err: 'Failed to remove book' })
    }
}
