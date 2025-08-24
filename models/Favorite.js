const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    imdbID: { type: String, required: true },
    email: { type: String, required: true },
    title: { type: String, required: true },
    year: { type: String, required: true },
    poster: { type: String, required: true },
    rating: { type: String, required: true },
});

module.exports = mongoose.model('Favorite', favoriteSchema);
