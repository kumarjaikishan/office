const Ledger = require("../models/ledger");
const Entry = require("../models/entry");

// Create a new ledger
exports.createLedger = async (req, res) => {
  try {
    const { name } = req.body;

    const existing = await Ledger.findOne({ name, userId: req.userid });
    if (existing) {
      return res.status(400).json({ message: "Ledger with this name already exists." });
    }

    const ledger = await Ledger.create({ name, userId: req.userid });
    res.status(201).json({ message: "Ledger Created" });
  } catch (err) {
    res.status(500).json({ error: "Failed to create ledger", details: err.message });
  }
};

// Update a ledger name
exports.updateLedger = async (req, res) => {
  try {
    const { name } = req.body;
    const updated = await Ledger.findByIdAndUpdate(req.params.id, { name }, { new: true });
    if (!updated) return res.status(404).json({ message: "Ledger not found" });
    res.json({ message: "Ledger updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update ledger", details: err.message });
  }
};

// Get all ledgers and entries for user
exports.ledgerEntries = async (req, res) => {
  try {
    const ledgers = await Ledger.find({ userId: req.userid });
    const entries = await Entry.find({ userId: req.userid }).sort({ date: -1, _id: -1 });
    res.json({ ledgers, entries });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ledgers" });
  }
};

// Delete a ledger
exports.deleteLedger = async (req, res) => {
  try {
    const { id } = req.params;
    await Ledger.findByIdAndDelete(id);
    res.json({ message: "Ledger deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete ledger" });
  }
};

// Helper: Recalculate balances
const recalculateBalances = async (ledgerId, userId) => {
  const entries = await Entry.find({ ledgerId, userId }).sort({ date: 1, _id: 1 });
  let balance = 0;

  for (let entry of entries) {
    balance += (entry.debit || 0) - (entry.credit || 0);
    entry.balance = balance;
    await entry.save();
  }
};

// Create entry
exports.createEntry = async (req, res) => {
  try {
    const { ledgerId, date, particular, debit, credit } = req.body;

    const entryDate = new Date(date);
    if (isNaN(entryDate)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const newEntry = await Entry.create({
      userId: req.userid,
      ledgerId,
      date: entryDate,
      particular,
      debit,
      credit
    });

    await recalculateBalances(ledgerId, req.userid);
    res.status(201).json({ message: "Entry Created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create entry", details: err.message });
  }
};

// Update entry
exports.updateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, ...rest } = req.body;

    const updatedFields = {
      ...rest
    };

    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate)) {
        return res.status(400).json({ error: "Invalid date format" });
      }
      updatedFields.date = parsedDate;
    }

    const entry = await Entry.findByIdAndUpdate(id, updatedFields, { new: true });
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    await recalculateBalances(entry.ledgerId, entry.userId);
    res.status(200).json({ message: "Edited Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update entry" });
  }
};

// Delete entry
exports.deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await Entry.findByIdAndDelete(id);
    if (entry) {
      await recalculateBalances(entry.ledgerId, entry.userId);
    }
    res.status(200).json({ message: "Entry deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete entry" });
  }
};
