# Module Structure Guide

## Frontend Architecture

### Directory Structure

```
src/
├── assets/              # Static assets (images, fonts)
├── components/          # Shared/reusable components
│   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   ├── layout/         # Layout components (Header, Sidebar, Footer)
│   └── common/         # Common components (LoadingSpinner, ErrorBoundary)
├── features/           # Feature-based modules
│   ├── dashboard/
│   ├── fuel/
│   ├── maintenance/
│   ├── payroll/
│   ├── contributions/
│   ├── compliance/
│   ├── trucks/
│   └── reports/
├── lib/                # Utility functions and helpers
├── hooks/              # Custom React hooks
├── services/           # API services
├── types/              # TypeScript type definitions
├── contexts/           # React Context providers
├── routes/             # Route definitions
└── App.tsx             # Main application component
```

---

## Feature Module Structure

Each feature module follows this structure:

```
features/[module-name]/
├── components/         # Module-specific components
├── hooks/             # Module-specific hooks
├── services/          # API calls for this module
├── types/             # TypeScript types
├── utils/             # Helper functions
└── index.tsx          # Main module component
```

### Example: Fuel Module

```
features/fuel/
├── components/
│   ├── FuelLogForm.tsx
│   ├── FuelLogList.tsx
│   ├── FuelLogCard.tsx
│   ├── FuelEfficiencyChart.tsx
│   └── TruckFuelSummary.tsx
├── hooks/
│   ├── useFuelLogs.ts
│   ├── useFuelStats.ts
│   └── useFuelEfficiency.ts
├── services/
│   └── fuelService.ts
├── types/
│   └── fuel.types.ts
├── utils/
│   └── fuelCalculations.ts
└── index.tsx
```

---

## Module Details

### 1. Dashboard Module

**Location:** `src/features/dashboard/`

**Components:**
- `DashboardOverview.tsx` - Main dashboard container
- `ExpenseSummaryCard.tsx` - Monthly expense summary
- `FuelSummaryCard.tsx` - Fuel cost summary
- `MaintenanceSummaryCard.tsx` - Maintenance cost summary
- `PayrollSummaryCard.tsx` - Pending payroll
- `ContributionSummaryCard.tsx` - Pending contributions
- `ComplianceStatusCard.tsx` - Truck compliance overview
- `MonthlyExpensesChart.tsx` - Expense trend chart
- `CategoryBreakdownChart.tsx` - Expense by category

**Data Fetched:**
- Monthly expense totals
- Fuel costs (current month)
- Maintenance costs (current month)
- Payroll pending approval
- Contributions pending remittance
- Truck compliance status counts

---

### 2. Trucks Module

**Location:** `src/features/trucks/`

**Components:**
- `TruckList.tsx` - List all trucks
- `TruckCard.tsx` - Truck details card
- `TruckForm.tsx` - Add/edit truck form
- `TruckDetailsView.tsx` - Detailed truck view

**CRUD Operations:**
- Create new truck
- Read truck list and details
- Update truck information
- Delete truck (Admin only)

**API Endpoints:**
```
GET    /api/trucks
GET    /api/trucks/:id
POST   /api/trucks
PUT    /api/trucks/:id
DELETE /api/trucks/:id
```

**Type Definition (fuel.types.ts):**
```typescript
export interface Truck {
  id: number;
  plate_number: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
}
```

---

### 3. Fuel Module

**Location:** `src/features/fuel/`

**Components:**
- `FuelLogList.tsx` - List all fuel logs
- `FuelLogForm.tsx` - Add fuel log form
- `FuelLogCard.tsx` - Individual fuel log card
- `FuelEfficiencyChart.tsx` - Fuel efficiency trends
- `TruckFuelSummary.tsx` - Fuel summary by truck
- `FuelFilters.tsx` - Filter by truck, date range

**CRUD Operations:**
- Create fuel log
- Read fuel logs (with filters)
- Update fuel log
- Delete fuel log (Admin only)

**API Endpoints:**
```
GET    /api/fuel-logs?truck_id=&month=&year=
GET    /api/fuel-logs/:id
POST   /api/fuel-logs
PUT    /api/fuel-logs/:id
DELETE /api/fuel-logs/:id
GET    /api/fuel-stats/efficiency?truck_id=
```

