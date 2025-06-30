const express = require('express');
const router = express.Router();

const { getteacher, createTeacher, getTeacherById, updateTeacher, deleteTeacher} = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const {requireAdmin} = require('../middleware/roleMiddleware');

router.get('/teachers', authMiddleware, requireAdmin, getteacher);
router.get('/teachers/:id', authMiddleware, requireAdmin, getTeacherById);
router.post('/create',authMiddleware,  requireAdmin, createTeacher);
router.delete('/teachers/:id', authMiddleware, requireAdmin, deleteTeacher);
router.put('/teachers/:id', authMiddleware, requireAdmin, updateTeacher);

module.exports = router;