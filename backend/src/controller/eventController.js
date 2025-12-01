import { Op } from 'sequelize';
import dotenv from 'dotenv';
import { eventModel, categories } from "../database/model/eventModel.js";
import userModel from "../database/model/userModel.js";

// load .env configuration
dotenv.config()

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Retrieve all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: A list of all events
 *       500:
 *         description: Internal server error
 */
const getEvents = async (req, res, next) => {
    try {
        const events = await eventModel.findAll()
        return res.status(200).json(events)
    } catch (e) {
        next(e)
    }
}

/**
 * @swagger
 * /events/id/{eventId}:
 *   get:
 *     summary: Get a specific event by ID
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Event details
 *       400:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /events/cat/{eventCat}:
 *   get:
 *     summary: Get events by category
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of events in the specified category
 *       400:
 *         description: Illegal category or no events found
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               createdBy:
 *                 type: integer
 *               category:
 *                 type: string
 *             required:
 *               - title
 *               - date
 *               - createdBy
 *               - category
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Missing required fields, illegal category, or invalid date format
 *       500:
 *         description: Internal server error
 */
const createEvent = async (req, res, next) => {
    try {
        let legal_category = false;
        const { title, description, date, createdBy, category } = req.body;
        const dailyLimit = process.env.DAILY_LIMIT;

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
                message: "Invalid date format, required YYYY-MM-DDTHH:mm:ss.sssZ "
            })
        }

        // Calculate the time 24 hours ago in milliseconds
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Count records created in the last 24 hours
        const count = await eventModel.count({
            where: {
                createdAt: {
                    // Find records created after this time
                    [Op.gte]: twentyFourHoursAgo
                }
            }
        });


        // Check if the limit has been exceeded
        if (count > dailyLimit) {
            return res.status(403).json({
                message: `Daily creation limit of '${dailyLimit}' has been reached. Count is ${count}`
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

/**
 * @swagger
 * /events/{eventId}:
 *   put:
 *     summary: Update an existing event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               createdBy:
 *                 type: integer
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       400:
 *         description: Event not found or invalid date format
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /events/{eventId}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       400:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
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
