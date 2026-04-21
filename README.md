# Company Management System (CMS)

A full-stack company management platform built with Node.js, React, and MongoDB Atlas.
Role-based access control gives admins, managers, and employees their own tailored experience.

---

## Tech Stack

| Layer    | Technology                      |
|----------|---------------------------------|
| Backend  | Node.js 18+, Express.js         |
| Frontend | React 19, Vite, Tailwind CSS v3 |
| Database | MongoDB Atlas (Mongoose ODM)    |
| Auth     | JWT (jsonwebtoken), bcryptjs    |
| HTTP     | Axios                           |
| Routing  | React Router DOM v7             |
| UI/UX    | Professional SVG icons, Light/Dark theme with proper contrast |

---

## Project Structure

```
cms/
├── backend/
│   ├── config/
│   │   └── db.js                       # MongoDB connection + Google DNS fix
│   ├── controllers/
│   │   ├── authController.js           # Register, Login
│   │   ├── employeeController.js       # Employee CRUD + getMyProfile
│   │   ├── departmentController.js     # Department CRUD + assign manager
│   │   ├── taskController.js           # Task CRUD (role-based)
│   │   ├── attendanceController.js     # Check-in/out + history
│   │   ├── payrollController.js        # Generate + view payroll
│   │   └── leaveController.js          # Apply + approve/reject leave
│   ├── middleware/
│   │   ├── authMiddleware.js           # JWT verification on all protected routes
│   │   └── roleMiddleware.js           # Role-based access control per route
│   ├── models/
│   │   ├── User.js                     # Auth account (name, email, password, role, department)
│   │   ├── Employee.js                 # Employee record (linked to User, stores createdBy)
│   │   ├── Department.js               # Department with one manager
│   │   ├── Task.js                     # Task assigned to employee by manager
│   │   ├── Attendance.js               # Daily attendance (unique: employee+date)
│   │   ├── Payroll.js                  # Monthly payroll (unique: employee+month)
│   │   └── Leave.js                    # Leave request with approval workflow
│   ├── routes/
│   │   ├── authRoutes.js               # /api/auth
│   │   ├── employeeRoutes.js           # /api/employees
│   │   ├── departmentRoutes.js         # /api/departments
│   │   ├── taskRoutes.js               # /api/tasks
│   │   ├── attendanceRoutes.js         # /api/attendance
│   │   ├── payrollRoutes.js            # /api/payroll
│   │   └── leaveRoutes.js              # /api/leaves
│   ├── .env
│   └── server.js                       # Express app entry point
│
└── frontend/
    └── src/
        ├── admin/
        │   ├── AdminLayout.jsx         # Collapsible sidebar + mobile overlay drawer
        │   ├── AdminDashboard.jsx      # Overview with real employee count
        │   ├── Employees.jsx           # Full CRUD + search/dept/status/sort filters
        │   ├── Users.jsx               # All system users + role filter
        │   ├── Departments.jsx         # Create dept + assign/remove manager
        │   ├── AdminTasks.jsx          # All tasks + filters + pagination
        │   ├── AdminAttendance.jsx     # All attendance + filters + pagination
        │   ├── AdminPayroll.jsx        # All payroll + generate form + pagination
        │   └── AdminLeaves.jsx         # All leave requests + approve/reject
        ├── manager/
        │   ├── ManagerLayout.jsx       # Sidebar + topbar
        │   ├── ManagerDashboard.jsx    # Team overview
        │   ├── Team.jsx                # View team + add member
        │   ├── ManagerTasks.jsx        # Tasks created by manager
        │   ├── CreateTask.jsx          # Create + assign task form
        │   ├── Attendance.jsx          # Team attendance + filters
        │   ├── Payroll.jsx             # Team payroll + generate form
        │   └── Leaves.jsx              # Apply own leave + approve team leaves
        ├── employee/
        │   ├── EmployeeLayout.jsx      # Sidebar with all nav items
        │   ├── Overview.jsx            # Real profile data from API
        │   ├── Profile.jsx             # Full profile + job details
        │   ├── Tasks.jsx               # My tasks + toggle status
        │   ├── Attendance.jsx          # Check-in/out + history
        │   ├── Payroll.jsx             # My payroll records
        │   └── Leaves.jsx              # Apply leave + view history
        ├── api/
        │   ├── axios.js                # Base instance with JWT interceptor
        │   ├── employeeApi.js
        │   ├── departmentApi.js
        │   ├── taskApi.js
        │   ├── attendanceApi.js
        │   ├── payrollApi.js
        │   └── leaveApi.js
        ├── components/
        │   └── ThemeToggle.jsx         # Light/dark toggle button
        ├── context/
        │   └── ThemeContext.jsx        # Global theme state (persisted)
        └── pages/
            └── Login.jsx               # Split-panel login page
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- npm

### Backend Setup

```bash
cd cms/backend
npm install
```

Create `.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/CMS_DB?retryWrites=true&w=majority
JWT_SECRET=yourStrongSecret
```

```bash
npm run dev    # development with nodemon
npm start      # production
```

### Frontend Setup

```bash
cd cms/frontend
npm install
npm run dev
```

Frontend → `http://localhost:5173` | Backend → `http://localhost:5000`

