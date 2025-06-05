const mongoose = require('mongoose');
const Book = require('../models/Book');
const Review = require('../models/Review');

const addBook = async (req, res) => {
    try {
        const {title, author, genre, description} = req.body;

        // Validate required fields
        if (!title || !author || !genre) {
            return res.status(400).json({error: 'Title, author, and genre are required'});
        }

        // Create new book
        const book = new Book({
            title,
            author,
            genre,
            description,
            createdBy: req.user._id
        });

        await book.save();

        res.status(201).json({
            message: 'Book added successfully',
            book
        });
    } catch (err) {
        console.error('Error creating book:', err.message);
        res.status(500).json({error: 'Internal server error'});
    }
};

const getAllBooks = async (req, res) => {
    try {
        const { author, genre, page = 1, limit = 5 } = req.query;

        // Build filter query
        const query = {};
        if (author) query.author = new RegExp(author, 'i');
        if (genre) query.genre = new RegExp(genre, 'i');

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get books and total count
        const [books, total] = await Promise.all([
            Book.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Book.countDocuments(query)
        ]);

        res.status(200).json({
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            books
        });
    } catch (err) {
        console.error('Error fetching books:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 5 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get book details
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Get paginated reviews
        const [reviews, totalReviews] = await Promise.all([
            Review.find({ book: id })
                .populate('user', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Review.countDocuments({ book: id })
        ]);

        // Calculate average rating
        const avgRating = await Review.aggregate([
            { $match: { book: new mongoose.Types.ObjectId(id) } },
            { $group: { _id: null, average: { $avg: '$rating' } } }
        ]);

        res.json({
            book,
            reviews: {
                total: totalReviews,
                page: parseInt(page),
                limit: parseInt(limit),
                data: reviews
            },
            averageRating: avgRating[0]?.average || 0
        });
    } catch (err) {
        console.error('Error fetching book:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const addReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Valid rating (1-5) is required' });
        }

        // Check if book exists
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Check for existing review
        const existingReview = await Review.findOne({
            book: id,
            user: req.user._id
        });

        if (existingReview) {
            return res.status(400).json({ error: 'You have already reviewed this book' });
        }

        // Create new review
        const review = new Review({
            book: id,
            user: req.user._id,
            rating,
            comment
        });

        await review.save();

        res.status(201).json({
            message: 'Review added successfully',
            review
        });
    } catch (err) {
        console.error('Error adding review:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Valid rating (1-5) is required' });
        }

        // Find and verify review ownership
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this review' });
        }

        // Update review
        review.rating = rating;
        review.comment = comment;
        await review.save();

        res.json({
            message: 'Review updated successfully',
            review
        });
    } catch (err) {
        console.error('Error updating review:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        // Find and verify review ownership
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this review' });
        }

        // Delete review
        await review.deleteOne();

        res.json({
            message: 'Review deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting review:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    addBook,
    getBookById,
    getAllBooks,
    addReview,
    updateReview,
    deleteReview
};