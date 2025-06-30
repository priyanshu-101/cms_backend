const express = require('express');
const router = express.Router();

const { createBatch } = require('../controllers/batchController');
const { authMiddleware } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.post('/create', authMiddleware, requireAdmin, createBatch);

module.exports = router;