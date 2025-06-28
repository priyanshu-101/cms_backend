const user = require('../models/user');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');   

const getteacher = async (req, res) => {
    try {
        const teachers = await user.find({ role: 'teacher' }).select('-password');
        if (!teachers || teachers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No teachers found'
            });
        }
        res.status(200).json({
            success: true,
            data: teachers
        });
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

module.exports = {
    getteacher,
}