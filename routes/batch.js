const express = require('express');
const router = express.Router();

const { createBatch, getBatches, getBatchesForTeacher, updateBatch, deleteBatch, getBatchById } = require('../controllers/batchController');
const { authMiddleware } = require('../middleware/auth');
const { requireAdmin, requireTeacher } = require('../middleware/roleMiddleware');

router.post('/create', authMiddleware, requireAdmin, createBatch);
router.get('/getbatches', authMiddleware,requireAdmin, getBatches);
router.get('/teacher/:id/batches', authMiddleware, getBatchesForTeacher);
router.put('/update/:id', authMiddleware, requireAdmin, updateBatch);
router.delete('/delete/:id', authMiddleware, requireAdmin, deleteBatch);
router.get('/getbatch/:id', authMiddleware, requireAdmin, getBatchById);

module.exports = router;