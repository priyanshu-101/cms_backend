const express = require('express');
const router = express.Router();

const {
    createClass,
    getClassesByBatch,
    getClassById,
    updateClass,
    markAttendance,
    getClassesByTeacher,
    deleteClass,
    getUpcomingClasses,
    addMaterials,
    updateHomework,
    getClassStats
} = require('../controllers/classController');

const { authMiddleware } = require('../middleware/auth');
const { requireAdmin, requireTeacher } = require('../middleware/roleMiddleware');

router.post('/create', authMiddleware, requireAdmin, createClass);
router.get('/batch/:batchId', authMiddleware, getClassesByBatch);
router.get('/:id', authMiddleware, getClassById);
router.put('/:id', authMiddleware, requireAdmin, updateClass);
router.delete('/:id', authMiddleware, requireAdmin, deleteClass);

router.get('/teacher/:teacherId', authMiddleware, getClassesByTeacher);

router.post('/:classId/attendance', authMiddleware, markAttendance);

router.post('/:classId/materials', authMiddleware, addMaterials);
router.put('/:classId/homework', authMiddleware, updateHomework);

router.get('/:classId/stats', authMiddleware, getClassStats);

router.get('/upcoming', authMiddleware, getUpcomingClasses);

module.exports = router; 