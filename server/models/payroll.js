// models/Payroll.js
const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'employee', required: true },

  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },

  baseSalary: { type: Number, required: true }, // basic salary (fixed component)

  allowances: [
    {
      type: { type: String }, // e.g., "HRA", "Transport", "Medical"
      amount: { type: Number, default: 0 }
    }
  ],

  deductions: [
    {
      type: { type: String }, // e.g., "PF", "ProfessionalTax", "Loan"
      amount: { type: Number, default: 0 }
    }
  ],

  leaveDays: { type: Number, default: 0 },   // unpaid leave days
  absentDays: { type: Number, default: 0 },  // absent days
  paidDays: { type: Number, default: 0 },    // total paid days in month

  grossSalary: { type: Number, default: 0 }, // base + allowances
  totalDeductions: { type: Number, default: 0 },
  netSalary: { type: Number, default: 0 },   // final payable

  status: { type: String, enum: ['pending', 'processed', 'paid'], default: 'pending' },
  processedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Payroll", payrollSchema);
