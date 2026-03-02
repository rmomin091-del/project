# 🐛 Internal Issue Tracker

A full-stack, real-time application for tracking bugs, feature requests, and improvements. Built with modern web technologies and a premium UI.

## ✨ Features
- **Real-time Updates**: Instant dashboard updates via Socket.io when issues are created, updated, or deleted.
- **Dynamic Dashboard**: Visualize issue distribution by project and priority with interactive charts.
- **Advanced Filtering**: Search and filter issues by project, priority, status, and assignee.
- **Side Panel Details**: Quick access to issue descriptions and comment history.
- **CSV Export**: Export filtered reports for offline analysis.
- **Dark Mode**: Premium dark/light mode toggle with theme persistence.

## 🚀 Technology Stack
- **Frontend**: Next.js 14+, React 18+, Tailwind CSS (Custom Vanilla CSS), Chart.js
- **Backend**: Node.js, Express, PostgreSQL, Socket.io
- **Database**: PostgreSQL (Relational schema with optimized indexes)

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL

### Backend Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/postgres
   ```
4. Seed the database:
   ```bash
   npm run seed
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📄 API Documentation
Refer to [api_endpoints.md](api_endpoints.md) for a full list of available endpoints.
