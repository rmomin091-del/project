require('dotenv').config();
const db = require('../config/db');
const { PROJECTS, PRIORITIES, STATUSES, TEAM_MEMBERS } = require('../constants');
const fs = require('fs');
const path = require('path');

const seedIssues = [
    {
        title: 'Login page crashes on mobile devices',
        description: 'When users try to log in from a mobile browser, the page becomes unresponsive after entering credentials. This affects both iOS Safari and Android Chrome. The issue seems related to the viewport handling in the authentication modal.',
        project: 'Alpha',
        priority: 'Critical',
        assignee: 'Aarav Sharma',
        status: 'Open',
    },
    {
        title: 'Add dark mode support to settings panel',
        description: 'Users have requested a dark mode toggle in the settings panel. This should apply across all UI components and persist across sessions using localStorage or user preferences in the database.',
        project: 'Alpha',
        priority: 'Medium',
        assignee: 'Priya Patel',
        status: 'In Progress',
    },
    {
        title: 'Database query timeout on reports page',
        description: 'The monthly reports page takes over 30 seconds to load when there are more than 10,000 records. The SQL queries need to be optimized with proper indexing and pagination.',
        project: 'Beta',
        priority: 'High',
        assignee: 'Rohan Mehta',
        status: 'Open',
    },
    {
        title: 'Implement CSV export for transaction history',
        description: 'Add the ability to export transaction history as a CSV file. Should include filters for date range, transaction type, and status. The exported file should include all columns visible in the UI table.',
        project: 'Beta',
        priority: 'Low',
        assignee: 'Sneha Iyer',
        status: 'Resolved',
    },
    {
        title: 'Fix broken navigation links in sidebar',
        description: 'Several navigation links in the sidebar are pointing to deprecated routes. The "Analytics" and "Team" links return 404 errors. These need to be updated to the new route structure introduced in v2.3.',
        project: 'Gamma',
        priority: 'Medium',
        assignee: 'Vikram Singh',
        status: 'In Progress',
    },
    {
        title: 'User profile picture upload fails silently',
        description: 'When uploading a profile picture larger than 2MB, the upload fails without any error message shown to the user. Need to add proper file size validation and display an informative error toast notification.',
        project: 'Alpha',
        priority: 'High',
        assignee: 'Aarav Sharma',
        status: 'Open',
    },
    {
        title: 'Redesign the onboarding flow',
        description: 'The current onboarding flow has a 60% drop-off rate at step 3. Redesign the flow to be more intuitive: reduce steps from 5 to 3, add progress indicators, and include skip options for non-essential fields.',
        project: 'Delta',
        priority: 'High',
        assignee: 'Priya Patel',
        status: 'Open',
    },
    {
        title: 'API rate limiting not enforced',
        description: 'The public API endpoints currently have no rate limiting, making us vulnerable to abuse. Implement rate limiting middleware with configurable thresholds: 100 requests per minute for authenticated users, 20 for anonymous.',
        project: 'Beta',
        priority: 'Critical',
        assignee: 'Rohan Mehta',
        status: 'In Progress',
    },
    {
        title: 'Notification emails sent in wrong timezone',
        description: 'All notification emails display timestamps in UTC instead of the user\'s configured timezone. This causes confusion, especially for users in IST and PST. The email template engine needs timezone-aware formatting.',
        project: 'Gamma',
        priority: 'Medium',
        assignee: 'Sneha Iyer',
        status: 'Resolved',
    },
    {
        title: 'Add search functionality to user directory',
        description: 'The team directory page has no search or filter capability. With 200+ team members, users need to scroll endlessly to find someone. Add instant search by name, department, and role with debounced API calls.',
        project: 'Delta',
        priority: 'Medium',
        assignee: 'Vikram Singh',
        status: 'Open',
    },
    {
        title: 'Memory leak in WebSocket connection handler',
        description: 'The real-time notification system has a memory leak where disconnected WebSocket connections are not properly cleaned up. After running for 48 hours, the server memory usage grows from 200MB to over 2GB.',
        project: 'Gamma',
        priority: 'Critical',
        assignee: 'Aarav Sharma',
        status: 'Open',
    },
    {
        title: 'Update dependencies to fix security vulnerabilities',
        description: 'npm audit reports 12 vulnerabilities (3 high, 9 moderate) in our dependencies. Key packages needing updates: express (4.17 → 4.19), lodash (4.17.20 → 4.17.21), and jsonwebtoken (8.5.1 → 9.0.0).',
        project: 'Alpha',
        priority: 'High',
        assignee: 'Rohan Mehta',
        status: 'Closed',
    },
    {
        title: 'Dashboard charts not rendering on Firefox',
        description: 'The analytics dashboard charts (built with Chart.js) fail to render on Firefox 115+. The issue is related to canvas 2D context initialization. Charts work fine on Chrome and Edge.',
        project: 'Delta',
        priority: 'Medium',
        assignee: 'Sneha Iyer',
        status: 'In Progress',
    },
    {
        title: 'Add keyboard shortcuts for power users',
        description: 'Implement keyboard shortcuts for common actions: Ctrl+N for new item, Ctrl+S for save, Ctrl+F for search focus, Escape to close modals. Should be discoverable via a help overlay triggered by pressing "?".',
        project: 'Gamma',
        priority: 'Low',
        assignee: 'Priya Patel',
        status: 'Closed',
    },
    {
        title: 'Payment gateway integration returns 502 intermittently',
        description: 'The Stripe payment gateway integration returns 502 Bad Gateway errors approximately 5% of the time. This appears to be a timeout issue with our server-to-Stripe communication. Need to implement retry logic with exponential backoff.',
        project: 'Beta',
        priority: 'Critical',
        assignee: 'Vikram Singh',
        status: 'Open',
    },
];

