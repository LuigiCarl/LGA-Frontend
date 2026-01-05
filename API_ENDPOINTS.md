# API Endpoints Documentation - LGA Trucking Management System

## Base URL
```
Development: http://localhost:8000/api
Production: https://api.lgatrucking.com/api
```

## Authentication

All endpoints (except auth) require Bearer token authentication.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## 1. Authentication Endpoints

### Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "admin@lgatrucking.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbG...",
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@lgatrucking.com",
      "role": "admin",
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  }
}
```

### Logout
```
POST /auth/logout
```

### Get Current User
```
GET /auth/user
```

---

## 2. Dashboard Endpoints

### Get Dashboard Stats
```
GET /dashboard/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "monthly_expenses": {
      "current_month": 450000.00,
      "previous_month": 420000.00,
      "change_percentage": 7.14
    },
    "fuel_summary": {
      "total_cost": 85000.00,
      "total_liters": 5000.50,
      "average_efficiency": 6.5
    },
    "maintenance_summary": {
      "total_cost": 125000.00,
      "total_records": 15,
      "scheduled_upcoming": 3
    },
    "payroll_summary": {
      "pending_approval": 8,
      "pending_payment": 5,
      "total_pending_amount": 180000.00
    },
    "contribution_summary": {
      "pending_remittance": 12,
      "total_pending_amount": 45000.00
    },
    "compliance_summary": {
      "active_trucks": 10,
      "expiring_soon": 2,
      "expired": 1
    }
  }
}
```

---

## 3. Truck Endpoints

### Get All Trucks
```
GET /trucks?status=active&page=1&per_page=20
```

**Query Parameters:**
- `status` (optional): active | inactive | maintenance | retired
- `search` (optional): Search by plate number or make
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "plate_number": "ABC-1234",
        "make": "Isuzu",
        "model": "Forward",
        "year": 2020,
        "vin": "JHDCS123456789012",
        "status": "active",
        "created_at": "2026-01-01T00:00:00.000Z",
        "updated_at": "2026-01-01T00:00:00.000Z"
      }
    ],
    "current_page": 1,
    "per_page": 20,
    "total": 12,
    "last_page": 1
  }
}
```

### Get Single Truck
```
GET /trucks/:id
```

### Create Truck
```
POST /trucks
```

**Request Body:**
```json
{
  "plate_number": "ABC-1234",
  "make": "Isuzu",
  "model": "Forward",
  "year": 2020,
  "vin": "JHDCS123456789012",
  "status": "active"
}
```

### Update Truck
```
PUT /trucks/:id
```

### Delete Truck (Admin Only)
```
DELETE /trucks/:id
```

---

## 4. Fuel Endpoints

### Get All Fuel Logs
```
GET /fuel-logs?truck_id=1&month=1&year=2026&page=1&per_page=20
```

**Query Parameters:**
- `truck_id` (optional): Filter by truck
- `month` (optional): Filter by month (1-12)
- `year` (optional): Filter by year
- `start_date` (optional): Filter from date (YYYY-MM-DD)
- `end_date` (optional): Filter to date (YYYY-MM-DD)
- `page` (optional): Page number
- `per_page` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "truck_id": 1,
        "date": "2026-01-05",
        "fuel_quantity": 120.5,
        "cost_per_liter": 58.50,
        "total_cost": 7049.25,
        "odometer_reading": 145000,
        "location": "Shell NLEX",
        "receipt_number": "RCT-12345",
        "distance_traveled": 350,
        "fuel_efficiency": 6.5,
        "created_by": 1,
        "created_at": "2026-01-05T08:30:00.000Z",
        "updated_at": "2026-01-05T08:30:00.000Z",
        "truck": {
          "id": 1,
          "plate_number": "ABC-1234",
          "make": "Isuzu",
          "model": "Forward"
        }
      }
    ],
    "current_page": 1,
    "per_page": 20,
    "total": 45,
    "last_page": 3
  }
}
```

### Get Single Fuel Log
```
GET /fuel-logs/:id
```

### Create Fuel Log
```
POST /fuel-logs
```

**Request Body:**
```json
{
  "truck_id": 1,
  "date": "2026-01-05",
  "fuel_quantity": 120.5,
  "cost_per_liter": 58.50,
  "odometer_reading": 145000,
  "location": "Shell NLEX",
  "receipt_number": "RCT-12345"
}
```

**Note:** `total_cost`, `distance_traveled`, and `fuel_efficiency` are calculated automatically on the backend.

### Update Fuel Log
```
PUT /fuel-logs/:id
```

### Delete Fuel Log (Admin Only)
```
DELETE /fuel-logs/:id
```

### Get Fuel Efficiency Stats
```
GET /fuel-stats/efficiency?truck_id=1&start_date=2026-01-01&end_date=2026-01-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_cost": 85000.00,
    "total_liters": 5000.50,
    "average_efficiency": 6.5,
    "total_distance": 32503,
    "cost_per_km": 2.62
  }
}
```

### Get Fuel Summary by Truck
```
GET /fuel-stats/by-truck?month=1&year=2026
```

---

## 5. Maintenance Endpoints

### Get All Maintenance Records
```
GET /maintenance?truck_id=1&type=repair&month=1&year=2026
```

**Query Parameters:**
- `truck_id` (optional): Filter by truck
- `type` (optional): preventive | repair
- `category` (optional): engine | brakes | tires | electrical | transmission | suspension | body | other
- `month` (optional): Filter by month
- `year` (optional): Filter by year
- `start_date` (optional): Filter from date
- `end_date` (optional): Filter to date
- `page` (optional): Page number
- `per_page` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "truck_id": 1,
        "date": "2026-01-05",
        "type": "repair",
        "category": "engine",
        "description": "Engine oil change and filter replacement",
        "service_provider": "ABC Auto Shop",
        "parts_used": "Oil filter, Engine oil 15W-40",
        "labor_cost": 1500.00,
        "parts_cost": 3500.00,
        "total_cost": 5000.00,
        "odometer_reading": 145000,
        "next_maintenance_date": "2026-04-05",
        "created_by": 1,
        "created_at": "2026-01-05T10:00:00.000Z",
        "updated_at": "2026-01-05T10:00:00.000Z",
        "truck": {
          "id": 1,
          "plate_number": "ABC-1234"
        }
      }
    ]
  }
}
```

