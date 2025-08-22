import React, { useEffect, useRef, useState } from "react";
import {
    Container,
    Paper,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar,
    InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdDelete, MdOutlineModeEdit, MdSearch } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";
import useImageUpload from "../../../utils/imageresizer";

const LedgerListPage = () => {
    const [ledgers, setLedgers] = useState([]);
    const [filteredLedgers, setFilteredLedgers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const [editLedgerId, setEditLedgerId] = useState(null);
    const [editLedgerName, setEditLedgerName] = useState("");
    const [editOpen, setEditOpen] = useState(false);
    const [editLedgerImage, setEditLedgerImage] = useState(null);
    const { handleImage } = useImageUpload();
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("emstoken");
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchLedgers();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredLedgers(ledgers);
        } else {
            const lower = searchQuery.toLowerCase();
            setFilteredLedgers(
                ledgers.filter((l) => l.name.toLowerCase().includes(lower))
            );
        }
    }, [searchQuery, ledgers]);

    const fetchLedgers = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_ADDRESS}ledger`,
                { headers }
            );
            setLedgers(res.data.ledgers);
            setFilteredLedgers(res.data.ledgers);
        } catch (err) {
            console.log(err.response);
            toast.warning(err.response?.data?.message || "Failed to fetch ledgers");
        }
    };

    const handleOpenLedgerDialog = (ledger = null) => {
        if (ledger) {
            setEditLedgerName(ledger.name);
            setEditLedgerId(ledger._id);
            setEditLedgerImage(ledger.profileImage || null);
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
        if (name.length < 3)
            return toast.warn("Ledger name must be at least 3 characters");

        const formData = new FormData();
        formData.append("name", name);

        if (editLedgerImage instanceof File) {
            let resizedfile = await handleImage(200, editLedgerImage);
            formData.append("image", resizedfile);
        }

        try {
            setLoading(true);
            if (editLedgerId) {
                await axios.put(
                    `${import.meta.env.VITE_API_ADDRESS}ledger/${editLedgerId}`,
                    formData,
                    {
                        headers: {
                            ...headers,
                            "Content-Type": "multipart/form-data",
                        },
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
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                toast.success("Ledger created");
            }

            setEditOpen(false);
            fetchLedgers();
        } catch (err) {
            console.error(err);
            toast.warning(err.response?.data?.message || "Failed to save ledger");
        } finally {
            setLoading(false);
        }
    };

    const deleteLedger = async (ledger) => {
        swal({
            title: `Are you sure to Delete ${ledger.name}'s Ledger?`,
            text: "Once deleted, you will not be able to recover this",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(async (proceed) => {
            if (proceed) {
                try {
                    await axios.delete(
                        `${import.meta.env.VITE_API_ADDRESS}ledger/${ledger._id}`,
                        { headers }
                    );
                    toast.success("Ledger deleted");
                    fetchLedgers();
                } catch (err) {
                    console.log(err);
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

    const inputref = useRef(null);

    return (
        <div  className="w-full">
            <Paper className="p-2 md:p-4 py-4 mb-4">
                <div className="flex mb-4 gap-2 flex-wrap justify-between">
                    <TextField
                        size="small"
                        label="Search Ledger"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MdSearch className="text-gray-500" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button variant="contained" onClick={() => handleOpenLedgerDialog()}>
                        Add Ledger
                    </Button>
                </div>

                <div className="w-full p-1 md:p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredLedgers.map((l, ind) => (
                            <div
                                key={ind}
                                onClick={() => handleNavigate(l)}
                                className="relative group cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all pl-3 pr-1 py-3 bg-gray-50"
                            >
                                {/* Card content */}
                                <div className="flex gap-1 items-center">
                                    <Avatar
                                        sx={{ width: 35, height: 35 }}
                                        alt={l.name}
                                        src={l.profileImage}
                                    />
                                    <div className="text-l font-semibold text-gray-800 mb-2 capitalize">
                                        {l.name}
                                    </div>
                                </div>
                                <p
                                    className={`text-lg mr-1 text-end font-medium ${l.netBalance >= 0 ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    ₹ {l.netBalance.toLocaleString()}
                                </p>
                                <span className="w-[4px] h-full absolute left-0 top-0 bg-teal-700"></span>

                                <div
                                    onClick={(e) => e.stopPropagation()} // prevent parent onClick
                                    className="absolute bottom-1 left-3 flex gap-2 transform -translate-x-25 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-600 delay-400"
                                >
                                    <span
                                        title="Edit Ledger"
                                        className="rounded-full p-1"
                                        onClick={() => handleOpenLedgerDialog(l)}
                                    >
                                        <MdEdit className=" text-teal-800" />
                                    </span>
                                    <span
                                        title="Delete Ledger"
                                        className="rounded-full p-1"
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
                        autoFocus
                        fullWidth
                        margin="dense"
                        label="Ledger Name"
                        value={editLedgerName}
                        onChange={(e) => setEditLedgerName(e.target.value)}
                    />

                    <div className="mt-1 items-center  w-fit relative">
                        <input
                            style={{ display: "none" }}
                            type="file"
                            onChange={(e) => setEditLedgerImage(e.target.files[0])}
                            ref={inputref}
                            accept="image/*"
                            id="fileInput"
                        />

                        <Avatar
                            sx={{ width: 80, height: 80 }}
                            alt={editLedgerName}
                            src={
                                editLedgerImage
                                    ? editLedgerImage instanceof File
                                        ? URL.createObjectURL(editLedgerImage)
                                        : editLedgerImage
                                    : ""
                            }
                        />

                        <span
                            onClick={() => inputref.current.click()}
                            className="absolute -bottom-1 -right-1 rounded-full bg-teal-900 text-white p-1 cursor-pointer"
                        >
                            <MdOutlineModeEdit size={18} />
                        </span>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                    <Button disabled={loading} variant="contained" onClick={handleSaveLedger}>
                        {editLedgerId ? "Update" : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default LedgerListPage;
