const Joi = require('joi');

const signupValidation = (req, res, next) => {
    // Define the base schema
    const baseSchema = Joi.object({
        name: Joi.string().min(3).max(100).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(4).max(100).required(),
        userType: Joi.string().valid('customer', 'dealer').required()
    });

    // Define additional fields for dealer
    const dealerSchema = baseSchema.append({
        phone: Joi.string().length(10).pattern(/^[0-9]+$/).required(), // Phone must be a 10-digit number
        serviceArea: Joi.string().pattern(/^[a-zA-Z0-9, ]*$/).optional() // Optional: a comma-separated list of cities
    });

    // Validate based on userType
    const schema = req.body.userType === 'dealer' ? dealerSchema : baseSchema;

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "Bad request", error: error.details });
    }
    next();
}

const loginValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(4).max(100).required()
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "Bad request", error: error.details });
    }
    next();
}

module.exports = {
    signupValidation,
    loginValidation
}
