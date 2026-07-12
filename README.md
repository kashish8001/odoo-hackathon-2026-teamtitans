# TransitOps - Smart Transport Operations Platform

Odoo Hackathon 2026 submission by **Team Titans**.

TransitOps is an end-to-end fleet and transport operations platform for logistics teams that still rely on spreadsheets, phone calls, and manual logbooks. The project centralizes vehicle registry, driver compliance, dispatching, maintenance, fuel logging, expenses, and operational analytics into one responsive web interface.

The goal is to help fleet managers, dispatchers, safety officers, and finance teams make faster operational decisions while enforcing the business rules that prevent double-booked vehicles, overloaded trips, expired-license assignments, and missed maintenance.

## Problem Statement

Logistics companies often struggle with fragmented transport operations:

- Vehicle availability is tracked manually and becomes outdated quickly.
- Drivers can be assigned even when their license is expired or they are unavailable.
- Trips may be dispatched with overloaded cargo or already-assigned vehicles.
- Maintenance logs are disconnected from dispatch decisions.
- Fuel and maintenance expenses are difficult to connect back to vehicle profitability.
- Managers lack real-time KPIs for utilization, operating cost, and performance.

TransitOps solves this by creating a single operational system with workflow validation, automatic status transitions, and analytics built around the actual fleet lifecycle.

## Core Modules

### Dashboard

The dashboard provides a high-level view of fleet operations, including active fleet count, maintenance alerts, pending trips, utilization rate, and cost-focused performance indicators.

### Vehicle Registry

Fleet managers can maintain vehicle master data such as registration number, model, vehicle type, load capacity, odometer reading, acquisition cost, and current status. Vehicle registration numbers are unique, and only available vehicles are eligible for dispatch.

### Driver Management

Driver profiles track license number, license category, license expiry, contact details, safety score, and duty status. The system is designed to prevent suspended drivers or drivers with expired licenses from being assigned to trips.

### Trip Dispatch

Trips are created by selecting a source, destination, available vehicle, available driver, cargo weight, and planned distance. Dispatch validations ensure that cargo weight does not exceed vehicle capacity and that a driver or vehicle already on a trip cannot be reused.

### Maintenance Workflow

Creating an active maintenance record automatically marks the vehicle as in shop, removing it from the dispatch selection pool. Closing maintenance restores the vehicle to available unless the vehicle has been retired.

### Fuel and Expense Tracking

The platform records fuel logs, maintenance costs, tolls, parking, fines, and miscellaneous expenses. Fuel logs calculate total fuel cost and update vehicle odometer data for operational reporting.

### Reports and Analytics

Analytics cover fuel efficiency, fleet utilization, vehicle operating cost, driver performance, monthly financial summaries, and vehicle ROI using:

```text
ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
```

## Business Rules

TransitOps is designed around strict operational rules:

- Vehicle registration numbers must be unique.
- Retired or in-shop vehicles must not appear in dispatch selection.
- Suspended drivers and drivers with expired licenses cannot be assigned.
- A driver or vehicle already on trip cannot be assigned to another trip.
- Cargo weight must not exceed maximum vehicle load capacity.
- Dispatching a trip changes both vehicle and driver status to on trip.
- Completing a trip restores both vehicle and driver status to available.
- Cancelling a dispatched trip restores vehicle and driver availability.
- Creating active maintenance changes vehicle status to in shop.
- Closing maintenance restores vehicle status to available unless retired.

## Technology Stack

### Frontend

- Next.js
- React
- Tailwind CSS
- Recharts for analytics charts

### Database

- PostgreSQL
- Normalized relational schema
- SQL triggers for business-rule enforcement
- SQL views for dashboard, analytics, and driver performance summaries

### Tooling

- Git and GitHub
- ESLint
- npm

## Current Implementation

The current codebase includes a Next.js frontend prototype and a PostgreSQL schema for the core transport operations domain.

Implemented or designed areas include:

- Vehicle registry UI
- Trip dispatcher UI
- Maintenance log UI
- Fuel and expense UI
- Driver performance UI
- Analytics dashboard with charts
- PostgreSQL tables for users, vehicles, drivers, trips, maintenance logs, fuel logs, expenses, driver complaints, and vehicle documents
- Database triggers for cargo capacity, driver eligibility, vehicle availability, trip status sync, maintenance status sync, and odometer updates
- Database views for KPIs, vehicle cost summary, driver performance, and monthly financial reporting

Areas planned for completion:

- Full authentication and role-based access control
- API/database integration for frontend forms
- Complete CRUD flows for vehicles and drivers
- End-to-end trip lifecycle actions
- CSV export for reports
- Production-ready validation messages and error handling

## Project Structure

```text
transitops/
├── database/
│   ├── DATABASE_SCHEMA.md
│   └── schema.sql
└── frontend/
    ├── package.json
    ├── src/app/
    │   ├── dashboard/
    │   ├── trips/
    │   ├── maintenance/
    │   ├── expenses/
    │   ├── performance/
    │   └── analytics/
    └── src/components/
        ├── dashboard/
        ├── trips/
        ├── maintenance/
        ├── expenses/
        ├── performance/
        └── analytics/
```

## Getting Started

Install frontend dependencies:

```bash
cd transitops/frontend
npm install
```

Run the development server:

```bash
npm run dev
```

Open the app at:

```text
http://localhost:3000
```

## Team Workflow

- Each contributor works through GitHub with meaningful commits.
- Stable work is merged into the main branch.
- Features are organized around the major TransitOps modules.
- Database rules are kept close to the schema so critical workflow constraints cannot be bypassed by UI bugs.

## Team Members

- Kashish Sahu - Team Leader
- Jenil Parmar
- Yashvi Khatri
- Diya Gupta

## Hackathon Status

TransitOps is under active development for the Odoo Hackathon 2026. The repository currently demonstrates the product direction, domain model, frontend screens, analytics concepts, and database-level business-rule design needed for a smart transport operations platform.

## License

Developed as part of the Odoo Hackathon 2026.