// index.ts
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from '@config/db.js';
import { publicRouter } from '@router/publicRouter.js';
import { privateRouter } from '@router/privateRouter.js';
import { authRouter } from '@router/authRouter.js';
import { swaggerSpec } from '@config/swagger.js';
import swaggerUi from 'swagger-ui-express';
import { passport } from '@config/passport.js';

const DefaultHttpPortNumber = 3000;

const app: Express = express();

app.use(express.json());
app.use(cors());
app.use(morgan(':method :url :status :response-time ms'));
app.use(passport.initialize());

app.use(publicRouter);
app.use(privateRouter);
app.use(authRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello, world!' });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Not found' });
});

app.listen(DefaultHttpPortNumber, (err?: Error) => {
  connectDB();
  if (err) {
    console.error(`Port ${DefaultHttpPortNumber} is busy`);
  } else {
    console.log(`Server is running on http://localhost:${DefaultHttpPortNumber}`);
  }
});
