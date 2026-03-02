const issueQueries = require('../queries/issueQueries');

// Get stats for charts
const getStats = async () => {
    const [byProject, byPriority, byStatus] = await Promise.all([
        issueQueries.getStatsByProject(),
        issueQueries.getStatsByPriority(),
        issueQueries.getStatsByStatus(),
    ]);
    return { byProject, byPriority, byStatus };
};

module.exports = {
    getStats,
};
