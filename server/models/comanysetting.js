const mongoose = require('mongoose');

const companySettingSchema = new mongoose.Schema({
    companyName: {
        type: String,
    },
    officeTime: {
        in: { type: String, required: true },  // e.g., "09:30"
        out: { type: String, required: true }, // e.g., "18:30"
        breakMinutes: { type: Number, default: 60 } // total break time in minutes
    },
    gracePeriod: {
        lateEntryMinutes: { type: Number, default: 10 },  // allowed minutes after office in-time
        earlyExitMinutes: { type: Number, default: 10 }   // allowed minutes before office out-time
    },
    workingMinutes: {
        fullDay: { type: Number, default: 540 },       // 9 hours = 540 minutes
        halfDay: { type: Number, default: 270 },       // 4.5 hours = 270 minutes
        shortDayThreshold: { type: Number, default: 360 }, // e.g., under 6 hours (360 mins)
        overtimeAfterMinutes: { type: Number, default: 540 } // overtime counted after 9 hours
    },
    weeklyOffs: {
        type: [Number], // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        default: [0],   // Sunday by default
    },
    attendanceRules: {
        considerEarlyEntryBefore: { type: String, default: '09:00' }, // before this = early
        considerLateEntryAfter: { type: String, default: '09:40' },   // after this = late
        considerEarlyExitBefore: { type: String, default: '18:00' },  // before this = early exit
        considerLateExitAfter: { type: String, default: '18:30' }     // after this = late exit
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CompanySetting', companySettingSchema);