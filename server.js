const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const express = require('express');
const app = express();
const connectDB = require('./config/db');
const ErrorHandler = require('./middleware/error');



//load env variable
dotenv.config({ path: './config/config.env' });

//connect DB
connectDB();



//body parser
app.use(express.json());

//start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, console.log(`Server started on ${PORT}`));

//cors

app.use(cors())


// mount routers
app.use('/api/v1/auth', require('./routes/auth'))

app.use('/api/v1', require('./routes/cat'))

app.use(ErrorHandler);

//handle unhandled rejection
process.on('unhandledRejection', (err, Promise) => {
    console.log(`Error:${err.message}`);

    server.close(() => process.exit(1))
});