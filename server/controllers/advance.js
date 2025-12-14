const Advance = require("../models/advance");
const Employee = require("../models/employee");
const Entry = require("../models/entry");
const { recalculateBalances } = require("./ledger");

// 🔄 Recalculate balances for all advances of one employee
// const recalculateAdvanceBalances = async (employeeId, companyId) => {
//   const entries = await Advance.find({ employeeId, companyId })
//     .sort({ date: 1, _id: 1 });

//   let runningBalance = 0;

//   for (let entry of entries) {
//     if (entry.type === "given") {
//       runningBalance += entry.amount;   // add advance given
//     } else if (entry.type === "adjusted") {
//       runningBalance -= entry.amount;   // subtract adjustment
//     }

//     entry.balance = runningBalance >= 0 ? runningBalance : 0;
//     entry.status = entry.balance > 0 ? "open" : "closed";
//     await entry.save();
//   }
// };

const recalculateAdvanceBalances = async (employeeId, companyId) => {
  const entries = await Advance.find({ employeeId, companyId })
    .sort({ date: 1, createdAt: 1, _id: 1 });

  let runningBalance = 0;

  for (let entry of entries) {
    if (entry.type === "given") {
      runningBalance += Number(entry.amount) || 0;   // add advance
    } else if (entry.type === "adjusted") {
      runningBalance -= Number(entry.amount) || 0;   // subtract adjustment
    }

    // ✅ Set running balance (allow negative if logic requires it)
    entry.balance = runningBalance;

    // ✅ Status based on remaining balance
    entry.status = runningBalance > 0 ? "open" : "closed";

    await entry.save();
  }
};


// Add new advance
exports.addAdvance = async (req, res) => {
  try {
    const { employeeId, companyId, branchId, type, amount, remarks } = req.body;
    // console.log(req.body)

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

    const whichemployee = await Employee.findById(employeeId);

    const entryDate = new Date(today);
    if (isNaN(entryDate)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const newEntry = await Entry.create({
      ledgerId: whichemployee.ledgerId,
      date: entryDate,
      particular: remarks,
      debit: type == 'adjusted' ? amount : 0,
      credit: type == 'given' ? amount : 0,
      source: 'advance'
    });

    await recalculateBalances(whichemployee.ledgerId);

    // keeping record of ledger entry id in advance entry for edit or delete further
    await Advance.findByIdAndUpdate(newAdvance._id, { ledgerEntryId: newEntry._id })

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
    const advance = await Advance.findById(id).populate({
      path: "ledgerEntryId",
      select: "ledgerId",
    });
    // console.log('getting advance edit detail', advance)

    if (!advance) {
      return res.status(404).json({ success: false, message: "Advance not found" });
    }

    // Update fields
    advance.type = req.body.type || advance.type;
    advance.amount = req.body.amount || advance.amount;
    advance.remarks = req.body.remarks || advance.remarks;
    advance.date = req.body.date ? new Date(req.body.date) : advance.date;

    await advance.save();

    // Recalculate advance balances
    await recalculateAdvanceBalances(advance.employeeId, advance.companyId);


    // now bout ledger balance
    const updateEntry = await Entry.findByIdAndUpdate(advance.ledgerEntryId._id, {
      date: req.body.date ? new Date(req.body.date) : advance.date,
      particular: req.body.remarks || advance.remarks,
      debit: (req.body.type || advance.type) == 'adjusted' ? req.body.amount || advance.amount : 0,
      credit: (req.body.type || advance.type) == 'given' ? req.body.amount || advance.amount : 0,
    });
    await recalculateBalances(advance?.ledgerEntryId?.ledgerId);

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

    const advance = await Advance.findById(id).populate({
      path: "ledgerEntryId",
      select: "ledgerId",
    });

    if (!advance) {
      return res.status(404).json({
        success: false,
        message: "Advance not found",
      });
    }

    // 1. Delete ledger entry first
    if (advance.ledgerEntryId?._id) {
      await Entry.findByIdAndDelete(advance.ledgerEntryId._id);

      // 2. Recalculate ledger balances
      if (advance.ledgerEntryId.ledgerId) {
        await recalculateBalances(advance.ledgerEntryId.ledgerId);
      }
    }

    // 3. Delete advance
    await advance.deleteOne();

    // 4. Recalculate advance balances
    await recalculateAdvanceBalances(
      advance.employeeId,
      advance.companyId
    );

    res.status(200).json({
      success: true,
      message: "Advance deleted",
    });
  } catch (err) {
    console.error("Error deleting advance:", err.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};


exports.recalculateAdvanceBalances = recalculateAdvanceBalances;
