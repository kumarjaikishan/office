import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    MenuItem,
    IconButton,
    Box,
    FormControl,
    InputLabel,
    Select,
    Avatar,
} from "@mui/material";
import axios from "axios";
import { MdDelete, MdEdit } from "react-icons/md";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Modalbox from "../../components/custommodal/Modalbox";

const LeaveBalancePage = () => {
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        employeeId: "",
        companyId: "",
        branchId: "",
        type: "credit",
        amount: 0,
        remarks: "",
    });
    const [editingId, setEditingId] = useState(null);
    const { company, employee, leaveBalance } = useSelector((state) => state.user);

    useEffect(() => {
        if (leaveBalance) setRows(leaveBalance)
        console.log(leaveBalance)
    }, [leaveBalance]);

    // ✅ Handle form change
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleOpen = (row = null) => {
        if (row) {
            setForm({
                employeeId: row.employeeId?._id || "",
                companyId: row.companyId || "",
                branchId: row.branchId || "",
                type: row.type,
                amount: row.amount,
                remarks: row.remarks,
            });
            setEditingId(row._id);
        } else {
            setForm({
                employeeId: "",
                companyId: "",
                branchId: "",
                type: "credit",
                amount: 0,
                remarks: "",
            });
            setEditingId(null);
        }
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    // ✅ Submit (Create or Update)
    const handleSubmit = async () => {
        if (!form.employeeId) return toast.warning("Please select Employee")
        if (form.amount < 1) return toast.warning("Please enter No. of Leaves")
        try {
            const token = localStorage.getItem("emstoken");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (editingId) {
                await axios.put(
                    `${import.meta.env.VITE_API_ADDRESS}leave-balances/${editingId}`,
                    form,
                    config
                );
                toast.success("Leave balance updated");
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_ADDRESS}leave-balances`,
                    form,
                    config
                );
                toast.success("Leave balance added");
            }

            handleClose();
        } catch (error) {
            console.error("Error saving leave balance:", error);
            if (error.response) {
                toast.error(error.response.data.message || "Failed to save");
            } else {
                toast.error("Server error");
            }
        }
    };

    // ✅ Delete record
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            try {
                const token = localStorage.getItem("emstoken");
                await axios.delete(
                    `${import.meta.env.VITE_API_ADDRESS}leave-balances/${id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                toast.success("Leave balance deleted");
                fetchData();
            } catch (error) {
                console.error("Error deleting leave balance:", error);
                toast.error("Failed to delete record");
            }
        }
    };

    // ✅ Set employee selection
    const setEmployee = (e) => {
        const empId = e.target.value;
        const emp = employee.find((emp) => emp._id === empId);
        if (emp) {
            setForm({
                ...form,
                employeeId: emp._id,
                companyId: emp.companyId,
                branchId: emp.branchId,
            });
        }
    };

    // ✅ DataTable columns
    const columns = [
        {
            name: "Employee",
            selector: (row) => row.employeeId?.userid?.name || "N/A",
            sortable: true,
        },
        { name: "Type", selector: (row) => row.type, sortable: true, width: '90px' },
        { name: "Leaves", selector: (row) => row.type == 'credit' ? row.amount : `-${row.amount}`, sortable: true, width: '90px' },
        { name: "Balance", selector: (row) => row.balance, sortable: true, width: '90px' },
        { name: "Remarks", selector: (row) => row.remarks || "-" },
        {
            name: "Actions",
            cell: (row) => (
                <> {!row?.payrollId && <>
                    <IconButton color="primary" onClick={() => handleOpen(row)}>
                        <MdEdit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(row._id)}>
                        <MdDelete />
                    </IconButton>
                </>
                }
                </>
            ),
            width: '120px'
        },
    ];

    return (
        <Box p={2}>
            <h2>Leave Balance Management</h2>
            <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpen()}
                sx={{ mb: 2 }}
            >
                Add Leave Balance
            </Button>

            <DataTable
                columns={columns}
                data={rows}
                pagination
                highlightOnHover
                striped
                responsive
            />

            <Modalbox open={open} onClose={handleClose}>
                <div className="membermodal">
                    <div className='whole'>
                        <div className='modalhead'> {editingId ? "Edit Leave Balance" : "Add Leave Balance"}</div>
                        <form onSubmit={handleSubmit}>
                            <span className="modalcontent ">
                                <div className='flex flex-col gap-3 w-full'>
                                    <FormControl className="w-full mt-4" >
                                        <InputLabel>Select Employee</InputLabel>
                                        <Select
                                        label="Select Employee"
                                            value={form.employeeId}
                                            onChange={setEmployee}
                                        >
                                            <MenuItem value="">Select Employee</MenuItem>
                                            {employee?.map((emp) => (
                                                <MenuItem key={emp._id} value={emp._id}>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar
                                                            src={emp?.profileimage}
                                                            sx={{ width: 24, height: 24 }}
                                                        />
                                                        {emp.userid?.name}
                                                    </div>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <div className="w-full flex justify-between gap-3">
                                        <TextField
                                            margin="dense"
                                            select
                                            size="small"
                                            label="Type"
                                            name="type"
                                            fullWidth
                                            value={form.type}
                                            onChange={handleChange}
                                        >
                                            <MenuItem value="credit">Credit</MenuItem>
                                            <MenuItem value="debit">Debit</MenuItem>
                                        </TextField>

                                        <TextField
                                            margin="dense"
                                            label="No. of Allotted Leaves"
                                            name="amount"
                                            size="small"
                                            type="number"
                                            fullWidth
                                            value={form.amount}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <TextField
                                        margin="dense"
                                        label="Remarks"
                                        name="remarks"
                                        size="small"
                                        multiline
                                        minRows={2}
                                        fullWidth
                                        value={form.remarks}
                                        onChange={handleChange}
                                    />
                                </div>
                            </span>
                        </form>
                        <div className='modalfooter'>
                            <Button variant="outlined" onClick={handleClose}>Cancel</Button>
                            <Button onClick={handleSubmit} variant="contained" color="primary">
                                {editingId ? "Update" : "Save"}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modalbox>
        </Box>
    );
};

export default LeaveBalancePage;
