import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Paper, Checkbox, Typography, FormControl, Select, MenuItem,
  InputLabel, Button, Avatar,
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
import { cloudinaryUrl } from '../../../utils/imageurlsetter';

const BulkMark = ({
  openmodal, init, setopenmodal,
  isUpdate, isload, setinp, setisUpdate, dispatch
}) => {
  const { department, branch, employee, attandence } = useSelector((state) => state.user);

  const [checkedemployee, setcheckedemployee] = useState([]);
  const [rowData, setRowData] = useState({});
  const [selectedBranch, setselectedBranch] = useState('all');
  const [selecteddepartment, setselecteddepartment] = useState('all');
  const [attandenceDate, setattandenceDate] = useState(dayjs());

  const [toall, settoall] = useState({
    punchIn: null,
    punchOut: null,
    status: 'absent'
  });

  // 🔹 Filter employees based on branch & department
  const filteredEmployee = useMemo(() => {
    return employee?.filter(e => {
      const isactive = e?.status !== false;
      const matchBranch = selectedBranch !== "all" ? e.branchId == selectedBranch : true;
      const matchDepartment = selecteddepartment !== "all" ? e.department.department == selecteddepartment : true;
      return matchBranch && matchDepartment && isactive;
    }) || [];
  }, [employee, selectedBranch, selecteddepartment]);

  // 🔹 Get attendance of selected date
  const alreadyAttendance = useMemo(() => {
    if (!attandenceDate || !employee?.length) return [];
    return attandence.filter(e =>
      dayjs(e.date).isSame(dayjs(attandenceDate), "day")
    );
  }, [attandenceDate, attandence, employee]);

  // 🔹 Default row data setup
  const defaultRowData = useMemo(() => {
    if (!employee?.length) return { data: {}, checked: [] };

    const data = {};
    const checked = [];

    employee.forEach(emp => {
      const existing = alreadyAttendance.find(a => a.employeeId._id === emp._id);
      if (existing) {
        checked.push(emp._id);
        data[emp._id] = {
          punchIn: existing.punchIn ? dayjs(existing.punchIn).format("HH:mm") : null,
          punchOut: existing.punchOut ? dayjs(existing.punchOut).format("HH:mm") : null,
          status: existing.status || "absent",
        };
      } else {
        data[emp._id] = {
          punchIn: null,
          punchOut: null,
          status: "absent",
        };
      }
    });

    return { data, checked };
  }, [employee, alreadyAttendance]);

  useEffect(() => {
    setRowData(defaultRowData.data);
    setcheckedemployee(defaultRowData.checked);
  }, [defaultRowData]);

  // 🔹 Apply-to-all
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

    setcheckedemployee(filteredEmployee.map(e => e._id));
  }, [toall, filteredEmployee]);

  // 🔹 Handlers (memoized)
  const handleCheckbox = useCallback((empId) => {
    setcheckedemployee(prev =>
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  }, []);

  const handleAllSelect = useCallback((e) => {
    if (e.target.checked) {
      setcheckedemployee(employee.map(e => e._id));
    } else {
      setcheckedemployee([]);
    }
  }, [employee]);

  const handleTimeChange = useCallback((empId, field, value) => {
    setRowData(prev => {
      const updated = {
        ...prev,
        [empId]: {
          ...prev[empId],
          [field]: value,
          status: ['weekly off', 'holiday', 'half day'].includes(prev[empId].status)
            ? prev[empId].status
            : 'present',
        }
      };
      return updated;
    });

    setcheckedemployee(prev =>
      prev.includes(empId) ? prev : [...prev, empId]
    );
  }, []);

  const handleStatusChange = useCallback((empId, value) => {
    setRowData(prev => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        status: value
      }
    }));

    setcheckedemployee(prev =>
      prev.includes(empId) ? prev : [...prev, empId]
    );
  }, []);

  // 🔹 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (checkedemployee.length === 0) {
      toast.info("Please Mark at least one employee.");
      return;
    }

    const selectedData = checkedemployee.map(employeeId => {
      const { punchIn, punchOut, status } = rowData[employeeId];
      const { branchId, empId } = employee.find(e => e._id === employeeId);

      // return console.log(branchId,empId)

      const data = {
        employeeId,
        empId,
        status,
        branchId,
        date: attandenceDate.toISOString(),
      };

      if (punchIn != null) {
        data.punchIn = new Date(`${attandenceDate.format('YYYY-MM-DD')}T${punchIn}`).toISOString();
      }
      if (punchOut != null) {
        data.punchOut = new Date(`${attandenceDate.format('YYYY-MM-DD')}T${punchOut}`).toISOString();
      }
      return data;
    });

    // return console.log(selectedData)

    try {
      const token = localStorage.getItem('emstoken');
      setisUpdate(true);
      const response = await fetch(`${import.meta.env.VITE_API_ADDRESS}bulkMarkAttendance`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attendanceRecords: selectedData }),
      });

      if (!response.ok) throw new Error('Failed to submit attendance');
      await response.json();

      dispatch(FirstFetch());
      setcheckedemployee([]);
      setattandenceDate(dayjs());
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
    <Modalbox open={openmodal} outside={false} onClose={() => setopenmodal(false)}>
      <div className="membermodal w-[600px] md:w-[800px]">
        <form onSubmit={handleSubmit}>
          <div className="modalhead">Bulk Mark Attendance</div>
          <span className="modalcontent overflow-x-auto">
            <div className='flex flex-col gap-4'>
              {/* 🔹 Filters */}
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

                <FormControl size="small" disabled={selectedBranch === 'all'} fullWidth>
                  <InputLabel>Select Department</InputLabel>
                  <Select
                    label="Select Department"
                    value={selecteddepartment}
                    onChange={(e) => setselecteddepartment(e.target.value)}
                  >
                    <MenuItem value="all"><em>All</em></MenuItem>
                    {(selectedBranch !== 'all'
                      ? department.filter(i => i.branchId._id === selectedBranch)
                      : department
                    )?.map((d, i) => (
                      <MenuItem key={i} value={d._id}>{d.department}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    slotProps={{ textField: { size: 'small' } }}
                    onChange={(newValue) => setattandenceDate(newValue)}
                    format="DD-MM-YYYY"
                    value={attandenceDate}
                    sx={{ width: '100%' }}
                    label="Select date"
                    maxDate={dayjs()}
                  />
                </LocalizationProvider>
              </div>

              {/* 🔹 Apply to All */}
              <div className="relative border-dashed border border-primary rounded-md w-full grid grid-cols-1 md:grid-cols-3 gap-4 p-2 pt-4">
                <span className="absolute top-0 left-3 -translate-y-1/2 bg-white px-2 text-sm font-medium text-primary">
                  Apply To All Fields
                </span>

                <div className="flex flex-col w-full">
                  <label className="text-sm font-medium text-gray-700 mb-1 text-left">Punch In</label>
                  <input
                    type="time"
                    className="w-full form-input outline-0 border border-primary border-dashed p-2 rounded"
                    value={toall.punchIn || ""}
                    onChange={(e) => settoall({ ...toall, punchIn: e.target.value })}
                  />
                </div>

                <div className="flex flex-col w-full">
                  <label className="text-sm font-medium text-gray-700 mb-1 text-left">Punch Out</label>
                  <input
                    type="time"
                    className="w-full form-input outline-0 border border-primary border-dashed p-2 rounded"
                    value={toall.punchOut || ""}
                    onChange={(e) => settoall({ ...toall, punchOut: e.target.value })}
                  />
                </div>

                <div className="flex flex-col w-full">
                  <label className="text-sm font-medium text-gray-700 mb-1 text-left">Status</label>
                  <FormControl size="small" className="w-full">
                    <Select
                      value={toall.status}
                      onChange={(e) => settoall({ ...toall, status: e.target.value })}
                      className="w-full"
                    >
                      <MenuItem value="present">Present</MenuItem>
                      <MenuItem value="leave">Leave</MenuItem>
                      <MenuItem value="absent">Absent</MenuItem>
                      <MenuItem value="weekly off">Weekly Off</MenuItem>
                      <MenuItem value="holiday">Holiday</MenuItem>
                      <MenuItem value="half day">Half Day</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>

              {/* 🔹 Employee Table */}
              <div className='border border-dashed border-primary rounded w-full '>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            onChange={handleAllSelect}
                            checked={checkedemployee?.length === employee?.length}
                          />
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
                            <div className="flex items-center gap-2">
                              <Avatar
                                alt={emp.userid.name}
                                // src={emp.profileimage}
                                src={cloudinaryUrl(emp.profileimage, {
                                  format: "webp",
                                  width: 100,
                                  height: 100,
                                })}
                                sx={{ width: 30, height: 30 }}
                              />
                              <Typography variant="body2">{emp.userid.name}</Typography>
                            </div>
                          </TableCell>

                          <TableCell>
                            <input
                              type="time"
                              className="form-input outline-0 border-1 border-primary border-dashed p-1 rounded"
                              value={rowData[emp._id]?.punchIn || ""}
                              onChange={(e) => handleTimeChange(emp._id, "punchIn", e.target.value)}
                            />
                          </TableCell>

                          <TableCell>
                            <input
                              type="time"
                              className="form-input outline-0 border-1 border-primary border-dashed p-1 rounded"
                              value={rowData[emp._id]?.punchOut || ""}
                              onChange={(e) => handleTimeChange(emp._id, "punchOut", e.target.value)}
                            />
                          </TableCell>

                          <TableCell>
                            <FormControl fullWidth size="small">
                              <Select
                                value={rowData[emp._id]?.status ?? ""}
                                onChange={(e) => handleStatusChange(emp._id, e.target.value)}
                              >
                                <MenuItem value="present">Present</MenuItem>
                                <MenuItem value="leave">Leave</MenuItem>
                                <MenuItem value="absent">Absent</MenuItem>
                                <MenuItem value="weekly off">Weekly off</MenuItem>
                                <MenuItem value="holiday">Holiday</MenuItem>
                                <MenuItem value="half day">Half Day</MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
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
