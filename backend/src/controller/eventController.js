import { eventModel, categories } from "../database/model/eventModel.js";
import userModel from "../database/model/userModel.js";


const getEvents = async (req, res, next) => {
    try {
        const events = await eventModel.findAll()
        return res.status(200).json(events)
    } catch (e) {
        next(e)
    }
}

const getEventById = async (req, res, next) => {
    try {
        const { eventId } = req.params

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

const getEventByCat = async (req, res, next) => {
    try {
        const { eventCat } = req.params
        let legal_category = false;

        Object.keys(categories).forEach(cat => {
            if(eventCat == cat) {
                legal_category = true;
            }
        });

        if(!legal_category) {
            return res.status(400).json({
                message: `Illegal category -- '${eventCat}'`
            })
        }

        const events = await eventModel.findAll({
            where: { category: eventCat },
            include: [{
                model: userModel,
                attributes: ['id', 'name']
            }]
        })

        if(!Object.keys(events).length) {
            return res.status(400).json({ message: `Events with category '${eventCat}' not found` })
        }

        return res.status(200).json(events)
    } catch(err) {
        next(err)
    }
}

const createEvent = async (req, res, next) => {
    try {
        let legal_category = false;
        const { title, description, date, createdBy, category } = req.body

        if(!title || !date || !createdBy || !category) {
            return res.status(400).json({
                message: "Fields 'title', 'date', 'createdBy', 'category' required"
            })
        }

        Object.keys(categories).forEach(cat => {
            if(category == cat) {
                legal_category = true;
            }
        });

        if(!legal_category) {
            return res.status(400).json({
                message: `Illegal category -- '${category}'`
            })
        }

        const eventDate = new Date(date)
        if(isNaN(eventDate.getTime())) {
            return res.status(400).json({
                message: "invalid date format, required YYYY-MM-DDTHH:mm:ss.sssZ "
            })
        }

        const event = await eventModel.create({
            title,
            description,
            date,
            createdBy,
            category
        })

        return res.status(201).json(event)
    } catch(err) {
        next(err)
    }
}

const updateEvent = async (req, res, next) => {
    try {
        const { eventId } = req.params
        const { title, description, date, createdBy, category } = req.body

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
        event.category = category || event.category;
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

export {
    getEvents,
    getEventById,
    getEventByCat,
    createEvent,
    updateEvent,
    deleteEvent
}
