import Router from 'express';
import { createUser, loginUser } from '../controller/userController.js';

const authRouter = new Router();

authRouter.post("/register", createUser);
authRouter.post("/login", loginUser);

export { authRouter }
