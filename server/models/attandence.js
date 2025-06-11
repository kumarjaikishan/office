// server/models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date },
  totalHours: { type: Number }, // calculated in hours
  shortHours: { type: Number }  // hours short of 8
});

module.exports = mongoose.model('Attendance', attendanceSchema);
