const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
});

module.exports = ratingSchema;