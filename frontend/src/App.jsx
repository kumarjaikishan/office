import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, Suspense, lazy } from 'react';
import { FirstFetch } from '../store/userSlice';
import { empFirstFetch } from '../store/employee';
import ProtectedRoutes from './utils/protectedRoute';
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
const CompanySettingForm = lazy(() => import('./pages/settingPage'));
const FaceAttandance = lazy(() => import('./pages/admin/facerecoginaion/faceAttandance'));
const LedgerListPage = lazy(() => import('./pages/admin/ledger/ledgerpagelist'));
const LedgerDetailPage = lazy(() => import('./pages/admin/ledger/ledgerdetailpage'));
const ManagerDashboard = lazy(() => import('./pages/manager/ManagerDashboard'));

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
      <Route path="holiday" element={<HolidayForm />} />
      <Route path="leave" element={<Adminleave />} />
      <Route path="setting" element={<CompanySettingForm />} />
      <Route path="faceatten" element={<FaceAttandance />} />
      <Route path="profile" element={<AdminManagerProfile />} />
      <Route path="ledger" element={<LedgerListPage />} />
      <Route path="ledger/:id" element={<LedgerDetailPage />} />
      <Route path="performance/:userid" element={<AttenPerformance />} />
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
      <Route path="holiday" element={<HolidayForm />} />
      <Route path="leave" element={<Adminleave />} />
      <Route path="setting" element={<CompanySettingForm />} />
      <Route path="faceatten" element={<FaceAttandance />} />
      <Route path="profile" element={<AdminManagerProfile />} />
      <Route path="ledger" element={<LedgerListPage />} />
      <Route path="ledger/:id" element={<LedgerDetailPage />} />
      <Route path="performance/:userid" element={<AttenPerformance />} />
      <Route path="*" element={<Errorpage />} />
    </Route>
  ),
  manager: (
    <Route path="/dashboard" element={<ProtectedRoutes allowedRoles={['manager']} />}>
      <Route index element={<ManagerDashboard />} />
      <Route path="employe" element={<Employe />} />
      <Route path="salary" element={<Salary />} />
      <Route path="attandence" element={<Attandence />} />
      <Route path="leave" element={<Adminleave />} />
      <Route path="faceatten" element={<FaceAttandance />} />
      <Route path="profile" element={<AdminManagerProfile />} />
      <Route path="ledger" element={<LedgerListPage />} />
      <Route path="ledger/:id" element={<LedgerDetailPage />} />
      <Route path="performance/:userid" element={<AttenPerformance />} />
      <Route path="*" element={<Errorpage />} />
    </Route>
  ),
  employee: (
    <Route path="/dashboard" element={<ProtectedRoutes allowedRoles={['employee']} />}>
      <Route index element={<EmployeeDashboard />} />
      <Route path="empattandence" element={<EmpAttenPerformance />} />
      <Route path="profile" element={<EmployeeProfile />} />
      <Route path="leave" element={<EmpLeave />} />
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

  // Fetch data based on role
  useEffect(() => {
    // if (!islogin) return;
    if (!islogin) {
     return <Navigate to="/login" />
    }
    const role = user?.profile?.role;

    if (['superadmin', 'admin', 'manager'].includes(role)) {
      dispatch(FirstFetch());
    } else if (role === 'employee') {
      dispatch(empFirstFetch());
    }
  }, [islogin, user?.profile?.role, dispatch]);


  // ✅ Safe role route resolution
  // const roleRoute = islogin ? routesByRole[user?.profile?.role] : null;
  const roleRoute = islogin ? routesByRole[user?.profile?.role] || [] : [];


  return (
    <>
      <ToastContainer closeOnClick />
      <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
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
