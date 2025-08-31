import { useEffect, useState, useMemo } from 'react';
import {
    Avatar, Box, Typography, TextField,
    InputAdornment, FormControl, InputLabel, OutlinedInput,
    Select, MenuItem
} from '@mui/material';
import { IoSearch } from "react-icons/io5";
import { CiFilter } from "react-icons/ci";
import DataTable from 'react-data-table-component';
import { BiMessageRoundedError } from "react-icons/bi";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import { useCustomStyles } from "../admin/attandence/attandencehelper";
dayjs.extend(localeData);

const AttendanceReport = () => {
    const [employeelist, setemployeelist] = useState([]);
    const [departmentlist, setdepartmentlist] = useState([]);
    const [filters, setFilters] = useState({
        searchText: '',
        branch: 'all',
        department: 'all',
        month: dayjs().month() + 1, // default current month
        year: dayjs().year()        // default current year
    });

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];


    const { department, branch, employee, attandence, holidays } = useSelector(e => e.user);
    const employepic = 'https://res.cloudinary.com/dusxlxlvm/image/upload/v1753113610/ems/assets/employee_fi3g5p.webp';

    // update department list when branch changes
    useEffect(() => {
        if (filters.branch === "all") {
            setdepartmentlist([]);
        } else {
            setdepartmentlist(department.filter(dep => dep?.branchId?._id === filters.branch));
        }
    }, [filters.branch, department]);

    // build report data
  
    const [basic,setbasic]= useState({
        totalDays:0,
        holidaysCount:0,
        weeklyOff:0,
        workingDays:0,
    })

    useEffect(() => {
        if (employee?.length < 1) return;

        const monthStart = dayjs(`${filters.year}-${filters.month}-01`);
        const isCurrentMonth = monthStart.isSame(dayjs(), "month");
        const monthEnd = isCurrentMonth ? dayjs() : monthStart.endOf("month");
        const totalDays = monthEnd.date();

        // holidays for this month
        const holidayDates = holidays
            ?.filter(h => dayjs(h.date).isSame(monthStart, "month"))
            ?.map(h => dayjs(h.date).format("YYYY-MM-DD")) || [];

        // ✅ Pre-group attendance by employeeId
        const attendanceByEmp = {};
        attandence
            ?.filter(a => dayjs(a.date).isSame(monthStart, "month"))
            .forEach(a => {
                const empId = a.employeeId._id;
                if (!attendanceByEmp[empId]) {
                    attendanceByEmp[empId] = [];
                }
                attendanceByEmp[empId].push(a);
            });

        const data = employee.map((emp, idx) => {
            const empAttendance = attendanceByEmp[emp._id] || [];

            const present = empAttendance.filter(a => a.status === "present").length;
            const absent = empAttendance.filter(a => a.status === "absent").length;
            const leave = empAttendance.filter(a => a.status === "leave").length;
            const weeklyOff = empAttendance.filter(a => a.status === "weekly off").length;
            const holidaysCount = empAttendance.filter(a => a.status === "holiday").length;

            const workingDays = totalDays - weeklyOff - holidaysCount;

            return {
                id: emp._id,
                sno: idx + 1,
                rawname: emp?.userid?.name,
                name: (
                    <div className="flex items-center capitalize gap-3">
                        <Avatar src={emp.profileimage || employepic} alt={emp.employeename} />
                        <Box>
                            <Typography variant="body2">{emp?.userid?.name}</Typography>
                            <p className="text-[10px] text-gray-600">({emp?.designation})</p>
                        </Box>
                    </div>
                ),
                totalDays,
                workingDays,
                weeklyOff,
                holidays: holidaysCount,
                leave,
                absent,
                present
            };
        });

        setemployeelist(data);
    }, [employee, attandence, holidays, filters.month, filters.year]);


    // handle filters
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // search & filter
    const filteredEmployees = useMemo(() => {
        return employeelist.filter(emp => {
            const name = emp.rawname?.toLowerCase() || '';
            const deptId = emp.departmentid || '';
            const branchId = emp.branch || '';

            const nameMatch = filters.searchText.trim() === '' || name.includes(filters.searchText.toLowerCase());
            const deptMatch = filters.department === 'all' || deptId === filters.department;
            const branchMatch = filters.branch === 'all' || branchId === filters.branch;

            return nameMatch && deptMatch && branchMatch;
        });
    }, [employeelist, filters]);

    // datatable columns
    const columns = [
        { name: "S.No", selector: row => row.sno, width: "50px" },
        { name: "Employee", selector: row => row.name, grow: 2 },
        { name: "Total Days", selector: row => row.totalDays },
        { name: "Working Days", selector: row => row.workingDays },
        { name: "Present", selector: row => row.present },
        { name: "Absent", selector: row => row.absent },
        { name: "Leave", selector: row => row.leave },
        { name: "Weekly Off", selector: row => row.weeklyOff },
        { name: "Holidays", selector: row => row.holidays }
    ];

    return (
        <div className='employee p-2'>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center mb-3">
                <TextField
                    size="small"
                    value={filters.searchText}
                    onChange={(e) => handleFilterChange("searchText", e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start"><IoSearch /></InputAdornment>
                        ),
                    }}
                    label="Search Employee"
                />

                {/* Branch */}
                <FormControl size="small" className="min-w-[160px]">
                    <InputLabel>Branch</InputLabel>
                    <Select

                        value={filters.branch}
                        onChange={(e) => handleFilterChange("branch", e.target.value)}
                        input={<OutlinedInput startAdornment={<InputAdornment position="start"><CiFilter /></InputAdornment>} />}
                    >
                        <MenuItem value="all">All</MenuItem>
                        {branch?.map((list) => (
                            <MenuItem key={list._id} value={list._id}>{list.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Department */}
                <FormControl size="small" className="min-w-[160px]">
                    <InputLabel>Department</InputLabel>
                    <Select
                        disabled={filters.branch === "all"}
                        value={filters.department}
                        onChange={(e) => handleFilterChange("department", e.target.value)}
                    >
                        <MenuItem value="all">All</MenuItem>
                        {departmentlist.length > 0 ? (
                            departmentlist.map((list) => (
                                <MenuItem key={list._id} value={list._id}>{list.department}</MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled>No departments found</MenuItem>
                        )}
                    </Select>
                </FormControl>

                {/* Month */}
                <FormControl size="small" className="min-w-[120px]">
                    <InputLabel>Month</InputLabel>
                    <Select
                        value={filters.month}
                        onChange={(e) => handleFilterChange("month", e.target.value)}
                    >
                        {dayjs.months().map((m, idx) => (
                            <MenuItem key={idx + 1} value={idx + 1}>{m}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Year */}
                <FormControl size="small" className="min-w-[100px]">
                    <InputLabel>Year</InputLabel>
                    <Select
                        value={filters.year}
                        onChange={(e) => handleFilterChange("year", e.target.value)}
                    >
                        {Array.from({ length: 5 }, (_, i) => dayjs().year() - 2 + i).map(y => (
                            <MenuItem key={y} value={y}>{y}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>

            {/* Data Table */}
            <div>
                <div className="mb-4 flex gap-6 text-sm text-gray-700">
                    <span>Total Days: {basic.totalDays}</span>
                    <span>Working Days: {basic.workingDays}</span>
                    <span>Weekly Offs: {basic.weeklyOff}</span>
                    <span>Holidays: {basic.holidaysCount}</span>
                </div>

            </div>
            <DataTable
                columns={columns}
                data={filteredEmployees}
                pagination
                customStyles={useCustomStyles()}
                highlightOnHover
                noDataComponent={
                    <div className="flex items-center gap-2 py-6 text-center text-gray-600 text-sm">
                        <BiMessageRoundedError className="text-xl" /> No Employee records found.
                    </div>
                }
            />
        </div>
    );
};

export default AttendanceReport;
