const statsService = require('../services/statsService');

// GET /api/stats
const getStats = async (req, res) => {
    try {
        const stats = await statsService.getStats();
        res.json(stats);
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getStats,
};
