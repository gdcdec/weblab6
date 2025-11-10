import Router from 'express'
import {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
} from '../controller/eventController.js';

const eventRouter = new Router()

eventRouter.get('/events', getEvents)
eventRouter.get('/events/:eventId', getEventById)
eventRouter.post('/events/', createEvent)
eventRouter.put('/events/:eventId', updateEvent)
eventRouter.delete('/events/:eventId', deleteEvent)

export { eventRouter }
