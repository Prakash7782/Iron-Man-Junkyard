const { signup, login, order, getOrdersForDealer,updateBuyer } = require('../Controllers/AuthController');
const { signupValidation, loginValidation } = require('../Middlewares/AuthValidation');
const { ensureAuthenticated } = require('../Middlewares/Auth'); // Add the JWT middleware
const { getMaxListeners } = require('../Models/order');

const router = require('express').Router();

router.post('/login', loginValidation, login);
router.post('/signup', signupValidation, signup);
router.post('/orders',order);
router.get('/orders/dealer', getOrdersForDealer);
router.put('/orders/accept/:orderId', updateBuyer);

// Test route to check authentication
router.get('/test', ensureAuthenticated, (req, res) => {
    res.json({
        message: 'You are authenticated!',
        user: req.user, // Display user info from JWT
        success: true
    });
});

module.exports = router;
