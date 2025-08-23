const Review = require("../models/Review");

const addReview = async (req, res) => {
  try {
    const { imdbID, email, linkId, content } = req.body;
    
    if (!imdbID || !email) {
      return res
        .status(400)
        .json({ message: "Missing imdbID, email, or username" });
    }

    const newReview = new Review({ imdbID, email, linkId, content });
    await newReview.save();

    res.status(201).json({ message: "Added review!", newReview });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getTopReviewers = async (req, res) => {
  try {
    const { limit = 3 } = req.params;

    const reviewers = await topReviewers(limit)

    if(!reviewers){
      res.status(500).json({ message: "Server error", error });
    }
    res.status(201).json({ message: "Added review!", reviewers });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  addReview,
  getTopReviewers,
};
