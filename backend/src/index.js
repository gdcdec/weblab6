// index.js
import express from 'express';
import cors from 'cors';

const DefaultHttpPortNumber = 3000;

// Express initiation
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home page route
app.get('/', (req, res) => {
    res.json({test: "Hello, world!"});
});

// Start server
app.listen(DefaultHttpPortNumber, (err) => {
    if(err)
        console.error(`Port number ${DefaultHttpPortNumber} is busy`);
    else
        console.log(`Server is running on http://localhost:${DefaultHttpPortNumber}`);
});
