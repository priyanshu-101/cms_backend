const express = require('express');
const router = express.Router();

const { createStudent } = require('../controllers/studentController');
const { authMiddleware } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.post('/create', authMiddleware, requireAdmin, createStudent);

module.exports = router;