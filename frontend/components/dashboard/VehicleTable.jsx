"use client";
import { useState, useEffect } from "react";
import { vehiclesApi } from "@/lib/api";

// Map API status to display format
const statusMap = {
  "on_trip": "On Trip",
  "idle": "Idle",
  "maintenance": "Maintenance",
  "retired": "Retired",
};

const statusCfg = {
  "On Trip": "bg-[#00e5a0]/10 text-[#00e5a0]",
  "Idle": "bg-[#374151]/40 text-[#9ca3af]",
  "Maintenance": "bg-[#f59e0b]/10 text-[#f59e0b]",
  "Retired": "bg-[#ef4444]/10 text-[#ef4444]",
};

const dotCfg = {
  "On Trip": "bg-[#00e5a0]",
  "Idle": "bg-[#6b7280]",
  "Maintenance": "bg-[#f59e0b]",
  "Retired": "bg-[#ef4444]",
};

export default function VehicleTable({ onRefresh }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await vehiclesApi.getAll();
      // Transform API response to match component format
      const vehicles = (response.data || response || []).map(v => ({
        id: v.id,
        plate: v.license_plate,
        model: `${v.make} ${v.model}`,
        year: v.year,
        type: v.vehicle_type,
        capacity: v.max_load_capacity_kg ? `${v.max_load_capacity_kg} Kg` : "-",
        odometer: v.current_odometer_km || 0,
        status: statusMap[v.status] || v.status,
      }));
      setRows(vehicles);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [onRefresh]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await vehiclesApi.delete(id);
      setRows(r => r.filter(v => v.id !== id));
    } catch (err) {
      alert("Failed to delete vehicle: " + err.message);
    }
  };

  const handleEdit = (id) => { /* TODO: open edit modal */ };

  if (loading) {
    return (
      <div className="bg-[#18181c] border border-[#1f1f26] rounded-2xl p-16 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#00e5a0] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-[#6b7280] text-sm">Loading vehicles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#18181c] border border-[#1f1f26] rounded-2xl p-16 text-center">
        <p className="text-[#f87171] text-sm mb-4">Failed to load vehicles: {error}</p>
        <button onClick={fetchVehicles} className="px-4 py-2 bg-[#00e5a0] text-black rounded-lg text-sm font-medium">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#18181c] border border-[#1f1f26] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#1f1f26]">
              {["No", "Plate", "Model", "Type", "Capacity", "Odometer", "Status", "Actions"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-[#4b5563] uppercase tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((v, i) => (
              <tr
                key={v.id}
                className="border-b border-[#1a1a20] hover:bg-[#1c1c22] transition-colors cursor-pointer"
              >
                <td className="px-5 py-4 text-[13px] text-[#6b7280] font-semibold font-[DM_Mono]">{i + 1}</td>
                <td className="px-5 py-4 text-[13px] text-[#e5e7eb] font-[DM_Mono] font-medium">{v.plate}</td>
                <td className="px-5 py-4 text-[13px] text-[#d1d5db]">{v.model}</td>
                <td className="px-5 py-4 text-[13px] text-[#d1d5db]">{v.type}</td>
                <td className="px-5 py-4 text-[13px] text-[#d1d5db]">{v.capacity}</td>
                <td className="px-5 py-4 text-[13px] text-[#d1d5db] font-[DM_Mono]">
                  {v.odometer.toLocaleString()} km
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${statusCfg[v.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dotCfg[v.status]}`} />
                    {v.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEdit(v.id)}
                      className="text-[12px] text-[#6b7280] hover:text-[#00e5a0] transition-colors font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="text-[12px] text-[#6b7280] hover:text-[#f87171] transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="text-center py-16 text-[#4b5563] text-sm">
            No vehicles registered yet.
          </div>
        )}
      </div>
    </div>
  );
}