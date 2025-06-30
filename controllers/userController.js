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

const getTeacherById = async (req, res) => {
    try {
        const teacher = await user.findById(req.params.id).select('-password');
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }
        res.status(200).json({
            success: true,
            data: teacher
        });
    } catch (error) {
        console.error('Error fetching teacher by ID:', error);
    }
}

const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, firstName, lastName, phone, subjects } = req.body;

        const updatedTeacher = await user.findByIdAndUpdate(id, { username, email, firstName, lastName, phone, subjects }, { new: true }).select('-password');
        if (!updatedTeacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }
        res.status(200).json({
            success: true,
            data: updatedTeacher
        });
    } catch (error) {
        console.error('Error updating teacher:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTeacher = await user.findByIdAndDelete(id);
        if (!deletedTeacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Teacher deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting teacher:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

module.exports = {
    deleteTeacher,
    updateTeacher,
    getTeacherById,
    getteacher,
    createTeacher
}