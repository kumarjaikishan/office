const mongoose = require('mongoose');

const policyItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ["amount", "percentage"], default: "amount" },
    value: { type: Number, required: true }, // value can be fixed amount or % 
}, { _id: false });

const employeeSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    empId: { type: String, required: true },
    employeeName: { type: String },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'department',
        required: true
    },
    designation: {
        type: String,
    },
    phone: {
        type: String,
    },
    employeeNumber: {
        type: String,
    },
    address: {
        type: String,
    },
    gender: {
        type: String,
    },
    bloodGroup: {
        type: String,
    },
    dob: {
        type: String,
    },
    guardian: {
        relation: { type: String, },
        name: { type: String },
    },
    achievements: [
        {
            title: { type: String, required: true },
            description: { type: String },
            date: { type: String, required: true },
        }
    ],
    education: [
        {
            degree: { type: String, required: true },
            institution: { type: String, required: true }, // renamed "from" to "institution"
            date: { type: String } // more descriptive than just "date"
        }
    ],
    defaultPolicies: {
        type: Boolean,
    },
    allowances: [
        {
            name: { type: String, required: true },
            type: { type: String, enum: ["amount", "percentage"], default: "amount" },
            value: { type: Number, required: true }, // value can be fixed amount or % 
        }
    ],
    bonuses: [
        {
            name: { type: String, required: true },
            type: { type: String, enum: ["amount", "percentage"], default: "amount" },
            value: { type: Number, required: true }, // value can be fixed amount or % 
        }
    ],
    deductions: [
        {
            name: { type: String, required: true },
            type: { type: String, enum: ["amount", "percentage"], default: "amount" },
            value: { type: Number, required: true }, // value can be fixed amount or % 
        }
    ],
    weeklyOff: {
        type: [String],
        default: ['Sunday']
    },
    profileimage: {
        type: String,
    },
    Emergencyphone: {
        type: String,
    },
    maritalStatus: {
        type: String,
    },
    salary: {
        type: Number,
        default: 0
    },
    advance: {
        type: Number,
        default: 0
    },
    availableLeaves: {
        type: Number,
        default: 0
    },
    status: {
        type: Boolean,
        default: true
    },
    acHolderName: {
        type: String,
    },
    bankName: {
        type: String,
    },
    bankbranch: {
        type: String,
    },
    acnumber: {
        type: String,
    },
    ifscCode: {
        type: String,
    },
    upi: {
        type: String,
    },
    adhaar: {
        type: String,
    },
    pan: {
        type: String,
    },
    faceDescriptor: {
        type: [Number], // This will store the 128-length descriptor as an array of numbers
        default: null
    },

}, { timestamps: true })


const employee = mongoose.model("employee", employeeSchema);
module.exports = employee;