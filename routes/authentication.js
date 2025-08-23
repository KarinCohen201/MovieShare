const express = require("express");

const {
  login,
  register,
  getUser,
  logout,
} = require("../controllers/authentication.js");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);
router.get("/get-username", getUser);

module.exports =  router;
