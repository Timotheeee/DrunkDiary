const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type : String,
        lowercase: true,
        unique: true,
        required: true,
        trim: true
    },
    birthdate : Date,
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 999
    },
    salt: String,
    color : String,
    friends: [{type : String}],
    socket: String,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
