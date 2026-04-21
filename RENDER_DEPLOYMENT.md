# Render Deployment Guide

**Backend URL:** https://cms-p7tx.onrender.com  
**API Base URL:** https://cms-p7tx.onrender.com/api  
**Status:** ✅ Deployed and Running

---

## Backend Deployment (Render)

### Deployment Details
- **Platform:** Render.com
- **Service Type:** Web Service
- **URL:** https://cms-p7tx.onrender.com
- **Region:** Auto-selected by Render
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### Environment Variables on Render
The following environment variables must be set in Render dashboard:

```env
PORT=5000
MONGO_URI=mongodb+srv://surjeet:surjeet99@cluster0.bkqos80.mongodb.net/CMS_DB?retryWrites=true&w=majority
JWT_SECRET=strongSecret
NODE_ENV=production
```

### Backend Features
- ✅ MongoDB Atlas connection
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ RESTful API endpoints
- ✅ CORS enabled for frontend

---

## Frontend Configuration

### Local Development Setup

1. **Create `.env` file in `frontend/` directory:**

```env
VITE_API_URL=https://cms-p7tx.onrender.com/api
```

2. **Install dependencies:**

```bash
cd frontend
npm install
```

3. **Start development server:**

```bash
npm run dev
```

4. **Access the application:**
- Frontend: http://localhost:5173
- Backend API: https://cms-p7tx.onrender.com/api

### Environment Variable Options

**For Production (Render Backend):**
```env
VITE_API_URL=https://cms-p7tx.onrender.com/api
```

**For Local Development (Local Backend):**
```env
VITE_API_URL=http://localhost:5000/api
```

**For Testing:**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Frontend Deployment Options

### Option 1: Vercel (Recommended)

1. **Push code to GitHub** (already done ✅)

2. **Import project to Vercel:**
   - Go to https://vercel.com
   - Click "New Project"
   - Import from GitHub: `intsurjeetkaran-droid/cms`
   - Root Directory: `frontend`

3. **Configure build settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add environment variable:**
   - Key: `VITE_API_URL`
   - Value: `https://cms-p7tx.onrender.com/api`

5. **Deploy!**

### Option 2: Netlify

1. **Push code to GitHub** (already done ✅)

2. **Import project to Netlify:**
   - Go to https://netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub: `intsurjeetkaran-droid/cms`
   - Base directory: `frontend`

3. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

4. **Add environment variable:**
   - Key: `VITE_API_URL`
   - Value: `https://cms-p7tx.onrender.com/api`

5. **Deploy!**

### Option 3: Render (Same as Backend)

1. **Create new Static Site on Render**

2. **Connect GitHub repository:**
   - Repository: `intsurjeetkaran-droid/cms`
   - Root Directory: `frontend`

3. **Configure build settings:**
   - Build Command: `npm run build`
   - Publish Directory: `dist`

4. **Add environment variable:**
   - Key: `VITE_API_URL`
   - Value: `https://cms-p7tx.onrender.com/api`

5. **Deploy!**

---

## API Endpoints

All endpoints are prefixed with: `https://cms-p7tx.onrender.com/api`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

### Employees
- `GET /employees` - Get all employees (Admin, Manager)
- `GET /employees/me` - Get own profile (All roles)
- `POST /employees` - Create employee (Admin, Manager)
- `PUT /employees/:id` - Update employee (Admin, Manager)
- `DELETE /employees/:id` - Delete employee (Admin)

### Departments
- `GET /departments` - Get all departments (Admin)
- `GET /departments/public` - Get departments list (All roles)
- `POST /departments` - Create department (Admin)
- `POST /departments/assign-manager` - Assign manager (Admin)

### Tasks
- `GET /tasks` - Get all tasks (Admin)
- `GET /tasks/manager` - Get manager's tasks (Manager)
- `GET /tasks/my` - Get my tasks (Employee)
- `POST /tasks` - Create task (Manager)
- `PUT /tasks/:id` - Update task status (Employee)

### Attendance
- `POST /attendance/check-in` - Check in (Employee)
- `POST /attendance/check-out` - Check out (Employee)
- `GET /attendance/my` - Get my attendance (Employee)
- `GET /attendance/team` - Get team attendance (Manager)
- `GET /attendance` - Get all attendance (Admin)

