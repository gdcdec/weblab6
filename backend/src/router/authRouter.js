import Router from 'express';
import { createUser } from '../controller/userController.js';

const authRouter = new Router();

authRouter.post("/register", createUser);

export { authRouter }
