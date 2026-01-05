# Skeleton Frontend - Quick Start Guide

## 🚀 Getting Started

This guide will help you quickly start using the skeleton frontend for the LGA Trucking Management System.

---

## 📦 What's Included

```
11 Complete Page Skeletons
├── Dashboard
├── Trucks
├── Employees
├── Trips
├── Payroll
├── Contributions
├── Maintenance & Repair
├── Fuel Expenses
├── Monthly Expenses
├── Compliance & Documents
└── Reports & Analytics

10+ Reusable Components
├── SkeletonTable
├── SkeletonCard
├── SkeletonChart
├── SkeletonStatCard
└── More...
```

---

## ⚡ Quick Usage

### Option 1: Use Individual Skeleton Pages

```tsx
import TrucksSkeleton from './features/trucks/TrucksSkeleton';

function TrucksPage() {
  return <TrucksSkeleton />;
}
```

### Option 2: Use as Loading State

```tsx
import { useState, useEffect } from 'react';
import TrucksPage from './features/trucks';
import TrucksSkeleton from './features/trucks/TrucksSkeleton';

function TrucksContainer() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  return isLoading ? <TrucksSkeleton /> : <TrucksPage />;
}
```

### Option 3: With React Query

```tsx
import { useQuery } from '@tanstack/react-query';
import TrucksPage from './features/trucks';
import TrucksSkeleton from './features/trucks/TrucksSkeleton';

function TrucksContainer() {
  const { data, isLoading } = useQuery({
    queryKey: ['trucks'],
    queryFn: fetchTrucks,
  });

  if (isLoading) return <TrucksSkeleton />;

  return <TrucksPage data={data} />;
}
```

---

## 🎨 Preview All Skeletons

View all skeleton pages in one interface:

```tsx
import { SkeletonPreview } from './components/skeletons/SkeletonPreview';

function App() {
  return <SkeletonPreview />;
}
```

This creates an interactive preview with:

- ✅ Page selector tabs
- ✅ Live switching between pages
- ✅ Responsive preview
- ✅ Dark mode toggle

---

## 📋 Available Skeleton Pages

| Page          | Import Path                                      | Features                        |
| ------------- | ------------------------------------------------ | ------------------------------- |
| Dashboard     | `./components/DashboardSkeleton`                 | Stats, charts, tables, alerts   |
| Trucks        | `./features/trucks/TrucksSkeleton`               | 4 stats, table/cards            |
| Employees     | `./features/employees/EmployeesSkeleton`         | 4 stats, table/cards            |
| Trips         | `./features/trips/TripsSkeleton`                 | 6 stats, table/cards            |
| Payroll       | `./features/payroll/PayrollSkeleton`             | 4 stats, table/cards            |
| Contributions | `./features/contributions/ContributionsSkeleton` | 3 stats, tabs, table/cards      |
| Maintenance   | `./features/maintenance/MaintenanceSkeleton`     | 4 stats, chart, table/cards     |
| Fuel          | `./features/fuel/FuelSkeleton`                   | 4 stats, chart, table/cards     |
| Expenses      | `./features/expenses/ExpensesSkeleton`           | 4 stats, chart, table/cards     |
| Compliance    | `./features/compliance/ComplianceSkeleton`       | 4 stats, alerts, table/cards    |
| Reports       | `./features/reports/ReportsSkeleton`             | 4 stats, multiple charts, table |

---

## 🧩 Reusable Components

Import from central location:

```tsx
import {
  SkeletonTable,
  SkeletonCard,
  SkeletonChart,
  SkeletonStatCard,
} from './components/ui/skeleton-patterns';
```

### Quick Examples

**Stat Card:**

```tsx
<SkeletonStatCard />
```

**Table:**

```tsx
<SkeletonTable rows={10} columns={6} />
```

**Chart:**

```tsx
<SkeletonChart height={300} />
```

**Mobile Cards:**

```tsx
<SkeletonCards count={5} />
```

---

## 📱 Responsive Behavior

All skeletons automatically adjust to screen size:

**Mobile (< 1024px):**

- Cards layout
- Stacked statistics
- Touch-friendly spacing

**Desktop (≥ 1024px):**

- Table layout
- Grid statistics
- Expanded view

---

## 🎯 Common Use Cases

### 1. Initial Load

```tsx
function Dashboard() {
  const { data, isLoading } = useQuery(...);

  if (isLoading) return <DashboardSkeleton />;
  return <DashboardContent data={data} />;
}
```

### 2. Refetching Data

```tsx
function TrucksPage() {
  const { data, isFetching } = useQuery(...);

  if (!data) return <TrucksSkeleton />;

  return (
    <>
      {isFetching && <LoadingOverlay />}
      <TrucksContent data={data} />
    </>
  );
}
```

### 3. Suspense Fallback

```tsx
<Suspense fallback={<TrucksSkeleton />}>
  <TrucksPage />
</Suspense>
```

---

## 🔧 Customization

### Adjust Row Count

```tsx
<SkeletonTable rows={15} columns={8} />
```

### Adjust Chart Height

```tsx
<SkeletonChart height={400} />
```

### Custom Card Count

```tsx
<SkeletonCards count={8} />
```

---

## ✅ Testing Checklist

When using skeletons:

- [ ] Check desktop view (≥ 1024px)
- [ ] Check mobile view (< 1024px)
- [ ] Test dark mode appearance
- [ ] Verify animation smoothness
- [ ] Check loading → content transition
- [ ] Test on real devices
- [ ] Verify accessibility

---

## 🐛 Common Issues

### Issue: Layout doesn't match final component

**Fix:** Ensure grid/flex structure matches between skeleton and real component

### Issue: Dark mode colors wrong

**Fix:** Check all classNames have `dark:` variants

### Issue: Mobile view broken

**Fix:** Verify responsive classes match (`hidden lg:block`, `lg:hidden`)

---

## 📚 More Information

- Full documentation: `SKELETON_FRONTEND_GUIDE.md`
- Responsive patterns: `MOBILE_OPTIMIZATION_SUMMARY.md`
- Component structure: `MODULE_STRUCTURE.md`

---

## 🎉 You're Ready!

1. Choose a skeleton page
2. Import it
3. Use as loading state
4. Replace with real data when ready

**Questions?** Check the full guide: `SKELETON_FRONTEND_GUIDE.md`
