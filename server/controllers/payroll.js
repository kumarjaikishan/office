const mongoose = require("mongoose");
const Payroll = require("../models/payroll");
const Employee = require("../models/employee");

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
      options,
      absent = 0,
      overtime = 0,
      shortTime = 0,
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
      avaiableLeaves = 0,
      advance = 0,
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
      companyId,
      branchId,
      employeeId,
      month,
      year,
      name,
      department: department?.department || "",
      designation,
      present,
      leave,
      absent,
      overtime,
      options,
      shortTime,
      baseSalary: salary,
      allowances,
      bonuses,
      deductions,
      taxRate,
      status: "pending",
      grossSalary,
      taxAmount,
      netSalary,
    });

    await payroll.save({ session });

    // 🔹 Update employee leaves & advance
    if (options.adjustLeave) {
      whichEmployee.avaiableLeaves = avaiableLeaves - options.adjustedLeaveCount;
    }
    if (options.adjustAdvance) {
      whichEmployee.advance = advance - options.adjustedAdvance;
    }

    await whichEmployee.save({ session });

    // 🔹 Commit
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ success: true, payroll });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return next({ status: 500, message: error.message });
  }
};
