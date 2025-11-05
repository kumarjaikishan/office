import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import swal from "sweetalert";
import {
  FaBook,
  FaCalendarDay,
  FaUserCircle,
  FaUserTie,
  FaSitemap,
} from "react-icons/fa";
import { VscDashboard } from "react-icons/vsc";
import { TbReportAnalytics } from "react-icons/tb";
import { SiAudiotechnica } from "react-icons/si";
import { CgLogOut } from "react-icons/cg";
import { FiSettings } from "react-icons/fi";
import { MdPayments } from "react-icons/md";
import { IoChevronDown, IoChevronForward } from "react-icons/io5";
import { cloudinaryUrl } from "../utils/imageurlsetter";
import Popover from "@mui/material/Popover";

const Sidebar = () => {
  const navigate = useNavigate();
  const { company } = useSelector((state) => state.user);
  const user = useSelector((state) => state.user);
  const role = user?.profile?.role;
  const sidebarOpen = Boolean(user?.sidebar);
  const extended = Boolean(user?.extendedonMobile);
  const isMobile = window.innerWidth < 600;

  const [openSubmenu, setOpenSubmenu] = useState(null); // for expanded sidebar
  const [hoveredMenu, setHoveredMenu] = useState(null); // for collapsed sidebar
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    swal({
      title: "Are you sure you want to logout?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willLogout) => {
      if (willLogout) navigate("/logout");
    });
  };

  const showText = isMobile ? sidebarOpen && extended : sidebarOpen;

  useEffect(() => {
    setOpenSubmenu(null);
    setHoveredMenu(null);
    setAnchorEl(null);
  }, [showText]);

  return (
    <div className="w-full h-full scrollbar-hide overflow-y-auto px-1 md:px-2">
      {/* Logo */}
      <div className="h-[60px] flex items-center gap-4">
        <span className="text-3xl">
          {company?.logo ? (
            <div className="rounded-full overflow-hidden w-10 h-10 md:h-14 md:w-14">
              <img
                className="w-full h-full object-fill"
                src={cloudinaryUrl(company?.logo, { format: "webp", width: 100, height: 100 })}
                alt="Company Logo"
              />
            </div>
          ) : (
            <SiAudiotechnica />
          )}
        </span>
        {showText && (
          <span className="capitalize font-semibold text-gray-700">
            {user?.company?.name || "Company"}
          </span>
        )}
      </div>

      {/* Menu */}
      {menu.map((section, sIndex) => {
        const filteredItems = section.items.filter((item) =>
          item.roles.includes(role)
        );
        if (!filteredItems.length) return null;

        return (
          <div key={sIndex} className="mt-2">
            {filteredItems.map((item, iIndex) => {
              const menuId = `${sIndex}-${iIndex}`;
              const isOpen = showText
                ? openSubmenu === menuId
                : hoveredMenu === menuId;

              if (item.children) {
                return (
                  <div
                    key={item.menu}
                    className="relative"
                    onMouseEnter={(e) => {
                      if (!showText) {
                        setHoveredMenu(menuId);
                        setAnchorEl(e.currentTarget);
                      }
                    }}
                    onMouseLeave={() => {
                      if (!showText) {
                        setHoveredMenu(null);
                        setAnchorEl(null);
                      }
                    }}
                  >
                    {/* Parent Button */}
                    <button
                      onClick={() => {
                        if (showText) setOpenSubmenu(openSubmenu === menuId ? null : menuId);
                      }}
                      className={`relative flex w-full gap-3 items-center px-2 py-2 text-gray-600 hover:bg-teal-50 rounded transition-all ${showText ? "justify-start gap-2" : "justify-center"
                        }`}
                    >
                      <span className="text-[18px]">{item.icon}</span>
                      {showText && <span className="text-[14px] md:text-[16px]">{item.menu}</span>}
                      {showText && (
                        <span className="absolute right-2 text-gray-600">
                          {isOpen ? <IoChevronDown /> : <IoChevronForward />}
                        </span>
                      )}
                    </button>

                    {/* Expanded submenu (sidebar open) */}
                    {showText && (
                      <div
                        className="ml-1 mt-1 space-y-1 overflow-hidden transition-all duration-300"
                        style={{ maxHeight: isOpen ? `${item.children.length * 45}px` : "0px" }}
                      >
                        {item.children.map((child) => {
                          if (!child.roles.includes(role)) return null;
                          return (
                            <NavLink
                              to={child.link}
                              key={child.menu}
                              onClick={() => setOpenSubmenu(menuId)}
                              className={({ isActive }) =>
                                `relative flex items-center gap-2 px-3 py-2 ml-6 text-sm rounded text-gray-600
                                  before:content-[''] before:absolute before:-left-4 before:top-1/2  before:h-[1px] before:w-3  before:bg-gray-700  
                                  after:content-[''] after:absolute after:-left-4 after:top-0 after:h-full after:w-[1px]  after:bg-gray-700
                                  ${isActive ? "bg-primary text-white after:bg-blue-700 before:bg-blue-700 " : "hover:bg-teal-50"}`
                              }
                            >
                              {child.menu}
                            </NavLink>
                          );
                        })}
                      </div>
                    )}

                    {/* Collapsed sidebar Popover on hover */}
                    {!showText && isOpen && anchorEl && (
                      <Popover
                        open
                        anchorEl={anchorEl}
                        onClose={() => setHoveredMenu(null)}
                        anchorOrigin={{ vertical: "center", horizontal: "right" }}
                        transformOrigin={{ vertical: "center", horizontal: "left" }}
                        disableAutoFocus
                        disableEnforceFocus
                        disableRestoreFocus
                        PaperProps={{
                          onMouseEnter: () => setHoveredMenu(menuId),
                          onMouseLeave: () => setHoveredMenu(null),
                        }}
                      >
                        <div className="bg-white rounded-md shadow-lg min-w-[160px] py-2">
                          {item.children.map((child) => {
                            if (!child.roles.includes(role)) return null;
                            return (
                              <NavLink
                                to={child.link}
                                key={child.menu}
                                onClick={() => setHoveredMenu(null)}
                                className={({ isActive }) =>
                                  `block px-4 py-2 text-sm text-gray-600 whitespace-nowrap ${isActive ? "bg-primary text-white" : "hover:bg-gray-100"
                                  }`
                                }
                              >
                                {child.menu}
                              </NavLink>
                            );
                          })}
                        </div>
                      </Popover>
                    )}
                  </div>
                );
              }

              // Single item
              return item.isLogout ? (
                <button
                  key={item.menu}
                  onClick={handleLogout}
                  className={`flex cursor-pointer w-full mb-1 items-center rounded text-gray-600 hover:bg-teal-50 ${showText ? "justify-start gap-3 px-2 py-2" : "justify-center h-10"
                    }`}
                >
                  <span className="text-[18px]">{item.icon}</span>
                  {showText && <span>{item.menu}</span>}
                </button>
              ) : (
                <NavLink
                  to={item.link}
                  end={item.link === "/dashboard"}
                  key={item.link}
                  onClick={() => setOpenSubmenu(null)}
                  className={({ isActive }) =>
                    `flex text-nowrap w-full mb-1 text-[14px] md:text-[16px] items-center rounded text-gray-600 ${showText ? "justify-start gap-3 px-2 py-2" : "justify-center h-10"
                    } ${isActive ? "bg-primary text-white" : ""}`
                  }
                >
                  <span className="text-[18px]">{item.icon}</span>
                  {showText && <span>{item.menu}</span>}
                </NavLink>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const menu = [
  {
    title: "Menu",
    items: [
      { menu: "Dashboard", link: "/dashboard", icon: <VscDashboard />, roles: ["developer", "admin", "superadmin", "manager", "employee","demo"] },
      { menu: "Permissions", link: "/dashboard/permission", icon: <VscDashboard />, roles: ["developer"] },
      { menu: "Organization", link: "/dashboard/organization", icon: <FaSitemap />, roles: ["admin", "superadmin","demo"] },
      {
        menu: "Employees",
        icon: <FaUserTie />,
        roles: ["admin", "superadmin", "manager","demo"],
        children: [
          { menu: "Employee", link: "/dashboard/employe", roles: ["admin", "superadmin", "manager","demo"] },
          { menu: "Leave Request", link: "/dashboard/leave-request", roles: ["employee", "admin", "superadmin", "manager","demo"] },
          { menu: "Leave", link: "/dashboard/leave-ledger", roles: ["admin", "superadmin","demo"] },
          { menu: "Advance", link: "/dashboard/advance", roles: ["admin", "superadmin","demo"] },
        ],
      },
      {
        menu: "Attendance",
        icon: <TbReportAnalytics />,
        roles: ["admin", "superadmin", "manager", "employee","demo"],
        children: [
          { menu: "Attendance", link: "/dashboard/attandence", roles: ["admin", "superadmin", "manager","demo"] },
          { menu: "Emp Attendance", link: "/dashboard/empattandence", roles: ["employee"] },
          { menu: "Report", link: "/dashboard/attandence_Report", roles: ["admin", "superadmin", "manager","demo"] },
        ],
      },
      { menu: "Payroll", link: "/dashboard/payroll", icon: <MdPayments />, roles: ["admin", "superadmin", "manager","demo"] },
      { menu: "Holiday", link: "/dashboard/holiday", icon: <FaCalendarDay />, roles: ["superadmin", "admin","demo"] },
      { menu: "Ledger", link: "/dashboard/ledger", icon: <FaBook />, roles: ["admin", "superadmin", "manager"] },
    ],
  },
  {
    title: "Others",
    items: [
      { menu: "Profile", link: "/dashboard/profile", icon: <FaUserCircle />, roles: ["admin", "superadmin", "manager", "employee", "grant","demo"] },
      { menu: "Setting", link: "/dashboard/setting", icon: <FiSettings />, roles: ["admin", "superadmin", "manager", "employee","demo"] },
      { menu: "Logout", isLogout: true, icon: <CgLogOut />, roles: ["admin", "employee", "superadmin", "developer", "manager", "grant","demo"] },
    ],
  },
];

export default Sidebar;
