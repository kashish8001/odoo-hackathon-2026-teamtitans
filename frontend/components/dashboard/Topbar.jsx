"use client";

// ── Topbar ────────────────────────────────────────────────────────────────────
// Props:
//   onSearch   (fn)     – called with search string on input change
//   onGroupBy  (fn)     – group by button click
//   onFilter   (fn)     – filter button click
//   onSortBy   (fn)     – sort by button click
//   actions    (array)  – [{ label, onClick, variant: "primary" | "outline" }]
//
// Usage – Dashboard:
//   <Topbar
//     actions={[
//       { label: "+ New Trip",    variant: "outline", onClick: handleNewTrip    },
//       { label: "+ New Vehicle", variant: "primary", onClick: handleNewVehicle },
//     ]}
//   />
//
// Usage – Vehicle Registry:
//   <Topbar
//     actions={[{ label: "+ New Vehicle", variant: "primary", onClick: () => setShowModal(true) }]}
//   />

export default function Topbar({
  onSearch  = () => {},
  onGroupBy = () => {},
  onFilter  = () => {},
  onSortBy  = () => {},
  actions   = [],
}) {
  return (
    <header style={styles.topbar}>

      {/* Search */}
      <div style={styles.searchWrap}>
        <svg width="15" height="15" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          style={styles.searchInput}
          placeholder="Search trips, vehicles, drivers…"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <button onClick={onGroupBy} style={styles.ctrlBtn}>Group by</button>
        <div style={styles.divider} />
        <button onClick={onFilter}  style={styles.ctrlBtn}>Filter</button>
        <div style={styles.divider} />
        <button onClick={onSortBy}  style={styles.ctrlBtn}>Sort by</button>
      </div>

      <div style={{ flex: 1 }} />

      {/* Dynamic action buttons */}
      {actions.length > 0 && (
        <div style={styles.actions}>
          {actions.map(({ label, onClick, variant = "primary" }) => (
            <button
              key={label}
              onClick={onClick}
              style={variant === "primary" ? styles.btnPrimary : styles.btnOutline}
            >
              {label}
            </button>
          ))}
        </div>
      )}

    </header>
  );
}

const styles = {
  topbar: {
    height: 60,
    background: "#111114",
    borderBottom: "1px solid #1f1f26",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 24px",
    flexShrink: 0,
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#18181c",
    border: "1px solid #27272e",
    borderRadius: 8,
    padding: "0 14px",
    height: 36,
    width: 320,
  },
  searchInput: {
    background: "none",
    border: "none",
    outline: "none",
    color: "#d1d5db",
    fontSize: 13,
    fontFamily: "'Outfit', sans-serif",
    width: "100%",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    background: "#18181c",
    border: "1px solid #27272e",
    borderRadius: 8,
    height: 36,
    overflow: "hidden",
  },
  divider: { width: 1, height: 20, background: "#27272e" },
  ctrlBtn: {
    background: "none",
    border: "none",
    color: "#9ca3af",
    fontSize: 12,
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 500,
    padding: "0 14px",
    height: "100%",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  actions: { display: "flex", gap: 8 },
  btnOutline: {
    background: "none",
    border: "1px solid #00e5a0",
    color: "#00e5a0",
    borderRadius: 8,
    padding: "0 16px",
    height: 36,
    fontSize: 13,
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  btnPrimary: {
    background: "#00e5a0",
    border: "none",
    color: "#0a0a0c",
    borderRadius: 8,
    padding: "0 16px",
    height: 36,
    fontSize: 13,
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
};