# Implementation Guide - LGA Trucking Management System

## Phase 1: Project Setup & Core Infrastructure

### Step 1: Initialize TypeScript Types
✅ **Status:** COMPLETED
- Created comprehensive type definitions in `src/types/index.ts`
- Covers all modules: Trucks, Fuel, Maintenance, Payroll, Contributions, Compliance, Reports

### Step 2: Setup API Service Layer

**Create:** `src/lib/api.ts`
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Step 3: Setup Query Keys

**Create:** `src/lib/queryKeys.ts`
```typescript
export const queryKeys = {
  trucks: {
    all: ['trucks'] as const,
    detail: (id: number) => ['trucks', id] as const,
  },
  fuelLogs: {
    all: ['fuelLogs'] as const,
    filtered: (filters: any) => ['fuelLogs', filters] as const,
    detail: (id: number) => ['fuelLogs', id] as const,
    stats: (truckId?: number) => ['fuelLogs', 'stats', truckId] as const,
  },
  maintenance: {
    all: ['maintenance'] as const,
    filtered: (filters: any) => ['maintenance', filters] as const,
    detail: (id: number) => ['maintenance', id] as const,
    history: (truckId: number) => ['maintenance', 'history', truckId] as const,
  },
  payroll: {
    all: ['payroll'] as const,
    filtered: (filters: any) => ['payroll', filters] as const,
    detail: (id: number) => ['payroll', id] as const,
    summary: ['payroll', 'summary'] as const,
  },
  contributions: {
    all: ['contributions'] as const,
    filtered: (filters: any) => ['contributions', filters] as const,
    summary: (month: string) => ['contributions', 'summary', month] as const,
  },
  compliance: {
    all: ['compliance'] as const,
    filtered: (filters: any) => ['compliance', filters] as const,
    alerts: ['compliance', 'alerts'] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
  },
  reports: {
    expenses: (filters: any) => ['reports', 'expenses', filters] as const,
    fuel: (filters: any) => ['reports', 'fuel', filters] as const,
    maintenance: (filters: any) => ['reports', 'maintenance', filters] as const,
    payroll: (filters: any) => ['reports', 'payroll', filters] as const,
    contributions: (filters: any) => ['reports', 'contributions', filters] as const,
  },
};
```

---

## Phase 2: Authentication & Layout

### Step 4: Update Authentication Context

**Modify:** `src/contexts/AuthContext.tsx`
- Update to use LGA Trucking branding
- Ensure role-based permissions (admin/encoder)

### Step 5: Update Layout Components

**Modify:** `src/components/layout/Sidebar.tsx`

Update navigation items to reflect trucking modules:
```typescript
const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Trucks', href: '/trucks', icon: Truck },
  { name: 'Fuel Logs', href: '/fuel', icon: Fuel },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'Payroll', href: '/payroll', icon: DollarSign },
  { name: 'Contributions', href: '/contributions', icon: FileText },
  { name: 'Compliance', href: '/compliance', icon: CheckCircle },
  { name: 'Reports', href: '/reports', icon: BarChart },
];
```

**Modify:** `src/components/layout/Header.tsx`
- Update branding to "LGA Trucking"
- Update logo/icon if needed

---

## Phase 3: Module Implementation

### Module 1: Dashboard (Priority: High)

**Create Files:**
- `src/features/dashboard/index.tsx`
- `src/features/dashboard/components/DashboardOverview.tsx`
- `src/features/dashboard/components/StatCard.tsx`
- `src/features/dashboard/components/ExpenseChart.tsx`
- `src/features/dashboard/components/CategoryPieChart.tsx`
- `src/features/dashboard/hooks/useDashboardStats.ts`
- `src/features/dashboard/services/dashboardService.ts`

**Implementation Tasks:**
1. Create dashboard service to fetch stats
2. Create custom hook `useDashboardStats`
3. Create stat cards for key metrics
4. Implement expense trend chart
5. Implement category breakdown chart
6. Add quick action buttons

