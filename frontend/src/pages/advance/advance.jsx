import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
    Button,
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

const EmployeeAdvancePage = () => {
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        employeeId: "",
        companyId: "",
        branchId: "",
        empId: "",
        amount: 0,
        type: "given",
        remarks: "",
    });
    const [editingId, setEditingId] = useState(null);
    const { employee, advance } = useSelector((state) => state.user);

    useEffect(() => {
        if (advance) setRows(advance);
        // fetchData()
    }, [advance]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleOpen = (row = null) => {
        if (row) {
            setForm({
                employeeId: row.employeeId?._id || "",
                companyId: row.companyId || "",
                branchId: row.branchId || "",
                empId: row.empId || "",
                amount: row.amount,
                type: row.type || "given",
                remarks: row.remarks,
            });
            setEditingId(row._id);
        } else {
            setForm({
                employeeId: "",
                companyId: "",
                branchId: "",
                empId: "",
                amount: 0,
                type: "given",
                remarks: "",
            });
            setEditingId(null);
        }
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleSubmit = async () => {

        // return console.log(form)
        try {
            const token = localStorage.getItem("emstoken");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (editingId) {
                await axios.put(
                    `${import.meta.env.VITE_API_ADDRESS}advance/${editingId}`,
                    form,
                    config
                );
                toast.success("Advance updated");
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_ADDRESS}advance`,
                    form,
                    config
                );
                toast.success("Advance added");
            }

            handleClose();
            fetchData();
        } catch (error) {
            console.error("Error saving advance:", error);
            toast.error(error.response?.data?.message || "Server error");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            try {
                const token = localStorage.getItem("emstoken");
                await axios.delete(
                    `${import.meta.env.VITE_API_ADDRESS}advance/${id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success("Advance deleted");
                fetchData();
            } catch (error) {
                console.error("Error deleting advance:", error);
                toast.error("Failed to delete record");
            }
        }
    };

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("emstoken");
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_ADDRESS}advance`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // console.log(data)
            setRows(data.data);
        } catch (error) {
            console.error("Error fetching advances:", error);
        }
    };

    const setEmployee = (e) => {
        const empId = e.target.value;
        const emp = employee.find((emp) => emp._id === empId);
        if (emp) {
            setForm({
                ...form,
                employeeId: emp._id,
                companyId: emp.companyId,
                branchId: emp.branchId,
                empId: emp.empId,
            });
        }
    };

    const columns = [
        {
            name: "Employee",
            selector: (row) => row.employeeId?.userid?.name || "N/A",
            sortable: true,
        },
        { name: "type", selector: (row) => row.type || "-", sortable: true, width: "120px" },
        { name: "Amount", selector: (row) => row.type == 'given' ? `${row.amount}` : `-${row.amount}`, sortable: true, width: "100px" },
        { name: "Balance", selector: (row) => row.balance, sortable: true, width: "100px" },
        { name: "Remarks", selector: (row) => row.remarks || "-", sortable: true },
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
            width: "120px",
        },
    ];

    return (
        <Box p={2}>
            <h2>Employee Advance Management</h2>
            <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpen()}
                sx={{ mb: 2 }}
            >
                Add Advance
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
                <div className="membermodal w-[500px]">
                    <div className='whole'>
                        <div className='modalhead'> {editingId ? "Edit Advance" : "Add Advance"}</div>
                        <form onSubmit={handleSubmit}>
                            <span className="modalcontent ">
                                <div className='flex flex-col gap-3 w-full'>
                                    <FormControl className="w-full mt-4" size="small">
                                        <InputLabel>Select Employee</InputLabel>
                                        <Select label="select employee" value={form.employeeId} onChange={setEmployee}>
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
                                            size="small"
                                            label="Amount"
                                            name="amount"
                                            type="number"
                                            fullWidth
                                            value={form.amount}
                                            onChange={handleChange}
                                        />

                                        <TextField
                                            margin="dense"
                                            size="small"
                                            select
                                            label="type"
                                            name="type"
                                            fullWidth
                                            value={form.type}
                                            onChange={handleChange}
                                        >
                                            <MenuItem value="given">Given</MenuItem>
                                            <MenuItem value="adjusted">Adjusted</MenuItem>
                                        </TextField>
                                    </div>

                                    <TextField
                                        margin="dense"
                                        multiline
                                        minRows={2}
                                        size="small"
                                        label="Remarks"
                                        name="remarks"
                                        fullWidth
                                        value={form.remarks}
                                        onChange={handleChange}
                                    />
                                </div>
                            </span>
                        </form>
                        <div className='modalfooter'>
                            <Button onClick={handleClose} variant="outlined">Cancel</Button>
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

export default EmployeeAdvancePage;
