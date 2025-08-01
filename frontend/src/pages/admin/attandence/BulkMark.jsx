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
    openmodal, init, submitHandle, setopenmodal,
    isUpdate, isload, inp, setinp, setisUpdate, dispatch
}) => {
    const { department, branch, employee } = useSelector((state) => state.user);
    const [checkedemployee, setcheckedemployee] = useState([]);
    const [rowData, setRowData] = useState({});
    const [selectedBranch, setselectedBranch] = useState('all')
    const [selecteddepartment, setselecteddepartment] = useState('all');
    const [filteredEmployee, setFilteredEmployee] = useState([]);
    const [attandenceDate, setattandenceDate] = useState(dayjs());

    useEffect(() => {
        // console.log(branch)
        // console.log(department)
        // console.log(employee)
    }, [])
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
            employee.forEach(emp => {
                defaultData[emp._id] = {
                    punchIn: null,
                    punchOut: null,
                    status: 'absent',
                };
            });
            setRowData(defaultData);
        }
    }, [employee]);

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
        setRowData(prev => {
            const updated = {
                ...prev,
                [empId]: {
                    ...prev[empId],
                    [field]: value,
                    status: 'present' // Automatically set status to 'present'
                }
            };
            return updated;
        });

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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (checkedemployee.length === 0) {
            alert("Please select at least one employee.");
            return;
        }

        const selectedData = checkedemployee.map(empId => {
            const { punchIn, punchOut, status } = rowData[empId];

            const data = {
                empId,
                status,
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
            console.log('Bulk Attendance Response:', result);

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
            <div className="membermodal w-[800px]" style={{ width: '800px', maxWidth: '98vw' }}>
                <form onSubmit={handleSubmit}>
                    <h2>Bulk Mark Attendance</h2>
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

                        {/* Attendance Table */}
                        <div className='border border-dashed border-teal-400 rounded w-full h-[60vh]'>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell padding="checkbox">
                                                <Checkbox onChange={handleAllSelect} checked={checkedemployee.length === employee.length} />
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
                                                            <MenuItem value={'absent'}>Absent</MenuItem>
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

                        {/* Action Buttons */}
                        <div className='flex w-full  gap-2 justify-end'>
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
                    </span>
                </form>
            </div>
        </Modalbox>
    );
};

export default BulkMark;
