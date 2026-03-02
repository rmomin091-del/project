const issueQueries = require('../queries/issueQueries');

// Export issues as CSV
const exportCSV = async (filters) => {
    const issues = await issueQueries.findAll(filters);

    const headers = ['ID', 'Title', 'Description', 'Project', 'Priority', 'Assignee', 'Status', 'Created At', 'Updated At'];
    const rows = issues.map((issue) => [
        issue.id,
        `"${(issue.title || '').replace(/"/g, '""')}"`,
        `"${(issue.description || '').replace(/"/g, '""')}"`,
        issue.project,
        issue.priority,
        issue.assignee,
        issue.status,
        issue.created_at,
        issue.updated_at,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
};

module.exports = {
    exportCSV,
};
