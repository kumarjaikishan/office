import { CiFilter } from "react-icons/ci";
import { Avatar, Box, Button, IconButton, OutlinedInput, TextField, Typography } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import DataTable from "react-data-table-component";
import { columns, customStyles, deleteAttandence,submitAttandence } from "./attandencehelper";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MdClear, MdOutlineModeEdit } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { IoEyeOutline, IoSearch } from "react-icons/io5";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FiDownload } from "react-icons/fi";
import { BiGroup } from "react-icons/bi";
import { GoPlus } from "react-icons/go";
import { BiMessageRoundedError } from "react-icons/bi";
import { useEffect, useState } from "react";
import MarkAttandence from "./MarkAttandence";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { IoMdTime } from "react-icons/io";
import BulkMark from "./BulkMark";
import { FaRegUser } from "react-icons/fa";
import { useDispatch } from "react-redux";
import MarkAttandenceedit from "./MarkAttandenceedit";

const Attandence = () => {
  const [markattandence, setmarkattandence] = useState(false);
  const [isUpdate, setisUpdate] = useState(false);
  const [isload, setisload] = useState(false);
  const [openmodal, setopenmodal] = useState(false);
  const [atteneditmodal, setatteneditmodal] = useState(false);
  const [bullmodal, setbullmodal] = useState(false);
  const { branch, attandence, department, company } = useSelector((state) => state.user);
  const [attandencelist, setattandencelist] = useState([]);
  const [filterattandence, setfilterattandence] = useState([]);
  const [isPunchIn, setisPunchIn] = useState(true);
  const [selectedRows, setselectedRows] = useState([]);
  const dispatch = useDispatch();


  const init = {
    employeeId: '',
    date: dayjs(),
    punchIn: null,
    punchOut: null,
    status: '',
  }

  const init2 = {
    id: '',
    employeeName: '',
    date: dayjs(),
    punchIn: null,
    punchOut: null,
    status: '',
  }
  const [inp, setinp] = useState(init);

  useEffect(() => {
    setfiltere((prev) => ({
      ...prev,
      departmente: 'all'
    }));
    inp.punchIn !== null && setinp({ ...inp, status: 'present' })
  }, [inp.punchIn]);

  const [editinp, seteditinp] = useState(init2)

  const [filtere, setfiltere] = useState({
    // date: null,
    date: '',
    branch: 'all',
    departmente: 'all',
    employee: '',
    status: 'all'
  })

  useEffect(() => {
    // setdepartmentlist(department.filter((dep) => dep.branchId._id == filters.branch))
  }, [filtere.branch]);

  const isFilterActive = (
    filtere.branch !== 'all' ||
    filtere.departmente !== 'all' ||
    filtere.status !== 'all' ||
    filtere.employee.trim() !== '' ||
    filtere.date !== null
  );

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
    // console.log(attandencelist)
    if (!attandencelist) return;

    const today = dayjs(); // today's date without time

    const fil = attandencelist.filter((val) => {
      const recordDate = dayjs(val.date, "DD MMM, YYYY");

      // Exclude future dates
      if (recordDate.isAfter(today, 'day')) return false;

      const matchDate =
        !filtere.date || recordDate.isSame(filtere.date, 'day');

      const matchbranch =
        filtere.branch === 'all' || val.branchid === filtere.branch;

      const matchDept =
        filtere.departmente === 'all' || val.departmentId === filtere.departmente;

      const matchStatus =
        filtere.status === 'all' || val.status === filtere.status;

      const matchEmployee =
        filtere.employee.trim() === '' ||
        val.rawname?.toLowerCase().includes(filtere.employee.trim().toLowerCase());

      return matchDate && matchbranch && matchDept && matchStatus && matchEmployee;
    });

    setfilterattandence(fil);
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
      } else {
        setinp({ ...inp, punchIn: null, status: '' })
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
    setfiltere((prev) => ({
      ...prev,
      departmente: 'all'
    }));
  }, [filtere.branch]);



  useEffect(() => {
    // console.log(department)
    // console.log(attandence)
    if (!attandence) return;
    const today = dayjs().startOf('day');

    const data = attandence
      .filter(emp => !dayjs(emp.date).isAfter(today, 'day'))
      .map((emp) => {
        let absent = emp.status == 'absent';
        let leave = emp.status == 'leave';

        return {
          attenid: emp._id,
          departmentId: emp.employeeId.department,
          branchid: emp.employeeId.branchId,
          employeeId: emp.employeeId._id,
          status: emp.status,
          stat: (
            <span className={`${absent ? 'bg-red-100 text-red-800' : leave ? 'bg-violet-100 text-violet-800' : 'bg-green-100 text-green-800'} px-2 py-1 rounded`}>
              {emp.status}
            </span>
          ),
          rawname: emp.employeeId.userid.name,
          name: (
            <div className="flex items-center gap-3">
              <Avatar src={emp.employeeId.profileimage} alt={emp.employeeId.employeename}>
                {!emp.employeeId.profileimage && <FaRegUser />}
              </Avatar>
              <Box>
                <Typography variant="body2">{emp.employeeId.userid.name}</Typography>
              </Box>
            </div>
          ),
          date: dayjs(emp.date).format('DD MMM, YYYY'),
          punchIn: emp.punchIn && (() => {
            const [earlyHour, earlyMinute] = company?.attendanceRules?.considerEarlyEntryBefore.split(':').map(Number);
            const [lateHour, lateMinute] = company?.attendanceRules?.considerLateEntryAfter.split(':').map(Number);

            const earlyThreshold = dayjs(emp.punchIn).startOf('day').add(earlyHour, 'hour').add(earlyMinute, 'minute');
            const lateThreshold = dayjs(emp.punchIn).startOf('day').add(lateHour, 'hour').add(lateMinute, 'minute');

            return (
              <span className="flex items-center gap-1">
                <IoMdTime className="text-[16px] text-blue-700" />
                {dayjs(emp.punchIn).format('hh:mm A')}
                {dayjs(emp.punchIn).isBefore(earlyThreshold) && (
                  <span className="px-3 py-1 rounded bg-sky-100 text-sky-800">Early</span>
                )}
                {dayjs(emp.punchIn).isAfter(lateThreshold) && (
                  <span className="px-3 py-1 rounded bg-amber-100 text-amber-800">Late</span>
                )}
              </span>
            );
          })(),
          punchOut: emp.punchOut && (() => {
            const [earlyHour, earlyMinute] = company?.attendanceRules?.considerEarlyExitBefore.split(':').map(Number);
            const [lateHour, lateMinute] = company?.attendanceRules?.considerLateExitAfter.split(':').map(Number);

            const earlyExitThreshold = dayjs(emp.punchOut).startOf('day').add(earlyHour, 'hour').add(earlyMinute, 'minute');
            const lateExitThreshold = dayjs(emp.punchOut).startOf('day').add(lateHour, 'hour').add(lateMinute, 'minute');

            return (
              <span className="flex items-center gap-1">
                <IoMdTime className="text-[16px] text-blue-700" />
                {dayjs(emp.punchOut).format('hh:mm A')}
                {dayjs(emp.punchOut).isBefore(earlyExitThreshold) && (
                  <span className="px-3 py-1 rounded bg-amber-100 text-amber-800">Early</span>
                )}
                {dayjs(emp.punchOut).isAfter(lateExitThreshold) && (
                  <span className="px-3 py-1 rounded bg-sky-100 text-sky-800">Late</span>
                )}
              </span>
            );
          })(),
          workingHours: emp.workingMinutes && (
            <span>
              {minutesinhours(emp.workingMinutes)}
              {emp.workingMinutes < company?.workingMinutes?.shortDayThreshold && (
                <span className="px-3 py-1 ml-2 rounded bg-amber-100 text-amber-800">Short</span>
              )}
              {emp.workingMinutes > company?.workingMinutes?.overtimeAfterMinutes && (
                <span className="px-3 py-1 ml-2 rounded bg-green-100 text-green-800">Overtime</span>
              )}
            </span>
          ),

          action: (
            <div className="action flex gap-2.5">
              <span className="edit text-[18px] text-blue-500 cursor-pointer" title="Edit" onClick={() => edite(emp)}><MdOutlineModeEdit /></span>
              <span className="delete text-[18px] text-red-500 cursor-pointer" onClick={() => deletee(emp._id)}><AiOutlineDelete /></span>
            </div>
          )
        }

      })
    // console.log(res.data.list)
    setattandencelist(data);
  }, [attandence]);

  const edite = (atten) => {
    console.log(atten)
    seteditinp({
      id: atten._id,
      employeeName: atten?.employeeId?.userid?.name || "",
      date: dayjs(atten.date).format('DD MMM, YYYY'),
      punchIn: atten.punchIn ? dayjs(atten.punchIn) : null,
      punchOut: atten.punchOut ? dayjs(atten.punchOut) : null,
      status: atten.status || ""
    });

    setatteneditmodal(true)
  }

  const deletee = (attanId) => {
    swal({
      title: "Are you sure you want to Delete this record?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((proceed) => {
      if (proceed) {
        deleteAttandence({ attandanceId: [attanId], setisload,dispatch })
      }
    });
  }
  const multidelete = () => {
    let multideletearray = selectedRows.map(id => id.attenid);
    swal({
      title: `Are you sure you want to Delete these ${multideletearray.length} record?`,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((proceed) => {
      if (proceed) {
        deleteAttandence({ attandanceId: multideletearray, setisload })
      }
    });
  }

  const submitHandle = async (e) => {
    e.preventDefault();
    const res = await submitAttandence({ isPunchIn, inp, setisload, dispatch });
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
    <div className='p-2.5'>
      <div className="text-2xl mb-4 font-bold text-slate-800">Attendance Tracker</div>
      <div className="bg-white flex flex-col rounded mb-4 shadow-xl  p-2">
        <div className="flex justify-between items-center mb-4">
          <div className="flex p-1 items-center gap-2 rounded bg-teal-600 text-white">
            <p onClick={() => setmarkattandence(false)} className={`px-2 py-1 rounded cursor-pointer ${!markattandence && `text-teal-700  bg-white`}`}>View Attendance</p>
            <p onClick={() => setmarkattandence(true)} className={`px-2 py-1 rounded cursor-pointer ${markattandence && `text-teal-700  bg-white`}`}>Mark Attendance</p>
          </div>

          <div className="flex gap-2">
            {selectedRows.length > 0 && <Button variant='contained' onClick={multidelete} color="error" startIcon={<AiOutlineDelete />} >Delete ({selectedRows.length})</Button>}
            <Button variant='outlined' startIcon={<FiDownload />} >Export</Button>
          </div>
        </div>
        <div className="flex items-center gap-4 ">
          {markattandence ?
            <div className="flex p-1 items-center gap-2">
              <Button variant='contained' onClick={() => setopenmodal(true)} startIcon={<GoPlus />} >Mark Indivisual</Button>
              <Button variant='outlined' onClick={() => setbullmodal(true)} startIcon={<BiGroup />} >Mark Bulk</Button>
            </div> :
            <div className="flex items-center gap-4 flex-wrap">
              <CiFilter size={24} color="teal" />
              {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
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
              </LocalizationProvider> */}

              <TextField
                size='small'
                type="date"
                sx={{ width: '160px' }}
                value={filtere.date}
                onChange={(e) => {
                  setfiltere({ ...filtere, date: e.target.value })
                }}
                label="Select Date"
                InputLabelProps={{ shrink: true }}
              />

              <FormControl sx={{ width: '160px' }} size="small">
                <InputLabel id="demo-simple-select-helper-label">Branch</InputLabel>
                <Select
                  value={filtere.branch}
                  input={
                    <OutlinedInput
                      startAdornment={
                        <InputAdornment position="start">
                          <CiFilter fontSize="small" />
                        </InputAdornment>
                      }
                      label="Branch"
                    />
                  }
                  onChange={(e) => setfiltere({ ...filtere, branch: e.target.value })}
                // onChange={(e) => handleChange(e, 'department')}
                >
                  <MenuItem selected value={'all'}>All</MenuItem>
                  {branch?.map((val) => {
                    return <MenuItem key={val._id} value={val._id}>{val.name}</MenuItem>
                  })}

                </Select>
              </FormControl>
              <FormControl sx={{ width: '160px' }} size="small">
                <InputLabel id="demo-simple-select-helper-label">Department</InputLabel>
                <Select
                  value={filtere.departmente}
                  disabled={filtere.branch == 'all'}
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
                  {department?.filter(e => e.branchId._id == filtere.branch).map((val) => {
                    return <MenuItem key={val._id} value={val._id}>{val.department}</MenuItem>
                  })}

                </Select>
              </FormControl>

              <FormControl sx={{ width: '160px' }} size="small">
                <InputLabel id="demo-simple-select-helper-label">Status</InputLabel>
                <Select
                  value={filtere.status}
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
                  onChange={(e) => setfiltere({ ...filtere, status: e.target.value })}
                >
                  <MenuItem value={"all"}>All</MenuItem>
                  <MenuItem value={"present"}>Present</MenuItem>
                  <MenuItem value={"absent"}>Absent</MenuItem>
                  <MenuItem value={"leave"}>Leave</MenuItem>
                  <MenuItem value={"half day"}>Half Day</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size='small'
                sx={{ width: '160px' }}
                value={filtere.employee}
                onChange={(e) => setfiltere({ ...filtere, employee: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><IoSearch /></InputAdornment>,
                  endAdornment: filtere.employee && (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setfiltere({ ...filtere, employee: "" })} edge="end" size="small"
                      >
                        <MdClear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                label="Search Employee"
              />
            </div>
          }
        </div>
      </div>
      <div className="capitalize">
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
              <BiMessageRoundedError className="text-xl" /> No records found matching your criteria.
            </div>
          }
        />
      </div>
      <MarkAttandence isPunchIn={isPunchIn} setisPunchIn={setisPunchIn} submitHandle={submitHandle} init={init} openmodal={openmodal} inp={inp} setinp={setinp}
        setopenmodal={setopenmodal} isUpdate={isUpdate} setisUpdate={setisUpdate} isload={isload}
      />
      <MarkAttandenceedit dispatch={dispatch} setisload={setisload} submitHandle={submitHandle} init={init2} openmodal={atteneditmodal} inp={editinp} setinp={seteditinp}
        setopenmodal={setatteneditmodal} isUpdate={isUpdate} setisUpdate={setisUpdate} isload={isload}
      />
      <BulkMark isPunchIn={isPunchIn} setisPunchIn={setisPunchIn} submitHandle={submitHandle} init={init} openmodal={bullmodal} inp={inp} setinp={setinp}
        setopenmodal={setbullmodal} isUpdate={isUpdate} setisUpdate={setisUpdate} isload={isload}
      />
    </div>
  )
}

export default Attandence
