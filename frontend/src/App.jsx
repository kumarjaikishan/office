import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, Suspense, lazy } from 'react';
import { FirstFetch } from '../store/userSlice';
import { empFirstFetch } from '../store/employee';
import ProtectedRoutes from './utils/protectedRoute';
import { GoGear } from 'react-icons/go';
import { connectSSE, closeSSE } from "./utils/sse";
import { Avatar } from '@mui/material';
import dayjs from 'dayjs';
import { FaRegUser } from 'react-icons/fa';
import PayrollPage from './pages/payroll/payroll';
import PayrollCreatePage from './pages/payroll/payrollCreating';
import AttendanceReport from './pages/report/attandenceReport';
import PayrollPrint from './pages/payroll/payrollprint';
import PayrollEdit from './pages/payroll/payrollEdit';
import LeaveBalancePage from './pages/leavebalamce/leavebalance';
// import  Errorpage  from './pages/error/Errorpage';

// ✅ Lazy imports
const Login = lazy(() => import('./pages/Login'));
const Logout = lazy(() => import('./pages/logout'));
const Errorpage = lazy(() => import('./pages/error/Errorpage'));

// Admin/Manager
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const Employe = lazy(() => import('./pages/admin/employee/Employe'));
const Department = lazy(() => import('./pages/admin/department/Department'));
const OrganizationSettings = lazy(() => import('./pages/admin/organization/organization'));
const Salary = lazy(() => import('./pages/salary/salary'));
const Attandence = lazy(() => import('./pages/admin/attandence/Attandence'));
const AttenPerformance = lazy(() => import('./pages/admin/attandence/AttenPerformance'));
const Adminleave = lazy(() => import('./pages/admin/leave/Adminleave'));
const HolidayForm = lazy(() => import('./pages/holidays/Holiday'));
const Setting = lazy(() => import('./pages/settingPage'));
const FaceAttandance = lazy(() => import('./pages/admin/facerecoginaion/faceAttandance'));
const LedgerListPage = lazy(() => import('./pages/admin/ledger/ledgerpagelist'));
const LedgerDetailPage = lazy(() => import('./pages/admin/ledger/ledgerdetailpage'));
const ManagerDashboard = lazy(() => import('./pages/manager/ManagerDashboard'));
const PasswordReset = lazy(() => import('./utils/PasswordReset'));

// Employee
const EmployeeDashboard = lazy(() => import('./pages/employee/EmployeeDashboard'));
const EmpAttenPerformance = lazy(() => import('./pages/employee/attandencee/empAttandence'));
const EmpLeave = lazy(() => import('./pages/employee/leave/Leave'));

// Developer
const DeveloperDashboard = lazy(() => import('./pages/developer/Dashboard'));
const Permission = lazy(() => import('./pages/developer/Permission'));

// Profile
const EmployeeProfile = lazy(() => import('./pages/profile/profile'));
const AdminManagerProfile = lazy(() => import('./pages/profile/adminManagerProfile'));

