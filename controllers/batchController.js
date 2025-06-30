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

module.exports = {
    createBatch
}