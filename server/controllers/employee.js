
const employee = require('../models/employee');
const Leave = require('../models/leave');


const addleave = async (req, res, next) => {
  console.log(req.body)
  const {type,fromDate,toDate,reason}= req.body
  console.log(req.user.id)
  try {
     const leave = new Leave({ employeeId:req.user.id, fromDate,toDate, reason });
      await leave.save();
      return res.json({ message: 'Record Added Successfully' });

  } catch (error) {
    console.error("Attendance error:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};




module.exports = { addleave};
