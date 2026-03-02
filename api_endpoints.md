# API Endpoints Documentation

This document lists all the available API endpoints for the Internal Issue Tracker application.

## Base URL
`http://localhost:5000/api`

---

## Issues
Manage core issue data.

| Method | Endpoint | Description | Query Params / Body |
| :--- | :--- | :--- | :--- |
| **GET** | `/issues` | List all issues | `project`, `priority`, `status`, `assignee`, `search` |
| **GET** | `/issues/:id` | Get single issue details | - |
| **POST** | `/issues` | Create a new issue | `{ title, description, project, priority, assignee, status }` |
| **PATCH** | `/issues/:id/status` | Update issue status | `{ status }` |
| **DELETE** | `/issues/:id` | Delete an issue | - |

---

## Comments
Interaction tracking for specific issues.

| Method | Endpoint | Description | Body |
| :--- | :--- | :--- | :--- |
| **GET** | `/issues/:id/comments` | Get all comments for an issue | - |
| **POST** | `/issues/:id/comments` | Add a comment to an issue | `{ author, text }` |

---

## Statistics & Analytics
Data for dashboard charts and summaries.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/stats` | Get issue counts aggregated by project, priority, and status |
| **GET** | `/constants` | Get system dropdown values (projects, team members, etc.) |

---

## Export
Data portability.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/export/csv` | Download filtered issues as a CSV file |

---

## System
Health monitoring.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/health` | Check API server status and timestamp |
