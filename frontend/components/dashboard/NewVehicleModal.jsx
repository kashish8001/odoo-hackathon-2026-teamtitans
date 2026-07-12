"use client";
import { useState } from "react";
import { vehiclesApi } from "@/lib/api";

const initialForm = {
  licensePlate: "",
  make: "",
  model: "",
  year: "",
  vehicleType: "",
  fuelType: "",
  maxPayload: "",
  initialOdometer: "",
};

const vehicleTypes = ["truck", "van", "trailer", "tanker", "pickup", "bus", "other"];
const fuelTypes = ["diesel", "petrol", "cng", "electric", "hybrid"];

// ── Field component ──────────────────────────────────────────────────────────
const Field = ({ label, name, value, onChange, placeholder = "", type = "text" }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[13px] font-medium text-[#9ca3af]">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="
        w-full bg-[#111114] border border-[#2a2a34] rounded-lg
        px-3 h-10 text-[13px] text-[#e5e7eb] font-[DM_Mono]
        placeholder:text-[#3d3d4a] outline-none
        focus:border-[#00e5a0] focus:ring-1 focus:ring-[#00e5a0]/20
        transition-all
      "
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, placeholder }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[13px] font-medium text-[#9ca3af]">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="
        w-full bg-[#111114] border border-[#2a2a34] rounded-lg
        px-3 h-10 text-[13px] text-[#e5e7eb]
        outline-none focus:border-[#00e5a0] focus:ring-1 focus:ring-[#00e5a0]/20
        transition-all
      "
    >
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
      ))}
    </select>
  </div>
);

// ── NewVehicleModal ───────────────────────────────────────────────────────────
export default function NewVehicleModal({ onClose, onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setError(null);

    // Basic validation
    if (!form.licensePlate || !form.vehicleType) {
      setError("License plate and vehicle type are required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        license_plate: form.licensePlate,
        make: form.make || "Unknown",
        model: form.model || "Unknown",
        year: form.year ? parseInt(form.year) : new Date().getFullYear(),
        vehicle_type: form.vehicleType,
        fuel_type: form.fuelType || "diesel",
        max_load_capacity_kg: form.maxPayload ? parseFloat(form.maxPayload) * 1000 : null, // Convert tons to kg
        current_odometer_km: form.initialOdometer ? parseFloat(form.initialOdometer) : 0,
      };

      await vehiclesApi.create(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create vehicle");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && handleCancel()}
    >
      {/* Modal card */}
      <div className="
        bg-[#18181c] border border-[#27272e] rounded-2xl
        w-full max-w-md mx-4 shadow-2xl shadow-black/60
        flex flex-col overflow-hidden
      ">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1f1f26]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00e5a0]/10 flex items-center justify-center">
              <svg width="16" height="16" fill="none" stroke="#00e5a0" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <h2 className="text-[15px] font-bold text-[#f0f0f5]">New Vehicle Registration</h2>
          </div>
          <button
            onClick={handleCancel}
            className="w-7 h-7 rounded-lg bg-[#111114] border border-[#27272e] flex items-center justify-center text-[#6b7280] hover:text-[#d1d5db] transition-colors"
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form body */}
        <div className="px-6 py-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-[13px]">
              {error}
            </div>
          )}
          <Field
            label="License Plate *"
            name="licensePlate"
            value={form.licensePlate}
            onChange={handleChange}
            placeholder="e.g. MH-12-AB-1234"
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Make"
              name="make"
              value={form.make}
              onChange={handleChange}
              placeholder="e.g. TATA, Ashok Leyland"
            />
            <Field
              label="Model"
              name="model"
              value={form.model}
              onChange={handleChange}
              placeholder="e.g. 407, Prima"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Year"
              name="year"
              type="number"
              value={form.year}
              onChange={handleChange}
              placeholder="e.g. 2022"
            />
            <SelectField
              label="Vehicle Type *"
              name="vehicleType"
              value={form.vehicleType}
              onChange={handleChange}
              options={vehicleTypes}
              placeholder="Select type"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Fuel Type"
              name="fuelType"
              value={form.fuelType}
              onChange={handleChange}
              options={fuelTypes}
              placeholder="Select fuel"
            />
            <Field
              label="Max Payload (Tons)"
              name="maxPayload"
              type="number"
              value={form.maxPayload}
              onChange={handleChange}
              placeholder="e.g. 10"
            />
          </div>
          <Field
            label="Initial Odometer (km)"
            name="initialOdometer"
            type="number"
            value={form.initialOdometer}
            onChange={handleChange}
            placeholder="e.g. 45000"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1f1f26] flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="
              px-5 h-9 rounded-lg text-[13px] font-semibold
              bg-transparent border border-[#27272e] text-[#9ca3af]
              hover:border-[#3d3d4a] hover:text-[#d1d5db] transition-all
            "
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="
              px-5 h-9 rounded-lg text-[13px] font-bold
              bg-[#00e5a0] text-[#0a0a0c]
              hover:opacity-90 disabled:opacity-50 transition-all
              flex items-center gap-2
            "
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="13" height="13" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving…
              </>
            ) : "Save Vehicle"}
          </button>
        </div>
      </div>
    </div>
  );
}