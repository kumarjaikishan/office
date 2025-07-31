import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
    Paper, Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, TextField, IconButton, Dialog,  DialogTitle, DialogContent,   DialogActions
} from '@mui/material';
import { useNavigate } from "react-router-dom";
import { VscDebugRestart } from 'react-icons/vsc';
import { IoMdCloudDownload } from 'react-icons/io';
import DataTable from 'react-data-table-component';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { getLedgerColumns } from './ledgerhelper';
import { MdDelete, MdEdit } from 'react-icons/md';

const SummaryBox = ({ label, value }) => (
    <Box className="bg-teal-50 border border-teal-300 border-dashed rounded-md px-4 py-2 min-w-[150px] text-center">
        <Typography variant="subtitle2" color="textSecondary">{label}</Typography>
        <Typography variant="subtitle1" fontWeight="bold">{value} ₹</Typography>
    </Box>
);

const LedgerDetailPage = () => {
    const { id: ledgerId } = useParams();
    const [searchParams] = useSearchParams();
        const navigate = useNavigate();

    const ledgerName = searchParams.get('name');
    const [ledger, setLedger] = useState(null);
    const [entries, setEntries] = useState([]);
    const [filtered, setFiltered] = useState([]);

    const [filterYear, setFilterYear] = useState('all');
    const [filterMonth, setFilterMonth] = useState('all');
    const [filterDate, setFilterDate] = useState('');

    const [totalDebit, setTotalDebit] = useState(0);
    const [totalCredit, setTotalCredit] = useState(0);
    const [totalBalance, setTotalBalance] = useState(0);

    const [entry, setEntry] = useState({ date: "", particular: "", debit: "", credit: "" });
    const [open, setOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    const token = localStorage.getItem("emstoken");
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchEnteries();
    }, [ledgerId]);

    useEffect(() => {
        if (!entries) return;

        const filteredData = entries.filter(e => {
            const d = dayjs(e.date);
            const yearMatch = filterYear !== 'all' ? d.year() === Number(filterYear) : true;
            const monthMatch = filterMonth !== "all" ? (d.month() + 1) === Number(filterMonth) : true;
            const dateMatch = filterDate ? d.isSame(filterDate, "day") : true;
            return yearMatch && monthMatch && dateMatch;
        });

        setFiltered(filteredData);

        const debit = filteredData.reduce((sum, e) => sum + (e.debit || 0), 0);
        const credit = filteredData.reduce((sum, e) => sum + (e.credit || 0), 0);
        const balance = debit - credit;

        setTotalDebit(debit);
        setTotalCredit(credit);
        setTotalBalance(balance);
    }, [entries, filterYear, filterMonth, filterDate]);

    const fetchEnteries = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_ADDRESS}entries/${ledgerId}`, { headers });
            // setLedger(res.data?.ledgers.find(l => l._id === ledgerId));
            setEntries(res.data?.entries);
            // console.log(res.data)
        } catch (err) {
            console.log(err);
            toast.error("Failed to fetch ledgers");
        }
    };

    const resetFilters = () => {
        setFilterYear('');
        setFilterMonth('');
        setFilterDate('');
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
                    fetchEnteries();
                } catch (err) {
                    console.log(err)
                    toast.error("Error deleting entry");
                }
            }
        });
    };

    const handleOpenLedgerDialog = () => {
        toast("Implement Edit Ledger Dialog");
    };

    const deleteLedger = async () => {
        toast("Implement Ledger Delete");
    };

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
                ledgerId: ledgerId,
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
            fetchEnteries();
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

    // if (!ledger) return <div>Loading...</div>;

    return (
        <Paper className="md:p-3 p-1 m-2">
            <Box className="border border-teal-600 border-dashed rounded-md p-2 md:p-4 mb-4">
                <Box className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <Typography variant="h6">
                        Ledger: <span className="text-teal-700 text-2xl font-semibold capitalize">{ledgerName}</span>
                    </Typography>
                    <Button onClick={()=> navigate(-1)} variant='contained' >Master Sheet</Button>

                    {/* <div className="flex gap-3">
                        <div
                            onClick={handleOpenLedgerDialog}
                            className="group cursor-pointer bg-blue-600 text-white rounded-full transition-all duration-300 w-10 h-10 hover:w-36 flex items-center justify-center group-hover:justify-start px-2"
                        >
                            <div className="w-6 h-6 flex items-center justify-center">
                                <MdEdit className="text-xl" />
                            </div>
                            <span className="group-hover:ml-2 w-0 overflow-hidden group-hover:w-auto transition-all duration-300 whitespace-nowrap">
                                Edit Ledger
                            </span>
                        </div>
                        <div
                            onClick={deleteLedger}
                            className="group cursor-pointer border border-red-600 text-red-600 rounded-full transition-all duration-300 w-10 h-10 hover:w-40 flex items-center justify-center group-hover:justify-start px-2"
                        >
                            <div className="w-6 h-6 flex items-center justify-center">
                                <MdDelete className="text-xl" />
                            </div>
                            <span className="group-hover:ml-2 w-0 overflow-hidden group-hover:w-auto transition-all duration-300 whitespace-nowrap">
                                Delete Ledger
                            </span>
                        </div>
                    </div> */}
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
                        <MenuItem value="all">All</MenuItem>
                        {[...new Set(entries.map(e => dayjs(e.date).year()))].map(y => (
                            <MenuItem key={y} value={y}>{y}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel>Month</InputLabel>
                    <Select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} label="Month">
                        <MenuItem value="all">All</MenuItem>
                        {Array.from({ length: 12 }, (_, i) => (
                            <MenuItem key={i} value={i + 1}>{dayjs().month(i).format("MMMM")}</MenuItem>
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
                    <Button variant="outlined" onClick={exportCSV} startIcon={<IoMdCloudDownload />}>
                        Export CSV
                    </Button>
                </div>
            </Box>

            <DataTable
                columns={getLedgerColumns(handleEditEntry, handleDeleteEntry)}
                data={filtered || []}
                pagination
                highlightOnHover
                noDataComponent="No entries found for selected filters."
                paginationPerPage={10}
                paginationRowsPerPageOptions={
                    [10, 25, 50, 100, filtered.length > 100 ? filtered.length : null].filter(Boolean)
                }
                paginationComponentOptions={{
                    rowsPerPageText: 'Rows per page:',
                }}
            />

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
        </Paper>
    );
};

export default LedgerDetailPage;
