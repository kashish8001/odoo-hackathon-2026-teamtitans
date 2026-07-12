"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import NewTripForm from "@/components/trips/new-trip-form";
import TripTable from "@/components/trips/trip-table";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { tripsApi, vehiclesApi } from "@/lib/api";

export default function TripsPage() {
  const [showNewTripForm, setShowNewTripForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [metrics, setMetrics] = useState({
    activeTrips: 0,
    pendingDispatch: 0,
    availableVehicles: 0,
    onTimeRate: "95%",
  });

  useEffect(() => {
    async function loadMetrics() {
      try {
        const tripsRes = await tripsApi.getAll();
        const tripsList = tripsRes.data || tripsRes || [];
        
        const active = tripsList.filter((t: { status: string }) => t.status === "in_transit").length;
        const pending = tripsList.filter((t: { status: string }) => t.status === "scheduled").length;

        // Fetch vehicles options to count available (idle) ones
        const vehicles = await vehiclesApi.getOptions();
        const available = vehicles.filter((v: { status: string }) => v.status === "idle").length;

        setMetrics({
          activeTrips: active,
          pendingDispatch: pending,
          availableVehicles: available,
          onTimeRate: "95%",
        });
      } catch (err) {
        console.error("Failed to load metrics:", err);
      }
    }
    loadMetrics();
  }, [refreshKey]);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#0f1115] px-6 py-6 text-slate-100 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <header className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-emerald-300"
              >
                <ArrowLeft size={16} />
                Back to dashboard
              </Link>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  Dispatch Operations
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Trip Dispatcher & Management
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Create dispatches, monitor route progress, and keep vehicles and drivers from being double-booked.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowNewTripForm(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
            >
              <Plus size={18} />
              New Trip
            </button>
          </header>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <TripMetric label="Active Trips" value={String(metrics.activeTrips)} tone="emerald" />
            <TripMetric label="Pending Dispatch" value={String(metrics.pendingDispatch)} tone="amber" />
            <TripMetric label="Available Vehicles" value={String(metrics.availableVehicles)} tone="sky" />
            <TripMetric label="On-Time Rate" value={metrics.onTimeRate} tone="violet" />
          </section>

          <TripTable onRefresh={() => setRefreshKey(k => k + 1)} />

          {showNewTripForm ? (
            <NewTripForm 
              closeModal={() => setShowNewTripForm(false)} 
              onSuccess={() => {
                setRefreshKey(k => k + 1);
                setShowNewTripForm(false);
              }}
            />
          ) : null}
        </div>
      </main>
    </ProtectedRoute>
  );
}

type TripMetricProps = {
  label: string;
  value: string;
  tone: "emerald" | "amber" | "sky" | "violet";
};

const metricTone: Record<TripMetricProps["tone"], string> = {
  emerald: "border-emerald-400/30 text-emerald-300",
  amber: "border-amber-400/30 text-amber-300",
  sky: "border-sky-400/30 text-sky-300",
  violet: "border-violet-400/30 text-violet-300",
};

function TripMetric({ label, value, tone }: TripMetricProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20">
      <div className={`mb-4 h-1 w-10 rounded-full border ${metricTone[tone]}`} />
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}