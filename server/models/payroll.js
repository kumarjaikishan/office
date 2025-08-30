// models/Payroll.js
const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'employee', required: true },

  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },

  baseSalary: { type: Number, required: true }, // fixed salary

  // Allowances (HRA, Transport, etc.)
  allowances: [
    {
      type: { type: String },
      amount: { type: Number, default: 0 }
    }
  ],

  // Bonuses (performance, festival, referral, etc.)
  bonuses: [
    {
      type: { type: String },
      amount: { type: Number, default: 0 }
    }
  ],

  // Overtime payments
  overtime: {
    hours: { type: Number, default: 0 },
    ratePerHour: { type: Number, default: 0 },
    amount: { type: Number, default: 0 } // hours * rate
  },

  // Standard deductions (PF, Tax, etc.)
  deductions: [
    {
      type: { type: String },
      amount: { type: Number, default: 0 }
    }
  ],

  // Other deductions (loan repayment, fines, advances, etc.)
  otherDeductions: [
    {
      reason: { type: String },
      amount: { type: Number, default: 0 }
    }
  ],

  // Leave & absence tracking
  leaveDays: { type: Number, default: 0 },
  absentDays: { type: Number, default: 0 },
  paidDays: { type: Number, default: 0 },

  // Final salary components
  grossSalary: { type: Number, default: 0 }, // base + allowances + bonuses + overtime
  totalDeductions: { type: Number, default: 0 }, // deductions + otherDeductions + absent/leave
  netSalary: { type: Number, default: 0 },   // final payable

  status: { type: String, enum: ['pending', 'processed', 'paid'], default: 'pending' },
  processedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Payroll", payrollSchema);
