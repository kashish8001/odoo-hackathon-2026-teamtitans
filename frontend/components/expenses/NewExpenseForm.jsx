"use client";
import { useState, useEffect } from 'react';
import { expensesApi, vehiclesApi, tripsApi } from '@/lib/api';

const expenseTypes = ["fuel", "maintenance", "toll", "parking", "fine", "insurance", "other"];

export default function NewExpenseForm({ closeModal, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [form, setForm] = useState({
    vehicleId: '',
    tripId: '',
    expenseType: '',
    amount: '',
    description: '',
    expenseDate: '',
  });

  useEffect(() => {
    Promise.all([
      vehiclesApi.getOptions().catch(() => []),
      tripsApi.getAll({ limit: 50 }).catch(() => ({ trips: [] })),
    ]).then(([vehicleRes, tripRes]) => {
      setVehicles(vehicleRes || []);
      setTrips((tripRes.trips || tripRes || []).map(t => ({
        id: t.id,
        label: `Trip #${t.id} - ${t.origin_address || 'N/A'} → ${t.destination_address || 'N/A'}`,
      })));
    });
  }, []);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.vehicleId || !form.expenseType || !form.amount) {
      setError("Please fill in vehicle, expense type, and amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        vehicle_id: form.vehicleId,
        trip_id: form.tripId || null,
        expense_type: form.expenseType,
        amount: parseFloat(form.amount),
        description: form.description || null,
        expense_date: form.expenseDate || new Date().toISOString().split('T')[0],
      };

      await expensesApi.create(payload);
      if (onSuccess) onSuccess();
      closeModal();
    } catch (err) {
      setError(err.message || "Failed to create expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#18181c] border border-[#27272e] p-6 rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold text-[#f0f0f5] mb-4">New Expense</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-[13px] mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="vehicleId" className="block text-sm font-medium text-[#9ca3af]">Vehicle *</label>
              <select
                name="vehicleId"
                id="vehicleId"
                value={form.vehicleId}
                onChange={handleChange}
                className="mt-1 block w-full bg-[#111114] border border-[#2a2a34] rounded-lg px-3 py-2 text-[#e5e7eb] focus:border-[#00e5a0] outline-none"
              >
                <option value="">Select vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.label || v.license_plate}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tripId" className="block text-sm font-medium text-[#9ca3af]">Trip (optional)</label>
              <select
                name="tripId"
                id="tripId"
                value={form.tripId}
                onChange={handleChange}
                className="mt-1 block w-full bg-[#111114] border border-[#2a2a34] rounded-lg px-3 py-2 text-[#e5e7eb] focus:border-[#00e5a0] outline-none"
              >
                <option value="">Select trip</option>
                {trips.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="expenseType" className="block text-sm font-medium text-[#9ca3af]">Expense Type *</label>
              <select
                name="expenseType"
                id="expenseType"
                value={form.expenseType}
                onChange={handleChange}
                className="mt-1 block w-full bg-[#111114] border border-[#2a2a34] rounded-lg px-3 py-2 text-[#e5e7eb] focus:border-[#00e5a0] outline-none"
              >
                <option value="">Select type</option>
                {expenseTypes.map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-[#9ca3af]">Amount (₹) *</label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={form.amount}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-[#111114] border border-[#2a2a34] rounded-lg px-3 py-2 text-[#e5e7eb] focus:border-[#00e5a0] outline-none"
                />
              </div>
              <div>
                <label htmlFor="expenseDate" className="block text-sm font-medium text-[#9ca3af]">Date</label>
                <input
                  type="date"
                  name="expenseDate"
                  id="expenseDate"
                  value={form.expenseDate}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-[#111114] border border-[#2a2a34] rounded-lg px-3 py-2 text-[#e5e7eb] focus:border-[#00e5a0] outline-none"
                />
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[#9ca3af]">Description</label>
              <input
                type="text"
                name="description"
                id="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Optional notes..."
                className="mt-1 block w-full bg-[#111114] border border-[#2a2a34] rounded-lg px-3 py-2 text-[#e5e7eb] focus:border-[#00e5a0] outline-none"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 border border-[#27272e] text-[#9ca3af] rounded-lg hover:border-[#3d3d4a] hover:text-[#d1d5db] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#00e5a0] text-[#0a0a0c] rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Creating...' : 'Create Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
