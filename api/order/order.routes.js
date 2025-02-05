import express from 'express'

import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import { getOrderById, getOrders, addOrder, removeOrder, updateOrder } from './order.controller.js'

const router = express.Router()

router.get('/', log, requireAuth, getOrders)
router.get('/:id', log, requireAuth, getOrderById)
router.post('/', requireAuth, addOrder)
router.put('/:id', log, requireAuth, requireAdmin, updateOrder)
router.delete('/:id', requireAuth, requireAdmin, removeOrder)

export const orderRoutes = router