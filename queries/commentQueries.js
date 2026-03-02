const db = require('../config/db');

// Get all comments for an issue
const findByIssueId = async (issueId) => {
    const result = await db.query(
        'SELECT * FROM comments WHERE issue_id = $1 ORDER BY created_at ASC',
        [issueId]
    );
    return result.rows;
};

// Create a new comment
const create = async (data) => {
    const { issue_id, author, text } = data;
    const result = await db.query(
        `INSERT INTO comments (issue_id, author, text)
     VALUES ($1, $2, $3)
     RETURNING *`,
        [issue_id, author, text]
    );
    return result.rows[0];
};

module.exports = {
    findByIssueId,
    create,
};