**Type Definition (fuel.types.ts):**
```typescript
export interface FuelLog {
  id: number;
  truck_id: number;
  date: string;
  fuel_quantity: number; // liters
  cost_per_liter: number;
  total_cost: number;
  odometer_reading: number;
  location: string;
  receipt_number: string;
  distance_traveled?: number;
  fuel_efficiency?: number; // km per liter
  created_by: number;
  created_at: string;
  updated_at: string;
  truck?: Truck;
}

export interface FuelStats {
  total_cost: number;
  total_liters: number;
  average_efficiency: number;
  total_distance: number;
  cost_per_km: number;
}
```

---

### 4. Maintenance Module

**Location:** `src/features/maintenance/`

**Components:**
- `MaintenanceList.tsx` - List all maintenance records
- `MaintenanceForm.tsx` - Add/edit maintenance form
- `MaintenanceCard.tsx` - Maintenance record card
- `MaintenanceHistory.tsx` - Truck maintenance history
- `MaintenanceCostChart.tsx` - Monthly cost chart
- `MaintenanceFilters.tsx` - Filter by truck, type, date

**CRUD Operations:**
- Create maintenance record
- Read maintenance records (with filters)
- Update maintenance record
- Delete maintenance record (Admin only)

**API Endpoints:**
```
GET    /api/maintenance?truck_id=&type=&month=&year=
GET    /api/maintenance/:id
POST   /api/maintenance
PUT    /api/maintenance/:id
DELETE /api/maintenance/:id
GET    /api/maintenance/history/:truck_id
```

**Type Definition (maintenance.types.ts):**
```typescript
export type MaintenanceType = 'preventive' | 'repair';
export type MaintenanceCategory = 'engine' | 'brakes' | 'tires' | 'electrical' | 'body' | 'other';

export interface MaintenanceRecord {
  id: number;
  truck_id: number;
  date: string;
  type: MaintenanceType;
  category: MaintenanceCategory;
  description: string;
  service_provider: string;
  parts_used?: string;
  labor_cost: number;
  parts_cost: number;
  total_cost: number;
  next_maintenance_date?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  truck?: Truck;
}
```

---

### 5. Payroll Module

**Location:** `src/features/payroll/`

**Components:**
- `PayrollList.tsx` - List all payroll records
- `PayrollForm.tsx` - Create payroll form
- `PayrollCard.tsx` - Individual payroll card
- `PayrollApprovalDialog.tsx` - Approve payroll dialog (Admin)
- `PayrollPaymentDialog.tsx` - Mark as paid dialog (Admin)
- `PayslipView.tsx` - View/print payslip
- `PayrollFilters.tsx` - Filter by status, employee, date

**CRUD Operations:**
- Create payroll entry (Encoder)
- Read payroll records (with filters)
- Update payroll entry (Encoder, if pending)
- Approve payroll (Admin only)
- Mark as paid (Admin only)

**Workflow States:**
```
Pending → Approved → Paid
```

**API Endpoints:**
```
GET    /api/payroll?status=&employee_id=&week_start=
GET    /api/payroll/:id
POST   /api/payroll
PUT    /api/payroll/:id
POST   /api/payroll/:id/approve (Admin only)
POST   /api/payroll/:id/mark-paid (Admin only)
GET    /api/payroll/:id/payslip
```

**Type Definition (payroll.types.ts):**
```typescript
export type PayrollStatus = 'pending' | 'approved' | 'paid';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'check';

export interface PayrollEntry {
  id: number;
  employee_id: number;
  employee_name: string;
  week_start: string;
  week_end: string;
  basic_pay: number;
  overtime_hours: number;
  overtime_pay: number;
  meal_allowance: number;
  transportation_allowance: number;
  other_allowances: number;
  gross_pay: number;
  sss_employee: number;
  pagibig_employee: number;
  philhealth_employee: number;
  loans: number;
  other_deductions: number;
  total_deductions: number;
  net_pay: number;
  status: PayrollStatus;
  payment_date?: string;
  payment_method?: PaymentMethod;
  approved_by?: number;
  approved_at?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}
```

---

### 6. Government Contributions Module

**Location:** `src/features/contributions/`

**Components:**
- `ContributionsList.tsx` - List all contributions
- `ContributionCard.tsx` - Individual contribution card
- `ContributionSummary.tsx` - Monthly summary
- `RemittanceDialog.tsx` - Mark as remitted (Admin)
- `ContributionBreakdownChart.tsx` - Visual breakdown
- `ContributionFilters.tsx` - Filter by type, month, status

