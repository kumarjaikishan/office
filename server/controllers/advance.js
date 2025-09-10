const Advance = require("../models/advance");

// 🔄 Recalculate balances for all advances of one employee
const recalculateAdvanceBalances = async (employeeId, companyId) => {
  const entries = await Advance.find({ employeeId, companyId })
    .sort({ date: 1, _id: 1 });

  let runningBalance = 0;

  for (let entry of entries) {
    if (entry.type === "given") {
      runningBalance += entry.amount;   // add advance given
    } else if (entry.type === "adjusted") {
      runningBalance -= entry.amount;   // subtract adjustment
    }

    entry.balance = runningBalance >= 0 ? runningBalance : 0;
    entry.status = entry.balance > 0 ? "open" : "closed";
    await entry.save();
  }
};

// ➕ Add new advance
exports.addAdvance = async (req, res) => {
  try {
    const { employeeId, companyId, branchId, type, amount, remarks } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newAdvance = await Advance.create({
      employeeId,
      companyId,
      branchId,
      type,
      amount,
      balance: 0, // temporary, recalculated below
      remarks,
      date: today,
    });

    // Recalculate running balances
    await recalculateAdvanceBalances(employeeId, companyId);

    res.status(201).json({
      success: true,
      message: "Advance Added",
      data: newAdvance,
    });
  } catch (err) {
    console.error("Error adding advance:", err.message);
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

// 📑 Get all advances
exports.getAllAdvances = async (req, res) => {
  try {
    let advances;

    if (req.user.role === "manager") {
      advances = await Advance.find({
        companyId: req.user.companyId,
        branchId: { $in: req.user.branchIds },
      })
        .populate({
          path: "employeeId",
          select: "userid",
          populate: { path: "userid", select: "name" },
        })
        .sort({ date: -1, createdAt: -1 });
    } else {
      advances = await Advance.find({ companyId: req.user.companyId })
        .populate({
          path: "employeeId",
          select: "userid",
          populate: { path: "userid", select: "name" },
        })
        .sort({ date: -1, createdAt: -1 });
    }

    res.status(200).json({
      count: advances.length,
      data: advances,
    });
  } catch (err) {
    console.error("Error fetching advances:", err.message);
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

// ✏️ Edit advance
exports.editAdvance = async (req, res) => {
  try {
    const { id } = req.params;
    const advance = await Advance.findById(id);

    if (!advance) {
      return res.status(404).json({ success: false, message: "Advance not found" });
    }

    // Update fields
    advance.type = req.body.type || advance.type;
    advance.amount = req.body.amount || advance.amount;
    advance.remarks = req.body.remarks || advance.remarks;
    advance.date = req.body.date ? new Date(req.body.date) : advance.date;

    await advance.save();

    // Recalculate balances
    await recalculateAdvanceBalances(advance.employeeId, advance.companyId);

    res.status(200).json({
      success: true,
      message: "Advance updated",
      data: advance,
    });
  } catch (err) {
    console.error("Error editing advance:", err.message);
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

// ❌ Delete advance
exports.deleteAdvance = async (req, res) => {
  try {
    const { id } = req.params;
    const advance = await Advance.findById(id);

    if (!advance) {
      return res.status(404).json({ success: false, message: "Advance not found" });
    }

    await advance.deleteOne();

    // Recalculate after delete
    await recalculateAdvanceBalances(advance.employeeId, advance.companyId);

    res.status(200).json({ success: true, message: "Advance deleted" });
  } catch (err) {
    console.error("Error deleting advance:", err.message);
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

exports.recalculateAdvanceBalances = recalculateAdvanceBalances;
