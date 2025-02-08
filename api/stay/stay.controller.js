import { logger } from '../../services/logger.service.js'
import { stayService } from './stay.service.js'

export async function getStays(req, res) {
	console.log('req.query.guests', req.query.guests)
	try {
		const filterBy = {
			location: req.query.location || '',
			categories: req.query.categories || '',
			bookedDates: {
				checkIn: req.query.checkIn || '',
				checkOut: req.query.checkOut || ''
			},
			guests:
				(parseInt(req.query.guests.adults)) || 0 +
				(parseInt(req.query.guests.children)) || 0 +
				(parseInt(req.query.guests.infants)) || 0 +
				(parseInt(req.query.guests.pets)) || 0

		}
		const stays = await stayService.query(filterBy)
		res.json(stays)
	} catch (err) {
		logger.error('Failed to get stays', err)
		res.status(400).send({ err: 'Failed to get stays' })
	}
}

export async function getStayById(req, res) {
	try {
		const stayId = req.params.id
		console.log(stayId)
		const stay = await stayService.getById(stayId)
		res.json(stay)
	} catch (err) {
		logger.error('Failed to get stay', err)
		res.status(400).send({ err: 'Failed to get stay' })
	}
}

export async function addStay(req, res) {
	const { loggedinUser, body: stay } = req

	try {
		stay.host = loggedinUser
		const addedStay = await stayService.add(stay)
		res.json(addedStay)
	} catch (err) {
		logger.error('Failed to add stay', err)
		res.status(400).send({ err: 'Failed to add stay' })
	}
}

export async function updateStay(req, res) {
	const { loggedinUser, body: stay } = req
	const { _id: userId } = loggedinUser

	if (stay.host._id !== userId) {
		res.status(403).send('Not your stay...')
		return
	}

	try {
		const updatedStay = await stayService.update(stay)
		res.json(updatedStay)
	} catch (err) {
		logger.error('Failed to update stay', err)
		res.status(400).send({ err: 'Failed to update stay' })
	}
}

export async function removeStay(req, res) {
	try {
		const stayId = req.params.id
		const removedId = await stayService.remove(stayId)

		res.send(removedId)
	} catch (err) {
		logger.error('Failed to remove stay', err)
		res.status(400).send({ err: 'Failed to remove stay' })
	}
}

export async function addStayReview(req, res) {
	const { loggedinUser } = req
	try {
		const stayId = req.params.id
		const review = {
			txt: req.body.review.txt,
			rate: req.body.review.rate,
			by: loggedinUser
		}
		const saveReview = await stayService.addStayReview(stayId, review)
		res.json(saveReview)
	} catch (err) {
		logger.error('Failed to update stay', err)
		res.status(400).send({ err: 'Failed to update stay' })
	}
}

export async function removeStayReview(req, res) {
	try {

		const { id: stayId, reviewId } = req.params
		const removedId = await stayService.removeStayReview(stayId, reviewId)
		res.send(removedId)
	} catch (err) {
		logger.error('Failed to remove stay msg', err)
		res.status(400).send({ err: 'Failed to remove stay msg' })
	}
}
