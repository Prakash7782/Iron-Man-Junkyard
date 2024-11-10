const router = require('express').Router();
const { ensureAuthenticated, ensureDealer } = require('../Middlewares/Auth');

router.get('/dashboard', ensureAuthenticated, ensureDealer, (req, res) => {
    res.json({
        message: `Welcome to the dealer dashboard, ${req.user.name}`,
        success: true
    });
});

module.exports = router;
