'use client';

export default function Navbar({
    darkMode,
    toggleDarkMode,
    showCharts,
    setShowCharts,
    handleExportCSV,
    setShowCreateModal,
    user
}) {
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };
    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <div className="navbar-brand">
                    <div className="icon">🐛</div>
                    <span>Issue Tracker</span>
                </div>

                {user && (
                    <div className="user-info">
                        <span className="user-greeting">Welcome, <strong>{user.username}</strong></span>
                        <button className="btn-text" onClick={logout}>Logout</button>
                    </div>
                )}
                <div className="navbar-actions">
                    <button
                        className="btn-icon"
                        onClick={() => setShowCharts(!showCharts)}
                        title="Toggle Charts"
                    >
                        📊
                    </button>
                    <button
                        className="btn-icon"
                        onClick={handleExportCSV}
                        title="Export CSV"
                    >
                        📥
                    </button>
                    <button
                        className="btn-icon"
                        onClick={toggleDarkMode}
                        title="Toggle Dark Mode"
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateModal(true)}
                    >
                        + New Issue
                    </button>
                </div>
            </div>
        </nav>
    );
}
