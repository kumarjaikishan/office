const mongoose = require('mongoose');

const policyItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ["amount", "percentage"], default: "amount" },
    value: { type: Number, required: true } // value can be fixed amount or %
}, { _id: false });

const DeviceSchema = new mongoose.Schema({
    SN: { type: String, required: true },        // Serial Number of ESSL device
    name: { type: String, default: 'Unnamed' },  // Optional device name / location
    lastHeartbeat: { type: Date, default: null } // Timestamp of last heartbeat
});

// ✅ Add index for faster queries on device SN
DeviceSchema.index({ SN: 1 });

const companySchema = new mongoose.Schema({
    name: { type: String },
    address: String,
    contact: String,
    fullname: String,
    industry: String,
    logo: String,

    // 🔹 Legacy single device field (can be removed later if not used)
    deviceSN: String,

    // 🔹 Array of devices
    devices: [DeviceSchema],

    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },

    officeTime: {
        in: { type: String, default: '10:00' },  // e.g., "09:30"
        out: { type: String, default: '18:00' }, // e.g., "18:30"
        breakMinutes: { type: Number, default: 30 }
    },
    gracePeriod: {
        lateEntryMinutes: { type: Number, default: 10 },
        earlyExitMinutes: { type: Number, default: 10 }
    },
    workingMinutes: {
        fullDay: { type: Number, default: 480 },
        halfDay: { type: Number, default: 240 },
        shortDayThreshold: { type: Number, default: 360 },
        overtimeAfterMinutes: { type: Number, default: 540 }
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
    },

    // ✅ Default Payroll Policies
    payrollPolicies: {
        allowances: { type: [policyItemSchema], default: [] },
        bonuses: { type: [policyItemSchema], default: [] },
        deductions: { type: [policyItemSchema], default: [] }
    }

}, { timestamps: true });

// ✅ Index at company level too (in case you query across companies by device SN)
companySchema.index({ "devices.SN": 1 });

module.exports = mongoose.model("Company", companySchema);
