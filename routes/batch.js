const express = require('express');
const router = express.Router();

const { createBatch, getBatches, getBatchesForTeacher, updateBatch } = require('../controllers/batchController');
const { authMiddleware } = require('../middleware/auth');
const { requireAdmin, requireTeacher } = require('../middleware/roleMiddleware');

router.post('/create', authMiddleware, requireAdmin, createBatch);
router.get('/getbatches', authMiddleware,requireAdmin, getBatches);
router.get('/teacher/:id/batches', authMiddleware, getBatchesForTeacher);
router.put('/update/:id', authMiddleware, requireAdmin, updateBatch);

module.exports = router;