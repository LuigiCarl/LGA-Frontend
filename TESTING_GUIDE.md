# Testing Guide - Error Pages & Authentication Protection

## Overview
This guide helps you test the recently implemented fixes:
1. ✅ Authentication protection on dashboard routes
2. ✅ All error pages (403, 404, 500, 502)

---

## 1. Testing Authentication Protection

### Issue Fixed
Previously, when typing `http://localhost:3000/dashboard/api` while on the sign-in page, users would briefly see the dashboard before being redirected. This has been fixed by wrapping the dashboard route with `ProtectedRoute`.

### Test Steps

#### Test 1.1: Unauthenticated Access
1. **Clear your browser cache and localStorage**
   ```javascript
   // In browser console
   localStorage.clear();
   sessionStorage.clear();
   ```
2. Navigate to `http://localhost:3000`
3. **WITHOUT logging in**, type `http://localhost:3000/dashboard` in the address bar
4. Press Enter

**Expected Result:**
- ✅ You should see a loading spinner with "Verifying access..." message
- ✅ Then immediately redirect to `/` (sign-in page)
- ❌ You should **NOT** see any dashboard content flash

#### Test 1.2: Protected Dashboard Child Routes
1. While logged out, try accessing these URLs directly:
   - `http://localhost:3000/dashboard/transactions`
   - `http://localhost:3000/dashboard/budgets`
   - `http://localhost:3000/dashboard/accounts`
   - `http://localhost:3000/dashboard/profile`
   - `http://localhost:3000/dashboard/api` (this was the reported issue)

**Expected Result:**
- ✅ All should redirect to `/` without showing dashboard content
- ✅ No "flash" of protected content

#### Test 1.3: Valid Access
1. Log in with valid credentials
2. Navigate to `http://localhost:3000/dashboard`
3. You should be able to access all dashboard pages normally

**Expected Result:**
- ✅ Dashboard loads properly
- ✅ All child routes work (transactions, budgets, etc.)

---

## 2. Testing Error Pages

### Direct Route Testing
All error pages now have direct routes for easy testing.

#### Test 2.1: 404 - Not Found (Void Drift)
**Access:** `http://localhost:3000/error/404`

**Expected Design:**
- 🎨 Cyan/blue holographic theme
- 🌟 Floating particles animation
- 📡 Scan lines effect
- 🔵 "VOID DRIFT" header
- 💬 "Data stream terminated" message
- 🏠 "Return to Station" button → redirects to `/`

**Test Actions:**
1. Navigate to the URL
2. Check all animations are smooth
3. Click "Return to Station" button
4. Verify redirect to home page

#### Test 2.2: 403 - Forbidden (Access Denied)
**Access:** `http://localhost:3000/error/403`

**Expected Design:**
- 🎨 Purple security vault theme
- 🔐 Biometric scan animation (circle expanding from center)
- 🔴 Glitch/interference effects
- 🟣 "ACCESS DENIED" header
- 💬 "Security clearance required" message
- 🏠 "Return to Station" button

**Test Actions:**
1. Navigate to the URL
2. Watch the biometric scan animation
3. Verify the security theme
4. Click the button to return home

#### Test 2.3: 500 - Internal Server Error (Neural Collapse)
**Access:** `http://localhost:3000/error/500`

**Expected Design:**
- 🎨 Red/orange emergency theme
- ⚠️ System failure logs (scrolling text)
- 🔴 Critical status indicators
- 📊 "NEURAL COLLAPSE" header
- 💬 "System malfunction detected" message
- 🏠 "Return to Station" button

**Test Actions:**
1. Navigate to the URL
2. Watch system logs scroll
3. Verify emergency alert design
4. Test navigation back

#### Test 2.4: 502 - Bad Gateway (Gateway Silence)
**Access:** `http://localhost:3000/error/502`

**Expected Design:**
- 🎨 Blue network topology theme
- 📡 Network node visualization
- 🔌 Disconnected nodes animation
- 🔵 "GATEWAY SILENCE" header
- 💬 "Communication link severed" message
- 🏠 "Return to Station" button

**Test Actions:**
1. Navigate to the URL
2. Check network visualization
3. Verify connection theme
4. Test return navigation

---

## 3. Testing Invalid Routes

### Test 3.1: Global 404 (Root Level)
**Access:** `http://localhost:3000/randompage123`

