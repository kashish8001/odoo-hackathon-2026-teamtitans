"use client";
import { useState, useEffect } from "react";
import { tripsApi } from "@/lib/api";

// Map API status to display format
const statusMap = {
  "scheduled": "Scheduled",
  "in_transit": "On way",
  "delivered": "Completed",
  "cancelled": "Cancelled",
};

// ── Status badge colours ──────────────────────────────────────────────────────
const statusStyle = {
  "On way": { background: "rgba(0,229,160,0.12)", color: "#00e5a0", dot: "#00e5a0" },
  "Scheduled": { background: "rgba(59,130,246,0.12)", color: "#3b82f6", dot: "#3b82f6" },
  "Completed": { background: "rgba(107,114,128,0.15)", color: "#9ca3af", dot: "#9ca3af" },
  "Cancelled": { background: "rgba(239,68,68,0.12)", color: "#ef4444", dot: "#ef4444" },
  "Idle": { background: "rgba(107,114,128,0.15)", color: "#9ca3af", dot: "#9ca3af" },
  "Maintenance": { background: "rgba(245,158,11,0.12)", color: "#f59e0b", dot: "#f59e0b" },
};

const StatusBadge = ({ status }) => {
  const s = statusStyle[status] ?? statusStyle["Idle"];
  return (
    <span style={{ ...styles.badge, background: s.background, color: s.color }}>
      <span style={{ ...styles.dot, background: s.dot }} />
      {status}
    </span>
  );
};

// ── TripTable ─────────────────────────────────────────────────────────────────
export default function TripTable() {
  const [tripData, setTripData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await tripsApi.getAll();
      // Transform API response to match component format
      const trips = (response.data || response || []).map(t => ({
        id: t.id,
        fleetType: t.vehicle_model || t.vehicle_plate || "Vehicle",
        origin: t.origin || "N/A",
        destination: t.destination || "N/A",
        status: statusMap[t.status] || t.status,
        driver: t.driver_name,
      }));
      setTripData(trips);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch trips:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleRowClick = (trip) => { /* TODO: open trip detail */ };

  const filtered = tripData.filter(
    (t) =>
      t.fleetType.toLowerCase().includes(search.toLowerCase()) ||
      t.origin.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={{ padding: "60px 24px", textAlign: "center" }}>
          <p style={{ color: "#6b7280", fontSize: 14 }}>Loading trips...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.wrapper}>
        <div style={{ padding: "60px 24px", textAlign: "center" }}>
          <p style={{ color: "#f87171", fontSize: 14, marginBottom: 16 }}>Failed to load trips: {error}</p>
          <button onClick={fetchTrips} style={{ background: "#00e5a0", color: "#000", padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer" }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <input
          type="text"
          placeholder="Search trips..."
          style={styles.searchBar}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div>
          <button style={styles.actionButton}>Group by</button>
          <button style={styles.actionButton}>Filter</button>
          <button style={styles.actionButton}>Sort by...</button>
        </div>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {["Trip Fleet Type", "Origin", "Destination", "Status"].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((trip) => (
              <tr
                key={trip.id}
                style={styles.tr}
                onClick={() => handleRowClick(trip)}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#1c1c22"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <td style={{ ...styles.td, color: "#e5e7eb" }}>{trip.fleetType}</td>
                <td style={{ ...styles.td, color: "#d1d5db" }}>{trip.origin}</td>
                <td style={{ ...styles.td, color: "#d1d5db" }}>{trip.destination}</td>
                <td style={styles.td}><StatusBadge status={trip.status} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: "40px 24px", textAlign: "center", color: "#4b5563", fontSize: 13 }}>
                  No trips found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    background: "#18181c",
    border: "1px solid #1f1f26",
    borderRadius: 14,
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 24px 14px",
    borderBottom: "1px solid #1f1f26",
  },
  searchBar: {
    background: "#2a2a30",
    border: "1px solid #3a3a42",
    borderRadius: 8,
    color: "#f0f0f5",
    padding: "8px 12px",
    fontSize: 14,
  },
  actionButton: {
    background: "#2a2a30",
    border: "1px solid #3a3a42",
    borderRadius: 8,
    color: "#f0f0f5",
    padding: "8px 12px",
    fontSize: 14,
    marginLeft: 8,
    cursor: "pointer",
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700,
    fontSize: 15,
    color: "#f0f0f5",
  },
  viewAll: {
    background: "none",
    border: "none",
    color: "#00e5a0",
    fontSize: 12,
    fontFamily: "'Outfit', sans-serif",
    cursor: "pointer",
  },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "10px 24px",
    fontSize: 11,
    color: "#4b5563",
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    borderBottom: "1px solid #1f1f26",
  },
  tr: {
    cursor: "pointer",
    transition: "background 0.1s",
    borderBottom: "1px solid #1a1a20",
  },
  td: {
    padding: "13px 24px",
    fontSize: 13,
    fontFamily: "'Outfit', sans-serif",
    color: "#9ca3af",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'Outfit', sans-serif",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    flexShrink: 0,
  },
};