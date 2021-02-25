
const app = require('./app');
const SocketController = require('./controllers/socketController');
const ImageController = require('./controllers/imageController');
const mongoose = require('mongoose');
const socketIO = require('socket.io');


// Starting the server
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, function() {
    console.log(`Listening on ${PORT}`);
});


// Connecting to the database
const connection = 'mongodb://psituser2:stillrunninglegacy@160.85.252.71:27017/mongoDB';
mongoose.connect(connection).then(() => {
    console.log('MongoDB connected')
});

// Starting regular cleanup of images
ImageController.cleanupImages();
setInterval(
    () => ImageController.cleanupImages(),
    24 * 60 * 60 * 1000);

// Creating the socket server
const io = socketIO(server);
new SocketController(io);
console.log("Socket server was created.");

//UNCOMMENT THIS TO DELETE ALL TASKS
// var db = mongoose.connection;
// db.once('open', function () {
//     console.log("db connect");
//     db.dropCollection("tasks", function (a, b) {
//         console.log(a);
//         console.log(b);
//     });
// });
