const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const employeeSchema = new mongoose.Schema({
    employeeId: {
        type: String,
    },
    employeename: {
        type: String,
        required: true
    },
    weeklyOff: {
        type: [String],
        default: ['Sunday']
    },
    profileimage: {
        type: String,
    },
    gender: {
        type: String,
    },
    maritalStatus: {
        type: String,
    },
    designation: {
        type: String,
    },
    salary: {
        type: Number,
    },
    dob: {
        type: String,
        required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'department',
        required: true
    },
    description: {
        type: String
    }
}, { timestamps: true })


const employee = mongoose.model("employee", employeeSchema);
module.exports = employee;