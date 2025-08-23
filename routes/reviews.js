const express = require("express");
const { addReview, getTopReviewers } = require('../controllers/reviews');
const router = express.Router();

router.post('/', addReview)
router.post('/top-reviewer', getTopReviewers)

module.exports = router;