import Router from 'express'
import {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent
} from '../controller/eventController.js';

const eventRouter = new Router()

eventRouter.get('/events', getEvents)
eventRouter.get('/events/:eventId', getEvent)
eventRouter.post('/events/', createEvent)
eventRouter.put('/events/:eventId', updateEvent)
eventRouter.delete('/events/:eventId', deleteEvent)

export { eventRouter }
