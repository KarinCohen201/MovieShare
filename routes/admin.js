const express = require("express");
const { 
    makeAdmin, 
    getAllUsers, 
    checkAdmin, 
    getAllPublicLinks, 
    deletePublicLink 
} = require("../controllers/admin");

const { checkAdminMiddleware } = require("../middleware/auth");

const router = express.Router();

router.post("/check-admin", checkAdmin);
router.put("/make-admin", checkAdminMiddleware, makeAdmin);
router.get("/users", checkAdminMiddleware, getAllUsers);
router.post("/public-links", checkAdminMiddleware, getAllPublicLinks);
router.delete("/delete-link", checkAdminMiddleware, deletePublicLink);

module.exports = router;
