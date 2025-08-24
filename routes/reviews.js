const express = require("express");
const { addReview, getTopReviewers } = require('../controllers/reviews');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.post('/', authenticateToken, addReview)
router.post('/top-reviewer', getTopReviewers)

module.exports = router;