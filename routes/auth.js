const express = require('express');
const router = express.Router();
const {loginUser, logout, getMe } = require('../controllers/authController');
const {authMiddleware} = require('../middleware/auth');

router.post('/login', loginUser);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);

module.exports = router;