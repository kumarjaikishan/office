import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import { Box, Tooltip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import {
    LocalizationProvider,
    PickersDay,
    StaticDatePicker,
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EmployeeProfileCard from '../../components/performanceCard';
import { useSelector } from 'react-redux';
import DataTable from 'react-data-table-component';
import { customStyles } from './attandencehelper';
import { BiMessageRoundedError } from 'react-icons/bi';

const AttenPerformance = () => {
    const { userid } = useParams();
    const [user, setuser] = useState({});
    const [employee, setemployee] = useState({});
    const [attandence, setattandence] = useState([]);
    const [loading, setLoading] = useState(true);
    const { setting } = useSelector((state) => state.user);

    const [selectedYear, setSelectedYear] = useState(dayjs().year());
    const [selectedMonth, setSelectedMonth] = useState('all'); // null = all months

    const weeklyOffs = [1]; // Monday off

    // const [hell, sethell] = useState({
    //     present: [],
    //     absent: [],
    //     holiday: [],
    //     leave: [],
    // });
    const [hell, sethell] = useState({
        present: [],
        absent: [],
        leave: [],
        holiday: [],
        short: [],
        overtime: [],
        latearrival: [],
        earlyarrival: [],
        earlyLeave: [],
        lateleave: [],
    });
    useEffect(() => {
        console.log(setting)
    }, [])

    const currentYear = dayjs().year();
    const yearOptions = Array.from({ length: 8 }, (_, i) => currentYear + 1 - i);

    const monthOptions = [
        ...Array.from({ length: 12 }, (_, i) => ({
            label: dayjs().month(i).format('MMMM'),
            value: i,
        })),
    ];

    useEffect(() => {
        if (!userid) return;

        const fetchPerformanceData = async () => {
            const token = localStorage.getItem('emstoken');
            try {
                setLoading(true);
                const res = await axios.get(
                    `${import.meta.env.VITE_API_ADDRESS}employeeAttandence`,
                    {
                        params: { userid },
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                // console.log(res.data.attandence)
                setemployee(res.data.employee);
                setuser(res.data.user);
                setattandence(res.data.attandence);
            } catch (err) {
                console.error('Failed to fetch performance data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPerformanceData();
    }, [userid]);

    useEffect(() => {
        if (!attandence.length || !setting) return;
        console.log(attandence)

        const filtered = attandence.filter((entry) => {
            const entryDate = dayjs(entry.date);
            const matchesYear = entryDate.year() === selectedYear;
            const matchesMonth = selectedMonth === 'all' || entryDate.month() === selectedMonth;
            return matchesYear && matchesMonth;
        });

        const presentDates = [];
        const absentDates = [];
        const leaveDates = [];
        const holidayDates = [];
        const shortDates = [];
        const overtime = [];
        const latearrival = [];
        const earlyarrival = [];
        const earlyLeave = [];
        const lateleave = [];

        filtered.forEach((element) => {
            const date = dayjs(element.date).toDate();
            const status = element.status;

            // Grouping by status
            switch (status) {
                case 'present':
                    presentDates.push(date);
                    break;
                case 'absent':
                    absentDates.push(date);
                    break;
                case 'leave':
                    leaveDates.push(date);
                    break;
                case 'holiday':
                    holidayDates.push(date);
                    break;
                default:
                    break;
            }

            // Skip time-based evaluations for non-working statuses
            if (status !== 'present') return;

            // Safety checks
            const { punchIn, punchOut, workingMinutes } = element;
            if (!punchIn || !punchOut || typeof workingMinutes !== 'number') return;

            // Threshold checks
            const isshort = workingMinutes < setting.workingMinutes.shortDayThreshold;
            const isOvertime = workingMinutes >= setting.workingMinutes.overtimeAfterMinutes;

            // Early/Late arrival thresholds
            const [earlyArrHour, earlyArrMinute] = setting.attendanceRules.considerEarlyEntryBefore.split(':').map(Number);
            const [lateArrHour, lateArrMinute] = setting.attendanceRules.considerLateEntryAfter.split(':').map(Number);
            const earlyArrivalThreshold = dayjs(punchIn).startOf('day').add(earlyArrHour, 'hour').add(earlyArrMinute, 'minute');
            const lateArrivalThreshold = dayjs(punchIn).startOf('day').add(lateArrHour, 'hour').add(lateArrMinute, 'minute');

            if (dayjs(punchIn).isBefore(earlyArrivalThreshold)) earlyarrival.push(date);
            if (dayjs(punchIn).isAfter(lateArrivalThreshold)) latearrival.push(date);

            // Early/Late leave thresholds
            const [earlyLeaveHour, earlyLeaveMinute] = setting.attendanceRules.considerEarlyExitBefore.split(':').map(Number);
            const [lateLeaveHour, lateLeaveMinute] = setting.attendanceRules.considerLateExitAfter.split(':').map(Number);
            const earlyLeaveThreshold = dayjs(punchOut).startOf('day').add(earlyLeaveHour, 'hour').add(earlyLeaveMinute, 'minute');
            const lateLeaveThreshold = dayjs(punchOut).startOf('day').add(lateLeaveHour, 'hour').add(lateLeaveMinute, 'minute');

            if (dayjs(punchOut).isBefore(earlyLeaveThreshold)) earlyLeave.push(date);
            if (dayjs(punchOut).isAfter(lateLeaveThreshold)) lateleave.push(date);

            if (isshort) shortDates.push(date);
            if (isOvertime) overtime.push(date);
        });

        sethell({
            present: presentDates,
            absent: absentDates,
            leave: leaveDates,
            holiday: holidayDates,
            short: shortDates,
            overtime,
            latearrival,
            earlyarrival,
            earlyLeave,
            lateleave,
        });
    }, [attandence, selectedYear, selectedMonth, setting]);


    return (
        <div className="p-4">
            {loading && <p>Loading performance data...</p>}

            <div className="p-2 flex gap-3 rounded shadow bg-white mb-4">

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel id="year-select-label">Year</InputLabel>
                    <Select
                        labelId="year-select-label"
                        value={selectedYear}
                        label="Year"
                        onChange={(e) => {
                            setSelectedYear(e.target.value);
                            setSelectedMonth(null);
                        }}
                    >
                        {yearOptions.map((year) => (
                            <MenuItem key={year} value={year}>
                                {year}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel id="month-select-label">Month</InputLabel>
                    <Select
                        labelId="month-select-label"
                        value={selectedMonth}
                        label="Month"
                        onChange={(e) =>
                            setSelectedMonth(
                                e.target.value === '' ? null : e.target.value
                            )
                        }
                    >
                        <MenuItem value="all">All</MenuItem>
                        {monthOptions.map((month) => (
                            <MenuItem key={month.label} value={month.value ?? ''}>
                                {month.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

            </div>

            {attandence && (
                <>
                    <EmployeeProfileCard
                        employee={employee}
                        user={user}
                        attandence={attandence}
                        hell={hell}
                    />
                    <div className="p-2 flex gap-3 rounded shadow bg-white mb-4">

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel id="year-select-label">Type</InputLabel>
                            <Select
                                // value={selectedYear}
                                label="Type"
                                // onChange={(e) => {
                                //     setSelectedYear(e.target.value);
                                //     setSelectedMonth(null);
                                // }}
                            >
                             <MenuItem value="all">All</MenuItem>
                                <MenuItem value='earlyleave'> Early Leave </MenuItem>
                                <MenuItem value='lateleave'>Late Leave  </MenuItem>
                                <MenuItem value='earlyarrival'>Early Arrival  </MenuItem>
                                <MenuItem value='latearrival'>Late Arrival  </MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel id="month-select-label">Status</InputLabel>
                            <Select
                                // value={selectedMonth}
                                label="Status"
                                // onChange={(e) =>
                                //     setSelectedMonth(
                                //         e.target.value === '' ? null : e.target.value
                                //     )
                                // }
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value='present'> Present </MenuItem>
                                <MenuItem value='leave'>Leave  </MenuItem>
                                <MenuItem value='absent'>Absent  </MenuItem>
                                <MenuItem value='halfday'>Half Day  </MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel id="month-select-label">Over/Short Time</InputLabel>
                            <Select
                                // value={selectedMonth}
                                label="over/short"
                                // onChange={(e) =>
                                //     setSelectedMonth(
                                //         e.target.value === '' ? null : e.target.value
                                //     )
                                // }
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value='overtime'> Overtime </MenuItem>
                                <MenuItem value='short'>Short Time  </MenuItem>
                            </Select>
                        </FormControl>

                    </div>
                    <DataTable
                        columns={columns}
                        data={attandence}
                        pagination
                        selectableRows
                        customStyles={customStyles}
                        highlightOnHover
                        noDataComponent={
                            <div className="flex items-center gap-2 py-6 text-center text-gray-600 text-sm">
                                <BiMessageRoundedError className="text-xl" /> No records found matching your criteria.
                            </div>
                        }
                    />
                    {/* <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Box className="bg-white shadow rounded p-1 w-full max-w-md mx-auto">
                            <StaticDatePicker
                                displayStaticWrapperAs="desktop"
                                value={dayjs()}
                                slots={{
                                    day: (props) => {
                                        const date = props.day;

                                        const isPresent = hell.present.some((d) =>
                                            dayjs(d).isSame(date, 'day')
                                        );
                                        const isLeave = hell.leave.some((d) =>
                                            dayjs(d).isSame(date, 'day')
                                        );
                                        const isAbsent = hell.absent.some((d) =>
                                            dayjs(d).isSame(date, 'day')
                                        );
                                        const isWeeklyOff = weeklyOffs.includes(date.getDay());

                                        const tooltipText =
                                            (isPresent && 'Present') ||
                                            (isLeave && 'Leave') ||
                                            (isWeeklyOff && 'Weekly Off') ||
                                            (isAbsent && 'Absent') ||
                                            '';

                                        return (
                                            <Tooltip title={tooltipText}>
                                                <PickersDay
                                                    {...props}
                                                    sx={{
                                                        ...(isWeeklyOff && {
                                                            backgroundColor: 'gray',
                                                            borderRadius: '50%',
                                                            color: 'white',
                                                        }),
                                                        ...(isPresent && {
                                                            backgroundColor: 'green',
                                                            borderRadius: '50%',
                                                            color: 'white',
                                                        }),
                                                        ...(isAbsent && {
                                                            backgroundColor: 'red',
                                                            borderRadius: '50%',
                                                            color: 'white',
                                                        }),
                                                        ...(isLeave && {
                                                            backgroundColor: 'violet',
                                                            borderRadius: '50%',
                                                            color: 'white',
                                                        }),
                                                    }}
                                                />
                                            </Tooltip>
                                        );
                                    },
                                }}
                            />
                        </Box>
                    </LocalizationProvider> */}
                </>
            )}
        </div>
    );
};

export default AttenPerformance;

const columns = [
    {
        name: "Date",
        selector: (row) => row.date,
        width: '110px'
    },
    {
        name: "Punch In",
        selector: (row) => row.punchIn || '- : -'
    },
    {
        name: "Punch Out",
        selector: (row) => row.punchOut || '-'
    },
    {
        name: "Status",
        selector: (row) => row.status || '-',
        width: '130px'
    },
    {
        name: "Working Hours",
        selector: (row) => row.workingMinutes || '-',
        // width: '130px'
    },
    {
        name: "Action",
        selector: (row) => row.action,
        width: '80px'
    },
]