### DNS Note

If MongoDB Atlas connection fails with `ECONNREFUSED`, `db.js` forces Google DNS (`8.8.8.8`) to resolve SRV records. This fixes the issue on networks with broken IPv6 DNS.

---

## Initial Setup — Create First Admin

No registration UI exists by design. Create the first admin via API (Postman / Thunder Client):

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin",
  "email": "admin@company.com",
  "password": "admin@123",
  "role": "admin"
}
```

Then follow this workflow:
1. Login at `http://localhost:5173` → Admin dashboard opens
2. **Admin → Departments** → Create departments
3. **Admin → Employees** → Add managers (role = Manager, no department needed yet)
4. **Admin → Departments** → Assign each manager to a department
5. **Admin → Employees** → Add employees (department required)
6. **Manager → Tasks** → Create and assign tasks to employees
7. **Employee → Attendance** → Check in/out daily
8. **Manager/Admin → Payroll** → Generate monthly payroll
9. **Employee/Manager → Leaves** → Apply for leave; manager/admin approves

---

## API Reference

All protected routes require: `Authorization: Bearer <token>`

### Auth — `/api/auth`

| Method | Endpoint             | Access | Description        |
|--------|----------------------|--------|--------------------|
| POST   | `/api/auth/register` | Public | Register new user  |
| POST   | `/api/auth/login`    | Public | Login, returns JWT |

### Employees — `/api/employees`

| Method | Endpoint             | Access         | Description              |
|--------|----------------------|----------------|--------------------------|
| GET    | `/api/employees/me`  | All            | Own employee profile     |
| GET    | `/api/employees`     | Admin, Manager | All employees            |
| GET    | `/api/employees/:id` | All            | Employee by ID           |
| POST   | `/api/employees`     | Admin, Manager | Create employee + user   |
| PUT    | `/api/employees/:id` | Admin, Manager | Update employee          |
| DELETE | `/api/employees/:id` | Admin          | Delete employee          |

**Validation:** Salary must be ≥ $20,000. Password must be ≥ 6 characters.

### Departments — `/api/departments`

| Method | Endpoint                          | Access  | Description                     |
|--------|-----------------------------------|---------|---------------------------------|
| GET    | `/api/departments/public`         | All     | All departments (for dropdowns) |
| GET    | `/api/departments/my`             | Manager | Manager's own department        |
| GET    | `/api/departments`                | Admin   | All departments with details    |
| POST   | `/api/departments`                | Admin   | Create department               |
| POST   | `/api/departments/assign-manager` | Admin   | Assign manager to department    |
| DELETE | `/api/departments/:id/manager`    | Admin   | Remove manager from department  |

### Tasks — `/api/tasks`

| Method | Endpoint             | Access   | Description                          |
|--------|----------------------|----------|--------------------------------------|
| GET    | `/api/tasks`         | Admin    | All tasks (filters + pagination)     |
| POST   | `/api/tasks`         | Manager  | Create and assign task               |
| GET    | `/api/tasks/manager` | Manager  | Tasks created by this manager        |
| GET    | `/api/tasks/my`      | Employee | Tasks assigned to this employee      |
| PUT    | `/api/tasks/:id`     | Employee | Mark task as done (one-way only)     |

**Filters:** `?status=pending|done &assignedTo=<id> &assignedBy=<id> &page=1 &limit=15`

### Attendance — `/api/attendance`

| Method | Endpoint                      | Access   | Description                           |
|--------|-------------------------------|----------|---------------------------------------|
| POST   | `/api/attendance/check-in`    | Employee | Check in for today                    |
| POST   | `/api/attendance/check-out`   | Employee | Check out for today                   |
| GET    | `/api/attendance/my`          | Employee | Own attendance history                |
| GET    | `/api/attendance/team`        | Manager  | Team attendance                       |
| GET    | `/api/attendance`             | Admin    | All attendance (filters + pagination) |
| POST   | `/api/attendance/mark-absent` | Admin    | Bulk mark absent for a date           |

**Status values:** `present` · `absent` · `leave`