### Get Single Maintenance Record
```
GET /maintenance/:id
```

### Create Maintenance Record
```
POST /maintenance
```

**Request Body:**
```json
{
  "truck_id": 1,
  "date": "2026-01-05",
  "type": "repair",
  "category": "engine",
  "description": "Engine oil change and filter replacement",
  "service_provider": "ABC Auto Shop",
  "parts_used": "Oil filter, Engine oil 15W-40",
  "labor_cost": 1500.00,
  "parts_cost": 3500.00,
  "odometer_reading": 145000,
  "next_maintenance_date": "2026-04-05"
}
```

**Note:** `total_cost` is calculated automatically (labor_cost + parts_cost).

### Update Maintenance Record
```
PUT /maintenance/:id
```

### Delete Maintenance Record (Admin Only)
```
DELETE /maintenance/:id
```

### Get Maintenance History by Truck
```
GET /maintenance/history/:truck_id
```

### Get Maintenance Summary
```
GET /maintenance/summary?month=1&year=2026
```

---

## 6. Employee Endpoints

### Get All Employees
```
GET /employees?status=active
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employee_number": "EMP-001",
      "first_name": "Juan",
      "last_name": "Dela Cruz",
      "full_name": "Juan Dela Cruz",
      "position": "Driver",
      "contact_number": "09171234567",
      "email": "juan@example.com",
      "sss_number": "12-3456789-0",
      "pagibig_number": "1234567890",
      "philhealth_number": "12-345678901-2",
      "tin_number": "123-456-789-000",
      "employment_status": "active",
      "hire_date": "2020-01-15",
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

### Create Employee
```
POST /employees
```

### Update Employee
```
PUT /employees/:id
```

---

## 7. Payroll Endpoints

### Get All Payroll Entries
```
GET /payroll?status=pending&employee_id=1&week_start=2026-01-01
```

**Query Parameters:**
- `status` (optional): pending | approved | paid
- `employee_id` (optional): Filter by employee
- `week_start` (optional): Filter by week start date
- `month` (optional): Filter by month
- `year` (optional): Filter by year
- `page` (optional): Page number
- `per_page` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "employee_id": 1,
        "employee_name": "Juan Dela Cruz",
        "week_start": "2026-01-01",
        "week_end": "2026-01-07",
        "basic_pay": 3500.00,
        "overtime_hours": 5,
        "overtime_pay": 625.00,
        "meal_allowance": 500.00,
        "transportation_allowance": 300.00,
        "other_allowances": 0.00,
        "gross_pay": 4925.00,
        "sss_employee": 221.25,
        "pagibig_employee": 100.00,
        "philhealth_employee": 246.25,
        "loans": 0.00,
        "other_deductions": 0.00,
        "total_deductions": 567.50,
        "net_pay": 4357.50,
        "status": "pending",
        "payment_date": null,
        "payment_method": null,
        "notes": "",
        "approved_by": null,
        "approved_at": null,
        "paid_by": null,
        "paid_at": null,
        "created_by": 2,
        "created_at": "2026-01-05T14:00:00.000Z",
        "updated_at": "2026-01-05T14:00:00.000Z",
        "employee": {
          "id": 1,
          "full_name": "Juan Dela Cruz",
          "position": "Driver"
        }
      }
    ]
  }
}
```

