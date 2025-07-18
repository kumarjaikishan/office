import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import DashboardCard from '../components/dashboardCard';
import { FiUsers } from "react-icons/fi";
import { FiClock } from "react-icons/fi";
import { SlBag } from "react-icons/sl";
import { toast } from 'react-toastify';
import { FaBuilding, FaRegUser, FaTachometerAlt, FaUsers } from 'react-icons/fa'
import './admindashboard.css'
import dayjs from 'dayjs';
import { updateAttendance } from '../../store/userSlice';
import { Avatar, FormControl, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, Tooltip, Typography } from '@mui/material';
import { CiFilter } from 'react-icons/ci';


const Main = () => {

  const { attandence, employee, branch, department } = useSelector((state) => state.user);
  const { islogin, isadmin } = useSelector((state) => state.auth);
  const [currentpresent, setcurrentpresent] = useState([]);
  const [todaypresent, settodaypresent] = useState([])
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const attandenceRef = useRef(attandence);
  const [branc, setbranc] = useState('all');
  const [depfilter, setdepfilter] = useState('all');
  const [employeelist, setemployeelist] = useState([])

  useEffect(() => {
    !islogin && navigate('/login');
  }, [])

  useEffect(() => {
    if (!employee || employee.length === 0) return;

    const filtered = employee.filter(dep => {
      const matchBranch =
        branc === 'all' || dep.branchId === branc;
      const matchdepart =
        depfilter === 'all' || dep.department._id === depfilter;
      return matchBranch && matchdepart;
    });

    setemployeelist(filtered);
  }, [branc, depfilter]);

  useEffect(() => {
    setdepfilter('all')
  }, [branc]);
  useEffect(() => {
    attandenceRef.current = attandence;
  }, [attandence]);

  useEffect(() => {
    // console.log("attandence", attandence)
    // console.log("employee", employee)
    // console.log("currentPresent", currentpresent)
    // console.log("department", department)
    if (!attandence) return;
    let currentPresent = attandence.filter((val) => {
      return dayjs(val.date).isSame(dayjs(), 'day') && !val.punchOut
    })
    let todaypresent = attandence.filter((val) => {
      return dayjs(val.date).isSame(dayjs(), 'day')
    })
    // console.log("today present",currentPresent)
    setcurrentpresent(currentPresent);
    settodaypresent(todaypresent)
  }, [attandence])

  useEffect(() => {
    let retryTimeout = null;
    let retryDelay = 1000; // Start with 1 second
    let maxDelay = 10000;

    let eventSource = null;

    const connectEventSource = () => {
      eventSource = new EventSource('http://localhost:5000/events');

      eventSource.onopen = () => {
        console.log('✅ SSE connection established successfully');
        retryDelay = 1000; // Reset retry delay on success
      };

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'attendance_update') {
            console.log(data.payload.action, data.payload.data);
            let datae = data.payload.data;
            if (data.payload.action === 'checkin') {
              let updated = [...attandenceRef.current, datae];
              // console.log("checkIn sse merger:",updated);
              // toast.success(`${datae.employeeId.employeename} has Punched In at ${dayjs(datae.punchIn).format('hh:mm A')}`, { autoClose: false });

              toast(
                <div className='flex items-center gap-2 pr-1'>
                  <Avatar src={datae.employeeId.profileimage} alt={datae.employeeId.employeename}>
                    {!datae.employeeId.profileimage && <FaRegUser />}
                  </Avatar>
                  <span className='text-[14px] '>
                    <span className='text-green-700 capitalize font-semibold'> {datae.employeeId.userid.name}</span> has Punched In at{' '}
                    <span className='text-green-700 '> {dayjs(datae.punchIn).format('hh:mm A')}</span>
                  </span>
                </div>,
                {
                  autoClose: false
                }
              );

              dispatch(updateAttendance(updated));
            }

            if (data.payload.action === "checkOut") {
              let filterout = attandenceRef.current.filter(
                (e) => e._id !== datae._id
              );
              let newlist = [...filterout, datae];
              // toast.success(`${datae.employeeId.employeename} has Punched Out at ${dayjs(datae.punchOut).format('hh:mm A')}`, { autoClose: false });
              toast(
                <div className='flex items-center gap-2 pr-1'>
                  <Avatar src={datae.employeeId.profileimage} alt={datae.employeeId.employeename}>
                    {!datae.employeeId.profileimage && <FaRegUser />}
                  </Avatar>
                  <span className='text-[14px] '>
                    <span className='text-amber-700 capitalize font-semibold '> {datae.employeeId.userid.name}</span> has Punched Out at{' '}
                    <span className='text-amber-700 '> {dayjs(datae.punchOut).format('hh:mm A')}</span>
                  </span>
                </div>,
                {
                  autoClose: false
                }
              );

              dispatch(updateAttendance(newlist));
            }
          }
        } catch (err) {
          console.error('Failed to parse SSE message:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.warn('SSE connection lost, retrying...', err);
        eventSource.close();
        retryTimeout = setTimeout(() => {
          retryDelay = Math.min(retryDelay * 2, maxDelay); // exponential backoff
          // connectEventSource();
        }, retryDelay);
      };
    };

    connectEventSource(); // Initial connect

    return () => {
      if (eventSource) eventSource.close();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, []);



  return (
    <div className='adminDashboard'>
      <div className="overview">
        <h3>Dashboar overview</h3>
        <DashboardCard employee={employee} todaypresent={todaypresent.length} currentpresent={currentpresent.length} />
      </div>

      <div className='w-full flex-col flex gap-5 shadow  bg-white p-2 rounded'>
        <div className='flex gap-3'>
          <FormControl sx={{ width: '160px' }} required size="small">
            <InputLabel id="demo-simple-select-helper-label">Branch</InputLabel>
            <Select
              value={branc}
              input={
                <OutlinedInput
                  startAdornment={
                    <InputAdornment position="start">
                      <CiFilter fontSize="small" />
                    </InputAdornment>
                  }
                  label="branch"
                />
              }
              onChange={(e) => setbranc(e.target.value)}
            >
              <MenuItem selected value={'all'}>All</MenuItem>
              {branch?.map((list) => (
                <MenuItem key={list._id} value={list._id}>{list.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ width: '160px' }} required size="small">
            <InputLabel id="demo-simple-select-helper-label">Department</InputLabel>
            <Select
              disabled={branc == 'all'}
              value={depfilter}
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
              onChange={(e) => setdepfilter(e.target.value)}
            >
              <MenuItem selected value={'all'}>All</MenuItem>
              {department?.filter(e => e.branchId._id == branc)?.map((val) => {
                return <MenuItem key={val._id} value={val._id}>{val.department}</MenuItem>
              })}

            </Select>
          </FormControl>
        </div>
        <div className='flex justify-start gap-4'>
          {employeelist?.map((emp) => {
            const isPresent = currentpresent.some(att => att.employeeId._id === emp._id);
            {/* console.log('today present ', todaypresent) */ }
            const todaypresente = todaypresent.find(att => att.employeeId._id === emp._id);
            {/* console.log(todaypresente) */ }
            return (
              <Tooltip key={emp._id} placement="top" title={<div className='flex flex-col '>
                <span> In &nbsp;&nbsp;&nbsp;&nbsp; {todaypresente?.punchIn ? dayjs(todaypresente.punchIn).format('hh:mm A') : '-:-'}</span>
                <span> Out &nbsp;&nbsp; {todaypresente?.punchOut ? dayjs(todaypresente.punchOut).format('hh:mm A') : '-:-'}</span>
              </div>}>
                <div key={emp._id} className='flex flex-col items-center'>
                  <span className={`${todaypresente ? (isPresent ? 'border-green-500' : 'border-amber-400') : 'border-gray-300'} p-[2px] border-2 rounded-full`}>
                    <Avatar src={emp.profileimage} alt={emp.employeename}>
                      {!emp.profileimage && <FaRegUser />}
                    </Avatar>
                  </span>
                  <p className={`${todaypresente ? (isPresent ? 'text-green-600 text-[18px] font-semibold' : 'text-amber-700') : 'text-gray-500'} text-[14px] transition-all duration-300 capitalize `}>
                    {emp.employeename}
                  </p>
                </div>
              </Tooltip>
            );
          })}
        </div>
        <div className='flex gap-5'>
          <span className='flex items-center gap-1 text-green-500 text-[13px] '>
            <span className='block w-[15px] rounded-3xl h-[15px] bg-green-500 '></span> In Premise
          </span>
          <span className='flex items-center gap-1 text-amber-700 text-[13px]'>
            <span className='block w-[15px] rounded-3xl h-[15px] bg-amber-500 '></span> Present
          </span>
          <span className='flex items-center gap-1 text-gray-500 text-[13px]'>
            <span className='block w-[15px] rounded-3xl h-[15px] bg-gray-500  '></span> Absent
          </span>
        </div>
      </div>

      {/* <div className="leaveDetail">
        <h3>Leave Details</h3>
        <DashboardCard todaypresent={todaypresent.length} currentpresent={currentpresent.length} />
      </div> */}
    </div>
  )
}

export default Main
