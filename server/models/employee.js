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
    designation: {
        type: String,
    },
    employeeNumber: {
        type: String,
    },
    achievements: [
        {
            title: { type: String, required: true },
            description: { type: String },
            date: { type: Date, required: true },
        }
    ],
    education: [
        {
            degree: { type: String, required: true },
            institution: { type: String, required: true }, // renamed "from" to "institution"
            date: { type: Date } // more descriptive than just "date"
        }
    ],
    weeklyOff: {
        type: [String],
        default: ['Sunday']
    },
    profileimage: {
        type: String,
    },
    address: {
        type: String,
    },
    phone: {
        type: Number,
    },
    Emergencyphone: {
        type: Number,
    },
    gender: {
        type: String,
    },
    bloodgroup: {
        type: String,
    },
    maritalStatus: {
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