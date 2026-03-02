const { PROJECTS, PRIORITIES, STATUSES, TEAM_MEMBERS } = require('../constants');

// Validate issue creation
const validateIssue = (req, res, next) => {
    const { title, description, project, priority, assignee, status } = req.body;
    const errors = [];

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        errors.push('Title is required and must be a non-empty string');
    }
    if (title && title.trim().length > 255) {
        errors.push('Title must be 255 characters or less');
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
        errors.push('Description is required and must be a non-empty string');
    }
    if (!project || !PROJECTS.includes(project)) {
        errors.push(`Project is required and must be one of: ${PROJECTS.join(', ')}`);
    }
    if (!priority || !PRIORITIES.includes(priority)) {
        errors.push(`Priority is required and must be one of: ${PRIORITIES.join(', ')}`);
    }
    if (!assignee || !TEAM_MEMBERS.includes(assignee)) {
        errors.push(`Assignee is required and must be one of: ${TEAM_MEMBERS.join(', ')}`);
    }
    if (status && !STATUSES.includes(status)) {
        errors.push(`Status must be one of: ${STATUSES.join(', ')}`);
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    // Sanitize
    req.body.title = title.trim();
    req.body.description = description.trim();
    next();
};

// Validate status update
const validateStatusUpdate = (req, res, next) => {
    const { status } = req.body;
    if (!status || !STATUSES.includes(status)) {
        return res.status(400).json({
            error: `Status is required and must be one of: ${STATUSES.join(', ')}`,
        });
    }
    next();
};

// Validate comment creation
const validateComment = (req, res, next) => {
    const { author, text } = req.body;
    const errors = [];

    if (!author || typeof author !== 'string' || author.trim().length === 0) {
        errors.push('Author is required');
    }
    if (author && !TEAM_MEMBERS.includes(author)) {
        errors.push(`Author must be one of: ${TEAM_MEMBERS.join(', ')}`);
    }
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        errors.push('Comment text is required and must be a non-empty string');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    req.body.text = text.trim();
    next();
};

// Validate ID param is a number
const validateIdParam = (req, res, next) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid issue ID. Must be a positive integer.' });
    }
    req.params.id = id;
    next();
};

module.exports = {
    validateIssue,
    validateStatusUpdate,
    validateComment,
    validateIdParam,
};