### Get Single Payroll Entry
```
GET /payroll/:id
```

### Create Payroll Entry
```
POST /payroll
```

**Request Body:**
```json
{
  "employee_id": 1,
  "week_start": "2026-01-01",
  "week_end": "2026-01-07",
  "basic_pay": 3500.00,
  "overtime_hours": 5,
  "meal_allowance": 500.00,
  "transportation_allowance": 300.00,
  "other_allowances": 0.00,
  "loans": 0.00,
  "other_deductions": 0.00,
  "notes": ""
}
```

**Note:** All calculations (overtime_pay, gross_pay, deductions, net_pay) are done automatically.

### Update Payroll Entry
```
PUT /payroll/:id
```

**Note:** Only allowed if status is "pending".

### Approve Payroll (Admin Only)
```
POST /payroll/:id/approve
```

**Response:**
```json
{
  "success": true,
  "message": "Payroll approved successfully",
  "data": {
    "id": 1,
    "status": "approved",
    "approved_by": 1,
    "approved_at": "2026-01-05T15:30:00.000Z"
  }
}
```

### Mark Payroll as Paid (Admin Only)
```
POST /payroll/:id/mark-paid
```

**Request Body:**
```json
{
  "payment_date": "2026-01-06",
  "payment_method": "bank_transfer"
}
```

### Get Payroll Summary
```
GET /payroll/summary?month=1&year=2026
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_gross_pay": 180000.00,
    "total_deductions": 35000.00,
    "total_net_pay": 145000.00,
    "pending_count": 8,
    "approved_count": 12,
    "paid_count": 20
  }
}
```

### Get Payslip
```
GET /payroll/:id/payslip
```

**Response:** PDF or formatted payslip data

---

## 8. Government Contributions Endpoints

### Get All Contributions
```
GET /contributions?type=sss&month=2026-01&status=pending
```

**Query Parameters:**
- `type` (optional): sss | pagibig | philhealth
- `month` (optional): YYYY-MM format
- `year` (optional): Filter by year
- `status` (optional): pending | remitted
- `employee_id` (optional): Filter by employee
- `page` (optional): Page number
- `per_page` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "employee_id": 1,
        "employee_name": "Juan Dela Cruz",
        "month": "2026-01",
        "type": "sss",
        "monthly_compensation": 19700.00,
        "employee_share": 885.00,
        "employer_share": 1871.50,
        "total_contribution": 2756.50,
        "status": "pending",
        "remittance_date": null,
        "reference_number": null,
        "remitted_by": null,
        "created_at": "2026-01-31T23:59:59.000Z",
        "updated_at": "2026-01-31T23:59:59.000Z",
        "employee": {
          "id": 1,
          "full_name": "Juan Dela Cruz"
        }
      }
    ]
  }
}
```

### Get Single Contribution
```
GET /contributions/:id
```

### Mark as Remitted (Admin Only)
```
POST /contributions/:id/remit
```

**Request Body:**
```json
{
  "remittance_date": "2026-02-10",
  "reference_number": "SSS-202601-12345"
}
```

### Get Contribution Summary
```
GET /contributions/summary?month=2026-01
```

**Response:**
```json
{
  "success": true,
  "data": {
    "month": "2026-01",
    "sss_employee": 8850.00,
    "sss_employer": 18715.00,
    "sss_total": 27565.00,
    "pagibig_employee": 1000.00,
    "pagibig_employer": 1000.00,
    "pagibig_total": 2000.00,
    "philhealth_employee": 2462.50,
    "philhealth_employer": 2462.50,
    "philhealth_total": 4925.00,
    "total_contribution": 34490.00,
    "pending_count": 30,
    "remitted_count": 0
  }
}
```

---

## 9. Compliance Endpoints

### Get All Compliance Records
```
GET /compliance?status=active&truck_id=1
```

**Query Parameters:**
- `status` (optional): active | expiring_soon | expired | inactive
- `truck_id` (optional): Filter by truck
- `page` (optional): Page number
- `per_page` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "truck_id": 1,
        "registration_number": "REG-ABC-1234-2026",
        "registration_expiry": "2026-12-31",
        "registration_cost": 5000.00,
        "registration_renewal_date": "2025-12-15",
        "insurance_provider": "Manila Insurance Co.",
        "insurance_policy_number": "POL-123456",
        "insurance_expiry": "2026-06-30",
        "insurance_cost": 25000.00,
        "insurance_renewal_date": "2025-05-20",
        "smoke_emission_expiry": "2026-03-15",
        "smoke_emission_renewal_date": null,
        "lto_compliance_status": "compliant",
        "status": "active",
        "notes": "",
        "created_by": 1,
        "created_at": "2026-01-01T00:00:00.000Z",
        "updated_at": "2026-01-05T00:00:00.000Z",
        "truck": {
          "id": 1,
          "plate_number": "ABC-1234"
        }
      }
    ]
  }
}
```

