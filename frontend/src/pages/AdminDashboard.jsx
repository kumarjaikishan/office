import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import DashboardCard from '../components/dashboardCard';
import { FaBuilding, FaTachometerAlt, FaUsers } from 'react-icons/fa'
import './admindashboard.css'

const Main = () => {

  const user = useSelector((state) => state.user);
  let navigate = useNavigate();

  useEffect(() => {
    !user.islogin && navigate('/login');
  }, [user.islogin])


  return (
    <div className='adminDashboard'>
      <div className="overview">
        <h3>Dashboar overview</h3>
        <div className="cards" >
          <DashboardCard logo={<FaUsers />} head="Total Employees" number="5" color="teal" />
          <DashboardCard logo={<FaTachometerAlt />} head="Total Departments" number="3" color="orange" />
          <DashboardCard logo={<FaBuilding />} head="Monthly Pay" number="$2500" color="red" />
        </div>
      </div>
      <div className="leaveDetail">
        <h3>Leave Details</h3>
        <div className="cards">
          <DashboardCard logo={<FaUsers />} head="Leave Applied" number="5" color="teal" />
          <DashboardCard logo={<FaTachometerAlt />} head="Leave Approved" number="3" color="orange" />
          <DashboardCard logo={<FaBuilding />} head="Leace Pending" number="1" color="red" />
          <DashboardCard logo={<FaBuilding />} head="Leave Rejected" number="2" color="blue" />
        </div>
      </div>
    </div>
  )
}

export default Main
