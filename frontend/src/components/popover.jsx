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
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 overflow-hidden max-h-96 overflow-y-auto border border-gray-200">
          {/* <div className="p-2 text-sm font-medium text-gray-700 border-b">Notifications</div> */}
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No notifications</div>
          ) : (
            <ul className="divide-y">
              {notifications.map((notif, index) => (
                <li key={index} className="p-3 hover:bg-gray-100 cursor-pointer">
                  <p className="text-[12px] md:text-[13px] text-gray-800">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notif.createdAt).toLocaleString('en-GB', {
                      day: '2-digit',  month: 'short', year: 'numeric',
                      hour: '2-digit',  minute: '2-digit',hour12: true,
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
