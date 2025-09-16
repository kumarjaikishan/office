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
import { useEffect, useMemo, useState, useCallback } from "react";
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
import { cloudinaryUrl } from "../../../utils/imageurlsetter";

dayjs.extend(isSameOrBefore);

const Attandence = () => {
  const [markattandence, setmarkattandence] = useState(false);
  const [isUpdate, setisUpdate] = useState(false);
  const [isload, setisload] = useState(false);
  const [openmodal, setopenmodal] = useState(false);
  const [isPunchIn, setisPunchIn] = useState(true);
  const [atteneditmodal, setatteneditmodal] = useState(false);
  const [bullmodal, setbullmodal] = useState(false);
  const { branch, attandence, department, company, holidays } = useSelector(
    (state) => state.user
  );
  const [selectedRows, setselectedRows] = useState([]);
  const [holidaydate, setholidaydate] = useState([]);
  const dispatch = useDispatch();
  const customStyles = useCustomStyles();
  const [sortConfig, setSortConfig] = useState({ column: null, direction: null });

  const init = {
    employeeId: "",
    date: dayjs(),
    punchIn: null,
    punchOut: null,
    status: "",
    reason: '',
  };

  const init2 = {
    id: '',
    employeeName: '',
    date: dayjs(),
    punchIn: null,
    punchOut: null,
    status: '',
    leaveid: '',
    leaveReason: ''
  }

  const [inp, setinp] = useState(init);
  const [editinp, seteditinp] = useState(init2)

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  useEffect(() => {
    if (!holidays) return;
    const dateObjects = [];
    holidays.forEach((holiday) => {
      let current = dayjs(holiday.fromDate);
      const end = holiday.toDate ? dayjs(holiday.toDate) : current;
      while (current.isSameOrBefore(end, "day")) {
        dateObjects.push(current.format("DD/MM/YYYY"));
        current = current.add(1, "day");
      }
    });
    setholidaydate(dateObjects);
  }, [holidays]);

  const minutesinhours = useCallback((minutes) => {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    return `${hour}h ${minute}m`;
  }, []);

  const canAdd = CheckPermission("attandence", 2);
  const canEdit = CheckPermission("attandence", 3);
  const canDelete = CheckPermission("attandence", 4);

  // Transform raw attendance → display-ready list
  const attandencelist = useMemo(() => {
    if (!attandence) return [];
    // console.log(attandence)
    const today = dayjs().startOf("day");

    return attandence
      .filter((emp) => !dayjs(emp.date).isAfter(today, "day"))
      .map((emp) => {
        const dayNum = dayjs(emp.date).startOf("day").day();
        let formatdate = dayjs(emp.date).format("DD/MM/YYYY");
        let absent = emp.status === "absent";
        let leave = emp.status === "leave";
        let isholday = emp.status === "holiday";
        let isweeklyoff = emp.status === "weekly off";

        const ifdirretent = branch.filter(
          (e) => e._id === emp.branchId && e.defaultsetting === false
        )[0];

        const attendanceSetting = ifdirretent
          ? {
            attendanceRules: ifdirretent?.setting?.attendanceRules,
            workingMinutes: ifdirretent?.setting?.workingMinutes,
            weeklyOffs: ifdirretent?.setting?.weeklyOffs,
          }
          : {
            attendanceRules: company?.attendanceRules,
            workingMinutes: company?.workingMinutes,
            weeklyOffs: company?.weeklyOffs,
          };

        const isWeeklyOff = attendanceSetting?.weeklyOffs.includes(dayNum);
        const isHoliday = holidaydate.includes(formatdate);

        return {
          attenid: emp?._id,
          departmentId: emp?.employeeId?.department,
          branchid: emp?.branchId,
          employeeId: emp?.employeeId?._id,
          status: emp?.status,
          stat: (
            <span title={emp.status == 'leave' ? emp?.leave?.reason : ''}
              className={`px-2 py-1 rounded
                 ${absent ? 'bg-red-100 text-red-800'
                  : leave ? 'bg-amber-100 text-amber-800'
                    // : (isholday || isweeklyoff) ? 'bg-blue-50 text-blue-800'
                    : isholday ? 'bg-blue-50 text-blue-800'
                      : isweeklyoff ? 'bg-gray-50 text-gray-800'
                        : 'bg-green-100 text-green-800'
                }`}
            >
              {emp.status}
            </span>
          ),
          remarks:
            (isHoliday && emp?.workingMinutes) || (isWeeklyOff && emp?.workingMinutes)
              ? "Worked Extra"
              : undefined,
          rawname: emp?.employeeId?.userid?.name,
          rawpunchIn: emp?.punchIn ? dayjs(emp?.punchIn).format('hh:mm A') : '-',
          rawpunchOut: emp?.punchOut ? dayjs(emp?.punchOut).format('hh:mm A') : '-',
          rawworkingHour: emp.workingMinutes || "-",
          name: (
            <div className="flex items-center gap-3 ">
              <Avatar
                src={cloudinaryUrl(emp?.employeeId?.profileimage, {
                  format: "webp",
                  width: 100,
                  height: 100,
                })}
                alt={emp?.employeeId?.employeename}>
                {!emp?.employeeId?.profileimage && <FaRegUser />}
              </Avatar>
              <Box>
                {/* <Typography variant="body2">{emp?.employeeId?.userid?.name}</Typography> */}
                <p className="text-[12px] md:text-[14px] text-gray-700 font-semibold">{emp?.employeeId?.userid?.name}</p>
              </Box>
            </div>
          ),
          date: dayjs(emp.date).format("DD MMM, YYYY"),
          rawdate: emp?.date,
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
            <div>
              <p>
                <span className="inline-block w-[50px]">
                  {minutesinhours(emp?.workingMinutes)}
                </span>

                {isWeeklyOff || isHoliday ? (
                  <span className="ml-2 px-1 py-1 rounded bg-green-100 text-green-800">
                    Overtime {emp.workingMinutes} min
                  </span>
                ) : (
                  <>
                    {emp.workingMinutes < attendanceSetting?.workingMinutes?.shortDayThreshold && (
                      <span className="ml-2 px-1 py-1 rounded bg-amber-100 text-amber-800">
                        Short {attendanceSetting?.workingMinutes?.shortDayThreshold - emp.workingMinutes} min
                      </span>
                    )}

                    {emp.workingMinutes > attendanceSetting?.workingMinutes?.overtimeAfterMinutes && (
                      <span className="ml-2 p-1 rounded bg-green-100 text-green-800">
                        Overtime {emp.workingMinutes - attendanceSetting?.workingMinutes?.overtimeAfterMinutes} min
                      </span>
                    )}
                  </>
                )}
              </p>

              <p className="text-[12px] mt-1 text-gray-600">
                {isHoliday ? "(Holiday)" : isWeeklyOff ? "(Weekly Off)" : ""}
              </p>
            </div>
          ),
          action: (
            <div className="flex gap-2.5">
              {canEdit && (
                <span
                  className="text-[18px] text-blue-500 cursor-pointer"
                  title="Edit"
                  onClick={() => edite(emp)}
                >
                  <MdOutlineModeEdit />
                </span>
              )}
              {canDelete && (
                <span
                  className="text-[18px] text-red-500 cursor-pointer"
                  onClick={() => deletee(emp._id)}
                >
                  <AiOutlineDelete />
                </span>
              )}
            </div>
          ),
        };
      });
  }, [attandence, branch, company, holidaydate, minutesinhours, canEdit, canDelete]);

  // Filters
  const [filtere, setfiltere] = useState({
    date: "",
    branch: "all",
    departmente: "all",
    employee: "",
    status: "all",
    month: "all",
    year: "all",
  });

  const filteredData = useMemo(() => {
    const today = dayjs();
    return attandencelist.filter((val) => {
      const recordDate = dayjs(val.date, "DD MMM, YYYY");
      if (recordDate.isAfter(today, "day")) return false;
      const matchDate = !filtere.date || recordDate.isSame(filtere.date, "day");
      const matchMonth = filtere.month === "all" || recordDate.month() === Number(filtere.month);
      const matchYear = filtere.year === "all" || recordDate.year() === Number(filtere.year);
      const matchBranch = filtere.branch === "all" || val.branchid === filtere.branch;
      const matchDept = filtere.departmente === "all" || val.departmentId === filtere.departmente;
      const matchStatus = filtere.status === "all" || val.status === filtere.status;
      const matchEmployee =
        !filtere.employee.trim() ||
        val.rawname?.toLowerCase().includes(filtere.employee.trim().toLowerCase());
      return matchDate && matchBranch && matchDept && matchStatus && matchEmployee && matchMonth && matchYear;
    });
  }, [attandencelist, filtere]);

  // Sorting
  const finalData = useMemo(() => {
    if (!sortConfig.column) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.column];
      const bVal = b[sortConfig.column];
      return sortConfig.direction === "asc"
        ? aVal > bVal
          ? 1
          : -1
        : aVal < bVal
          ? 1
          : -1;
    });
  }, [filteredData, sortConfig]);

  const multidelete = () => {
    let multideletearray = selectedRows.map(id => id.attenid);
    swal({
      title: `Are you sure you want to Delete these ${multideletearray.length} record?`,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (proceed) => {
      if (proceed) {
        await deleteAttandence({ attandanceId: multideletearray, setselectedRows, setisload, dispatch });
        setselectedRows([]);
      }
    });
  }

  const handleSort = useCallback((column, sortDirection) => {
    setSortConfig({ column: column.id, direction: sortDirection });
  }, []);

  const handleRowSelect = useCallback(({ selectedRows }) => {
    setselectedRows(selectedRows);
  }, []);

  const edite = (atten) => {
    // console.log(atten)
    seteditinp({
      id: atten._id,
      employeeName: atten?.employeeId?.userid?.name || "",
      date: dayjs(atten.date).format('DD MMM, YYYY'),
      punchIn: atten.punchIn ? dayjs(atten.punchIn) : null,
      punchOut: atten.punchOut ? dayjs(atten.punchOut) : null,
      status: atten.status || "",
      leaveid: atten?.leave?._id,
      leaveReason: atten?.leave?.reason,
    });
    setatteneditmodal(true);
  };

  const deletee = async (id) => {
    swal({
      title: "Are you sure you want to Delete this record?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (proceed) => {
      if (proceed) {
        await deleteAttandence({ attandanceId: [id], setisload, dispatch });
        setselectedRows([]);
      }
    });
  };

  const conditionalRowStyles = [
    {
      when: (row) => row.remarks,
      style: { backgroundColor: "rgba(21, 233, 233, 0.1)", color: "teal" },
    },
  ];

  const exportCSV = () => {
    const headers = ["S.no", "Name", "Date", "Punch In", "Punch Out", "Status", "Working Minutes"];
    const rows = finalData.map((e, idx) => [
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

  const submitHandle = async (e) => {
    e.preventDefault();
    const res = await submitAttandence({ isPunchIn, inp, setisload, dispatch });
    // console.log(res)
    if (res) {
      setopenmodal(false);
      setinp(init);
    }
  }

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

              <FormControl size="small" className="col-span-1 md:w-[150px]">
                <InputLabel>Month</InputLabel>
                <Select
                  value={filtere.month}
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
                  label="Year"
                  onChange={(e) => setfiltere({ ...filtere, year: e.target.value })}
                >
                  <MenuItem value='all'>All</MenuItem>
                  {Array.from({ length: 5 }, (_, i) => dayjs().year() - 2 + i).map(y => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
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
            </div>
          }

        </div>
      </div>

      <div className="capitalize ">
        <DataTable
          columns={columns}
          data={finalData}
          pagination
          onSort={handleSort}
          selectableRows
          customStyles={customStyles}
          conditionalRowStyles={conditionalRowStyles}
          onSelectedRowsChange={handleRowSelect}
          highlightOnHover
          paginationPerPage={20}
          // paginationRowsPerPageOptions={[20, 50, 100, 300, `${isFilterActive ? filterattandence?.length : attandencelist?.length}`]}
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
