const express = require('express');
const router = express.Router();

const { createBatch, getBatches, getBatchesForTeacher } = require('../controllers/batchController');
const { authMiddleware } = require('../middleware/auth');
const { requireAdmin, requireTeacher } = require('../middleware/roleMiddleware');

router.post('/create', authMiddleware, requireAdmin, createBatch);
router.get('/getbatches', authMiddleware,requireAdmin, getBatches);
router.get('/teacher/:id/batches', authMiddleware, getBatchesForTeacher);

module.exports = router;