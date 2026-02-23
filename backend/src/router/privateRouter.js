import Router from 'express';
import passport from 'passport';
import { requireJwt } from '../config/passport.js';
import { getUsers, createUser} from '../controller/userController.js';
import {
    createEvent,
    updateEvent,
    deleteEvent,
} from '../controller/eventController.js';

const privateRouter = new Router();

privateRouter.post('/events/', requireJwt, createEvent);
privateRouter.put('/events/id/:eventId', requireJwt, updateEvent);
privateRouter.delete('/events/id/:eventId', requireJwt, deleteEvent);
privateRouter.get('/users', requireJwt, getUsers);
privateRouter.post('/users', requireJwt, createUser);

export { privateRouter }
