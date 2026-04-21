# Fix 404 on Refresh - Render Configuration

## Problem
When you refresh the page on any route (e.g., `/admin/employees`), you get a 404 error.

## Why This Happens
Render serves static files directly. When you navigate to `/admin/employees`, Render looks for a file at that path, which doesn't exist. The app needs to serve `index.html` for all routes and let React Router handle the routing.

## Solution

### Option 1: Using Render Dashboard (Recommended)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Select your frontend service: `cms-frontend`

2. **Add Rewrite Rule**
   - Go to "Redirects/Rewrites" section
   - Click "Add Rule"
   - Set:
     - **Source:** `/*`
     - **Destination:** `/index.html`
     - **Type:** `Rewrite`
     - **Status:** `200`
   - Click "Save"

3. **Redeploy**
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait for deployment to complete (2-3 minutes)

4. **Test**
   - Visit: https://cms-frontend-zln9.onrender.com/admin
   - Refresh the page
   - Should work without 404

### Option 2: Using render.yaml (Automatic)

The `render.yaml` file in the frontend directory already has the rewrite rule:

```yaml
routes:
  - type: rewrite
    source: /*
    destination: /index.html
```

**To apply this:**

1. **Delete the existing service** on Render (if needed)
2. **Create new Static Site** from the same GitHub repo
3. **Set Root Directory:** `frontend`
4. **Build Command:** `npm install && npm run build`
5. **Publish Directory:** `dist`
6. Render will automatically read `render.yaml` and apply the rewrite rule

### Option 3: Using _redirects File (Already Added)

The `frontend/public/_redirects` file is already created:

```
/*    /index.html   200
```

This file is automatically copied to the `dist` folder during build.

**If this doesn't work:**
- Render might not be reading the `_redirects` file
- Use Option 1 (Dashboard) instead

## Verification

After applying the fix, test these URLs:

1. https://cms-frontend-zln9.onrender.com/admin
2. https://cms-frontend-zln9.onrender.com/manager
3. https://cms-frontend-zln9.onrender.com/employee
4. https://cms-frontend-zln9.onrender.com/login

All should work and show the correct page (not 404).

## Files Added

- ✅ `frontend/public/_redirects` - Netlify/Render redirect rules
- ✅ `frontend/public/_headers` - Security headers
- ✅ `frontend/render.yaml` - Render-specific configuration
- ✅ `frontend/vercel.json` - Vercel configuration
- ✅ `frontend/netlify.toml` - Netlify configuration

## Current Status

- **_redirects file:** ✅ Created and in dist folder
- **render.yaml:** ✅ Created with rewrite rules
- **Build:** ✅ Working correctly
- **Render Dashboard:** ⚠️ Needs manual configuration

## Next Steps

1. Go to Render Dashboard
2. Add the rewrite rule manually (Option 1)
3. Redeploy the service
4. Test all routes

## Alternative: Check Current Render Settings

If you want to check current settings:

1. Go to Render Dashboard
2. Select `cms-frontend` service
3. Check "Redirects/Rewrites" section
4. If empty, add the rule as described in Option 1

## Support

If the issue persists:
- Check Render logs for errors
- Verify the build output includes `_redirects` file
- Contact Render support with this configuration

---

**Last Updated:** April 21, 2026
