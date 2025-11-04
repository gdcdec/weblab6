import eventModel from "../database/model/eventModel.js";
import userModel from "../database/model/userModel.js";


const getEvents = async (req, res, next) => {
    try {
        const events = await eventModel.findAll()
        return res.status(200).json(events)
    } catch (e) {
        next(e)
    }
}

const getEvent = async (req, res, next) => {
    try {
        const { eventId } = req.params

        if(!eventId) {
            return res.status(400).json({ message: "'eventId' required" })
        }

        const filter = {}
        filter.id = eventId

        const event = await eventModel.findOne({
            where: filter,
            include: [{
                model: userModel,
                attributes: ['id', 'name']
            }]
        })

        if(!event) {
            return res.status(400).json({ message: `Event No. ${ eventId } not found` })
        }

        return res.status(200).json(event)
    } catch(err) {
        next(err)
    }
}

const createEvent = async (req, res, next) => {
    try {
        const { title, description, date, createdBy } = req.body

        if (!title || !date || !createdBy) {
            return res.status(400).json({
                message: "Fields 'title', 'date', 'createdBy' required"
            })
        }

        const eventDate = new Date(date)
        if (isNaN(eventDate.getTime())) {
            return res.status(400).json({
                message: "invalid date format, required YYYY-MM-DDTHH:mm:ss.sssZ "
            })
        }

        const event = await eventModel.create({
            title,
            description,
            date,
            createdBy
        })

        return res.status(201).json(event)
    } catch(err) {
        next(err)
    }
}

const updateEvent = async (req, res, next) => {
    try {
        const { eventId } = req.params
        const { title, description, date, createdBy, categoryId } = req.body

        let eventDate = null

        if (date) {
            eventDate = new Date(date)
            if (isNaN(eventDate.getTime())) {
                return res.status(400).json({
                    message: "Invalid date format, required YYYY-MM-DDTHH:mm:ss.sssZ "
                })
            }
        }

        const event = await eventModel.findOne({ where: { id: eventId } })

        if (!event) {
            return res.status(400).json({ message: `Event ${eventId} not found` })
        }

        event.id = eventId || event.id
        event.title = title || event.title;
        event.description = description || event.description;
        event.date = date || event.date;
        event.createdBy = createdBy || event.createdBy;
        await event.save()

        return res.status(200).json(event)
    } catch(err) {
        next(err)
    }
}




const deleteEvent = async (req, res, next) => {
    try {
        const { eventId } = req.params

        const event = await eventModel.findOne({ where: { id: eventId } })

        if (!event) {
            return res.status(400).json({ message: `Event No. ${eventId} not found` })
        }

        await event.destroy()

        return res.status(200).send()
    } catch(err) {
        next(err)
    }
}

export { getEvents, getEvent, createEvent, updateEvent, deleteEvent }
