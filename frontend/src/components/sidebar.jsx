import React from 'react'
import { FaRegBuilding, FaTachometerAlt, FaUsers } from 'react-icons/fa'
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


const Sidebar = () => {

    const navigate = useNavigate();

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
            <div className="logo h-[60px]  flex items-center gap-4">
                <span className='text-3xl'> <SiAudiotechnica /></span>
                <span className='hidden lg:block'>company name</span>
            </div>
            {menu.map((item) => {
                return <div className='w-full' key={item.title}>
                    <div className='hidden lg:block mt-3 font-light text-gray-400'>{item.title}</div>
                    {item.items.map((iteme) => (
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
                                key={iteme.menu}
                                className={({ isActive }) =>
                                    `flex justify-center lg:justify-start w-full mb-1 px-2 items-center gap-3 py-2 
                                    rounded text-gray-600
                                     ${isActive ? 'bg-teal-100 text-teal-700' : ''}`
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
        items: [{
            menu: "Dashboard",
            link: '/admin-dashboard',
            icon: <VscDashboard />
        },
        {
            menu: "Empoloyes",
            link: '/admin-dashboard/employe',
            icon: <GoPeople />
        },
        {
            menu: "Department",
            link: '/admin-dashboard/department',
            icon: <FaRegBuilding />
        },
        {
            menu: "Holiday",
            link: '/admin-dashboard/holiday',
            icon: <FaRegBuilding />
        },
        {
            menu: "Leave",
            link: '/admin-dashboard/leave',
            icon: <FaRegBuilding />
        },
        {
            menu: "Admin Leave",
            link: '/admin-dashboard/adminleave',
            icon: <FaRegBuilding />
        },
        {
            menu: "Attandence",
            link: '/admin-dashboard/attandence',
            icon: <TbReportAnalytics />
        },
        {
            menu: "Salary",
            link: '/admin-dashboard/salary',
            icon: <GiTakeMyMoney />
        }
        ]
    },
    {
        title: 'Others',
        items: [{
            menu: "Profile",
            link: '/profile',
            icon: <GiPlagueDoctorProfile />
        },
        {
            menu: "Setting",
            link: '/settings',
            icon: <GoGear />
        },
        {
            menu: "Logout",
            isLogout: true,
            icon: <CgLogOut />
        },
        ]

    }
]

export default Sidebar
