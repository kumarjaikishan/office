// server/models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'employee', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'department', required: true },
  date: { type: Date, required: true },
  punchIn: { type: Date },
  punchOut: { type: Date },
  workingMinutes: { type: Number }, // calculated in hours
  shortMinutes: { type: Number },  // hours short of 8
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half Day'],
    required: true
  },
  leave: { type: mongoose.Schema.Types.ObjectId, ref: 'Leave' },
});

module.exports = mongoose.model('Attendance', attendanceSchema);
