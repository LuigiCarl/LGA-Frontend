# LGA Trucking Management System - Overview

## System Purpose
A comprehensive web-based management system for trucking operations, handling expenses, payroll, government contributions, and truck compliance with role-based access control.

---

## Core Modules

### 1. Dashboard
**Purpose:** Central command center showing key metrics and alerts

**Key Features:**
- Total monthly expenses overview
- Fuel cost summary (current month)
- Maintenance cost summary
- Payroll pending approval amount
- Government contributions pending remittance
- Truck compliance status (Active/Expiring/Expired)
- Quick action buttons
- Visual charts (monthly expenses trend, category breakdown)

**User Access:**
- Admin: Full access
- Encoder: View-only access

---

### 2. Monthly Expenses Module
**Purpose:** Comprehensive tracking and reporting of all company expenses

**Key Features:**
- View all expenses by month/year
- Category-based filtering:
  - Fuel expenses
  - Maintenance and repair
  - Weekly salaries (payroll)
  - Government contributions
  - Truck registration and compliance
- Monthly totals and summaries
- Category breakdown charts
- Export reports (PDF/Excel)

**Data Points:**
- Date
- Category
- Amount
- Description
- Reference number

**User Access:**
- Admin: View, filter, export
- Encoder: View, filter, export

---

### 3. Fuel Expenses Module
**Purpose:** Track fuel consumption, costs, and efficiency per truck

**Key Features:**
- Record fuel logs per truck
- Fuel efficiency calculation (km per liter)
- Monthly fuel cost by truck
- Fuel consumption trends
- Odometer tracking

**Data Points:**
- Date
- Truck ID/Plate Number
- Fuel quantity (liters)
- Cost per liter
- Total cost
- Odometer reading
- Location/Station
- Receipt number

**Calculations:**
- Distance traveled = Current odometer - Previous odometer
- Fuel efficiency = Distance / Fuel quantity
- Cost per kilometer

**User Access:**
- Admin: Full CRUD
- Encoder: Create, View

---

### 4. Maintenance & Repair Module
**Purpose:** Log and track all maintenance activities and repair costs

**Key Features:**
- Maintenance history per truck
- Scheduled vs. Unscheduled maintenance tracking
- Cost tracking
- Service provider records
- Parts replacement history
- Monthly maintenance summary

**Data Points:**
- Date
- Truck ID/Plate Number
- Type (Preventive Maintenance / Repair)
- Category (Engine, Brakes, Tires, Electrical, Body, etc.)
- Description
- Service provider
- Parts used
- Labor cost
- Parts cost
- Total cost
- Next scheduled maintenance date

**User Access:**
- Admin: Full CRUD, Delete
- Encoder: Create, View, Update

---

### 5. Weekly Salary (Payroll) Module
**Purpose:** Manage employee weekly payroll with government deductions

**Key Features:**
- Weekly payroll entry
- Salary components breakdown
- Automatic deductions calculation
- Payroll approval workflow
- Payment tracking
- Payslip generation

**Data Points:**
- Employee ID/Name
- Week period (Start date - End date)
- Basic pay
- Overtime hours
- Overtime pay
- Allowances (Meal, Transportation, etc.)
- Gross pay
- Deductions:
  - SSS employee share
  - Pag-IBIG employee share
  - PhilHealth employee share
  - Loans/advances
- Net pay
- Status (Pending, Approved, Paid)
- Payment date
- Payment method

**Calculations:**
- Gross Pay = Basic Pay + Overtime Pay + Allowances
- Net Pay = Gross Pay - Total Deductions

**Workflow:**
1. Encoder: Create payroll entries → Status: Pending
2. Admin: Review and approve → Status: Approved
3. Admin: Mark as paid → Status: Paid

**User Access:**
- Admin: Full CRUD, Approve, Mark as Paid
- Encoder: Create, View (Cannot approve or mark as paid)

---

### 6. Government Contributions Module
**Purpose:** Track and manage SSS, Pag-IBIG, and PhilHealth contributions

**Key Features:**
- Monthly contribution summary
- Employee and employer share breakdown
- Contribution basis computation
- Remittance tracking
- Due date alerts
- Reference number recording

**Data Points:**
- Month/Year
- Employee ID/Name
- Contribution Type (SSS/Pag-IBIG/PhilHealth)
- Monthly compensation
- Employee share
- Employer share
- Total contribution
- Status (Pending, Remitted)
- Remittance date
- Reference number

**Contribution Tables (2026 Philippine Guidelines):**

**SSS:**
- Employee: 4.5% of monthly salary credit
- Employer: 9.5% of monthly salary credit
- Total: 14% of monthly salary credit
- Maximum salary credit: ₱30,000

**Pag-IBIG:**
- Employee: 2% of monthly compensation (max ₱100)
- Employer: 2% of monthly compensation (max ₱100)

**PhilHealth:**
- Employee: 2.5% of monthly basic salary
- Employer: 2.5% of monthly basic salary
- Maximum monthly premium: ₱5,000 (₱2,500 each)

