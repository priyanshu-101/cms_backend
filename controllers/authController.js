const User = require('../models/user');
const {
    generateAccessToken,
    generateRefreshToken
} = require('../utils/tokenUtils');

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Invalid credentials or inactive user.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        user.lastLogin = new Date();
        await user.save();

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            },
            accessToken,
            refreshToken
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error. Please try again.' });
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
