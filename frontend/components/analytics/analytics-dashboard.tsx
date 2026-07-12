"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const fuelEfficiencyData = [
  { month: "Jan", efficiency: 15 },
  { month: "Feb", efficiency: 20 },
  { month: "Mar", efficiency: 40 },
  { month: "Apr", efficiency: 30 },
  { month: "May", efficiency: 50 },
  { month: "Jun", efficiency: 60 },
  { month: "Jul", efficiency: 55 },
  { month: "Aug", efficiency: 70 },
  { month: "Sep", efficiency: 80 },
  { month: "Oct", efficiency: 65 },
  { month: "Nov", efficiency: 75 },
  { month: "Dec", efficiency: 85 },
];

const vehicleCostData = [
  { vehicle: "VAN-03", cost: 20 },
  { vehicle: "TRK-01", cost: 45 },
  { vehicle: "VAN-01", cost: 60 },
  { vehicle: "TRK-02", cost: 80 },
  { vehicle: "VAN-02", cost: 100 },
];

const financialSummaryData = [
  { month: "Jan", revenue: "₹17L", fuelCost: "₹6L", maintenance: "₹2L", netProfit: "₹9L", roi: "8.4%" },
  { month: "Feb", revenue: "₹19L", fuelCost: "₹7L", maintenance: "₹1L", netProfit: "₹11L", roi: "10.1%" },
  { month: "Mar", revenue: "₹22L", fuelCost: "₹8L", maintenance: "₹3L", netProfit: "₹11L", roi: "10.0%" },
  { month: "Apr", revenue: "₹18L", fuelCost: "₹6L", maintenance: "₹2L", netProfit: "₹10L", roi: "9.2%" },
  { month: "May", revenue: "₹25L", fuelCost: "₹9L", maintenance: "₹2L", netProfit: "₹14L", roi: "12.8%" },
  { month: "Jun", revenue: "₹28L", fuelCost: "₹10L", maintenance: "₹4L", netProfit: "₹14L", roi: "12.5%" },
];

const kpiCards = [
  { label: "Total Fuel Cost", value: "₹2.6L", tone: "amber" },
  { label: "Fleet ROI", value: "+12.5%", tone: "emerald" },
  { label: "Utilization Rate", value: "82%", tone: "violet" },
  { label: "Operational Cost", value: "₹4.1L", tone: "sky" },
] as const;

const kpiTone = {
  amber: "border-amber-400/30 text-amber-300",
  emerald: "border-emerald-400/30 text-emerald-300",
  violet: "border-violet-400/30 text-violet-300",
  sky: "border-sky-400/30 text-sky-300",
};

export default function AnalyticsDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Fuel Efficiency Trend (km/L)">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={fuelEfficiencyData} margin={{ left: -10, right: 12, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} cursor={{ stroke: "rgba(52,211,153,0.35)" }} />
              <Line
                type="monotone"
                dataKey="efficiency"
                stroke="#34d399"
                strokeWidth={3}
                dot={{ fill: "#34d399", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#34d399" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top 5 Costliest Vehicles">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={vehicleCostData} barSize={30} margin={{ left: -10, right: 12, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="vehicle" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="cost" fill="#34d399" radius={[6, 6, 0, 0]} opacity={0.9} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="overflow-hidden rounded-lg border border-white/10 bg-white/4 shadow-2xl shadow-black/20">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-base font-bold text-white">Financial Summary</h2>
          <p className="mt-1 text-sm text-slate-500">Revenue, fuel cost, maintenance spend, net profit, and ROI by month.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-215 border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-[0.14em] text-slate-500">
                <th className="px-5 py-3 font-semibold">Month</th>
                <th className="px-5 py-3 font-semibold">Revenue</th>
                <th className="px-5 py-3 font-semibold">Fuel Cost</th>
                <th className="px-5 py-3 font-semibold">Maintenance</th>
                <th className="px-5 py-3 font-semibold">Net Profit</th>
                <th className="px-5 py-3 font-semibold">Vehicle ROI</th>
              </tr>
            </thead>
            <tbody>
              {financialSummaryData.map((row) => (
                <tr key={row.month} className="border-b border-white/5 transition hover:bg-white/3">
                  <td className="px-5 py-4 text-sm font-semibold text-white">{row.month}</td>
                  <td className="px-5 py-4 font-mono text-sm text-slate-300">{row.revenue}</td>
                  <td className="px-5 py-4 font-mono text-sm text-amber-300">{row.fuelCost}</td>
                  <td className="px-5 py-4 font-mono text-sm text-rose-300">{row.maintenance}</td>
                  <td className="px-5 py-4 font-mono text-sm font-bold text-emerald-300">{row.netProfit}</td>
                  <td className="px-5 py-4 font-mono text-sm text-sky-300">{row.roi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

type KpiCardProps = (typeof kpiCards)[number];

function KpiCard({ label, value, tone }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/4 p-4 shadow-2xl shadow-black/20">
      <div className={`mb-4 h-1 w-10 rounded-full border ${kpiTone[tone]}`} />
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-bold ${kpiTone[tone]}`}>{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/4 p-5 shadow-2xl shadow-black/20">
      <h2 className="mb-5 text-base font-bold text-white">{title}</h2>
      {children}
    </div>
  );
}

const tooltipStyle = {
  background: "#16191f",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "#e2e8f0",
};

const tooltipLabelStyle = {
  color: "#94a3b8",
};