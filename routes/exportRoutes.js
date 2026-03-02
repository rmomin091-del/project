// ─── Export Routes ──────────────────────────────────────────
// Base path: /api/export
//
// GET    /api/export/csv  → Download all issues as CSV (supports query filters)

const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

router.get('/csv', exportController.exportCSV);

module.exports = router;