**User Access:**
- Admin: Full CRUD, Mark as Remitted
- Encoder: View only

---

### 7. Truck Registration & Compliance Module
**Purpose:** Track truck registration, insurance, and compliance status

**Key Features:**
- Truck master list
- Registration renewal tracking
- Insurance policy tracking
- Compliance status monitoring
- Expiry date alerts (30 days, 7 days)
- Document repository

**Data Points:**
- Truck ID
- Plate Number
- Make/Model/Year
- VIN (Vehicle Identification Number)
- Registration expiry date
- Registration cost
- Insurance provider
- Insurance policy number
- Insurance expiry date
- Insurance cost
- Smoke emission test expiry
- LTO compliance status
- Status (Active, Expiring Soon, Expired, Inactive)

**Alerts:**
- Red: Expired
- Yellow: Expiring within 30 days
- Green: Active (more than 30 days remaining)

**User Access:**
- Admin: Full CRUD, Delete
- Encoder: Create, View, Update

---

### 8. Reports Module
**Purpose:** Generate comprehensive reports for analysis and decision-making

**Available Reports:**

**8.1 Monthly Expense Report**
- Total expenses by category
- Month-over-month comparison
- Bar chart visualization
- Export to PDF/Excel

**8.2 Fuel Efficiency Report**
- Fuel consumption per truck
- Cost per kilometer
- Efficiency trends
- Best/worst performing trucks

**8.3 Maintenance Report**
- Maintenance cost per truck
- Maintenance frequency
- Cost trends
- Scheduled vs. unscheduled maintenance ratio

**8.4 Payroll Report**
- Total payroll per period
- Employee payroll breakdown
- Deductions summary
- Year-to-date payroll

**8.5 Government Contributions Report**
- Monthly contributions summary
- Employee vs. employer share
- Remittance status
- Annual contribution totals

**8.6 Truck Compliance Report**
- Active trucks count
- Expiring registrations/insurance
- Compliance status overview

**User Access:**
- Admin: All reports
- Encoder: View-only all reports

---

## User Roles & Permissions

### Admin
**Full System Access:**
- ✅ All CRUD operations
- ✅ Approve payroll
- ✅ Mark payroll as paid
- ✅ Mark contributions as remitted
- ✅ Delete sensitive records
- ✅ Manage user accounts
- ✅ System settings

### Encoder
**Limited Access:**
- ✅ Create expense entries
- ✅ View all data
- ✅ Update non-critical records
- ❌ Cannot approve payroll
- ❌ Cannot mark as paid
- ❌ Cannot mark as remitted
- ❌ Cannot delete records
- ❌ Cannot access system settings

---

## Technology Stack

**Frontend:**
- React 18
- TypeScript
- Vite 6
- TailwindCSS
- Radix UI Components
- React Router 7
- TanStack Query (React Query)
- Recharts (for visualizations)
- React Hook Form + Zod (form validation)

**Backend (Laravel):**
- Laravel 11
- MySQL/PostgreSQL
- JWT Authentication
- RESTful API

**Key Features:**
- Responsive design (Mobile-first)
- Progressive Web App (PWA)
- Dark mode support
- Real-time notifications
- Data caching
- Optimistic UI updates
- Error boundaries

---

## Security Features

1. **Authentication:**
   - JWT token-based authentication
   - Secure password hashing
   - Session management

2. **Authorization:**
   - Role-based access control (RBAC)
   - Permission-based UI rendering
   - API endpoint protection

3. **Data Protection:**
   - Input validation (client & server)
   - SQL injection prevention
   - XSS protection
   - CSRF protection

---

## Best Practices Applied

1. **Code Organization:**
   - Feature-based folder structure
   - Shared components library
   - Custom hooks for reusability
   - Type-safe API calls

2. **Performance:**
   - Code splitting
   - Lazy loading
   - Image optimization
   - Query caching
   - Virtual scrolling for large lists

3. **User Experience:**
   - Loading states
   - Error handling
   - Success feedback
   - Form validation
   - Keyboard navigation
   - Accessibility (WCAG 2.1)

4. **Maintainability:**
   - Consistent naming conventions
   - TypeScript for type safety
   - ESLint + Prettier
   - Component documentation
   - API documentation

---

## Development Roadmap

### Phase 1: Core Modules (Weeks 1-4)
- Dashboard setup
- Truck management
- Fuel expenses
- Basic authentication

### Phase 2: Payroll & Contributions (Weeks 5-7)
- Weekly payroll module
- Government contributions
- Approval workflows

### Phase 3: Compliance & Reports (Weeks 8-10)
- Registration tracking
- Maintenance logging
- Report generation
- Charts and analytics

### Phase 4: Refinement (Weeks 11-12)
- UI/UX improvements
- Performance optimization
- Testing
- Documentation

---

## Support & Maintenance

- Regular backups
- Monthly security updates
- Bug fix support
- Feature enhancement requests
- User training materials
- System documentation
