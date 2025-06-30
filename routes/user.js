const express = require('express');
const router = express.Router();

const { getteacher, createTeacher} = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const {requireAdmin} = require('../middleware/roleMiddleware');

router.get('/teachers', authMiddleware, requireAdmin, getteacher);
router.post('/create',authMiddleware,  requireAdmin, createTeacher);

module.exports = router;