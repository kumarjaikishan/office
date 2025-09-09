const mongoose = require("mongoose");
const Payroll = require("../models/payroll");
const Employee = require("../models/employee");
const LeaveBalance = require("../models/leavebalance");
const { recalculateLeaveBalances } = require("./leaveBalance");

exports.createPayroll = async (req, res, next) => {

  // console.log(req.body)
  //  return res.status(201).json({ messgae: "ok" });
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      employeeId,
      month,
      year,
      name,
      present = 0,
      leave = 0,
      absent = 0,
      options,
      basic,
      allowances = [],
      bonuses = [],
      deductions = [],
      taxRate = 0,
    } = req.body;

    // 🔹 Find employee
    const whichEmployee = await Employee.findById(employeeId)
      .populate("department", "department")
      .session(session);

    if (!whichEmployee) {
      throw new Error("Employee not found");
    }

    const {
      companyId,
      branchId,
      department,
      salary = 0,
      designation,
      availableLeaves = 0,
      advance = 0,
      profileimage, phone, email, address, guardian = { name: '', realtion: '' }
    } = whichEmployee;

    // ---- Salary Computation ----
    const allowanceTotal = allowances.reduce((sum, a) => sum + Number(a.amount || 0), 0);
    const bonusTotal = bonuses.reduce((sum, b) => sum + Number(b.amount || 0), 0);
    const deductionTotal = deductions.reduce((sum, d) => sum + Number(d.amount || 0), 0);

    const grossSalary = Number(salary) + allowanceTotal + bonusTotal - deductionTotal;
    const taxAmount = (grossSalary * Number(taxRate || 0)) / 100;
    const netSalary = grossSalary - taxAmount;

    if (isNaN(grossSalary) || isNaN(taxAmount) || isNaN(netSalary)) {
      throw new Error("Salary calculation resulted in NaN — check input data");
    }

    // 🔹 Create payroll
    const payroll = new Payroll({
      companyId, branchId, employeeId,
      month, year, name,
      profileimage, phone, email, address, guardian, profileimage,
      department: department?.department || "",
      designation, present, leave, absent,
      overtime: basic.overtime,
      shortTime: basic.shortmin,
      monthDays: basic.totalDays,
      holidays: basic.holidaysCount,
      weekOffs: basic.weeklyOff,
      workingDays: basic.workingDays,
      options, baseSalary: salary, allowances, bonuses,
      deductions, taxRate, status: "pending", grossSalary,
      taxAmount, netSalary,
    });

    await payroll.save({ session });

    // 🔹 Handle leave adjustment via LeaveBalance ledger
    if (options.adjustLeave && options.adjustedLeaveCount > 0) {
      // Find latest leave balance for this employee
      const latestLeave = await LeaveBalance.findOne({
        employeeId,
        companyId,
      })
        .sort({ date: -1, createdAt: -1 })
        .session(session);

      const availableLeaves = latestLeave?.balance || 0;

      if (options.adjustedLeaveCount > availableLeaves) {
        throw new Error("Adjusted Leave can't be more than available leaves");
      }

      const newBalance = availableLeaves - options.adjustedLeaveCount;
      // Insert a new "debit" entry into leave balance
      await LeaveBalance.create(
        [
          {
            employeeId,
            companyId,
            branchId,
            type: "debit",
            balance: newBalance,
            amount: options.adjustedLeaveCount,
            remarks: `Leave adjusted in Payroll ${month}-${year}`,
            payrollId: payroll._id,
            date: new Date().setHours(0, 0, 0, 0),
          },
        ],
        { session }
      );

      // Recalculate leave balances for consistency
      await recalculateLeaveBalances(employeeId, companyId);
    }

    if (options.adjustAdvance) {
      if (options.adjustedAdvance > advance) {
        return next({ status: 400, message: "Adjusted Advance can't be more than Advance Balance" });
      }
      whichEmployee.advance = advance - options.adjustedAdvance;
    }

    await whichEmployee.save({ session });

    // 🔹 Commit
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ success: true, message: 'Payroll Created', payroll });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return next({ status: 500, message: error.message });
  }
};

