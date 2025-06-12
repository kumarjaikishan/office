import React from 'react'
import { FaRegBuilding , FaTachometerAlt, FaUsers } from 'react-icons/fa'
import { NavLink } from 'react-router-dom'
import { SiAudiotechnica } from "react-icons/si";
import { GoPeople } from "react-icons/go";
import { GiTakeMyMoney } from "react-icons/gi";
import { VscDashboard } from "react-icons/vsc";
import './sidebar.css'

const Sidebar = () => {
    return (
        <div className='sidebar'>
            <div className="logo">
                <SiAudiotechnica />
            </div>
            <div className="menu">
                <NavLink to='/admin-dashboard' end>
                    <VscDashboard />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to='/admin-dashboard/employe'>
                    <GoPeople />
                    <span>Empoloyes</span>
                </NavLink>
                <NavLink to='/admin-dashboard/department'>
                    <FaRegBuilding />
                    <span>Department</span>
                </NavLink>
                <NavLink to='/admin-dashboard/salary'>
                    <GiTakeMyMoney />
                    <span>Salary</span>
                </NavLink>
            </div>
        </div>
    )
}

export default Sidebar