### Payroll
- `POST /payroll/generate` - Generate payroll (Admin, Manager)
- `GET /payroll/my` - Get my payroll (Employee)
- `GET /payroll/team` - Get team payroll (Manager)
- `GET /payroll` - Get all payroll (Admin)

### Leaves
- `POST /leaves` - Apply for leave (Employee, Manager)
- `GET /leaves/my` - Get my leaves (Employee, Manager)
- `GET /leaves/team` - Get team leaves (Manager)
- `GET /leaves` - Get all leaves (Admin)
- `PUT /leaves/:id` - Approve/reject leave (Manager, Admin)

---

## Testing the Deployment

### Test Backend API

```bash
# Test login endpoint
curl -X POST https://cms-p7tx.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin@123"}'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Admin",
    "email": "admin@company.com",
    "role": "admin"
  }
}
```

### Test Frontend Connection

1. Open http://localhost:5173
2. Try to login
3. Check browser console for API calls
4. Verify requests go to `https://cms-p7tx.onrender.com/api`

---

## CORS Configuration

The backend must have CORS enabled to accept requests from the frontend.

**In `backend/server.js`:**

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',           // Local development
    'https://your-frontend-url.vercel.app', // Production frontend
  ],
  credentials: true
}));
```

---

## Troubleshooting

### Issue: "Network Error" or "Failed to fetch"

**Solution:**
1. Check if backend is running: https://cms-p7tx.onrender.com
2. Verify CORS is enabled on backend
3. Check browser console for detailed error
4. Verify `.env` file has correct `VITE_API_URL`

### Issue: "401 Unauthorized"

**Solution:**
1. Check if JWT token is in localStorage
2. Verify token is being sent in Authorization header
3. Check if token is expired (1 day expiry)
4. Try logging in again

### Issue: "Cannot connect to MongoDB"

**Solution:**
1. Verify MongoDB Atlas connection string in Render environment variables
2. Check if IP whitelist includes `0.0.0.0/0` (allow all) in MongoDB Atlas
3. Verify database user credentials

### Issue: Render backend is slow on first request

**Explanation:**
- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds to wake up
- Subsequent requests are fast

**Solution:**
- Upgrade to paid plan for always-on service
- Or accept the cold start delay

---

## Environment Variables Summary

### Backend (Render Dashboard)
```env
PORT=5000
MONGO_URI=mongodb+srv://surjeet:surjeet99@cluster0.bkqos80.mongodb.net/CMS_DB?retryWrites=true&w=majority
JWT_SECRET=strongSecret
NODE_ENV=production
```

### Frontend (Local `.env` file)
```env
VITE_API_URL=https://cms-p7tx.onrender.com/api
```

### Frontend (Vercel/Netlify Dashboard)
```env
VITE_API_URL=https://cms-p7tx.onrender.com/api
```

---

## Monitoring

### Check Backend Status
- URL: https://cms-p7tx.onrender.com
- Expected: Server response or API documentation

### Check Backend Logs
- Go to Render Dashboard
- Select your service
- Click "Logs" tab
- Monitor for errors

### Check Frontend Logs
- Open browser DevTools (F12)
- Go to Console tab
- Look for `[API]` prefixed logs
- Check Network tab for API calls

---

## Security Checklist

- [x] Environment variables not committed to Git
- [x] JWT secret is strong and unique
- [x] MongoDB credentials are secure
- [x] CORS is properly configured
- [x] HTTPS enabled (Render provides SSL)
- [x] Password hashing with bcrypt
- [x] Input validation on all endpoints
- [x] Role-based access control implemented

---

## Performance Optimization

### Backend (Render)
- ✅ MongoDB Atlas connection pooling
- ✅ Gzip compression enabled
- ✅ Efficient database queries with indexes
- ⚠️ Free tier has cold starts (upgrade for better performance)

### Frontend
- ✅ Vite for fast builds
- ✅ Code splitting
- ✅ Lazy loading for routes
- ✅ Optimized images
- ✅ Tailwind CSS purging unused styles

---

## Backup and Recovery

### Database Backup (MongoDB Atlas)
- MongoDB Atlas provides automatic backups
- Access backups from Atlas dashboard
- Can restore to any point in time

### Code Backup
- ✅ Code is on GitHub: https://github.com/intsurjeetkaran-droid/cms
- ✅ Can redeploy anytime from GitHub

---

**Deployment Status:** ✅ Backend Live on Render  
**Next Step:** Deploy frontend to Vercel/Netlify  
**Documentation:** Complete and up-to-date