---

### Module 2: Trucks (Priority: High)

**Create Files:**
- `src/features/trucks/index.tsx`
- `src/features/trucks/components/TruckList.tsx`
- `src/features/trucks/components/TruckCard.tsx`
- `src/features/trucks/components/TruckForm.tsx`
- `src/features/trucks/components/TruckDetailsView.tsx`
- `src/features/trucks/hooks/useTrucks.ts`
- `src/features/trucks/services/truckService.ts`

**Implementation Tasks:**
1. Create truck service (CRUD operations)
2. Create truck list with filters
3. Create truck form with validation
4. Implement truck details view
5. Add status badges (active/inactive/maintenance)
6. Implement delete functionality (admin only)

---

### Module 3: Fuel (Priority: High)

**Create Files:**
- `src/features/fuel/index.tsx`
- `src/features/fuel/components/FuelLogList.tsx`
- `src/features/fuel/components/FuelLogForm.tsx`
- `src/features/fuel/components/FuelLogCard.tsx`
- `src/features/fuel/components/FuelEfficiencyChart.tsx`
- `src/features/fuel/components/TruckFuelSummary.tsx`
- `src/features/fuel/hooks/useFuelLogs.ts`
- `src/features/fuel/hooks/useFuelStats.ts`
- `src/features/fuel/services/fuelService.ts`
- `src/features/fuel/utils/fuelCalculations.ts`

**Implementation Tasks:**
1. Create fuel service (CRUD + stats)
2. Create fuel log form with auto-calculations
3. Calculate distance traveled from odometer
4. Calculate fuel efficiency (km/L)
5. Implement fuel cost per km
6. Create efficiency chart
7. Add truck filter
8. Create monthly summary

**Fuel Calculations:**
```typescript
// src/features/fuel/utils/fuelCalculations.ts
export const calculateDistance = (
  currentOdometer: number,
  previousOdometer: number
): number => {
  return currentOdometer - previousOdometer;
};

export const calculateFuelEfficiency = (
  distance: number,
  fuelQuantity: number
): number => {
  return fuelQuantity > 0 ? distance / fuelQuantity : 0;
};

export const calculateCostPerKm = (
  totalCost: number,
  distance: number
): number => {
  return distance > 0 ? totalCost / distance : 0;
};
```

---

### Module 4: Maintenance (Priority: High)

**Create Files:**
- `src/features/maintenance/index.tsx`
- `src/features/maintenance/components/MaintenanceList.tsx`
- `src/features/maintenance/components/MaintenanceForm.tsx`
- `src/features/maintenance/components/MaintenanceCard.tsx`
- `src/features/maintenance/components/MaintenanceHistory.tsx`
- `src/features/maintenance/components/MaintenanceCostChart.tsx`
- `src/features/maintenance/hooks/useMaintenance.ts`
- `src/features/maintenance/services/maintenanceService.ts`

**Implementation Tasks:**
1. Create maintenance service
2. Create maintenance form with type/category selection
3. Auto-calculate total cost (labor + parts)
4. Implement truck history view
5. Create cost breakdown chart
6. Add filters (type, category, date range)
7. Implement scheduled maintenance reminders

---

### Module 5: Payroll (Priority: Medium)

**Create Files:**
- `src/features/payroll/index.tsx`
- `src/features/payroll/components/PayrollList.tsx`
- `src/features/payroll/components/PayrollForm.tsx`
- `src/features/payroll/components/PayrollCard.tsx`
- `src/features/payroll/components/PayrollApprovalDialog.tsx`
- `src/features/payroll/components/PayrollPaymentDialog.tsx`
- `src/features/payroll/components/PayslipView.tsx`
- `src/features/payroll/hooks/usePayroll.ts`
- `src/features/payroll/services/payrollService.ts`
- `src/features/payroll/utils/payrollCalculations.ts`

