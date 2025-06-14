import { CiFilter } from "react-icons/ci";
import { Button, OutlinedInput } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import DataTable from "react-data-table-component";
import { columns } from "./attandencehelper";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MdOutlineModeEdit } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { IoEyeOutline } from "react-icons/io5";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FiDownload } from "react-icons/fi";
import { BiGroup } from "react-icons/bi";
import { GoPlus } from "react-icons/go";
import { useEffect, useState } from "react";
import MarkAttandence from "./MarkAttandence";
import dayjs from "dayjs";
import { submitAttandence } from "./attandencehelper";
import { useSelector } from "react-redux";
import { IoMdTime } from "react-icons/io";

const Attandence = () => {
  const [markattandence, setmarkattandence] = useState(false);
  const [isUpdate, setisUpdate] = useState(false);
  const [isload, setisload] = useState(false);
  const [openmodal, setopenmodal] = useState(false);
  const { attandence } = useSelector((state) => state.user);
  const [attandencelist, setattandencelist] = useState([])
  const init = {
    employeeId: '',
    departmentId: '',
    date: dayjs(),
    punchIn: null,
    punchOut: null,
    workingMinutes: '',
    status: '',
  }
  const [inp, setinp] = useState(init);

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
   
    if (inp.employeeId && inp.date) {
      const punchedIn = attandence.find((val) => {
        return (
          val.employeeId._id === inp.employeeId &&
          dayjs(val.date).isSame(dayjs(inp.date), 'day')
        );
      });
      console.log("ckeck already punch", punchedIn)
      if (punchedIn) {
        setinp({...inp,punchIn: dayjs(punchedIn.punchIn),status:punchedIn.status  })
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

    if (minutes < 300) {
      console.log("ab aya")
      formatted = `${hour}h ${minute}m short`;
    }
    return formatted;
  }

  useEffect(() => {
    console.log(attandence)
    if (!attandence) return;
    const data = attandence.map((emp) => {
      return {
        employeeId: emp.employeeId._id,
        status: emp.status,
        name: emp.employeeId.employeename,
        date: dayjs(emp.date).format('DD MMM, YYYY'),
        punchIn: <span className="flex items-center gap-1"><IoMdTime className="text-[16px] text-blue-700" /> {dayjs(emp.punchIn).format('hh:MM A')}</span>,
        punchOut: emp.punchOut && <span className="flex items-center gap-1"><IoMdTime className="text-[16px] text-blue-700" /> {dayjs(emp.punchOut).format('hh:MM A')}</span>,
        workingHours: emp.workingMinutes && <span className={emp.workingMinutes < 300 && 'text-red-600'}>{minutesinhours(emp.workingMinutes)}</span> ,
        action: (<div className="action flex gap-2.5">
          <span className="eye edit text-[18px] text-green-500 cursor-pointer" ><IoEyeOutline /></span>
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
    const res = await submitAttandence({ inp, setisload });
    console.log(res)
    if (res) {
      setopenmodal(false);
      setinp(init);
    }
  }

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: 'teal', // header background
        fontWeight: 'bold',         // font weight
        fontSize: '14px',
        color: 'white',             // header cell height
        padding: '0px 5px',
      },
    },
    headRow: {
      style: {
      },
    },
    rows: {
      style: {
        minHeight: '48px',          // height of each row
      },
    },
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
            <Button variant='contained' color="error" startIcon={<AiOutlineDelete />} >Delete ({2})</Button>
            <Button variant='outlined' startIcon={<FiDownload />} >Export</Button>
          </div>
        </div>
        <div className="flex items-center gap-4 ">
          {markattandence ?
            <div className="flex p-1 items-center gap-2">
              <Button variant='contained' color="secondary" onClick={() => setopenmodal(true)} startIcon={<GoPlus />} >Mark Indivisual</Button>
              <Button variant='outlined' color="success" startIcon={<BiGroup />} >Mark Bulk</Button>
            </div> :
            <div className="flex items-center gap-4 ">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  slotProps={{
                    textField: {
                      size: 'small',
                    },
                  }} label="Delect date" />
              </LocalizationProvider>
              <FormControl sx={{ width: '160px' }} required size="small">
                <InputLabel id="demo-simple-select-helper-label">Department</InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={""}
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
                // onChange={(e) => handleChange(e, 'department')}
                >

                  <MenuItem value={""}>Sales</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ width: '160px' }} required size="small">
                <InputLabel id="demo-simple-select-helper-label">Status</InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={""}
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
                // onChange={(e) => handleChange(e, 'department')}
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
          data={attandencelist}
          pagination
          selectableRows
          customStyles={customStyles}
          highlightOnHover
        />
      </div>
      <MarkAttandence submitHandle={submitHandle} init={init} openmodal={openmodal} inp={inp} setinp={setinp}
        setopenmodal={setopenmodal} isUpdate={isUpdate} setisUpdate={setisUpdate} isload={isload}
      />
    </div>
  )
}

export default Attandence
