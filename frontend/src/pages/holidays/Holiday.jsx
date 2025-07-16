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
import { useSelector } from 'react-redux';
import { customStyles } from '../attandence/attandencehelper';
import DataTable from 'react-data-table-component';
import { MdOutlineModeEdit } from 'react-icons/md';
import { AiOutlineDelete } from 'react-icons/ai';
import { toast } from 'react-toastify';
dayjs.extend(isSameOrBefore);

const HolidayForm = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Public');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [description, setdescription] = useState('');
  const [holidayId, setholidayId] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [isupdate, setisupdate] = useState(false)
  const { company } = useSelector((state) => state.user);
  const [holidaylist, setholidaylist] = useState([])
  const [weeklyOffs, setweeklyOffs] = useState([1])

  useEffect(() => {
    setweeklyOffs(company?.weeklyOffs || [1]);
    // console.log(company)
  }, [company])

  const impordate = ['06/15/2025', '06/10/2025'];
  const highlightedDates = holidaylist.map(dateObj => ({
    date: dayjs(dateObj.date).toDate(), // Convert to Date object
    name: dateObj.name
  }));

  const edite = async (holi) => {
    console.log(holi)
    setisupdate(true);

    setholidayId(holi._id)
    setName(holi.name);
    setFromDate(dayjs(holi.fromDate).toDate());
    setToDate(dayjs(holi.toDate).toDate());
    setType('Public');
    setdescription(holi?.description)
  }

  const updateholiday = async () => {
    try {
      const token = localStorage.getItem('emstoken');
      const res = await axios.post(`${import.meta.env.VITE_API_ADDRESS}updateholiday`, {
        holidayId, name, fromDate, toDate, type, description
      },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

      toast.success(res.data.message, { autoClose: 1200 });
      setName('');
      setFromDate(null);
      setToDate(null);
      setType('Public');
      setdescription('')
      setisupdate(false);
    } catch (err) {
      console.error(err);
      alert("Error saving holiday");
      // toast.warn(res.data.message ,{autoClose:1200});
    }
  }

  const deletee = () => {

  }

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const token = localStorage.getItem('emstoken');
        const res = await axios.get(`${import.meta.env.VITE_API_ADDRESS}getholidays`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        const holidaysData = res.data.holidays;

        const dateObjects = [];

        holidaysData.forEach(holiday => {
          let current = dayjs(holiday.fromDate);
          const end = holiday.toDate ? dayjs(holiday.toDate) : current;

          while (current.isSameOrBefore(end, 'day')) {
            dateObjects.push({
              date: current.format('MM/DD/YYYY'),
              name: holiday.name,
            });
            current = current.add(1, 'day');
          }
        });
        // console.log(dateObjects)
        console.log(holidaysData)
        setholidaylist(dateObjects);

        // setHolidays(holidaysData);
        let sno = 1;

        const data = holidaysData.map((holi) => {
          return {
            sno: sno++,
            name: holi.name,
            From: dayjs(holi.fromDate).format("DD MMM, YYYY"),
            till: dayjs(holi.toDate).format("DD MMM, YYYY"),
            type: holi.type,
            description: holi?.description,
            action: (<div className="action flex gap-2.5">
              <span className="edit text-[18px] text-blue-500 cursor-pointer" title="Edit" onClick={() => edite(holi)}><MdOutlineModeEdit /></span>
              <span className="delete text-[18px] text-red-500 cursor-pointer" onClick={() => deletee(holi._id)}><AiOutlineDelete /></span>
            </div>)
          }
        })
        setHolidays(data);
      } catch (err) {
        console.error("Error fetching holidays:", err);
      }
    };

    fetchHolidays();
  }, []);


  const handleSubmit = async () => {
    // return console.log(fromDate)
    try {
      const token = localStorage.getItem('emstoken');
      const res = await axios.post(`${import.meta.env.VITE_API_ADDRESS}addholiday`, {
        name, fromDate, toDate, type, description
      },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

      alert(res.data.message || "Holiday saved");
      setName('');
      setFromDate(null);
      setToDate(null);
      setType('Public');
      setdescription('');
      setHolidays([...holidays, res.data.newHoliday]); // Make sure your API returns newHoliday
    } catch (err) {
      console.error(err);
      alert("Error saving holiday");
    }
  };
  const cancele = () => {
    setisupdate(false);
    setName('');
    setFromDate(null);
    setToDate(null);
    setType('Public');
    setdescription('');
  }


  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box className="flex flex-col md:flex-row gap-4 p-4">
        <Box className="bg-white shadow rounded p-1 w-full max-w-md">
          <StaticDatePicker
            displayStaticWrapperAs="desktop"
            value={null}
            onChange={() => { }}
            slots={{
              day: (props) => {
                const date = props.day;
                const matched = highlightedDates.find(d =>
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

        <Box className="flex flex-col gap-4 p-4 bg-white shadow rounded w-full max-w-md">
          <TextField
            size='small'
            label="Holiday Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />

          <DatePicker
            label="From Date"
            size='small'
            format='dd/MM/yyyy'
            value={fromDate}
            onChange={(newValue) => setFromDate(newValue)}
            slotProps={{ textField: { fullWidth: true } }}
          />

          <DatePicker
            format='dd/MM/yyyy'
            label="To Date"
            size='small'
            value={toDate}
            onChange={(newValue) => setToDate(newValue)}
            slotProps={{ textField: { fullWidth: true } }}
          />

          <TextField
            label="Type"
            size='small'
            value={type}
            onChange={(e) => setType(e.target.value)}
            fullWidth
          />
          <TextField
            label="Description"
            multiline
            rows={2}
            value={description}
            onChange={(e) => setdescription(e.target.value)}
            fullWidth
          />
          {isupdate ? <div className='flex justify-end gap-2'>
            <Button variant="outlined" onClick={cancele}>
              Cancel
            </Button>
            <Button variant="contained" onClick={updateholiday}>
              Edit Holiday
            </Button>
          </div> :
            <Button variant="contained" onClick={handleSubmit}>
              Add Holiday
            </Button>}

        </Box>
      </Box>
      <div>
        <DataTable
          columns={columns}
          data={holidays}
          pagination
          selectableRows
          customStyles={customStyles}
          highlightOnHover
        />
      </div>
    </LocalizationProvider>
  );
};

export default HolidayForm;

const columns = [
  {
    name: "S.no",
    selector: (row) => row.sno,
    width: '50px'
  },
  {
    name: "Name",
    selector: (row) => row.name
  },
  {
    name: "From",
    selector: (row) => row.From
  },
  {
    name: "Till",
    selector: (row) => row.till
  },
  {
    name: "Type",
    selector: (row) => row.type
  },
  {
    name: "Description",
    selector: (row) => row.description
  },
  {
    name: "Action",
    selector: (row) => row.action,
    width: '160px'
  }
]
