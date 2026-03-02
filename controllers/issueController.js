const issueService = require('../services/issueService');

// GET /api/issues
const getIssues = async (req, res) => {
    try {
        const filters = {
            project: req.query.project || null,
            priority: req.query.priority || null,
            status: req.query.status || null,
            assignee: req.query.assignee || null,
            search: req.query.search || null,
        };

        const result = await issueService.getAllIssues(filters);
        res.json(result);
    } catch (err) {
        console.error('Error fetching issues:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /api/issues/:id
const getIssueById = async (req, res) => {
    try {
        const issue = await issueService.getIssueById(req.params.id);
        res.json(issue);
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        console.error('Error fetching issue:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /api/issues
const createIssue = async (req, res) => {
    try {
        const issue = await issueService.createIssue(req.body);
        // Emit real-time event
        const io = req.app.get('io');
        if (io) {
            io.emit('issueCreated', issue);
        }
        res.status(201).json(issue);
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        console.error('Error creating issue:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// PATCH /api/issues/:id/status
const updateIssueStatus = async (req, res) => {
    try {
        const issue = await issueService.updateIssueStatus(req.params.id, req.body.status);
        const io = req.app.get('io');
        if (io) {
            io.emit('issueUpdated', issue);
        }
        res.json(issue);
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        console.error('Error updating issue status:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// DELETE /api/issues/:id
const deleteIssue = async (req, res) => {
    try {
        const issue = await issueService.deleteIssue(req.params.id);
        const io = req.app.get('io');
        if (io) {
            io.emit('issueDeleted', { id: req.params.id });
        }
        res.json({ message: 'Issue deleted successfully', issue });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        console.error('Error deleting issue:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getIssues,
    getIssueById,
    createIssue,
    updateIssueStatus,
    deleteIssue,
};
