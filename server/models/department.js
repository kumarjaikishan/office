const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    department: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    }
}, { timestamps: true })


const department = mongoose.model("department", departmentSchema);
module.exports = department;