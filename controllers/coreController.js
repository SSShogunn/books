const mongoose = require('mongoose');
const Book = require('../models/Book');
const Review = require('../models/Review');


const addBook = async (req, res) => {
    try {
        const {title, author, genre, description} = req.body;

        if (!title || !author || !genre) {
            return res.status(400).json({error: 'Title, author, and genre are required'});
        }

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
        console.error(err.message);
        res.status(500).json({error: err.message});
    }
};

const getAllBooks = async (req, res) => {
    try {
        const { author, genre, page = 1, limit = 5 } = req.query;

        const query = {};
        if (author) query.author = new RegExp(author, 'i');
        if (genre) query.genre = new RegExp(genre, 'i');

        const skip = (parseInt(page) - 1) * parseInt(limit);

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
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
};

const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 5 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const [reviews, totalReviews] = await Promise.all([
            Review.find({ book: id })
                .populate('user', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Review.countDocuments({ book: id })
        ]);

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
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
};

const addReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Valid rating (1-5) is required' });
        }

        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const existingReview = await Review.findOne({
            book: id,
            user: req.user._id
        });

        if (existingReview) {
            return res.status(400).json({ error: 'You have already reviewed this book' });
        }

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
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
};

const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Valid rating (1-5) is required' });
        }

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        //console.log(review)
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this review' });
        }

        review.rating = rating;
        review.comment = comment;
        await review.save();

        res.json({
            message: 'Review updated successfully',
            review
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
};

const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this review' });
        }

        await review.deleteOne();

        res.json({
            message: 'Review deleted successfully'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
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