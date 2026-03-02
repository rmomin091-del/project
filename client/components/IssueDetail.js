'use client';

export default function IssueDetail({
    issue,
    comments,
    onClose,
    handleStatusChange,
    formatDate,
    getPriorityBadgeClass,
    getStatusBtnClass,
    AddCommentForm,
    constants,
    onCommentAdded,
    addToast
}) {
    if (!issue) return null;

    return (
        <>
            <div className="detail-overlay" onClick={onClose}></div>
            <div className="detail-panel">
                <div className="detail-header">
                    <h2>#{issue.id} {issue.title}</h2>
                    <button className="btn-icon" onClick={onClose}>✕</button>
                </div>
                <div className="detail-body">
                    {/* Meta */}
                    <div className="detail-meta">
                        <div className="detail-meta-item">
                            <span className="detail-meta-label">Project</span>
                            <span className="detail-meta-value">{issue.project}</span>
                        </div>
                        <div className="detail-meta-item">
                            <span className="detail-meta-label">Priority</span>
                            <span className={getPriorityBadgeClass(issue.priority)}>
                                <span className="badge-dot"></span>{issue.priority}
                            </span>
                        </div>
                        <div className="detail-meta-item">
                            <span className="detail-meta-label">Assignee</span>
                            <span className="detail-meta-value">{issue.assignee}</span>
                        </div>
                        <div className="detail-meta-item">
                            <span className="detail-meta-label">Created</span>
                            <span className="detail-meta-value">{formatDate(issue.created_at)}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="detail-description">{issue.description}</div>

                    {/* Status Change */}
                    <div className="detail-section-title">Change Status</div>
                    <div className="status-change-bar">
                        {['Open', 'In Progress', 'Resolved', 'Closed'].map((s) => (
                            <button
                                key={s}
                                className={getStatusBtnClass(s, issue.status)}
                                onClick={() => handleStatusChange(s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Comments */}
                    <div className="detail-section-title">Comments ({comments.length})</div>
                    <div className="comments-list">
                        {comments.length === 0 && (
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No comments yet</p>
                        )}
                        {comments.map((c) => (
                            <div key={c.id} className="comment-item">
                                <div className="comment-header">
                                    <span className="comment-author">{c.author}</span>
                                    <span className="comment-time">{formatDate(c.created_at)}</span>
                                </div>
                                <div className="comment-text">{c.text}</div>
                            </div>
                        ))}
                    </div>

                    {/* Add Comment */}
                    <AddCommentForm
                        issueId={issue.id}
                        teamMembers={constants.teamMembers}
                        onCommentAdded={onCommentAdded}
                        addToast={addToast}
                    />
                </div>
            </div>
        </>
    );
}
