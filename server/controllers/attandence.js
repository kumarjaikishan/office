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
      attendanceById: req.user.id,
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

    if (!employeeId || !date || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Normalize date to UTC midnight
    const parsedDate = new Date(date);
    const dateObj = new Date(Date.UTC(
      parsedDate.getUTCFullYear(),
      parsedDate.getUTCMonth(),
      parsedDate.getUTCDate()
    ));

    // Check if already checked in
    const existing = await Attendance.findOne({ employeeId, date: dateObj });
    if (existing) {
      return res.status(400).json({ message: 'Already checked in' });
    }

    const attendanceData = {
      companyId: req.user.companyId,
      attendanceById: req.user.id,
      employeeId,
      date: dateObj,
      status
    };

    // Handle optional punchIn time
    if (punchIn) {
      const punchInTime = new Date(punchIn);
      if (isNaN(punchInTime)) {
        return res.status(400).json({ message: 'Invalid punchIn time' });
      }
      attendanceData.punchIn = punchInTime;
    }

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

    // Notify clients
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

    // Get current time
    const now = new Date();

    // Normalize punchIn to HH:mm (zero seconds and milliseconds)
    const punchIn = new Date(now.setSeconds(0, 0));

    // Normalize date to UTC 00:00
    const dateObj = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    ));

    // Check if already checked in
    const existing = await Attendance.findOne({ employeeId, date: dateObj });
    if (existing) {
      return res.status(206).json({ message: 'Already checked in today', attendance: existing });
    }

    // Create attendance
    const attendanceData = {
      companyId: req.user.companyId,
      employeeId,
      date: dateObj,
      punchIn: punchIn,
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

    // Notify clients
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

function normalizeDateToUTC(date) {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}


const bulkMarkAttendance = async (req, res, next) => {
  try {
    const { attendanceRecords } = req.body;

    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return res.status(400).json({ message: 'No attendance data provided.' });
    }
    let companyId = req.user.companyId
    const bulkOps = attendanceRecords.map(record => {
      const {
        empId: employeeId,
        date,
        punchIn,
        punchOut,
        status,
        source = 'manual'
      } = record;

      // ✅ Normalize date to midnight UTC (YYYY-MM-DDT00:00:00.000Z)
      const parsedDate = new Date(date);
      const dateObj = normalizeDateToUTC(parsedDate);

      const punchInDate = punchIn ? new Date(punchIn) : null;
      const punchOutDate = punchOut ? new Date(punchOut) : null;

      let workingMinutes = 0;
      let shortMinutes = 0;

      if (punchInDate && punchOutDate && punchOutDate > punchInDate) {
        workingMinutes = Math.floor((punchOutDate - punchInDate) / (1000 * 60)); // in minutes
        shortMinutes = Math.max(0, 480 - workingMinutes); // 8 hours = 480 minutes
      }

      return {
        updateOne: {
          filter: { employeeId, date: dateObj },
          update: {
            $set: {
              companyId,
              punchIn: punchInDate,
              punchOut: punchOutDate,
              workingMinutes,
              shortMinutes,
              status,
              source,
            },
          },
          upsert: true
        }
      };
    });

    await Attendance.bulkWrite(bulkOps);

    res.status(200).json({ message: 'Bulk attendance marked successfully.' });
  } catch (error) {
    console.error('Bulk Attendance Error:', error);
    res.status(500).json({ message: 'Server error while marking attendance.' });
  }
};

module.exports = { bulkMarkAttendance };




