const jwt = require('jsonwebtoken');

// Middleware to ensure the user is authenticated and has a valid JWT token
const ensureAuthenticated = (req, res, next) => {
    const auth = req.headers['authorization'];
    if (!auth) {
        return res.status(403).json({ message: 'Unauthorized, JWT token is required' });
    }
    try {
        const decoded = jwt.verify(auth, process.env.JWT_SECRET);
        req.user = decoded;  // Store the decoded user info in the request object
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Unauthorized, JWT token wrong or expired' });
    }
};

const ensureCustomer = (req, res, next) => {
    if (req.user.userType !== 'customer') {
        return res.status(403).json({ message: 'Access denied, only customers allowed' });
    }
    next();
};

// Middleware to ensure the user is a dealer
const ensureDealer = (req, res, next) => {
    if (req.user.userType !== 'dealer') {
        return res.status(403).json({ message: 'Access denied, only dealers allowed' });
    }
    next();
};

module.exports = { ensureAuthenticated, ensureCustomer, ensureDealer };
