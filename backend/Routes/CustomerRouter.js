const router = require('express').Router();
const { ensureAuthenticated, ensureCustomer } = require('../Middlewares/Auth');

router.get('/dashboard', ensureAuthenticated, ensureCustomer, (req, res) => {
    res.json({
        message: `Welcome to the customer dashboard, ${req.user.name}`,
        success: true
    });
});

module.exports = router;
