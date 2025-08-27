const defaultsetting = {
    officeTime: {
        in: { type: String, default: '10:00' },     // e.g., "09:30"
        out: { type: String, default: '18:00' },    // e.g., "18:30"
        breakMinutes: { type: Number, default: 60 }
    },
    gracePeriod: {
        lateEntryMinutes: { type: Number, default: 10 },
        earlyExitMinutes: { type: Number, default: 10 }
    },
    workingMinutes: {
        fullDay: { type: Number, default: 480 },
        halfDay: { type: Number, default: 270 },
        shortDayThreshold: { type: Number, default: 270 },
        overtimeAfterMinutes: { type: Number, default: 480 }
    },
    weeklyOffs: {
        type: [Number],  // 0 = Sunday, ..., 6 = Saturday
        default: [0]
    },
    attendanceRules: {
        considerEarlyEntryBefore: { type: String, default: '09:50' },
        considerLateEntryAfter: { type: String, default: '10:10' },
        considerEarlyExitBefore: { type: String, default: '17:50' },
        considerLateExitAfter: { type: String, default: '18:15' }
    }
}

module.exports = defaultsetting;
