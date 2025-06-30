const User = require('../models/user');
const {
    generateAccessToken,
    generateRefreshToken
} = require('../utils/tokenUtils');

const loginUser = async (req, res) => {
  console.log('LOGIN HANDLER REACHED');
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    console.log('Login attempt for email:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    console.log('User found:', user.email, 'Role:', user.role);

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    try {
      const isMatch = await user.comparePassword(password);
      console.log('Password match result:', isMatch);
      
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
    } catch (bcryptError) {
      console.error('Password comparison error:', bcryptError);
      return res.status(500).json({ success: false, message: 'Authentication error' });
    }

    user.lastLogin = new Date();
    await user.save();

    // Remove password before sending response
    const { password: _, ...userData } = user.toObject();

    // Generate access token
    console.log('About to generate access token for user:', user._id);
    const accessToken = generateAccessToken(user);
    console.log('Generated accessToken:', accessToken ? 'Token generated successfully' : 'Token generation failed');
    console.log('accessToken type:', typeof accessToken);
    console.log('accessToken value:', accessToken);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userData,
      accessToken
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const logout = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getMe = async (req, res) => {
  try {
    const user = req.user.toObject();
    
    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
    loginUser,
    logout,
    getMe
};
