const issueQueries = require('../queries/issueQueries');
const { PROJECTS, PRIORITIES, STATUSES, TEAM_MEMBERS } = require('../constants');

// Get all issues with filters + status counts
const getAllIssues = async (filters) => {
    const [issues, statusCounts] = await Promise.all([
        issueQueries.findAll(filters),
        issueQueries.getStatusCounts(filters),
    ]);

    // Build counts object with defaults
    const counts = { Open: 0, 'In Progress': 0, Resolved: 0, Closed: 0 };
    statusCounts.forEach((row) => {
        counts[row.status] = row.count;
    });
    counts.Total = issues.length;

    return { issues, counts };
};

// Get single issue by ID
const getIssueById = async (id) => {
    const issue = await issueQueries.findById(id);
    if (!issue) {
        const error = new Error('Issue not found');
        error.statusCode = 404;
        throw error;
    }
    return issue;
};

// Create a new issue with validation
const createIssue = async (data) => {
    const { title, description, project, priority, assignee, status } = data;

    if (!PROJECTS.includes(project)) {
        const error = new Error(`Invalid project. Must be one of: ${PROJECTS.join(', ')}`);
        error.statusCode = 400;
        throw error;
    }
    if (!PRIORITIES.includes(priority)) {
        const error = new Error(`Invalid priority. Must be one of: ${PRIORITIES.join(', ')}`);
        error.statusCode = 400;
        throw error;
    }
    if (status && !STATUSES.includes(status)) {
        const error = new Error(`Invalid status. Must be one of: ${STATUSES.join(', ')}`);
        error.statusCode = 400;
        throw error;
    }
    if (!TEAM_MEMBERS.includes(assignee)) {
        const error = new Error(`Invalid assignee. Must be one of: ${TEAM_MEMBERS.join(', ')}`);
        error.statusCode = 400;
        throw error;
    }

    return issueQueries.create({ title, description, project, priority, assignee, status });
};

// Update issue status
const updateIssueStatus = async (id, status) => {
    if (!STATUSES.includes(status)) {
        const error = new Error(`Invalid status. Must be one of: ${STATUSES.join(', ')}`);
        error.statusCode = 400;
        throw error;
    }

    const issue = await issueQueries.updateStatus(id, status);
    if (!issue) {
        const error = new Error('Issue not found');
        error.statusCode = 404;
        throw error;
    }
    return issue;
};

// Delete issue
const deleteIssue = async (id) => {
    const issue = await issueQueries.deleteById(id);
    if (!issue) {
        const error = new Error('Issue not found');
        error.statusCode = 404;
        throw error;
    }
    return issue;
};

module.exports = {
    getAllIssues,
    getIssueById,
    createIssue,
    updateIssueStatus,
    deleteIssue,
};