**Implementation Tasks:**
1. Create employee master list (if not exists)
2. Create payroll service with approval workflow
3. Create payroll form with auto-calculations
4. Calculate overtime pay
5. Calculate gross pay
6. Calculate government deductions (SSS, Pag-IBIG, PhilHealth)
7. Calculate net pay
8. Implement approval workflow (Encoder → Admin approval)
9. Implement payment marking (Admin only)
10. Create payslip view/print
11. Add status badges (pending/approved/paid)

**Payroll Calculations:**
```typescript
// src/features/payroll/utils/payrollCalculations.ts

export const calculateOvertimePay = (
  hourlyRate: number,
  overtimeHours: number,
  overtimeMultiplier: number = 1.25
): number => {
  return hourlyRate * overtimeHours * overtimeMultiplier;
};

export const calculateGrossPay = (
  basicPay: number,
  overtimePay: number,
  allowances: number
): number => {
  return basicPay + overtimePay + allowances;
};

// SSS Contribution (2026 rates)
export const calculateSSS = (monthlySalary: number): {
  employee: number;
  employer: number;
  total: number;
} => {
  const salaryCredit = Math.min(monthlySalary, 30000);
  const employee = salaryCredit * 0.045; // 4.5%
  const employer = salaryCredit * 0.095; // 9.5%
  return {
    employee: Math.round(employee * 100) / 100,
    employer: Math.round(employer * 100) / 100,
    total: Math.round((employee + employer) * 100) / 100,
  };
};

// Pag-IBIG Contribution
export const calculatePagIBIG = (monthlySalary: number): {
  employee: number;
  employer: number;
  total: number;
} => {
  const employee = Math.min(monthlySalary * 0.02, 100);
  const employer = Math.min(monthlySalary * 0.02, 100);
  return {
    employee: Math.round(employee * 100) / 100,
    employer: Math.round(employer * 100) / 100,
    total: Math.round((employee + employer) * 100) / 100,
  };
};

// PhilHealth Contribution
export const calculatePhilHealth = (monthlySalary: number): {
  employee: number;
  employer: number;
  total: number;
} => {
  const totalPremium = Math.min(monthlySalary * 0.05, 5000);
  const employee = totalPremium / 2;
  const employer = totalPremium / 2;
  return {
    employee: Math.round(employee * 100) / 100,
    employer: Math.round(employer * 100) / 100,
    total: Math.round(totalPremium * 100) / 100,
  };
};

export const calculateTotalDeductions = (
  sss: number,
  pagibig: number,
  philhealth: number,
  loans: number,
  otherDeductions: number
): number => {
  return sss + pagibig + philhealth + loans + otherDeductions;
};

export const calculateNetPay = (
  grossPay: number,
  totalDeductions: number
): number => {
  return grossPay - totalDeductions;
};
```

---

### Module 6: Government Contributions (Priority: Medium)

**Create Files:**
- `src/features/contributions/index.tsx`
- `src/features/contributions/components/ContributionsList.tsx`
- `src/features/contributions/components/ContributionCard.tsx`
- `src/features/contributions/components/ContributionSummary.tsx`
- `src/features/contributions/components/RemittanceDialog.tsx`
- `src/features/contributions/components/ContributionBreakdownChart.tsx`
- `src/features/contributions/hooks/useContributions.ts`
- `src/features/contributions/services/contributionService.ts`

**Implementation Tasks:**
1. Auto-generate contributions from approved payroll
2. Create monthly summary view
3. Separate by type (SSS, Pag-IBIG, PhilHealth)
4. Show employee vs employer share
5. Implement remittance marking (Admin only)
6. Add reference number input
7. Create breakdown chart
8. Show remittance status

---

### Module 7: Compliance (Priority: Medium)

