"use client";

import Link from "next/link";
import { ArrowLeft, BarChart3, Download } from "lucide-react";
import AnalyticsDashboard from "@/components/analytics/analytics-dashboard";

export default function AnalyticsPage() {
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
                <BarChart3 size={15} />
                Operations Intelligence
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Operational Analytics & Financial Reports
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Monitor utilization, fuel efficiency, operating cost, and vehicle profitability from one reporting view.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
          >
            <Download size={18} />
            Export CSV
          </button>
        </header>

        <AnalyticsDashboard />
      </div>
    </main>
  );
}