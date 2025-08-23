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
    Menu,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdDelete, MdOutlineModeEdit, MdSearch } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";
import useImageUpload from "../../../utils/imageresizer";
import { MdVisibility } from "react-icons/md";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { useSelector } from "react-redux";


import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";

const LedgerListPage = () => {
    const [ledgers, setLedgers] = useState([]);
    const [filteredLedgers, setFilteredLedgers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const { ledger } = useSelector(e => e.user);
    const [editLedgerId, setEditLedgerId] = useState(null);
    const [editLedgerName, setEditLedgerName] = useState("");
    const [editOpen, setEditOpen] = useState(false);
    const [editLedgerImage, setEditLedgerImage] = useState(null);
    const { handleImage } = useImageUpload();
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("emstoken");
    const headers = { Authorization: `Bearer ${token}` };
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event) => {
        event.stopPropagation(); // prevent card click
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = (event) => {
        event?.stopPropagation();
        setAnchorEl(null);
    };

    useEffect(() => {
        fetchLedgers();
        // console.log(ledger)
        // setLedgers(ledger);
        // setFilteredLedgers(ledger);
    }, [ledger]);

    useEffect(() => {
        if (ledgers.length < 1) return;
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
            console.log(res.data)
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
        <div className="w-full bg-white rounded">
            <div className="p-1 md:p-4 py-4 mb-4">
                <div className="flex mb-4 gap-2 flex-wrap justify-between">
                    <TextField
                        size="small"
                        label="Search Ledger"
                        className="w-full md:w-[200px]"
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
                    <Button className="w-full md:w-[200px]" variant="contained" onClick={() => handleOpenLedgerDialog()}>
                        Add Ledger
                    </Button>
                </div>

                <div className="w-full p-1 md:p-3">
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {Array.isArray(filteredLedgers) && filteredLedgers.length > 0 ? (
                            filteredLedgers.map((l, ind) => (
                                <div key={l._id || ind} onClick={() => handleNavigate(l)} className="relative ...">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-1 items-center">
                                            <Avatar sx={{ width: 35, height: 35 }} alt={l?.name} src={l?.profileImage} />
                                            <div className="text-[14px] md:text-[16px] font-semibold text-gray-800 mb-2 capitalize">
                                                {l?.name || "Unnamed"}
                                            </div>
                                        </div>
                                        {/* menu here */}
                                    </div>

                                    {/* Balance (safe fallback) */}
                                    <p
                                        className={`text-[16px] md:text-lg mr-1 text-end font-medium ${typeof l?.netBalance === "number" && l.netBalance >= 0
                                                ? "text-green-600"
                                                : "text-red-600"
                                            }`}
                                    >
                                        ₹{" "}
                                        {typeof l?.netBalance === "number"
                                            ? l.netBalance.toLocaleString()
                                            : "0"}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="w-full text-center">No Ledger found</div>
                        )}
                    </div>

                </div>
            </div>

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
        </div >
    );
};

export default LedgerListPage;
