const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "employee", required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },

  date: { type: Date, default: Date.now },
  empId: { type: String },
  type: { type: String, enum: ["credit", "debit"], required: true },
  period: { type: String },

  amount: { type: Number, required: true },
  balance: { type: Number, required: true },
  remarks: { type: String },

  payrollId: { type: mongoose.Schema.Types.ObjectId, ref: "Payroll" }
}, { timestamps: true });

module.exports = mongoose.model("LeaveBalance", leaveBalanceSchema);
