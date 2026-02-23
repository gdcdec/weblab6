import Router from "express";
import { createUser } from '../controller/userController.js';
import {
    getEvents,
    getEventById,
    getEventByCat
} from '../controller/eventController.js';

const publicRouter = new Router();

// Public route GET /events
publicRouter.get("/events", getEvents);
publicRouter.get('/events/id/:eventId', getEventById)
publicRouter.get('/events/cat/:eventCat', getEventByCat)

// Register new user
publicRouter.post("/register", createUser);

export { publicRouter }
