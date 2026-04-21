// ============================================================
// App.jsx — Root routing
//
// Route structure:
//   /login                      → Login (public)
//   /admin                      → AdminLayout
//     /admin                    → AdminDashboard
//     /admin/employees          → Employees CRUD
//     /admin/users              → Users list
//     /admin/departments        → Departments + assign manager
//     /admin/tasks              → All tasks
//     /admin/attendance         → All attendance
//     /admin/payroll            → All payroll + generate
//     /admin/leaves             → All leave requests
//   /manager                    → ManagerLayout
//     /manager                  → ManagerDashboard
//     /manager/team             → Team management
//     /manager/tasks            → Manager task list
//     /manager/tasks/create     → Create task
//     /manager/attendance       → Team attendance
//     /manager/payroll          → Team payroll + generate
//     /manager/leaves           → Apply own leave + approve team
//   /employee                   → EmployeeLayout
//     /employee                 → Overview
//     /employee/profile         → My Profile
//     /employee/tasks           → My Tasks
//     /employee/attendance      → Check-in/out + history
//     /employee/payroll         → My payroll records
//     /employee/leaves          → Apply leave + view history
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";

// Admin
import AdminLayout       from "./admin/AdminLayout";
import AdminDashboard    from "./admin/AdminDashboard";
import Employees         from "./admin/Employees";
import Users             from "./admin/Users";
import AdminTasks        from "./admin/AdminTasks";
import AdminAttendance   from "./admin/AdminAttendance";
import AdminPayroll      from "./admin/AdminPayroll";
import Departments       from "./admin/Departments";
import AdminLeaves       from "./admin/AdminLeaves";

// Manager
import ManagerLayout     from "./manager/ManagerLayout";
import ManagerDashboard  from "./manager/ManagerDashboard";
import Team              from "./manager/Team";
import ManagerTasks      from "./manager/ManagerTasks";
import CreateTask        from "./manager/CreateTask";
import ManagerAttendance from "./manager/Attendance";
import ManagerPayroll    from "./manager/Payroll";
import ManagerLeaves     from "./manager/Leaves";

// Employee
import EmployeeLayout    from "./employee/EmployeeLayout";
import Overview          from "./employee/Overview";
import Profile           from "./employee/Profile";
import Tasks             from "./employee/Tasks";
import Attendance        from "./employee/Attendance";
import EmployeePayroll   from "./employee/Payroll";
import EmployeeLeaves    from "./employee/Leaves";

// Guard — redirect to login if no token
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("[ROUTE GUARD] No token — redirecting to login");
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  console.log("[FRONTEND] App Loaded");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="users" element={<Users />} />
          <Route path="tasks" element={<AdminTasks />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="payroll" element={<AdminPayroll />} />
          <Route path="departments" element={<Departments />} />
          <Route path="leaves" element={<AdminLeaves />} />
        </Route>

        {/* Manager */}
        <Route path="/manager" element={<PrivateRoute><ManagerLayout /></PrivateRoute>}>
          <Route index element={<ManagerDashboard />} />
          <Route path="team" element={<Team />} />
          <Route path="tasks" element={<ManagerTasks />} />
          <Route path="tasks/create" element={<CreateTask />} />
          <Route path="attendance" element={<ManagerAttendance />} />
          <Route path="payroll" element={<ManagerPayroll />} />
          <Route path="leaves" element={<ManagerLeaves />} />
        </Route>

        {/* Employee */}
        <Route path="/employee" element={<PrivateRoute><EmployeeLayout /></PrivateRoute>}>
          <Route index element={<Overview />} />
          <Route path="profile" element={<Profile />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="payroll" element={<EmployeePayroll />} />
          <Route path="leaves" element={<EmployeeLeaves />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