### Get Single Compliance Record
```
GET /compliance/:id
```

### Create Compliance Record
```
POST /compliance
```

**Request Body:**
```json
{
  "truck_id": 1,
  "registration_number": "REG-ABC-1234-2026",
  "registration_expiry": "2026-12-31",
  "registration_cost": 5000.00,
  "insurance_provider": "Manila Insurance Co.",
  "insurance_policy_number": "POL-123456",
  "insurance_expiry": "2026-06-30",
  "insurance_cost": 25000.00,
  "smoke_emission_expiry": "2026-03-15",
  "lto_compliance_status": "compliant",
  "notes": ""
}
```

### Update Compliance Record
```
PUT /compliance/:id
```

### Delete Compliance Record (Admin Only)
```
DELETE /compliance/:id
```

### Get Compliance Alerts
```
GET /compliance/alerts
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "truck_id": 3,
      "truck_plate": "XYZ-9876",
      "alert_type": "insurance",
      "expiry_date": "2026-01-15",
      "days_remaining": 10,
      "severity": "warning"
    },
    {
      "truck_id": 5,
      "truck_plate": "DEF-5555",
      "alert_type": "registration",
      "expiry_date": "2026-01-03",
      "days_remaining": -2,
      "severity": "critical"
    }
  ]
}
```

---

## 10. Reports Endpoints

### Get Monthly Expense Report
```
GET /reports/expenses?month=1&year=2026
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "January 2026",
    "total_expenses": 450000.00,
    "expenses_by_category": [
      {
        "category": "fuel",
        "amount": 85000.00,
        "percentage": 18.89,
        "count": 45
      },
      {
        "category": "maintenance",
        "amount": 125000.00,
        "percentage": 27.78,
        "count": 15
      },
      {
        "category": "payroll",
        "amount": 180000.00,
        "percentage": 40.00,
        "count": 40
      },
      {
        "category": "contributions",
        "amount": 35000.00,
        "percentage": 7.78,
        "count": 120
      },
      {
        "category": "registration",
        "amount": 15000.00,
        "percentage": 3.33,
        "count": 3
      },
      {
        "category": "insurance",
        "amount": 10000.00,
        "percentage": 2.22,
        "count": 1
      }
    ],
    "month_over_month_comparison": [
      { "month": "2025-10", "amount": 380000.00 },
      { "month": "2025-11", "amount": 395000.00 },
      { "month": "2025-12", "amount": 420000.00 },
      { "month": "2026-01", "amount": 450000.00 }
    ]
  }
}
```

### Get Fuel Efficiency Report
```
GET /reports/fuel?truck_id=1&start_date=2026-01-01&end_date=2026-01-31
```

### Get Maintenance Report
```
GET /reports/maintenance?truck_id=1&start_date=2026-01-01&end_date=2026-01-31
```

### Get Payroll Report
```
GET /reports/payroll?start_date=2026-01-01&end_date=2026-01-31
```

### Get Contribution Report
```
GET /reports/contributions?month=2026-01
```

### Get Compliance Report
```
GET /reports/compliance
```

### Export Report
```
POST /reports/export
```

**Request Body:**
```json
{
  "report_type": "expenses",
  "format": "pdf",
  "filters": {
    "month": 1,
    "year": 2026
  }
}
```

**Response:** File download (PDF or Excel)

---

## Error Responses

### Validation Error (422)
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "truck_id": ["The truck id field is required."],
    "fuel_quantity": ["The fuel quantity must be greater than 0."]
  }
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Unauthenticated."
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "You do not have permission to perform this action."
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Resource not found."
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error."
}
```

---

## Rate Limiting

- **Default:** 60 requests per minute per user
- **Authentication:** 5 login attempts per minute per IP

**Rate Limit Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 57
X-RateLimit-Reset: 1641024000
```

---

## Pagination

All list endpoints support pagination with these parameters:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20, max: 100)

**Pagination Response:**
```json
{
  "current_page": 1,
  "per_page": 20,
  "total": 150,
  "last_page": 8,
  "from": 1,
  "to": 20
}
```

---

## Sorting

List endpoints support sorting:
- `sort_by`: Field name (e.g., created_at, date, total_cost)
- `sort_order`: asc | desc

Example:
```
GET /fuel-logs?sort_by=date&sort_order=desc
```

---

## Filtering

Use query parameters for filtering:
- Date ranges: `start_date`, `end_date`
- Status: `status`
- Search: `search`
- Relations: `truck_id`, `employee_id`

Example:
```
GET /maintenance?truck_id=1&type=repair&start_date=2026-01-01&end_date=2026-01-31
```
