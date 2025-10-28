import Router from 'express';
import { getUsers, createUser} from '../controller/userController.js';

const userRouter = new Router()

userRouter.get('/users', getUsers)
userRouter.post('/users', createUser)

export { userRouter }
