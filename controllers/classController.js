const Class = require('../models/Class');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const User = require('../models/user');
const mongoose = require('mongoose');

const createClass = async (req, res) => {
    try {
        const {
            title,
            description,
            batchId,
            teacherId,
            scheduledDate,
            startTime,
            endTime,
            duration,
            venue,
            meetingLink,
            meetingId,
            topics,
            isRecurring,
            recurrencePattern
        } = req.body;

        if (!title || !batchId || !teacherId || !scheduledDate || !startTime || !endTime || !duration) {
            return res.status(400).json({
                success: false,
                message: 'Title, batchId, teacherId, scheduledDate, startTime, endTime, and duration are required'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(batchId) || !mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid batchId or teacherId format'
            });
        }

        const batch = await Batch.findById(batchId);
        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch not found'
            });
        }

        const teacher = await User.findById(teacherId);
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found or invalid role'
            });
        }

        const newClass = new Class({
            title,
            description,
            batchId,
            teacherId,
            scheduledDate,
            startTime,
            endTime,
            duration,
            venue,
            meetingLink,
            meetingId,
            topics,
            isRecurring,
            recurrencePattern
        });

        await newClass.save();

        res.status(201).json({
            success: true,
            message: 'Class created successfully',
            data: newClass
        });
    } catch (error) {
        console.error('Error creating class:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getClassesByBatch = async (req, res) => {
    try {
        const { batchId } = req.params;
        const { status, startDate, endDate } = req.query;

        if (!mongoose.Types.ObjectId.isValid(batchId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid batch ID format'
            });
        }

        let query = { batchId, isActive: true };

        if (status) {
            query.status = status;
        }

        if (startDate && endDate) {
            query.scheduledDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const classes = await Class.find(query)
            .populate('teacherId', 'firstName lastName email')
            .populate('batchId', 'batchName subject grade')
            .populate('attendance.studentId', 'name email grade')
            .populate('attendance.markedBy', 'firstName lastName')
            .sort({ scheduledDate: 1, startTime: 1 });

        res.status(200).json({
            success: true,
            message: 'Classes retrieved successfully',
            data: classes,
            count: classes.length
        });
    } catch (error) {
        console.error('Error getting classes by batch:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getClassById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid class ID format'
            });
        }

        const classData = await Class.findById(id)
            .populate('teacherId', 'firstName lastName email phone')
            .populate('batchId', 'batchName subject grade')
            .populate('attendance.studentId', 'name email grade')
            .populate('attendance.markedBy', 'firstName lastName');

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Class retrieved successfully',
            data: classData
        });
    } catch (error) {
        console.error('Error getting class by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid class ID format'
            });
        }

        delete updateData.attendance;
        delete updateData.createdAt;
        delete updateData._id;

        const updatedClass = await Class.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: Date.now() },
            { new: true }
        ).populate('teacherId', 'firstName lastName email')
         .populate('batchId', 'batchName subject grade')
         .populate('attendance.studentId', 'name email grade')
         .populate('attendance.markedBy', 'firstName lastName');

        if (!updatedClass) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Class updated successfully',
            data: updatedClass
        });
    } catch (error) {
        console.error('Error updating class:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const markAttendance = async (req, res) => {
    try {
        const { classId } = req.params;
        const { attendanceData } = req.body; 

        if (!mongoose.Types.ObjectId.isValid(classId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid class ID format'
            });
        }

        if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Attendance data is required and must be an array'
            });
        }

        const classData = await Class.findById(classId);
        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        for (const record of attendanceData) {
            if (!mongoose.Types.ObjectId.isValid(record.studentId)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid student ID: ${record.studentId}`
                });
            }

            if (!['present', 'absent', 'late', 'excused'].includes(record.status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid attendance status: ${record.status}`
                });
            }
        }

        const updatedAttendance = attendanceData.map(record => ({
            studentId: record.studentId,
            status: record.status,
            markedBy: req.user.id, 
            markedAt: new Date(),
            notes: record.notes || ''
        }));

        const updatedClass = await Class.findByIdAndUpdate(
            classId,
            { 
                attendance: updatedAttendance,
                updatedAt: Date.now()
            },
            { new: true }
        ).populate('teacherId', 'firstName lastName email')
         .populate('batchId', 'batchName subject grade')
         .populate('attendance.studentId', 'name email grade')
         .populate('attendance.markedBy', 'firstName lastName');

        res.status(200).json({
            success: true,
            message: 'Attendance marked successfully',
            data: updatedClass
        });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getClassesByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { status, startDate, endDate } = req.query;

        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid teacher ID format'
            });
        }

        let query = { teacherId, isActive: true };

        if (status) {
            query.status = status;
        }

        if (startDate && endDate) {
            query.scheduledDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const classes = await Class.find(query)
            .populate('batchId', 'batchName subject grade')
            .populate('attendance.studentId', 'name email grade')
            .populate('attendance.markedBy', 'firstName lastName')
            .sort({ scheduledDate: 1, startTime: 1 });

        res.status(200).json({
            success: true,
            message: 'Classes retrieved successfully',
            data: classes,
            count: classes.length
        });
    } catch (error) {
        console.error('Error getting classes by teacher:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid class ID format'
            });
        }

        const deletedClass = await Class.findByIdAndUpdate(
            id,
            { isActive: false, updatedAt: Date.now() },
            { new: true }
        );

        if (!deletedClass) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Class deleted successfully',
            data: deletedClass
        });
    } catch (error) {
        console.error('Error deleting class:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get upcoming classes
const getUpcomingClasses = async (req, res) => {
    try {
        const { batchId, teacherId, limit = 10 } = req.query;

        let query = {
            scheduledDate: { $gte: new Date() },
            status: { $in: ['scheduled', 'ongoing'] },
            isActive: true
        };

        if (batchId && mongoose.Types.ObjectId.isValid(batchId)) {
            query.batchId = batchId;
        }

        if (teacherId && mongoose.Types.ObjectId.isValid(teacherId)) {
            query.teacherId = teacherId;
        }

        const classes = await Class.find(query)
            .populate('teacherId', 'firstName lastName')
            .populate('batchId', 'batchName subject grade')
            .populate('attendance.studentId', 'name email grade')
            .populate('attendance.markedBy', 'firstName lastName')
            .sort({ scheduledDate: 1, startTime: 1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            message: 'Upcoming classes retrieved successfully',
            data: classes,
            count: classes.length
        });
    } catch (error) {
        console.error('Error getting upcoming classes:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const addMaterials = async (req, res) => {
    try {
        const { classId } = req.params;
        const { materials } = req.body; 

        if (!mongoose.Types.ObjectId.isValid(classId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid class ID format'
            });
        }

        if (!Array.isArray(materials) || materials.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Materials data is required and must be an array'
            });
        }

        const classData = await Class.findById(classId);
        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        for (const material of materials) {
            if (!material.title || !material.type || !material.url) {
                return res.status(400).json({
                    success: false,
                    message: 'Each material must have title, type, and url'
                });
            }

            if (!['document', 'video', 'link', 'assignment'].includes(material.type)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid material type: ${material.type}`
                });
            }
        }

        const updatedMaterials = [
            ...classData.materials,
            ...materials.map(material => ({
                ...material,
                uploadedAt: new Date()
            }))
        ];

        const updatedClass = await Class.findByIdAndUpdate(
            classId,
            { 
                materials: updatedMaterials,
                updatedAt: Date.now()
            },
            { new: true }
        ).populate('teacherId', 'firstName lastName email')
         .populate('batchId', 'batchName subject grade');

        res.status(200).json({
            success: true,
            message: 'Materials added successfully',
            data: updatedClass
        });
    } catch (error) {
        console.error('Error adding materials:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateHomework = async (req, res) => {
    try {
        const { classId } = req.params;
        const { description, dueDate, attachments } = req.body;

        if (!mongoose.Types.ObjectId.isValid(classId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid class ID format'
            });
        }

        const classData = await Class.findById(classId);
        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        const homeworkData = {
            description: description || classData.homework?.description,
            dueDate: dueDate ? new Date(dueDate) : classData.homework?.dueDate,
            attachments: attachments || classData.homework?.attachments || []
        };

        const updatedClass = await Class.findByIdAndUpdate(
            classId,
            { 
                homework: homeworkData,
                updatedAt: Date.now()
            },
            { new: true }
        ).populate('teacherId', 'firstName lastName email')
         .populate('batchId', 'batchName subject grade')
         .populate('attendance.studentId', 'name email grade')
         .populate('attendance.markedBy', 'firstName lastName');

        res.status(200).json({
            success: true,
            message: 'Homework updated successfully',
            data: updatedClass
        });
    } catch (error) {
        console.error('Error updating homework:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getClassStats = async (req, res) => {
    try {
        const { classId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(classId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid class ID format'
            });
        }

        const classData = await Class.findById(classId)
            .populate('attendance.studentId', 'name email grade')
            .populate('attendance.markedBy', 'firstName lastName');

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        const attendanceStats = {
            total: classData.attendance.length,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            attendanceRate: 0
        };

        classData.attendance.forEach(record => {
            attendanceStats[record.status]++;
        });

        if (attendanceStats.total > 0) {
            attendanceStats.attendanceRate = ((attendanceStats.present + attendanceStats.late) / attendanceStats.total * 100).toFixed(2);
        }

        const materialsStats = {
            total: classData.materials.length,
            byType: {
                document: 0,
                video: 0,
                link: 0,
                assignment: 0
            }
        };

        classData.materials.forEach(material => {
            materialsStats.byType[material.type]++;
        });

        const stats = {
            classInfo: {
                _id: classData._id,
                title: classData.title,
                scheduledDate: classData.scheduledDate,
                status: classData.status
            },
            attendance: attendanceStats,
            materials: materialsStats,
            hasHomework: !!classData.homework?.description,
            homeworkDueDate: classData.homework?.dueDate
        };

        res.status(200).json({
            success: true,
            message: 'Class statistics retrieved successfully',
            data: stats
        });
    } catch (error) {
        console.error('Error getting class stats:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    createClass,
    getClassesByBatch,
    getClassById,
    updateClass,
    markAttendance,
    getClassesByTeacher,
    deleteClass,
    getUpcomingClasses,
    addMaterials,
    updateHomework,
    getClassStats
}; 