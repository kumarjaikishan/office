const leaveBalanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },

  year: { type: Number, required: true },

  // Different leave types (CL = casual leave, SL = sick leave, PL = paid leave, etc.)
  balances: {
    casual: { type: Number, default: 0 },
    sick: { type: Number, default: 0 },
    paid: { type: Number, default: 0 }
  },

  // Track transactions (like a passbook)
  transactions: [
    {
      date: { type: Date, default: Date.now },
      type: { type: String, enum: ["credit", "debit"], required: true },
      leaveType: { type: String, enum: ["casual", "sick", "paid"], required: true },
      days: { type: Number, required: true },
      reason: { type: String },
      payrollId: { type: mongoose.Schema.Types.ObjectId, ref: "Payroll" }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("LeaveBalance", leaveBalanceSchema);
