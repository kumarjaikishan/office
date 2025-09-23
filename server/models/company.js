const mongoose = require('mongoose');

// ─── Policy Item ─────────────────────────────
const policyItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ["amount", "percentage"], default: "amount" },
    value: { type: Number, required: true } // value can be fixed amount or %
}, { _id: false });

// ─── Device Schema ───────────────────────────
const DeviceSchema = new mongoose.Schema({
    SN: { type: String, required: true },        // Serial Number of ESSL device
    name: { type: String, default: 'Unnamed' },  // Optional device name / location
    lastHeartbeat: { type: Date, default: null } // Timestamp of last heartbeat
}, { _id: false }); // no _id needed for subdocuments

// ⚠️ Remove DeviceSchema.index({ SN: 1 }) to avoid duplicate index

// ─── Company Schema ──────────────────────────
const companySchema = new mongoose.Schema({
    name: { type: String },
    address: String,
    contact: String,
    fullname: String,
    industry: String,
    logo: String,

    // Legacy single device field (optional)
    deviceSN: String,

    // Array of devices
    devices: [DeviceSchema],

    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },

    officeTime: {
        in: { type: String, default: '10:00' },
        out: { type: String, default: '18:00' },
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

    // Payroll Policies
    payrollPolicies: {
        allowances: { type: [policyItemSchema], default: [] },
        bonuses: { type: [policyItemSchema], default: [] },
        deductions: { type: [policyItemSchema], default: [] }
    }

}, { timestamps: true });

// ✅ Index for querying devices by SN at company level
companySchema.index({ "devices.SN": 1 });

// ─── Export Model ───────────────────────────
module.exports = mongoose.model("Company", companySchema);
