import React, { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Checkbox, Typography, FormControl, Select, MenuItem,
    InputLabel, Button, Avatar
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { IoIosSend } from "react-icons/io";
import { useSelector } from 'react-redux';
import Modalbox from '../../../components/custommodal/Modalbox';
import dayjs from 'dayjs';

const BulkMark = ({
    openmodal, init, submitHandle, setopenmodal,
    isUpdate, isload, inp, setinp, setisUpdate
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
        console.log(employee)
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

    const handleSubmit = (e) => {
        e.preventDefault();
        const selectedData = checkedemployee.map(empId => {
            const { punchIn, punchOut, status } = rowData[empId];

            const data = {
                empId,
                status,
                date: attandenceDate,
            };

            // Only include punchOut if it's not null or undefined
            if (punchIn != null) {
                data.punchIn = punchIn;
            }
            if (punchOut != null) {
                data.punchOut = punchOut;
            }

            return data;
        });

        console.log(selectedData)
        // submitHandle(selectedData);
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

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Select Date"
                                    format="DD/MM/YYYY"
                                    value={attandenceDate}
                                    onChange={(newValue) => setattandenceDate(newValue)}
                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                />
                            </LocalizationProvider>

                        </div>

                        {/* Attendance Table */}
                        <div className='border border-dashed border-teal-400 rounded w-full h-[350px]'>
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
                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                        <TimePicker
                                                            sx={{ width: "140px" }}
                                                            value={rowData[emp._id]?.punchIn}
                                                            onChange={(value) => handleTimeChange(emp._id, 'punchIn', value)}
                                                            slotProps={{ textField: { size: 'small' } }}
                                                        />
                                                    </LocalizationProvider>
                                                </TableCell>
                                                <TableCell>
                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                        <TimePicker
                                                            sx={{ width: "140px" }}
                                                            value={rowData[emp._id]?.punchOut}
                                                            onChange={(value) => handleTimeChange(emp._id, 'punchOut', value)}
                                                            slotProps={{ textField: { size: 'small' } }}
                                                        />
                                                    </LocalizationProvider>
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
