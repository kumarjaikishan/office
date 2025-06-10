const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee',
        required: true
    },
    basicSalary: {
        type: Number,
        required: true
    },
    allowance: {
        type: Number,
    },
    deductions: {
        type: Number,
    },
    netSalary: {
        type: Number,
    },
    payDate: {
        type: Number, required: true
    },
    description: {
        type: String
    }
}, { timestamps: true })


const salary = mongoose.model("salary", salarySchema);
module.exports = salary;