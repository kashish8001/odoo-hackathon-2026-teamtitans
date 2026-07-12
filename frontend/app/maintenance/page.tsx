"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Wrench } from "lucide-react";
import MaintenanceTable from "@/components/maintenance/maintenance-table";
import NewServiceForm from "@/components/maintenance/new-service-form";

export default function MaintenancePage() {
  const [showNewServiceForm, setShowNewServiceForm] = useState(false);

  return (
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
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                <Wrench size={15} />
                Service Operations
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Maintenance & Service
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Track service work, identify vehicles in shop, and keep unavailable assets out of dispatch planning.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowNewServiceForm(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
          >
            <Plus size={18} />
            Create New Service
          </button>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <MaintenanceMetric label="Open Logs" value="12" tone="emerald" />
          <MaintenanceMetric label="In Progress" value="5" tone="amber" />
          <MaintenanceMetric label="Vehicles In Shop" value="8" tone="rose" />
          <MaintenanceMetric label="Monthly Cost" value="₹27k" tone="sky" />
        </section>

        <MaintenanceTable />

        {showNewServiceForm ? (
          <NewServiceForm closeModal={() => setShowNewServiceForm(false)} />
        ) : null}
      </div>
    </main>
  );
}

type MaintenanceMetricProps = {
  label: string;
  value: string;
  tone: "emerald" | "amber" | "rose" | "sky";
};

const metricTone: Record<MaintenanceMetricProps["tone"], string> = {
  emerald: "border-emerald-400/30 text-emerald-300",
  amber: "border-amber-400/30 text-amber-300",
  rose: "border-rose-400/30 text-rose-300",
  sky: "border-sky-400/30 text-sky-300",
};

function MaintenanceMetric({ label, value, tone }: MaintenanceMetricProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/4 p-4 shadow-2xl shadow-black/20">
      <div className={`mb-4 h-1 w-10 rounded-full border ${metricTone[tone]}`} />
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}