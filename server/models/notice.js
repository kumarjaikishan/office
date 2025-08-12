const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  CreatedById: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('notice', noticeSchema);