const checkout = async (req, res, next) => {
  try {
    const { employeeId, date, punchOut } = req.body;

    if (!employeeId || !date || !punchOut) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Normalize date to UTC midnight
    const parsedDate = new Date(date);
    const dateObj = new Date(Date.UTC(
      parsedDate.getUTCFullYear(),
      parsedDate.getUTCMonth(),
      parsedDate.getUTCDate()
    ));

    // Find the attendance record
    const record = await Attendance.findOne({ employeeId, date: dateObj });

    if (!record) {
      return res.status(404).json({ message: 'Check-in not found' });
    }

    if (record.punchOut) {
      return res.status(400).json({ message: 'Already checked out' });
    }

    // Parse punchOut time
    const punchOutTime = new Date(punchOut);
    if (isNaN(punchOutTime)) {
      return res.status(400).json({ message: 'Invalid punchOut time' });
    }

    // Set punchOut
    record.punchOut = punchOutTime;

    // Calculate working minutes
    const diffMinutes = (record.punchOut - record.punchIn) / (1000 * 60);
    record.workingMinutes = parseFloat(diffMinutes.toFixed(2));

    // Calculate short minutes
    const short = 480 - record.workingMinutes;
    record.shortMinutes = short > 0 ? parseFloat(short.toFixed(2)) : 0;

    await record.save();

    const updatedRecord = await Attendance.findById(record._id)
      .populate({
        path: 'employeeId',
        select: 'userid profileimage',
        populate: {
          path: 'userid',
          select: 'name'
        }
      });

    // Notify connected clients
    sendToClients({
      type: 'attendance_update',
      payload: {
        action: 'checkOut',
        data: updatedRecord
      }
    });

    return res.status(200).json({ message: 'Punch-out recorded', record: updatedRecord });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
};


const facecheckout = async (req, res, next) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    // Get current time
    const now = new Date();
    now.setSeconds(0, 0); // Zero out seconds and milliseconds

    // Normalize date to UTC midnight
    const dateObj = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // Find today's attendance record using normalized UTC date
    const record = await Attendance.findOne({ employeeId, date: dateObj });

    if (!record) {
      return res.status(404).json({ message: 'Check-in not found' });
    }

    if (record.punchOut) {
      return res.status(206).json({ message: 'Already checked Out today', attendance: record });
    }

    // Assign punchOut time
    record.punchOut = now;

    // Calculate working minutes
    const diffMinutes = (record.punchOut - record.punchIn) / (1000 * 60);
    record.workingMinutes = parseFloat(diffMinutes.toFixed(2));

    // Calculate short minutes (assuming 8-hour day = 480 mins)
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

    // Notify clients
    sendToClients({
      type: 'attendance_update',
      payload: {
        action: 'checkOut',
        data: populatedRecord
      }
    });

    return res.status(200).json({ message: 'Punch-out recorded', attendance: populatedRecord });
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
  // console.log('editattandence', req.body);
  try {
    const { id, punchIn, punchOut, status } = req.body;

    const data = await Attendance.findById(id);
    if (!data) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    const baseDate = new Date(data.date);

    const mergeDateAndTimeFromDateObj = (date, timeSource) => {
      const merged = new Date(date);
      merged.setHours(new Date(timeSource).getHours());
      merged.setMinutes(new Date(timeSource).getMinutes());
      merged.setSeconds(0);
      merged.setMilliseconds(0);
      return merged;
    };

    // Process punchIn
    if (punchIn) {
      if (isNaN(Date.parse(punchIn))) {
        return res.status(400).json({ message: 'Invalid punchIn time' });
      }
      data.punchIn = mergeDateAndTimeFromDateObj(baseDate, punchIn);
    } else {
      data.punchIn = null;
    }

    // Process punchOut
    if (punchOut) {
      if (isNaN(Date.parse(punchOut))) {
        return res.status(400).json({ message: 'Invalid punchOut time' });
      }
      data.punchOut = mergeDateAndTimeFromDateObj(baseDate, punchOut);
    } else {
      data.punchOut = null;
      data.workingMinutes = null;
      data.shortMinutes = null;
    }

    // Calculate workingMinutes
    if (data.punchIn && data.punchOut) {
      const diffMinutes = (data.punchOut - data.punchIn) / (1000 * 60);
      data.workingMinutes = parseFloat(diffMinutes.toFixed(2));

      const short = 480 - data.workingMinutes;
      data.shortMinutes = short > 0 ? parseFloat(short.toFixed(2)) : 0;
    }

    // If status is not "present", reset times
    if (status !== 'present') {
      data.punchIn = null;
      data.punchOut = null;
      data.workingMinutes = null;
      data.shortMinutes = null;
    }

    data.status = status;
    // console.log('final submit ', data)
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


module.exports = { checkout, deleteattandence, bulkMarkAttendance, facecheckin, facecheckout, editattandence, employeeAttandence, checkin, webattandence, allAttandence, leaveapply, leaveupdate, allleave };
