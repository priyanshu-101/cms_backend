const express = require('express');
const router = express.Router();

const { getteacher} = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const {requireAdmin} = require('../middleware/roleMiddleware');

router.get('/teachers', authMiddleware, requireAdmin, getteacher);

module.exports = router;