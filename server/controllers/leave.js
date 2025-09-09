const LeaveBalance = require("../models/leavebalance");

// 🔄 Recalculate balances for all entries of one employee
exports.recalculateLeaveBalances = async (employeeId, companyId) => {
  const entries = await LeaveBalance.find({ employeeId, companyId })
    .sort({ date: 1, _id: 1 });

  let runningBalance = 0;

  for (let entry of entries) {
    if (entry.type === "credit") {
      runningBalance += entry.amount;   // use transaction amount
    } else if (entry.type === "debit") {
      runningBalance -= entry.amount;
    }
    entry.balance = runningBalance; // save running total
    await entry.save();
  }
};

// ➕ Add new leave balance
exports.addleavebalance = async (req, res) => {
  try {
    const { employeeId, companyId, branchId, type, amount, remarks } = req.body;

    // Normalize date (set to 00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newLeave = await LeaveBalance.create({
      employeeId,
      companyId,
      branchId,
      type,
      amount,   // transaction value
      balance: 0, // temporary, will be recalculated
      remarks,
      date: today,
    });

    // Recalculate after adding
    await recalculateLeaveBalances(employeeId, companyId);

    res.status(201).json({
      success: true,
      message: "Leave Balance Added",
      data: newLeave,
    });
  } catch (err) {
    console.error("Error adding leave balance:", err.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

// 📑 Get all leave balances
exports.getallleavebalnce = async (req, res) => {
  try {
    let leaveBalances;

    if (req.user.role === "manager") {
      leaveBalances = await LeaveBalance.find({
        companyId: req.user.companyId,
        branchId: { $in: req.user.branchIds },
      })
        .populate({
          path: "employeeId",
          select: "userid",
          populate: {
            path: "userid",
            select: "name",
          },
        })
        .sort({ date: -1, createdAt: -1 });
    } else {
      leaveBalances = await LeaveBalance.find({
        companyId: req.user.companyId,
      })
        .populate({
          path: "employeeId",
          select: "userid",
          populate: {
            path: "userid",
            select: "name",
          },
        })
        .sort({ date: -1, createdAt: -1 });
    }

    res.status(200).json({
      count: leaveBalances.length,
      data: leaveBalances,
    });
  } catch (err) {
    console.error("Error fetching leave balances:", err.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

// ✏️ Edit leave balance
exports.editleavebalance = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await LeaveBalance.findById(id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave balance not found",
      });
    }

    // Update fields (only safe ones)
    leave.type = req.body.type || leave.type;
    leave.amount = req.body.amount || leave.amount;
    leave.remarks = req.body.remarks || leave.remarks;
    leave.date = req.body.date ? new Date(req.body.date) : leave.date;

    await leave.save();

    // Recalculate after edit
    await recalculateLeaveBalances(leave.employeeId, leave.companyId);

    res.status(200).json({
      success: true,
      message: "Leave balance updated",
      data: leave,
    });
  } catch (err) {
    console.error("Error editing leave balance:", err.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

// ❌ Delete leave balance
exports.deleteleavebalance = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await LeaveBalance.findById(id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave balance not found",
      });
    }

    await leave.deleteOne();

    // Recalculate after delete
    await recalculateLeaveBalances(leave.employeeId, leave.companyId);

    res.status(200).json({
      success: true,
      message: "Leave balance deleted",
    });
  } catch (err) {
    console.error("Error deleting leave balance:", err.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};
