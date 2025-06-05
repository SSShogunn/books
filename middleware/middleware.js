const {verifyToken} = require('../utils/jwt');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({error: 'Unauthorized: No token provided'});
        }

        const token = authHeader.split(' ')[1];

        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized: User not found' });
        }

        req.user = user;
        next()
    } catch (e) {
        console.error(e);
        return res.status(401).json({error: 'Unauthorized: Invalid token'});
    }
};

module.exports = authMiddleware;