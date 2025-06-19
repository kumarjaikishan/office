import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import { Box, Tooltip } from '@mui/material';
import { LocalizationProvider, PickersDay, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const AttenPerformance = () => {
    const { userid } = useParams();
    const [user, setuser] = useState({});
    const [employee, setemployee] = useState({});
    const [attandence, setattandence] = useState([]);
    const [loading, setLoading] = useState(true);
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
                console.log(presentDates)

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
            {attandence && (
                <div>
                    <h2 className="text-xl font-semibold mb-2">Performance for Employee: {user.name}</h2>
                    {/* Replace with real data structure */}
                    <div>
                        total days {dayjs().diff(attandence[0]?.date, 'day')}
                    </div>
                    <div>
                        present {(attandence.filter(e => e.status == 'present')).length}
                    </div>
                    <div>
                        Leave {(attandence.filter(e => e.status == 'leave')).length}
                    </div>
                    <div>
                        Absent {(attandence.filter(e => e.status == 'absent')).length}
                    </div>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Box className="bg-white shadow rounded p-1 w-full max-w-md">
                            <StaticDatePicker
                                displayStaticWrapperAs="desktop"
                                value={null}
                                onChange={() => { }}
                                slots={{
                                    day: (props) => {
                                        const date = props.day;


                                        const isPresent = hell.present.some(d => dayjs(d).isSame(date, 'day'));
                                        const isabsent = hell.absent.some(d => dayjs(d).isSame(date, 'day'));
                                        const isWeeklyOff = weeklyOffs.includes(date.getDay());

                                        const tooltipText = isPresent ? "Present" : (isWeeklyOff ? 'Weekly Off' : (isabsent ? 'absent' : ''));

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
                                                    }}
                                                />
                                            </Tooltip>
                                        );
                                    }
                                }}
                            />
                        </Box>
                    </LocalizationProvider>
                    <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(attandence, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default AttenPerformance;
