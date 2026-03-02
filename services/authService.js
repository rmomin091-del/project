const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userQueries = require('../queries/userQueries');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey-issue-tracker';
const JWT_EXPIRES_IN = '7d';

// Register a new user
const register = async (userData) => {
    const { username, email, password } = userData;

    // Check if user exists
    const existingUser = await userQueries.findByUsername(username) || await userQueries.findByEmail(email);
    if (existingUser) {
        const error = new Error('Username or email already exists');
        error.statusCode = 400;
        throw error;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const user = await userQueries.create({ username, email, password_hash });

    // Generate token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return { user, token };
};

// Login user
const login = async (credentials) => {
    const { username, password } = credentials;

    // Find user
    const user = await userQueries.findByUsername(username);
    if (!user) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }

    // Generate token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
};

module.exports = {
    register,
    login,
};
