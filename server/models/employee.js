const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const employeeSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'department',
        required: true
    },
    employeename: {
        type: String,
        required: true
    },
    employeeNumber: {
        type: String,
    },
    weeklyOff: {
        type: [String],
        default: ['Sunday']
    },
    profileimage: {
        type: String,
    },
    email: {
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
    },
    description: {
        type: String
    }
}, { timestamps: true })


const employee = mongoose.model("employee", employeeSchema);
module.exports = employee;