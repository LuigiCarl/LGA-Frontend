# Trip & Fuel Tracking Summary Guide

## Overview

Enhanced tracking system for recording:

1. **Trip counts per truck/unit**
2. **Fuel consumption overall** (Weekly/Monthly/Yearly)
3. **Combined performance summaries**

---

## 📊 Available Views

### 1. Trips Tracking (`TripsSkeleton`)

**File:** `src/features/trips/TripsSkeleton.tsx`

**What it tracks:**

- ✅ Number of trips per truck
- ✅ Trip counts by period (Weekly/Monthly/Yearly)
- ✅ Distance traveled per truck
- ✅ Average trips per period

**Summary Table Columns:**

- Truck Plate Number
- Trip Count
- Total Distance
- Average Distance per Trip
- Last Trip Date

**Period Views:**

- Weekly summary
- Monthly summary
- Yearly summary

---

### 2. Fuel Consumption Tracking (`FuelSkeleton`)

**File:** `src/features/fuel/FuelSkeleton.tsx`

**What it tracks:**

- ✅ Total fuel consumption per truck
- ✅ Fuel consumption by period (Weekly/Monthly/Yearly)
- ✅ Average consumption per trip
- ✅ Fuel efficiency metrics

**Summary Table Columns:**

- Truck Plate Number
- Total Fuel Consumed (Liters)
- Total Cost (PHP)
- Average Consumption (L/trip)
- Fuel Cost per Trip
- Efficiency Rating

**Period Views:**

- Weekly consumption
- Monthly consumption
- Yearly consumption

---

### 3. Combined Performance View (`TruckPerformanceSkeleton`)

**File:** `src/features/reports/TruckPerformanceSkeleton.tsx`

**What it tracks:**

- ✅ Trip counts + Fuel consumption combined
- ✅ Performance metrics per truck
- ✅ Comparative analysis
- ✅ Trend visualization

**Summary Table Columns:**

- Truck Plate Number
- Trip Count
- Total Distance (km)
- Total Fuel (Liters)
- Avg Fuel per Trip
- Total Cost
- Performance Rating

---

## 🎯 Key Features

### Period Selector

All views include a period selector with three options:

```
[Weekly] [Monthly] [Yearly]
```

### Summary Statistics

Each view shows 4 key metrics at the top:

- Total Trips / Total Consumption
- Period Average
- Best Performer
- Total Cost

### Per-Truck Breakdown

Detailed table showing:

- Individual truck performance
- Sortable by any metric
- Color-coded performance indicators
- Mobile-responsive cards

---

## 📱 Mobile vs Desktop

### Desktop View

- Full table with all columns
- Sortable headers
- Hover tooltips
- Export functionality

### Mobile View

- Card-based layout
- Key metrics highlighted
- Swipeable cards
- Touch-friendly buttons

---

## 🔢 Data Structure

### Trip Record

```typescript
{
  truckPlate: string;
  tripCount: number;
  totalDistance: number;
  avgDistancePerTrip: number;
  lastTripDate: string;
  period: 'weekly' | 'monthly' | 'yearly';
}
```

### Fuel Record

```typescript
{
  truckPlate: string;
  totalFuel: number; // in liters
  totalCost: number; // in PHP
  avgConsumption: number; // liters per trip
  costPerTrip: number; // PHP per trip
  efficiency: string; // 'Good' | 'Average' | 'Poor'
  period: 'weekly' | 'monthly' | 'yearly';
}
```

### Combined Performance

```typescript
{
  truckPlate: string;
  tripCount: number;
  totalDistance: number;
  totalFuel: number;
  avgFuelPerTrip: number;
  totalCost: number;
  performanceRating: string;
  period: 'weekly' | 'monthly' | 'yearly';
}
```

---

## 📈 Charts & Visualizations

### Trip Trends Chart

- Bar chart showing trips per truck
- Line overlay for trend
- Period comparison

### Fuel Consumption Chart

- Bar chart showing fuel consumption
- Efficiency line graph
- Cost breakdown

### Combined Performance Chart

