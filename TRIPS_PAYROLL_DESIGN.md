# Trips Module - Payroll-Driven Redesign

## 📋 Business Context

**Purpose:** Daily trip recording system that directly drives payroll computation

**Key Principle:** Trips are the fundamental unit for calculating driver compensation. The system must track trips accurately, link them to payroll periods, and handle partial payments with FIFO logic.

---

## 🎯 Core Business Rules

### 1. Daily Trip Recording

- **Frequency:** Trips are recorded DAILY
- **Granularity:** One record per truck per day
- **Essential Data:**
  - Truck (unit)
  - Driver
  - Number of trips completed
  - Date (defaults to today)

### 2. Trip-to-Payroll Relationship

```
Weekly Payroll = Sum of all trips in that week
Monthly Payroll = Sum of all trips in that month
```

**Rules:**

- Each trip can only be paid once
- Trips must be paid in chronological order (FIFO)
- Partial payments are allowed
- Unpaid trips carry over to future payroll periods

### 3. FIFO Payment Logic

**Scenario Example:**

```
Week 1 Trips: 50 trips
Week 2 Trips: 45 trips
Week 3 Trips: 55 trips

Payroll Period: Weeks 1-3 (150 total trips)
Payment Amount: Covers 120 trips only

Payment Application:
✅ Week 1: 50 trips FULLY PAID
✅ Week 2: 45 trips FULLY PAID
⏸️ Week 3: 25 trips PAID, 30 trips UNPAID (carried over)
```

### 4. Trip Status States

- **Unpaid:** Not yet included in any payroll
- **Partially Paid:** Some trips paid, some still unpaid
- **Fully Paid:** All trips in this record have been paid

---

## 🗂️ Data Model

### Trip Record Schema

```typescript
interface TripRecord {
  id: number;
  date: string; // YYYY-MM-DD
  truck_id: number;
  driver_id: number;
  total_trips: number; // Total trips completed this day
  paid_trips: number; // How many trips have been paid
  unpaid_trips: number; // Remaining unpaid trips (calculated)
  rate_per_trip: number; // Payment rate per trip (for historical tracking)
  status: 'unpaid' | 'partially_paid' | 'fully_paid';
  notes?: string;

  // Relationships
  truck?: Truck;
  driver?: Employee;
  payroll_entries?: PayrollTripLink[]; // Links to payroll records

  // Metadata
  created_by: number;
  created_at: string;
  updated_at: string;
}

// Example:
{
  id: 1,
  date: "2026-01-05",
  truck_id: 3,
  driver_id: 12,
  total_trips: 8,
  paid_trips: 5,
  unpaid_trips: 3, // 8 - 5
  rate_per_trip: 150.00,
  status: "partially_paid",
  notes: ""
}
```

### Payroll-Trip Link Schema

```typescript
interface PayrollTripLink {
  id: number;
  payroll_id: number;
  trip_record_id: number;
  trips_paid: number; // How many trips from this record were paid
  amount_paid: number; // trips_paid × rate_per_trip
  created_at: string;
}

// Example:
{
  id: 1,
  payroll_id: 45,
  trip_record_id: 1,
  trips_paid: 5,
  amount_paid: 750.00 // 5 trips × ₱150
}
```

---

## 🎨 UI Design - Simplified Trips Page

### Layout

```
┌─────────────────────────────────────────────────────┐
│ DAILY TRIP RECORDING                                │
│ Record trips for: [January 5, 2026 📅]             │
├─────────────────────────────────────────────────────┤
│                                                      │
│ [+ Add Truck] [📊 View History] [💰 Trip Rates]   │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ Plate      Driver        Trips    Status     │   │
│ ├──────────────────────────────────────────────┤   │
│ │ ABC-1234   Juan Dela C.  [  8  ]  ✅ Saved  │   │
│ │ XYZ-5678   Pedro Santos  [  6  ]  ⚠️ Unpaid │   │
│ │ DEF-9012   Maria Lopez   [ 10  ]  💰 Paid   │   │
│ │ GHI-3456   Jose Reyes    [  7  ]  ⏸️ Partial│   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ [Save All Changes] [Cancel]                         │
└─────────────────────────────────────────────────────┘
```

### Key Features

1. **Date Selector**

   - Defaults to current date
   - Can select past dates (for corrections)
   - Cannot select future dates

2. **Inline Editing**

   - Direct input in table cells
   - Auto-save on blur
   - Real-time validation

