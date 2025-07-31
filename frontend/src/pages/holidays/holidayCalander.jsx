import { Box, Tooltip } from "@mui/material";
import { LocalizationProvider, PickersDay, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const HolidayCalander = ({ highlightedDates, weeklyOffs }) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box className="bg-white shadow rounded p-1 w-full max-w-md">
            <p className="font-bold text-center text-xl text-slate-600">Holiday Calendar</p>
                <StaticDatePicker
                    displayStaticWrapperAs="desktop"
                    value={null}
                    onChange={() => { }}
                    slots={{
                        day: (props) => {
                            const date = props.day;
                            const matched = highlightedDates?.find(d =>
                                date.toDateString() === d.date.toDateString()
                            );

                            const isWeeklyOff = weeklyOffs?.includes(date.getDay());

                            const tooltipText = matched ? matched.name : (isWeeklyOff ? 'Weekly Off' : '');

                            return (
                                <Tooltip title={tooltipText}>
                                    <PickersDay
                                        {...props}
                                        sx={{
                                            ...(isWeeklyOff && {
                                                backgroundColor: 'teal',
                                                borderRadius: '50%',
                                                color: 'white',
                                                '&:hover': {
                                                    backgroundColor: 'darkcyan', // darker teal on hover
                                                    color: 'white',
                                                },
                                            }),
                                            ...(matched && {
                                                backgroundColor: '#ffeb3b',
                                                borderRadius: '50%',
                                                color: 'black',
                                                '&:hover': {
                                                    backgroundColor: '#ffeb3b', // darker teal on hover
                                                    color: 'black',
                                                },
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
    )
}

export default HolidayCalander
