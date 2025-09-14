import React, { useEffect, useState, useMemo, startTransition } from 'react';
import { TextField, Button, Box } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useSelector } from 'react-redux';
import DataTable from 'react-data-table-component';
import { MdAddCircleOutline, MdCalendarToday, MdOutlineModeEdit, MdRefresh } from 'react-icons/md';
import { AiOutlineDelete } from 'react-icons/ai';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { toast } from 'react-toastify';
import swal from 'sweetalert';
import { useCustomStyles } from '../admin/attandence/attandencehelper';
import HolidayCalander from './holidayCalander';
import { BiMessageRoundedError } from 'react-icons/bi';
import Modalbox from '../../components/custommodal/Modalbox';

dayjs.extend(isSameOrBefore);

const HolidayForm = () => {
  const [form, setForm] = useState({ name: '', type: '', fromDate: null, toDate: null, description: '' });
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
  const [holidaymodal, setholidaymodal] = useState(false)
  const [open, setopen] = useState(false)

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
    setopen(true)
    setHolidayId(holi._id);
    setForm({
      name: holi.name,
      type: holi.type,
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

  const handleSave = async (e) => {
    e.preventDefault();
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
      setopen(false)
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
      {/* <Box className="flex flex-col md:flex-row gap-4 p-1">
        <HolidayCalander highlightedDates={holidaylist.map(dateObj => ({ date: dayjs(dateObj.date).toDate(), name: dateObj.name }))} weeklyOffs={weeklyOffs} />
        <form onSubmit={handleSave} className='rounded w-full max-w-md'>
          <Box className="flex flex-col gap-4 p-4 bg-white shadow rounded w-full max-w-md">
            <TextField required inputRef={nameInputRef} label="Holiday Name" size="small" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} fullWidth />
            <DatePicker required label="From Date" format='dd/MM/yyyy' value={form.fromDate} onChange={(newValue) => setForm(prev => ({ ...prev, fromDate: newValue }))} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
            <DatePicker required label="To Date" format='dd/MM/yyyy' value={form.toDate} onChange={(newValue) => setForm(prev => ({ ...prev, toDate: newValue }))} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
         
            <FormControl size="small" required fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={form.type}
                label="Type"
                onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
              >
                <MenuItem disabled value="">Select Type</MenuItem>
                <MenuItem value="National">National</MenuItem>
                <MenuItem value="Religious">Religious</MenuItem>
                <MenuItem value="Public">Public</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField label="Description (optional)" multiline rows={2} size="small" value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} fullWidth />
            <div className='flex justify-end gap-2'>
              {isUpdate && <Button variant="outlined" onClick={() => { setIsUpdate(false); setForm({ name: '', type: 'Public', fromDate: null, toDate: null, description: '' }); }}>Cancel</Button>}
              <Button variant="contained" type='submit'>{isUpdate ? 'Update' : 'Add'} Holiday</Button>
            </div>
          </Box>
        </form>
      </Box> */}

      <div className="flex flex-wrap  justify-between items-center gap-3 w-full my-4">
        {/* Year Filter */}
        <div className='flex gap-2 flex-wrap justify-between w-full md:w-fit'>
          <FormControl size="small" className="w-[47%] md:w-[120px]">
            <InputLabel>Year</InputLabel>
            <Select
              label="Year"
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
          <FormControl size="small" className="w-[47%] md:w-[120px]">
            <InputLabel>Month</InputLabel>
            <Select
              label="Month"
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
          <FormControl size="small" className="w-[47%] md:w-[150px]">
            <InputLabel>Type</InputLabel>
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

          {/* Reset Button */}
          <Button
            variant="outlined"
            color="secondary"
            className='w-[47%] md:w-fit'
            startIcon={<MdRefresh />}
            onClick={() => {
              setFilterYear("All");
              setFilterMonth("All");
              setFilterType("All");
            }}
          >
            Reset
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-fit">
          <Button
            startIcon={<MdCalendarToday />}
            variant="contained"
            onClick={() => setholidaymodal(true)}
          >
            Calendar
          </Button>
          <Button
            startIcon={<MdAddCircleOutline />}
            variant="contained"
            onClick={() => setopen(true)}
          >
            Add Holiday
          </Button>
        </div>
      </div>


      <div className='capitalize'>
        <DataTable
          columns={columns}
          data={filteredHolidays}
          pagination
          // selectableRows
          customStyles={useCustomStyles()}
          noDataComponent={
            <div className="flex items-center gap-2 py-6 text-center text-gray-600 text-sm">
              <BiMessageRoundedError className="text-xl" /> No records found.
            </div>
          }
          highlightOnHover
        />
      </div>

      <Modalbox open={holidaymodal} onClose={() => setholidaymodal(false)}>
        <div className="membermodal w-[400px]">
          <HolidayCalander highlightedDates={holidaylist.map(dateObj => ({ date: dayjs(dateObj.date).toDate(), name: dateObj.name }))} weeklyOffs={weeklyOffs} />
        </div>
      </Modalbox>

      <Modalbox open={open} onClose={() => {
        setopen(false)
      }}>
        <div className="membermodal w-[600px]">
          <form onSubmit={handleSave}>
            <div className='modalhead'> {isUpdate ? 'Edit Holiday' : 'Add holiday'}</div>
            <span className="modalcontent ">
              <div className='flex flex-col gap-3 w-full'>
                <TextField required inputRef={nameInputRef} label="Holiday Name" size="small" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} fullWidth />
                <div className='flex w-full justify-between gap-2'>
                  <DatePicker required label="From Date" format='dd/MM/yyyy' value={form.fromDate} onChange={(newValue) => setForm(prev => ({ ...prev, fromDate: newValue }))} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
                  <DatePicker required label="To Date" format='dd/MM/yyyy' value={form.toDate} onChange={(newValue) => setForm(prev => ({ ...prev, toDate: newValue }))} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
                </div>
                {/* Type Selector */}
                <FormControl size="small" required fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={form.type}
                    label="Type"
                    onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <MenuItem disabled value="">Select Type</MenuItem>
                    <MenuItem value="National">National</MenuItem>
                    <MenuItem value="Religious">Religious</MenuItem>
                    <MenuItem value="Public">Public</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>

                <TextField label="Description (optional)" multiline rows={2} size="small" value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} fullWidth />

              </div>
            </span>
            <div className='modalfooter'>
              <Button variant="outlined" onClick={() => { setIsUpdate(false); setopen(false); setForm({ name: '', type: 'Public', fromDate: null, toDate: null, description: '' }); }}>Cancel</Button>
              {/* <Button variant="contained" type='submit'>{isUpdate ? 'Update' : 'Add'} Holiday</Button> */}
              <Button variant="contained" type='submit'>{isUpdate ? 'Update' : 'Add'} Holiday</Button>
            </div>
          </form>
        </div>
      </Modalbox>

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