3. **Status Indicators**

   - ✅ Saved: Record exists, no payment yet
   - ⚠️ Unpaid: Has unpaid trips
   - 💰 Fully Paid: All trips paid
   - ⏸️ Partially Paid: Some trips paid

4. **Mobile View**
   - Cards instead of table
   - Swipeable for quick editing
   - Large touch targets

---

## 💻 Frontend Implementation

### Component Structure

```
src/features/trips/
├── index.tsx                      # Main page wrapper
├── components/
│   ├── DailyTripForm.tsx         # Main form (date selector + table)
│   ├── TripRow.tsx               # Single row (inline edit)
│   ├── TripCard.tsx              # Mobile card view
│   ├── TripHistory.tsx           # Historical view with filters
│   ├── TripStatusBadge.tsx       # Status indicator
│   ├── TripRatesModal.tsx        # Rate configuration (admin only)
│   └── PayrollLinkInfo.tsx       # Shows which payroll paid these trips
├── hooks/
│   ├── useTripsForDate.ts        # Fetch trips for specific date
│   ├── useSaveTripRecord.ts      # Save/update trip record
│   ├── useTripHistory.ts         # Fetch historical trips with filters
│   └── useTripRates.ts           # Manage trip payment rates
├── services/
│   └── tripService.ts            # API calls
└── utils/
    └── tripCalculations.ts       # Business logic helpers
```

### Key Components

#### 1. DailyTripForm.tsx

```tsx
import { useState } from 'react';
import { useTrucks } from '../trucks/hooks/useTrucks';
import { useEmployees } from '../employees/hooks/useEmployees';
import { useTripsForDate } from './hooks/useTripsForDate';
import { useSaveTripRecord } from './hooks/useSaveTripRecord';
import { TripRow } from './components/TripRow';

export function DailyTripForm() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: trucks } = useTrucks({ status: 'active' });
  const { data: drivers } = useEmployees({ position: 'driver' });
  const { data: tripRecords, isLoading } = useTripsForDate(selectedDate);
  const saveTripRecord = useSaveTripRecord();

  const handleTripChange = (truckId: number, trips: number) => {
    saveTripRecord.mutate({
      date: selectedDate,
      truck_id: truckId,
      total_trips: trips,
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Daily Trip Recording</h1>
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          max={new Date().toISOString().split('T')[0]}
          className="input"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Plate Number</th>
              <th>Driver</th>
              <th>Trips</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trucks?.map((truck) => {
              const record = tripRecords?.find((r) => r.truck_id === truck.id);
              return (
                <TripRow
                  key={truck.id}
                  truck={truck}
                  record={record}
                  onTripChange={handleTripChange}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

#### 2. TripRow.tsx (Inline Edit)

```tsx
interface TripRowProps {
  truck: Truck;
  record?: TripRecord;
  onTripChange: (truckId: number, trips: number) => void;
}

export function TripRow({ truck, record, onTripChange }: TripRowProps) {
  const [trips, setTrips] = useState(record?.total_trips || 0);

  const handleBlur = () => {
    if (trips !== record?.total_trips) {
      onTripChange(truck.id, trips);
    }
  };

  return (
    <tr>
      <td>
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4" />
          {truck.plate_number}
        </div>
      </td>
      <td>{truck.driver?.full_name || 'Unassigned'}</td>
      <td>
        <input
          type="number"
          value={trips}
          onChange={(e) => setTrips(parseInt(e.target.value) || 0)}
          onBlur={handleBlur}
          min="0"
          max="99"
          className="input w-20 text-center"
        />
      </td>
      <td>
        <TripStatusBadge
          totalTrips={record?.total_trips || 0}
          paidTrips={record?.paid_trips || 0}
        />
      </td>
      <td>{record && <button className="btn-secondary btn-sm">View Details</button>}</td>
    </tr>
  );
}
```

#### 3. TripStatusBadge.tsx

```tsx
interface TripStatusBadgeProps {
  totalTrips: number;
  paidTrips: number;
}

