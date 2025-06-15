import { CiFilter } from "react-icons/ci";
import { Button, OutlinedInput } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import DataTable from "react-data-table-component";
import { columns, customStyles } from "./attandencehelper";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MdOutlineModeEdit } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { IoEyeOutline } from "react-icons/io5";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FiDownload } from "react-icons/fi";
import { BiGroup } from "react-icons/bi";
import { GoPlus } from "react-icons/go";
import { BiMessageRoundedError } from "react-icons/bi";
import { useEffect, useState } from "react";
import MarkAttandence from "./MarkAttandence";
import dayjs from "dayjs";
import { submitAttandence } from "./attandencehelper";
import { useSelector } from "react-redux";
import { IoMdTime } from "react-icons/io";
import BulkMark from "./BulkMark";

const Attandence = () => {
  const [markattandence, setmarkattandence] = useState(false);
  const [isUpdate, setisUpdate] = useState(false);
  const [isload, setisload] = useState(false);
  const [openmodal, setopenmodal] = useState(false);
  const [bullmodal, setbullmodal] = useState(false);
  const { attandence, department } = useSelector((state) => state.user);
  const [attandencelist, setattandencelist] = useState([]);
  const [filterattandence, setfilterattandence] = useState([]);
  const [isPunchIn, setisPunchIn] = useState(true);
  const [selectedRows, setselectedRows] = useState([]);


  const init = {
    employeeId: '',
    departmentId: '',
    date: dayjs(),
    punchIn: null,
    punchOut: null,
    status: '',
  }
  const [inp, setinp] = useState(init);
  const [filtere, setfiltere] = useState({
    date: dayjs(),
    departmente: 'all',
    status: ''
  })
  const isFilterActive = filtere.departmente !== 'all' || filtere.status || !dayjs(filtere.date).isSame(dayjs(), 'day');


  useEffect(() => {
    if (inp.punchIn && inp.punchOut && dayjs(inp.punchOut).isAfter(dayjs(inp.punchIn))) {
      const diff = dayjs(inp.punchOut).diff(dayjs(inp.punchIn), 'minute');
      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;
      const formatted = `${hours}h ${minutes}m`;

      setinp((prev) => ({
        ...prev,
        workingMinutes: diff,
      }));
    }
  }, [inp.punchIn, inp.punchOut]);

  useEffect(() => {
    console.log(attandencelist)
    if (!attandencelist) return;
    const fil = attandencelist.filter((val) => {
      if (filtere.departmente == 'all') {
        return dayjs(val.date, "DD MMM, YYYY").isSame(filtere.date, 'day')
      } else {
        return dayjs(val.date, "DD MMM, YYYY").isSame(filtere.date, 'day') && val.departmentId == filtere.departmente;
      }
    })
    setfilterattandence(fil)
    console.log(fil)
  }, [filtere, attandencelist]);

  useEffect(() => {

    if (inp.employeeId && inp.date) {
      const punchedIn = attandence.find((val) => {
        return (
          val.employeeId._id === inp.employeeId &&
          dayjs(val.date).isSame(dayjs(inp.date), 'day')
        );
      });
      if (punchedIn) {
        setinp({ ...inp, punchIn: dayjs(punchedIn.punchIn), status: punchedIn.status })
      }
    } else {
      //  setinp({...inp,punchIn: null })
    }
  }, [inp.employeeId, inp.date]);

  const minutesinhours = (minutes) => {
    let hour = Math.floor(minutes / 60);
    let minute = minutes % 60;
    let formatted;

    formatted = `${hour}h ${minute}m`;
    return formatted;
  }

  useEffect(() => {
    // console.log(department)
    // console.log(attandence)
    if (!attandence) return;
    const data = attandence.map((emp) => {
      return {
        departmentId: emp.departmentId._id,
        employeeId: emp.employeeId._id,
        status: emp.status,
        name: emp.employeeId.employeename,
        date: dayjs(emp.date).format('DD MMM, YYYY'),
        punchIn: <span className="flex items-center gap-1"><IoMdTime className="text-[16px] text-blue-700" /> {dayjs(emp.punchIn).format('hh:mm A')}
          {dayjs(emp.punchIn).isBefore(dayjs(emp.punchIn).startOf('day').add(9, 'hour').add(50, 'minute')) && (
            <span className="px-3 py-1 rounded bg-sky-100 text-sky-800">Early</span>
          )}
          {dayjs(emp.punchIn).isAfter(dayjs(emp.punchIn).startOf('day').add(10, 'hour').add(30, 'minute')) && (
            <span className="px-3 py-1 rounded bg-amber-100 text-amber-800">Late</span>
          )}
        </span>,
        punchOut: emp.punchOut && <span className="flex items-center gap-1"><IoMdTime className="text-[16px] text-blue-700" /> {dayjs(emp.punchOut).format('hh:mm A')}
          {dayjs(emp.punchOut).isBefore(dayjs(emp.punchOut).startOf('day').add(17, 'hour').add(30, 'minute')) && (
            <span className="px-3 py-1 rounded bg-sky-100 text-sky-800">Early</span>
          )}
          {dayjs(emp.punchOut).isAfter(dayjs(emp.punchOut).startOf('day').add(18, 'hour').add(15, 'minute')) && (
            <span className="px-3 py-1 rounded bg-amber-100 text-amber-800">Overtime</span>
          )}
        </span>,
        workingHours: emp.workingMinutes && <span>{minutesinhours(emp.workingMinutes)}
          {emp.workingMinutes < 300 && <span className="px-3 py-1 rounded bg-amber-100 text-amber-800">Short</span>}
        </span>,
        action: (<div className="action flex gap-2.5">
          <span className="edit text-[18px] text-blue-500 cursor-pointer" title="Edit" onClick={() => edite(emp)}><MdOutlineModeEdit /></span>
          <span className="delete text-[18px] text-red-500 cursor-pointer" onClick={() => deletee(emp._id)}><AiOutlineDelete /></span>
        </div>)
      }
    })
    // console.log(res.data.list)
    setattandencelist(data);
  }, [attandence]);

  const edite = () => {

  }
  const deletee = () => {

  }

  const submitHandle = async (e) => {
    e.preventDefault();
    const res = await submitAttandence({ isPunchIn, inp, setisload });
    console.log(res)
    if (res) {
      setopenmodal(false);
      setinp(init);
    }
  }



  const handleRowSelect = ({ selectedRows }) => {
    console.log("Selected Rows:", selectedRows);
    setselectedRows(selectedRows)
  };

  return (
    <div className='p-8'>
      <div className="text-2xl text-gray-900 mb-8">Attendance Tracker</div>
      <div className="bg-white flex flex-col rounded mb-8 p-2">
        <div className="flex justify-between items-center mb-4">
          <div className="flex p-1 items-center gap-2 rounded bg-teal-600">
            <p onClick={() => setmarkattandence(false)} className={`px-2 py-1 rounded cursor-pointer ${!markattandence && `  bg-white`}`}>View Attendance</p>
            <p onClick={() => setmarkattandence(true)} className={`px-2 py-1 rounded cursor-pointer ${markattandence && `  bg-white`}`}>Mark Attendance</p>
          </div>

          <div className="flex gap-2">
            {selectedRows.length > 0 && <Button variant='contained' color="error" startIcon={<AiOutlineDelete />} >Delete ({selectedRows.length})</Button>}
            <Button variant='outlined' startIcon={<FiDownload />} >Export</Button>
          </div>
        </div>
        <div className="flex items-center gap-4 ">
          {markattandence ?
            <div className="flex p-1 items-center gap-2">
              <Button variant='contained'  onClick={() => setopenmodal(true)} startIcon={<GoPlus />} >Mark Indivisual</Button>
              <Button variant='outlined' onClick={()=> setbullmodal(true)}  startIcon={<BiGroup />} >Mark Bulk</Button>
            </div> :
            <div className="flex items-center gap-4 ">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={filtere.date}
                  format="DD-MM-YYYY"
                  onChange={(newValue) => {
                    setfiltere({ ...filtere, date: dayjs(newValue) })
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                    },
                  }} label="Select date" />
              </LocalizationProvider>
              <FormControl sx={{ width: '160px' }} required size="small">
                <InputLabel id="demo-simple-select-helper-label">Department</InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={filtere.departmente}
                  name="Department"
                  label="Department"
                  input={
                    <OutlinedInput
                      startAdornment={
                        <InputAdornment position="start">
                          <CiFilter fontSize="small" />
                        </InputAdornment>
                      }
                      label="Department"
                    />
                  }
                  onChange={(e) => setfiltere({ ...filtere, departmente: e.target.value })}
                // onChange={(e) => handleChange(e, 'department')}
                >
                  <MenuItem selected value={'all'}>All</MenuItem>
                  {department?.map((val) => {
                    return <MenuItem key={val._id} value={val._id}>{val.department}</MenuItem>
                  })}

                </Select>
              </FormControl>
              <FormControl sx={{ width: '160px' }} required size="small">
                <InputLabel id="demo-simple-select-helper-label">Status</InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={filtere.status}
                  name="Department"
                  label="status"
                  input={
                    <OutlinedInput
                      startAdornment={
                        <InputAdornment position="start">
                          <CiFilter fontSize="small" />
                        </InputAdornment>
                      }
                      label="Status"
                    />
                  }
                  onChange={(e) => console.log(e)}
                >
                  <MenuItem value={""}>Sales</MenuItem>
                </Select>
              </FormControl>
            </div>
          }
        </div>
      </div>
      <div>
        <DataTable
          columns={columns}
          data={isFilterActive ? filterattandence : attandencelist}
          pagination
          selectableRows
          customStyles={customStyles}
          onSelectedRowsChange={handleRowSelect}
          highlightOnHover
          noDataComponent={
            <div className="flex items-center gap-2 py-6 text-center text-gray-600 text-sm">
             <BiMessageRoundedError className="text-xl"/> No records found matching your criteria.
            </div>
          }
        />
      </div>
      <MarkAttandence isPunchIn={isPunchIn} setisPunchIn={setisPunchIn} submitHandle={submitHandle} init={init} openmodal={openmodal} inp={inp} setinp={setinp}
        setopenmodal={setopenmodal} isUpdate={isUpdate} setisUpdate={setisUpdate} isload={isload}
      />
      <BulkMark isPunchIn={isPunchIn} setisPunchIn={setisPunchIn} submitHandle={submitHandle} init={init} openmodal={bullmodal} inp={inp} setinp={setinp}
        setopenmodal={bullmodal} isUpdate={isUpdate} setisUpdate={setisUpdate} isload={isload}
      />
    </div>
  )
}

export default Attandence