### Payroll — `/api/payroll`

| Method | Endpoint                | Access         | Description                          |
|--------|-------------------------|----------------|--------------------------------------|
| POST   | `/api/payroll/generate` | Admin, Manager | Generate payroll for employee + month|
| GET    | `/api/payroll/my`       | Employee       | Own payroll records                  |
| GET    | `/api/payroll/team`     | Manager        | Team payroll records                 |
| GET    | `/api/payroll`          | Admin          | All payroll (filters + pagination)   |

**Calculation:** `deduction = absentDays × $500` · `netSalary = baseSalary - deduction`
Leave days (`status = "leave"`) are **not** counted as absent — no deduction.

### Leaves — `/api/leaves`

| Method | Endpoint          | Access            | Description                          |
|--------|-------------------|-------------------|--------------------------------------|
| POST   | `/api/leaves`     | Employee, Manager | Apply for leave                      |
| GET    | `/api/leaves/my`  | Employee, Manager | Own leave history                    |
| GET    | `/api/leaves/team`| Manager           | Team (employee) leave requests       |
| GET    | `/api/leaves`     | Admin             | All leave requests (filters + pages) |
| PUT    | `/api/leaves/:id` | Manager, Admin    | Approve or reject a leave            |

---

## Business Rules

### Authentication
- No registration UI — admin creates all users through the Employee module
- JWT token expires in 1 day, stored in localStorage
- All API routes except login/register require a valid JWT

### Employees
- Creating an employee automatically creates a linked User account (for login)
- Manager can only create employees (role locked to `employee`)
- **Manager can only create employees in their own department** — enforced server-side
- **Manager can only view and update employees in their own department**
- Admin can create employees or managers in any department
- When admin creates a **manager**, department field is not required — admin assigns department later via Departments page
- When admin creates an **employee**, department is required
- Each employee record stores `createdBy` — manager's Team page shows "Admin" badge on employees added by admin
- Salary must be ≥ $20,000
- Deleting an employee does NOT delete the linked User account

### Departments
- A department can exist without a manager initially
- Only one manager per department — enforced at assignment
- A manager can only be assigned to one department at a time
- Admin is the only one who can create departments and assign managers
- Manager must be assigned to a department before they can add employees or create tasks

### Tasks
- One task is assigned to exactly one employee
- Only managers can create tasks
- **Manager can only assign tasks to employees in their own department**
- Employees can only update the status field — **pending → done only (one-way, cannot revert)**
- Admin has full read visibility but cannot create tasks

### Attendance
- One record per employee per day (unique index enforced)
- Cannot check-in twice in the same day
- Cannot check-out without checking in first
- Cannot check-out twice
- Status auto-set at check-in: any time → `present`
- Approved leave days are marked as `leave` — not counted as absent in payroll
- **Manager can only view attendance of employees in their own department**

### Payroll
- One payroll per employee per month (unique index enforced)
- Base salary is pulled from the Employee record at time of generation
- Only `absent` days are deducted — `leave` days have no deduction
- Deduction rate: $500 per absent day (configurable in `payrollController.js`)
- Employee can only view payroll, not generate it
- **Manager can only generate and view payroll for employees in their own department**

### Leave
- Maximum 5 leave days per month per user (pending + approved combined)
- Overlapping leave requests are rejected
- Admin cannot apply for leave
- Manager cannot approve their own leave
- Manager can only approve employee leaves (not other managers)
- **Manager can only approve leaves from employees in their own department**
- Admin can approve all leaves (employees and managers)
- Approved leave automatically marks attendance as `leave` for each day

---

## Role Permissions

> **Manager scope:** All manager actions are restricted to their own department only.
> A manager cannot see or modify data from other departments.