export function TripStatusBadge({ totalTrips, paidTrips }: TripStatusBadgeProps) {
  if (totalTrips === 0) {
    return <span className="badge badge-gray">No Trips</span>;
  }

  if (paidTrips === 0) {
    return (
      <span className="badge badge-yellow flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        Unpaid ({totalTrips})
      </span>
    );
  }

  if (paidTrips === totalTrips) {
    return (
      <span className="badge badge-green flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Paid ({totalTrips})
      </span>
    );
  }

  return (
    <span className="badge badge-orange flex items-center gap-1">
      <Clock className="w-3 h-3" />
      Partial ({paidTrips}/{totalTrips})
    </span>
  );
}
```

---

## 🔄 Payroll Integration Logic

### Payroll Generation Process

```typescript
// src/features/payroll/utils/payrollTripCalculations.ts

interface PayrollGenerationParams {
  driver_id: number;
  start_date: string;
  end_date: string;
  rate_per_trip: number;
}

interface PayrollTripResult {
  total_trips: number;
  unpaid_trips: number;
  trips_to_pay: number;
  amount: number;
  trip_records: Array<{
    trip_record_id: number;
    date: string;
    total_trips: number;
    trips_to_pay: number;
  }>;
}

export async function calculatePayrollTrips(
  params: PayrollGenerationParams
): Promise<PayrollTripResult> {
  const { driver_id, start_date, end_date, rate_per_trip } = params;

  // 1. Fetch all trip records for driver in date range
  // Sort by date ASC (oldest first - FIFO)
  const tripRecords = await tripService.getTripRecords({
    driver_id,
    start_date,
    end_date,
    order_by: 'date',
    order_direction: 'asc',
  });

  // 2. Calculate totals
  let total_trips = 0;
  let unpaid_trips = 0;

  tripRecords.forEach((record) => {
    total_trips += record.total_trips;
    unpaid_trips += record.unpaid_trips;
  });

  // 3. Determine trips to pay (all unpaid in this period)
  const trips_to_pay = unpaid_trips;
  const amount = trips_to_pay * rate_per_trip;

  // 4. Break down by trip record (for linking)
  const trip_records = tripRecords
    .filter((record) => record.unpaid_trips > 0)
    .map((record) => ({
      trip_record_id: record.id,
      date: record.date,
      total_trips: record.total_trips,
      trips_to_pay: record.unpaid_trips,
    }));

  return {
    total_trips,
    unpaid_trips,
    trips_to_pay,
    amount,
    trip_records,
  };
}
```

### FIFO Payment Application

```typescript
// When payroll is marked as PAID, update trip records

interface PaymentApplication {
  payroll_id: number;
  trip_links: PayrollTripLink[];
}

export async function applyPaymentToTrips(
  payroll_id: number,
  driver_id: number,
  start_date: string,
  end_date: string
): Promise<PaymentApplication> {
  // 1. Get unpaid trip records in FIFO order
  const unpaidRecords = await tripService.getTripRecords({
    driver_id,
    start_date,
    end_date,
    status: ['unpaid', 'partially_paid'],
    order_by: 'date',
    order_direction: 'asc',
  });

  const trip_links: PayrollTripLink[] = [];

  // 2. Apply payment to each record in order
  for (const record of unpaidRecords) {
    const trips_to_pay = record.unpaid_trips;
    const amount_paid = trips_to_pay * record.rate_per_trip;

    // Create link record
    const link = await tripService.createPayrollTripLink({
      payroll_id,
      trip_record_id: record.id,
      trips_paid: trips_to_pay,
      amount_paid,
    });

    trip_links.push(link);

    // Update trip record
    await tripService.updateTripRecord(record.id, {
      paid_trips: record.paid_trips + trips_to_pay,
      status:
        record.paid_trips + trips_to_pay === record.total_trips ? 'fully_paid' : 'partially_paid',
    });
  }

  return { payroll_id, trip_links };
}
```

---

## 🔐 Role-Based Behavior

### Admin Capabilities

```typescript
const adminPermissions = {
  trips: {
    create: true,
    read: true,
    update: true,
    delete: true,
    editPaidTrips: true, // Can adjust paid_trips count
    editHistoricalTrips: true, // Can edit past trip records
    manageRates: true, // Can change rate_per_trip
  },
};
```

### Encoder Capabilities

```typescript
const encoderPermissions = {
  trips: {
    create: true,
    read: true,
    update: true, // Only unpaid trips
    delete: false,
    editPaidTrips: false, // Cannot change paid_trips
    editHistoricalTrips: false, // Cannot edit trips linked to payroll
    manageRates: false,
  },
};
```

### Implementation

```typescript
// src/features/trips/components/TripRow.tsx

