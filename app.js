const express = require('express');
const cors = require('cors');
const issueRoutes = require('./routes/issueRoutes');
const commentRoutes = require('./routes/commentRoutes');
const statsRoutes = require('./routes/statsRoutes');
const exportRoutes = require('./routes/exportRoutes');
const constantsRoutes = require('./routes/constantsRoutes');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; padding: 40px; text-align: center;">
            <h2 style="color: #6366f1;">🐛 Issue Tracker API</h2>
            <p>The backend is running successfully.</p>
            <p>Access the frontend at <a href="http://localhost:3000">localhost:3000</a></p>
            <p>View API documentation in the project at <code>api_endpoints.md</code></p>
        </div>
    `);
});

// API Routes
app.use('/api/auth', authRoutes);

// Protected API Routes
app.use('/api/issues', authMiddleware, issueRoutes);
app.use('/api/issues/:id/comments', authMiddleware, commentRoutes);
app.use('/api/stats', authMiddleware, statsRoutes);
app.use('/api/export', authMiddleware, exportRoutes);
app.use('/api/constants', authMiddleware, constantsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler for unmatched API routes
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.statusCode || 500).json({
        error: err.message || 'Internal server error',
    });
});

module.exports = app;
