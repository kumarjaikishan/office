import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import { Box, Tooltip, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';
import { BiMessageRoundedError } from 'react-icons/bi';
import DataTable from 'react-data-table-component';
import { useSelector } from 'react-redux';
import EmployeeProfileCard from '../../components/performanceCard';
import { customStyles } from './attandencehelper';
import { RxReset } from "react-icons/rx";
import { IoMdTime } from 'react-icons/io';

const AttenPerformance = () => {
    const { userid } = useParams();
    const [user, setuser] = useState({});
    const [employee, setemployee] = useState({});
    const [attandence, setattandence] = useState([]);
    const [loading, setLoading] = useState(true);
    const { company, holidays } = useSelector((state) => state.user);
    const [setting, setsetting] = useState(null)
    const [holidaydate, setholidaydate] = useState([]);
    const [withremarks, setwithremarks] = useState([]);

    const [selectedYear, setSelectedYear] = useState(dayjs().year());
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('all');
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

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
        shorttimemin: 0,
        overtimemin: 0,

    });

    const currentYear = dayjs().year();
    const yearOptions = Array.from({ length: 8 }, (_, i) => currentYear + 1 - i);
    const monthOptions = Array.from({ length: 12 }, (_, i) => ({
        label: dayjs().month(i).format('MMMM'),
        value: i,
    }));

    useEffect(() => {
        if (!company) return;
        setsetting(company)
    }, [company]);

    useEffect(() => {
        if (!holidays) return;
        console.log(holidays)

        const dateObjects = [];
        holidays.forEach(holiday => {
            let current = dayjs(holiday.fromDate);
            const end = holiday.toDate ? dayjs(holiday.toDate) : current;

            while (current.isSameOrBefore(end, 'day')) {
                dateObjects.push(current.format('DD/MM/YYYY'));
                current = current.add(1, 'day');
            }

        });
        setholidaydate(dateObjects);
    }, [holidays]);


    useEffect(() => {
        if (!userid) return;
        const fetchPerformanceData = async () => {
            const token = localStorage.getItem('emstoken');
            try {
                setLoading(true);
                const res = await axios.get(`${import.meta.env.VITE_API_ADDRESS}employeeAttandence`, {
                    params: { userid },
                    headers: { Authorization: `Bearer ${token}` },
                });
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

        const filtered = attandence.filter(entry => {
            const entryDate = dayjs(entry.date);
            return entryDate.year() === selectedYear && (selectedMonth === 'all' || entryDate.month() === selectedMonth);
        });

        const presentDates = [], absentDates = [], leaveDates = [], holidayDates = [],
            shortDates = [], overtime = [], latearrival = [], earlyarrival = [], earlyLeave = [], lateleave = [];

        let shorttimemin = 0;
        let overtimemin = 0;

        let finaliiy = [];

        filtered.forEach(element => {
            const date = dayjs(element.date).toDate();
            let fdfgfd = dayjs(element.date).format('DD/MM/YYYY');
            const fdfgfdd = dayjs(element.date, 'DD/MM/YYYY');

            const isHoliday = holidaydate.includes(fdfgfd);
            // const isHoliday = holidays?.filter((hey) => {
            //     const from = dayjs(hey.fromDate, 'DD/MM/YYYY');
            //     const to = dayjs(hey.toDate, 'DD/MM/YYYY');

            //     return fdfgfdd.isSameOrAfter(from) && fdfgfdd.isSameOrBefore(to);
            // });

            const isWeeklyOff = dayjs(element.date).startOf('day').day() === 0;
            const isleave = element.status == 'leave'
            const isabsent = element.status == 'absent'

            if (isHoliday && !isleave && !isabsent) {
                finaliiy.push({
                    ...element,
                    remarks: 'worked on holiday'
                })
            } else if (isWeeklyOff && !isleave && !isabsent) {
                finaliiy.push({
                    ...element,
                    remarks: 'worked on weekly off'
                })
            } else {
                finaliiy.push(element);
            }
            const status = element.status;

            switch (status) {
                case 'present': presentDates.push(date); break;
                case 'absent': absentDates.push(date); break;
                case 'leave': leaveDates.push(date); break;
                case 'holiday': holidayDates.push(date); break;
                default: break;
            }

            if (status !== 'present') return;

            const { punchIn, punchOut, workingMinutes } = element;
            if (!punchIn || !punchOut || typeof workingMinutes !== 'number') return;

            if (isHoliday || isWeeklyOff) {
                overtime.push(date);
                overtimemin += workingMinutes;
            } else {
                const isshort = workingMinutes < setting.workingMinutes.shortDayThreshold;
                const isOvertime = workingMinutes >= setting.workingMinutes.overtimeAfterMinutes;

                if (isshort) {
                    shortDates.push(date);
                    shorttimemin += setting.workingMinutes.shortDayThreshold - workingMinutes;
                }

                if (isOvertime) {
                    overtime.push(date);
                    overtimemin += workingMinutes - setting.workingMinutes.overtimeAfterMinutes;
                }
            }



            // Early / Late arrival thresholds
            const [earlyArrHour, earlyArrMinute] = setting.attendanceRules.considerEarlyEntryBefore.split(':').map(Number);
            const [lateArrHour, lateArrMinute] = setting.attendanceRules.considerLateEntryAfter.split(':').map(Number);
            const earlyArrivalThreshold = dayjs(punchIn).startOf('day').add(earlyArrHour, 'hour').add(earlyArrMinute, 'minute');
            const lateArrivalThreshold = dayjs(punchIn).startOf('day').add(lateArrHour, 'hour').add(lateArrMinute, 'minute');

            if (dayjs(punchIn).isBefore(earlyArrivalThreshold)) earlyarrival.push(date);
            if (dayjs(punchIn).isAfter(lateArrivalThreshold)) latearrival.push(date);

            // Early / Late leave thresholds
            const [earlyLeaveHour, earlyLeaveMinute] = setting.attendanceRules.considerEarlyExitBefore.split(':').map(Number);
            const [lateLeaveHour, lateLeaveMinute] = setting.attendanceRules.considerLateExitAfter.split(':').map(Number);
            const earlyLeaveThreshold = dayjs(punchOut).startOf('day').add(earlyLeaveHour, 'hour').add(earlyLeaveMinute, 'minute');
            const lateLeaveThreshold = dayjs(punchOut).startOf('day').add(lateLeaveHour, 'hour').add(lateLeaveMinute, 'minute');

            if (dayjs(punchOut).isBefore(earlyLeaveThreshold)) earlyLeave.push(date);
            if (dayjs(punchOut).isAfter(lateLeaveThreshold)) lateleave.push(date);
        });
        setwithremarks(finaliiy)
        sethell({
            present: presentDates,
            absent: absentDates,
            leave: leaveDates,
            holiday: holidayDates,
            short: shortDates,
            overtime,
            shorttimemin,
            overtimemin,
            latearrival,
            earlyarrival,
            earlyLeave,
            lateleave,
        });
    }, [attandence, selectedYear, selectedMonth, setting]);


    const filteredData = withremarks.filter((entry) => {
        const date = dayjs(entry.date).startOf('day');

        // Date Range Filter
        if (fromDate && date.isBefore(dayjs(fromDate))) return false;
        if (toDate && date.isAfter(dayjs(toDate))) return false;

        // Status Filter
        if (statusFilter !== 'all' && entry.status !== statusFilter) return false;

        // Type Filter
        if (typeFilter !== 'all') {
            const isInType =
                (typeFilter === 'earlyLeave' && hell.earlyLeave.some(d => dayjs(d).isSame(date, 'day'))) ||
                (typeFilter === 'lateleave' && hell.lateleave.some(d => dayjs(d).isSame(date, 'day'))) ||
                (typeFilter === 'earlyarrival' && hell.earlyarrival.some(d => dayjs(d).isSame(date, 'day'))) ||
                (typeFilter === 'latearrival' && hell.latearrival.some(d => dayjs(d).isSame(date, 'day')));
            if (!isInType) return false;
        }

        // Time Filter
        if (timeFilter !== 'all') {
            const isInTime =
                (timeFilter === 'short' && hell.short.some(d => dayjs(d).isSame(date, 'day'))) ||
                (timeFilter === 'overtime' && hell.overtime.some(d => dayjs(d).isSame(date, 'day')));
            if (!isInTime) return false;
        }

        return true;
    });

    const resetFilters = () => {
        setSelectedYear(dayjs().year());
        setSelectedMonth('all');
        setStatusFilter('all');
        setTypeFilter('all');
        setTimeFilter('all');
        setFromDate(null);
        setToDate(null);
    };



    return (
        <div className="p-4 capitalize bg-gray-200">
            {loading && <p>Loading performance data...</p>}

            <div className="p-3 flex gap-3 rounded shadow bg-white mb-4">
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Year</InputLabel>
                    <Select value={selectedYear} label="Year" onChange={(e) => setSelectedYear(e.target.value)}>
                        {yearOptions.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Month</InputLabel>
                    <Select value={selectedMonth} label="Month" onChange={(e) => setSelectedMonth(e.target.value)}>
                        <MenuItem value="all">All</MenuItem>
                        {monthOptions.map((month) => <MenuItem key={month.label} value={month.value}>{month.label}</MenuItem>)}
                    </Select>
                </FormControl>
            </div>

            {attandence && (
                <>
                    <EmployeeProfileCard employee={employee} user={user} attandence={attandence} hell={hell} />

                    <div className="p-4 flex gap-3 rounded shadow bg-white my-4">
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Type</InputLabel>
                            <Select value={typeFilter} label="Type" onChange={(e) => setTypeFilter(e.target.value)}>
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value='earlyLeave'>Early Leave</MenuItem>
                                <MenuItem value='lateleave'>Late Leave</MenuItem>
                                <MenuItem value='earlyarrival'>Early Arrival</MenuItem>
                                <MenuItem value='latearrival'>Late Arrival</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Status</InputLabel>
                            <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value='present'>Present</MenuItem>
                                <MenuItem value='leave'>Leave</MenuItem>
                                <MenuItem value='absent'>Absent</MenuItem>
                                <MenuItem value='halfday'>Half Day</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Over/Short</InputLabel>
                            <Select value={timeFilter} label="over/short" onChange={(e) => setTimeFilter(e.target.value)}>
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value='overtime'>Overtime</MenuItem>
                                <MenuItem value='short'>Short Time</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <TextField
                                label="From Date"
                                type="date"
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                value={fromDate || ''}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <TextField
                                label="To Date"
                                type="date"
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                value={toDate || ''}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </FormControl>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={resetFilters}
                            sx={{ alignSelf: 'flex-end', minWidth: 100 }}
                            startIcon={<RxReset />}
                        >
                            Reset
                        </Button>
                    </div>

                    <DataTable
                        columns={columns(setting)}
                        data={filteredData}
                        pagination
                        customStyles={customStyles}
                        conditionalRowStyles={conditionalRowStyles}
                        highlightOnHover
                        noDataComponent={
                            <div className="flex items-center gap-2 py-6 text-center text-gray-600 text-sm">
                                <BiMessageRoundedError className="text-xl" /> No records found matching your criteria.
                            </div>
                        }
                    />
                </>
            )}
        </div>
    );
};

export default AttenPerformance;

const minutesinhours = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
};

const conditionalRowStyles = [
    {
        when: row => row.remarks,
        style: {
            backgroundColor: 'rgba(21, 233, 233, 0.2)',
        },
    },
];


const columns = (setting) => [
    {
        name: "Date",
        selector: (row) => dayjs(row.date).format('DD MMM, YYYY'),
        sortable: true,
        width: '120px',
    },
    {
        name: "Punch In",
        selector: (row) => row.punchIn,
        cell: (emp) => {
            if (!emp.punchIn) return '-';
            const [earlyHour, earlyMinute] = setting?.attendanceRules?.considerEarlyEntryBefore.split(':').map(Number);
            const [lateHour, lateMinute] = setting?.attendanceRules?.considerLateEntryAfter.split(':').map(Number);

            const earlyThreshold = dayjs(emp.punchIn).startOf('day').add(earlyHour, 'hour').add(earlyMinute, 'minute');
            const lateThreshold = dayjs(emp.punchIn).startOf('day').add(lateHour, 'hour').add(lateMinute, 'minute');

            return (
                <span className="flex items-center gap-1">
                    <IoMdTime className="text-[16px] text-blue-700" />
                    {dayjs(emp.punchIn).format('hh:mm A')}

                    {(!emp.remarks && dayjs(emp.punchIn).isBefore(earlyThreshold)) && (
                        <span className="px-2 py-0.5 ml-2 rounded bg-sky-100 text-sky-800 text-xs">Early</span>
                    )}
                    {(!emp.remarks && dayjs(emp.punchIn).isAfter(lateThreshold)) && (
                        <span className="px-2 py-0.5 ml-2 rounded bg-amber-100 text-amber-800 text-xs">Late</span>
                    )}
                </span>
            );
        },
    },
    {
        name: "Punch Out",
        selector: (row) => row.punchOut,
        cell: (emp) => {
            if (!emp.punchOut) return '-';
            const [earlyHour, earlyMinute] = setting?.attendanceRules?.considerEarlyExitBefore.split(':').map(Number);
            const [lateHour, lateMinute] = setting?.attendanceRules?.considerLateExitAfter.split(':').map(Number);

            const earlyExitThreshold = dayjs(emp.punchOut).startOf('day').add(earlyHour, 'hour').add(earlyMinute, 'minute');
            const lateExitThreshold = dayjs(emp.punchOut).startOf('day').add(lateHour, 'hour').add(lateMinute, 'minute');

            return (
                <span className="flex items-center gap-1">
                    <IoMdTime className="text-[16px] text-blue-700" />
                    {dayjs(emp.punchOut).format('hh:mm A')}
                    {!emp.remarks && dayjs(emp.punchOut).isBefore(earlyExitThreshold) && (
                        <span className="px-2 py-0.5 ml-2 rounded bg-amber-100 text-amber-800 text-xs">Early</span>
                    )}
                    {!emp.remarks && dayjs(emp.punchOut).isAfter(lateExitThreshold) && (
                        <span className="px-2 py-0.5 ml-2 rounded bg-sky-100 text-sky-800 text-xs">Late</span>
                    )}
                </span>
            );
        },
    },
    {
        name: "Status",
        selector: (emp) => emp.status,
        cell: (emp) => {
            const { status } = emp;
            const colorMap = {
                absent: 'bg-red-100 text-red-800',
                leave: 'bg-violet-100 text-violet-800',
                present: 'bg-green-100 text-green-800',
                holiday: 'bg-blue-100 text-blue-800'
            };
            const classes = colorMap[status] || 'bg-gray-100 text-gray-800';

            return (
                <span className={`${classes} px-2 py-1 rounded text-xs`}>
                    {status}
                </span>
            );
        },
        width: '140px'
    },
    {
        name: "Working Hours",
        selector: (emp) => emp.workingMinutes,
        cell: (emp) => {
            const wm = emp.workingMinutes;
            if (!wm) return '-';
            return (
                <span>
                    {minutesinhours(wm)}
                    {!emp.remarks && wm < setting?.workingMinutes?.shortDayThreshold && (
                        <span className="px-2 py-0.5 ml-2 rounded bg-amber-100 text-amber-800 text-xs">Short</span>
                    )}
                    {!emp.remarks && wm > setting?.workingMinutes?.overtimeAfterMinutes && (
                        <span className="px-2 py-0.5 ml-2 rounded bg-green-100 text-green-800 text-xs">Overtime</span>
                    )}
                </span>
            );
        },
    },
    {
        name: "Remarks",
        selector: (emp) => emp.remarks && `${emp.workingMinutes} minutes  ${emp.remarks}`,

    },

];