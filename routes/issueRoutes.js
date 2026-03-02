// ─── Issue Routes ───────────────────────────────────────────
// Base path: /api/issues
//
// GET    /api/issues          → List all issues (with query filters)
// GET    /api/issues/:id      → Get single issue by ID
// POST   /api/issues          → Create a new issue
// PATCH  /api/issues/:id/status → Update issue status
// DELETE /api/issues/:id      → Delete an issue

const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const { validateIssue, validateStatusUpdate, validateIdParam } = require('../middlewares/validators');

router.get('/', issueController.getIssues);
router.get('/:id', validateIdParam, issueController.getIssueById);
router.post('/', validateIssue, issueController.createIssue);
router.patch('/:id/status', validateIdParam, validateStatusUpdate, issueController.updateIssueStatus);
router.delete('/:id', validateIdParam, issueController.deleteIssue);

module.exports = router;
