import React, { useState, useEffect } from "react";
import {
  Container, TextField, Button, Typography, Box, Table, TableHead, TableBody,
  TableRow, TableCell, Paper, Tabs, Tab, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Select, InputLabel, FormControl, IconButton, TableFooter
} from "@mui/material";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { VscDebugRestart } from "react-icons/vsc";
import { IoMdCloudDownload } from "react-icons/io";


const LedgerSystem = () => {
  const [ledgers, setLedgers] = useState(() => {
    const stored = localStorage.getItem("ledgers");
    return stored ? JSON.parse(stored) : {};
  });
  const [newLedgerName, setNewLedgerName] = useState("");
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [entry, setEntry] = useState({ date: "", particular: "", debit: "", credit: "" });
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    localStorage.setItem("ledgers", JSON.stringify(ledgers));
  }, [ledgers]);

  const createLedger = () => {
    if (newLedgerName.trim() && !ledgers[newLedgerName]) {
      setLedgers({ ...ledgers, [newLedgerName]: [] });
      setNewLedgerName("");
    }
  };

  const resetFilters = () => {
    setFilterYear("");
    setFilterMonth("");
    setFilterDate("");
  };

  const handleSaveEntry = () => {
    if (!selectedLedger) return;

    const debit = parseFloat(entry.debit || 0);
    const credit = parseFloat(entry.credit || 0);
    if (debit > 0 && credit > 0) {
      alert("Only one of Debit or Credit can be entered at a time.");
      return;
    }

    let updatedLedger = [...ledgers[selectedLedger]];

    if (editIndex !== null) {
      updatedLedger[editIndex] = { ...updatedLedger[editIndex], ...entry };
    } else {
      updatedLedger.push({
        date: entry.date,
        particular: entry.particular,
        debit: debit || "",
        credit: credit || "",
      });
    }

    // Recalculate balances
    let balance = 0;
    updatedLedger = updatedLedger.map((item, idx) => {
      const d = parseFloat(item.debit || 0);
      const c = parseFloat(item.credit || 0);
      balance += d - c;
      return { ...item, sNo: idx + 1, balance };
    });

    setLedgers({ ...ledgers, [selectedLedger]: updatedLedger });
    setEntry({ date: "", particular: "", debit: "", credit: "" });
    setEditIndex(null);
    setOpen(false);
  };

  const handleEdit = (index) => {
    const item = ledgers[selectedLedger][index];
    setEntry({
      date: item.date,
      particular: item.particular,
      debit: item.debit,
      credit: item.credit,
    });
    setEditIndex(index);
    setOpen(true);
  };

  const handleDelete = (index) => {
    const updatedLedger = ledgers[selectedLedger].filter((_, i) => i !== index);
    let balance = 0;
    const recalculated = updatedLedger.map((item, idx) => {
      const d = parseFloat(item.debit || 0);
      const c = parseFloat(item.credit || 0);
      balance += d - c;
      return { ...item, sNo: idx + 1, balance };
    });

    setLedgers({ ...ledgers, [selectedLedger]: recalculated });
  };

  const getFilteredEntries = () => {
    if (!selectedLedger) return [];
    return ledgers[selectedLedger].filter((e) => {
      const d = new Date(e.date);
      const yearMatch = filterYear ? d.getFullYear().toString() === filterYear : true;
      const monthMatch = filterMonth ? (d.getMonth() + 1).toString() === filterMonth : true;
      const dateMatch = filterDate ? e.date === filterDate : true;
      return yearMatch && monthMatch && dateMatch;
    });
  };

  const exportCSV = () => {
    const entries = getFilteredEntries();
    const headers = ["S.No", "Date", "Particular", "Debit", "Credit", "Balance"];
    const rows = entries.map(e =>
      [e.sNo, e.date, e.particular, e.debit, e.credit, e.balance]
    );
    const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedLedger}_ledger.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  const monthname = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']

  const entries = getFilteredEntries();
  const totalDebit = entries.reduce((acc, e) => acc + parseFloat(e.debit || 0), 0);
  const totalCredit = entries.reduce((acc, e) => acc + parseFloat(e.credit || 0), 0);
  const totalBalance = entries.length ? entries[entries.length - 1].balance : 0;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Create New Ledger</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            size="small"
            label="Ledger Name"
            value={newLedgerName}
            onChange={(e) => setNewLedgerName(e.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={createLedger}>Create</Button>
        </Box>
        <Tabs
          value={selectedLedger || false}
          onChange={(e, newValue) => setSelectedLedger(newValue)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          {Object.keys(ledgers).map(name => (
            <Tab key={name} label={name} value={name} />
          ))}
        </Tabs>
      </Paper>

      {selectedLedger && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Ledger: {selectedLedger}</Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: "center" }}>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Year</InputLabel>
              <Select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} label="Year">
                <MenuItem value="">All</MenuItem>
                {[...new Set(ledgers[selectedLedger].map(e => new Date(e.date).getFullYear()))].map(y => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Month</InputLabel>
              <Select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} label="Month">
                <MenuItem value="">All</MenuItem>
                {/* {[...Array(12)].map((_, i) => (
                  <MenuItem key={i + 1} value={(i + 1).toString()}>{i + 1}</MenuItem>
                ))} */}
                {monthname.map((_, i) => (
                  <MenuItem key={i + 1} value={(i + 1).toString()}>{_}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              type="date"
              size="small"
              label="Filter Date"
              InputLabelProps={{ shrink: true }}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />

            <IconButton onClick={resetFilters} title="Reset Filters">
              <VscDebugRestart />
            </IconButton>

            <Button variant="contained" onClick={() => setOpen(true)}>Add Entry</Button>
            <Button variant="outlined" onClick={exportCSV} startIcon={<IoMdCloudDownload />}>Export CSV</Button>
          </Box>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>S.No</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Particular</TableCell>
                <TableCell>Debit</TableCell>
                <TableCell>Credit</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry, idx) => (
                <TableRow key={idx}>
                  <TableCell>{entry.sNo}</TableCell>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.particular}</TableCell>
                  <TableCell>{entry.debit || '-'}</TableCell>
                  <TableCell>{entry.credit || '-'}</TableCell>
                  <TableCell>{entry.balance}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEdit(idx)}><MdEdit fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(idx)}><MdDelete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}><strong>Totals</strong></TableCell>
                <TableCell><strong>{totalDebit}</strong></TableCell>
                <TableCell><strong>{totalCredit}</strong></TableCell>
                <TableCell><strong>{totalBalance}</strong></TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </Paper>
      )}

      <Dialog open={open} onClose={() => { setOpen(false); setEditIndex(null); }}>
        <DialogTitle>{editIndex !== null ? "Edit Entry" : "Add Entry"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              type="date"
              label="Date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={entry.date}
              onChange={(e) => setEntry({ ...entry, date: e.target.value })}
            />
            <TextField
              label="Particular"
              size="small"
              value={entry.particular}
              onChange={(e) => setEntry({ ...entry, particular: e.target.value })}
            />
            <TextField
              type="number"
              label="Debit"
              size="small"
              value={entry.debit}
              onChange={(e) => setEntry({ ...entry, debit: e.target.value, credit: "" })}
            />
            <TextField
              type="number"
              label="Credit"
              size="small"
              value={entry.credit}
              onChange={(e) => setEntry({ ...entry, credit: e.target.value, debit: "" })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); setEditIndex(null); }}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEntry}>
            {editIndex !== null ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LedgerSystem;
