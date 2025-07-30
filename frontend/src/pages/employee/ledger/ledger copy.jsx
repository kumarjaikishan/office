import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Container, TextField, Button, Typography,
  Box, Table, TableHead, TableBody,
  TableRow, TableCell, TableFooter,
  Paper, Tabs, Tab, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem,
  Select, InputLabel, FormControl, IconButton
} from "@mui/material";
import { MdEdit, MdDelete } from "react-icons/md";
import { VscDebugRestart } from "react-icons/vsc";
import { IoMdCloudDownload } from "react-icons/io";
import DataTable from "react-data-table-component";
import { getLedgerColumns } from "./ledgerhelper";

const LedgerSystem = () => {
  const token = localStorage.getItem("emstoken");
  const headers = { Authorization: `Bearer ${token}` };

  const [ledgers, setLedgers] = useState([]);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [selectedledgerEntry, setselectedledgerEntry] = useState(null);
  const [newLedgerName, setNewLedgerName] = useState("");
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
      // console.log(res.data)
    } catch (err) {
      console.log(err)
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
        sno: i + 1  // Add serial number here
      }));

    setselectedledgerEntry(filteredEntries);
  }
}, [selectedLedger, entry]);


  const createLedger = async () => {
    const ledgername = newLedgerName.trim();

    if (!ledgername) {
      return toast.warn("Ledger Name can't be blank", { autoClose: 2500 });
    }
    if (ledgername.length < 3) {
      return toast.warn("Ledger Name must be at least 3 characters long", { autoClose: 2500 });
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_ADDRESS}ledger`, {
        name: ledgername
      }, { headers });

      toast.success(res.data.message);
      setNewLedgerName("");
      fetchLedgersEntires();
    } catch (err) {
      toast.warn(err.response?.data?.message || "Failed to create ledger");
    }
  };

  const deleteLedger = async (id) => {
    swal({
      // title: `Are you sure, you want to Delete ${selectedLedger.name}'s Ledger?`,
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

  const openEntryModal = () => {
    setEntry({ date: "", particular: "", debit: "", credit: "" });
    setEditIndex(null);
    setOpen(true);
  };

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
        ledgerId: selectedLedger._id,
        debit: debit || 0,
        credit: credit || 0
      };
      //  return console.log(payload)
      let res;
      if (editIndex !== null) {
        res = await axios.put(`${import.meta.env.VITE_API_ADDRESS}ledgerentry/${editIndex}`, payload, { headers });
        setEditIndex(null)
      } else {
        res = await axios.post(`${import.meta.env.VITE_API_ADDRESS}ledgerentry`, payload, { headers });
      }
      toast.success(res.data.message, { autoClose: 1700 });
      setOpen(false);
      fetchLedgersEntires();
    } catch (error) {
      console.log(error)
      toast.error("Error saving entry");
    }
  };

  const handleEditEntry = (entry) => {
    setEntry({
      date: entry.date,
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
          console.log(err)
          toast.error("Error deleting entry");
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
    const d = new Date(e.date);
    const yearMatch = filterYear ? d.getFullYear().toString() === filterYear : true;
    const monthMatch = filterMonth ? (d.getMonth() + 1).toString() === filterMonth : true;

    const dateMatch = filterDate ? e.date === filterDate : true;
    return yearMatch && monthMatch && dateMatch;
  });
  console.log(filtered)

  const totalDebit = filtered?.reduce((sum, e) => sum + (e.debit || 0), 0);
  const totalCredit = filtered?.reduce((sum, e) => sum + (e.credit || 0), 0);
  const totalBalance = filtered?.length ? filtered[filtered.length - 1].balance : 0;

  const exportCSV = () => {
    const headers = ["S.No", "Date", "Particular", "Debit", "Credit", "Balance"];
    const rows = filtered.map((e, idx) => [
      idx + 1, e.date, e.particular, e.debit, e.credit, e.balance
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

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <span className="text text-sm font-bold md:text-2xl">Create New Ledger</span>
        <Box display="flex" gap={2} mb={2}>
          <TextField
            size="small"
            label="New Ledger"
            value={newLedgerName}
            onChange={e => setNewLedgerName(e.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={createLedger}>Create</Button>
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
            <Tab
              key={l._id}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  {l.name}
                </Box>
              }
              value={l._id}
            />
          ))}
        </Tabs>
      </Paper>

      {selectedLedger && (
        <Paper sx={{ p: 2 }}>
          <Box display="flex" gap={2} mb={2} flexWrap="wrap" justifyContent={"space-between"}>
            <Typography variant="h6" gutterBottom>
              Ledger: {selectedLedger.name}
            </Typography>
            <div className="flex gap-2">
              <Button variant="contained"
                onClick={() => {
                  setEditLedgerName(selectedLedger.name);
                  setEditLedgerId(selectedLedger._id);
                  setEditOpen(true);
                }}
              >Edit Ledger</Button>
              <Button variant="outlined" color="error"
                onClick={() => {
                  deleteLedger(selectedLedger._id);
                }}
              >Delete Ledger</Button>
            </div>
          </Box>
          <div className="flex flex-wrap gap-2 justify-around my-3 border-2 border-dashed p-2 rounded border-teal-600">
            <div className="w-full md:w-auto flex">
              <span className="block md:w-auto w-[120px] ">Total Debit</span>
              <span className="font-bold">: {totalDebit} ₹</span>
            </div>
            <div className="w-full md:w-auto flex">
              <span className="block md:w-auto w-[120px] ">Total Credit</span>
              <span className="font-bold">: {totalCredit} ₹</span>
            </div>
            <div className="w-full md:w-auto flex">
              <span className="block md:w-auto w-[120px] ">Net Balance</span>
              <span className="font-bold">: {totalBalance} ₹</span>
            </div>
          </div>

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
                {[
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ].map((month, index) => (
                  <MenuItem key={index} value={(index + 1).toString()}>{month}</MenuItem>
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
              <Button variant="contained" onClick={openEntryModal}>Add Entry</Button>
              <Button variant="outlined" onClick={exportCSV} startIcon={<IoMdCloudDownload />}>Export CSV</Button>
            </div>
          </Box>

          <Box>
            {(filterYear || filterMonth || filterDate) && (
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Filters applied:
                {filterYear && ` Year: ${filterYear}`}
                {filterMonth && ` Month: ${new Date(0, filterMonth - 1).toLocaleString('default', { month: 'long' })}`}
                {filterDate && ` Date: ${filterDate}`}
              </Typography>
            )}
          </Box>
          <DataTable
            columns={getLedgerColumns(handleEditEntry, handleDeleteEntry)}
            data={filtered}
            pagination
            // selectableRows
            // customStyles={customStyles}
            highlightOnHover
          />
        </Paper>
      )}

      <Dialog open={open} onClose={() => { setOpen(false); setEditIndex(null); }}>
        <DialogTitle>{editIndex !== null ? "Edit Entry" : "Add Entry"}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              type="date" label="Date" size="small" InputLabelProps={{ shrink: true }}
              value={entry.date || ''} onChange={e => setEntry({ ...entry, date: e.target.value })}
            />
            <TextField
              label="Particular" size="small" value={entry.particular || ''}
              onChange={e => setEntry({ ...entry, particular: e.target.value })}
            />
            <TextField
              type="number" label="Debit" size="small" value={entry.debit || ''}
              onChange={e => setEntry({ ...entry, debit: e.target.value, credit: "" })}
            />
            <TextField
              type="number" label="Credit" size="small" value={entry.credit || ''}
              onChange={e => setEntry({ ...entry, credit: e.target.value, debit: "" })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); setEditIndex(null) }}>Cancel</Button>
          <Button variant="contained" onClick={saveEntry}>{editIndex !== null ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Ledger</DialogTitle>
        <DialogContent sx={{ gap: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label="Ledger Name"
            value={editLedgerName}
            onChange={(e) => setEditLedgerName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            try {
              if (!editLedgerName.trim()) {
                return toast.warn("Ledger name can't be empty");
              }
              if (editLedgerName.trim().length < 3) {
                return toast.warn("Ledger name must be at least 3 characters");
              }
              await axios.put(`${import.meta.env.VITE_API_ADDRESS}ledger/${editLedgerId}`, {
                name: editLedgerName.trim()
              }, { headers });
              toast.success("Ledger updated");
              setEditOpen(false);
              fetchLedgersEntires();
            } catch (err) {
              console.log(err)
              toast.error("Error updating ledger");
            }
          }}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
  
};

export default LedgerSystem;


