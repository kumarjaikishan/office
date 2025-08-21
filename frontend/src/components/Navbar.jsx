import { Avatar, Button } from '@mui/material'
import { setloader, setlogin, setlogout } from '../../store/authSlice';
// import './navbar.css'
import { useSelector, useDispatch } from 'react-redux';
import { CiBullhorn } from "react-icons/ci";
import { Popover, Typography, List, ListItem, ListItemText, Badge } from '@mui/material';
import { FaRegUser, FaUser } from "react-icons/fa";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { NotificationIcon } from './popover';
import { NotificationIcon1 } from './muipopover';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [notificatione, setnotification] = useState([]);
  const { isadmin, islogin } = useSelector((state) => state.auth);
  const { notification } = useSelector((state) => state.employee);
  const user = useSelector((state) => state.user);
  // console.log(isadmin, islogin, user)

  useEffect(() => {
    if (notification) {
      setnotification(notification)
    }
    console.log(location.pathname)
  }, [notification])

  const commonTitles = {
    "dashboard": "Dashboard",
    "employe": "Employee",
    "organization": "Organization",
    "holiday": "Holiday",
    "ledger": "Ledger",
    "ledger/:id": "Ledger Detail",
    "leave": "Leave Request",
    "attandence": "Attendance",
    "salary": "Salary",
    "department": "Department",
    "setting": "Company Settings",
    "faceatten": "Face Attendance",
    "performance/:userid": "Performance",
    "empattandence": "Attendance",
    "profile": "Profile",
  };

  const pathParts = location.pathname.split("/").filter(Boolean);

  const lastPart = pathParts[pathParts.length - 1] || "";

  // special handling for dynamic routes like ledger/:id
  let pageTitle;
  if (lastPart && !commonTitles[lastPart]) {
    if (pathParts.includes("ledger") && pathParts.length > 2) {
      pageTitle = "Ledger Detail";
    } else if (pathParts.includes("performance")) {
      pageTitle = "Performance";
    } else {
      pageTitle = "Page";
    }
  } else {
    pageTitle = commonTitles[lastPart] || "Page";
  }

  return (
    <div className='navbar w-full bg-white flex items-center justify-between px-4 py-2'>
      <p className='font-semibold text-xl'>{pageTitle}</p>

      <div className='flex  gap-4 items-center px-2 text-grey'>
        {/* <span className='bg-amber-200 w-7 h-7 rounded-full flex items-center justify-center relative cursor-pointer'>
          <CiBullhorn />
          <span className='absolute -top-2 -right-2 bg-purple-800 text-white
              rounded-full w-4 h-4 flex items-center justify-center text-[10px]  font-bold'
          >
            1
          </span>
        </span> */}
        <NotificationIcon notifications={notificatione} />
        {/* <NotificationIcon1 notifications={notification} /> */}
        <div className='flex flex-col items-end px-1'>
          <span className='text-xs  font-medium leading-4 capitalize'>{user?.profile?.name}</span>
          <p className='text-[10px] text-gray-500 text-right capitalize'>{user?.profile?.role}</p>
        </div>
        <Avatar src={user?.profile?.profilepic} alt={user?.profile?.name}>
          {!user?.profile?.profilepic && <FaRegUser />}
        </Avatar>
      </div>
    </div>
  )
}

export default Navbar
