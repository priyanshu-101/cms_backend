const user = require('../models/user');
const { ROLES } = require('../config/constants');

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

const createTeacher = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, phone, subjects } = req.body;

        const newTeacher = new user({
            username,
            email,
            password, 
            role: ROLES.TEACHER, 
            firstName,
            lastName,
            phone,
            subjects
        });

        await newTeacher.save();

        res.status(201).json({
            success: true,
            message: 'Teacher created successfully',
            data: newTeacher
        });
    } catch (error) {
        console.error('Error creating teacher:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getteacher,
    createTeacher
}