'use client';

export default function Navbar({
    darkMode,
    toggleDarkMode,
    showCharts,
    setShowCharts,
    handleExportCSV,
    setShowCreateModal
}) {
    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <div className="navbar-brand">
                    <div className="icon">🐛</div>
                    <span>Issue Tracker</span>
                </div>
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
