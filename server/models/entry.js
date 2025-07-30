const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    ledgerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ledger', required: true },
    date: { type: String, required: true },
    particular: String,
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    balance: Number
});

module.exports = mongoose.model('Entry', entrySchema);
