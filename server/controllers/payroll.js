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
      availableLeaves = 0,
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
      if (options.adjustedLeaveCount > availableLeaves) {
        return next({ status: 400, message: "Adjusted Leave can't be more than available leaves" });
      }
      whichEmployee.availableLeaves = availableLeaves - options.adjustedLeaveCount;
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

    return res.status(201).json({ success: true, payroll });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
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

