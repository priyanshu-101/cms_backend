const Batch = require('../models/Batch');
const User = require('../models/user');

const createBatch = async (req, res) => {
    try {
        const { batchName, subject, grade, timing, assignedTeacherId } = req.body;
        const teacher = await User.findOne({ _id: assignedTeacherId, role: 'teacher', isActive: true });
        if (!teacher) {
            return res.status(400).json({
                success: false,
                message: 'Assigned teacher does not exist or is not a teacher.'
            });
        }
        const newBatch = new Batch({ batchName, subject, grade, timing, assignedTeacherId });
        await newBatch.save();
        res.status(201).json({
            success: true,
            data: newBatch
        });
    } catch (error) {
        console.error('Error creating batch:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

const getBatches = async (req, res) => {
    try {
        const { page = 1, limit = 10, teacherId, subject } = req.query;
        const query = {};
        if (teacherId) {
            query.assignedTeacherId = teacherId;
        }
        if (subject) {
            query.subject = subject;
        }
        const total = await Batch.countDocuments(query);
        const batches = await Batch.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('assignedTeacherId', 'username');
        res.status(200).json({
            success: true,
            data: batches,
            total,
            page,
            limit
        });
    } catch (error) {
        console.error('Error fetching batches:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

const getBatchesForTeacher = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const teacherId = req.params.id;
        if (!teacherId) {
            return res.status(400).json({
                success: false,
                message: 'Teacher ID is required in the URL parameter.'
            });
        }
        const query = { assignedTeacherId: teacherId };
        const total = await Batch.countDocuments(query);
        const batches = await Batch.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate('assignedTeacherId', 'username');
        res.status(200).json({
            success: true,
            data: batches,
            total,
            page: Number(page),
            limit: Number(limit)
        });
    } catch (error) {
        console.error('Error fetching teacher batches:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

module.exports = {
    getBatches,
    createBatch,
    getBatchesForTeacher
}