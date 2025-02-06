import { ObjectId } from 'mongodb'

import { logger } from '../../services/logger.service.js'
import { makeId, convertToDate } from '../../services/util.service.js'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

// const PAGE_SIZE = 3

export const orderService = {
    query,
    getById,
    add,
    update,
    remove
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

    const orderToAdd = {
        userId: order.user._id,
        stayId: order.stay._id,
        hostId: order.hostId,
        hostName: order.hostName,
        totalPrice: convertToDate(order.totalPrice),
        startDate: convertToDate(order.startDate),
        endDate: order.endDate,
        guests: order.guests.adults + order.guests.children + order.guests.infants + order.guests.pets,
        msgs: order.msgs || [],
        status: order.status || 'pending',
        stay: {
            ...order.stay,
            bookedDates: {
                checkIn: convertToDate(order.startDate),
                checkOut: convertToDate(order.endDate)
            }
        },
    }

    try {
        const collection = await dbService.getCollection('order')
        const stayCollection = await dbService.getCollection('stay')
        await collection.insertOne(orderToAdd)
        const criteria = { _id: ObjectId.createFromHexString(order.stay._id) }
        await stayCollection.updateOne(criteria, { $push: { bookedDates: { checkIn: convertToDate(order.startDate), checkOut: convertToDate(order.endDate) } } })

        return orderToAdd

    } catch (err) {
        logger.error('cannot insert order', err)
        throw err
    }
}

async function update(order) {
    const orderToAdd = {
        userId: order.user._id,
        stayId: order.stay._id,
        hostId: order.hostId,
        totalPrice: order.totalPrice,
        startDate: order.startDate,
        endDate: order.endDate,
        guests: order.guests.adults + order.guests.children + order.guests.infants + order.guests.pets,
        msgs: order.msgs,
        status: order.status
    }
    try {
        const criteria = { _id: ObjectId.createFromHexString(order._id) }
        const collection = await dbService.getCollection('order')
        await collection.updateOne(criteria, { $set: orderToAdd })
        return orderToAdd
    } catch {
        logger.error(`cannot update order ${order._id}`, err)
        throw err
    }
}

async function remove(orderId) {
    try {
        const { loggedinUser } = asyncLocalStorage.getStore()
        const { _id: ownerId, isAdmin } = loggedinUser

        const criteria = { _id: ObjectId.createFromHexString(orderId) }
        const collection = await dbService.getCollection('order')

        // remove only if user is admin or the review's owner
        if (!isAdmin) criteria['owner._id'] = ownerId

        const res = await collection.deleteOne(criteria)
        if (res.deletedCount === 0) throw ('Not your stay')

    } catch (err) {
        logger.error(`cannot remove order ${orderId}`, err)
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