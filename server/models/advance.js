const mongoose = require('mongoose');

const advanceSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "employee", required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    ledgerEntryId: { type: mongoose.Schema.Types.ObjectId, ref: "Entry" },

    empId: { type: String },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ["given", "adjusted"], required: true }, // like credit/debit
    amount: { type: Number, required: true }, // transaction amount
    balance: { type: Number, default: 0 }, // running balance
    remarks: { type: String },

    payrollId: { type: mongoose.Schema.Types.ObjectId, ref: "Payroll" },
    status: { type: String, enum: ["open", "closed"], default: "open" }
}, { timestamps: true });


// ✅ Auto update status before saving
advanceSchema.pre("save", function (next) {
    this.status = this.balance > 0 ? "open" : "closed";
    next();
});

// ✅ Validation for remainingAmount
advanceSchema.path("balance").validate(function (value) {
    return value >= 0;
}, "Balance cannot be negative.");


module.exports = mongoose.model("Advance", advanceSchema);
