const express = require("express");
const router = express.Router();
const {searchBooks} = require("../controllers/featureController");

router.get("/search", searchBooks);

module.exports = router;

