import Router from 'express';
import { loginUser, refreshToken } from '../controller/userController.js';

const authRouter = new Router();

authRouter.post("/refresh", refreshToken);
authRouter.post("/login", loginUser);

export { authRouter }