// 🔹 Role-based route definitions
const routesByRole = {
  admin: (
    <Route path="/dashboard" element={<ProtectedRoutes allowedRoles={['admin']} />}>
      <Route index element={<AdminDashboard />} />
      <Route path="employe" element={<Employe />} />
      <Route path="organization" element={<OrganizationSettings />} />
      <Route path="department" element={<Department />} />
      <Route path="salary" element={<Salary />} />
      <Route path="attandence" element={<Attandence />} />
      <Route path="attandence_Report" element={<AttendanceReport />} />
      <Route path="holiday" element={<HolidayForm />} />
      <Route path="leave" element={<Adminleave />} />
      <Route path="leavebal" element={<LeaveBalancePage />} />
      <Route path="setting" element={<Setting />} />
      <Route path="faceatten" element={<FaceAttandance />} />
      <Route path="profile" element={<AdminManagerProfile />} />
      <Route path="ledger" element={<LedgerListPage />} />
      <Route path="ledger/:id" element={<LedgerDetailPage />} />
      <Route path="performance/:userid" element={<AttenPerformance />} />
      <Route path="payroll" element={<PayrollPage />} />
      <Route path="payroll/add" element={<PayrollCreatePage />} />
      <Route path="payroll/print/:id" element={<PayrollPrint />} />
      <Route path="payroll/edit/:id" element={<PayrollEdit />} />
      <Route path="*" element={<Errorpage />} />
    </Route>
  ),
  superadmin: (
    <Route path="/dashboard" element={<ProtectedRoutes allowedRoles={['superadmin']} />}>
      <Route index element={<AdminDashboard />} />
      <Route path="employe" element={<Employe />} />
      <Route path="organization" element={<OrganizationSettings />} />
      <Route path="department" element={<Department />} />
      <Route path="salary" element={<Salary />} />
      <Route path="attandence" element={<Attandence />} />
      <Route path="attandence_Report" element={<AttendanceReport />} />
      <Route path="holiday" element={<HolidayForm />} />
      <Route path="leave" element={<Adminleave />} />
      <Route path="leavebal" element={<LeaveBalancePage />} />
      <Route path="setting" element={<Setting />} />
      <Route path="faceatten" element={<FaceAttandance />} />
      <Route path="profile" element={<AdminManagerProfile />} />
      <Route path="ledger" element={<LedgerListPage />} />
      <Route path="ledger/:id" element={<LedgerDetailPage />} />
      <Route path="performance/:userid" element={<AttenPerformance />} />
      <Route path="payroll" element={<PayrollPage />} />
      <Route path="payroll/add" element={<PayrollCreatePage />} />
      <Route path="payroll/print/:id" element={<PayrollPrint />} />
      <Route path="payroll/edit/:id" element={<PayrollEdit />} />
      <Route path="*" element={<Errorpage />} />
    </Route>
  ),
  manager: (
    <Route path="/dashboard" element={<ProtectedRoutes allowedRoles={['manager']} />}>
      <Route index element={<ManagerDashboard />} />
      <Route path="employe" element={<Employe />} />
      <Route path="salary" element={<Salary />} />
      <Route path="attandence" element={<Attandence />} />
      <Route path="attandence_Report" element={<AttendanceReport />} />
      <Route path="leave" element={<Adminleave />} />
      <Route path="leavebal" element={<LeaveBalancePage />} />
      <Route path="faceatten" element={<FaceAttandance />} />
      <Route path="profile" element={<AdminManagerProfile />} />
      <Route path="setting" element={<Setting />} />
      <Route path="ledger" element={<LedgerListPage />} />
      <Route path="ledger/:id" element={<LedgerDetailPage />} />
      <Route path="performance/:userid" element={<AttenPerformance />} />
      <Route path="payroll" element={<PayrollPage />} />
      <Route path="payroll/add" element={<PayrollCreatePage />} />
      <Route path="payroll/print/:id" element={<PayrollPrint />} />
      <Route path="payroll/edit/:id" element={<PayrollEdit />} />
      <Route path="*" element={<Errorpage />} />
    </Route>
  ),
  employee: (
    <Route path="/dashboard" element={<ProtectedRoutes allowedRoles={['employee']} />}>
      <Route index element={<EmployeeDashboard />} />
      <Route path="empattandence" element={<EmpAttenPerformance />} />
      <Route path="profile" element={<EmployeeProfile />} />
      <Route path="leave" element={<EmpLeave />} />
      <Route path="setting" element={<Setting />} />
      <Route path="*" element={<Errorpage />} />
    </Route>
  ),
  developer: (
    <Route path="/dashboard" element={<ProtectedRoutes allowedRoles={['developer']} />}>
      <Route index element={<DeveloperDashboard />} />
      <Route path="permission" element={<Permission />} />
    </Route>
  ),
};

