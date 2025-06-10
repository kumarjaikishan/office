import React from 'react'
import { FaBuilding, FaTachometerAlt, FaUsers } from 'react-icons/fa'
import { NavLink } from 'react-router-dom'
import { SiAudiotechnica } from "react-icons/si";
import './sidebar.css'

const Sidebar = () => {
    return (
        <div className='sidebar'>
            <div className="logo">
                <SiAudiotechnica />
            </div>
            <div className="menu">
                <NavLink to='/admin-dashboard' end>
                    <FaTachometerAlt />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to='/admin-dashboard/employe'>
                    <FaUsers />
                    <span>Empoloyes</span>
                </NavLink>
                <NavLink to='/admin-dashboard/department'>
                    <FaBuilding />
                    <span>Department</span>
                </NavLink>
                <NavLink to='/admin-dashboard/salary'>
                    <FaBuilding />
                    <span>Salary</span>
                </NavLink>
            </div>
        </div>
    )
}

export default Sidebar
