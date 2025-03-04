import express from 'express'

import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import { getStays, getStayById, addStay, updateStay, removeStay, addStayReview, removeStayReview } from './stay.controller.js'

const router = express.Router()

// We can add a middleware for the entire router:
// router.use(requireAuth)

router.get('/', log, getStays)
router.get('/:id', log, getStayById)
router.post('/', log, requireAuth, addStay)
router.put('/:id', requireAuth, updateStay)
router.delete('/:id', requireAuth, removeStay)
// router.delete('/:id', requireAuth, requireAdmin, removeStay)

router.post('/:id/review', requireAuth, addStayReview)
router.delete('/:id/review/:reviewId', requireAuth, removeStayReview)

export const stayRoutes = router