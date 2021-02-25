const mongoose = require('mongoose');

const pinSchema = new mongoose.Schema({
    title: String,
    location:
        {
            lat: Number,
            lng: Number
        },
    imgPath: String,
    description: String,
    commentBox: [
        {
            commenter: String,
            comment: String
        }
    ],
    host: String,
    private: Boolean,
    expire_at: {
        type: Date,
        default: Date.now,
        expires: 0
    }
});

const Pin = mongoose.model('Pin', pinSchema);

module.exports = Pin;