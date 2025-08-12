const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

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
        type: String,
    },
    faceDescriptor: {
        type: [Number], // This will store the 128-length descriptor as an array of numbers
        default: null
    },

}, { timestamps: true })


const employee = mongoose.model("employee", employeeSchema);
module.exports = employee;