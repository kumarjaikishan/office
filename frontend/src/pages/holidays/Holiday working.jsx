import React, { useEffect, useState } from 'react';
import { TextField, Button, Box, Tooltip } from '@mui/material';
import {
  DatePicker,
  StaticDatePicker,
  PickersDay,
  LocalizationProvider,
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { isWithinInterval, parseISO } from 'date-fns';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);

const HolidayForm = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Public');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [dfsd, sdff] = useState([])

  // Example dates to highlight manually
  const impordate = ['06/15/2025', '06/10/2025'];
  const highlightedDates = dfsd.map(dateStr => new Date(dateStr));


  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_ADDRESS}getholidays`);
        const holidaysData = res.data.holidays;

        // Collect all individual dates between fromDate and toDate (inclusive)
        const allHolidayDates = [];

        holidaysData.forEach(holiday => {
          let current = dayjs(holiday.fromDate);
          const end = holiday.toDate ? dayjs(holiday.toDate) : current;

          // Loop from fromDate to toDate
          while (current.isSameOrBefore(end, 'day')) {
            allHolidayDates.push(current.format('MM/DD/YYYY'));
            current = current.add(1, 'day');
          }
        });
        sdff(allHolidayDates)
        console.log("Expanded holiday dates:", allHolidayDates); // ["06/19/2025", "06/20/2025", ...]

        // Optional: Save full holidays for display and the date list for highlighting
        setHolidays(holidaysData);
        // You can also store allHolidayDates in another state if needed
        // setHolidayDates(allHolidayDates);
      } catch (err) {
        console.error("Error fetching holidays:", err);
      }
    };

    fetchHolidays();
  }, []);


  const handleSubmit = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_ADDRESS}addholiday`, {
        name,
        fromDate,
        toDate,
        type,
      });

      alert(res.data.message || "Holiday saved");
      setName('');
      setFromDate(null);
      setToDate(null);
      setType('Public');
      setHolidays([...holidays, res.data.newHoliday]); // Make sure your API returns newHoliday
    } catch (err) {
      console.error(err);
      alert("Error saving holiday");
    }
  };


  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box className="flex flex-col md:flex-row gap-4 p-4">
        <Box className="bg-white shadow rounded p-4 w-full max-w-md">
          <StaticDatePicker
            displayStaticWrapperAs="desktop"
            value={null}
            onChange={() => { }}
            slots={{
              day: (props) => {
                const isHighlighted = highlightedDates.some(date =>
                  props.day.getDate() === date.getDate() &&
                  props.day.getMonth() === date.getMonth() &&
                  props.day.getFullYear() === date.getFullYear()
                );

                return (
                  <Tooltip title={isHighlighted ? 'Holiday' : ''}>
                    <PickersDay
                      {...props}
                      sx={{
                        ...(isHighlighted && {
                          backgroundColor: '#ffeb3b',
                          borderRadius: '50%',
                          color: 'black',
                        }),
                      }}
                    />
                  </Tooltip>
                );
              },
            }}
          />
        </Box>

        <Box className="flex flex-col gap-4 p-4 bg-white shadow rounded w-full max-w-md">
          <TextField
            label="Holiday Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />

          <DatePicker
            label="From Date"
            value={fromDate}
            onChange={(newValue) => setFromDate(newValue)}
            slotProps={{ textField: { fullWidth: true } }}
          />

          <DatePicker
            label="To Date"
            value={toDate}
            onChange={(newValue) => setToDate(newValue)}
            slotProps={{ textField: { fullWidth: true } }}
          />

          <TextField
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            fullWidth
          />

          <Button variant="contained" onClick={handleSubmit}>
            Add Holiday
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default HolidayForm;
