"use client";

import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { tripsApi } from "@/lib/api";

type Trip = {
  id: number;
  vehicle_id: number;
  driver_id: number;
  cargo_weight_kg: string;
  origin: string;
  destination: string;
  distance_km: number | null;
  revenue: string;
  status: string;
  scheduled_departure: string;
  actual_arrival: string | null;
  vehicle_plate: string;
  vehicle_model: string;
  vehicle_type: string;
  driver_name: string;
};

const statusLabels: Record<string, string> = {
  scheduled: "Scheduled",
  in_transit: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusStyle: Record<string, string> = {
  scheduled: "bg-amber-400/10 text-amber-300 ring-amber-300/20",
  in_transit: "bg-emerald-400/10 text-emerald-300 ring-emerald-300/20",
  delivered: "bg-sky-400/10 text-sky-300 ring-sky-300/20",
  cancelled: "bg-rose-400/10 text-rose-300 ring-rose-300/20",
};

interface TripTableProps {
  onRefresh?: () => void;
}

export default function TripTable({ onRefresh }: TripTableProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  const fetchTrips = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await tripsApi.getAll();
      const list = response.data || response || [];
      setTrips(list);
    } catch (err: unknown) {
      console.error(err);
      const errorMsg = err instanceof Error ? err.message : "Failed to load trips from database";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTrips(false);
  }, []);

  const handleStart = async (id: number) => {
    setActionInProgress(id);
    try {
      await tripsApi.start(id);
      await fetchTrips();
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An unknown error occurred";
      alert(`Failed to start trip: ${errorMsg}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleComplete = async (id: number) => {
    const odoStr = prompt("Enter final odometer reading (km) for the vehicle:");
    if (odoStr === null) return;
    const odo = parseFloat(odoStr);
    if (isNaN(odo) || odo < 0) {
      alert("Please enter a valid odometer number.");
      return;
    }

    setActionInProgress(id);
    try {
      await tripsApi.complete(id, odo);
      await fetchTrips();
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An unknown error occurred";
      alert(`Failed to complete trip: ${errorMsg}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this trip?")) return;
    setActionInProgress(id);
    try {
      await tripsApi.cancel(id);
      await fetchTrips();
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An unknown error occurred";
      alert(`Failed to cancel trip: ${errorMsg}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.vehicle_model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.vehicle_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter ? trip.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

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
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-md border border-white/10 bg-[#0f1115] pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-300 sm:w-64"
            />
          </label>
          <div className="flex gap-2">
            <select
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="h-10 rounded-md border border-white/10 bg-[#0f1115] px-3 text-sm font-semibold text-slate-300 outline-none transition focus:border-emerald-300"
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ToolbarButton onClick={() => fetchTrips()}>Refresh</ToolbarButton>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="animate-spin text-emerald-400" size={32} />
          </div>
        ) : error ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 px-4 text-center">
            <p className="text-sm text-rose-400">{error}</p>
            <button
              onClick={() => fetchTrips()}
              className="rounded bg-emerald-400 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-emerald-300"
            >
              Retry
            </button>
          </div>
        ) : (
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
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map((trip) => (
                <tr key={trip.id} className="border-b border-white/5 transition hover:bg-white/3">
                  <td className="px-5 py-4 text-sm font-semibold text-white capitalize">{trip.vehicle_type || "Truck"}</td>
                  <td className="px-5 py-4 font-mono text-sm text-slate-300">
                    <span className="block font-semibold">{trip.vehicle_plate}</span>
                    <span className="block text-xs text-slate-500">{trip.vehicle_model}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-300">{trip.driver_name}</td>
                  <td className="px-5 py-4 text-sm text-slate-400">{trip.origin}</td>
                  <td className="px-5 py-4 text-sm text-slate-400">{trip.destination}</td>
                  <td className="px-5 py-4 font-mono text-sm text-slate-300">{trip.cargo_weight_kg} kg</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyle[trip.status]}`}>
                      {statusLabels[trip.status] || trip.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {trip.status === "scheduled" && (
                        <>
                          <button
                            disabled={actionInProgress !== null}
                            onClick={() => handleStart(trip.id)}
                            className="rounded bg-emerald-400 px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
                          >
                            Start
                          </button>
                          <button
                            disabled={actionInProgress !== null}
                            onClick={() => handleCancel(trip.id)}
                            className="rounded border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {trip.status === "in_transit" && (
                        <>
                          <button
                            disabled={actionInProgress !== null}
                            onClick={() => handleComplete(trip.id)}
                            className="rounded bg-sky-400 px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-sky-300 disabled:opacity-50"
                          >
                            Complete
                          </button>
                          <button
                            disabled={actionInProgress !== null}
                            onClick={() => handleCancel(trip.id)}
                            className="rounded border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {trip.status !== "scheduled" && trip.status !== "in_transit" && (
                        <span className="text-xs text-slate-600 font-semibold">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTrips.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-sm text-slate-500">
                    No matching dispatches in queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function ToolbarButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-10 rounded-md border border-white/10 px-3 text-sm font-semibold text-slate-300 transition hover:border-emerald-300/50 hover:text-emerald-200"
    >
      {children}
    </button>
  );
}