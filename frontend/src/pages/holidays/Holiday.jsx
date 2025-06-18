import React, { useEffect, useState } from 'react';
import { TextField, Button, Box, Tooltip } from '@mui/material';
import { DatePicker, StaticDatePicker, PickersDay, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { isWithinInterval, parseISO } from 'date-fns';

const HolidayForm = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Public');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_ADDRESS}getholidays`);
        setHolidays(res.data.holidays);
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
        type
      });
      alert(res.data.message || "Holiday saved");
      setName('');
      setFromDate(null);
      setToDate(null);
      setType('Public');
      setHolidays([...holidays, res.data.newHoliday]); // Assumes res.data.newHoliday is returned
    } catch (err) {
      console.error(err);
      alert("Error saving holiday");
    }
  };

  const renderHighlightedDay = (date, selectedDates, pickersDayProps) => {
    const holiday = holidays.find(h => {
      const from = parseISO(h.fromDate);
      const to = h.toDate ? parseISO(h.toDate) : from;
      console.log("Checking date:", date, "Against:", from, "to", to);

      return isWithinInterval(date, { start: from, end: to });
    });

    if (holiday) {
      return (
        <Tooltip key={date.toString()} title={holiday.name}>
          <PickersDay
            {...pickersDayProps}
            sx={{
              backgroundColor: '#a5d6a7',
              color: '#000',
              '&:hover': { backgroundColor: '#81c784' },
            }}
          />
        </Tooltip>
      );
    }

    return <PickersDay {...pickersDayProps} />;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box className="flex flex-col md:flex-row gap-4 p-4">
        <Box className="bg-white shadow rounded p-4 w-full max-w-md">
          <StaticDatePicker
            displayStaticWrapperAs="desktop"
            value={null}
            onChange={() => {}}
            renderDay={(date, selectedDates, pickersDayProps) =>
              renderHighlightedDay(date, selectedDates, pickersDayProps)
            }
          />
        </Box>

        <Box className="flex flex-col gap-4 p-4 bg-white shadow rounded w-full max-w-md">
          <TextField label="Holiday Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />

          <DatePicker
            label="From Date"
            value={fromDate}
            onChange={(newValue) => setFromDate(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />

          <DatePicker
            label="To Date"
            value={toDate}
            onChange={(newValue) => setToDate(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />

          <TextField
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            fullWidth
          />

          <Button variant="contained" onClick={handleSubmit}>Add Holiday</Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default HolidayForm;
