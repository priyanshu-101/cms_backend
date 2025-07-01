const express = require('express');
const router = express.Router();

const { createStudent, getStudentsByBatchId } = require('../controllers/studentController');
const { authMiddleware } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.post('/create', authMiddleware, requireAdmin, createStudent);
router.get('/batch/:batchId', authMiddleware, requireAdmin, getStudentsByBatchId);

module.exports = router;