const seedComments = [
    { issueIndex: 0, author: 'Priya Patel', text: 'I can reproduce this on iPhone 14 with iOS 17. The modal overlay seems to block touch events.' },
    { issueIndex: 0, author: 'Aarav Sharma', text: 'Looking into this now. It seems like a z-index issue with the mobile viewport meta tag.' },
    { issueIndex: 2, author: 'Sneha Iyer', text: 'Have we considered adding pagination to the reports query? That might solve the timeout.' },
    { issueIndex: 2, author: 'Rohan Mehta', text: 'Good idea. I will also add an index on the created_at column for the reports table.' },
    { issueIndex: 4, author: 'Vikram Singh', text: 'Updated the Analytics link. Still working on the Team page redirect.' },
    { issueIndex: 7, author: 'Aarav Sharma', text: 'We should use express-rate-limit package. It supports Redis-backed stores for distributed setups.' },
    { issueIndex: 10, author: 'Rohan Mehta', text: 'I suspect the issue is in the heartbeat handler. It is not removing stale connections from the Map.' },
    { issueIndex: 14, author: 'Vikram Singh', text: 'I am adding a 3-retry mechanism with 1s, 2s, 4s backoff intervals. Will also add circuit breaker pattern.' },
];

const seed = async () => {
    try {
        console.log('🌱 Starting seed...');

        // Clear existing data (drop tables to ensure schema match)
        console.log('🗑️  Dropping existing tables...');
        await db.query('DROP TABLE IF EXISTS comments, issues CASCADE');

        // Read and execute schema
        const schemaPath = path.join(__dirname, '..', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');
        await db.query(schema);
        console.log('✅ Schema created');

        // Insert issues
        for (const issue of seedIssues) {
            await db.query(
                `INSERT INTO issues (title, description, project, priority, assignee, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [issue.title, issue.description, issue.project, issue.priority, issue.assignee, issue.status]
            );
        }
        console.log(`✅ Inserted ${seedIssues.length} issues`);

        // Insert comments
        for (const comment of seedComments) {
            const issueId = comment.issueIndex + 1; // SERIAL starts at 1
            await db.query(
                `INSERT INTO comments (issue_id, author, text) VALUES ($1, $2, $3)`,
                [issueId, comment.author, comment.text]
            );
        }
        console.log(`✅ Inserted ${seedComments.length} comments`);

        console.log('🎉 Seed complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:');
        console.error(err);
        process.exit(1);
    }
};

seed();
