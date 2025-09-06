const advanceSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    originalAmount: { type: Number, required: true },
    remainingAmount: { type: Number, required: true },  // keeps track of unpaid balance
    reason: { type: String },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    transactions: [{
        date: { type: Date },
        amount: { type: Number, required: true },
        fromSalary: { type: Boolean, required: true },
        payrollId: { type: mongoose.Schema.Types.ObjectId, ref: "Payroll" }
    }],
}, { timestamps: true });

// Auto update status before saving
advanceSchema.pre("save", function (next) {
    this.status = this.remainingAmount > 0 ? "open" : "closed";
    next();
});

// Validation
advanceSchema.path("remainingAmount").validate(function (value) {
    return value >= 0 && value <= this.originalAmount;
}, "Remaining amount must be between 0 and original amount.");

module.exports = mongoose.model("Advance", advanceSchema);