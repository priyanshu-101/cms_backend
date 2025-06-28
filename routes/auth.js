const express = require('express');
const router = express.Router();
const {loginUser, logout } = require('../controllers/authController');
const {authMiddleware} = require('../middleware/auth');

router.post('/login', loginUser);
router.post('/logout', authMiddleware, logout);

module.exports = router;