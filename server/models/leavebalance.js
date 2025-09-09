const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "employee", required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  
  date: { type: Date, default: Date.now },

  // Transaction type (credit = add leaves, debit = reduce leaves)
  type: { type: String, enum: ["credit", "debit"], required: true },

  // Value of this transaction
  amount: { type: Number, required: true },

  // Running balance after this transaction
  balance: { type: Number, required: true },

  remarks: { type: String },

  payrollId: { type: mongoose.Schema.Types.ObjectId, ref: "Payroll" }
}, { timestamps: true });

module.exports = mongoose.model("LeaveBalance", leaveBalanceSchema);
