// ── Dummy Data ──────────────────────────────────────────────────────────────
// Replace with real API calls when ready

export const stats = [
  { label: "Active Fleet",      value: 220, color: "#00e5a0" },
  { label: "Maintenance Alert", value: 180, color: "#f59e0b" },
  { label: "Pending Cargo",     value: 20,  color: "#a78bfa" },
];

export const trips = [
  { id: 1,  vehicle: "MH-12-AB-1234", driver: "John Doe",     status: "On Trip"    },
  { id: 2,  vehicle: "GJ-01-CD-5678", driver: "Ravi Mehta",   status: "Idle"       },
  { id: 3,  vehicle: "DL-03-EF-9012", driver: "Amir Khan",    status: "On Trip"    },
  { id: 4,  vehicle: "KA-05-GH-3456", driver: "Priya Nair",   status: "Maintenance"},
  { id: 5,  vehicle: "MH-14-IJ-7890", driver: "Sara Thomas",  status: "Idle"       },
  { id: 6,  vehicle: "RJ-09-KL-2345", driver: "Deepak Rao",   status: "On Trip"    },
  { id: 7,  vehicle: "TN-07-MN-6789", driver: "Neha Sharma",  status: "Idle"       },
  { id: 8,  vehicle: "AP-11-OP-0123", driver: "Vijay Singh",  status: "Maintenance"},
];

export const navItems = [
  { label: "Dashboard",        icon: "grid",     href: "/dashboard" },

  { label: "Trip Dispatcher",  icon: "map",      href: "/trips" },
  { label: "Maintenance",      icon: "tool",     href: "/maintenance" },
  { label: "Trip & Expense",   icon: "receipt",  href: "/expenses" },
  { label: "Performance",      icon: "bar-chart",href: "/performance" },
  { label: "Analytics",        icon: "pie-chart",href: "/analytics" },
];