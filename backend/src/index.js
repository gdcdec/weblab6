import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './database/config/db.js';
import { userRouter } from './router/userRouter.js';
import { eventRouter } from './router/eventRouter.js';
import { authRouter } from './router/authRouter.js';
import { swaggerSpec } from './swagger.js';
import swaggerUi from 'swagger-ui-express';

const DefaultHttpPortNumber = 3000;

// Initiation of Express
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

app.use(cors());

// Custom format of logging
app.use(morgan(':method :url :status :response-time ms'));

app.use(userRouter);
app.use(authRouter);
app.use(eventRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Home page route
app.get('/', (req, res) => {
    res.json({message: "Hello, world!"});
});

app.use((req, res) => {
    res.status(404).json({ "message": "Not found" });
});

app.use( ( err, req, res, next ) => {
    res.status(500).json({ "message": "Something went wrong" } );
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
