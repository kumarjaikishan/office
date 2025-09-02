import React, { useEffect, useState } from 'react';
import {

    Paper, Checkbox, Typography, FormControl, Select, MenuItem,
    InputLabel, Button, Avatar,
    TextField
} from '@mui/material';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { IoIosSend } from "react-icons/io";
import { useSelector } from 'react-redux';
import Modalbox from '../../../components/custommodal/Modalbox';
import dayjs from 'dayjs';
import { FirstFetch } from '../../../../store/userSlice';
import { toast } from 'react-toastify';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const BulkMark = ({
    openmodal, init, setopenmodal,
    isUpdate, isload, setinp, setisUpdate, dispatch
}) => {
    const { company, holidays, department, branch, employee, attandence } = useSelector((state) => state.user);
    const [checkedemployee, setcheckedemployee] = useState([]);
    const [rowData, setRowData] = useState({});
    const [selectedBranch, setselectedBranch] = useState('all')
    const [selecteddepartment, setselecteddepartment] = useState('all');
    const [filteredEmployee, setFilteredEmployee] = useState([]);
    const [attandenceDate, setattandenceDate] = useState(dayjs());
    const [alreadyAttendance, setalreadyAttendance] = useState([])

    useEffect(() => {
        // console.log(company?.weeklyOffs)
        // console.log(holidays)
        // console.log(department)
        // console.log(attandence)
        // console.log(rowData)
    }, [])

    useEffect(() => {
        if (!attandenceDate || !employee?.length) return;

        const selectedDateAttendance = attandence.filter(e =>
            dayjs(e.date).isSame(dayjs(attandenceDate), "day")
        );
        setalreadyAttendance(selectedDateAttendance)

    }, [attandenceDate, attandence, employee]);


    const [toall, settoall] = useState({
        punchIn: null,
        punchOut: null,
        status: 'sel'
    })

    useEffect(() => {
        if (!toall || Object.keys(toall).length === 0) return;

        setRowData(prev => {
            const updated = { ...prev };

            Object.keys(updated).forEach(empId => {
                updated[empId] = {
                    ...updated[empId],
                    ...(toall.punchIn && { punchIn: toall.punchIn }),
                    ...(toall.punchOut && { punchOut: toall.punchOut }),
                    ...(toall.status && { status: toall.status }),
                };
            });

            return updated;
        });
    }, [toall]);


    useEffect(() => {
        const result = employee?.filter(e => {
            const matchBranch = selectedBranch !== "all" ? e.branchId == selectedBranch : true;
            const matchDepartment = selecteddepartment !== "all" ? e.department.department == selecteddepartment : true;
            return matchBranch && matchDepartment;
        });
        setFilteredEmployee(result);
    }, [employee, selectedBranch, selecteddepartment]);

    useEffect(() => {
        if (employee?.length > 0) {
            const defaultData = {};
            const checked = [];

            employee.forEach(emp => {
                // find if this employee already has attendance for the selected date
                const existing = alreadyAttendance.find(a => a.employeeId._id === emp._id);

                if (existing) {
                    // mark employee as checked
                    checked.push(emp._id);

                    // prefill with existing attendance
                    defaultData[emp._id] = {
                        punchIn: existing.punchIn ? dayjs(existing.punchIn).format("HH:mm") : null,
                        punchOut: existing.punchOut ? dayjs(existing.punchOut).format("HH:mm") : null,
                        status: existing.status || "absent",
                    };
                } else {
                    // fallback if no record found
                    defaultData[emp._id] = {
                        punchIn: null,
                        punchOut: null,
                        status: "absent",
                    };
                }
            });

            setRowData(defaultData);
            setcheckedemployee(checked);
        }
    }, [employee, alreadyAttendance]);

    const handleCheckbox = (empId) => {
        if (checkedemployee.includes(empId)) {
            setcheckedemployee(checkedemployee.filter(id => id !== empId));
        } else {
            setcheckedemployee([...checkedemployee, empId]);
        }
    };

    const handleAllSelect = (e) => {
        if (e.target.checked) {
            setcheckedemployee(employee.map(e => e._id));
        } else {
            setcheckedemployee([]);
        }
    };

    const handleTimeChange = (empId, field, value) => {
        // if()
        // console.log(rowData[empId])
        if (['weekly off', 'holiday', 'half day'].includes(rowData[empId].status)) {
            setRowData(prev => {
                const updated = {
                    ...prev,
                    [empId]: {
                        ...prev[empId],
                        [field]: value,
                    }
                };
                return updated;
            });
        } else {
            setRowData(prev => {
                const updated = {
                    ...prev,
                    [empId]: {
                        ...prev[empId],
                        [field]: value,
                        status: 'present'
                    }
                };
                return updated;
            });
        }


        setcheckedemployee(prev => {
            if (!prev.includes(empId)) {
                return [...prev, empId]; // Automatically check the row
            }
            return prev;
        });
    };

    const handleStatusChange = (empId, value) => {
        setRowData(prev => ({
            ...prev,
            [empId]: {
                ...prev[empId],
                status: value
            }
        }));

        setcheckedemployee(prev => {
            if (!prev.includes(empId)) {
                return [...prev, empId]; // Automatically check the row
            }
            return prev;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (checkedemployee.length === 0) {
            alert("Please select at least one employee.");
            return;
        }

        const selectedData = checkedemployee.map(empId => {
            const { punchIn, punchOut, status } = rowData[empId];
            const branchId = employee.filter(e => e._id == empId)[0].branchId;
            // console.log(branchid)

            const data = {
                empId,
                status,
                branchId,
                date: attandenceDate.toISOString(), // Ensure ISO string for backend
            };

            if (punchIn != null) {
                data.punchIn = new Date(`${attandenceDate.format('YYYY-MM-DD')}T${punchIn}`).toISOString();
            }
            if (punchOut != null) {
                data.punchOut = new Date(`${attandenceDate.format('YYYY-MM-DD')}T${punchOut}`).toISOString();
            }

            return data;
        });

        //  console.log(rowData)
        // return console.log(selectedData)
        try {
            const token = localStorage.getItem('emstoken')
            setisUpdate(true); // Show loading state
            const response = await fetch(`${import.meta.env.VITE_API_ADDRESS}bulkMarkAttendance`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ attendanceRecords: selectedData }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit attendance');
            }

            const result = await response.json();
            // console.log('Bulk Attendance Response:', result);

            // Reset form
            // setinp(init);
            dispatch(FirstFetch());
            setcheckedemployee([]);
            setattandenceDate(dayjs())
            setopenmodal(false);
            setisUpdate(false);
            toast.success('Attendance marked successfully.');

        } catch (error) {
            console.error('Bulk Attendance Error:', error);
            alert('Failed to mark attendance. Please try again.');
            setisUpdate(false);
        }
    };


    return (
        <Modalbox open={openmodal} onClose={() => setopenmodal(false)}>
            <div className="membermodal w-[400px] md:w-[800px]">
                <form onSubmit={handleSubmit}>
                    <div className="modalhead">Bulk Mark Attendance</div>
                    <span className="modalcontent overflow-x-auto">
                        {/* Top Filters */}
                        <div className='w w-full flex justify-between gap-2'>
                            <FormControl size="small" fullWidth>
                                <InputLabel>Select Branch</InputLabel>
                                <Select
                                    label="Select Branch"
                                    value={selectedBranch}
                                    onChange={(e) => setselectedBranch(e.target.value)}
                                >
                                    <MenuItem value="all"><em>All</em></MenuItem>
                                    {branch?.map((b, i) => (
                                        <MenuItem key={i} value={b._id}>{b.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl size="small" disabled={selectedBranch == 'all'} fullWidth>
                                <InputLabel>Select Department</InputLabel>
                                <Select
                                    label="Select Department"
                                    value={selecteddepartment}
                                    onChange={(e) => setselecteddepartment(e.target.value)}
                                >
                                    <MenuItem value="all"><em>All</em></MenuItem>
                                    {
                                        (selectedBranch !== 'all'
                                            ? department.filter(i => i.branchId._id === selectedBranch)
                                            : department
                                        )?.map((d, i) => (
                                            <MenuItem key={i} value={d._id}>{d.department}</MenuItem>
                                        ))
                                    }

                                </Select>
                            </FormControl>

                            {/* <TextField
                                size="small"
                                fullWidth
                                type="date"
                                label="Search Employee"
                                value={attandenceDate.format('YYYY-MM-DD')}
                                onChange={(e) => setattandenceDate(dayjs(e.target.value))}
                                InputLabelProps={{ shrink: true }}
                            /> */}
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    slotProps={{
                                        textField: {
                                            size: 'small',
                                        },
                                    }}
                                    onChange={(newValue) => {
                                        setattandenceDate(newValue)
                                    }}
                                    format="DD-MM-YYYY"
                                    value={attandenceDate}
                                    sx={{ width: '100%' }}
                                    label="Select date"
                                />
                            </LocalizationProvider>
                        </div>

                        <div className="relative border-dashed border border-teal-500 rounded-md w-full grid grid-cols-1 md:grid-cols-3 gap-4 p-2 pt-4">
                            <span className="absolute top-0 left-3 -translate-y-1/2 bg-white px-2 text-sm font-medium text-teal-600">
                                Apply To All Fields
                            </span>

                            {/* Punch In */}
                            <div className="flex flex-col w-full">
                                <label htmlFor="punchIn" className="text-sm font-medium text-gray-700 mb-1 text-left">
                                    Punch In
                                </label>
                                <input
                                    type="time"
                                    id="punchIn"
                                    name="punchIn"
                                    className="w-full form-input outline-0 border border-teal-500 border-dashed p-2 rounded"
                                    value={toall.punchIn || ""}
                                    onChange={(e) => settoall({ ...toall, punchIn: e.target.value })}
                                />
                            </div>

                            {/* Punch Out */}
                            <div className="flex flex-col w-full">
                                <label htmlFor="punchOut" className="text-sm font-medium text-gray-700 mb-1 text-left">
                                    Punch Out
                                </label>
                                <input
                                    type="time"
                                    id="punchOut"
                                    name="punchOut"
                                    className="w-full form-input outline-0 border border-teal-500 border-dashed p-2 rounded"
                                    value={toall.punchOut || ""}
                                    onChange={(e) => settoall({ ...toall, punchOut: e.target.value })}
                                />
                            </div>

                            {/* Status */}
                            <div className="flex flex-col w-full">
                                <label htmlFor="status" className="text-sm font-medium text-gray-700 mb-1 text-left">
                                    Status
                                </label>
                                <FormControl size="small" className="w-full">
                                    <Select
                                        id="status"
                                        name="status"
                                        value={toall.status}
                                        onChange={(e) => settoall({ ...toall, status: e.target.value })}
                                        className="w-full"
                                    >
                                        <MenuItem value={"sel"} disabled>Select Status</MenuItem>
                                        <MenuItem value={"present"}>Present</MenuItem>
                                        <MenuItem value={"leave"}>Leave</MenuItem>
                                        <MenuItem value={"absent"}>Absent</MenuItem>
                                        <MenuItem value={"weekly off"}>Weekly Off</MenuItem>
                                        <MenuItem value={"holiday"}>Holiday</MenuItem>
                                        <MenuItem value={"half day"}>Half Day</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                        </div>





                        {/* Attendance Table */}
                        <div className='border border-dashed border-teal-400 rounded w-full '>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell padding="checkbox">
                                                <Checkbox onChange={handleAllSelect} checked={checkedemployee?.length === employee?.length} />
                                            </TableCell>
                                            <TableCell>Employee Name</TableCell>
                                            <TableCell>Punch In</TableCell>
                                            <TableCell>Punch Out</TableCell>
                                            <TableCell>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredEmployee?.map((emp) => (
                                            <TableRow key={emp._id}>
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={checkedemployee.includes(emp._id)}
                                                        onChange={() => handleCheckbox(emp._id)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className='flex items-center gap-2'>
                                                        <Avatar
                                                            alt={emp.userid.name}
                                                            src={emp.profileimage}
                                                            sx={{ width: 30, height: 30 }}
                                                        />
                                                        <Typography variant="body2">{emp.userid.name}</Typography>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <input
                                                        type="time"
                                                        className="form-input outline-0 border-1 border-teal-500 border-dashed p-1 rounded"
                                                        value={rowData[emp._id]?.punchIn || ''}
                                                        onChange={(e) => handleTimeChange(emp._id, 'punchIn', e.target.value)}
                                                    />

                                                </TableCell>
                                                <TableCell>
                                                    <input
                                                        type="time"
                                                        className="form-input outline-0 border-1 border-teal-500 border-dashed p-1 rounded"
                                                        value={rowData[emp._id]?.punchOut || ''}
                                                        onChange={(e) => handleTimeChange(emp._id, 'punchOut', e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <FormControl fullWidth size="small">
                                                        <Select
                                                            value={rowData[emp._id]?.status ?? false}
                                                            onChange={(e) => handleStatusChange(emp._id, e.target.value)}
                                                        >
                                                            <MenuItem value={'present'}>Present</MenuItem>
                                                            <MenuItem value={'leave'}>Leave</MenuItem>
                                                            <MenuItem value={'absent'}>Absent</MenuItem>
                                                            <MenuItem value={'weekly off'}>Weekly off</MenuItem>
                                                            <MenuItem value={'holiday'}>Holiday</MenuItem>
                                                            <MenuItem value={'half day'}>Half Day</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    </span>
                    <div className='modalfooter'>
                        <Button
                            size="small"
                            onClick={() => {
                                setopenmodal(false);
                                setisUpdate(false);
                                setinp(init);
                            }}
                            variant="outlined"
                        >
                            Cancel
                        </Button>

                        <Button
                            loading={isload}
                            loadingPosition="end"
                            endIcon={<IoIosSend />}
                            variant="contained"
                            type="submit"
                        >
                            {isUpdate ? 'Update' : 'Add'}
                        </Button>
                    </div>
                </form>
            </div>
        </Modalbox>
    );
};

export default BulkMark;
