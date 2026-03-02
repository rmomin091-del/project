'use client';

export default function IssuesTable({
    issues,
    filters,
    setFilters,
    constants,
    onIssueClick,
    formatDate,
    getPriorityBadgeClass,
    getStatusBadgeClass
}) {
    return (
        <>
            {/* Filters */}
            <div className="filters-bar">
                <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by title or description..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                </div>
                <select
                    className="filter-select"
                    value={filters.project}
                    onChange={(e) => setFilters({ ...filters, project: e.target.value })}
                >
                    <option value="">All Projects</option>
                    {constants.projects.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <select
                    className="filter-select"
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                >
                    <option value="">All Priorities</option>
                    {constants.priorities.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <select
                    className="filter-select"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                    <option value="">All Statuses</option>
                    {constants.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                    className="filter-select"
                    value={filters.assignee}
                    onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
                >
                    <option value="">All Assignees</option>
                    {constants.teamMembers.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>

            {/* Issues Table */}
            <div className="issues-table-wrapper">
                {issues.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">📋</div>
                        <p>No issues found</p>
                        <p style={{ fontSize: '0.85rem' }}>Try adjusting your filters or create a new issue</p>
                    </div>
                ) : (
                    <table className="issues-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Project</th>
                                <th>Priority</th>
                                <th>Assignee</th>
                                <th>Status</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {issues.map((issue) => (
                                <tr key={issue.id} onClick={() => onIssueClick(issue)}>
                                    <td className="issue-id-cell">#{issue.id}</td>
                                    <td className="issue-title-cell">{issue.title}</td>
                                    <td>{issue.project}</td>
                                    <td>
                                        <span className={getPriorityBadgeClass(issue.priority)}>
                                            <span className="badge-dot"></span>{issue.priority}
                                        </span>
                                    </td>
                                    <td>{issue.assignee}</td>
                                    <td>
                                        <span className={getStatusBadgeClass(issue.status)}>
                                            <span className="badge-dot"></span>{issue.status}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                                        {formatDate(issue.created_at)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}
