const bcrypt = require('bcryptjs');
const db = require('../config/db');
require('dotenv').config();

async function seedUser() {
    try {
        const username = 'admin';
        const email = 'admin@example.com';
        const password = 'password123';

        // Check if exists
        const exists = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (exists.rows.length > 0) {
            console.log('User already exists');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        await db.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
            [username, email, password_hash]
        );

        console.log('✅ Admin user created:');
        console.log(`   Username: ${username}`);
        console.log(`   Password: ${password}`);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding user:', err);
        process.exit(1);
    }
}

seedUser();
