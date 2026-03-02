const authService = require('../services/authService');

// Register a new user
const register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

// Login user
const login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
};
