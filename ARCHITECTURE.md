# 🏗️ Project Architecture - Issue Tracker

This document outlines the technical design, architectural decisions, and structural overview of the Internal Issue Tracker.

## 🚀 Why This Stack?

- **Frontend: Next.js + React**: Selected for its robust routing, server-side rendering capabilities (though primarily used as a SPA here), and excellent developer experience.
- **Backend: Node.js + Express 5**: A lightweight, high-performance runtime. Express 5 provides modern routing features and better error handling.
- **Database: PostgreSQL**: A powerful relational database that ensures data integrity through schemas, constraints, and relational mapping (Issues ↔ Comments).
- **Real-time: Socket.io**: Provides low-latency, bi-directional communication for instant dashboard updates without manual refreshing.
- **Styling: Vanilla CSS (Theme-ready)**: Custom-built CSS system using CSS Variables for seamless light/dark mode transitions and high performance.

---

## 💾 Database Schema

The database uses a relational structure with optimized indexes for filtering.

### `issues` Table
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY |
| `title` | VARCHAR(255) | NOT NULL |
| `description` | TEXT | NOT NULL |
| `project` | VARCHAR(100) | NOT NULL (Indexed) |
| `priority` | VARCHAR(20) | CHECK (Low, Medium, High, Critical) |
| `assignee` | VARCHAR(100) | NOT NULL |
| `status` | VARCHAR(20) | DEFAULT 'Open' |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

### `comments` Table
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY |
| `issue_id` | INTEGER | REFERENCES issues(id) ON DELETE CASCADE |
| `author` | VARCHAR(100) | NOT NULL |
| `text` | TEXT | NOT NULL |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

---

## 🛣️ API Endpoints Summary

| Base Path | Scope | Primary Methods |
| :--- | :--- | :--- |
| `/api/issues` | Main issue management | GET, POST, DELETE |
| `/api/issues/:id/status` | Workflow management | PATCH |
| `/api/issues/:id/comments`| Interaction tracking | GET, POST |
| `/api/stats` | Analytics & Charts | GET |
| `/api/constants` | System Config | GET |
| `/api/export/csv` | Data Portability | GET |

---

## 🧱 Component Structure (Frontend)

The frontend is modularized into reusable components located in `client/components/`:

1.  **`Navbar`**: Manages branding and global actions (Export, Charts, Theme, Create).
2.  **`StatusCards`**: Displays real-time counts from the `/stats` endpoint.
3.  **`IssuesTable`**: Handles list rendering, searching, and filtering logic.
4.  **`IssueDetail`**: Side panel for viewing and updating specific issues.
5.  **`Charts`**: Encapsulates Chart.js logic for data visualization.
6.  **`CreateIssueModal`**: Isolated form logic for adding new issues.

---

## 🔮 Future Improvements

Given more time, the following enhancements would be prioritized:
1.  **Authentication & RBAC**: Implement session management and Role-Based Access Control (Admin vs. User).
2.  **File Attachments**: Support for uploading screenshots or logs to specific issues.
3.  **Advanced Notifications**: Email or Slack alerts for high-priority issue assignments.
4.  **Issue History/Audit Log**: Track detailed change history for every field in an issue.
5.  **Performance Optimization**: Implement server-side pagination for the issues table as the data grows.
6.  **Unit & Integration Tests**: Comprehensive test suite using Jest and React Testing Library.
