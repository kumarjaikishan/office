// server/routes/attendance.js
const Attendance = require('../models/attandence');
const employee = require('../models/employee');
const Leave = require('../models/leave');
const User = require('../models/user');
const { sendToClients } = require('../utils/sse');


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


const deleteattandence = async (req, res, next) => {
  try {
    const { attandanceId } = req.body;

    if (!Array.isArray(attandanceId) || attandanceId.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty attandanceId array' });
    }

    const result = await Attendance.deleteMany({ _id: { $in: attandanceId } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No records found to delete' });
    }

    return res.status(200).json({ message: `${result.deletedCount} Record(s) deleted successfully` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

const checkin = async (req, res, next) => {
  try {
    const { employeeId, date, punchIn, status } = req.body;
    // console.log(req.body)

    // Normalize date (strip time part)
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    // Check for existing check-in
    const existing = await Attendance.findOne({ employeeId, date: dateObj })
    if (existing) {
      return res.status(400).json({ message: 'Already checked in' });
    }

    const attendanceData = { employeeId, date: dateObj, status };

    if (punchIn) {
      const punchInTime = new Date(punchIn);
      if (isNaN(punchInTime)) {
        return res.status(400).json({ message: 'Invalid punchIn time' });
      }
      attendanceData.punchIn = punchIn;
    }

    const attendance = new Attendance(attendanceData);

    await attendance.save();

    const updatedRecord = await Attendance.findById(attendance._id)
      .populate({
        path: 'employeeId',
        select: ' userid profileimage',
        populate: {
          path: 'userid',
          select: 'name'
        }
      });

    // Send live update to all clients
    sendToClients({
      type: 'attendance_update',
      payload: {
        action: 'checkin',
        data: updatedRecord
      }
    });

    return res.status(200).json({ message: 'Punch-in recorded', attendance });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

const facecheckin = async (req, res, next) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    // Get today's date (stripped of time)
    const now = new Date();
    now.setSeconds(0, 0); // Zero out seconds and milliseconds

    const dateObj = new Date(now);
    dateObj.setHours(0, 0, 0, 0);

    // Check if already checked in
    const existing = await Attendance.findOne({ employeeId, date: dateObj });
    if (existing) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    // Build attendance object
    const attendanceData = {
      employeeId,
      date: dateObj,
      punchIn: now,
      status: 'present'
    };

    const attendance = new Attendance(attendanceData);
    await attendance.save();

    const updatedRecord = await Attendance.findById(attendance._id)
      .populate({
        path: 'employeeId',
        select: 'userid profileimage',
        populate: {
          path: 'userid',
          select: 'name'
        }
      });

    // Notify connected clients (if using sockets or similar)
    sendToClients({
      type: 'attendance_update',
      payload: {
        action: 'checkin',
        data: updatedRecord
      }
    });

    return res.status(200).json({ message: 'Punch-in recorded', attendance });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
};



const checkout = async (req, res, next) => {
  try {
    const { employeeId, date, punchOut } = req.body;

    // Normalize date to 00:00:00 for matching
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    // Find the record
    const record = await Attendance.findOne({ employeeId, date: dateObj });

    if (!record) {
      return res.status(404).json({ message: 'Check-in not found' });
    }

    if (record.punchOut) {
      return res.status(400).json({ message: 'Already checked out' });
    }

    // Parse punchOut from frontend
    const punchOutTime = new Date(punchOut);
    if (isNaN(punchOutTime)) {
      return res.status(400).json({ message: 'Invalid punchOut time' });
    }

    // Set punchOut
    record.punchOut = punchOutTime;

    // Calculate working minutes
    const diffMinutes = (record.punchOut - record.punchIn) / (1000 * 60);
    record.workingMinutes = parseFloat(diffMinutes.toFixed(2));

    // Calculate short minutes (assuming 8 hours = 480 minutes)
    const short = 480 - record.workingMinutes;
    record.shortMinutes = short > 0 ? parseFloat(short.toFixed(2)) : 0;

    await record.save();

    const updatedRecord = await Attendance.findById(record._id)
      .populate({
        path: 'employeeId',
        select: ' userid profileimage',
        populate: {
          path: 'userid',
          select: 'name'
        }
      });

    // Send live update to all clients
    sendToClients({
      type: 'attendance_update',
      payload: {
        action: 'checkOut',
        data: updatedRecord
      }
    });

    return res.status(200).json({ message: 'Punch-out recorded', record });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

const facecheckout = async (req, res, next) => {
  try {
    const { employeeId } = req.body;

    // Set current time (zero seconds and ms)
    const now = new Date();
    now.setSeconds(0, 0);

    // Normalize date to midnight
    const dateObj = new Date(now);
    dateObj.setHours(0, 0, 0, 0);

    // Find today's attendance record
    const record = await Attendance.findOne({ employeeId, date: dateObj });

    if (!record) {
      return res.status(404).json({ message: 'Check-in not found' });
    }

    if (record.punchOut) {
      return res.status(400).json({ message: 'Already checked out' });
    }

    // Assign punchOut time
    record.punchOut = now;

    // Calculate working minutes
    const diffMinutes = (record.punchOut - record.punchIn) / (1000 * 60);
    record.workingMinutes = parseFloat(diffMinutes.toFixed(2));

    // Calculate short minutes (8 hours = 480 minutes)
    const short = 480 - record.workingMinutes;
    record.shortMinutes = short > 0 ? parseFloat(short.toFixed(2)) : 0;

    await record.save();

    // Populate the saved record
    const populatedRecord = await Attendance.findById(record._id)
      .populate({
        path: 'employeeId',
        select: 'userid profileimage',
        populate: {
          path: 'userid',
          select: 'name'
        }
      });

    // Send live update
    sendToClients({
      type: 'attendance_update',
      payload: {
        action: 'checkOut',
        data: populatedRecord
      }
    });

    return res.status(200).json({ message: 'Punch-out recorded', record: populatedRecord });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
};



// Get all attendance
const allAttandence = async (req, res, next) => {
  const data = await Attendance.find().populate('employeeId', 'name email');
  res.json(data);
};

const editattandence = async (req, res, next) => {
  try {
    const { id, punchIn, punchOut, status } = req.body;

    const data = await Attendance.findById(id);
    if (!data) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    if (punchIn !== "" && punchOut !== "") {
      const inTime = new Date(punchIn);
      const outTime = new Date(punchOut);

      const diffMinutes = (outTime - inTime) / (1000 * 60); // Convert ms to minutes
      data.workingMinutes = parseFloat(diffMinutes.toFixed(2));

      const short = 480 - data.workingMinutes;
      data.shortMinutes = short > 0 ? parseFloat(short.toFixed(2)) : 0;
    }

    if (punchIn !== "") {
      const punchInTime = new Date(punchIn);
      punchInTime.setMilliseconds(0);
      if (isNaN(punchInTime)) {
        return res.status(400).json({ message: 'Invalid punchIn time' });
      }
      data.punchIn = punchInTime;
    }
    if (punchOut !== "") {
      const punchOutTime = new Date(punchOut);
      punchOutTime.setMilliseconds(0);
      if (isNaN(punchOutTime)) {
        return res.status(400).json({ message: 'Invalid punchOut time' });
      }
      data.punchOut = punchOutTime;
    }
    if (status !== 'present') {
      data.punchIn = ''
      data.punchOut = ''
    }
    data.status = status;

    await data.save();

    res.status(200).json({
      message: 'Edit successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
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

const employeeAttandence = async (req, res, next) => {
  const userid = req.query.userid;
  // console.log(employeeId)
  if (!userid) return res.status(400).json({ message: 'Employee Id is needed' });
  try {
    const user = await User.findOne({ _id: userid });
    const employeedetail = await employee.findOne({ userid });
    const attandence = await Attendance.find({ employeeId: employeedetail._id }).sort({ date: -1 });

    return res.status(200).json({ user, employee: employeedetail, attandence });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }

}


module.exports = { checkout, deleteattandence, facecheckin, facecheckout, editattandence, employeeAttandence, checkin, webattandence, allAttandence, leaveapply, leaveupdate, allleave };
