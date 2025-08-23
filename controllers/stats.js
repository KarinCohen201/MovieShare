const { totalLinks, totalDistinctLinks, mostLinkedMovie } = require("../services/links");
const { topReviewers, totalDistinctReviews, totalReviews } = require("../services/reviews");
const { totalUsers, usersJoinStats } = require('../services/users')

const getStats = async (req, res) => {

  try {

    const reviews = await totalReviews()
    const links = await totalLinks()
    const users = await totalUsers()

    const usersWithReviews = await totalDistinctReviews("email")
    const reviewPercentage = users > 0 ? ((usersWithReviews / users) * 100).toFixed(2) : 0;
    
    const usersWithLinks = await totalDistinctLinks("email")
    const linkPercentage = users > 0 ? ((usersWithLinks / users) * 100).toFixed(2) : 0; 

    const reviewers = await topReviewers(3)
    const topLinkedMovie = await mostLinkedMovie()

    const usersJoin = await usersJoinStats()

    const stats = {
        reviews,
        links,
        users,
        reviewPercentage,
        linkPercentage,
        reviewers,
        topLinkedMovie,
        usersJoin,
    }

    res.status(201).json({ message: "Added review!", stats });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {getStats}