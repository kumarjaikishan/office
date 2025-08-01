const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    name: { type: String, required: true },
    profileImage: { type: String }
});

module.exports = mongoose.model('Ledger', ledgerSchema);
