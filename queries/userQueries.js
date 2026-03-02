const db = require('../config/db');

// Find user by username
const findByUsername = async (username) => {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
};

// Find user by email
const findByEmail = async (email) => {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
};

// Create a new user
const create = async (data) => {
    const { username, email, password_hash } = data;
    const result = await db.query(
        `INSERT INTO users (username, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, username, email, created_at`,
        [username, email, password_hash]
    );
    return result.rows[0];
};

module.exports = {
    findByUsername,
    findByEmail,
    create,
};
