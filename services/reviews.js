const Review = require("../models/Review");

const topReviewers = async (limit) => {
  try {
    const topReviewers = await Review.aggregate([
      { $group: { _id: "$email", totalReviews: { $sum: 1 } } }, // Count reviews per user
      { $sort: { totalReviews: -1 } }, // Sort in descending order
      { $limit: limit }, // Get top user
    ]);

    return topReviewers;
  } catch (error) {
    return false;
  }
};

const totalReviews = async (limit) => {
  try {

    const reviews = await Review.countDocuments();

    return reviews;

  } catch (error) {
    console.log(error)
    return false;
    
  }
};

const totalDistinctReviews = async (field, limit) => {
  try {

    const reviews = await Review.distinct(field).then(users => users.length);

    return reviews;

  } catch (error) {
    console.log(error)
    return false;
    
  }
};

module.exports = {
  topReviewers,
  totalReviews,
  totalDistinctReviews,
};
