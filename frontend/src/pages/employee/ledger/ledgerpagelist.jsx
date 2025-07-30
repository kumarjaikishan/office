import React, { useEffect, useState } from "react";
import { Container, Paper, Autocomplete, TextField, Button, Tabs, Tab } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const LedgerListPage = () => {
    const [ledgers, setLedgers] = useState([]);
    const [selectedLedger, setSelectedLedger] = useState(null);
    const navigate = useNavigate();

    const token = localStorage.getItem("emstoken");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchLedgers = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_ADDRESS}ledgerEntries`, { headers });
            setLedgers(res.data.ledgers);
        } catch {
            toast.error("Failed to fetch ledgers");
        }
    };

    useEffect(() => {
        fetchLedgers();
    }, []);

    const handleNavigate = (ledger) => {
        if (ledger) navigate(`./${ledger._id}`);
    };
    const [tabValue, setTabValue] = useState(null);

    return (
        <Container maxWidth="md" className="mt-4 md:mt-8">
            <Paper className="p-2 md:p-4 py-4 mb-4">
                <div className="flex gap-2">
                    <Autocomplete
                        size="small"
                        options={ledgers}
                        getOptionLabel={(option) => option.name}
                        onChange={(e, val) => handleNavigate(val)}
                        renderInput={(params) => <TextField {...params} label="Search Ledger" fullWidth />}
                        sx={{ flexGrow: 1 }}
                    />
                    <Button variant="contained" onClick={() => toast("Implement Create Ledger Dialog")}>
                        Add Ledger
                    </Button>
                </div>

                <Tabs
                    value={tabValue}
                    onChange={(e, val) => {
                        setTabValue(val);
                        handleNavigate(ledgers.find(l => l._id === val));
                    }}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {ledgers.map((l) => (
                        <Tab key={l._id} label={l.name} value={l._id} />
                    ))}
                </Tabs>
            </Paper>
        </Container>
    );
};

export default LedgerListPage;