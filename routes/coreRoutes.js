const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/middleware");
const {
    addBook,
    getBookById,
    getAllBooks,
    addReview,
    updateReview,
    deleteReview
} = require("../controllers/coreController");

router.post("/books", authMiddleware, addBook);
router.get("/books", getAllBooks);
router.get("/books/:id", getBookById);
router.post("/books/:id/reviews", authMiddleware, addReview);
router.put("/reviews/:id", authMiddleware, updateReview);
router.delete("/reviews/:id", authMiddleware, deleteReview);


module.exports = router;

