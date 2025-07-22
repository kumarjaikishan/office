import React, { useState, useRef, useEffect } from 'react';
import { CiBullhorn } from 'react-icons/ci';

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

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggleDropdown} className="relative p-1 text-gray-600 hover:text-black cursor-pointer">
        {/* <button onClick={toggleDropdown} className='bg-amber-200 w-7 h-7 rounded-full flex items-center justify-center relative cursor-pointer'> */}
        <CiBullhorn size={20} />
        {notifications.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-purple-800 text-white text-xs w-4 h-4 flex items-center justify-center font-bold rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute p-3 right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 overflow-hidden max-h-96 overflow-y-auto border border-gray-200">
          {/* <div className="p-2 text-sm font-medium text-gray-700 border-b">Notifications</div> */}
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No notifications</div>
          ) : (<>
            <div className="p-2 text-sm border-b-1  font-semibold text-slate-700 text-center ">Notification Center</div>
            <ul className="divide-y" >
              {notifications.map((notif, index) => (
                <li key={index} className="px-1 my-2 hover:bg-gray-100 cursor-pointer border-l-3 rounded border-teal-600">
                  <p className="text-[12px] md:text-[13px] text-gray-800">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notif.createdAt).toLocaleString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit', hour12: true,
                    })}
                  </p>
                </li>
              ))}
            </ul>
            <div className='flex justify-end gap-2 text-[12px] border-t-1 pt-2'>
              <button className='text-red-500 font-semibold cursor-pointer bg-red-100 border-1 px-2 py-1 rounded'>Clear All</button>
              <button className='text-blue-500 font-semibold cursor-pointer bg-blue-100 border-1 px-2 py-1 rounded'>Mark Read</button>
            </div>
          </>)}
        </div>
      )}
    </div>
  );
};
