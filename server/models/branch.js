const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  managerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  defaultsetting: { type: Boolean, default: true },

  // ✅ Make setting optional
  setting: {
    type: new mongoose.Schema({
      officeTime: {
        in: String,
        out: String,
        breakMinutes: Number
      },
      gracePeriod: {
        lateEntryMinutes: Number,
        earlyExitMinutes: Number
      },
      workingMinutes: {
        fullDay: Number,
        halfDay: Number,
        shortDayThreshold: Number,
        overtimeAfterMinutes: Number
      },
      weeklyOffs: [Number],
      attendanceRules: {
        considerEarlyEntryBefore: String,
        considerLateEntryAfter: String,
        considerEarlyExitBefore: String,
        considerLateExitAfter: String
      }
    }, { _id: false }), // prevent creating _id for subdocs
    required: false     // ✅ entire setting object is optional
  }

}, { timestamps: true });

module.exports = mongoose.model("Branch", branchSchema);
