const Student = require('../models/Student');
const Batch = require('../models/Batch');
const mongoose = require('mongoose');
const redisClient = require('../utils/redisClient');

const createStudent = async (req, res) => {
    try {
        const { name, email, password, phone, address, grade, batchIds, enrollmentDate } = req.body;
        
        // Validate batchIds is required
        if (!batchIds || batchIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Batch IDs are required'
            });
        }
        
        // Check if all batchIds are valid ObjectIds
        const validObjectIds = batchIds.every(id => mongoose.Types.ObjectId.isValid(id));
        if (!validObjectIds) {
            return res.status(400).json({
                success: false,
                message: 'Invalid batch ID format'
            });
        }
        
        // Check if all batches exist in the database
        const existingBatches = await Batch.find({ _id: { $in: batchIds } });
        if (existingBatches.length !== batchIds.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more batch IDs do not exist'
            });
        }
        
        const student = new Student({ name, email, password, phone, address, grade, batchIds, enrollmentDate });
        await student.save();
        res.status(201).json({ 
            success: true,
            message: 'Student created successfully', 
            data: student 
        });
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

const getStudentsByBatchId = async (req, res) => {
    try {
        const { batchId } = req.params;
        
        if (!batchId) {
            return res.status(400).json({
                success: false,
                message: 'Batch ID is required'
            });
        }
        

        if (!mongoose.Types.ObjectId.isValid(batchId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid batch ID format'
            });
        }
        
        const batch = await Batch.findById(batchId);
        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch not found'
            });
        }

        // Caching logic
        const cacheKey = `students:batch:${batchId}`;
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({ source: 'cache', data: JSON.parse(cachedData) });
        }

        const students = await Student.find({ 
            batchIds: batchId,
            isActive: true 
        }).select('-password');         
        await redisClient.setEx(cacheKey, 3600, JSON.stringify({
            batch: {
                _id: batch._id,
                name: batch.name
            },
            students: students,
            count: students.length
        }));
        res.status(200).json({
            success: true,
            message: 'Students retrieved successfully',
            data: {
                batch: {
                    _id: batch._id,
                    name: batch.name
                },
                students: students,
                count: students.length
            }
        });
    } catch (error) {
        console.error('Error getting students by batch ID:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = `student:${id}`;
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({ source: 'cache', data: JSON.parse(cachedData) });
        }
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(student));
        res.status(200).json({
            success: true,
            message: 'Student retrieved successfully',
            data: student
        });
    } catch (error) {
        console.error('Error getting student by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

const removeStudentFromBatch = async (req, res) => {
    try {
        const { studentId, batchId } = req.params;
        
        if (!studentId || !batchId) {
            return res.status(400).json({
                success: false,
                message: 'Student ID and Batch ID are required'
            });
        }
        
        if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(batchId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Student ID or Batch ID format'
            });
        }
        
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        const batch = await Batch.findById(batchId);
        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch not found'
            });
        }
        
        if (!student.batchIds.includes(batchId)) {
            return res.status(400).json({
                success: false,
                message: 'Student is not enrolled in this batch'
            });
        }
        
        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            { 
                $pull: { batchIds: batchId },
                updatedAt: Date.now()
            },
            { new: true }
        ).select('-password');
        res.status(200).json({
            success: true,
            message: 'Student removed from batch successfully',
            data: {
                student: updatedStudent,
                removedBatch: {
                    _id: batch._id,
                    name: batch.name
                }
            }
        });
    } catch (error) {
        console.error('Error removing student from batch:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, phone, address, grade, batchIds, enrollmentDate } = req.body;
        const student = await Student.findByIdAndUpdate(id, { name, email, password, phone, address, grade, batchIds, enrollmentDate }, { new: true });
        res.status(200).json({
            success: true,
            message: 'Student updated successfully',
            data: student
        });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

const getAllStudents = async (req, res) => {
    try {
        const cacheKey = 'students:all';
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({ source: 'cache', data: JSON.parse(cachedData) });
        }
        const students = await Student.find().select('-password -__v');
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(students));
        return res.status(200).json({ source: 'db', data: students });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Student deleted successfully',
            data: student
        });
    }
    catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

module.exports = { createStudent, getStudentsByBatchId, getStudentById, removeStudentFromBatch, updateStudent, getAllStudents, deleteStudent};