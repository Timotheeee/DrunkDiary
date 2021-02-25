const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const morgan = require('morgan');
const auth = require('./helper/Auth');
const cookieParser = require('cookie-parser');
const path = require('path');


const taskRoutes = require('./routes/tasks.routes');
const userRoutes = require('./routes/user.routes');
const pinRoutes = require('./routes/pin.routes');
const imagePath = require('./config').imagePath;
const globalErrHandler = require('./controllers/errorController');
const app = express();

app.use(morgan('combined'));

// Allow Cross-Origin requests
app.use(cors());

// Set security HTTP headers
app.use(helmet());

app.use(cookieParser());

//app.use(auth);
// Limit request from the same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 1000,
    message: 'Too Many Request from this IP, please try again in an hour'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({
    limit: '15kb'
}));

// Data sanitization against Nosql query injection
app.use(mongoSanitize());

// Data sanitization against XSS(clean user input from malicious HTML code)
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/user', userRoutes);
app.use('/api/pin', pinRoutes);

// Makes the server's logfile accessible without the need to ssh into the machine
app.use('/log', express.static('/mnt/log.txt'));

// Makes the pin images available
app.use('/images', express.static(path.join(__dirname, imagePath)));

app.use(globalErrHandler);

module.exports = app;
