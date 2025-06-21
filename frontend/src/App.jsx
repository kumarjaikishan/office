import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import { ToastContainer } from 'react-toastify';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminRoutes from './utils/AdminRoutes';
import PrivateRoute from './utils/PrivateRoute';
import Employe from './pages/employee/Employe';
import Department from './pages/department/Department';
import Salary from './pages/salary/salary';
import Attandence from './pages/attandence/Attandence';
import { useDispatch, useSelector } from 'react-redux';
import { FirstFetch } from '../store/userSlice';
import { useEffect } from 'react';
import Logout from './pages/logout';
import AttenPerformance from './pages/attandence/AttenPerformance';
import HolidayForm from './pages/holidays/Holiday';
import Leave from './pages/leave/Leave';
import Adminleave from './pages/leave/Adminleave';
import CompanySettingForm from './pages/settingPage';


function App() {
  const dispatch = useDispatch();
  const { islogin } = useSelector((state) => state.auth);

  useEffect(() => {
    // console.log("login check",islogin)
    if (islogin) {
      dispatch(FirstFetch());
    }
  }, [islogin, dispatch]);

  return (
    <>
      <ToastContainer closeOnClick />
      {/* <Navbar/> */}
      <Routes>
        <Route path="/" element={<Navigate to="/admin-dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />

        {/* <Route
          path="/admin-dashboard"
          element={<AdminRoutes />}
        >
          <Route path="" element={<Navigate to="/admin-dashboard/dash" />} />
          <Route path="dash" element={<AdminDashboard />} />
        </Route>
        <Route
          path="/employe-dashboard"
          element={<PrivateRoute />}
        >
          <Route path="" element={<Navigate to="/employe-dashboard/dash" />} />
          <Route path="dash" element={<EmployeeDashboard />} />
        </Route> */}

        {/* <Route path="/admin-dashboard" element={<AdminDashboard />} /> */}
        {/* <Route path="/employe-dashboard" element={<EmployeeDashboard />} /> */}

        <Route
          path="/admin-dashboard"
          element={<AdminRoutes />}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="employe" element={<Employe />} />
          <Route path="department" element={<Department />} />
          <Route path="salary" element={<Salary />} />
          <Route path="attandence" element={<Attandence />} />
          <Route path="holiday" element={<HolidayForm />} />
          <Route path="leave" element={<Leave />} />
          <Route path="adminleave" element={<Adminleave />} />
          <Route path="setting" element={<CompanySettingForm />} />
          <Route path="performance/:userid" element={<AttenPerformance />} />
        </Route>

        <Route
          path="/employe-dashboard"
          element={<PrivateRoute />}
        >
          <Route path="" element={<EmployeeDashboard />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
