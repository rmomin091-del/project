// ─── Stats Routes ───────────────────────────────────────────
// Base path: /api/stats
//
// GET    /api/stats  → Get issue counts by project, priority, and status (for charts)

const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.get('/', statsController.getStats);

module.exports = router;
