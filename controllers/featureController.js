const Book = require('../models/Book');

const searchBooks = async (req, res) => {
    try {
        const { query, page = 1, limit = 5 } = req.query;
        
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const searchQuery = {
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { author: { $regex: query, $options: 'i' } }
            ]
        };

        const [books, total] = await Promise.all([
            Book.find(searchQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Book.countDocuments(searchQuery)
        ]);

        res.json({
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

module.exports = { searchBooks };