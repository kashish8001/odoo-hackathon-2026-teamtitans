"use client";

import { Search } from "lucide-react";
import { useState } from "react";

const maintenanceData = [
  {
    logId: 321,
    vehicle: "TATA 407",
    issue: "Engine Issue",
    date: "20/02/2025",
    cost: "₹10,000",
    status: "New",
  },
  {
    logId: 322,
    vehicle: "Ashok Leyland",
    issue: "Brake Replacement",
    date: "18/02/2025",
    cost: "₹6,500",
    status: "In Progress",
  },
  {
    logId: 323,
    vehicle: "MH-12-AB-1234",
    issue: "Oil Change",
    date: "15/02/2025",
    cost: "₹2,200",
    status: "Completed",
  },
  {
    logId: 324,
    vehicle: "GJ-01-CD-5678",
    issue: "Tyre Puncture",
    date: "12/02/2025",
    cost: "₹800",
    status: "Completed",
  },
  {
    logId: 325,
    vehicle: "DL-03-EF-9012",
    issue: "AC Repair",
    date: "10/02/2025",
    cost: "₹4,500",
    status: "In Progress",
  },
  {
    logId: 326,
    vehicle: "KA-05-GH-3456",
    issue: "Battery Dead",
    date: "08/02/2025",
    cost: "₹3,200",
    status: "New",
  },
];

const statusStyle: Record<string, string> = {
  New: "bg-sky-400/10 text-sky-300 ring-sky-300/20",
  "In Progress": "bg-amber-400/10 text-amber-300 ring-amber-300/20",
  Completed: "bg-emerald-400/10 text-emerald-300 ring-emerald-300/20",
  Cancelled: "bg-rose-400/10 text-rose-300 ring-rose-300/20",
};

export default function MaintenanceTable() {
  const [search, setSearch] = useState("");

  const filtered = maintenanceData.filter(
    (record) =>
      record.vehicle.toLowerCase().includes(search.toLowerCase()) ||
      record.issue.toLowerCase().includes(search.toLowerCase()) ||
      record.status.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <section className="overflow-hidden rounded-lg border border-white/10 bg-white/4 shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Maintenance Logs</h2>
          <p className="mt-1 text-sm text-slate-500">Active service records and recent workshop history.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search vehicle or issue"
              className="h-10 w-full rounded-md border border-white/10 bg-[#0f1115] pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-300 sm:w-64"
            />
          </label>
          <div className="flex gap-2">
            <ToolbarButton>Filter</ToolbarButton>
            <ToolbarButton>Sort</ToolbarButton>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-215 border-collapse text-left">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-[0.14em] text-slate-500">
              <th className="px-5 py-3 font-semibold">Log ID</th>
              <th className="px-5 py-3 font-semibold">Vehicle</th>
              <th className="px-5 py-3 font-semibold">Issue / Service</th>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Cost</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((record) => (
              <tr key={record.logId} className="border-b border-white/5 transition hover:bg-white/3">
                <td className="px-5 py-4 font-mono text-sm font-semibold text-slate-500">#{record.logId}</td>
                <td className="px-5 py-4 font-mono text-sm text-white">{record.vehicle}</td>
                <td className="px-5 py-4 text-sm text-slate-300">{record.issue}</td>
                <td className="px-5 py-4 font-mono text-sm text-slate-400">{record.date}</td>
                <td className="px-5 py-4 font-mono text-sm text-slate-300">{record.cost}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyle[record.status]}`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-3">
                    <button type="button" className="text-sm font-semibold text-slate-400 transition hover:text-emerald-300">
                      Edit
                    </button>
                    <button type="button" className="text-sm font-semibold text-slate-400 transition hover:text-rose-300">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-500">
                  No maintenance records match your search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ToolbarButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="h-10 rounded-md border border-white/10 px-3 text-sm font-semibold text-slate-300 transition hover:border-emerald-300/50 hover:text-emerald-200"
    >
      {children}
    </button>
  );
}