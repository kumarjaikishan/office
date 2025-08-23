import React, { useEffect, useState, useMemo, startTransition } from 'react';
import { TextField, Button, Box } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useSelector } from 'react-redux';
import DataTable from 'react-data-table-component';
import { MdOutlineModeEdit } from 'react-icons/md';
import { AiOutlineDelete } from 'react-icons/ai';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { toast } from 'react-toastify';
import swal from 'sweetalert';
import { customStyles } from '../admin/attandence/attandencehelper';
import HolidayCalander from './holidayCalander';

dayjs.extend(isSameOrBefore);

const HolidayForm = () => {
  const [form, setForm] = useState({ name: '', type: 'Public', fromDate: null, toDate: null, description: '' });
  const [holidayId, setHolidayId] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [holidaylist, setHolidayList] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const { company } = useSelector((state) => state.user);
  const [weeklyOffs, setWeeklyOffs] = useState([1]);
  const [filterYear, setFilterYear] = useState("All");
  const [filterMonth, setFilterMonth] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const nameInputRef = React.useRef(null);

  useEffect(() => {
    setWeeklyOffs(company?.weeklyOffs || [1]);
  }, [company]);

  useEffect(() => {
    if (form.fromDate && !form.toDate) {
      const from = dayjs(form.fromDate).toDate();
      if (!isNaN(from.getTime())) {
        setForm(prev => ({ ...prev, toDate: from }));
      }
    }
  }, [form.fromDate]);


  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const token = localStorage.getItem('emstoken');
      const res = await axios.get(`${import.meta.env.VITE_API_ADDRESS}getholidays`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      // console.log(res.data)
      const holidaysData = res.data.holidays;
      const dateObjects = [];

      holidaysData.forEach((holiday) => {
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

      const data = holidaysData.map((holi) => ({
        name: holi.name,
        From: holi.fromDate,
        till: holi.toDate,
        type: holi.type,
        description: holi?.description,
        action: (
          <div className="action flex gap-2.5">
            <span className="edit text-[18px] text-blue-500 cursor-pointer" title="Edit" onClick={() => handleEdit(holi)}><MdOutlineModeEdit /></span>
            <span className="delete text-[18px] text-red-500 cursor-pointer" onClick={() => handleDelete(holi._id)}><AiOutlineDelete /></span>
          </div>
        )
      }));

      startTransition(() => {
        setHolidayList(dateObjects);
        setHolidays(data);
      });
    } catch (err) {
      console.error("Error fetching holidays:", err);
    }
  };

  const handleEdit = (holi) => {
    setIsUpdate(true);
    setHolidayId(holi._id);
    setForm({
      name: holi.name,
      type: 'Public',
      fromDate: dayjs(holi.fromDate).toDate(),
      toDate: dayjs(holi.toDate).toDate(),
      description: holi.description || ''
    });
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 0);
  };

  const handleDelete = async (id) => {
    swal({
      title: "Are you sure you want to Delete?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (deletee) => {
      if (deletee) {
        try {
          const token = localStorage.getItem('emstoken');
          const res = await axios.post(`${import.meta.env.VITE_API_ADDRESS}deleteholiday`, { id }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success(res.data.message);
          fetchHolidays();
        } catch (err) {
          console.error(err);
          toast.warning(err.response.data.message);
        }
      }
    });

  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('emstoken');
      const endpoint = isUpdate ? 'updateholiday' : 'addholiday';
      const payload = isUpdate ? { ...form, holidayId } : form;
      const res = await axios.post(`${import.meta.env.VITE_API_ADDRESS}${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message);
      setForm({ name: '', type: 'Public', fromDate: null, toDate: null, description: '' });
      setIsUpdate(false);
      fetchHolidays();
    } catch (err) {
      console.error(err.response);
      toast.warning(err.response.data.message);
      // toast.warning(err.message);
    }
  };

  const filteredHolidays = useMemo(() => {
    return holidays.filter((h) => {
      const fromDate = dayjs(h.From);
      const yearMatch = filterYear === "All" || fromDate.year().toString() === filterYear;
      const monthMatch = filterMonth === "All" || fromDate.month() === parseInt(filterMonth); // if using month index (0-11)
      const typeMatch = filterType === "All" || h.type === filterType;

      return yearMatch && monthMatch && typeMatch;
    });
  }, [holidays, filterYear, filterMonth, filterType]);


  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const years = useMemo(() => {
    if (!holidaylist || holidaylist.length === 0) return [];

    const startYear = dayjs(holidaylist[holidaylist.length - 1].date).year(); // oldest
    const endYear = dayjs(holidaylist[0].date).year(); // latest
    const yearList = [];
    for (let y = startYear; y <= endYear; y++) {
      yearList.push(y);
    }

    return yearList;
  }, [holidaylist]);


  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box className="flex flex-col md:flex-row gap-4 p-1">
        <HolidayCalander highlightedDates={holidaylist.map(dateObj => ({ date: dayjs(dateObj.date).toDate(), name: dateObj.name }))} weeklyOffs={weeklyOffs} />

        <Box className="flex flex-col gap-4 p-4 bg-white shadow rounded w-full max-w-md">
          <TextField inputRef={nameInputRef} label="Holiday Name" size="small" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} fullWidth />
          <DatePicker label="From Date" format='dd/MM/yyyy' value={form.fromDate} onChange={(newValue) => setForm(prev => ({ ...prev, fromDate: newValue }))} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
          <DatePicker label="To Date" format='dd/MM/yyyy' value={form.toDate} onChange={(newValue) => setForm(prev => ({ ...prev, toDate: newValue }))} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
          <TextField label="Type" size="small" value={form.type} onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))} fullWidth />
          <TextField label="Description" multiline rows={2} size="small" value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} fullWidth />
          <div className='flex justify-end gap-2'>
            {isUpdate && <Button variant="outlined" onClick={() => { setIsUpdate(false); setForm({ name: '', type: 'Public', fromDate: null, toDate: null, description: '' }); }}>Cancel</Button>}
            <Button variant="contained" onClick={handleSave}>{isUpdate ? 'Update' : 'Add'} Holiday</Button>
          </div>
        </Box>
      </Box>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2  w-full md:w-fit my-4 ">
        {/* Year Filter */}
        <FormControl className="md:max-w-[150px] col-span-1" size="small">
          <InputLabel>Filter by Year</InputLabel>
          <Select
            label="Filter by Year"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Month Filter */}
        <FormControl className="md:max-w-[150px] col-span-1" size="small">
          <InputLabel>Filter by Month</InputLabel>
          <Select
            label="Filter by Month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            {months.map((month, ind) => (
              <MenuItem key={month} value={ind}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Type Filter */}
        <FormControl className="md:max-w-[150px] col-span-1" size="small">
          <InputLabel>Filter by Type</InputLabel>
          <Select
            label="Filter by Type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            {[...new Set(holidays.map((h) => h.type))].map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Reset Filters Button */}
        <Button
          className="md:max-w-[150px] col-span-1"
          variant="outlined"
          color="secondary"
          onClick={() => {
            setFilterYear("All");
            setFilterMonth("All");
            setFilterType("All");
          }}
        >
          Reset
        </Button>
      </div>

      <div className='capitalize'>
        <DataTable
          columns={columns}
          data={filteredHolidays}
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
  { name: "S.no", selector: (row, ind) => ++ind, width: '50px' },
  { name: "Name", selector: (row) => row.name },
  { name: "From", selector: (row) => dayjs(row.From).format('DD MMM, YYYY'), width: '110px' },
  { name: "Till", selector: (row) => dayjs(row.till).format('DD MMM, YYYY'), width: '110px' },
  { name: "Type", selector: (row) => row.type, width: '90px' },
  // { name: "Description", selector: (row) => row.description, width: '180px' },
  { name: "Action", selector: (row) => row.action, width: '80px' }
];