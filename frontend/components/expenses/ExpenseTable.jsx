"use client";
import { useState, useEffect } from "react";
import { expensesApi } from "@/lib/api";

const statusStyle = {
    'Done': { background: "rgba(16, 185, 129, 0.1)", color: "#10B981" },
    'Pending': { background: "rgba(245, 158, 11, 0.1)", color: "#F59E0B" },
};

const StatusBadge = ({ status }) => {
    const s = statusStyle[status] ?? { background: "rgba(107, 114, 128, 0.1)", color: "#6B7280" };
    return (
        <span style={{ ...s, padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>
            {status}
        </span>
    );
};

export default function ExpenseTable() {
    const [expenseData, setExpenseData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    const fetchExpenses = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await expensesApi.getAll();
            // Transform API response to match component format
            const expenses = (response.data || response || []).map(e => ({
                tripId: e.trip_id || e.id,
                driver: e.driver_name || "-",
                distance: e.distance_km ? `${e.distance_km} km` : "-",
                fuelExpense: e.expense_type === 'fuel' ? `₹${Number(e.amount).toLocaleString()}` : "-",
                miscExpense: e.expense_type !== 'fuel' ? `₹${Number(e.amount).toLocaleString()}` : "-",
                amount: `₹${Number(e.amount).toLocaleString()}`,
                type: e.expense_type,
                status: 'Done', // API doesn't have status, default to Done
            }));
            setExpenseData(expenses);
        } catch (err) {
            setError(err.message);
            console.error("Failed to fetch expenses:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const filtered = expenseData.filter(
        (e) => e.driver.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ background: "#18181c", border: "1px solid #1f1f26", borderRadius: 14, color: 'white', padding: '4rem', textAlign: 'center' }}>
                <p style={{ color: "#6b7280" }}>Loading expenses...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ background: "#18181c", border: "1px solid #1f1f26", borderRadius: 14, color: 'white', padding: '4rem', textAlign: 'center' }}>
                <p style={{ color: "#f87171", marginBottom: '1rem' }}>Failed to load expenses: {error}</p>
                <button onClick={fetchExpenses} style={{ background: "#00e5a0", color: "#000", padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer" }}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div style={{ background: "#18181c", border: "1px solid #1f1f26", borderRadius: 14, color: 'white', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder="Search by driver..."
                    style={{ background: "#2a2a30", border: "1px solid #3a3a42", borderRadius: 8, color: "#f0f0f5", padding: "8px 12px" }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div>
                    <button style={{ background: "#2a2a30", border: "1px solid #3a3a42", borderRadius: 8, color: "#f0f0f5", padding: "8px 12px", marginLeft: '0.5rem' }}>Group by</button>
                    <button style={{ background: "#2a2a30", border: "1px solid #3a3a42", borderRadius: 8, color: "#f0f0f5", padding: "8px 12px", marginLeft: '0.5rem' }}>Filter</button>
                    <button style={{ background: "#2a2a30", border: "1px solid #3a3a42", borderRadius: 8, color: "#f0f0f5", padding: "8px 12px", marginLeft: '0.5rem' }}>Sort by...</button>
                </div>
            </div>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: "1px solid #1f1f26" }}>
                        {['Trip ID', 'Driver', 'Distance', 'Amount', 'Type', 'Status'].map(h => <th key={h} style={{ padding: '0.5rem' }}>{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #1f1f26" }}>
                            <td style={{ padding: '0.5rem' }}>{item.tripId || '-'}</td>
                            <td style={{ padding: '0.5rem' }}>{item.driver}</td>
                            <td style={{ padding: '0.5rem' }}>{item.distance}</td>
                            <td style={{ padding: '0.5rem' }}>{item.amount}</td>
                            <td style={{ padding: '0.5rem' }}>{item.type}</td>
                            <td style={{ padding: '0.5rem' }}><StatusBadge status={item.status} /></td>
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No expenses found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
