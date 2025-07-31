import React, { useEffect } from 'react'
import { FaCalendarCheck, FaMailBulk, FaRegBuilding, FaRegCalendarAlt, FaSitemap, FaTachometerAlt, FaUmbrellaBeach, FaUserCircle, FaUsers, FaUserTie } from 'react-icons/fa'
import { NavLink, useNavigate } from 'react-router-dom'
import { SiAudiotechnica } from "react-icons/si";
import { GoPeople } from "react-icons/go";
import { GiTakeMyMoney } from "react-icons/gi";
import { VscDashboard } from "react-icons/vsc";
import { GiPlagueDoctorProfile } from "react-icons/gi";
import { GoGear } from "react-icons/go";
import { CgLogOut } from "react-icons/cg";
import { TbReportAnalytics } from "react-icons/tb";
import swal from 'sweetalert';
import { useSelector } from 'react-redux';
import { FiSettings } from 'react-icons/fi';


const Sidebar = () => {
  const navigate = useNavigate();
  const { islogin } = useSelector((state) => state.auth);
  const { company } = useSelector((state) => state.user);
  const user = useSelector((state) => state.user);
  useEffect(() => {
    // console.log(user)
  }, [user])
  const role = user?.profile?.role;

  const handleLogout = () => {
    swal({
      title: "Are you sure you want to logout?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willLogout) => {
      if (willLogout) {
        navigate('/logout'); // go to actual Logout route
      }
    });
  };

  return (
    <div className=' w-full h-full px-1 md:px-2 '>
      <div className="logo h-[60px] flex items-center gap-4">
        <span className="text-3xl">
          {company?.logo ? (
            <div className='rounded-full overflow-hidden w-14 h-14 object-cover  '>
            <img
              className=" w-[100%] h-[100%] object-fill"
              src={company.logo}
              alt="Company Logo"
            />
            </div>
          ) : (
            <SiAudiotechnica />
          )}
        </span>
        <span className="hidden lg:block capitalize">
          {user?.company?.name || 'Company Name'}
        </span>
      </div>

      {menu.map((item) => {
        const filteredItems = item.items.filter(item => item.roles.includes(role));

        return <div className='w-full' key={item.title}>
          <div className='hidden lg:block mt-3 font-light text-gray-400'>{item.title}</div>
          {filteredItems.map((iteme) => (
            iteme.isLogout ? (
              <button key={"sdjfh"}
                onClick={() => handleLogout()}
                className="flex justify-center cursor-pointer lg:justify-start w-full mb-1 px-2 items-center gap-3 py-2 
                              rounded text-gray-600 hover:bg-teal-50"
              >
                <span className="text-[18px]">{iteme.icon}</span>
                <span className="hidden lg:block">{iteme.menu}</span>
              </button>
            ) : (
              <NavLink
                to={iteme.link}
                end
                key={iteme.link}
                className={({ isActive }) =>
                  `flex justify-center lg:justify-start w-full mb-1 px-2 items-center gap-3 py-2 
                                    rounded text-gray-600
                                     ${isActive ? 'bg-teal-700 text-white' : ''}`
                }
              >
                <span className="text-[18px]">{iteme.icon}</span>
                <span className="hidden lg:block">{iteme.menu}</span>
              </NavLink>
            )
          ))}
        </div>
      })}

    </div>
  )
}

const menu = [
  {
    title: 'Menu',
    items: [
      {
        menu: "Dashboard",
        link: '/admin-dashboard',
        icon: <VscDashboard />,
        roles: ['admin']
      },
      {
        menu: "Dashboard",
        link: '/employe-dashboard',
        icon: <VscDashboard />,
        roles: ['employee']
      },
      {
        menu: "Organization",
        link: '/admin-dashboard/organization',
        icon: <FaSitemap />,
        roles: ['admin']
      },
      {
        menu: "Employees",
        link: '/admin-dashboard/employe',
        icon: <FaUserTie />,
        roles: ['admin']
      },
      // {
      //   menu: "Department",
      //   link: '/admin-dashboard/department',
      //   icon: <FaRegBuilding />,
      //   roles: ['admin']
      // },
      {
        menu: "Holiday",
        link: '/admin-dashboard/holiday',
        icon: <FaRegCalendarAlt />,
        roles: ['admin']
      },
      {
        menu: "Face Enroll",
        link: '/admin-dashboard/face',
        icon: <FaRegCalendarAlt />,
        roles: ['admin']
      },
      {
        menu: "Face Attendance",
        link: '/admin-dashboard/faceatten',
        icon: <FaRegCalendarAlt />,
        roles: ['admin']
      },
      {
        menu: "Leave",
        link: '/employe-dashboard/leave',
        icon: <FaUmbrellaBeach />,
        roles: ['employee']
      },
      {
        menu: "Ledger",
        link: '/admin-dashboard/ledger',
        icon: <FaUmbrellaBeach />,
        roles: ['admin']
      },
      {
        menu: "Leave Request",
        link: '/admin-dashboard/adminleave',
        icon: <FaMailBulk />,
        roles: ['admin']
      },
      {
        menu: "Attendance",
        link: '/admin-dashboard/attandence',
        icon: <TbReportAnalytics />,
        roles: ['admin']
      },
      {
        menu: "Attendance",
        link: '/employe-dashboard/empattandence',
        icon: <TbReportAnalytics />,
        roles: ['employee']
      },
      // {
      //   menu: "Salary",
      //   link: '/admin-dashboard/salary',
      //   icon: <GiTakeMyMoney />,
      //   roles: ['admin']
      // }
    ]
  },
  {
    title: 'Others',
    items: [
      {
        menu: "Profile",
        link: '/profile',
        icon: <FaUserCircle />,
        roles: ['admin', 'employee']
      },
      {
        menu: "Setting",
        link: '/admin-dashboard/setting',
        icon: <FiSettings />,
        roles: ['admin']
      },
      {
        menu: "Logout",
        isLogout: true,
        icon: <CgLogOut />,
        roles: ['admin', 'employee']
      }
    ]
  }
];

export default Sidebar
