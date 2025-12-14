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
    Autocomplete,
} from "@mui/material";
import axios from "axios";
import { MdClear, MdDelete, MdEdit } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Modalbox from "../../components/custommodal/Modalbox";
import { IoSearch } from "react-icons/io5";
import { CiFilter } from "react-icons/ci";
import { FirstFetch } from "../../../store/userSlice";
import { cloudinaryUrl } from "../../utils/imageurlsetter";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";

const EmployeeAdvancePage = () => {
    const paramEmployeeId = new URLSearchParams(window.location.search).get("employeeId");
    const dispatch = useDispatch();

    const { employee, advance, branch } = useSelector((state) => state.user);

    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [branchEmp, setbranchEmp] = useState([])
    const [loading, setloading] = useState(false)

    const [selectedEmployeeId, setSelectedEmployeeId] = useState(
        paramEmployeeId || "all"
    );

    const [filters, setFilters] = useState({
        branch: "all",
    });

    const [form, setForm] = useState({
        employeeId: "",
        companyId: "",
        branchId: "",
        empId: "",
        amount: 0,
        type: "given",
        remarks: "",
    });

    /* -------------------- LOAD DATA -------------------- */

    useEffect(() => {
        // console.log(advance)
        if (advance) setRows(advance);
    }, [advance]);

    useEffect(() => {
        if (filters.branch == 'all') {
            setbranchEmp(employee)
        } else {
            const filtered = employee.filter((val) => val.branchId == filters.branch);
            // console.log(filtered)
            setbranchEmp(filtered)
        }
    }, [filters.branch]);

    useEffect(() => {
        if (paramEmployeeId) {
            setSelectedEmployeeId(paramEmployeeId);
        }
    }, [paramEmployeeId]);

    const selectedEmployee =
        selectedEmployeeId !== "all"
            ? employee?.find((e) => e._id === selectedEmployeeId)
            : null;

    /* -------------------- FILTERING -------------------- */

    const filteredEmployees = rows?.filter((row) => {
        const branchMatch =
            filters.branch === "all" || row.branchId === filters.branch;

        const employeeMatch =
            row.employeeId?._id === selectedEmployeeId;

        return branchMatch && employeeMatch;
    });

    /* -------------------- HANDLERS -------------------- */

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    // const handleEmployeeSelect = (e) => {
    //     console.log(e.target.value)
    //     setSelectedEmployeeId(e.target.value);
    // };
    const handleEmployeeSelect = (e) => {
        const empId = e.target.value;
        setSelectedEmployeeId(empId);

        const url = new URL(window.location.href);

        if (empId === "all") {
            url.searchParams.delete("employeeId");
        } else {
            url.searchParams.set("employeeId", empId);
        }

        window.history.replaceState({}, "", url);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setloading(true)
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

            dispatch(FirstFetch());
            handleClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Server error");
        } finally {
            setloading(false)
        }
    };

    const handleDelete = async (id) => {
        // if (!window.confirm("Are you sure you want to delete this record?")) return;

        swal({
            title: `Are you sure to Delete this entry?`,
            text: 'Once deleted, you will not be able to recover this',
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(async (proceed) => {
            if (proceed) {
                try {
                    const token = localStorage.getItem("emstoken");
                    await axios.delete(
                        `${import.meta.env.VITE_API_ADDRESS}advance/${id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    toast.success("Advance deleted");
                    dispatch(FirstFetch());
                } catch {
                    toast.error("Failed to delete record");
                }
            }
        });
    };

    const setEmployee = (e) => {
        const emp = employee.find((emp) => emp._id === e.target.value);
        if (!emp) return;

        setForm({
            ...form,
            employeeId: emp._id,
            companyId: emp.companyId,
            branchId: emp.branchId,
            empId: emp.empId,
        });
    };

    /* -------------------- TABLE -------------------- */

    const columns = [
        { name: "S.no", selector: (_, i) => i + 1, width: "60px" },
        // {
        //     name: "Employee",
        //     selector: (row) => (
        //         <div className="flex items-center gap-3">
        //             <Avatar
        //                 src={cloudinaryUrl(row?.employeeId?.profileimage)}
        //             />
        //             <Box>
        //                 <Typography variant="body2">
        //                     {row?.employeeId?.userid?.name}
        //                 </Typography>
        //                 <p className="text-[10px] text-gray-600">
        //                     ({row?.employeeId?.designation})
        //                 </p>
        //             </Box>
        //         </div>
        //     ),
        // },
        { name: "Date", selector: (r) => dayjs(r.date).format('DD MMM, YYYY'),width: "120px" },
        { name: "Remarks", selector: (r) => r.remarks || "-" },
        { name: "Given", selector: (r) => (r.type === "given" ? r.amount : "-"),width: "90px" },
        {
            name: "Adjusted",
            selector: (r) => (r.type === "adjusted" ? r.amount : "-"),
            width: "90px"
        },
        { name: "Balance", selector: (r) => r.balance, width: "100px" },
        
        {
            name: "Actions",
            cell: (row) =>
                !row.payrollId && (
                    <>
                        <IconButton onClick={() => handleOpen(row)}>
                            <MdEdit />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(row._id)}>
                            <MdDelete />
                        </IconButton>
                    </>
                ),
                width: "140px"
        },
    ];

    /* -------------------- RENDER -------------------- */

    return (
        <div className="p-3 max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-3 mb-3">

                <FormControl size="small" className="w-[160px]">
                    <InputLabel>Branch</InputLabel>
                    <Select
                        value={filters.branch}
                        onChange={(e) => handleFilterChange("branch", e.target.value)}
                        label="Branch"
                    >
                        <MenuItem value="all">All</MenuItem>
                        {branch?.map((b) => (
                            <MenuItem key={b._id} value={b._id}>
                                {b.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Autocomplete
                    size="small"
                    className="w-[350px]"
                    // options={employee || []}
                    options={branchEmp || []}
                    getOptionLabel={(option) =>
                        option
                            ? `${option.userid?.name || ""} (${option.empId || option.empCode || ""})`
                            : ""
                    }

                    value={
                        selectedEmployeeId === "all"
                            ? null
                            : employee.find((emp) => emp._id === selectedEmployeeId) || null
                    }
                    onChange={(event, newValue) => {
                        handleEmployeeSelect({
                            target: { value: newValue ? newValue._id : "all" },
                        });
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Employee"
                            placeholder="Search employee"
                        />
                    )}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                    clearOnEscape
                />

                <Button variant="contained" onClick={() => handleOpen()}>
                    Add Advance
                </Button>
            </div>

            {/* showing seelcted employee details */}
            {selectedEmployee && (
                <div className="flex items-center gap-4 p-3 mb-3 rounded border border-gray-400 bg-gray-50">

                    <Avatar sx={{ width: 55, height: 55 }}
                        alt={selectedEmployee.userid?.name}
                        // src={profile}
                        src={cloudinaryUrl(selectedEmployee.profileimage, {
                            format: "webp",
                            width: 100,
                            height: 100,
                        })}
                    />

                    <div className="flex flex-col leading-tight">
                        <span className="text-base font-medium capitalize text-gray-800">
                            {selectedEmployee.userid?.name}
                        </span>

                        <span className="text-sm text-gray-600">
                            {selectedEmployee.designation}
                        </span>

                        <span className="text-xs text-gray-500">
                            Emp ID: {selectedEmployee.empId}
                        </span>
                    </div>
                </div>
            )}

            <DataTable
                columns={columns}
                data={filteredEmployees}
                pagination
                striped
                noDataComponent={
                    <div className="py-4 my-2 text-center text-gray-500  font-semibold">
                        {!selectedEmployee
                            ? "Please select an employee"
                            : "No record found"}
                    </div>
                }

            />

            <Modalbox open={open} outside={false} onClose={handleClose}>
                <div className="membermodal w-[500px]">
                    <div className='whole'>
                        <div className='modalhead'> {editingId ? "Edit Advance" : "Add Advance"}</div>
                        <form onSubmit={handleSubmit}>
                            <span className="modalcontent ">
                                <div className='flex flex-col gap-3 w-full'>
                                    <FormControl  required className="w-full mt-4" size="small">
                                        <InputLabel>Select Employee</InputLabel>
                                        <Select required label="select employee" value={form.employeeId} onChange={setEmployee}>
                                            <MenuItem value="">Select Employee</MenuItem>
                                            {employee?.map((emp) => (
                                                <MenuItem key={emp._id} value={emp._id}>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar
                                                            // src={emp?.profileimage}
                                                            src={cloudinaryUrl(emp?.profileimage, {
                                                                format: "webp",
                                                                width: 100,
                                                                height: 100,
                                                            })}
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
                        <div className='modalfooter'>
                            <Button onClick={handleClose} variant="outlined">Cancel</Button>
                            <Button loading={loading} type="submit" variant="contained" color="primary">
                                {editingId ? "Update" : "Save"}
                            </Button>
                        </div>
                        </form>
                    </div>
                </div>
            </Modalbox>
        </div>
    );
};

export default EmployeeAdvancePage;
