import { Router } from 'express';
import { requireJwt } from '@config/passport.js';
import { getUsers, createUser } from '@controllers/userController.js';
import { createEvent, updateEvent, deleteEvent } from '@controllers/eventController.js';

const privateRouter = Router();

privateRouter.post('/events', requireJwt, createEvent);
privateRouter.put('/events/id/:eventId', requireJwt, updateEvent);
privateRouter.delete('/events/id/:eventId', requireJwt, deleteEvent);
privateRouter.get('/users', requireJwt, getUsers);
privateRouter.post('/users', requireJwt, createUser);

export { privateRouter };
