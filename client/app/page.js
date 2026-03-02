'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '../components/Navbar';
import StatusCards from '../components/StatusCards';
import Charts from '../components/Charts';
import IssuesTable from '../components/IssuesTable';
import IssueDetail from '../components/IssueDetail';
import CreateIssueModal from '../components/CreateIssueModal';

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

  // ─── Render Helpers ────────────────────────────────────────
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
          <button type="submit" className="btn-primary btn-sm" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>
    );
  }

  if (loading) {
    return <div className="loading-overlay"><div className="spinner"></div><span>Loading...</span></div>;
  }

  return (
    <div className="app-container">
      <Navbar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        showCharts={showCharts}
        setShowCharts={setShowCharts}
        handleExportCSV={handleExportCSV}
        setShowCreateModal={setShowCreateModal}
      />

      <main className="main-content">
        <StatusCards counts={counts} />

        <Charts
          showCharts={showCharts}
          projectChartRef={projectChartRef}
          priorityChartRef={priorityChartRef}
        />

        <IssuesTable
          issues={issues}
          filters={filters}
          setFilters={setFilters}
          constants={constants}
          onIssueClick={openIssueDetail}
          formatDate={formatDate}
          getPriorityBadgeClass={getPriorityBadgeClass}
          getStatusBadgeClass={getStatusBadgeClass}
        />
      </main>

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
          postJSON={postJSON}
          API={API}
        />
      )}

      <IssueDetail
        issue={selectedIssue}
        comments={comments}
        onClose={closeDetail}
        handleStatusChange={handleStatusChange}
        formatDate={formatDate}
        getPriorityBadgeClass={getPriorityBadgeClass}
        getStatusBtnClass={getStatusBtnClass}
        AddCommentForm={AddCommentForm}
        constants={constants}
        onCommentAdded={(comment) => {
          setComments((prev) => [...prev, comment]);
          addToast('Comment added', 'success');
        }}
        addToast={addToast}
      />

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
