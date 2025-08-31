import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import swal from 'sweetalert';
import {
  FaBook, FaCalendarDay, FaUmbrellaBeach, FaUserCircle, FaUserTie, FaSitemap
} from 'react-icons/fa';
import { VscDashboard } from "react-icons/vsc";
import { TbReportAnalytics } from "react-icons/tb";
import { SiAudiotechnica } from "react-icons/si";
import { CgLogOut } from "react-icons/cg";
import { FiSettings } from 'react-icons/fi';

const Sidebar = () => {
  const navigate = useNavigate();
  const { company } = useSelector((state) => state.user);
  const user = useSelector((state) => state.user);

  const role = user?.profile?.role;
  const sidebarOpen = Boolean(user?.sidebar);
  const extended = Boolean(user?.extendedonMobile);
  const isMobile = window.innerWidth < 600;


  const handleLogout = () => {
    swal({
      title: "Are you sure you want to logout?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willLogout) => {
      if (willLogout) {
        navigate('/logout');
      }
    });
  };

  // Decide whether to show menu text
  const showText = isMobile
    ? sidebarOpen && extended // 📱 show text only if extended is true
    : sidebarOpen;            // 💻 show text if sidebarOpen is true

  return (
    <div className="w-full h-full px-1 md:px-2">
      {/* Logo */}
      <div className="h-[60px] flex items-center gap-4">
        <span className="text-3xl">
          {company?.logo ? (
            <div className="rounded-full overflow-hidden w-10 h-10 md:h-14 md:w-14">
              <img
                className="w-full h-full object-fill"
                src={company?.logo}
                alt="Company Logo"
              />
            </div>
          ) : (
            <SiAudiotechnica />
          )}
        </span>
        {showText && (
          <span className="capitalize">{user?.company?.name || 'Company'}</span>
        )}
      </div>

      {/* Menu */}
      {menu.map((section) => {
        const filteredItems = section.items.filter((item) => item.roles.includes(role));

        return (
          <div className="w-full" key={section.title}>
            <div className="hidden lg:block mt-3 font-light text-gray-400">{section.title}</div>
            {filteredItems.map((item) =>
              item.isLogout ? (
                <button
                  key={item.menu}
                  onClick={handleLogout}
                  className={`flex w-full mb-1 items-center rounded text-gray-600 hover:bg-teal-50
                       ${showText ? "justify-start gap-3 px-2 py-2" : "justify-center h-10"}
                     `}
                >
                  <span className="text-[18px]">{item.icon}</span>
                  {showText && <span>{item.menu}</span>}
                </button>
              ) : (
                <NavLink
                  to={item.link}
                  end
                  key={item.link}
                  className={({ isActive }) =>
                    `flex w-full mb-1 items-center rounded text-gray-600 
                        ${showText ? "justify-start gap-3 px-2 py-2" : "justify-center h-10"} 
                        ${isActive ? "bg-primary text-white" : ""}`
                  }
                >
                  <span className="text-[18px]">{item.icon}</span>
                  {showText && <span>{item.menu}</span>}
                </NavLink>
              )
            )}
          </div>
        );
      })}
    </div>
  );
};

const menu = [
  {
    title: 'Menu',
    items: [
      { menu: "Dashboard", link: '/dashboard', icon: <VscDashboard />, roles: ['developer', 'admin', 'superadmin', 'manager', 'employee'] },
      { menu: "Organization", link: '/dashboard/organization', icon: <FaSitemap />, roles: ['superadmin', 'admin'] },
      { menu: "Permission", link: '/dashboard/permission', icon: <FaSitemap />, roles: ['developer'] },
      { menu: "Employees", link: '/dashboard/employe', icon: <FaUserTie />, roles: ['admin', 'superadmin', 'manager'] },
      { menu: "Attendance", link: '/dashboard/attandence', icon: <TbReportAnalytics />, roles: ['admin', 'superadmin', 'manager'] },
      { menu: "Attend Report", link: '/dashboard/attandence_Report', icon: <TbReportAnalytics />, roles: ['admin', 'superadmin', 'manager'] },
      { menu: "Attendance", link: '/dashboard/empattandence', icon: <TbReportAnalytics />, roles: ['employee'] },
      { menu: "Payroll", link: '/dashboard/payroll', icon: <TbReportAnalytics />, roles: ['admin', 'superadmin', 'manager'] },
      { menu: "Holiday", link: '/dashboard/holiday', icon: <FaCalendarDay />, roles: ['superadmin', 'admin'] },
      { menu: "Leave", link: '/dashboard/leave', icon: <FaUmbrellaBeach />, roles: ['employee', 'admin', 'superadmin', 'manager'] },
      { menu: "Ledger", link: '/dashboard/ledger', icon: <FaBook />, roles: ['admin', 'superadmin', 'manager'] },
    ]
  },
  {
    title: 'Others',
    items: [
      { menu: "Profile", link: '/dashboard/profile', icon: <FaUserCircle />, roles: ['admin', 'superadmin', 'manager', 'employee'] },
      { menu: "Setting", link: '/dashboard/setting', icon: <FiSettings />, roles: ['admin', 'superadmin', 'manager', 'employee'] },
      { menu: "Logout", isLogout: true, icon: <CgLogOut />, roles: ['admin', 'employee', 'superadmin', 'developer', 'manager'] }
    ]
  }
];

export default Sidebar;
