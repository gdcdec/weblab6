import express from 'express';
import cors from 'cors';
import { connectDB } from './database/config/db.js';
import { userRouter } from './router/userRouter.js';
import { eventRouter } from './router/eventRouter.js';
import { swaggerSpec } from './swagger.js';
import swaggerUi from 'swagger-ui-express';

const DefaultHttpPortNumber = 3000;

// Initiation of Express
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

app.use(cors());

app.use(userRouter);
app.use(eventRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Home page route
app.get('/', (req, res) => {
    res.json({message: "Hello, world!"});
});

// Start server
app.listen(DefaultHttpPortNumber, (err) => {
    // connect to the database  before starting the server
    connectDB();
    if(err)
        console.error(`Port ${DefaultHttpPortNumber} is busy`);
    else
        console.log(`Server is running on http://localhost:${DefaultHttpPortNumber}`);
});
