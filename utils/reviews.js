const Review = require('../models/Review')

const getReviewsByMovieId = async(movieId) => {

  const reviews = await Review.find({imdbID: movieId}).lean().exec()

  return reviews;
}

module.exports = getReviewsByMovieId