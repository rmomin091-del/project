const commentService = require('../services/commentService');

// GET /api/issues/:id/comments
const getComments = async (req, res) => {
    try {
        const comments = await commentService.getCommentsByIssueId(req.params.id);
        res.json(comments);
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        console.error('Error fetching comments:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /api/issues/:id/comments
const addComment = async (req, res) => {
    try {
        const comment = await commentService.addComment(req.params.id, req.body);
        const io = req.app.get('io');
        if (io) {
            io.emit('commentAdded', { issueId: req.params.id, comment });
        }
        res.status(201).json(comment);
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        console.error('Error adding comment:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getComments,
    addComment,
};
