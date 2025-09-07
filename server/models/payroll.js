// models/Payroll.js
const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'employee', required: true },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },

  name: { type: String, required: true },
  profileimage: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },

  guardian: {
    realtion: { type: String, },
    name: { type: String },
  },
  department: { type: String, required: true },
  designation: { type: String, required: true },

  monthDays: { type: Number, required: true },
  holidays: { type: Number, default: 0 },
  weekOffs: { type: Number, default: 0 },
  workingDays: { type: Number, default: 0 },
  present: { type: Number, default: 0 },
  leave: { type: Number, default: 0 },
  absent: { type: Number, default: 0 },
  overtime: { type: Number, default: 0 },
  shortTime: { type: Number, default: 0 },

  baseSalary: { type: Number, required: true },

  options: {
    type: Object,
    required: true
  },

  allowances: [{
    name: { type: String },
    amount: { type: Number, default: 0 },
    extraInfo: { type: String, default: '' },
  }],

  bonuses: [{
    name: { type: String },
    amount: { type: Number, default: 0 },
    extraInfo: { type: String, default: '' },
  }],

  deductions: [{
    name: { type: String },
    amount: { type: Number, default: 0 },
    extraInfo: { type: String, default: '' },
  }],

  taxRate: { type: Number, default: 0 },

  grossSalary: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  netSalary: { type: Number, default: 0 },

  status: { type: String, enum: ['pending', 'processed', 'paid'], default: 'pending' },
  processedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Payroll", payrollSchema);
