const exportService = require('../services/exportService');

// GET /api/issues/export/csv
const exportCSV = async (req, res) => {
    try {
        const filters = {
            project: req.query.project || null,
            priority: req.query.priority || null,
            status: req.query.status || null,
            assignee: req.query.assignee || null,
            search: req.query.search || null,
        };

        const csv = await exportService.exportCSV(filters);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=issues.csv');
        res.send(csv);
    } catch (err) {
        console.error('Error exporting CSV:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    exportCSV,
};
