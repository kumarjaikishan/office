import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Container, TextField, Button, Typography,
  Box, Paper, Tabs, Tab, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem,
  Select, InputLabel, FormControl, IconButton, Autocomplete
} from "@mui/material";
import { MdEdit, MdDelete } from "react-icons/md";
import { VscDebugRestart } from "react-icons/vsc";
import { IoMdCloudDownload } from "react-icons/io";
import DataTable from "react-data-table-component";
import { getLedgerColumns } from "./ledgerhelper";
import swal from "sweetalert";
import dayjs from "dayjs";

const LedgerSystem = () => {
  const token = localStorage.getItem("emstoken");
  const headers = { Authorization: `Bearer ${token}` };

  const [ledgers, setLedgers] = useState([]);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [selectedledgerEntry, setselectedledgerEntry] = useState(null);
  const [entry, setEntry] = useState({ date: "", particular: "", debit: "", credit: "" });
  const [entries, setEntries] = useState([]);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editLedgerId, setEditLedgerId] = useState(null);
  const [editLedgerName, setEditLedgerName] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const fetchLedgersEntires = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_ADDRESS}ledgerEntries`, { headers });
      setLedgers(res.data.ledgers);
      setEntry(res.data.entries);
    } catch (err) {
      toast.error("Error fetching ledgers");
    }
  };

  useEffect(() => {
    fetchLedgersEntires();
  }, []);

  useEffect(() => {
    if (!selectedLedger) return;
    const selectedLedgerId = selectedLedger._id;
    if (entry.length > 0) {
      const filteredEntries = entry
        .filter(e => e.ledgerId === selectedLedgerId)
        .map((e, i) => ({
          ...e,
          sno: i + 1
        }));
      setselectedledgerEntry(filteredEntries);
    }
  }, [selectedLedger, entry]);

  const saveEntry = async () => {
    const debit = parseFloat(entry.debit || 0);
    const credit = parseFloat(entry.credit || 0);

    if (debit && credit) {
      toast.warn("Only one of Debit or Credit allowed");
      return;
    }

    try {
      const payload = {
        ...entry,
        date: new Date(entry.date), // ✅ Convert to Date object
        ledgerId: selectedLedger._id,
        debit: debit || 0,
        credit: credit || 0
      };

      let res;
      if (editIndex !== null) {
        res = await axios.put(`${import.meta.env.VITE_API_ADDRESS}ledgerentry/${editIndex}`, payload, { headers });
        setEditIndex(null);
      } else {
        res = await axios.post(`${import.meta.env.VITE_API_ADDRESS}ledgerentry`, payload, { headers });
      }

      toast.success(res.data.message);
      setOpen(false);
      fetchLedgersEntires();
    } catch (error) {
      console.log(error)
      toast.error("Error saving entry");
    }
  };


  const handleEditEntry = (entry) => {
    const formattedDate = new Date(entry.date).toISOString().split("T")[0]; // ✅ format to 'YYYY-MM-DD'
    setEntry({
      date: formattedDate,
      particular: entry.particular,
      debit: entry.debit?.toString() || "",
      credit: entry.credit?.toString() || ""
    });
    setEditIndex(entry._id);
    setOpen(true);
  };


  const handleDeleteEntry = async (idx) => {
    swal({
      title: `Are you sure to Delete this entry?`,
      text: 'Once deleted, you will not be able to recover this',
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (proceed) => {
      if (proceed) {
        try {
          let res = await axios.delete(`${import.meta.env.VITE_API_ADDRESS}ledgerentry/${idx}`, { headers });
          toast.success(res.data.message);
          fetchLedgersEntires();
        } catch (err) {
          toast.error("Error deleting entry");
        }
      }
    });
  };

  const deleteLedger = async (id) => {
    swal({
      title: `Are you sure to Delete ${selectedLedger.name}'s Ledger?`,
      text: 'Once deleted, you will not be able to recover this',
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (proceed) => {
      if (proceed) {
        try {
          await axios.delete(`${import.meta.env.VITE_API_ADDRESS}ledger/${id}`, { headers });
          toast.success("Ledger deleted");
          if (selectedLedger?._id === id) setSelectedLedger(null);
          fetchLedgersEntires();
        } catch {
          toast.error("Failed to delete ledger");
        }
      }
    });
  };

  const resetFilters = () => {
    setFilterYear("");
    setFilterMonth("");
    setFilterDate("");
  };

  const filtered = selectedledgerEntry?.filter(e => {
    const d = dayjs(e.date);
    const yearMatch = filterYear ? d.year() === Number(filterYear) : true;
    const monthMatch = filterMonth ? (d.month() + 1) === Number(filterMonth) : true;
    const dateMatch = filterDate ? d.isSame(filterDate, "day") : true;
    return yearMatch && monthMatch && dateMatch;
  });



  const totalDebit = filtered?.reduce((sum, e) => sum + (e.debit || 0), 0);
  const totalCredit = filtered?.reduce((sum, e) => sum + (e.credit || 0), 0);
  const totalBalance = totalDebit - totalCredit;

  const exportCSV = () => {
    const headers = ["S.No", "Date", "Particular", "Debit", "Credit", "Balance"];
    const rows = filtered.map((e, idx) => [
      idx + 1, dayjs(e.date).format('YYYY-MM-DD'), e.particular, e.debit, e.credit, e.balance
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedLedger.name}_ledger.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenLedgerDialog = (ledger = null) => {
    if (ledger) {
      setEditLedgerName(ledger.name);
      setEditLedgerId(ledger._id);
    } else {
      setEditLedgerName("");
      setEditLedgerId(null);
    }
    setEditOpen(true);
  };

  const handleSaveLedger = async () => {
    const name = editLedgerName.trim();
    if (!name) return toast.warn("Ledger name can't be empty");
    if (name.length < 3) return toast.warn("Ledger name must be at least 3 characters");

    try {
      if (editLedgerId) {
        await axios.put(`${import.meta.env.VITE_API_ADDRESS}ledger/${editLedgerId}`, { name }, { headers });
        toast.success("Ledger updated");
      } else {
        await axios.post(`${import.meta.env.VITE_API_ADDRESS}ledger`, { name }, { headers });
        toast.success("Ledger created");
      }
      setEditOpen(false);
      fetchLedgersEntires();
    } catch (err) {
      toast.error("Failed to save ledger");
    }
  };
  const SummaryBox = ({ label, value }) => (
  <Box className="bg-teal-50 border border-teal-300 rounded-md px-4 py-2 min-w-[150px] text-center">
    <Typography variant="subtitle2" color="textSecondary">{label}</Typography>
    <Typography variant="subtitle1" fontWeight="bold">{value} ₹</Typography>
  </Box>
);


  return (
    <Container maxWidth="md" className="mt-4 md:mt-8" >
      <Paper className="p-2 md:p-4 py-4 mb-4">
        <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center" gap={2}>
          <Autocomplete
            size="small"
            options={ledgers}
            getOptionLabel={(option) => option.name}
            value={selectedLedger}
            onChange={(e, val) => setSelectedLedger(val)}
            renderInput={(params) => <TextField {...params} label="Search Ledger" fullWidth />}
            sx={{ flexGrow: 1 }}
          />
          <Button variant="contained" onClick={() => handleOpenLedgerDialog()}>
            Add Ledger
          </Button>
        </Box>
        <Tabs
          value={selectedLedger?._id || false}
          onChange={(e, val) => {
            const ledger = ledgers.find(l => l._id === val);
            setSelectedLedger(ledger);
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {ledgers.map(l => (
            <Tab key={l._id} label={l.name} value={l._id} />
          ))}
        </Tabs>
      </Paper>

      {selectedLedger && (
        <Paper className="md:p-3 p-1">
          <Box className="border border-teal-600 border-dashed rounded-md p-2 md:p-4 mb-4">
            <Box className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <Typography variant="h6">
                Ledger: <span className="text-teal-700">{selectedLedger.name}</span>
              </Typography>

              <div className="flex gap-2">
                <Button variant="contained" onClick={() => handleOpenLedgerDialog(selectedLedger)}>
                  Edit Ledger
                </Button>
                <Button variant="outlined" color="error" onClick={() => deleteLedger(selectedLedger._id)}>
                  Delete Ledger
                </Button>
              </div>
            </Box>

            <Box className="flex flex-wrap md:justify-between justify-center gap-4 mt-4">
              <SummaryBox label="Total Debit" value={totalDebit} />
              <SummaryBox label="Total Credit" value={totalCredit} />
              <SummaryBox label="Net Balance" value={totalBalance} />
            </Box>
          </Box>


          <Box display="flex" gap={2} mb={2} flexWrap="wrap" alignItems="center">
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Year</InputLabel>
              <Select value={filterYear} onChange={e => setFilterYear(e.target.value)} label="Year">
                <MenuItem value="">All</MenuItem>
                {[...new Set(selectedledgerEntry?.map(e => new Date(e.date).getFullYear()))].map(y => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Month</InputLabel>
              <Select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} label="Month">
                <MenuItem value="">All</MenuItem>
                {Array.from({ length: 12 }, (_, i) => (
                  <MenuItem key={i} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              type="date"
              label="Date"
              InputLabelProps={{ shrink: true }}
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
            <IconButton onClick={resetFilters}><VscDebugRestart /></IconButton>
            <div className="flex gap-2">
              <Button variant="contained" onClick={() => { setEntry({}); setOpen(true); setEditIndex(null); }}>
                Add Entry
              </Button>
              <Button variant="outlined" onClick={exportCSV} startIcon={<IoMdCloudDownload />}>Export CSV</Button>
            </div>
          </Box>

          <DataTable
            columns={getLedgerColumns(handleEditEntry, handleDeleteEntry)}
            data={filtered || []}
            pagination
            highlightOnHover
            noDataComponent="No entries found for selected filters."
          />
        </Paper>
      )}

      {/* Entry Modal */}
      <Dialog open={open} onClose={() => { setOpen(false); setEditIndex(null); }}>
        <DialogTitle>{editIndex !== null ? "Edit Entry" : "Add Entry"}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField type="date" label="Date" size="small" InputLabelProps={{ shrink: true }}
              value={entry.date || ''} onChange={e => setEntry({ ...entry, date: e.target.value })}
            />
            <TextField label="Particular" size="small" value={entry.particular || ''}
              onChange={e => setEntry({ ...entry, particular: e.target.value })}
            />
            <TextField type="number" label="Debit" size="small" value={entry.debit || ''}
              onChange={e => setEntry({ ...entry, debit: e.target.value, credit: "" })}
            />
            <TextField type="number" label="Credit" size="small" value={entry.credit || ''}
              onChange={e => setEntry({ ...entry, credit: e.target.value, debit: "" })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); setEditIndex(null) }}>Cancel</Button>
          <Button variant="contained" onClick={saveEntry}>{editIndex !== null ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>

      {/* Ledger Create/Edit Modal */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>{editLedgerId ? "Edit Ledger" : "Add Ledger"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth margin="dense" label="Ledger Name"
            value={editLedgerName} onChange={(e) => setEditLedgerName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveLedger}>
            {editLedgerId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LedgerSystem;
