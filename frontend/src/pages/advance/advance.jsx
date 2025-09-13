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
    InputAdornment,
    OutlinedInput,
    Typography,
} from "@mui/material";
import axios from "axios";
import { MdDelete, MdEdit } from "react-icons/md";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Modalbox from "../../components/custommodal/Modalbox";
import { IoSearch } from "react-icons/io5";
import { CiFilter } from "react-icons/ci";

const EmployeeAdvancePage = () => {
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [departmentlist, setdepartmentlist] = useState([]);
    const [form, setForm] = useState({
        employeeId: "",
        companyId: "",
        branchId: "",
        empId: "",
        amount: 0,
        type: "given",
        remarks: "",
    });
    const [filters, setFilters] = useState({
        searchText: '',
        branch: 'all',
        department: 'all'
    });
    const [editingId, setEditingId] = useState(null);
    const { employee, advance, branch, department } = useSelector((state) => state.user);

    useEffect(() => {
        if (advance) setRows(advance);
        // fetchData()
    }, [advance]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

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
    const employepic = 'https://res.cloudinary.com/dusxlxlvm/image/upload/v1753113610/ems/assets/employee_fi3g5p.webp'

    const columns = [
        { name: "S.no", selector: (row, ind) => ind + 1, width: "60px" },
        // {
        //     name: "Employee",
        //     selector: (row) => row.employeeId?.userid?.name || "N/A",
        //     sortable: true,
        // },
        {
            name: "Employee",
            selector: (row) => (<div className="flex items-center capitalize gap-3 ">
                <Avatar src={row.profileimage || employepic} alt={row.employeename}>
                    {!row.profileimage && employepic}
                </Avatar>
                <Box>
                    <Typography variant="body2">{row?.userid?.name}</Typography>
                    <p className="t text-[10px] text-gray-600">({row?.designation})</p>
                </Box>
            </div>),
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
        <div className="p-1 md:p-3">
            {/* <h2>Employee Advance Management</h2> */}
            <div className="flex my-3 items-center flex-wrap justify-between gap-2 mt-1 w-full">
                <div className="flex flex-wrap gap-3 justify-between w-full md:w-fit">
                    {/* Search (full on small, shrink on md+) */}
                    <TextField
                        size="small"
                        className="w-[47%] md:w-[160px]"
                        value={filters.searchText}
                        onChange={(e) => handleFilterChange("searchText", e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <IoSearch />
                                </InputAdornment>
                            ),
                        }}
                        label="Search Employee"
                    />

                    {/* Branch (50% on small, shrink on md+) */}
                    <FormControl
                        size="small"
                        className="w-[47%] md:w-[160px]"
                    >
                        <InputLabel>Branch</InputLabel>
                        <Select
                            label="Branch"
                            value={filters.branch}
                            input={
                                <OutlinedInput
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <CiFilter fontSize="small" />
                                        </InputAdornment>
                                    }
                                    label="Branch"
                                />
                            }
                            onChange={(e) => handleFilterChange("branch", e.target.value)}
                        >
                            <MenuItem value="all">All</MenuItem>
                            {branch?.map((list) => (
                                <MenuItem key={list._id} value={list._id}>
                                    {list.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Department (50% on small, shrink on md+) */}
                    <FormControl
                        size="small"
                        className="w-[47%] md:w-[160px]"
                    >
                        <InputLabel>Department</InputLabel>
                        <Select
                            label="Department"
                            disabled={filters.branch === "all"}
                            value={filters.department}
                            input={
                                <OutlinedInput
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <CiFilter fontSize="small" />
                                        </InputAdornment>
                                    }
                                    label="Department"
                                />
                            }
                            onChange={(e) =>
                                handleFilterChange("department", e.target.value)
                            }
                        >
                            <MenuItem value="all">All</MenuItem>
                            {departmentlist.length > 0 ? (
                                departmentlist.map((list) => (
                                    <MenuItem key={list._id} value={list._id}>
                                        {list.department}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>No departments found</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </div>

                <div className="w-full md:w-fit">
                    <Button
                        className="w-full md:w-fit"
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpen()}
                        sx={{ mb: 2 }}
                    >
                        Add Advance
                    </Button>
                </div>
            </div>


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
        </div>
    );
};

export default EmployeeAdvancePage;
