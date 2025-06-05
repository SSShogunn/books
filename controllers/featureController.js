const Book = require('../models/Book');

const searchBooks = async (req, res) => {
    try {
        const { query, page = 1, limit = 5 } = req.query;
        
        // Validate search query
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build case-insensitive search query
        const searchQuery = {
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { author: { $regex: query, $options: 'i' } }
            ]
        };

        // Get matching books and total count
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
        console.error('Error searching books:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { searchBooks };