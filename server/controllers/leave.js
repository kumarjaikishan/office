
const employee = require('../models/employee');
const Leave = require('../models/leave');
const notificationmodal = require('../models/notification')
const attendanceModal = require('../models/attandence');
const companySchema = require('../models/company')
const holidayschema = require('../models/holiday')


const addleave = async (req, res, next) => {
  let { type, fromDate, toDate, reason } = req.body;

  if (!fromDate || !reason) {
    return res.status(400).json({ message: 'Fields are required' });
  }

  // If toDate is not provided, treat it as a single-day leave
  if (!toDate) {
    toDate = fromDate;
  }

  try {
    const whichemployee = await employee.findOne({ userid: req.user.id });

    // Calculate duration in days (inclusive)
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const timeDiff = to.getTime() - from.getTime();
    const duration = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

    const leave = new Leave({
      companyId: whichemployee.companyId,
      branchId: whichemployee.branchId,
      employeeId: whichemployee._id,
      type,
      fromDate,
      toDate,
      duration,
      reason,
    });

    await leave.save();
    return res.json({ message: 'Record Added Successfully' });

  } catch (error) {
    console.error("Leave error:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getleave = async (req, res, next) => {
  try {
    const whichemployee = await employee.findOne({ userid: req.user.id })
    const leaves = await Leave.find({ employeeId: whichemployee._id }).sort({ createdAt: -1 })

    return res.status(200).json(leaves);
  } catch (error) {
    console.error("Attendance error:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const fetchleave = async (req, res, next) => {
  try {
    let leave;
    if (req.user.role == 'manager') {
      leave = await Leave.find({ companyId: req.user.companyId, branchId: { $in: req.user.branchIds } }).populate({
        path: 'employeeId',
        select: 'userid profileimage',
        populate: {
          path: 'userid',
          select: 'name email'
        }
      });
    } else {
      leave = await Leave.find({ companyId: req.user.companyId }).populate({
        path: 'employeeId',
        select: 'userid profileimage',
        populate: {
          path: 'userid',
          select: 'name email'
        }
      });
    }
    return res.json({ leave });

  } catch (error) {
    console.error("Attendance error:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const employeefetch = async (req, res, next) => {
  try {
    const notification = await notificationmodal.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const attendance = await attendanceModal.find({ employeeId: req.user.employeeId }).sort({ date: -1 });
    const leave = await Leave.find({ employeeId: req.user.employeeId });
    const employeeee = await employee.findById(req.user.employeeId)
      .populate('branchId')
      .populate('department')
      .populate('userid');

    const holiday = await holidayschema.find({ companyId: employeeee.branchId.companyId });
    const companySetting = await companySchema.findById(employeeee.branchId.companyId);

    return res.status(200).json({ profile: employeeee, holiday, notification, leave, attendance, companySetting });

  } catch (error) {
    console.error("Attendance error:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const updatenotification = async (req, res, next) => {

  try {
    await notificationmodal.updateMany(
      { userId: req.user.id }, // condition
      { $set: { read: true } } // update
    );


    return res.status(200).json({ message: "Marked Read" });

  } catch (error) {
    console.error("Attendance error:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};




module.exports = { employeefetch, addleave, fetchleave, updatenotification, getleave };
