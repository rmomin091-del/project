'use client';

export default function Charts({ showCharts, projectChartRef, priorityChartRef }) {
    if (!showCharts) return null;

    return (
        <div className="charts-grid">
            <div className="chart-card">
                <h3>Issues by Project</h3>
                <div className="chart-container">
                    <canvas ref={projectChartRef}></canvas>
                </div>
            </div>
            <div className="chart-card">
                <h3>Issues by Priority</h3>
                <div className="chart-container">
                    <canvas ref={priorityChartRef}></canvas>
                </div>
            </div>
        </div>
    );
}
