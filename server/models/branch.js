const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  managerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model("Branch", branchSchema);
