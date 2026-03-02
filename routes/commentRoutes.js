// ─── Comment Routes ─────────────────────────────────────────
// Base path: /api/issues/:id/comments
//
// GET    /api/issues/:id/comments  → Get all comments for an issue
// POST   /api/issues/:id/comments  → Add a comment to an issue

const express = require('express');
const router = express.Router({ mergeParams: true });
const commentController = require('../controllers/commentController');
const { validateComment, validateIdParam } = require('../middlewares/validators');

router.get('/', validateIdParam, commentController.getComments);
router.post('/', validateIdParam, validateComment, commentController.addComment);

module.exports = router;
