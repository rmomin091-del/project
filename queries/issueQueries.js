const db = require('../config/db');

// Get all issues with optional filters
const findAll = async (filters = {}) => {
    let query = 'SELECT * FROM issues WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.project) {
        query += ` AND project = $${paramIndex++}`;
        params.push(filters.project);
    }
    if (filters.priority) {
        query += ` AND priority = $${paramIndex++}`;
        params.push(filters.priority);
    }
    if (filters.status) {
        query += ` AND status = $${paramIndex++}`;
        params.push(filters.status);
    }
    if (filters.assignee) {
        query += ` AND assignee = $${paramIndex++}`;
        params.push(filters.assignee);
    }
    if (filters.search) {
        query += ` AND (LOWER(title) LIKE $${paramIndex} OR LOWER(description) LIKE $${paramIndex})`;
        params.push(`%${filters.search.toLowerCase()}%`);
        paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    return result.rows;
};

// Get issue by ID
const findById = async (id) => {
    const result = await db.query('SELECT * FROM issues WHERE id = $1', [id]);
    return result.rows[0] || null;
};

// Create a new issue
const create = async (data) => {
    const { title, description, project, priority, assignee, status } = data;
    const result = await db.query(
        `INSERT INTO issues (title, description, project, priority, assignee, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
        [title, description, project, priority, assignee, status || 'Open']
    );
    return result.rows[0];
};

// Update issue status
const updateStatus = async (id, status) => {
    const result = await db.query(
        `UPDATE issues SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status, id]
    );
    return result.rows[0] || null;
};

// Delete issue
const deleteById = async (id) => {
    const result = await db.query('DELETE FROM issues WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
};

// Get status counts
const getStatusCounts = async (filters = {}) => {
    let query = `SELECT status, COUNT(*)::int as count FROM issues WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (filters.project) {
        query += ` AND project = $${paramIndex++}`;
        params.push(filters.project);
    }
    if (filters.assignee) {
        query += ` AND assignee = $${paramIndex++}`;
        params.push(filters.assignee);
    }

    query += ' GROUP BY status';

    const result = await db.query(query, params);
    return result.rows;
};

// Get stats for charts
const getStatsByProject = async () => {
    const result = await db.query(
        'SELECT project, COUNT(*)::int as count FROM issues GROUP BY project ORDER BY project'
    );
    return result.rows;
};

const getStatsByPriority = async () => {
    const result = await db.query(
        'SELECT priority, COUNT(*)::int as count FROM issues GROUP BY priority ORDER BY priority'
    );
    return result.rows;
};

const getStatsByStatus = async () => {
    const result = await db.query(
        'SELECT status, COUNT(*)::int as count FROM issues GROUP BY status ORDER BY status'
    );
    return result.rows;
};

module.exports = {
    findAll,
    findById,
    create,
    updateStatus,
    deleteById,
    getStatusCounts,
    getStatsByProject,
    getStatsByPriority,
    getStatsByStatus,
};
