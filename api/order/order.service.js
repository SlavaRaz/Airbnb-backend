import { ObjectId } from 'mongodb'

import { logger } from '../../services/logger.service.js'
import { makeId } from '../../services/util.service.js'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

// const PAGE_SIZE = 3

export const orderService = {
    query,
    getById,
    add,
    // update
}


async function query(filterBy = { txt: '' }) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('order')
        var orderCursor = await collection.find(criteria).toArray()
        return orderCursor
    } catch (err) {
        logger.error('cannot find orders', err)
        throw err
    }
}

async function getById(orderId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(orderId) }

        const collection = await dbService.getCollection('order')
        const order = await collection.findOne(criteria)

        order.createdAt = order._id.getTimestamp()
        return order
    } catch (err) {
        logger.error(`while finding order ${orderId}`, err)
        throw err
    }
}

async function add(order) {

    console.log('order',order)
    const orderToAdd = {
        userId: order.user._id,
        stayId: order.stay._id,
        hostId: order.hostId,
        hostName: order.hostName,
        totalPrice: order.totalPrice,
        startDate: order.startDate,
        endDate: order.endDate,
        guests: order.guests.adults + order.guests.children + order.guests.infants + order.guests.pets,
        msgs: order.msgs || [],
        status: order.status || 'pending'
    }

    try {
        const collection = await dbService.getCollection('order')
        await collection.insertOne(orderToAdd)
        return orderToAdd

    } catch (err) {
        logger.error('cannot insert order', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.hostId) {
        criteria.hostId = { $regex: filterBy.hostId, $options: 'i' }
    }
    if (filterBy.userId) {
        criteria.userId = { $regex: filterBy.userId, $options: 'i' }
    }
}