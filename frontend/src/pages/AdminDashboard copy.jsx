import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import DashboardCard from '../components/dashboardCard';
import { FiUsers } from "react-icons/fi";
import { FiClock } from "react-icons/fi";
import { SlBag } from "react-icons/sl";
import { FaBuilding, FaRegUser, FaTachometerAlt, FaUsers } from 'react-icons/fa'
import './admindashboard.css'
import dayjs from 'dayjs';
import { updateAttendance } from '../../store/userSlice';
import { Avatar, FormControl, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, Typography } from '@mui/material';
import { CiFilter } from 'react-icons/ci';


const Main = () => {

  const { attandence, employee, department } = useSelector((state) => state.user);
  const { islogin,isadmin } = useSelector((state) => state.auth);
  const [currentpresent, setcurrentpresent] = useState([])
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const attandenceRef = useRef(attandence);
  const [depfilter, setdepfilter] = useState('all')

  useEffect(() => {
    !islogin && navigate('/login');
  }, [])

  useEffect(() => {
    attandenceRef.current = attandence;
  }, [attandence]);

  useEffect(() => {
    console.log("attandence", attandence)
    console.log("employee", employee)
    // console.log("currentPresent", currentpresent)
    console.log("department", department)
    let currentPresent = attandence.filter((val) => {
      return dayjs(val.date).isSame(dayjs(), 'day') && !val.punchOut
    })
    // console.log(currentPresent)
    setcurrentpresent(currentPresent)
  }, [attandence])

  useEffect(() => {
    let retryTimeout = null;
    let retryDelay = 1000; // Start with 1 second
    let maxDelay = 10000;

    let eventSource = null;

    const connectEventSource = () => {
      eventSource = new EventSource('http://localhost:5000/events');

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'attendance_update') {
            console.log(data.payload.action, data.payload.data);

            if (data.payload.action === 'checkin') {
              let updated = [...attandenceRef.current, data.payload.data];
              dispatch(updateAttendance(updated));
            }

            if (data.payload.action === "checkOut") {
              let filterout = attandenceRef.current.filter(
                (e) => e._id !== data.payload.data._id
              );
              let newlist = [...filterout, data.payload.data];
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
        <div className="car flex justify-between gap-6" >
          <DashboardCard logo={<FiUsers />} head="Total Employees" number="5" color="voilet" />
          <DashboardCard logo={<FiClock />} head="Present Today" number={attandence.length} color="green" />
          <DashboardCard logo={<SlBag />} head="On Leave" number="3" color="amber" />
          <DashboardCard logo={<FaBuilding />} head="In Office" number={currentpresent.length} color="teal" />
        </div>
      </div>
      <div className='w-full flex-col flex gap-5 shadow-xl  bg-white p-2 rounded'>
        <FormControl sx={{ width: '160px' }} required size="small">
          <InputLabel id="demo-simple-select-helper-label">Department</InputLabel>
          <Select
            labelId="demo-simple-select-helper-label"
            id="demo-simple-select-helper"
            value={depfilter}
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
            onChange={(e) => setdepfilter(e.target.value)}
          >
            <MenuItem selected value={'all'}>All</MenuItem>
            {department?.map((val) => {
              return <MenuItem key={val._id} value={val._id}>{val.department}</MenuItem>
            })}

          </Select>
        </FormControl>
        <div className='flex justify-start gap-4'>
          {(depfilter !== 'all' ? employee.filter(e => e.department?._id == depfilter) : employee)?.map((emp) => {
            const isPresent = currentpresent.some(att => att.employeeId._id === emp._id);
            {/* console.log(employee) */ }
            return (
              <div key={emp._id} className='flex flex-col items-center'>
                <span className={`${isPresent ? 'border-green-500' : 'border-gray-300'} p-[2px] border-2 rounded-full`}>
                  <Avatar src={emp.profileimage} alt={emp.employeename}>
                    {!emp.profileimage && <FaRegUser />}
                  </Avatar>
                </span>
                <p className={`${isPresent ? 'text-green-600 text-[18px] font-semibold' : 'text-gray-500'} text-[14px] transition-all duration-300`}>
                  {emp.employeename}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="leaveDetail">
        <h3>Leave Details</h3>
        <div className="cards">
          <DashboardCard logo={<FaUsers />} head="Leave Applied" number="5" color="teal" />
          <DashboardCard logo={<FaTachometerAlt />} head="Leave Approved" number="3" color="amber" />
          <DashboardCard logo={<FaBuilding />} head="Leace Pending" number="1" color="teal" />
          <DashboardCard logo={<FaBuilding />} head="Leave Rejected" number="2" color="amber" />
        </div>
      </div>
    </div>
  )
}

export default Main