**Create Files:**
- `src/features/compliance/index.tsx`
- `src/features/compliance/components/ComplianceList.tsx`
- `src/features/compliance/components/ComplianceForm.tsx`
- `src/features/compliance/components/ComplianceCard.tsx`
- `src/features/compliance/components/ComplianceAlerts.tsx`
- `src/features/compliance/components/ComplianceCalendar.tsx`
- `src/features/compliance/hooks/useCompliance.ts`
- `src/features/compliance/services/complianceService.ts`
- `src/features/compliance/utils/complianceCalculations.ts`

**Implementation Tasks:**
1. Create compliance tracking form
2. Track registration expiry
3. Track insurance expiry
4. Track emission test expiry
5. Calculate days remaining
6. Implement alert system (30 days, 7 days, expired)
7. Color-coded status badges
8. Create calendar view for expiries
9. Send notifications/reminders

**Compliance Calculations:**
```typescript
// src/features/compliance/utils/complianceCalculations.ts

export const calculateDaysRemaining = (expiryDate: string): number => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getComplianceStatus = (expiryDate: string): ComplianceStatus => {
  const daysRemaining = calculateDaysRemaining(expiryDate);
  
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= 30) return 'expiring_soon';
  return 'active';
};

export const getAlertSeverity = (daysRemaining: number): AlertSeverity => {
  if (daysRemaining < 0) return 'critical';
  if (daysRemaining <= 7) return 'critical';
  if (daysRemaining <= 30) return 'warning';
  return 'info';
};
```

---

### Module 8: Reports (Priority: Low)

**Create Files:**
- `src/features/reports/index.tsx`
- `src/features/reports/components/ReportsDashboard.tsx`
- `src/features/reports/components/MonthlyExpenseReport.tsx`
- `src/features/reports/components/FuelEfficiencyReport.tsx`
- `src/features/reports/components/MaintenanceReport.tsx`
- `src/features/reports/components/PayrollReport.tsx`
- `src/features/reports/components/ContributionReport.tsx`
- `src/features/reports/components/ComplianceReport.tsx`
- `src/features/reports/components/ReportFilters.tsx`
- `src/features/reports/components/ReportExport.tsx`
- `src/features/reports/hooks/useReports.ts`
- `src/features/reports/services/reportService.ts`

**Implementation Tasks:**
1. Create report selection dashboard
2. Implement date range filters
3. Create expense report with charts
4. Create fuel efficiency report
5. Create maintenance cost report
6. Create payroll summary report
7. Create contribution report
8. Create compliance status report
9. Implement PDF export
10. Implement Excel export

---

## Phase 4: Route Configuration

### Update Routes

**Modify:** `src/routes/index.tsx`

```typescript
import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/features/dashboard';
import TruckList from '@/features/trucks';
import FuelLogList from '@/features/fuel';
import MaintenanceList from '@/features/maintenance';
import PayrollList from '@/features/payroll';
import ContributionsList from '@/features/contributions';
import ComplianceList from '@/features/compliance';
import ReportsDashboard from '@/features/reports';
import Login from '@/features/auth/Login';
import NotFound from '@/components/common/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/trucks', element: <TruckList /> },
      { path: '/fuel', element: <FuelLogList /> },
      { path: '/maintenance', element: <MaintenanceList /> },
      { path: '/payroll', element: <PayrollList /> },
      { path: '/contributions', element: <ContributionsList /> },
      { path: '/compliance', element: <ComplianceList /> },
      { path: '/reports', element: <ReportsDashboard /> },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '*', element: <NotFound /> },
]);
```

---

## Phase 5: Permission System

### Create Permission Hook

**Create:** `src/hooks/usePermissions.ts`

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ModulePermissions {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canApprove?: boolean;
}

