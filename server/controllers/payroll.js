const mongoose = require("mongoose");
const Payroll = require("../models/payroll");
const Employee = require("../models/employee");
const Advance = require("../models/advance");
const LeaveBalance = require("../models/leavebalance");
const { recalculateLeaveBalances } = require("./leaveBalance");
const { recalculateAdvanceBalances } = require("./advance");

exports.createPayroll = async (req, res, next) => {
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
      profileimage,
      phone,
      email,
      address,
      guardian = { name: "", relation: "" },
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
      companyId, branchId, employeeId, month, year, name, profileimage, phone, email, address, guardian,
      department: department?.department || "", designation, present, leave, absent,
      overtime: basic?.overtime, shortTime: basic?.shortmin, monthDays: basic?.totalDays,
      holidays: basic?.holidaysCount, weekOffs: basic?.weeklyOff, workingDays: basic?.workingDays,
      options, baseSalary: salary, allowances, bonuses, deductions, taxRate,
      status: "pending", grossSalary, taxAmount, netSalary
    });


    await payroll.save({ session });

    // 🔹 Handle leave adjustment
    if (options.adjustLeave && options.adjustedLeaveCount > 0) {
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

      await LeaveBalance.create(
        [
          {
            employeeId,
            companyId,
            branchId,
            type: "debit",
            period: `${month}-${year}`,
            balance: newBalance,
            amount: options.adjustedLeaveCount,
            remarks: `Leave adjusted in Payroll ${month}-${year}`,
            payrollId: payroll._id,
            date: new Date().setHours(0, 0, 0, 0),
          },
        ],
        { session }
      );

      await recalculateLeaveBalances(employeeId, companyId);
    }

    // 🔹 Handle advance adjustment
    if (options.adjustAdvance && options.adjustedAdvance > 0) {
      let hey = await Advance.find({ employeeId }).sort({ createdAt: -1 })
      // console.log(advancebalance[0]);

      if (!hey) {
        throw new Error("Employee Advance Balance not found");
      }
      const advanceBalance = hey[0].balance;

      if (options.adjustedAdvance > advanceBalance) {
        throw new Error("Adjusted Advance can't be more than Advance Balance");
      }

      // Create an Advance ledger entry of type "adjusted"
      await Advance.create(
        [
          {
            employeeId,
            companyId,
            branchId,
            type: "adjusted",
            amount: options.adjustedAdvance,
            balance: advanceBalance - options.adjustedAdvance,
            remarks: `Advance adjusted in Payroll ${month}-${year}`,
            payrollId: payroll._id,
            date: new Date().setHours(0, 0, 0, 0),
          },
        ],
        { session }
      );

      // Recalculate advance balances
      await recalculateAdvanceBalances(employeeId, companyId);
    }

    await whichEmployee.save({ session });

    // 🔹 Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Payroll Created",
      payroll,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in createPayroll:", error);
    return next({ status: 500, message: error.message });
  }
};

