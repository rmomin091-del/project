'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ─── API Helpers ───────────────────────────────────────────────
const API = '/api';

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function postJSON(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || json.errors?.join(', ') || 'Request failed');
  return json;
}

async function patchJSON(url, data) {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

// ─── Constants ────────────────────────────────────────────────
const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6'];

// ─── Main Component ──────────────────────────────────────────
export default function HomePage() {
  // State
  const [constants, setConstants] = useState({ projects: [], priorities: [], statuses: [], teamMembers: [] });
  const [issues, setIssues] = useState([]);
  const [counts, setCounts] = useState({ Total: 0, Open: 0, 'In Progress': 0, Resolved: 0, Closed: 0 });
  const [stats, setStats] = useState({ byProject: [], byPriority: [], byStatus: [] });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ project: '', priority: '', status: '', assignee: '', search: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [showCharts, setShowCharts] = useState(false);

  const projectChartRef = useRef(null);
  const priorityChartRef = useRef(null);
  const projectChartInstance = useRef(null);
  const priorityChartInstance = useRef(null);
  const socketRef = useRef(null);

  // ─── Toast ────────────────────────────────────────────────
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  // ─── Theme Toggle ────────────────────────────────────────
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  // ─── Fetch Data ───────────────────────────────────────────
  const fetchIssues = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const data = await fetchJSON(`${API}/issues?${params.toString()}`);
      setIssues(data.issues);
      setCounts(data.counts);
    } catch (err) {
      addToast('Failed to load issues', 'error');
    }
  }, [filters, addToast]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await fetchJSON(`${API}/stats`);
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  const fetchComments = useCallback(async (issueId) => {
    try {
      const data = await fetchJSON(`${API}/issues/${issueId}/comments`);
      setComments(data);
    } catch (err) {
      addToast('Failed to load comments', 'error');
    }
  }, [addToast]);

  // ─── Init ─────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setDarkMode(savedTheme === 'dark');
        document.documentElement.setAttribute('data-theme', savedTheme);

        const c = await fetchJSON(`${API}/constants`);
        setConstants(c);
      } catch (err) {
        addToast('Failed to connect to server', 'error');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [addToast]);

  useEffect(() => {
    if (!loading) fetchIssues();
  }, [loading, fetchIssues]);

  useEffect(() => {
    if (!loading) fetchStats();
  }, [loading, fetchStats]);

  // ─── Socket.io ────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !window.io) return;
    const socket = window.io('http://localhost:5000');
    socketRef.current = socket;

    socket.on('issueCreated', () => {
      fetchIssues();
      fetchStats();
      addToast('New issue created', 'info');
    });
    socket.on('issueUpdated', () => {
      fetchIssues();
      fetchStats();
    });
    socket.on('issueDeleted', () => {
      fetchIssues();
      fetchStats();
      addToast('Issue deleted', 'info');
    });
    socket.on('commentAdded', (data) => {
      if (selectedIssue && data.issueId == selectedIssue.id) {
        fetchComments(selectedIssue.id);
      }
    });

    return () => socket.disconnect();
  }, [fetchIssues, fetchStats, addToast, selectedIssue, fetchComments]);

  // ─── Charts ───────────────────────────────────────────────
  useEffect(() => {
    if (!showCharts || typeof window === 'undefined' || !window.Chart) return;

    const fontColor = darkMode ? '#a0a5b8' : '#5a6072';
    const gridColor = darkMode ? '#2d3148' : '#e2e5ec';

    // Project Chart
    if (projectChartRef.current) {
      if (projectChartInstance.current) projectChartInstance.current.destroy();
      projectChartInstance.current = new window.Chart(projectChartRef.current, {
        type: 'doughnut',
        data: {
          labels: stats.byProject.map((s) => s.project),
          datasets: [{
            data: stats.byProject.map((s) => s.count),
            backgroundColor: CHART_COLORS.slice(0, stats.byProject.length),
            borderWidth: 0,
            hoverOffset: 8,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: fontColor, padding: 16, font: { family: "'Inter', sans-serif", size: 12 } } },
          },
        },
      });
    }

    // Priority Chart
    if (priorityChartRef.current) {
      if (priorityChartInstance.current) priorityChartInstance.current.destroy();
      priorityChartInstance.current = new window.Chart(priorityChartRef.current, {
        type: 'bar',
        data: {
          labels: stats.byPriority.map((s) => s.priority),
          datasets: [{
            label: 'Issues',
            data: stats.byPriority.map((s) => s.count),
            backgroundColor: ['#10b981', '#f59e0b', '#f97316', '#ef4444'],
            borderRadius: 8,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1, color: fontColor, font: { family: "'Inter', sans-serif" } }, grid: { color: gridColor } },
            x: { ticks: { color: fontColor, font: { family: "'Inter', sans-serif" } }, grid: { display: false } },
          },
        },
      });
    }

    return () => {
      if (projectChartInstance.current) projectChartInstance.current.destroy();
      if (priorityChartInstance.current) priorityChartInstance.current.destroy();
    };
  }, [showCharts, stats, darkMode]);

  // ─── Issue Detail ─────────────────────────────────────────
  const openIssueDetail = async (issue) => {
    setSelectedIssue(issue);
    setComments([]);
    await fetchComments(issue.id);
  };

  const closeDetail = () => {
    setSelectedIssue(null);
    setComments([]);
  };

  const handleStatusChange = async (status) => {
    try {
      const updated = await patchJSON(`${API}/issues/${selectedIssue.id}/status`, { status });
      setSelectedIssue(updated);
      addToast(`Status changed to ${status}`, 'success');
      fetchIssues();
      fetchStats();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // ─── Export CSV ───────────────────────────────────────────
  const handleExportCSV = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    window.open(`${API}/export/csv?${params.toString()}`, '_blank');
    addToast('CSV export started', 'success');
  };

  // ─── Helpers ──────────────────────────────────────────────
  const getStatusBadgeClass = (status) => {
    const map = { 'Open': 'badge-open', 'In Progress': 'badge-in-progress', 'Resolved': 'badge-resolved', 'Closed': 'badge-closed' };
    return `badge ${map[status] || ''}`;
  };

  const getPriorityBadgeClass = (priority) => {
    const map = { 'Low': 'badge-low', 'Medium': 'badge-medium', 'High': 'badge-high', 'Critical': 'badge-critical' };
    return `badge ${map[priority] || ''}`;
  };

  const getStatusBtnClass = (status, current) => {
    const map = { 'Open': 'open', 'In Progress': 'in-progress', 'Resolved': 'resolved', 'Closed': 'closed' };
    return `status-btn ${map[status]} ${current === status ? 'active' : ''}`;
  };

  const formatDate = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return <div className="loading-overlay"><div className="spinner"></div><span>Loading...</span></div>;
  }

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <div className="icon">🐛</div>
            <span>Issue Tracker</span>
          </div>
          <div className="navbar-actions">
            <button className="btn-icon" onClick={() => setShowCharts(!showCharts)} title="Toggle Charts">
              📊
            </button>
            <button className="btn-icon" onClick={handleExportCSV} title="Export CSV">
              📥
            </button>
            <button className="btn-icon" onClick={toggleDarkMode} title="Toggle Dark Mode">
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              + New Issue
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Status Cards */}
        <div className="status-cards">
          <div className="status-card total">
            <div className="status-card-label">Total</div>
            <div className="status-card-count">{counts.Total || 0}</div>
          </div>
          <div className="status-card open">
            <div className="status-card-label">Open</div>
            <div className="status-card-count">{counts.Open || 0}</div>
          </div>
          <div className="status-card in-progress">
            <div className="status-card-label">In Progress</div>
            <div className="status-card-count">{counts['In Progress'] || 0}</div>
          </div>
          <div className="status-card resolved">
            <div className="status-card-label">Resolved</div>
            <div className="status-card-count">{counts.Resolved || 0}</div>
          </div>
          <div className="status-card closed">
            <div className="status-card-label">Closed</div>
            <div className="status-card-count">{counts.Closed || 0}</div>
          </div>
        </div>

        {/* Charts */}
        {showCharts && (
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Issues by Project</h3>
              <div className="chart-container"><canvas ref={projectChartRef}></canvas></div>
            </div>
            <div className="chart-card">
              <h3>Issues by Priority</h3>
              <div className="chart-container"><canvas ref={priorityChartRef}></canvas></div>
            </div>
          </div>
        )}

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
          <select className="filter-select" value={filters.project} onChange={(e) => setFilters({ ...filters, project: e.target.value })}>
            <option value="">All Projects</option>
            {constants.projects.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="filter-select" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
            <option value="">All Priorities</option>
            {constants.priorities.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="filter-select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Statuses</option>
            {constants.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="filter-select" value={filters.assignee} onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}>
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
                  <tr key={issue.id} onClick={() => openIssueDetail(issue)}>
                    <td className="issue-id-cell">#{issue.id}</td>
                    <td className="issue-title-cell">{issue.title}</td>
                    <td>{issue.project}</td>
                    <td><span className={getPriorityBadgeClass(issue.priority)}><span className="badge-dot"></span>{issue.priority}</span></td>
                    <td>{issue.assignee}</td>
                    <td><span className={getStatusBadgeClass(issue.status)}><span className="badge-dot"></span>{issue.status}</span></td>
                    <td style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>{formatDate(issue.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Create Issue Modal */}
      {showCreateModal && (
        <CreateIssueModal
          constants={constants}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchIssues();
            fetchStats();
            addToast('Issue created successfully!', 'success');
          }}
          addToast={addToast}
        />
      )}

      {/* Issue Detail Side Panel */}
      {selectedIssue && (
        <>
          <div className="detail-overlay" onClick={closeDetail}></div>
          <div className="detail-panel">
            <div className="detail-header">
              <h2>#{selectedIssue.id} {selectedIssue.title}</h2>
              <button className="btn-icon" onClick={closeDetail}>✕</button>
            </div>
            <div className="detail-body">
              {/* Meta */}
              <div className="detail-meta">
                <div className="detail-meta-item">
                  <span className="detail-meta-label">Project</span>
                  <span className="detail-meta-value">{selectedIssue.project}</span>
                </div>
                <div className="detail-meta-item">
                  <span className="detail-meta-label">Priority</span>
                  <span className={getPriorityBadgeClass(selectedIssue.priority)}><span className="badge-dot"></span>{selectedIssue.priority}</span>
                </div>
                <div className="detail-meta-item">
                  <span className="detail-meta-label">Assignee</span>
                  <span className="detail-meta-value">{selectedIssue.assignee}</span>
                </div>
                <div className="detail-meta-item">
                  <span className="detail-meta-label">Created</span>
                  <span className="detail-meta-value">{formatDate(selectedIssue.created_at)}</span>
                </div>
              </div>

              {/* Description */}
              <div className="detail-description">{selectedIssue.description}</div>

              {/* Status Change */}
              <div className="detail-section-title">Change Status</div>
              <div className="status-change-bar">
                {['Open', 'In Progress', 'Resolved', 'Closed'].map((s) => (
                  <button key={s} className={getStatusBtnClass(s, selectedIssue.status)} onClick={() => handleStatusChange(s)}>
                    {s}
                  </button>
                ))}
              </div>

              {/* Comments */}
              <div className="detail-section-title">Comments ({comments.length})</div>
              <div className="comments-list">
                {comments.length === 0 && <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No comments yet</p>}
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
                issueId={selectedIssue.id}
                teamMembers={constants.teamMembers}
                onCommentAdded={(comment) => {
                  setComments((prev) => [...prev, comment]);
                  addToast('Comment added', 'success');
                }}
                addToast={addToast}
              />
            </div>
          </div>
        </>
      )}

      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'} {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Create Issue Modal ─────────────────────────────────────
function CreateIssueModal({ constants, onClose, onCreated, addToast }) {
  const [form, setForm] = useState({ title: '', description: '', project: '', priority: '', assignee: '', status: 'Open' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.project) e.project = 'Project is required';
    if (!form.priority) e.priority = 'Priority is required';
    if (!form.assignee) e.assignee = 'Assignee is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await postJSON(`${API}/issues`, form);
      onCreated();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Issue</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" type="text" placeholder="Brief summary of the issue" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              {errors.title && <div className="form-error">{errors.title}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-textarea" placeholder="Detailed description of the issue..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              {errors.description && <div className="form-error">{errors.description}</div>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Project *</label>
                <select className="form-select" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })}>
                  <option value="">Select project</option>
                  {constants.projects.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.project && <div className="form-error">{errors.project}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Priority *</label>
                <select className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="">Select priority</option>
                  {constants.priorities.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.priority && <div className="form-error">{errors.priority}</div>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Assignee *</label>
                <select className="form-select" value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })}>
                  <option value="">Select assignee</option>
                  {constants.teamMembers.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                {errors.assignee && <div className="form-error">{errors.assignee}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {constants.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <><span className="spinner"></span> Creating...</> : 'Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Add Comment Form ───────────────────────────────────────
function AddCommentForm({ issueId, teamMembers, onCommentAdded, addToast }) {
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!author || !text.trim()) {
      addToast('Author and comment text are required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const comment = await postJSON(`${API}/issues/${issueId}/comments`, { author, text });
      onCommentAdded(comment);
      setText('');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <div className="detail-section-title">Add Comment</div>
      <div className="comment-form-actions">
        <select className="form-select" value={author} onChange={(e) => setAuthor(e.target.value)} style={{ flex: 1 }}>
          <option value="">Select author</option>
          {teamMembers.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <textarea placeholder="Write your comment..." value={text} onChange={(e) => setText(e.target.value)} />
      <div>
        <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
}
