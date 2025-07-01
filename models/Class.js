const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    attendance: [
        {
            studentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student',
                required: true,
            },
            present: {
                type: Boolean,
                required: true,
            },
        }
    ],
    notes: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Class = mongoose.model('Class', classSchema);

module.exports = Class;