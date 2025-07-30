import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminDashboard from './pages/admin/AdminDashboard';
import Login from './pages/Login';
import { ToastContainer } from 'react-toastify';
import AdminRoutes from './utils/AdminRoutes';
import PrivateRoute from './utils/PrivateRoute';
import Salary from './pages/salary/salary';
import { useDispatch, useSelector } from 'react-redux';
import { FirstFetch } from '../store/userSlice';
import { useEffect } from 'react';
import Logout from './pages/logout';
import HolidayForm from './pages/holidays/Holiday';
import CompanySettingForm from './pages/settingPage';
import Profile from './pages/profile/profile';
import EmployeeProfile from './pages/profile/profile';
import { empFirstFetch } from '../store/employee';
import EmpAttenPerformance from './pages/employee/attandencee/empAttandence';
import Employe from './pages/admin/employee/Employe';
import Department from './pages/admin/department/Department';
import Attandence from './pages/admin/attandence/Attandence';
import AttenPerformance from './pages/admin/attandence/AttenPerformance';
import Adminleave from './pages/admin/leave/Adminleave';
import OrganizationSettings from './pages/admin/organization/organization';
import FaceEnrollment from './pages/admin/facerecoginaion/facerecog';
import FaceAttendance from './pages/admin/facerecoginaion/faceAtten';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import Leave from './pages/employee/leave/Leave';
import LedgerSystem from './pages/employee/ledger/ledger';
import LedgerListPage from './pages/employee/ledger/ledgerpagelist';
import LedgerDetailPage from './pages/employee/ledger/ledgerdetailpage';


function App() {
  const dispatch = useDispatch();
  const { islogin, isadmin } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.user);

  useEffect(() => {
    // console.log("login check",islogin)
    if (islogin && user?.profile?.role == 'admin') {
      dispatch(FirstFetch());
    } else if (islogin && user?.profile?.role == 'employee') {
      dispatch(empFirstFetch());
    }
  }, [islogin, user?.profile?.role]);

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
          <Route path="organization" element={<OrganizationSettings />} />
          <Route path="department" element={<Department />} />
          <Route path="salary" element={<Salary />} />
          <Route path="attandence" element={<Attandence />} />
          <Route path="holiday" element={<HolidayForm />} />
          <Route path="adminleave" element={<Adminleave />} />
          <Route path="setting" element={<CompanySettingForm />} />
          <Route path="face" element={<FaceEnrollment />} />
          <Route path="faceatten" element={<FaceAttendance />} />
          <Route path="performance/:userid" element={<AttenPerformance />} />
        </Route>

        <Route
          path="/employe-dashboard"
          element={<PrivateRoute />}
        >
          <Route path="" element={<EmployeeDashboard />} />
          <Route path="empattandence" element={<EmpAttenPerformance />} />
          <Route path="leave" element={<Leave />} />
          <Route path="ledger" element={<LedgerSystem />} />
          
          {/* <Route path="ledger" element={<LedgerListPage />} /> */}
          <Route path="ledger/:id" element={<LedgerDetailPage />} />
        </Route>
        <Route
          element={<PrivateRoute />}
        >
          <Route path="profile" element={<EmployeeProfile />} />
        </Route>
        {/* <Route path="profile" element={<EmployeeProfile />} /> */}
      </Routes>
    </>
  )
}

export default App
