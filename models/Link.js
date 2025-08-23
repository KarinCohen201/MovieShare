const mongoose = require("mongoose");

const LinkSchema = new mongoose.Schema({
    username: { type: String, required: true }, 
    email: { type: String, required: true }, 
    imdbID: { type: String, required: true }, 
    urlName: { type: String, required: true }, 
    url: { type: String, required: true },      
    description: { type: String, required: true },  
    linkType: { 
        type: String, 
        enum: ["private", "public"], 
        required: true 
    },
    ratings: {
        type: [{
            user: { type: String },
            score: { type: Number, min: 1, max: 10 }
        }],
        default: []  
    },
    averageRating: { type: Number, default: 0 } 
});


LinkSchema.pre("save", function(next) {
    if (this.ratings.length > 0) {
        const sum = this.ratings.reduce((acc, rating) => acc + rating.score, 0);
        this.averageRating = sum / this.ratings.length;
    } else {
        this.averageRating = 0;
    }
    next();
});

module.exports = mongoose.model("Link", LinkSchema);