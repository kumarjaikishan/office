import { CiFilter } from "react-icons/ci";
import { Avatar, Box, Button, IconButton, OutlinedInput, TextField, Typography } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import DataTable from "react-data-table-component";
import { columns, deleteAttandence, submitAttandence } from "./attandencehelper";
import { useCustomStyles } from "./attandencehelper";
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
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useSelector } from "react-redux";
import { IoMdTime } from "react-icons/io";
import BulkMark from "./BulkMark";
import { FaRegUser } from "react-icons/fa";
import { useDispatch } from "react-redux";
import MarkAttandenceedit from "./MarkAttandenceedit";
import CheckPermission from "../../../utils/CheckPermission";

dayjs.extend(isSameOrBefore);

const Attandence = () => {
  const [markattandence, setmarkattandence] = useState(false);
  const [isUpdate, setisUpdate] = useState(false);
  const [isload, setisload] = useState(false);
  const [openmodal, setopenmodal] = useState(false);
  const [atteneditmodal, setatteneditmodal] = useState(false);
  const [bullmodal, setbullmodal] = useState(false);
  const { branch, attandence, department, company, holidays } = useSelector((state) => state.user);
  const [attandencelist, setattandencelist] = useState([]);
  const [filterattandence, setfilterattandence] = useState([]);
  const [isPunchIn, setisPunchIn] = useState(true);
  const [selectedRows, setselectedRows] = useState([]);
  const [holidaydate, setholidaydate] = useState([]);
  const dispatch = useDispatch();
  const customStyles = useCustomStyles();
  const [sortedData, setSortedData] = useState([]);


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
    status: 'all',
    month: 'all',
    year: 'all',
  })

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];


  useEffect(() => {
    // setdepartmentlist(department.filter((dep) => dep.branchId._id == filters.branch))
  }, [filtere.branch]);

  const isFilterActive = (
    filtere.branch !== 'all' ||
    filtere.departmente !== 'all' ||
    filtere.status !== 'all' ||
    filtere.month !== 'all' ||
    filtere.year !== 'all' ||
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

      const matchMonth =
        filtere.month === "all" || recordDate.month() === Number(filtere.month);

      const matchYear =
        filtere.year === "all" || recordDate.year() === Number(filtere.year);


      const matchbranch =
        filtere.branch === 'all' || val.branchid === filtere.branch;

      const matchDept =
        filtere.departmente === 'all' || val.departmentId === filtere.departmente;

      const matchStatus =
        filtere.status === 'all' || val.status === filtere.status;

      const matchEmployee =
        filtere.employee.trim() === '' ||
        val.rawname?.toLowerCase().includes(filtere.employee.trim().toLowerCase());

      return matchDate && matchbranch && matchDept && matchStatus && matchEmployee && matchMonth && matchYear;
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

  const canAdd = CheckPermission('attandence', 2);
  const canEdit = CheckPermission('attandence', 3);
  const canDelete = CheckPermission('attandence', 4);

  useEffect(() => {
    if (!holidays) return;
    // console.log(holidays)

    const dateObjects = [];
    holidays.forEach(holiday => {
      let current = dayjs(holiday.fromDate);
      const end = holiday.toDate ? dayjs(holiday.toDate) : current;

      while (current.isSameOrBefore(end, 'day')) {
        dateObjects.push(current.format('DD/MM/YYYY'));
        current = current.add(1, 'day');
      }

    });
    setholidaydate(dateObjects);
  }, [holidays]);

  useEffect(() => {
    // console.log(company)
    // console.log(branch)
    // console.log(attandence)

    if (!attandence) return;
    const today = dayjs().startOf('day');

    const data = attandence
      .filter(emp => !dayjs(emp.date).isAfter(today, 'day'))
      .map((emp) => {
        const day = dayjs(emp.date).startOf('day').day();
        let formatdate = dayjs(emp.date).format('DD/MM/YYYY');
        let absent = emp.status == 'absent';
        let leave = emp.status == 'leave';
        let isholday = emp.status == 'holiday';
        let isweeklyoff = emp.status == 'weekly off';


        const ifdirretent = branch.filter(e => e._id == emp.branchId && e.defaultsetting == false)[0];
        // console.log("caught different", ifdirretent)
        const attendanceSetting = ifdirretent ? {
          attendanceRules: ifdirretent?.setting?.attendanceRules,
          workingMinutes: ifdirretent?.setting?.workingMinutes,
          weeklyOffs: ifdirretent?.setting?.weeklyOffs
        } : {
          attendanceRules: company?.attendanceRules,
          workingMinutes: company?.workingMinutes,
          weeklyOffs: company?.weeklyOffs
        }
        const isWeeklyOff = attendanceSetting?.weeklyOffs.includes(day);
        const isHoliday = holidaydate.includes(formatdate);

        return {
          attenid: emp?._id,
          remarks: (isHoliday && emp?.workingMinutes) ? "Worked on Holiday" : (isWeeklyOff && emp.workingMinutes) ? "Worked on Weekly Off" : undefined,
          departmentId: emp?.employeeId?.department,
          branchid: emp?.branchId,
          employeeId: emp?.employeeId?._id,
          status: emp?.status,
          stat: (
            <span
              className={`px-2 py-1 rounded
                 ${absent ? 'bg-red-100 text-red-800'
                  : leave ? 'bg-amber-100 text-amber-800'
                    : (isholday || isweeklyoff) ? 'bg-blue-50 text-blue-800'
                      : 'bg-green-100 text-green-800'
                }`}
            >
              {emp.status}
            </span>
          ),
          rawname: emp?.employeeId?.userid?.name,
          rawpunchIn: emp?.punchIn ? dayjs(emp?.punchIn).format('hh:mm A') : '-',
          rawpunchOut: emp?.punchOut ? dayjs(emp?.punchOut).format('hh:mm A') : '-',
          rawworkingHour: emp.workingMinutes || '-',
          name: (
            <div className="flex items-center gap-3">
              <Avatar src={emp?.employeeId?.profileimage} alt={emp?.employeeId?.employeename}>
                {!emp?.employeeId?.profileimage && <FaRegUser />}
              </Avatar>
              <Box>
                <Typography variant="body2">{emp?.employeeId?.userid?.name}</Typography>
              </Box>
            </div>
          ),
          date: dayjs(emp.date).format('DD MMM, YYYY'),
          //  date: <div> <p>{dayjs(emp.date).format('DD MMM, YYYY')}</p> <p className="text-[12px] text-gray-500">{isHoliday ? '(Holiday)':isWeeklyOff ? "(Weekly Off)":''}</p> </div>,
          punchIn: emp.punchIn && (() => {
            const [earlyHour, earlyMinute] = attendanceSetting?.attendanceRules?.considerEarlyEntryBefore.split(':').map(Number);
            const [lateHour, lateMinute] = attendanceSetting?.attendanceRules?.considerLateEntryAfter.split(':').map(Number);

            const earlyThreshold = dayjs(emp.punchIn).startOf('day').add(earlyHour, 'hour').add(earlyMinute, 'minute');
            const lateThreshold = dayjs(emp.punchIn).startOf('day').add(lateHour, 'hour').add(lateMinute, 'minute');

            return (
              <span className="flex items-center gap-1">
                <IoMdTime className="text-[16px] text-blue-700" />
                {dayjs(emp.punchIn).format('hh:mm A')}

                {isWeeklyOff || isHoliday ? '' : (
                  <>
                    {dayjs(emp.punchIn).isBefore(earlyThreshold) && (
                      <span className="px-2 py-1 rounded bg-sky-100 text-sky-800">Early</span>
                    )}
                    {dayjs(emp.punchIn).isAfter(lateThreshold) && (
                      <span className="px-2 py-1 rounded bg-amber-100 text-amber-800">Late</span>
                    )}
                  </>
                )}
              </span>
            );
          })(),
          punchOut: emp.punchOut && (() => {
            const [earlyHour, earlyMinute] = attendanceSetting?.attendanceRules?.considerEarlyExitBefore.split(':').map(Number);
            const [lateHour, lateMinute] = attendanceSetting?.attendanceRules?.considerLateExitAfter.split(':').map(Number);

            const earlyExitThreshold = dayjs(emp.punchOut).startOf('day').add(earlyHour, 'hour').add(earlyMinute, 'minute');
            const lateExitThreshold = dayjs(emp.punchOut).startOf('day').add(lateHour, 'hour').add(lateMinute, 'minute');

            return (
              <span className="flex items-center gap-1">
                <IoMdTime className="text-[16px] text-blue-700" />
                {dayjs(emp.punchOut).format('hh:mm A')}
                {isWeeklyOff || isHoliday ? '' : (
                  <>
                    {dayjs(emp.punchOut).isBefore(earlyExitThreshold) && (
                      <span className="px-2 py-1 rounded bg-amber-100 text-amber-800">Early</span>
                    )}
                    {dayjs(emp.punchOut).isAfter(lateExitThreshold) && (
                      <span className="px-2 py-1 rounded bg-sky-100 text-sky-800">Late</span>
                    )}
                  </>
                )}

              </span>
            );
          })(),

          workingHours: emp.workingMinutes && (
            <div className="bordere">
              <p>
                <span className=" inline-block w-[50px]"> {minutesinhours(emp.workingMinutes)}</span>

                {isWeeklyOff || isHoliday ? (
                  <span className="px-1  py-1 ml-2 rounded bg-green-100 text-green-800">
                    Overtime {emp.workingMinutes} min
                  </span>
                ) : (
                  <>
                    {emp.workingMinutes < attendanceSetting?.workingMinutes?.fullDay && (
                      <span className="px-1  py-1 ml-2 rounded bg-amber-100 text-amber-800">
                        Short {attendanceSetting?.workingMinutes?.fullDay - emp.workingMinutes} min
                      </span>
                    )}
                    {emp.workingMinutes > attendanceSetting?.workingMinutes?.fullDay && (
                      <span className="px-1 py-1 ml-2 rounded bg-green-100 text-green-800">
                        Overtime {emp.workingMinutes - attendanceSetting?.workingMinutes?.fullDay} min
                      </span>
                    )}
                  </>
                )}
              </p>
              <p className="text-[12px] mt-1 text-gray-600">{isHoliday ? '(Holiday)' : isWeeklyOff ? "(Weekly Off)" : ''}</p>
            </div>
          ),
          action: (
            <div className="action flex gap-2.5">
              {canEdit && <span className="edit text-[18px] text-blue-500 cursor-pointer" title="Edit" onClick={() => edite(emp)}><MdOutlineModeEdit /></span>}
              {canDelete && <span className="delete text-[18px] text-red-500 cursor-pointer" onClick={() => deletee(emp._id)}><AiOutlineDelete /></span>}
            </div>
          )
        }

      })
    // console.log(res.data.list)
    setattandencelist(data);
  }, [attandence]);

  const edite = (atten) => {
    // console.log(atten)
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
    }).then(async (proceed) => {
      if (proceed) {
        await deleteAttandence({ attandanceId: [attanId], setisload, dispatch });
        setselectedRows([]);
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
    }).then(async (proceed) => {
      if (proceed) {
        await deleteAttandence({ attandanceId: multideletearray, setisload, dispatch });
        setselectedRows([]);
      }
    });
  }

  const submitHandle = async (e) => {
    e.preventDefault();
    const res = await submitAttandence({ isPunchIn, inp, setisload, dispatch });
    // console.log(res)
    if (res) {
      setopenmodal(false);
      setinp(init);
    }
  }

  const handleRowSelect = ({ selectedRows }) => {
    // console.log("Selected Rows:", selectedRows);
    setselectedRows(selectedRows)
  };

  const conditionalRowStyles = [
    {
      when: row => row.remarks,
      style: {
        backgroundColor: 'rgba(21, 233, 233, 0.1)',
        color: 'teal'
      },
    },
  ];

  const exportCSV = () => {
    const dataset = sortedData.length > 0 ? sortedData : (isFilterActive ? filterattandence : attandencelist);

    const headers = ["S.no", "Name", "Date", "Punch In", "Punch Out", "Status", "Working Minutes"];
    const rows = dataset.map((e, idx) => [
      idx + 1, e.rawname, dayjs(e.date).format('YYYY-MM-DD'), e.rawpunchIn, e.rawpunchOut, e.status, e.rawworkingHour
    ]);

    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Attendance List.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSort = (column, sortDirection) => {
    // console.log("sorting", column, sortDirection)
    const data = [...(isFilterActive ? filterattandence : attandencelist)];

    data.sort((a, b) => {
      const aVal = a[column.id];
      const bVal = b[column.id];

      if (sortDirection === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    setSortedData(data);
  };


  return (
    <div className='p-1'>
      {/* <div className="text-2xl mb-4 font-bold text-slate-800">Attendance Tracker</div> */}
      <div className="bg-white flex flex-col rounded mb-4 shadow-xl  p-2">
        <div className="flex justify-between items-center mb-4 flex-wrap">
          <div className="flex w-full md:w-auto p-1 items-center gap-2 rounded bg-primary text-white">
            <p onClick={() => setmarkattandence(false)} className={`px-2 text-center flex-1 md:flex-none py-1 rounded cursor-pointer ${!markattandence && `text-primary  bg-white`}`}>View Attendance</p>
            {canAdd && <p onClick={() => setmarkattandence(true)} className={`px-2 text-center flex-1 md:flex-none py-1 rounded cursor-pointer ${markattandence && `text-primary  bg-white`}`}>Mark Attendance</p>}
          </div>

          <div className="flex w-full md:w-[320px]  mt-1 md:mt-0  gap-2">
            {selectedRows.length > 0 && <Button className="flex-1" variant='contained' onClick={multidelete} color="error" startIcon={<AiOutlineDelete />} >Delete ({selectedRows.length})</Button>}
            <Button onClick={exportCSV} className="flex-1" variant='outlined' startIcon={<FiDownload />} >Export</Button>
          </div>
        </div>
        <div className="flex items-center gap-4 ">
          {markattandence ?
            <div className="flex p-1 items-center gap-2">
              <Button variant='contained' onClick={() => setopenmodal(true)} startIcon={<GoPlus />} >Mark Indivisual</Button>
              <Button variant='outlined' onClick={() => setbullmodal(true)} startIcon={<BiGroup />} >Mark Bulk</Button>
            </div> :
            <div className="border-1 border-gray-400 rounded p-3 md:p-0 md:border-0 grid grid-cols-2 md:grid-cols-7 gap-2 mt-1 w-full md:w-fit">
              {/* <CiFilter className="hidden md:block" size={24} color="teal" /> */}

              <TextField
                size="small"
                type="date"
                className="col-span-2 md:col-span-1 md:w-[150px]"
                value={filtere.date}
                onChange={(e) => setfiltere({ ...filtere, date: e.target.value })}
                label="Select Date"
                InputLabelProps={{ shrink: true }}
              />

              <FormControl size="small" className="col-span-1 md:w-[150px]">
                <InputLabel>Branch</InputLabel>
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
                >
                  <MenuItem value="all">All</MenuItem>
                  {branch?.map((val) => (
                    <MenuItem key={val._id} value={val._id}>
                      {val.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" className="col-span-1 md:w-[150px]">
                <InputLabel>Department</InputLabel>
                <Select
                  value={filtere.departmente}
                  disabled={filtere.branch === "all"}
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
                >
                  <MenuItem value="all">All</MenuItem>
                  {department
                    ?.filter((e) => e.branchId?._id === filtere.branch)
                    .map((val) => (
                      <MenuItem key={val._id} value={val._id}>
                        {val.department}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <FormControl size="small" className="col-span-1 md:w-[150px]">
                <InputLabel>Status</InputLabel>
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
                  <MenuItem value={'all'}>All</MenuItem>
                  <MenuItem value={'present'}>Present</MenuItem>
                  <MenuItem value={'leave'}>Leave</MenuItem>
                  <MenuItem value={'absent'}>Absent</MenuItem>
                  <MenuItem value={'weekly off'}>Weekly off</MenuItem>
                  <MenuItem value={'holiday'}>Holiday</MenuItem>
                  <MenuItem value={'half day'}>Half Day</MenuItem>
                </Select>
              </FormControl>

              <TextField
                size="small"
                className="col-span-1 md:w-[150px]"
                value={filtere.employee}
                onChange={(e) => setfiltere({ ...filtere, employee: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IoSearch />
                    </InputAdornment>
                  ),
                  endAdornment: filtere.employee && (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setfiltere({ ...filtere, employee: "" })}
                        edge="end"
                        size="small"
                      >
                        <MdClear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                label="Search Employee"
              />
              <FormControl size="small" className="col-span-1 md:w-[150px]">
                <InputLabel>Month</InputLabel>
                <Select
                  value={filtere.month}
                  label="Month"
                  onChange={(e) => setfiltere({ ...filtere, month: e.target.value })}
                >
                  <MenuItem value='all'>All</MenuItem>
                  {months.map((m, idx) => (
                    <MenuItem key={idx} value={idx}>{m}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" className="col-span-1 md:w-[150px]">
                <InputLabel>Year</InputLabel>
                <Select
                  value={filtere.year}
                  label="Year"
                  onChange={(e) => setfiltere({ ...filtere, year: e.target.value })}
                >
                  <MenuItem value='all'>All</MenuItem>
                  {Array.from({ length: 5 }, (_, i) => dayjs().year() - 2 + i).map(y => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          }

        </div>
      </div>

      <div className="capitalize">
        <DataTable
          columns={columns}
          data={isFilterActive ? filterattandence : attandencelist}
          pagination
          onSort={handleSort}
          selectableRows
          customStyles={customStyles}
          conditionalRowStyles={conditionalRowStyles}
          onSelectedRowsChange={handleRowSelect}
          highlightOnHover
           paginationPerPage={20} 
          paginationRowsPerPageOptions={[20, 50, 100, 300, `${isFilterActive ? filterattandence?.length : attandencelist?.length}`]}
          noDataComponent={
            <div className="flex items-center gap-2 py-6 text-center text-gray-600 text-sm">
              <BiMessageRoundedError className="text-xl" /> No records found.
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
      <BulkMark isPunchIn={isPunchIn} dispatch={dispatch} setisPunchIn={setisPunchIn} submitHandle={submitHandle} init={init} openmodal={bullmodal} inp={inp} setinp={setinp}
        setopenmodal={setbullmodal} isUpdate={isUpdate} setisUpdate={setisUpdate} isload={isload}
      />
    </div>
  )
}

export default Attandence
