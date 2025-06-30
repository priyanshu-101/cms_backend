const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  console.log('generateAccessToken called with user:', {
    id: user._id,
    role: user.role,
    email: user.email
  });
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);
  
  try {
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
    console.log('Token generation successful, token length:', token ? token.length : 'null');
    return token;
  } catch (error) {
    console.error('JWT token generation error:', error);
    return null;
  }
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      type: 'refresh'
    }, 
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
};