- Dual-axis chart (trips + fuel)
- Performance indicators
- Period-over-period comparison

---

## 💡 Usage Examples

### View Weekly Trip Summary

1. Navigate to Trips page
2. Select "Weekly" period
3. See trip counts for current week
4. Compare truck performance

### View Monthly Fuel Consumption

1. Navigate to Fuel page
2. Select "Monthly" period
3. See total consumption for month
4. Review per-truck breakdown

### View Yearly Performance

1. Navigate to Reports > Truck Performance
2. Select "Yearly" period
3. See combined metrics
4. Export report

---

## 🎨 Color Coding

### Trip Count Indicators

- 🟢 Green: High activity (10+ trips)
- 🟡 Yellow: Moderate activity (5-9 trips)
- 🔴 Red: Low activity (<5 trips)

### Fuel Efficiency Indicators

- 🟢 Green: Good efficiency (< avg consumption)
- 🟡 Yellow: Average efficiency (near avg)
- 🔴 Red: Poor efficiency (> avg consumption)

### Performance Rating

- ⭐⭐⭐ Excellent (high trips, low fuel)
- ⭐⭐ Good (balanced performance)
- ⭐ Needs Improvement (low trips or high fuel)

---

## 📊 Summary Table Examples

### Trips Per Truck (Weekly)

```
Truck    | Trips | Distance | Avg/Trip | Last Trip
---------|-------|----------|----------|----------
ABC-1234 |  12   |  850 km  |  71 km   | Jan 5
XYZ-5678 |   8   |  520 km  |  65 km   | Jan 4
DEF-9012 |   6   |  380 km  |  63 km   | Jan 3
```

### Fuel Consumption (Monthly)

```
Truck    | Fuel    | Cost      | Avg/Trip | Efficiency
---------|---------|-----------|----------|------------
ABC-1234 | 245 L   | ₱12,250   | 20.4 L   | Good
XYZ-5678 | 198 L   | ₱9,900    | 24.8 L   | Average
DEF-9012 | 156 L   | ₱7,800    | 26.0 L   | Average
```

### Combined Performance (Yearly)

```
Truck    | Trips | Distance  | Fuel     | Cost       | Rating
---------|-------|-----------|----------|------------|--------
ABC-1234 | 142   | 9,850 km  | 2,840 L  | ₱142,000   | ⭐⭐⭐
XYZ-5678 | 128   | 7,680 km  | 3,072 L  | ₱153,600   | ⭐⭐
DEF-9012 |  96   | 5,760 km  | 2,496 L  | ₱124,800   | ⭐⭐
```

---

## 🔄 Integration with Backend

When backend is ready, replace skeleton with:

```typescript
// Fetch trip summary
const { data } = useQuery({
  queryKey: ['trip-summary', period],
  queryFn: () => fetchTripSummary(period),
});

// Fetch fuel summary
const { data } = useQuery({
  queryKey: ['fuel-summary', period],
  queryFn: () => fetchFuelSummary(period),
});

// Fetch combined performance
const { data } = useQuery({
  queryKey: ['truck-performance', period],
  queryFn: () => fetchTruckPerformance(period),
});
```

---

## ✅ Summary

**What You Can Track:**

- ✅ Trip count per truck (Weekly/Monthly/Yearly)
- ✅ Fuel consumption overall and per truck
- ✅ Performance metrics and comparisons
- ✅ Cost analysis and trends

**How to Use:**

1. Choose the view (Trips, Fuel, or Combined)
2. Select the period (Weekly, Monthly, Yearly)
3. Review the summary table
4. Analyze charts and trends

**Benefits:**

- 📊 Clear visibility of truck utilization
- 💰 Track fuel costs and efficiency
- 📈 Identify performance trends
- 🎯 Make data-driven decisions

---

**Files Updated:**

- ✅ `src/features/trips/TripsSkeleton.tsx` - Trip tracking per truck
- ✅ `src/features/fuel/FuelSkeleton.tsx` - Fuel consumption tracking
- ✅ `src/features/reports/TruckPerformanceSkeleton.tsx` - Combined performance view

All views are fully responsive and ready for API integration!