| Action                              | Admin | Manager        | Employee |
|-------------------------------------|-------|----------------|----------|
| Login                               | ✅    | ✅             | ✅       |
| View own profile                    | ✅    | ✅             | ✅       |
| Create department                   | ✅    | ❌             | ❌       |
| Assign manager to dept              | ✅    | ❌             | ❌       |
| View all employees (all depts)      | ✅    | ❌             | ❌       |
| View employees (own dept only)      | ✅    | ✅ (own dept)  | ❌       |
| Create employee (own dept only)     | ✅    | ✅ (own dept)  | ❌       |
| Create manager                      | ✅    | ❌             | ❌       |
| Update employee (own dept only)     | ✅    | ✅ (own dept)  | ❌       |
| Delete employee                     | ✅    | ❌             | ❌       |
| View all tasks (all depts)          | ✅    | ❌             | ❌       |
| Create task (own dept only)         | ❌    | ✅ (own dept)  | ❌       |
| View own created tasks              | ❌    | ✅             | ❌       |
| View own assigned tasks             | ❌    | ❌             | ✅       |
| Update task status                  | ❌    | ❌             | ✅       |
| Check in / check out                | ❌    | ❌             | ✅       |
| View own attendance                 | ❌    | ❌             | ✅       |
| View team attendance (own dept)     | ❌    | ✅ (own dept)  | ❌       |
| View all attendance (all depts)     | ✅    | ❌             | ❌       |
| Bulk mark absent                    | ✅    | ❌             | ❌       |
| Generate payroll (own dept only)    | ✅    | ✅ (own dept)  | ❌       |
| View own payroll                    | ❌    | ❌             | ✅       |
| View team payroll (own dept)        | ❌    | ✅ (own dept)  | ❌       |
| View all payroll (all depts)        | ✅    | ❌             | ❌       |
| Apply for leave                     | ❌    | ✅             | ✅       |
| View own leave history              | ❌    | ✅             | ✅       |
| Approve employee leaves (own dept)  | ❌    | ✅ (own dept)  | ❌       |
| Approve all leaves                  | ✅    | ❌             | ❌       |
| View all leave requests             | ✅    | ❌             | ❌       |

---

## Frontend Routes

| Path                        | Role     | Page                                      |
|-----------------------------|----------|-------------------------------------------|
| `/login`                    | Public   | Split-panel login, redirects by role      |
| `/admin`                    | Admin    | Dashboard (real employee count)           |
| `/admin/employees`          | Admin    | Employee CRUD + search/filter/sort        |
| `/admin/users`              | Admin    | All system users + role filter            |
| `/admin/departments`        | Admin    | Create dept + assign/remove manager       |
| `/admin/tasks`              | Admin    | All tasks + filters + pagination          |
| `/admin/attendance`         | Admin    | All attendance + filters + pagination     |
| `/admin/payroll`            | Admin    | All payroll + generate form               |
| `/admin/leaves`             | Admin    | All leave requests + approve/reject       |
| `/manager`                  | Manager  | Dashboard                                 |
| `/manager/team`             | Manager  | Team cards + add member                   |
| `/manager/tasks`            | Manager  | Tasks created by manager                  |
| `/manager/tasks/create`     | Manager  | Create + assign task form                 |
| `/manager/attendance`       | Manager  | Team attendance + filters                 |
| `/manager/payroll`          | Manager  | Team payroll + generate form              |
| `/manager/leaves`           | Manager  | Apply own leave + approve team leaves     |
| `/employee`                 | Employee | Overview (real data from API)             |
| `/employee/profile`         | Employee | Full profile + job details                |
| `/employee/tasks`           | Employee | My tasks + status filter + toggle         |
| `/employee/attendance`      | Employee | Check-in/out + today status + history     |
| `/employee/payroll`         | Employee | My payroll records + month filter         |
| `/employee/leaves`          | Employee | Apply leave + view history                |

---

## UI Features

- **Professional Design:** Clean, modern interface with professional SVG icons throughout (no emojis)
- **Light / Dark Theme:** Fully functional theme toggle with proper contrast and visibility in both modes
- **Responsive Layout:** Fully mobile responsive — sidebars become overlay drawers on mobile, tables become card lists
- **Active Tab Visibility:** Fixed light mode visibility issues - active navigation tabs are clearly visible in both themes
- **Loading States:** Loading skeletons on every page while data fetches
- **Empty States:** Friendly messages when no data exists
- **Error Handling:** Error banners with clear inline messages on API failures (no browser `alert()` dialogs)
- **Form Validation:** All forms validate before submitting and show inline errors
- **Button States:** Buttons disabled during API calls to prevent double-submit
- **Real-Time Data:** All dashboards show real data from APIs — no dummy/hardcoded values
- **Smart Permissions:** Manager's "Add Member" button is disabled if they have no department assigned
- **Auto-Fill Forms:** Manager's department is auto-filled and locked when creating employees
- **Visual Badges:** Employee task cards show "Admin" badge when the employee was added by admin
- **One-Way Status:** Task status is one-way: employee can mark pending → done but cannot revert
- **Resilient Loading:** Overview page uses `Promise.allSettled` — partial data loads even if one API fails

---

## Configurable Constants

| Constant                         | File                     | Default  |
|----------------------------------|--------------------------|----------|
| Payroll deduction per absent day | `payrollController.js`   | $500     |
| Max leave days per month         | `leaveController.js`     | 5 days   |
| JWT expiry                       | `authController.js`      | 1 day    |
| Minimum salary                   | `employeeController.js`  | $20,000  |