const rolePermissions: Record<UserRole, Record<string, ModulePermissions>> = {
  admin: {
    trucks: { canCreate: true, canRead: true, canUpdate: true, canDelete: true },
    fuel: { canCreate: true, canRead: true, canUpdate: true, canDelete: true },
    maintenance: { canCreate: true, canRead: true, canUpdate: true, canDelete: true },
    payroll: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: true },
    contributions: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canApprove: true },
    compliance: { canCreate: true, canRead: true, canUpdate: true, canDelete: true },
    reports: { canCreate: false, canRead: true, canUpdate: false, canDelete: false },
  },
  encoder: {
    trucks: { canCreate: true, canRead: true, canUpdate: true, canDelete: false },
    fuel: { canCreate: true, canRead: true, canUpdate: true, canDelete: false },
    maintenance: { canCreate: true, canRead: true, canUpdate: true, canDelete: false },
    payroll: { canCreate: true, canRead: true, canUpdate: true, canDelete: false, canApprove: false },
    contributions: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canApprove: false },
    compliance: { canCreate: true, canRead: true, canUpdate: true, canDelete: false },
    reports: { canCreate: false, canRead: true, canUpdate: false, canDelete: false },
  },
};

export const usePermissions = (module: string) => {
  const { user } = useAuth();
  
  if (!user) {
    return {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false,
      canApprove: false,
    };
  }
  
  return rolePermissions[user.role][module] || {
    canCreate: false,
    canRead: false,
    canUpdate: false,
    canDelete: false,
    canApprove: false,
  };
};
```

---

## Phase 6: Testing & Refinement

### Testing Checklist

**Functional Testing:**
- [ ] Dashboard displays correct stats
- [ ] Truck CRUD operations work
- [ ] Fuel log calculations are accurate
- [ ] Maintenance records save correctly
- [ ] Payroll calculations are correct
- [ ] Government contributions auto-generate
- [ ] Compliance alerts trigger properly
- [ ] Reports generate correctly
- [ ] PDF/Excel export works

**Permission Testing:**
- [ ] Admin can perform all actions
- [ ] Encoder cannot approve payroll
- [ ] Encoder cannot delete records
- [ ] Encoder cannot mark contributions as remitted
- [ ] Role-based UI elements show/hide correctly

**UX Testing:**
- [ ] Loading states display properly
- [ ] Error messages are clear
- [ ] Success feedback shows
- [ ] Forms validate correctly
- [ ] Responsive design works on mobile
- [ ] Dark mode functions properly

---

## Environment Variables

**Create:** `.env.development`

```env
VITE_APP_NAME=LGA Trucking Management System
VITE_API_URL=http://localhost:8000/api
VITE_API_TIMEOUT=30000
```

---

## Deployment Checklist

- [ ] Update production API URL
- [ ] Configure CORS on backend
- [ ] Setup environment variables
- [ ] Build production bundle
- [ ] Test on production environment
- [ ] Setup SSL certificate
- [ ] Configure domain
- [ ] Setup monitoring
- [ ] Create backups
- [ ] Write deployment documentation

---

## Next Steps

1. **Start with Phase 1** - Setup API and query infrastructure
2. **Implement Authentication** - Ensure role-based access works
3. **Build Core Modules** - Start with Dashboard, Trucks, and Fuel
4. **Add Business Logic** - Implement calculations and validations
5. **Create Reports** - Build comprehensive reporting
6. **Test Thoroughly** - Test all user roles and permissions
7. **Deploy** - Deploy to production environment

---

## Development Tips

### Best Practices
- Use TypeScript strictly (no `any` types)
- Keep components small and focused
- Use custom hooks for reusable logic
- Implement proper error handling
- Add loading states everywhere
- Use optimistic updates for better UX
- Cache data with React Query
- Validate all user inputs
- Handle edge cases
- Write clear comments for complex logic

### Performance Optimization
- Lazy load routes
- Virtualize long lists
- Memoize expensive calculations
- Debounce search inputs
- Optimize images
- Code split by route
- Cache API responses

### Security
- Validate all inputs (client & server)
- Sanitize data before display
- Use HTTPS only
- Implement CSRF protection
- Secure API endpoints
- Use JWT securely
- Hash sensitive data
- Implement rate limiting
