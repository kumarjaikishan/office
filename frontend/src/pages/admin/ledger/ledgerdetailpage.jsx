import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
    Paper, Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    Avatar
} from '@mui/material';
import { useNavigate } from "react-router-dom";
import { VscDebugRestart } from 'react-icons/vsc';
import { IoMdCloudDownload } from 'react-icons/io';
import DataTable from 'react-data-table-component';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { getLedgerColumns } from './ledgerhelper';
import { MdDelete, MdEdit } from 'react-icons/md';

const SummaryBox = ({ label, value }) => {
  const isNegative = parseFloat(value) < 0;

  return (
    <div className="bg-teal-50 border border-teal-300 border-dashed rounded-md px-4 py-2 min-w-[150px] text-center">
      <p className="text-sm text-gray-600">{label}</p>
      <hr className="my-2 border-teal-200" />
      <p className={`text-lg font-semibold ${isNegative ? 'text-red-600' : 'text-black'}`}>
        {value} ₹
      </p>
    </div>
  );
};


const LedgerDetailPage = () => {
    const { id: ledgerId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const ledgerName = searchParams.get('name');
    const profile = decodeURIComponent(searchParams.get("profileimage"));

    const [entries, setEntries] = useState([]);
    const [filtered, setFiltered] = useState([]);

    const [filterYear, setFilterYear] = useState('all');
    const [filterMonth, setFilterMonth] = useState('all');
    const [filterDate, setFilterDate] = useState('');

    const [totalDebit, setTotalDebit] = useState(0);
    const [totalCredit, setTotalCredit] = useState(0);
    const [totalBalance, setTotalBalance] = useState(0);
    const init = {
        date: dayjs().format('YYYY-MM-DD'), particular: "", debit: "", credit: ""
    }
    const [entry, setEntry] = useState(init);
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
            toast.error(err.response.data.message);
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
            setEntry(init)
            fetchEnteries();
        } catch (error) {
            console.log(error)
            toast.warning(error.response.data.message);
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
        <div className="bg-white rounded shadow-md p-3 md:p-5 m-2">
            {/* Header */}
            <div className="border border-teal-600 border-dashed rounded-md p-3 md:p-5 mb-4 space-y-4">
                <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                    <div className="flex items-center gap-3">
                        <Avatar sx={{ width: 55, height: 55 }} alt={ledgerName} src={profile} />
                        <h2 className="text-2xl font-semibold text-teal-700 capitalize">{ledgerName}</h2>
                    </div>
                    <Button onClick={() => navigate(-1)} variant="contained">Master Sheet</Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <SummaryBox label="Total Debit" value={totalDebit} />
                    <SummaryBox label="Total Credit" value={totalCredit} />
                    <SummaryBox label="Net Balance" value={totalBalance.toFixed(2)} />
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center  gap-3 mb-4">
                <div className="flex flex-wrap items-end  p-2 rounded shadow  gap-3 mb-4">
                    <div className="min-w-[100px]">
                        <label className="text-sm block">Year</label>
                        <select
                            value={filterYear}
                            onChange={e => setFilterYear(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-full"
                        >
                            <option value="all">All</option>
                            {[...new Set(entries.map(e => dayjs(e.date).year()))].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <div className="min-w-[100px]">
                        <label className="text-sm block">Month</label>
                        <select
                            value={filterMonth}
                            onChange={e => setFilterMonth(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-full"
                        >
                            <option value="all">All</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i + 1}>{dayjs().month(i).format("MMMM")}</option>
                            ))}
                        </select>
                    </div>

                    <div className="min-w-[160px]">
                        <label className="text-sm block">Date</label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={e => setFilterDate(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-full"
                        />
                    </div>

                    <span title='Reset' onClick={resetFilters} className="p-2 rounded-full bg-teal-800 text-white">
                        <VscDebugRestart size={20} />
                    </span>
                </div>

                <div className="flex flex-wrap gap-2 ml-auto">
                    <Button variant="contained" onClick={() => { setOpen(true); setEditIndex(null); }}>
                        Add Entry
                    </Button>
                    <Button variant="outlined" onClick={exportCSV} startIcon={<IoMdCloudDownload />}>
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
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
            </div>

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
        </div>
    );
};

export default LedgerDetailPage;

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
