import React, { useEffect, useState } from "react";
import { Container, Paper, Autocomplete, TextField, Button, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdDelete } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";
import useImageUpload from "../../../utils/imageresizer";

const LedgerListPage = () => {
    const [ledgers, setLedgers] = useState([]);
    const navigate = useNavigate();
    const [editLedgerId, setEditLedgerId] = useState(null);
    const [editLedgerName, setEditLedgerName] = useState("");
    const [editOpen, setEditOpen] = useState(false);
    const [editLedgerImage, setEditLedgerImage] = useState(null);
    const { handleImage } = useImageUpload();
    const [loading, setloading] = useState(false);


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
            // Optional: set existing image if you store image URL
            // setEditLedgerImage(ledger.image); 
        } else {
            setEditLedgerName("");
            setEditLedgerId(null);
            setEditLedgerImage(null);
        }
        setEditOpen(true);
    };

    const handleSaveLedger = async () => {
        const name = editLedgerName.trim();
        if (!name) return toast.warn("Ledger name can't be empty");
        if (name.length < 3) return toast.warn("Ledger name must be at least 3 characters");

        const formData = new FormData();
        formData.append("name", name);
        if (editLedgerImage) {
            let resizedfile = await handleImage(200, editLedgerImage);
            formData.append("image", resizedfile);
        }

        try {
            setloading(true)
            if (editLedgerId) {
                await axios.put(
                    `${import.meta.env.VITE_API_ADDRESS}ledger/${editLedgerId}`,
                    formData,
                    {
                        headers: {
                            ...headers,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                toast.success("Ledger updated");
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_ADDRESS}ledger`,
                    formData,
                    {
                        headers: {
                            ...headers,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                toast.success("Ledger created");
            }

            setEditOpen(false);
            fetchLedgers();
        } catch (err) {
            console.error(err);
            toast.warning(err.response.data.message);
        } finally {
            setloading(false)
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
            let url = `./${ledger._id}?name=${encodeURIComponent(ledger.name)}`;
            if (ledger.profileImage) {
                url += `&profileimage=${encodeURIComponent(ledger.profileImage)}`;
            }
          return navigate(url);
        }
    };

    return (
        <Container maxWidth="lg" className="mt-4 md:mt-8">
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
                                className="relative group cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all pl-3 pr-1 py-3 bg-gray-50"
                            >
                                {/* Card content */}
                                <div className="flex gap-1 items-center">
                                    <Avatar
                                        sx={{ width: 35, height: 35 }}
                                        alt={l.name} src={l.profileImage} />
                                    <div className="text-l font-semibold text-gray-800 mb-2 capitalize">{l.name}</div>
                                </div>
                                <p className={`text-md  text-end font-medium ${l.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ₹ {l.netBalance.toLocaleString()}
                                </p>
                                <span className="w-[4px] h-full absolute left-0 top-0 bg-teal-700"></span>

                                <div
                                    onClick={(e) => e.stopPropagation()} // prevent parent onClick
                                    className="absolute bottom-1 left-3 flex gap-2 transform -translate-x-25 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-600 delay-400"
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

                    <div className="mt-4">
                        <label className="block text-sm text-gray-600 mb-1">Upload Ledger Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setEditLedgerImage(e.target.files[0])}
                        />
                        {editLedgerImage && (
                            <img
                                src={URL.createObjectURL(editLedgerImage)}
                                alt="preview"
                                className="mt-2 w-24 h-24 object-cover rounded shadow"
                            />
                        )}
                    </div>

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                    <Button loading={loading} variant="contained" onClick={handleSaveLedger}>
                        {editLedgerId ? "Update" : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default LedgerListPage;