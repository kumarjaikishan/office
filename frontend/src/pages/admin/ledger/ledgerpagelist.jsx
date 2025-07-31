import React, { useEffect, useState } from "react";
import { Container, Paper, Autocomplete, TextField, Button, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdDelete } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";

const LedgerListPage = () => {
    const [ledgers, setLedgers] = useState([]);
    const navigate = useNavigate();
    const [editLedgerId, setEditLedgerId] = useState(null);
    const [editLedgerName, setEditLedgerName] = useState("");
    const [editOpen, setEditOpen] = useState(false);

    const token = localStorage.getItem("emstoken");
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchLedgers();
    }, []);

    const fetchLedgers = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_ADDRESS}ledger`, { headers });
            setLedgers(res.data.ledgers);
            // console.log(res.data)
        } catch {
            toast.error("Failed to fetch ledgers");
        }
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
            fetchLedgers();
        } catch (err) {
            console.log(err)
            toast.error("Failed to save ledger");
        }
    };

    const deleteLedger = async (ledger) => {
        swal({
            title: `Are you sure to Delete ${ledger.name}'s Ledger?`,
            text: 'Once deleted, you will not be able to recover this',
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(async (proceed) => {
            if (proceed) {
                try {
                    await axios.delete(`${import.meta.env.VITE_API_ADDRESS}ledger/${ledger._id}`, { headers });
                    toast.success("Ledger deleted");

                    fetchLedgers();
                } catch (err) {
                    console.log(err)
                    toast.error("Failed to delete ledger");
                }
            }
        });
    };

    const handleNavigate = (ledger) => {
        if (ledger) {
            navigate(`./${ledger._id}?name=${encodeURIComponent(ledger.name)}`);
        }
    };

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
                    <Button variant="contained" onClick={() => handleOpenLedgerDialog()}>
                        Add Ledger
                    </Button>
                </div>

                <div className="w-full p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {ledgers.map((l, ind) => (
                            <div
                                key={ind}
                                onClick={() => handleNavigate(l)}
                                className="relative group cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all px-4 py-2 bg-white"
                            >
                                {/* Card content */}
                                <h3 className="text-lg font-semibold text-gray-800 mb-2 capitalize">{l.name}</h3>
                                <p className={`text-md font-medium ${l.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ₹ {l.netBalance.toLocaleString()}
                                </p>
                                <span className="w-[4px] h-full absolute left-0 top-0 bg-teal-700"></span>

                                <div
                                    onClick={(e) => e.stopPropagation()} // prevent parent onClick
                                    className="absolute bottom-2 right-1 flex gap-2 transform translate-x-20 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-600 delay-400"
                                >
                                    <span
                                        title="Edit Ledger"
                                        className="bg-teal-100 rounded-full p-1"
                                        onClick={() => handleOpenLedgerDialog(l)}
                                    >
                                        <MdEdit className=" text-teal-800" />
                                    </span>
                                    <span
                                        title="Delete Ledger"
                                        className="bg-red-100 rounded-full p-1"
                                        onClick={() => deleteLedger(l)}
                                    >
                                        <MdDelete className=" text-red-800" />
                                    </span>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>

            </Paper>
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

export default LedgerListPage;