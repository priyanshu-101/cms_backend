const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found or inactive.' 
      });
    }
    
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid token.' 
    });
  }
};

module.exports = authMiddleware;