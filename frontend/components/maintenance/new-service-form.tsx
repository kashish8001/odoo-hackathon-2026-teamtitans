"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";

type NewServiceFormProps = {
  closeModal: () => void;
};

export default function NewServiceForm({ closeModal }: NewServiceFormProps) {
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
      <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-white/10 bg-[#16191f] shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Workshop Entry
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">New Service Log</h2>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-slate-400 transition hover:text-white"
            aria-label="Close new service form"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Vehicle" htmlFor="vehicle-name">
              <input id="vehicle-name" name="vehicle-name" className={inputClass} placeholder="TATA 407 / MH-12-AB-1234" />
            </Field>

            <Field label="Service Type" htmlFor="service-type">
              <select id="service-type" name="service-type" className={inputClass} defaultValue="">
                <option value="" disabled>Select service type</option>
                <option>Oil Change</option>
                <option>Brake Service</option>
                <option>Engine Repair</option>
                <option>Tire Replacement</option>
                <option>General Inspection</option>
              </select>
            </Field>

            <Field label="Issue / Service" htmlFor="issue-service">
              <input id="issue-service" name="issue-service" className={inputClass} placeholder="Engine Issue, Oil Change" />
            </Field>

            <Field label="Start Date" htmlFor="start-date">
              <input id="start-date" name="start-date" type="date" className={inputClass} />
            </Field>

            <Field label="Estimated Cost" htmlFor="cost">
              <input id="cost" name="cost" className={inputClass} placeholder="₹5,000" />
            </Field>

            <Field label="Status" htmlFor="status">
              <select id="status" name="status" className={inputClass} defaultValue="New">
                <option>New</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </Field>
          </div>

          <Field label="Notes" htmlFor="notes">
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className={`${inputClass} h-auto resize-none py-3`}
              placeholder="Add service observations, parts required, or workshop notes."
            />
          </Field>

          <div className="rounded-md border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-amber-100">
            Creating an active service record should mark the vehicle as in shop once backend integration is connected.
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
              {isSubmitting ? "Creating..." : "Create Service"}
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