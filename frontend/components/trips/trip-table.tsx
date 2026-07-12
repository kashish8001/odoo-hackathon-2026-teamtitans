"use client";

import { Search } from "lucide-react";

const tripData = [
  {
    id: 1,
    fleetType: "Trailer Truck",
    vehicle: "TRK-12",
    driver: "Alex Morgan",
    origin: "Mumbai",
    destination: "Pune",
    cargoWeight: "450 kg",
    status: "Dispatched",
  },
  {
    id: 2,
    fleetType: "Cargo Van",
    vehicle: "VAN-05",
    driver: "Priya Nair",
    origin: "Ahmedabad",
    destination: "Surat",
    cargoWeight: "320 kg",
    status: "Draft",
  },
  {
    id: 3,
    fleetType: "Container Truck",
    vehicle: "CNT-08",
    driver: "Ravi Mehta",
    origin: "Delhi",
    destination: "Jaipur",
    cargoWeight: "1,900 kg",
    status: "Completed",
  },
];

const statusStyle: Record<string, string> = {
  Draft: "bg-slate-500/10 text-slate-300 ring-slate-400/20",
  Dispatched: "bg-emerald-400/10 text-emerald-300 ring-emerald-300/20",
  Completed: "bg-sky-400/10 text-sky-300 ring-sky-300/20",
  Cancelled: "bg-rose-400/10 text-rose-300 ring-rose-300/20",
};

export default function TripTable() {
  return (
    <section className="overflow-hidden rounded-lg border border-white/10 bg-white/4 shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Trip Queue</h2>
          <p className="mt-1 text-sm text-slate-500">Live dispatch board for planned and active routes.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="search"
              placeholder="Search trips"
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
              <th className="px-5 py-3 font-semibold">Fleet Type</th>
              <th className="px-5 py-3 font-semibold">Vehicle</th>
              <th className="px-5 py-3 font-semibold">Driver</th>
              <th className="px-5 py-3 font-semibold">Origin</th>
              <th className="px-5 py-3 font-semibold">Destination</th>
              <th className="px-5 py-3 font-semibold">Cargo</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {tripData.map((trip) => (
              <tr key={trip.id} className="border-b border-white/5 transition hover:bg-white/3">
                <td className="px-5 py-4 text-sm font-semibold text-white">{trip.fleetType}</td>
                <td className="px-5 py-4 font-mono text-sm text-slate-300">{trip.vehicle}</td>
                <td className="px-5 py-4 text-sm text-slate-300">{trip.driver}</td>
                <td className="px-5 py-4 text-sm text-slate-400">{trip.origin}</td>
                <td className="px-5 py-4 text-sm text-slate-400">{trip.destination}</td>
                <td className="px-5 py-4 font-mono text-sm text-slate-300">{trip.cargoWeight}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyle[trip.status]}`}>
                    {trip.status}
                  </span>
                </td>
              </tr>
            ))}
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