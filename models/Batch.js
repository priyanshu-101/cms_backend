const mongoose = require('mongoose');
``
const batchSchema = new mongoose.Schema({
    batchName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    subject: {
        type: String,
        required: true,
    },
    grade: {
        type: String,
        required: true,
    },
    timing: {
        type: String,
        required: true,
    },
    assignedTeacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
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

module.exports = mongoose.model('Batch', batchSchema);