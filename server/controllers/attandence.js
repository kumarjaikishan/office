// server/routes/attendance.js
const Attendance = require('../models/attandence');
const Leave = require('../models/leave');
const User = require('../models/user');

// Check-in
const checkin = async (req, res, next) => {
    const { employeeId } = req.body;
    const date = new Date().toDateString(); // Only the date part

    // Prevent double check-in
    const existing = await Attendance.findOne({ employeeId, date });
    if (existing) return res.status(400).json({ message: 'Already checked in' });

    const checkIn = new Date();

    const attendance = new Attendance({ employeeId, date, checkIn });
    await attendance.save();

    res.json(attendance);
};


const checkout = async (req, res, next) => {
    const { employeeId } = req.body;
    const date = new Date().toDateString();

    const record = await Attendance.findOne({ employeeId, date });
    if (!record) return res.status(404).json({ message: 'Check-in not found' });

    record.checkOut = new Date();

    const diff = (record.checkOut - record.checkIn) / (1000 * 60 * 60); // in hours
    record.totalHours = parseFloat(diff.toFixed(2));

    const shortHours = 8 - record.totalHours;
    record.shortHours = shortHours > 0 ? parseFloat(shortHours.toFixed(2)) : 0;

    await record.save();
    res.json(record);
};

// Get all attendance
const allAttandence = async (req, res, next) => {
    const data = await Attendance.find().populate('employeeId', 'name email');
    res.json(data);
};


// Apply for leave
    const leaveapply = async (req, res, next) => {
  const { employeeId, date, reason } = req.body;
  const leave = new Leave({ employeeId, date, reason });
  await leave.save();
  res.json(leave);
};

// Approve or reject leave (admin only)
    const leaveupdate = async (req, res, next) => {
  const { leaveId, status } = req.body;
  const leave = await Leave.findByIdAndUpdate(leaveId, { status }, { new: true });
  res.json(leave);
};

// Get all leaves
    const allleave = async (req, res, next) => {
  const data = await Leave.find().populate('employeeId', 'name email');
  res.json(data);
};


module.exports = { checkout, checkin, allAttandence,leaveapply,leaveupdate,allleave };
