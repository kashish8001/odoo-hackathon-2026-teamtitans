"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";

type NewTripFormProps = {
  closeModal: () => void;
};

export default function NewTripForm({ closeModal }: NewTripFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setIsSubmitting(false);
    closeModal();
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

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Select Vehicle" htmlFor="select-vehicle">
              <select id="select-vehicle" name="select-vehicle" className={inputClass} defaultValue="">
                <option value="" disabled>Select a vehicle</option>
                <option>Van-05 - Available - 500 kg</option>
                <option>Truck-12 - Available - 2,500 kg</option>
              </select>
            </Field>

            <Field label="Cargo Weight (kg)" htmlFor="cargo-weight">
              <input id="cargo-weight" name="cargo-weight" type="number" min="1" className={inputClass} placeholder="450" />
            </Field>

            <Field label="Select Driver" htmlFor="select-driver">
              <select id="select-driver" name="select-driver" className={inputClass} defaultValue="">
                <option value="" disabled>Select a driver</option>
                <option>Alex Morgan - Valid License</option>
                <option>Priya Nair - Valid License</option>
              </select>
            </Field>

            <Field label="Origin Address" htmlFor="origin-address">
              <input id="origin-address" name="origin-address" className={inputClass} placeholder="Mumbai warehouse" />
            </Field>

            <Field label="Destination" htmlFor="destination">
              <input id="destination" name="destination" className={inputClass} placeholder="Pune distribution hub" />
            </Field>

            <Field label="Planned Distance (km)" htmlFor="planned-distance">
              <input id="planned-distance" name="planned-distance" type="number" min="1" className={inputClass} placeholder="148" />
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
              className="h-10 rounded-md bg-emerald-400 px-5 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Dispatching..." : "Confirm & Dispatch Trip"}
            </button>
          </div>
        </form>
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