function App() {
  const dispatch = useDispatch();
  const { islogin } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  const primaryColor = useSelector((state) => state.user.primaryColor) || "#115e59";

  useEffect(() => {

    document.documentElement.style.setProperty("--color-primary", primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    if (!islogin) {
      navigate("/login");
      return;
    }
    const role = user?.profile?.role;

    if (['superadmin', 'admin', 'manager'].includes(role)) {
      dispatch(FirstFetch());
    } else if (role === 'employee') {
      dispatch(empFirstFetch());
    }
  }, [islogin, user?.profile?.role, dispatch]);

  useEffect(() => {
    islogin && jwtcheck();
  }, [islogin]);

  const tokenErrors = {
    "jwt expired": ['Session Expired', 'Your session has expired. Please log in again.'],
    "Invalid Token": ['Invalid Token', 'You need to log in again.']
  }

  const jwtcheck = async () => {
    try {
      const token = localStorage.getItem('emstoken');
      const responsee = await fetch(`${import.meta.env.VITE_API_ADDRESS}jwtcheck`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log(responsee)
      const data = await responsee.json();
      console.log("jwt check", data);

      if (tokenErrors[data.message]) {
        const title = tokenErrors[data.message][0];
        const text = tokenErrors[data.message][1];
        swal({
          title, text, icon: 'warning',
          button: {
            text: 'OK',
          },
        }).then(() => {
          return navigate('/logout');
        });
      }
    } catch (error) {
      console.log("Token check:", error);
    }
  }

  const roleRoute = islogin ? routesByRole[user?.profile?.role] || [] : [];

  useEffect(() => {
    if (islogin && user?.liveAttandence && ["superadmin", "admin", "manager"].includes(user?.profile?.role)) {
      const es = connectSSE((data) => {
        if (data.type === "attendance_update") {
          const emp = data.payload.data.employeeId;

          if (data.payload.action === "checkin") {
            toast(
              <div className="flex items-center gap-2 pr-1">
                <Avatar src={emp.profileimage} alt={emp.employeename}>
                  {!emp.profileimage && <FaRegUser />}
                </Avatar>
                <span className="text-[14px] ">
                  <span className="text-green-700 capitalize font-semibold">
                    {emp.userid.name}
                  </span>{" "}
                  has Punched In at{" "}
                  <span className="text-green-700">
                    {dayjs(data.payload.data.punchIn).format("hh:mm A")}
                  </span>
                </span>
              </div>,
              { autoClose: 20000 }
            );
            dispatch(FirstFetch());
          }

          if (data.payload.action === "checkOut") {
            toast(
              <div className="flex items-center gap-2 pr-1">
                <Avatar src={emp.profileimage} alt={emp.employeename}>
                  {!emp.profileimage && <FaRegUser />}
                </Avatar>
                <span className="text-[14px] ">
                  <span className="text-amber-700 capitalize font-semibold">
                    {emp.userid.name}
                  </span>{" "}
                  has Punched Out at{" "}
                  <span className="text-amber-700">
                    {dayjs(data.payload.data.punchOut).format("hh:mm A")}
                  </span>
                </span>
              </div>,
              { autoClose: 20000 }
            );
            dispatch(FirstFetch());
          }
        }
      });

      return () => {
        closeSSE();
      };
    }
  }, [user?.liveAttandence]);



  return (
    <>
      <ToastContainer closeOnClick />
      <Suspense
        fallback={<div className="flex items-center justify-center h-screen w-screen bg-white">
          <div className="relative">
            <GoGear
              className="animate-spin"
              style={{ animationDuration: "2.5s" }}
              size={60}
              color="teal"
            />
            <GoGear
              className="absolute -bottom-4 left-0 animate-spin"
              style={{ animationDuration: "3s" }}
              size={25}
              color="teal"
            />
          </div>
        </div>}
      >
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/resetpassword/:token" element={<PasswordReset />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />

          {/* Role based routes */}
          {roleRoute}

          {/* Fallback */}
          <Route path="*" element={<Errorpage />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
