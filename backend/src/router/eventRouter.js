import Router from 'express'
import {
    getEvents,
    getEventById,
    getEventByCat,
    createEvent,
    updateEvent,
    deleteEvent
} from '../controller/eventController.js';

const eventRouter = new Router()

eventRouter.get('/events', getEvents)
eventRouter.get('/events/id/:eventId', getEventById)
eventRouter.get('/events/cat/:eventCat', getEventByCat)
eventRouter.post('/events/', createEvent)
eventRouter.put('/events/:eventId', updateEvent)
eventRouter.delete('/events/:eventId', deleteEvent)

export { eventRouter }
