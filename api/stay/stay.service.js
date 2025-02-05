import { ObjectId } from 'mongodb'

import { logger } from '../../services/logger.service.js'
import { makeId } from '../../services/util.service.js'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

const PAGE_SIZE = 3

export const stayService = {
	remove,
	query,
	getById,
	add,
	update,
	addStayReview,
	removeStayReview,
}

async function query(filterBy = { txt: '' }) {
	try {
		const criteria = _buildCriteria(filterBy)
		const collection = await dbService.getCollection('stay')
		var stayCursor = await collection.find(criteria).toArray()
		return stayCursor
	} catch (err) {
		logger.error('cannot find stays', err)
		throw err
	}
}

async function getById(stayId) {
	try {
		const criteria = { _id: ObjectId.createFromHexString(stayId) }

		const collection = await dbService.getCollection('stay')
		const stay = await collection.findOne(criteria)

		stay.createdAt = stay._id.getTimestamp()
		return stay
	} catch (err) {
		logger.error(`while finding stay ${stayId}`, err)
		throw err
	}
}

async function remove(stayId) {
	const { loggedinUser } = asyncLocalStorage.getStore()
	const { _id: ownerId, isAdmin } = loggedinUser

	try {
		const criteria = {
			_id: ObjectId.createFromHexString(stayId),
		}
		if (!isAdmin) criteria['owner._id'] = ownerId

		const collection = await dbService.getCollection('stay')
		const res = await collection.deleteOne(criteria)

		if (res.deletedCount === 0) throw ('Not your stay')
		return stayId
	} catch (err) {
		logger.error(`cannot remove stay ${stayId}`, err)
		throw err
	}
}

async function add(stay) {
	try {
		const collection = await dbService.getCollection('stay')
		await collection.insertOne(stay)

		return stay
	} catch (err) {
		logger.error('cannot insert stay', err)
		throw err
	}
}

async function update(stay) {
	const stayToSave = { vendor: stay.vendor, speed: stay.speed }

	try {
		const criteria = { _id: ObjectId.createFromHexString(stay._id) }

		const collection = await dbService.getCollection('stay')
		await collection.updateOne(criteria, { $set: stayToSave })

		return stay
	} catch (err) {
		logger.error(`cannot update stay ${stay._id}`, err)
		throw err
	}
}

async function addStayReview(stayId, review) {
	try {
		const criteria = { _id: ObjectId.createFromHexString(stayId) }
		review.id = makeId()

		const collection = await dbService.getCollection('stay')
		await collection.updateOne(criteria, { $push: { reviews: review } })

		return review
	} catch (err) {
		logger.error(`cannot add stay review ${stayId}`, err)
		throw err
	}
}

async function removeStayReview(stayId, reviewId) {
	try {
		const criteria = { _id: ObjectId.createFromHexString(stayId) }

		const collection = await dbService.getCollection('stay')
		await collection.updateOne(criteria, { $pull: { reviews: { id: reviewId } } })

		return reviewId
	} catch (err) {
		logger.error(`cannot add stay review ${stayId}`, err)
		throw err
	}
}

function _buildCriteria(filterBy) {
	const criteria = {}

	if (filterBy.location) {
		criteria["loc.country"] = { $regex: filterBy.location, $options: 'i' }
	}
	if (filterBy.categories) {
		criteria.type = { $in: [filterBy.categories] }
	}
	if (filterBy.guests) {
		console.log(filterBy.guests)
		criteria.capacity = { $gte: filterBy.guests }
	}



	return criteria
}

// function _buildSort(filterBy) {
// 	if (!filterBy.sortField) return {}
// 	return { [filterBy.sortField]: filterBy.sortDir }
// }