**CRUD Operations:**
- Auto-generated from payroll
- Read contribution records
- Mark as remitted (Admin only)
- Update remittance details

**API Endpoints:**
```
GET    /api/contributions?type=&month=&year=&status=
GET    /api/contributions/:id
POST   /api/contributions/:id/remit (Admin only)
GET    /api/contributions/summary?month=&year=
```

**Type Definition (contributions.types.ts):**
```typescript
export type ContributionType = 'sss' | 'pagibig' | 'philhealth';
export type ContributionStatus = 'pending' | 'remitted';

export interface Contribution {
  id: number;
  employee_id: number;
  employee_name: string;
  month: string; // YYYY-MM
  type: ContributionType;
  monthly_compensation: number;
  employee_share: number;
  employer_share: number;
  total_contribution: number;
  status: ContributionStatus;
  remittance_date?: string;
  reference_number?: string;
  remitted_by?: number;
  created_at: string;
  updated_at: string;
}

export interface ContributionSummary {
  month: string;
  sss_total: number;
  pagibig_total: number;
  philhealth_total: number;
  total_contribution: number;
  pending_count: number;
  remitted_count: number;
}
```

---

### 7. Compliance Module

**Location:** `src/features/compliance/`

**Components:**
- `ComplianceList.tsx` - List all truck compliance
- `ComplianceCard.tsx` - Truck compliance card
- `ComplianceForm.tsx` - Add/update compliance info
- `ComplianceAlerts.tsx` - Expiring/expired alerts
- `ComplianceCalendar.tsx` - Expiry calendar view
- `ComplianceFilters.tsx` - Filter by status

**CRUD Operations:**
- Create compliance record
- Read compliance records
- Update compliance record
- Delete compliance record (Admin only)

**API Endpoints:**
```
GET    /api/compliance?status=&truck_id=
GET    /api/compliance/:id
POST   /api/compliance
PUT    /api/compliance/:id
DELETE /api/compliance/:id
GET    /api/compliance/alerts
```

**Type Definition (compliance.types.ts):**
```typescript
export type ComplianceStatus = 'active' | 'expiring_soon' | 'expired' | 'inactive';

export interface ComplianceRecord {
  id: number;
  truck_id: number;
  registration_expiry: string;
  registration_cost: number;
  insurance_provider: string;
  insurance_policy_number: string;
  insurance_expiry: string;
  insurance_cost: number;
  smoke_emission_expiry: string;
  lto_compliance_status: string;
  status: ComplianceStatus;
  created_by: number;
  updated_at: string;
  truck?: Truck;
}

export interface ComplianceAlert {
  truck_id: number;
  truck_plate: string;
  alert_type: 'registration' | 'insurance' | 'emission';
  expiry_date: string;
  days_remaining: number;
  severity: 'critical' | 'warning' | 'info';
}
```

---

### 8. Reports Module

**Location:** `src/features/reports/`

**Components:**
- `ReportsDashboard.tsx` - Reports selection
- `MonthlyExpenseReport.tsx` - Expense report
- `FuelEfficiencyReport.tsx` - Fuel report
- `MaintenanceReport.tsx` - Maintenance report
- `PayrollReport.tsx` - Payroll report
- `ContributionReport.tsx` - Contributions report
- `ComplianceReport.tsx` - Compliance report
- `ReportFilters.tsx` - Date range, filters
- `ReportExport.tsx` - Export to PDF/Excel

**API Endpoints:**
```
GET /api/reports/expenses?month=&year=
GET /api/reports/fuel?truck_id=&start_date=&end_date=
GET /api/reports/maintenance?truck_id=&start_date=&end_date=
GET /api/reports/payroll?start_date=&end_date=
GET /api/reports/contributions?month=&year=
GET /api/reports/compliance
POST /api/reports/export (generate PDF/Excel)
```

---

## Shared Components

### UI Components (src/components/ui/)

Based on Radix UI + TailwindCSS:

- `Button.tsx`
- `Input.tsx`
- `Select.tsx`
- `Textarea.tsx`
- `Dialog.tsx`
- `Card.tsx`
- `Table.tsx`
- `Badge.tsx`
- `Alert.tsx`
- `Tabs.tsx`
- `DatePicker.tsx`
- `Combobox.tsx`

### Layout Components (src/components/layout/)

