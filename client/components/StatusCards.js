'use client';

export default function StatusCards({ counts }) {
    const cards = [
        { label: 'Total', count: counts.Total, className: 'total' },
        { label: 'Open', count: counts.Open, className: 'open' },
        { label: 'In Progress', count: counts['In Progress'], className: 'in-progress' },
        { label: 'Resolved', count: counts.Resolved, className: 'resolved' },
        { label: 'Closed', count: counts.Closed, className: 'closed' },
    ];

    return (
        <div className="status-cards">
            {cards.map((card) => (
                <div key={card.label} className={`status-card ${card.className}`}>
                    <div className="status-card-label">{card.label}</div>
                    <div className="status-card-count">{card.count || 0}</div>
                </div>
            ))}
        </div>
    );
}
