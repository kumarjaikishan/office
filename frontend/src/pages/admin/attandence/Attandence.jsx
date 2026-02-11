import { CiFilter } from "react-icons/ci";
import { Avatar, Box, Button, CircularProgress, IconButton, OutlinedInput, TextField, Typography } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import React from "react";
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
import { IoSearch } from "react-icons/io5";
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
  const [bulkmodal, setbulkmodal] = useState(false);
  const { branch, attandence, department, company, holidays, profile } = useSelector(
    (state) => state.user
  );
  const [selectedRows, setselectedRows] = useState([]);
  const [holidaydate, setholidaydate] = useState([]);
  const dispatch = useDispatch();
  const customStyles = useCustomStyles();
  const [sortConfig, setSortConfig] = useState({ column: null, direction: null });
  const [loading, setLoading] = useState(false);


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

  useEffect(() => {
    // console.log(selectedRows)
  }, [selectedRows])

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
    const today = dayjs().startOf("day");

    return attandence
      .map(emp => ({
        ...emp,
        parsedDate: dayjs(emp.date)
      }))
      .filter((emp) => !dayjs(emp.date).isAfter(today, "day"));
  }, [attandence]);


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
    // console.log(attandencelist)
    // console.log(filtere)
    return attandencelist.filter((val) => {
      const recordDate = val.parsedDate;
      if (recordDate.isAfter(today, "day")) return false;
      const matchDate = !filtere.date || recordDate.isSame(filtere.date, "day");
      const matchMonth = filtere.month === "all" || recordDate.month() === Number(filtere.month);
      const matchYear = filtere.year === "all" || recordDate.year() === Number(filtere.year);
      const matchBranch = filtere.branch === "all" || val.branchId === filtere.branch;
      const matchDept = filtere.departmente === "all" || val?.employeeId?.department === filtere.departmente;
      const matchStatus = filtere.status === "all" || val.status === filtere.status;
      const matchEmployee =
        !filtere.employee.trim() ||
        val?.employeeId?.userid?.name?.toLowerCase().includes(filtere.employee.trim().toLowerCase());
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
    // return console.log(selectedRows)
    let multideletearray = selectedRows.map(id => id._id);
    swal({
      title: `Are you sure you want to Delete these ${multideletearray.length} record?`,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (proceed) => {
      if (proceed) {
        await deleteAttandence({ attandanceId: multideletearray, setselectedRows, setisload, dispatch });

        // Remove deleted rows from finalData
        const newData = finalData.filter(d => !multideletearray.includes(d._id));

        setselectedRows([]);
      }
    });
  }

  const handleSort = useCallback((column, sortDirection) => {
    setSortConfig({ column: column.id, direction: sortDirection });
  }, []);

  const handleRowSelect = useCallback(({ selectedRows }) => {
    // console.log(selectedRows)
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

  const [inputValue, setInputValue] = useState(filtere.employee || "");

  useEffect(() => {
    if (inputValue === filtere.employee) return; // skip if same value

    setLoading(true);
    const handler = setTimeout(() => {
      setfiltere((prev) => ({ ...prev, employee: inputValue }));
      setLoading(false);
    }, 700); // debounce delay (500ms)

    return () => clearTimeout(handler);
  }, [inputValue, setfiltere]);

  const openModal = useCallback(() => {
    setopenmodal(true)
  }, [])
  const openBulkModal = useCallback(() => {
    setbulkmodal(true)
  }, [])

  const memoColumns = useMemo(() => columns({
    branch,
    company,
    holidaydate,
    minutesinhours,
    canEdit,
    canDelete,
    edite,
    deletee,
  }), [
    branch,
    company,
    holidaydate,
    minutesinhours,
    canEdit,
    canDelete,
    edite,
    deletee,
  ]);



  return (
    <div className='p-1 max-w-6xl mx-auto '>

      {/* control component */}
      <AttendanceControls
        markattandence={markattandence}
        setmarkattandence={setmarkattandence}
        canAdd={canAdd}
        selectedRows={selectedRows}
        multidelete={multidelete}
        exportCSV={exportCSV}
        openModal={openModal}
        openBulkModal={openBulkModal}
        filtere={filtere}
        setfiltere={setfiltere}
        branch={branch}
        department={department}
        profile={profile}
        months={months}
        inputValue={inputValue}
        setInputValue={setInputValue}
        loading={loading}
      />

      {/* tabledata */}
      <div className="capitalize ">
        <AttendanceTableSection
          memoColumns={memoColumns}
          finalData={finalData}
          handleSort={handleSort}
          customStyles={customStyles}
          conditionalRowStyles={conditionalRowStyles}
          handleRowSelect={handleRowSelect}
          selectedRows={selectedRows}
        />
      </div>

      <MarkAttandence isPunchIn={isPunchIn} setisPunchIn={setisPunchIn} submitHandle={submitHandle} init={init} openmodal={openmodal} inp={inp} setinp={setinp}
        setopenmodal={setopenmodal} isUpdate={isUpdate} setisUpdate={setisUpdate} isload={isload}
      />
      <MarkAttandenceedit dispatch={dispatch} setisload={setisload} submitHandle={submitHandle} init={init2} openmodal={atteneditmodal} inp={editinp} setinp={seteditinp}
        setopenmodal={setatteneditmodal} isUpdate={isUpdate} setisUpdate={setisUpdate} isload={isload}
      />
      <BulkMark isPunchIn={isPunchIn} dispatch={dispatch} setisPunchIn={setisPunchIn} submitHandle={submitHandle} init={init} openmodal={bulkmodal} inp={inp} setinp={setinp}
        setopenmodal={setbulkmodal} isUpdate={isUpdate} setisUpdate={setisUpdate} isload={isload}
      />
    </div>
  )
}

const AttendanceControls = React.memo(({
  markattandence,
  setmarkattandence,
  canAdd,
  selectedRows,
  multidelete,
  exportCSV,
  openModal,
  openBulkModal,
  filtere,
  setfiltere,
  branch,
  department,
  profile,
  months,
  inputValue,
  setInputValue,
  loading
}) => {

  return (
    <div className="bg-white flex flex-col rounded mb-4 shadow-xl p-2">

      {/* top buttons */}
      <div className="flex justify-between items-center mb-4 flex-wrap">
        <div className="flex w-full md:w-auto p-1 items-center gap-2 rounded bg-primary text-white">
          <p
            onClick={() => setmarkattandence(false)}
            className={`px-2 py-1 rounded cursor-pointer ${!markattandence && "text-primary bg-white"}`}
          >
            View Attendance
          </p>

          {canAdd && (
            <p
              onClick={() => setmarkattandence(true)}
              className={`px-2 py-1 rounded cursor-pointer ${markattandence && "text-primary bg-white"}`}
            >
              Mark Attendance
            </p>
          )}
        </div>

        <div className="flex w-full md:w-[320px] gap-2">
          {selectedRows.length > 0 && (
            <Button
              className="flex-1"
              variant="contained"
              onClick={multidelete}
              color="error"
            >
              Delete ({selectedRows.length})
            </Button>
          )}

          <Button
            onClick={exportCSV}
            className="flex-1"
            variant="outlined"
          >
            Export
          </Button>
        </div>
      </div>

      {/* conditional section */}
      {markattandence ? (
        <div className="flex gap-2">
          <Button variant="contained" onClick={openModal}>
            Mark Individual
          </Button>

          <Button variant="outlined" onClick={openBulkModal}>
            Mark Bulk
          </Button>
        </div>
      ) : (
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
              {profile?.role === 'manager'
                ? branch?.filter((e) => profile?.branchIds?.includes(e._id))
                  ?.map((list) => (
                    <MenuItem key={list._id} value={list._id}>
                      {list.name}
                    </MenuItem>
                  ))
                :
                branch?.map((list) => (
                  <MenuItem key={list._id} value={list._id}> {list.name} </MenuItem>
                ))
              }
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
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IoSearch />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {loading ? (
                    <CircularProgress size={18} />
                  ) : (
                    inputValue && (
                      <IconButton
                        onClick={() => setInputValue("")}
                        edge="end"
                        size="small"
                      >
                        <MdClear />
                      </IconButton>
                    )
                  )}
                </InputAdornment>
              ),
            }}
            label="Search Employee"
          />
        </div>
      )}

    </div>
  );
});

const AttendanceTableSection = React.memo(({
  memoColumns,
  finalData,
  handleSort,
  customStyles,
  conditionalRowStyles,
  handleRowSelect,
  selectedRows
}) => {

  return (
    <div className="capitalize">
      <DataTable
        columns={memoColumns}
        data={finalData}
        pagination
        onSort={handleSort}
        selectableRows
        customStyles={customStyles}
        conditionalRowStyles={conditionalRowStyles}
        onSelectedRowsChange={handleRowSelect}
        selectedRows={selectedRows}
        highlightOnHover
        paginationPerPage={20}
      />
    </div>
  );
});


export default Attandence
