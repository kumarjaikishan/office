const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  name: { type: String, required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  type: { type: String, default: "Public" }, 
  description: { type: String, trim: true }
});

module.exports = mongoose.model('Holiday', holidaySchema);
