import { Button } from '@mui/material';
import React, { useState, useRef, useEffect } from 'react';
import { CiBullhorn } from 'react-icons/ci';
import { MdMarkEmailRead } from "react-icons/md";
import { FaFileDownload, FaGooglePlus, FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

export const NotificationIcon = ({ notifications }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const toggleDropdown = () => {
    setOpen((prev) => !prev);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markread = async () => {
    try {
      const token = localStorage.getItem('emstoken');
      const res = await axios.get(`${import.meta.env.VITE_API_ADDRESS}updatenotification`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success(res.data.message, { autoClose: 1800 });
    } catch (error) {
      console.log(error);
      if (error.response) {
        toast.warn(error.response.data.message, { autoClose: 2700 });
      } else if (error.request) {
        console.error('No response from server:', error.request);
      } else {
        console.error('Error:', error.message);
      }
    } finally {
      // setisload(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggleDropdown} className="relative p-1 text-gray-600 hover:text-black cursor-pointer">
        {/* <button onClick={toggleDropdown} className='bg-amber-200 w-7 h-7 rounded-full flex items-center justify-center relative cursor-pointer'> */}
        <CiBullhorn size={20} />
        {notifications.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-purple-800 text-white text-[8px] md:text-xs w-3 h-3 md:w-4 md:h-4 flex items-center justify-center font-bold rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute p-1 md:p-3 -right-25 md:right-0 mt-2 w-60 md:w-80 bg-white shadow-lg rounded-lg z-50 overflow-hidden  border border-gray-200">
          {/* <div className="p-2 text-sm font-medium text-gray-700 border-b">Notifications</div> */}
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No notifications</div>
          ) : (<>
            <div className="p-1 md:p-2 text-sm border-b-1 font-semibold text-slate-700 text-center ">Notification Center</div>
            <ul className="divide-y max-h-60 md:max-h-80 overflow-y-auto" >
              {notifications.map((notif, index) => (
                <li key={index} className="px-1 my-2 relative hover:bg-gray-100 cursor-pointer border-l-3 rounded border-teal-600">
                  <p className="text-[11px] md:text-[13px] text-gray-800">{notif.message}</p>
                  <p className="text-[10px] md:text-[12px] text-gray-500 mt-1">
                    {new Date(notif.createdAt).toLocaleString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit', hour12: true,
                    })}
                  </p>
                 {notif.read==false && <span className='absolute -top-1 left-0 w-2 h-2 bg-red-600 rounded-full'></span>}
                </li>
              ))}
            </ul>
            <div className='flex justify-end gap-2 text-[12px] mt-2'>
              <div className="flex items-center gap-1 border border-orange-500 text-orange-500 px-3 py-1 rounded cursor-pointer hover:bg-orange-50">
                <FaTrashAlt size={14} />
                <span>Clear All</span>
              </div>

              <div onClick={markread} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-blue-700">
                <MdMarkEmailRead size={14} />
                <span>Mark Read</span>
              </div>
            </div>

          </>)}
        </div>
      )}
    </div>
  );
};
