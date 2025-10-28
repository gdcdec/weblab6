import express from 'express';
import cors from 'cors';
import { connectDB } from './database/config/db.js';

const DefaultHttpPortNumber = 3000;

// Initiation of Express
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

app.use(cors());

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
