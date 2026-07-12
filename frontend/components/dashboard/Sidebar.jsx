"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { navItems } from "./dummydata";
import { useAuth } from "@/contexts/AuthContext";

// ── Icons (inline SVG map, no extra dependency) ──────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const icons = {
    grid: (
      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    truck: (
      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    map: (
      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
      </svg>
    ),
    tool: (
      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    receipt: (
      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16l3-1.5 3 1.5 3-1.5 3 1.5V4a2 2 0 0 0-2-2z" />
        <line x1="8" y1="9" x2="16" y2="9" /><line x1="8" y1="13" x2="14" y2="13" />
      </svg>
    ),
    "bar-chart": (
      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    ),
    "pie-chart": (
      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M21.21 15.89A10 10 0 1 1 8.11 2.79" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
  };
  return icons[name] ?? null;
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials = user
    ? `${(user.first_name || "")[0] || ""}${(user.last_name || "")[0] || ""}`.toUpperCase() || "U"
    : "U";
  const displayName = user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email : "User";
  const displayRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User";

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoMark}>FF</div>
        <div>
          <div style={styles.logoText}>Fleet Flow</div>
          <div style={styles.logoSub}>Fleet Management</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link href={item.href} key={item.label} style={{ textDecoration: 'none' }}>
              <button
                style={{
                  ...styles.navItem,
                  ...(active ? styles.navItemActive : {}),
                }}
              >
                <span style={{ color: active ? "#00e5a0" : "#6b7280" }}>
                  <Icon name={item.icon} />
                </span>
                <span>{item.label}</span>
              </button>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={styles.userBlock}>
        <div style={styles.avatar}>{initials}</div>
        <div style={{ flex: 1 }}>
          <div style={styles.userName}>{displayName}</div>
          <div style={styles.userRole}>{displayRole}</div>
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            color: "#6b7280",
            display: "flex",
            alignItems: "center",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#6b7280"}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 230,
    minWidth: 230,
    background: "#111114",
    borderRight: "1px solid #1f1f26",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "22px 20px",
    borderBottom: "1px solid #1f1f26",
  },
  logoMark: {
    width: 36,
    height: 36,
    background: "#00e5a0",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 14,
    color: "#0d0d0f",
    fontFamily: "'Outfit', sans-serif",
    flexShrink: 0,
  },
  logoText: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700,
    fontSize: 16,
    color: "#f0f0f5",
    letterSpacing: "-0.3px",
  },
  logoSub: {
    fontSize: 10,
    color: "#4b5563",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginTop: 1,
  },
  nav: {
    flex: 1,
    padding: "12px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    overflowY: "auto",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 500,
    color: "#9ca3af",
    background: "none",
    border: "none",
    width: "100%",
    textAlign: "left",
    transition: "all 0.15s",
  },
  navItemActive: {
    background: "rgba(0,229,160,0.08)",
    color: "#00e5a0",
  },
  userBlock: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "16px 20px",
    borderTop: "1px solid #1f1f26",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#1e3a33",
    color: "#00e5a0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },
  userName: { fontSize: 13, color: "#e5e7eb", fontWeight: 600, fontFamily: "'Outfit', sans-serif" },
  userRole: { fontSize: 11, color: "#6b7280", marginTop: 1 },
};