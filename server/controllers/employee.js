
const employee = require('../models/employee');
const Leave = require('../models/leave');
const notificationmodal = require('../models/notification')


const addleave = async (req, res, next) => {
  // console.log(req.body)
  let { type, fromDate, toDate, reason } = req.body
  if (!toDate) {
    toDate = fromDate;
  }
  if (!fromDate || !reason) return res.status(400).json({ message: 'fields are required' });
  try {
    const whichemployee = await employee.findOne({ userid: req.user.id })

    const leave = new Leave({ employeeId: whichemployee._id, type, fromDate, toDate, reason });
    await leave.save();
    return res.json({ message: 'Record Added Successfully' });

  } catch (error) {
    console.error("Attendance error:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getleave = async (req, res, next) => {
  try {
    const whichemployee = await employee.findOne({ userid: req.user.id })
    const leaves = await Leave.find({ employeeId: whichemployee._id }).sort({createdAt:-1})

    return res.status(200).json(leaves);
  } catch (error) {
    console.error("Attendance error:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const fetchleave = async (req, res, next) => {

  try {
    // const leave = await Leave.find().populate({
    //   path:'employeeId'
    // });
    const leave = await Leave.find().populate({
      path: 'employeeId',
      select: 'userid profileimage',
      populate: {
        path: 'userid',
        select: 'name email'
      }
    });
    console.log(leave)
    return res.json({ leave });

  } catch (error) {
    console.error("Attendance error:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const employeefetch = async (req, res, next) => {

  try {
    const notification = await notificationmodal.find({ userId: req.user.id }).sort({ createdAt: -1 })
    return res.status(200).json({ notification });

  } catch (error) {
    console.error("Attendance error:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};




module.exports = { employeefetch, addleave, fetchleave, getleave };
