// =========================================================
// Layout: Sidebar + TopBar
// =========================================================

const Sidebar = ({ route, setRoute, counts, onLogout }) => {
  const navItems = [
  { section: "หลัก" },
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "hospitals", label: "โรงพยาบาล", icon: "building", badge: counts.hospitals },
  { id: "team", label: "ทีมงาน", icon: "users", badge: counts.team },
  { section: "วิเคราะห์" },
  { id: "gateway", label: "Gateway Monitor", icon: "activity" },
  { id: "targets", label: "เป้าหมายรายปี", icon: "target" },
  { id: "reports", label: "รายงาน", icon: "report" },
  { id: "summary", label: "สรุปยอดติดตั้ง", icon: "chart-bar" },
  { id: "installation-timeline", label: "Timeline การติดตั้ง", icon: "timeline" },
  { id: "team-schedule", label: "ตารางทีมงาน", icon: "users" },
  { section: "ระบบ" },
  { id: "settings", label: "ตั้งค่า", icon: "settings" }];

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
            </button>);

        })}
      </nav>
      <div className="sidebar-foot">
        <div className="avatar">ปก</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="nm">ปกรณ์ วงศ์อนันต์</div>
          <div className="rl">Admin · บอม</div>
        </div>
        <button 
          className="btn btn-ghost btn-icon" 
          title="ออกจากระบบ"
          style={{ display: "none" }}
          onClick={() => {
            if (confirm("ต้องการออกจากระบบ?")) {
              onLogout();
            }
          }}
        >
          <Icon name="logout" size={14} />
        </button>
      </div>
    </aside>);

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