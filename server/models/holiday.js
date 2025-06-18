const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  name: { type: String, required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  type: { type: String, default: "Public" } // Public, Festival, Optional
});

module.exports = mongoose.model('Holiday', holidaySchema);
