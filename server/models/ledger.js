const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'employee' },
    name: { type: String, required: true },
    profileImage: { type: String },
});

module.exports = mongoose.model('Ledger', ledgerSchema);
