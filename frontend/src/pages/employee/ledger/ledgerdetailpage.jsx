import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Paper, Box, Typography, Button, FormControl, InputLabel, Select,
    MenuItem, TextField, IconButton
} from '@mui/material';
import { VscDebugRestart } from 'react-icons/vsc';
import { IoMdCloudDownload } from 'react-icons/io';
import DataTable from 'react-data-table-component';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { getLedgerColumns } from './ledgerhelper';

const SummaryBox = ({ label, value }) => (
    <Box className="bg-teal-50 border border-teal-300 rounded-md px-4 py-2 min-w-[150px] text-center">
        <Typography variant="subtitle2" color="textSecondary">{label}</Typography>
        <Typography variant="subtitle1" fontWeight="bold">{value} ₹</Typography>
    </Box>
);

const LedgerDetailPage = () => {
    const { id: ledgerId } = useParams();
    const [ledger, setLedger] = useState(null);
    const [entries, setEntries] = useState([]);
    const [filtered, setFiltered] = useState([]);

    const [filterYear, setFilterYear] = useState('all');
    const [filterMonth, setFilterMonth] = useState('all');
    const [filterDate, setFilterDate] = useState('');

    const [totalDebit, setTotalDebit] = useState(0);
    const [totalCredit, setTotalCredit] = useState(0);
    const [totalBalance, setTotalBalance] = useState(0);

    const token = localStorage.getItem("emstoken");
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchLedgers();
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

    const fetchLedgers = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_ADDRESS}ledgerEntries`, { headers });
            setLedger(res.data?.ledgers.find(l => l._id === ledgerId));
            setEntries(res.data?.entries.filter(e => e.ledgerId == ledgerId));
            console.log(res.data)
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

    const handleEditEntry = (entry) => {
        toast("Implement Edit Entry");
    };

    const handleDeleteEntry = (id) => {
        toast("Implement Delete Entry");
    };

    const handleOpenLedgerDialog = () => {
        toast("Implement Edit Ledger Dialog");
    };

    const deleteLedger = async () => {
        toast("Implement Ledger Delete");
    };

    const exportCSV = () => {
        toast("Implement CSV Export");
    };

    if (!ledger) return <div>Loading...</div>;

    return (
        <Paper className="md:p-3 p-1">
            <Box className="border border-teal-600 border-dashed rounded-md p-2 md:p-4 mb-4">
                <Box className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <Typography variant="h6">
                        Ledger: <span className="text-teal-700">{ledger.name}</span>
                    </Typography>

                    <div className="flex gap-2">
                        <Button variant="contained" onClick={handleOpenLedgerDialog}>
                            Edit Ledger
                        </Button>
                        <Button variant="outlined" color="error" onClick={deleteLedger}>
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
                    <Button variant="contained" onClick={() => toast("Add Entry")}>
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
            />
        </Paper>
    );
};

export default LedgerDetailPage;
