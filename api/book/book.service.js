import { ObjectId } from 'mongodb'

import { logger } from '../../services/logger.service.js'
import { makeId, convertToDate } from '../../services/util.service.js'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

// const PAGE_SIZE = 3

export const bookService = {
    query,
    getById,
    add,
    update,
    remove
}


async function query(filterBy = { txt: '' }) {
    try {
        const criteria = _buildCriteria(filterBy)
        console.log(criteria)
        const collection = await dbService.getCollection('book')
        var bookCursor = await collection.find(criteria).toArray()
        return bookCursor
    } catch (err) {
        logger.error('cannot find books', err)
        throw err
    }
}

async function getById(bookId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(bookId) }

        const collection = await dbService.getCollection('book')
        const book = await collection.findOne(criteria)

        book.createdAt = book._id.getTimestamp()
        return book
    } catch (err) {
        logger.error(`while finding book ${bookId}`, err)
        throw err
    }
}

async function add(book) {

    // const bookToAdd = {
    //     stay: {
    //         ...book.stay,
    //         bookedDates: {
    //             checkIn: convertToDate(book.startDate),
    //             checkOut: convertToDate(book.endDate)
    //         }
    //     },
    // }

    console.log('book', book)
    try {
        const collection = await dbService.getCollection('book')
        const stayCollection = await dbService.getCollection('stay')
        await collection.insertOne(book)
        // const criteria = ObjectId.createFromHexString(book.stay.id)
        // await stayCollection.updateOne(criteria)

        return book

    } catch (err) {
        logger.error('cannot insert book', err)
        throw err
    }
}

async function update(book) {
    const bookToAdd = {
        userId: book.user._id,
        stayId: book.stay._id,
        hostId: book.hostId,
        totalPrice: book.totalPrice,
        startDate: book.startDate,
        endDate: book.endDate,
        guests: book.guests.adults + book.guests.children + book.guests.infants + book.guests.pets,
        msgs: book.msgs,
        status: book.status
    }
    try {
        const criteria = { _id: ObjectId.createFromHexString(book._id) }
        const collection = await dbService.getCollection('book')
        await collection.updateOne(criteria, { $set: bookToAdd })
        return bookToAdd
    } catch {
        logger.error(`cannot update book ${book._id}`, err)
        throw err
    }
}

async function remove(bookId) {
    try {
        const { loggedinUser } = asyncLocalStorage.getStore()
        const { _id: ownerId} = loggedinUser

        const criteria = { _id: ObjectId.createFromHexString(bookId) }
        const collection = await dbService.getCollection('book')

        // remove only user the review's owner
        // criteria['owner._id'] = ownerId

        const res = await collection.deleteOne(criteria)
        if (res.deletedCount === 0) throw ('Not your stay')

    } catch (err) {
        logger.error(`cannot remove book ${bookId}`, err)
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