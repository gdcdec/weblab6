import { Router } from 'express';
import { createUser } from '@controllers/userController.js';
import {
  getEvents,
  getEventById,
  getEventByCat,
} from '@controllers/eventController.js';

const publicRouter = Router();

publicRouter.get('/events', getEvents);
publicRouter.get('/events/id/:eventId', getEventById);
publicRouter.get('/events/cat/:eventCat', getEventByCat);
publicRouter.post('/register', createUser);

export { publicRouter };