exports.editPayroll = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const updates = req.body;

    // 🔹 Find payroll
    const payroll = await Payroll.findById(id).session(session);
    if (!payroll) {
      throw new Error("Payroll not found");
    }

    // 🔹 Find existing leave adjustment linked to this payroll
    let adjustment = await LeaveBalance.findOne({
      payrollId: payroll._id,
    }).session(session);

    // 🔹 Update payroll fields
    Object.assign(payroll, updates);
    await payroll.save({ session });

    // 🔹 Handle leave adjustment
    if (updates.options?.adjustLeave && updates.options.adjustedLeaveCount > 0) {
      // Get latest leave balance (excluding this payroll’s record if it exists)
      const latestLeave = await LeaveBalance.findOne({
        employeeId: payroll.employeeId,
        companyId: payroll.companyId,
        _id: { $ne: adjustment?._id }, // ignore current adjustment record
      })
        .sort({ date: -1, createdAt: -1 })
        .session(session);

      const availableLeaves = latestLeave?.balance || 0;
      const adjusted = updates.options.adjustedLeaveCount;

      if (adjusted > availableLeaves) {
        throw new Error("Adjusted Leave can't be more than available leaves");
      }

      const newBalance = availableLeaves - adjusted;

      if (adjustment) {
        // 🔹 Update existing adjustment
        adjustment.amount = adjusted;
        adjustment.balance = newBalance;
        adjustment.remarks = `Leave adjusted in Payroll ${payroll.month}-${payroll.year}`;
        adjustment.date = new Date().setHours(0, 0, 0, 0);
        await adjustment.save({ session });
      } else {
        // 🔹 Create new adjustment
        adjustment = new LeaveBalance({
          employeeId: payroll.employeeId,
          companyId: payroll.companyId,
          branchId: payroll.branchId,
          type: "debit",
          amount: adjusted,
          balance: newBalance,
          remarks: `Leave adjusted in Payroll ${payroll.month}-${payroll.year}`,
          payrollId: payroll._id,
          date: new Date().setHours(0, 0, 0, 0),
        });
        await adjustment.save({ session });
      }

      // 🔄 Recalculate ledger after change
      await recalculateLeaveBalances(payroll.employeeId, payroll.companyId);
    } else if (adjustment) {
      // 🔹 If adjustment is removed in update, delete it
      await adjustment.deleteOne({ session });
      await recalculateLeaveBalances(payroll.employeeId, payroll.companyId);
    }

    // 🔹 Commit
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ success: true, payroll });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next({ status: 500, message: error.message });
  }
};



exports.allPayroll = async (req, res, next) => {
  try {
    // 🔹 Find employee
    let payrolls;

    if (req.user.role == 'manager') {
      payrolls = await Payroll.find({ companyId: req.user.companyId, branchId: { $in: req.user.branchIds } })
        .select('branchId companyId department employeeId month year name status')
    } else {
      payrolls = await Payroll.find({ companyId: req.user.companyId })
        .select('branchId companyId department employeeId month year name status')
    }

    return res.status(201).json({ payrolls });
  } catch (error) {
    console.error(error);
    return next({ status: 500, message: error.message });
  }
};

exports.getPayroll = async (req, res, next) => {
  const { id } = req.params;
  try {
    const payroll = await Payroll.findById(id);

    if (!payroll) {
      return next({ status: 404, message: "Payroll not found" });
    }

    // Manager role restriction
    if (req.user.role === "manager") {
      if (!req.user.branchIds.includes(payroll?.branchId?.toString())) {
        return next({ status: 403, message: "You are not authorized" });
      }
    }

    return res.status(200).json({ payroll });
  } catch (error) {
    console.error(error);
    return next({ status: 500, message: "Internal Server Error" });
  }
};

exports.deletePayroll = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const payroll = await Payroll.findById(id).session(session);
    if (!payroll) {
      return next({ status: 404, message: "Payroll not found" });
    }

    // 🔹 Delete linked leave adjustment if exists
    await LeaveBalance.deleteOne({ payrollId: payroll._id }).session(session);

    // 🔹 Delete payroll
    await payroll.deleteOne({ session });

    // 🔹 Recalculate leave balances
    await recalculateLeaveBalances(payroll.employeeId, payroll.companyId);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ success: true, message: "Payroll deleted" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next({ status: 500, message: error.message });
  }
};


