// ─── Constants Routes ───────────────────────────────────────
// Base path: /api/constants
//
// GET    /api/constants  → Get all dropdown values (projects, priorities, statuses, team members)

const express = require('express');
const { PROJECTS, PRIORITIES, STATUSES, TEAM_MEMBERS } = require('../constants');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ projects: PROJECTS, priorities: PRIORITIES, statuses: STATUSES, teamMembers: TEAM_MEMBERS });
});

module.exports = router;
