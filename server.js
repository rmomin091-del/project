require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    },
});

// Make io accessible to controllers
app.set('io', io);

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// Test DB connection and start server
const startServer = async () => {
    try {
        await db.query('SELECT NOW()');
        console.log('✅ Connected to PostgreSQL');

        server.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📡 Socket.io ready`);
        });
    } catch (err) {
        console.error('❌ Failed to connect to PostgreSQL:', err.message);
        process.exit(1);
    }
};

startServer();
