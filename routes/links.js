const express = require("express");
const { 
    addLink, 
    getAllLinks, 
    updateLink, 
    deleteLink, 
    addRating,
    getPublicLinks
} = require("../controllers/links");
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const { loadLinksFromFile } = require('../controllers/links');
const { authenticateToken } = require('../middleware/auth')
const { authorizeUserOrAdmin } = require("../middleware/auth");
const router = express.Router();

router.post("/add", authenticateToken, addLink);
router.get("/",  authenticateToken, getAllLinks);
router.put("/", authenticateToken, authorizeUserOrAdmin, updateLink);
router.delete("/", authenticateToken, authorizeUserOrAdmin, deleteLink);
router.post("/add-rating", authenticateToken, addRating);
router.get("/public", getPublicLinks);
router.post('/upload-links', upload.single('file'), authenticateToken, loadLinksFromFile)

module.exports = router;