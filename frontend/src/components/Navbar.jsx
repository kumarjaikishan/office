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
    "admin-dashboard": "Dashboard",
    "manager-dashboard": "Dashboard",
    "employe-dashboard": "Dashboard",
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
    "adminprofile": "Profile",
  };

  const notifications = [
  {
    _id: "64a1b2c3d4e5f67890123456",
    userId: "64f9a1c2e3b4d56789012345",
    message: "Your leave request has been approved.",
    read: false,
    createdAt: new Date("2025-08-21T09:30:00Z")
  },
  {
    _id: "64a1b2c3d4e5f67890123457",
    userId: "64f9a1c2e3b4d56789012345",
    message: "New policy update: Please review the company guidelines.",
    read: true,
    createdAt: new Date("2025-08-20T14:15:00Z")
  },
  {
    _id: "64a1b2c3d4e5f67890123458",
    userId: "64f9a1c2e3b4d56789012346",
    message: "Reminder: Submit your timesheet for this week.",
    read: false,
    createdAt: new Date("2025-08-19T18:00:00Z")
  },
  {
    _id: "64a1b2c3d4e5f67890123459",
    userId: "64f9a1c2e3b4d56789012347",
    message: "Your password was changed successfully.",
    read: false,
    createdAt: new Date("2025-08-18T08:45:00Z")
  },
  {
    _id: "64a1b2c3d4e5f67890123459",
    userId: "64f9a1c2e3b4d56789012347",
    message: "Your password was changed successfully.",
    read: true,
    createdAt: new Date("2025-08-18T08:45:00Z")
  },
  {
    _id: "64a1b2c3d4e5f67890123459",
    userId: "64f9a1c2e3b4d56789012347",
    message: "Your password was changed successfully.",
    read: false,
    createdAt: new Date("2025-08-18T08:45:00Z")
  },
  {
    _id: "64a1b2c3d4e5f67890123459",
    userId: "64f9a1c2e3b4d56789012347",
    message: "Your password was changed successfully.",
    read: true,
    createdAt: new Date("2025-08-18T08:45:00Z")
  },
  {
    _id: "64a1b2c3d4e5f67890123460",
    userId: "64f9a1c2e3b4d56789012348",
    message: "New task assigned: Complete project documentation.",
    read: false,
    createdAt: new Date("2025-08-17T11:20:00Z")
  }
];


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
    <div className='navbar w-full bg-white flex items-center justify-between px-1 md:px-4 py-2'>
      <p className='font-semibold text-[14px] md:text-xl'>{pageTitle}</p>

      <div className='flex gap-2 md:gap-4 items-center px-2 text-grey'>
        {/* <span className='bg-amber-200 w-7 h-7 rounded-full flex items-center justify-center relative cursor-pointer'>
          <CiBullhorn />
          <span className='absolute -top-2 -right-2 bg-purple-800 text-white
              rounded-full w-4 h-4 flex items-center justify-center text-[10px]  font-bold'
          >
            1
          </span>
        </span> */}
        <NotificationIcon notifications={notifications} />
        {/* <NotificationIcon notifications={notificatione} /> */}
        {/* <NotificationIcon1 notifications={notification} /> */}
        <div className='flex flex-col items-end px-1'>
          <span className='text-[10px] md:text-xs font-medium leading-4 capitalize'>{user?.profile?.name}</span>
          <p className='text-[8px] md:text-[10px] text-gray-500 text-right capitalize'>{user?.profile?.role}</p>
        </div>
        <Avatar src={user?.profile?.profileImage} alt={user?.profile?.name}>
          {!user?.profile?.profileImage && <FaRegUser />}
        </Avatar>
      </div>
    </div>
  )
}

export default Navbar
