const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true,
        // Format: "HH:MM" (24-hour)
    },
    endTime: {
        type: String,
        required: true,
        // Format: "HH:MM" (24-hour)
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    classType: {
        type: String,
        enum: ['regular', 'makeup', 'extra', 'exam'],
        default: 'regular'
    },
    venue: {
        type: String,
        trim: true,
        maxlength: 100
    },
    // For online classes
    meetingLink: {
        type: String,
        trim: true
    },
    meetingId: {
        type: String,
        trim: true
    },
    // Class content and materials
    topics: [{
        type: String,
        trim: true
    }],
    materials: [{
        title: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['document', 'video', 'link', 'assignment'],
            required: true
        },
        url: {
            type: String,
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Attendance tracking
    attendance: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        status: {
            type: String,
            enum: ['present', 'absent', 'late', 'excused'],
            default: 'absent'
        },
        markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        markedAt: {
            type: Date,
            default: Date.now
        },
        notes: {
            type: String,
            trim: true
        }
    }],
    // Class notes and summary
    notes: {
        type: String,
        trim: true
    },
    homework: {
        description: {
            type: String,
            trim: true
        },
        dueDate: {
            type: Date
        },
        attachments: [{
            title: String,
            url: String
        }]
    },
    // Recurring class settings
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurrencePattern: {
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            default: 'weekly'
        },
        interval: {
            type: Number,
            default: 1
        },
        daysOfWeek: [{
            type: Number, // 0-6 (Sunday-Saturday)
            min: 0,
            max: 6
        }],
        endDate: {
            type: Date
        },
        maxOccurrences: {
            type: Number
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for better query performance
classSchema.index({ batchId: 1, scheduledDate: 1 });
classSchema.index({ teacherId: 1, scheduledDate: 1 });
classSchema.index({ status: 1, scheduledDate: 1 });

// Virtual for formatted date and time
classSchema.virtual('formattedDateTime').get(function() {
    const date = new Date(this.scheduledDate);
    return {
        date: date.toLocaleDateString(),
        time: `${this.startTime} - ${this.endTime}`,
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' })
    };
});

// Virtual for attendance summary
classSchema.virtual('attendanceSummary').get(function() {
    const summary = {
        total: this.attendance.length,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0
    };
    
    this.attendance.forEach(record => {
        summary[record.status]++;
    });
    
    return summary;
});

module.exports = mongoose.model('Class', classSchema);