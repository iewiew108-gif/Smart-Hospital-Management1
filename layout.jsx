// =========================================================
// Layout: Sidebar + TopBar
// =========================================================

const Sidebar = ({ route, setRoute, counts, onLogout }) => {
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("currentUser") || "{}"); }
    catch { return {}; }
  })();
  const displayName = currentUser.name || "ผู้ใช้งาน";
  const displayNick = currentUser.nick || "";
  const avatarText  = (displayNick || displayName).slice(0, 2);
  const userRole    = currentUser.role || "viewer";
  const roleInfo    = window.getRoleLabel ? window.getRoleLabel(userRole) : { label: userRole, color: "#94a3b8" };

  const allNavItems = [
    { section: "หลัก" },
    { id: "dashboard",             label: "Dashboard",             icon: "dashboard",  badge: null },
    { id: "hospitals",             label: "โรงพยาบาล",            icon: "building",   badge: counts.hospitals },
    { id: "team",                  label: "ทีมงาน",                icon: "users",      badge: counts.team },
    { section: "วิเคราะห์" },
    { id: "gateway",               label: "Gateway Monitor",       icon: "activity" },
    { id: "targets",               label: "เป้าหมายรายปี",        icon: "target" },
    { id: "reports",               label: "รายงาน",                icon: "report" },
    { id: "summary",               label: "สรุปยอดติดตั้ง",       icon: "chart-bar" },
    { id: "leader-summary",        label: "สรุปยอดหัวหน้าทีม",   icon: "users" },
    { id: "installation-timeline", label: "Timeline การติดตั้ง",  icon: "timeline" },
    { id: "team-schedule",         label: "ตารางทีมงาน",          icon: "users" },
    { section: "ระบบ" },
    { id: "settings",              label: "ตั้งค่า",               icon: "settings" },
  ];

  // กรองเมนูตาม role
  const navItems = allNavItems.filter(it => {
    if (it.section) return true;
    return window.canAccessMenu ? window.canAccessMenu(userRole, it.id) : true;
  });

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo">SH</div>
        <div>
          <div className="title">Smart Hospital</div>
          <div className="sub">Implementation Hub</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((it, i) => {
          if (it.section) {
            return <div key={"s" + i} className="nav-section" style={{ fontSize: "11px" }}>{it.section}</div>;
          }
          return (
            <button
              key={it.id}
              className={"nav-item " + (route === it.id ? "active" : "")}
              onClick={() => setRoute(it.id)}>
              <Icon name={it.icon} size={16} className="ico" />
              <span>{it.label}</span>
              {it.badge != null && <span className="badge">{it.badge}</span>}
            </button>
          );
        })}
      </nav>
      <div className="sidebar-foot">
        <div className="avatar">{avatarText}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="nm" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
          <div className="rl" style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{
              display: "inline-block", padding: "1px 6px", borderRadius: 8,
              fontSize: 10, fontWeight: 700, background: roleInfo.color, color: "#fff",
            }}>{roleInfo.label}</span>
            <span style={{ opacity: 0.7 }}>· {displayNick}</span>
          </div>
        </div>
        <button className="btn btn-ghost btn-icon" title="ออกจากระบบ" onClick={onLogout}>
          <Icon name="logout" size={14} />
        </button>
      </div>
    </aside>
  );
};

const TopBar = ({ title, sub, year, setYear, years, children }) => {
  return (
    <header className="topbar">
      <div>
        <div className="page-title">{title}</div>
        {sub && <div className="page-sub">{sub}</div>}
      </div>
      <div className="spacer" />
      {children}
      <YearPill years={years} value={year} onChange={setYear} />
    </header>);

};

Object.assign(window, { Sidebar, TopBar });