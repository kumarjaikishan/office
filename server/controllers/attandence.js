// server/routes/attendance.js
const Attendance = require('../models/attandence');
const Leave = require('../models/leave');
const User = require('../models/user');


const webattandence = async (req, res, next) => {
  // console.log(req.body)
  try {
    let { employeeId, departmentId, date, punchIn, punchOut, status } = req.body;

    // Validate required fields
    if (!employeeId || !departmentId || !date) {
      return res.status(400).json({ message: 'Missing required fields: employeeId, departmentId, or date' });
    }

    // Convert input to Date objects
    const dateObj = new Date(date);
    if (isNaN(dateObj)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const dateOnly = dateObj.toDateString(); // Used to match one date per day

    let attendance = await Attendance.findOne({ employeeId, date: dateOnly });

    // === PUNCH-OUT FLOW ===
    if (attendance) {
      if (attendance.punchOut) {
        return res.status(400).json({ message: 'Already punched out for this date' });
      }

      if (!punchOut) {
        return res.status(400).json({ message: 'Missing punchOut time for punch-out' });
      }

      const punchOutTime = new Date(punchOut);
      const punchInTime = new Date(attendance.punchIn);

      if (isNaN(punchOutTime) || isNaN(punchInTime)) {
        return res.status(400).json({ message: 'Invalid punchIn or punchOut time' });
      }

      const diffMs = punchOutTime - punchInTime;
      const workingMinutes = Math.floor(diffMs / 60000);
      const fullDayMinutes = 8 * 60;

      attendance.punchOut = punchOutTime;
      attendance.workingMinutes = workingMinutes;
      attendance.status = status ?? attendance.status;
      attendance.shortMinutes = Math.max(fullDayMinutes - workingMinutes, 0); // Ensure non-negative
      await attendance.save();

      return res.json({ message: 'Punch-out recorded', attendance });
    }

    // === PUNCH-IN FLOW ===
    const punchInTime = punchIn ? new Date(punchIn) : new Date();
    if (isNaN(punchInTime)) {
      return res.status(400).json({ message: 'Invalid punchIn time' });
    }

    attendance = new Attendance({
      employeeId,
      departmentId,
      date: dateOnly,
      punchIn: punchInTime,
      status: status ?? true,
    });

    await attendance.save();

    return res.json({ message: 'Punch-in recorded', attendance });

  } catch (error) {
    console.error("Attendance error:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


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


module.exports = { checkout, checkin,webattandence, allAttandence,leaveapply,leaveupdate,allleave };