export function TripRow({ truck, record }: TripRowProps) {
  const { isAdmin } = useAuth();

  const isEditable = useMemo(() => {
    // Admins can always edit
    if (isAdmin) return true;

    // Encoders cannot edit if:
    // 1. Record is fully paid
    // 2. Record is linked to approved/paid payroll
    if (record?.status === 'fully_paid') return false;
    if (record?.payroll_entries?.some((pe) => pe.status !== 'pending')) {
      return false;
    }

    return true;
  }, [isAdmin, record]);

  return (
    <tr>
      {/* ... */}
      <td>
        <input
          type="number"
          value={trips}
          onChange={(e) => setTrips(parseInt(e.target.value) || 0)}
          disabled={!isEditable}
          className={`input ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      </td>
      {/* ... */}
    </tr>
  );
}
```

---

## 📊 Trip History View

### Filters

```typescript
interface TripHistoryFilters {
  start_date: string;
  end_date: string;
  truck_id?: number;
  driver_id?: number;
  status?: TripStatus[];
  search?: string;
}
```

### UI Layout

```
┌─────────────────────────────────────────────────────┐
│ TRIP HISTORY                                        │
├─────────────────────────────────────────────────────┤
│ Filters:                                            │
│ Date Range: [2026-01-01] to [2026-01-31]          │
│ Truck: [All Trucks ▼]                              │
│ Driver: [All Drivers ▼]                            │
│ Status: [All] [Paid] [Unpaid] [Partial]           │
│ Search: [____________] 🔍                           │
├─────────────────────────────────────────────────────┤
│ Date       Truck      Driver        Trips  Status   │
├─────────────────────────────────────────────────────┤
│ 2026-01-05 ABC-1234  Juan Dela C.  8/8    💰 Paid  │
│ 2026-01-05 XYZ-5678  Pedro Santos  6/6    💰 Paid  │
│ 2026-01-04 ABC-1234  Juan Dela C.  7/10   ⏸️ Part  │
│ 2026-01-04 DEF-9012  Maria Lopez   9/9    💰 Paid  │
│ 2026-01-03 ABC-1234  Juan Dela C.  0/10   ⚠️ Unpd  │
└─────────────────────────────────────────────────────┘

Summary: 150 total trips, 120 paid, 30 unpaid
```

---

## 🧮 Calculation Examples

### Example 1: Weekly Payroll with Full Payment

```
Driver: Juan Dela Cruz
Period: January 1-7, 2026
Rate: ₱150 per trip

Trip Records:
- Jan 1: 10 trips (0 paid)
- Jan 2: 8 trips (0 paid)
- Jan 3: 12 trips (0 paid)
- Jan 4: 9 trips (0 paid)
- Jan 5: 11 trips (0 paid)

Total Trips: 50
Unpaid Trips: 50
Amount: 50 × ₱150 = ₱7,500

Payroll Approved & Paid → All 50 trips marked as paid (FIFO order)
```

### Example 2: Monthly Payroll with Partial Payment

```
Driver: Pedro Santos
Period: January 1-31, 2026
Rate: ₱150 per trip

Trip Records (summarized):
- Week 1 (Jan 1-7): 45 trips
- Week 2 (Jan 8-14): 40 trips
- Week 3 (Jan 15-21): 50 trips
- Week 4 (Jan 22-28): 42 trips

Total Trips: 177
Previously Paid: 0
Unpaid Trips: 177

Payroll Generated: 150 trips × ₱150 = ₱22,500

FIFO Application:
✅ Week 1: 45 trips FULLY PAID
✅ Week 2: 40 trips FULLY PAID
✅ Week 3: 50 trips FULLY PAID
✅ Week 4: 15 trips PAID, 27 trips UNPAID

Result:
- Week 1-3 trip records: status = fully_paid
- Week 4 trip record: status = partially_paid, paid_trips = 15, unpaid_trips = 27

Remaining 27 trips carry over to next payroll period
```

---

## 🔄 Unpaid Trip Rollover Logic

### Scenario: Multi-Period Accumulation

```
Payroll Period 1 (Jan 1-7)
- Total trips: 50
- Payment: 30 trips paid
- Result: 20 trips unpaid → carry over

Payroll Period 2 (Jan 8-14)
- New trips: 45
- Carried over: 20
- Total unpaid: 65 trips
- Payment: 50 trips paid (FIFO: first 20 from Period 1, then 30 from Period 2)
- Result: 15 trips from Period 2 unpaid → carry over

Payroll Period 3 (Jan 15-21)
- New trips: 40
- Carried over: 15
- Total unpaid: 55 trips
- Payment: 55 trips paid (FIFO: first 15 from Period 2, then 40 from Period 3)
- Result: All paid!
```

### Database Query for Unpaid Trips

```sql
-- Get all unpaid trips for a driver (FIFO order)
SELECT
  id,
  date,
  truck_id,
  driver_id,
  total_trips,
  paid_trips,
  (total_trips - paid_trips) as unpaid_trips,
  rate_per_trip,
  status
FROM trip_records
WHERE driver_id = ?
  AND status IN ('unpaid', 'partially_paid')
ORDER BY date ASC;

-- Calculate total unpaid trips
SELECT SUM(total_trips - paid_trips) as total_unpaid
FROM trip_records
WHERE driver_id = ?
  AND status IN ('unpaid', 'partially_paid');
```

---

## 📱 Mobile-Friendly Design

### Responsive Breakpoints

```css
/* Mobile: Stacked cards */
@media (max-width: 768px) {
  .trip-table {
    display: none;
  }
  .trip-cards {
    display: block;
  }
}

/* Tablet/Desktop: Table view */
@media (min-width: 769px) {
  .trip-table {
    display: table;
  }
  .trip-cards {
    display: none;
  }
}
```

### Mobile Card Component

```tsx
<div className="trip-card">
  <div className="card-header">
    <span className="truck-plate">ABC-1234</span>
    <TripStatusBadge totalTrips={8} paidTrips={5} />
  </div>
  <div className="card-body">
    <div className="field">
      <label>Driver</label>
      <span>Juan Dela Cruz</span>
    </div>
    <div className="field">
      <label>Trips</label>
      <input type="number" value={8} />
    </div>
    <div className="field">
      <label>Date</label>
      <span>January 5, 2026</span>
    </div>
  </div>
  <div className="card-actions">
    <button className="btn-save">Save</button>
  </div>
</div>
```

---

## ✅ Implementation Checklist

### Phase 1: Data Model & API

- [ ] Create `trip_records` table with FIFO-friendly schema
- [ ] Create `payroll_trip_links` junction table
- [ ] Implement API endpoints:
  - [ ] POST /trip-records (create/update daily trips)
  - [ ] GET /trip-records (with filters)
  - [ ] GET /trip-records/unpaid (driver, date range)
  - [ ] POST /payroll/:id/apply-trips (FIFO payment logic)
- [ ] Add trip rate configuration (admin setting)

### Phase 2: Frontend Components

- [ ] Build DailyTripForm with date selector
- [ ] Build TripRow with inline editing
- [ ] Build TripStatusBadge
- [ ] Build TripHistory with filters
- [ ] Build TripRatesModal (admin only)
- [ ] Build mobile TripCard view

### Phase 3: Integration with Payroll

- [ ] Update PayrollForm to show trip summary
- [ ] Implement trip calculation in payroll generation
- [ ] Build FIFO payment application logic
- [ ] Show trip breakdown in payslip
- [ ] Link trip records to payroll entries

### Phase 4: Permissions & Validation

- [ ] Implement role-based edit restrictions
- [ ] Prevent encoder from editing paid trips
- [ ] Prevent future date entries
- [ ] Add trip count validation (0-99)
- [ ] Show warning when editing historical trips (admin)

### Phase 5: Reports & Analytics

- [ ] Daily trip summary report
- [ ] Driver trip performance report
- [ ] Unpaid trips report (by driver, by period)
- [ ] Trip payment history
- [ ] Export to Excel/PDF

---

## 🎯 Success Criteria

### Functionality

✅ Encoders can record daily trips quickly (< 1 minute per day)
✅ Trip counts are accurate and traceable
✅ FIFO payment logic works correctly
✅ Unpaid trips carry over properly
✅ Admins can override and adjust as needed
✅ Trip status is always clear and visible

### User Experience

✅ Simple, fast interface
✅ Minimal clicks/keystrokes
✅ Auto-save on blur
✅ Clear visual feedback
✅ Mobile-friendly
✅ No unnecessary fields

### Data Integrity

✅ No trips are lost
✅ No double payments
✅ Audit trail is complete
✅ Calculations are accurate
✅ Historical data is preserved

---

**Document Version:** 1.0
**Last Updated:** January 5, 2026
**Status:** Ready for Implementation