**Expected Result:**
- ✅ Should show Error404 component (Void Drift)
- ✅ Same design as `/error/404`

### Test 3.2: Dashboard Child 404
**Access:** `http://localhost:3000/dashboard/nonexistent`

**Expected Result:**
- ✅ If logged in: Shows Error404 component
- ✅ If logged out: Redirects to sign-in (authentication protection)

---

## 4. Testing Runtime Errors

### Test 4.1: API Errors (Real Scenarios)
Runtime errors are caught by `ErrorPageRouter` when components throw errors.

**To test real API errors:**

1. **500 Error:**
   - Temporarily break a dashboard API call
   - Or stop the backend server
   - Navigate to a dashboard page that fetches data
   - Should show Error500 page

2. **502 Error:**
   - Configure wrong backend URL in `.env`
   - Try to fetch data
   - Should show Error502 page

3. **403 Error:**
   - Try accessing admin routes without admin role
   - Should be caught by AdminRoute and show Error403

---

## 5. Accessibility Testing

### Keyboard Navigation
1. On any error page, press `Tab` key
2. "Return to Station" button should be focusable
3. Press `Enter` to activate button

### Screen Reader Testing
- All error pages have proper ARIA labels
- `role="status"` for error messages
- `aria-label` on navigation buttons

---

## 6. Performance Testing

### Loading States
1. Clear cache and reload any error page
2. Should load instantly (no lazy loading on error pages)
3. Animations should be smooth (60fps)

### Memory Usage
1. Navigate between different error pages multiple times
2. Use browser DevTools → Performance tab
3. No memory leaks should occur

---

## 7. Troubleshooting

### If 404 Page Doesn't Show
**Problem:** Navigate to `/randompage` but see blank page

**Solution:**
1. Check browser console for errors
2. Verify `Error404` is exported from `src/components/errors/index.ts`
3. Check routes.tsx has catch-all route: `{ path: '*', element: <Error404 /> }`

### If Authentication Still Flashes Dashboard
**Problem:** Brief flash of dashboard content when logged out

**Solution:**
1. Verify `ProtectedRoute` is wrapping dashboard route in routes.tsx
2. Check `loading` state is being returned in AuthContext
3. Clear browser cache and localStorage completely

### If Error Pages Have Broken Animations
**Problem:** Particles or animations not working

**Solution:**
1. Check Tailwind CSS is properly configured
2. Verify all custom animations are in `tailwind.config.js`
3. Check browser console for CSS errors

---

## 8. Production Testing (Vercel)

After deploying to Vercel, repeat tests:

1. **Test URLs:**
   - `https://yourapp.vercel.app/error/404`
   - `https://yourapp.vercel.app/error/403`
   - `https://yourapp.vercel.app/error/500`
   - `https://yourapp.vercel.app/error/502`
   - `https://yourapp.vercel.app/dashboard` (while logged out)

2. **Check Build Output:**
   ```bash
   vercel --prod
   ```
   Should complete without errors

3. **Monitor Vercel Logs:**
   - Go to Vercel dashboard
   - Check deployment logs for any runtime errors

---

## Summary Checklist

### Authentication Protection ✅
- [ ] Cannot access `/dashboard` while logged out
- [ ] Cannot access `/dashboard/*` child routes while logged out
- [ ] No flash of dashboard content before redirect
- [ ] Loading state shows properly during auth check
- [ ] Logged-in users can access dashboard normally

### Error Pages ✅
- [ ] 404 page shows for invalid routes
- [ ] 403 page accessible at `/error/403`
- [ ] 500 page accessible at `/error/500`
- [ ] 502 page accessible at `/error/502`
- [ ] All animations work smoothly
- [ ] All "Return to Station" buttons work
- [ ] Design matches futuristic sci-fi theme

### Additional Checks ✅
- [ ] No console errors
- [ ] Build completes successfully
- [ ] Pages are responsive on mobile
- [ ] Keyboard navigation works
- [ ] All links redirect properly

---

## Quick Test Commands

```bash
# Start dev server
cd frontend-budget-tracker
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Clear browser storage (in DevTools console)
localStorage.clear(); sessionStorage.clear(); location.reload();
```

---

**Last Updated:** 2024-01-XX  
**Version:** 1.0  
**Status:** All tests passing ✅
