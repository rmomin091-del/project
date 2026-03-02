const commentQueries = require('../queries/commentQueries');
const issueQueries = require('../queries/issueQueries');
const { TEAM_MEMBERS } = require('../constants');

// Get comments for an issue
const getCommentsByIssueId = async (issueId) => {
    // Verify issue exists
    const issue = await issueQueries.findById(issueId);
    if (!issue) {
        const error = new Error('Issue not found');
        error.statusCode = 404;
        throw error;
    }
    return commentQueries.findByIssueId(issueId);
};

// Add a comment to an issue
const addComment = async (issueId, data) => {
    const { author, text } = data;

    // Verify issue exists
    const issue = await issueQueries.findById(issueId);
    if (!issue) {
        const error = new Error('Issue not found');
        error.statusCode = 404;
        throw error;
    }

    if (!TEAM_MEMBERS.includes(author)) {
        const error = new Error(`Invalid author. Must be one of: ${TEAM_MEMBERS.join(', ')}`);
        error.statusCode = 400;
        throw error;
    }

    return commentQueries.create({ issue_id: issueId, author, text });
};

module.exports = {
    getCommentsByIssueId,
    addComment,
};
