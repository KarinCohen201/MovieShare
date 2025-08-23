const express = require("express");

const {
    addFavorite,
    removeFavorite,
    isFavorite,
    getFavorites,
} = require("../controllers/favorites");
const { authenticateToken } = require('../middleware/auth')
const router = express.Router();

router.post("/add-favorite", authenticateToken, addFavorite);
router.delete("/remove-favorite", authenticateToken, removeFavorite);
router.get("/is-favorite", authenticateToken, isFavorite);
router.get("/favorites", authenticateToken, getFavorites);

module.exports =  router;