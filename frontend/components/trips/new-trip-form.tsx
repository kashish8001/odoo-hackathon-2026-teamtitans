"use client";

import { FormEvent, useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { vehiclesApi, driversApi, tripsApi } from "@/lib/api";

type NewTripFormProps = {
  closeModal: () => void;
  onSuccess: () => void;
};

type VehicleOption = {
  id: number;
  label: string;
  license_plate: string;
  max_load_capacity_kg: string;
  status: string;
};

type DriverOption = {
  id: number;
  label: string;
  license_number: string;
  duty_status: string;
};

export default function NewTripForm({ closeModal, onSuccess }: NewTripFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [cargoWeight, setCargoWeight] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [distance, setDistance] = useState("");
  const [scheduledDeparture, setScheduledDeparture] = useState("");
  const [revenue, setRevenue] = useState("0");

  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true);
      setError(null);
      try {
        const [vehiclesRes, driversRes] = await Promise.all([
          vehiclesApi.getOptions(),
          driversApi.getOptions(),
        ]);
        // Only show idle vehicles
        setVehicles(vehiclesRes.filter((v: VehicleOption) => v.status === "idle"));
        // Only show drivers not suspended and not on duty
        setDrivers(driversRes.filter((d: DriverOption) => d.duty_status !== "suspended" && d.duty_status !== "on_duty"));
      } catch (err: unknown) {
        console.error("Failed to load dispatch options:", err);
        setError("Failed to fetch vehicles or drivers list. Ensure the backend is running.");
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!vehicleId || !driverId || !cargoWeight || !origin || !destination || !scheduledDeparture) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        vehicle_id: parseInt(vehicleId, 10),
        driver_id: parseInt(driverId, 10),
        cargo_weight_kg: parseFloat(cargoWeight),
        origin: origin.trim(),
        destination: destination.trim(),
        distance_km: distance ? parseFloat(distance) : null,
        revenue: revenue ? parseFloat(revenue) : 0,
        scheduled_departure: new Date(scheduledDeparture).toISOString(),
      };

      await tripsApi.create(payload);
      onSuccess();
    } catch (err: unknown) {
      console.error(err);
      const errorMsg = err instanceof Error ? err.message : "Failed to dispatch trip";
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && closeModal()}
    >
      <div className="w-full max-w-3xl overflow-hidden rounded-lg border border-white/10 bg-[#16191f] shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Dispatch Entry
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">New Trip Form</h2>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-slate-400 transition hover:text-white"
            aria-label="Close new trip form"
          >
            <X size={18} />
          </button>
        </div>

        {loadingOptions ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-emerald-400" size={36} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
            {error && (
              <div className="rounded-md border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Select Vehicle (Available Only)" htmlFor="select-vehicle">
                <select
                  id="select-vehicle"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="" disabled>Select a vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label} (Max Load: {v.max_load_capacity_kg} kg)
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Cargo Weight (kg)" htmlFor="cargo-weight">
                <input
                  id="cargo-weight"
                  type="number"
                  min="1"
                  value={cargoWeight}
                  onChange={(e) => setCargoWeight(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 450"
                  required
                />
              </Field>

              <Field label="Select Driver (Eligible Only)" htmlFor="select-driver">
                <select
                  id="select-driver"
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="" disabled>Select a driver</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label} (Lic: {d.license_number})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Scheduled Departure" htmlFor="scheduled-departure">
                <input
                  id="scheduled-departure"
                  type="datetime-local"
                  value={scheduledDeparture}
                  onChange={(e) => setScheduledDeparture(e.target.value)}
                  className={inputClass}
                  required
                />
              </Field>

              <Field label="Origin Address" htmlFor="origin-address">
                <input
                  id="origin-address"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className={inputClass}
                  placeholder="Mumbai warehouse"
                  required
                />
              </Field>

              <Field label="Destination" htmlFor="destination">
                <input
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className={inputClass}
                  placeholder="Pune distribution hub"
                  required
                />
              </Field>

              <Field label="Planned Distance (km)" htmlFor="planned-distance">
                <input
                  id="planned-distance"
                  type="number"
                  min="1"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 148"
                />
              </Field>

              <Field label="Estimated Revenue (INR)" htmlFor="revenue">
                <input
                  id="revenue"
                  type="number"
                  min="0"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 25000"
                />
              </Field>
            </div>

            <div className="rounded-md border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-100">
              Dispatch checks will verify vehicle availability, driver eligibility, and cargo capacity before confirmation.
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="h-10 rounded-md border border-white/10 px-5 text-sm font-semibold text-slate-300 transition hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-10 rounded-md bg-emerald-400 px-5 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                {isSubmitting ? "Dispatching..." : "Confirm & Dispatch Trip"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
};

const inputClass = "mt-2 h-11 w-full rounded-md border border-white/10 bg-[#0f1115] px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/20";

function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-300">
        {label}
      </label>
      {children}
    </div>
  );
}