import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import { ToastContainer } from 'react-toastify';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminRoutes from './utils/AdminRoutes';
import PrivateRoute from './utils/PrivateRoute';
import Employe from './pages/Employe';
import Department from './pages/department/Department';
import Navbar from './components/Navbar';


function App() {

  return (
    <>
      <ToastContainer closeOnClick />
      {/* <Navbar/> */}
      <Routes>
        <Route path="/" element={<Navigate to="/admin-dashboard" />} />
        <Route path="/login" element={<Login />} />

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
