"use client";

// ── StatCard ──────────────────────────────────────────────────────────────────
// Displays a single KPI metric
export default function StatCard({ label, value, color }) {
  return (
    <div style={{ ...styles.card, "--accent": color }}>
      <div style={{ ...styles.bar, background: color }} />
      <div style={{ ...styles.value, color }}>{value}</div>
      <div style={styles.label}>{label}</div>
    </div>
  );
}

const styles = {
  card: {
    background: "#18181c",
    border: "1px solid #1f1f26",
    borderRadius: 14,
    padding: "28px 28px 24px",
    flex: 1,
    minWidth: 180,
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  bar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: "14px 14px 0 0",
    opacity: 0.8,
  },
  value: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 42,
    fontWeight: 800,
    letterSpacing: "-1.5px",
    lineHeight: 1,
    marginTop: 8,
  },
  label: {
    fontSize: 13,
    color: "#6b7280",
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 500,
    marginTop: 4,
    letterSpacing: "0.01em",
  },
};