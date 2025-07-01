const express = require('express');
const router = express.Router();

const { createStudent, getStudentsByBatchId, getStudentById, removeStudentFromBatch, updateStudent, getAllStudents } = require('../controllers/studentController');
const { authMiddleware } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.post('/create', authMiddleware, requireAdmin, createStudent);
router.get('/batch/:batchId', authMiddleware, requireAdmin, getStudentsByBatchId);
router.get('/:id', authMiddleware, getStudentById);
router.delete('/:studentId/batch/:batchId', authMiddleware, requireAdmin, removeStudentFromBatch);
router.put('/:id', authMiddleware, requireAdmin, updateStudent);
router.get('/', authMiddleware, requireAdmin, getAllStudents);

module.exports = router;