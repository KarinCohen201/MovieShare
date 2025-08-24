const Review = require("../models/Review");
const Link   = require("../models/Link");

const addReview = async (req, res) => {
  try {
    const reviewerEmail = req.user && req.user.email;
    const { imdbID, linkId, content } = req.body;

    if (!reviewerEmail) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!imdbID || !content || !linkId) {
      return res.status(400).json({ error: "Missing required fields (imdbID, linkId, content)" });
    }

    const link = await Link.findById(linkId).lean();
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    // אסור להגיב על לינק של עצמי
    if (String(link.email).toLowerCase() === String(reviewerEmail).toLowerCase()) {
      return res.status(403).json({ error: "You cannot review your own link." });
    }

    const newReview = new Review({
      imdbID,
      email: reviewerEmail,
      linkId,
      content
    });
    await newReview.save();

    return res.status(201).json({ message: "Added review!", newReview });
  } catch (error) {
    console.error("addReview error:", error);
    return res.status(500).json({ error: "Server error" });
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
