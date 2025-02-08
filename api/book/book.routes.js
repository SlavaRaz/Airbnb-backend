import express from 'express'

import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import { getBookById, getBooks, addBook, removeBook, updateBook } from './book.controller.js'

const router = express.Router()

router.get('/', log, requireAuth, getBooks)
router.get('/:id', log, requireAuth, getBookById)
router.post('/', log, requireAuth, addBook)
// router.put('/:id', log, requireAuth, updateBook)
router.put('/:id',log, requireAuth, removeBook)

export const bookRoutes = router