- `AppLayout.tsx` - Main app layout
- `Header.tsx` - Top navigation
- `Sidebar.tsx` - Side navigation
- `Footer.tsx` - Footer
- `MobileNav.tsx` - Mobile navigation

### Common Components (src/components/common/)

- `LoadingSpinner.tsx`
- `LoadingOverlay.tsx`
- `ErrorBoundary.tsx`
- `ErrorFallback.tsx`
- `EmptyState.tsx`
- `Pagination.tsx`
- `SearchBar.tsx`
- `FilterPanel.tsx`
- `StatusBadge.tsx`
- `ConfirmDialog.tsx`

---

## Custom Hooks

### Data Fetching Hooks (src/hooks/)

- `useTrucks.ts` - Fetch and manage trucks
- `useFuelLogs.ts` - Fetch and manage fuel logs
- `useMaintenance.ts` - Fetch and manage maintenance
- `usePayroll.ts` - Fetch and manage payroll
- `useContributions.ts` - Fetch and manage contributions
- `useCompliance.ts` - Fetch and manage compliance
- `useReports.ts` - Fetch reports data

### Utility Hooks

- `useAuth.ts` - Authentication state
- `usePermissions.ts` - Check user permissions
- `useToast.ts` - Toast notifications
- `useDebounce.ts` - Debounce values
- `useLocalStorage.ts` - Local storage management
- `useMediaQuery.ts` - Responsive breakpoints

---

## Services (src/services/)

### API Service Structure

```typescript
// Example: fuelService.ts
import api from '@/lib/api';
import { FuelLog, FuelStats } from '@/features/fuel/types/fuel.types';

export const fuelService = {
  // Get all fuel logs
  getFuelLogs: async (params?: {
    truck_id?: number;
    month?: number;
    year?: number;
  }) => {
    const response = await api.get<FuelLog[]>('/fuel-logs', { params });
    return response.data;
  },

  // Get single fuel log
  getFuelLog: async (id: number) => {
    const response = await api.get<FuelLog>(`/fuel-logs/${id}`);
    return response.data;
  },

  // Create fuel log
  createFuelLog: async (data: Omit<FuelLog, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post<FuelLog>('/fuel-logs', data);
    return response.data;
  },

  // Update fuel log
  updateFuelLog: async (id: number, data: Partial<FuelLog>) => {
    const response = await api.put<FuelLog>(`/fuel-logs/${id}`, data);
    return response.data;
  },

  // Delete fuel log
  deleteFuelLog: async (id: number) => {
    await api.delete(`/fuel-logs/${id}`);
  },

  // Get fuel efficiency stats
  getFuelEfficiency: async (truckId?: number) => {
    const response = await api.get<FuelStats>('/fuel-stats/efficiency', {
      params: { truck_id: truckId }
    });
    return response.data;
  }
};
```

---

## Type Definitions

All TypeScript types should be defined in their respective feature modules under `types/` folder.

### Global Types (src/types/global.types.ts)

```typescript
export type UserRole = 'admin' | 'encoder';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
```

---

## Routing Structure

### Route Definition (src/routes/index.tsx)

```typescript
export const routes = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/trucks', element: <TruckList /> },
      { path: '/trucks/:id', element: <TruckDetails /> },
      { path: '/fuel', element: <FuelLogList /> },
      { path: '/maintenance', element: <MaintenanceList /> },
      { path: '/payroll', element: <PayrollList /> },
      { path: '/contributions', element: <ContributionsList /> },
      { path: '/compliance', element: <ComplianceList /> },
      { path: '/reports', element: <ReportsDashboard /> },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/404', element: <NotFound /> },
];
```

---

## State Management

Using TanStack Query (React Query) for server state and React Context for client state.

### Query Keys (src/lib/queryKeys.ts)

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
  },
  maintenance: {
    all: ['maintenance'] as const,
    filtered: (filters: any) => ['maintenance', filters] as const,
    history: (truckId: number) => ['maintenance', 'history', truckId] as const,
  },
  payroll: {
    all: ['payroll'] as const,
    filtered: (filters: any) => ['payroll', filters] as const,
  },
  // ... more query keys
};
```

---

## Summary

This structure provides:

✅ Clear separation of concerns
✅ Feature-based organization
✅ Type safety with TypeScript
✅ Reusable components and hooks
✅ Scalable architecture
✅ Easy to maintain and extend

Each module is self-contained with its own components, hooks, services, and types, making it easy for developers to work on specific features without affecting others.
