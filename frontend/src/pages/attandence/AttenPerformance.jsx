import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import {
    Box,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    LocalizationProvider,
    PickersDay,
    StaticDatePicker,
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EmployeeProfileCard from '../../components/performanceCard';

const AttenPerformance = () => {
    const { userid } = useParams();
    const [user, setuser] = useState({});
    const [employee, setemployee] = useState({});
    const [attandence, setattandence] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedYear, setSelectedYear] = useState(dayjs().year());
    const [selectedMonth, setSelectedMonth] = useState('all'); // null = all months

    const weeklyOffs = [1]; // Monday off

    const [hell, sethell] = useState({
        present: [],
        absent: [],
        holiday: [],
        leave: [],
    });

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
                console.log(res.data.attandence)
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
        if (!attandence.length) return;

        const filtered = attandence.filter((entry) => {
            const entryDate = dayjs(entry.date);
            const matchesYear = entryDate.year() === selectedYear;
            const matchesMonth =
                selectedMonth === 'all' || entryDate.month() === selectedMonth;
            return matchesYear && matchesMonth;
        });

        const presentDates = [];
        const absentDates = [];
        const leaveDates = [];
        const holidayDates = [];

        filtered.forEach((element) => {
            const date = dayjs(element.date).toDate();
            switch (element.status) {
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
        });

        sethell({
            present: presentDates,
            absent: absentDates,
            leave: leaveDates,
            holiday: holidayDates,
        });
    }, [attandence, selectedYear, selectedMonth]);

    return (
        <div className="p-4">
            {loading && <p>Loading performance data...</p>}

            <div className="p-2 rounded shadow bg-white mb-4">
                <div className="flex gap-3">
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
            </div>

            {attandence && (
                <>
                    <EmployeeProfileCard
                        employee={employee}
                        user={user}
                        attandence={attandence}
                        hell={hell}
                    />

                    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
                    </LocalizationProvider>
                </>
            )}
        </div>
    );
};

export default AttenPerformance;
