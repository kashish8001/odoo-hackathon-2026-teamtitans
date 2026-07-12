"use client";
import { useState, useEffect } from "react";
import { analyticsApi } from "@/lib/api";

export default function PerformanceTable() {
    const [performanceData, setPerformanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    const fetchPerformance = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await analyticsApi.getDriverPerformance();
            // Transform API response to match component format
            const drivers = (response || []).map(d => ({
                id: d.driver_id,
                name: d.driver_name || "Unknown",
                license: d.license_number || "-",
                expiry: d.license_expiry ? new Date(d.license_expiry).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }) : "-",
                completionRate: d.completion_rate ? `${d.completion_rate}%` : "-",
                safetyScore: d.safety_score ? `${d.safety_score}%` : "-",
                complaints: d.complaint_count || 0,
                totalTrips: d.total_trips || 0,
            }));
            setPerformanceData(drivers);
        } catch (err) {
            setError(err.message);
            console.error("Failed to fetch driver performance:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPerformance();
    }, []);

    const filtered = performanceData.filter(
        (d) => d.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ background: "#18181c", border: "1px solid #1f1f26", borderRadius: 14, color: 'white', padding: '4rem', textAlign: 'center' }}>
                <p style={{ color: "#6b7280" }}>Loading driver performance...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ background: "#18181c", border: "1px solid #1f1f26", borderRadius: 14, color: 'white', padding: '4rem', textAlign: 'center' }}>
                <p style={{ color: "#f87171", marginBottom: '1rem' }}>Failed to load performance data: {error}</p>
                <button onClick={fetchPerformance} style={{ background: "#00e5a0", color: "#000", padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer" }}>
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
                    placeholder="Search by name..."
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
                        {['Name', 'License#', 'Expiry', 'Trips', 'Completion Rate', 'Safety Score', 'Complaints'].map(h => <th key={h} style={{ padding: '0.5rem' }}>{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((item) => (
                        <tr key={item.id} style={{ borderBottom: "1px solid #1f1f26" }}>
                            <td style={{ padding: '0.5rem' }}>{item.name}</td>
                            <td style={{ padding: '0.5rem' }}>{item.license}</td>
                            <td style={{ padding: '0.5rem' }}>{item.expiry}</td>
                            <td style={{ padding: '0.5rem' }}>{item.totalTrips}</td>
                            <td style={{ padding: '0.5rem', color: '#00e5a0' }}>{item.completionRate}</td>
                            <td style={{ padding: '0.5rem', color: '#3b82f6' }}>{item.safetyScore}</td>
                            <td style={{ padding: '0.5rem', color: item.complaints > 3 ? '#f87171' : '#9ca3af' }}>{item.complaints}</td>
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No driver data found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
