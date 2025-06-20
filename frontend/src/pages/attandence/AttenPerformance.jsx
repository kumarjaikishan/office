import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import { Box, Tooltip } from '@mui/material';
import { LocalizationProvider, PickersDay, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EmployeeProfileCard from '../../components/performanceCard';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const AttenPerformance = () => {
    const { userid } = useParams();
    const [user, setuser] = useState({});
    const [employee, setemployee] = useState({});
    const [attandence, setattandence] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(dayjs())
    const [selectedMonth, setSelectedMonth] = useState()
    const weeklyOffs = [1];
    const [hell, sethell] = useState({
        present: [],
        absent: [],
        holiday: [],
        leave: [],
    })

    useEffect(() => {
        if (!userid) return;
        console.log(userid)
        const fetchPerformanceData = async () => {
            const token = localStorage.getItem('emstoken')
            try {
                setLoading(true);
                const res = await axios.get(`${import.meta.env.VITE_API_ADDRESS}employeeAttandence`,
                    {
                        params: { userid }
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                console.log(res.data)
                setemployee(res.data.employee)
                setuser(res.data.user)
                setattandence(res.data.attandence)

                const presentDates = [];
                const absentDates = [];
                const leaveDates = [];
                const holidayDates = [];

                res.data.attandence.forEach(element => {
                    switch (element.status) {
                        case 'present':
                            presentDates.push(dayjs(element.date).toDate());
                            break;
                        case 'absent':
                            absentDates.push(dayjs(element.date).toDate());
                            break;
                        case 'leave':
                            leaveDates.push(dayjs(element.date).toDate());
                            break;
                        case 'holiday':
                            holidayDates.push(dayjs(element.date).toDate());
                            break;
                        default:
                            break;
                    }
                });
                console.log(presentDates, absentDates, leaveDates)

                sethell({
                    present: presentDates,
                    absent: absentDates,
                    leave: leaveDates,
                    holiday: holidayDates
                });

            } catch (err) {
                console.error('Failed to fetch performance data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPerformanceData();
    }, [userid]);


    return (
        <div className="p-4">
            {loading && <p>Loading performance data...</p>}
            {/* {error && <p className="text-red-500">Error: {error.message}</p>} */}

            <div className='p-2 rounded shadow bg-white '>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                <div className='flex gap-3 '>
                    <DatePicker
                        label="Select Year"
                        views={['year']}
                        value={selectedYear}
                        onChange={(newValue) => setSelectedYear(newValue)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                    <DatePicker
                        label="Select Month"
                        views={['month']}
                        value={selectedMonth}
                        onChange={(newValue) => setSelectedMonth(newValue)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                    </div>
                </LocalizationProvider>
            </div>
            {attandence && (
                <div>
                    <EmployeeProfileCard employee={employee} user={user} attandence={attandence} hell={hell} />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Box className="bg-white shadow rounded p-1 w-full max-w-md">
                            <StaticDatePicker
                                displayStaticWrapperAs="desktop"
                                value={dayjs()}
                                // onChange={() => { }}
                                slots={{
                                    day: (props) => {
                                        const date = props.day;

                                        const isPresent = hell.present.some(d => dayjs(d).isSame(date, 'day'));
                                        const isleave = hell.leave.some(d => dayjs(d).isSame(date, 'day'));
                                        const isabsent = hell.absent.some(d => dayjs(d).isSame(date, 'day'));
                                        const isWeeklyOff = weeklyOffs.includes(date.getDay());

                                        const tooltipText = (isPresent && "Present") || (isleave && "Leave") ||
                                            (isWeeklyOff && "Weekly Off") || (isabsent && "Absent") || "";

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
                                                        ...(isabsent && {
                                                            backgroundColor: 'red',
                                                            borderRadius: '50%',
                                                            color: 'white',
                                                        }),
                                                        ...(isleave && {
                                                            backgroundColor: 'violet',
                                                            borderRadius: '50%',
                                                            color: 'white',
                                                        }),
                                                    }}
                                                />
                                            </Tooltip>
                                        );
                                    }
                                }}
                            />
                        </Box>
                    </LocalizationProvider>

                    {/* <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(attandence, null, 2)}</pre> */}
                </div>
            )}
        </div>
    );
};

export default AttenPerformance;
