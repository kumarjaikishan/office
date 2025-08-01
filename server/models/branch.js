const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  managerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'employee' }]
}, { timestamps: true });

module.exports = mongoose.model("Branch", branchSchema);