exports.editPayroll = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const {
      employeeId, month, year, name, present = 0, leave = 0, absent = 0,
      options, basic, allowances = [], bonuses = [], deductions = [], taxRate = 0
    } = req.body;

    const whichEmployee = await Employee.findById(employeeId)
      .populate("department", "department")
      .session(session);

    if (!whichEmployee) {
      throw new Error("Employee not found");
    }

    const {
      branchId,
      department,
      designation,
      profileimage,
      phone,
      email,
      address,
      guardian = { relation: "", name: "" },
    } = whichEmployee;

    // console.log('guardian', guardian)

    // 🔹 Find payroll
    const payroll = await Payroll.findById(id).session(session);
    if (!payroll) throw new Error("Payroll not found");

    // 🔹 Calculate salary
    const salary = basic?.salary || payroll.baseSalary || 0;
    const allowanceTotal = allowances.reduce((sum, a) => sum + Number(a.amount || 0), 0);
    const bonusTotal = bonuses.reduce((sum, b) => sum + Number(b.amount || 0), 0);
    const deductionTotal = deductions.reduce((sum, d) => sum + Number(d.amount || 0), 0);

    const grossSalary = Number(salary) + allowanceTotal + bonusTotal - deductionTotal;
    const taxAmount = (grossSalary * Number(taxRate || 0)) / 100;
    const netSalary = grossSalary - taxAmount;

    if (isNaN(grossSalary) || isNaN(taxAmount) || isNaN(netSalary)) {
      throw new Error("Salary calculation resulted in NaN — check input data");
    }

    // 🔹 Update payroll fields
    Object.assign(payroll, {
      employeeId, month, year, name, present, leave, absent, options, basic, allowances, bonuses, deductions, taxRate,
      grossSalary, taxAmount, netSalary, branchId,
      department: department?.department || "",
      designation, profileimage, phone, email, address, guardian,
    });
    await payroll.save({ session });

    // 🔹 Handle leave adjustment
    let leaveAdjustment = await LeaveBalance.findOne({ payrollId: payroll._id }).session(session);

    if (options?.adjustLeave && options.adjustedLeaveCount > 0) {
      const latestLeave = await LeaveBalance.findOne({
        employeeId: payroll.employeeId,
        companyId: payroll.companyId,
        _id: { $ne: leaveAdjustment?._id }
      }).sort({ date: -1, createdAt: -1 }).session(session);

      const availableLeaves = latestLeave?.balance || 0;
      const adjusted = options.adjustedLeaveCount;
      if (adjusted > availableLeaves) throw new Error("Adjusted Leave can't be more than available leaves");
      const newBalance = availableLeaves - adjusted;

      if (leaveAdjustment) {
        leaveAdjustment.amount = adjusted;
        leaveAdjustment.balance = newBalance;
        leaveAdjustment.remarks = `Leave adjusted in Payroll ${payroll.month}-${payroll.year}`;
        leaveAdjustment.date = new Date().setHours(0, 0, 0, 0);
        await leaveAdjustment.save({ session });
      } else {
        leaveAdjustment = new LeaveBalance({
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
        await leaveAdjustment.save({ session });
      }
      await recalculateLeaveBalances(payroll.employeeId, payroll.companyId);
    } else if (leaveAdjustment) {
      await leaveAdjustment.deleteOne({ session });
      await recalculateLeaveBalances(payroll.employeeId, payroll.companyId);
    }

    // 🔹 Handle advance adjustment
    let advanceAdjustment = await Advance.findOne({ payrollId: payroll._id, type: "adjusted" }).session(session);

    if (options?.adjustAdvance && options.adjustedAdvance > 0) {
      const adjusted = options.adjustedAdvance;
      const latestAdvance = await Advance.findOne({
        employeeId: payroll.employeeId,
        companyId: payroll.companyId,
        _id: { $ne: advanceAdjustment?._id }
      }).sort({ date: -1, createdAt: -1 }).session(session);

      const availableAdvance = latestAdvance?.balance || 0;
      if (adjusted > availableAdvance) throw new Error("Adjusted Advance can't be more than Advance Balance");
      const newBalance = availableAdvance - adjusted;

      if (advanceAdjustment) {
        advanceAdjustment.amount = adjusted;
        advanceAdjustment.balance = newBalance;
        advanceAdjustment.remarks = `Advance adjusted in Payroll ${payroll.month}-${payroll.year}`;
        advanceAdjustment.date = new Date().setHours(0, 0, 0, 0);
        await advanceAdjustment.save({ session });
      } else {
        advanceAdjustment = new Advance({
          employeeId: payroll.employeeId,
          companyId: payroll.companyId,
          branchId: payroll.branchId,
          type: "adjusted",
          amount: adjusted,
          balance: newBalance,
          remarks: `Advance adjusted in Payroll ${payroll.month}-${payroll.year}`,
          payrollId: payroll._id,
          date: new Date().setHours(0, 0, 0, 0),
        });
        await advanceAdjustment.save({ session });
      }
      await recalculateAdvanceBalances(payroll.employeeId, payroll.companyId);
    } else if (advanceAdjustment) {
      await advanceAdjustment.deleteOne({ session });
      await recalculateAdvanceBalances(payroll.employeeId, payroll.companyId);
    }

    // 🔹 Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ success: true, payroll, message: 'Payroll Edited Successfully' });
  } catch (error) {
    console.error(error);
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
        .populate({
          path: "employeeId",
          select: "userid profileimage empId designation",
          populate: { path: "userid", select: "name", },
        })
    } else {
      payrolls = await Payroll.find({ companyId: req.user.companyId })
        .select('branchId companyId department employeeId month year name status')
        .populate({
          path: "employeeId",
          select: "userid profileimage empId designation",
          populate: { path: "userid", select: "name", },
        })
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

    // 🔹 Delete linked advance adjustment if exists
    await Advance.deleteOne({ payrollId: payroll._id, type: "adjusted" }).session(session);

    // 🔹 Delete payroll
    await payroll.deleteOne({ session });

    // 🔹 Recalculate balances
    await recalculateLeaveBalances(payroll.employeeId, payroll.companyId);
    await recalculateAdvanceBalances(payroll.employeeId, payroll.companyId);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ success: true, message: "Payroll deleted" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next({ status: 500, message: error.message });
  }
};


