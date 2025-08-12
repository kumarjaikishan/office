// server/models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company',required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'employee', required: true },
  attendanceById: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  date: { type: Date, required: true },
  punchIn: { type: Date },
  punchOut: { type: Date },
  workingMinutes: { type: Number }, // calculated in hours
  shortMinutes: { type: Number },  // hours short of 8
  status: {
    type: String,
    enum: ['present', 'absent', 'leave', 'half day'],
    required: true
  },
  leave: { type: mongoose.Schema.Types.ObjectId, ref: 'Leave' },
  source: { type: String, enum: ['leaveApproval', 'manual', 'device'], default: 'manual' }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
