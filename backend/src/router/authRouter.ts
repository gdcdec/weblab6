import { Router } from 'express';
import { loginUser, refreshToken } from '@controllers/userController.js';

const authRouter = Router();

authRouter.post('/refresh', refreshToken);
authRouter.post('/login', loginUser);

export { authRouter };
