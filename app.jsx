// =========================================================
// Main App Shell
// =========================================================

const SettingsScreen = ({ apps }) => {
  const toast = useToast();
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>ตั้งค่า</h1>
          <div className="sub">การตั้งค่าระบบและจัดการ Application catalog</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="card">
          <div className="card-head">
            <h3>Application Catalog</h3>
            <div className="row-end">
              <button className="btn btn-sm btn-accent" onClick={() => toast.push("ดูใน Hospitals form")}>
                <Icon name="plus" size={12} /> เพิ่ม
              </button>
            </div>
          </div>
          <div className="stack" style={{ padding: 14 }}>
            {apps.map(a => (
              <div key={a.id} className="app-pill installed">
                <div className="ico" style={{ background: a.color, color: "#fff" }}>{a.short}</div>
                <div style={{ flex: 1 }}>
                  <div className="nm">{a.name}</div>
                  <div className="meta">{a.desc}</div>
                </div>
                <Chip kind="outline" className="mono">{a.id}</Chip>
              </div>
            ))}
          </div>
        </div>

        <div className="stack" style={{ gap: 18 }}>
          <div className="card">
            <div className="card-head"><h3>โปรไฟล์องค์กร</h3></div>
            <div className="grid card-pad" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="ชื่อบริษัท">
                <input className="input" defaultValue="Smart Hospital Co., Ltd." />
              </Field>
              <Field label="โทรศัพท์">
                <input className="input mono" defaultValue="02-XXX-XXXX" />
              </Field>
              <Field label="Email" span={2}>
                <input className="input" defaultValue="contact@smarthos.co.th" />
              </Field>
            </div>
          </div>
          <div className="card card-pad">
            <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700 }}>เกี่ยวกับระบบ</h3>
            <div className="tiny muted" style={{ marginTop: 4, marginBottom: 14 }}>Smart Hospital Implementation Hub</div>
            <div className="stack" style={{ gap: 8 }}>
              <InfoRow icon="info" label="Version" value="1.0.0 (Prototype)" />
              <InfoRow icon="users" label="License" value="Internal use" />
              <InfoRow icon="clock" label="Last sync" value="วันนี้, 09:14" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========= MAIN APP =========
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  const [team, setTeam]           = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [targets, setTargets]     = useState(window.SEED_TARGETS);
  const [loading, setLoading]     = useState(window.SupabaseDB?.isConfigured === true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const prevHospitalsRef = React.useRef(null);
  const prevTeamRef      = React.useRef(null);

  const [route, setRoute] = useState("dashboard");
  const [year, setYear] = useState(2026);
  const [dismissedReminders, setDismissedReminders] = useState([]);
  const [sentReminders, setSentReminders] = useState([]);
  const [focusHospitalId, setFocusHospitalId] = useState(null);

  // ── โหลดข้อมูลจาก Supabase ครั้งแรก ──────────────────────
  useEffect(() => {
    if (!window.SupabaseDB?.isConfigured) {
      setTeam(window.SEED_TEAM);
      setHospitals(window.SEED_HOSPITALS);
      setTargets(window.SEED_TARGETS);
      setDataLoaded(true);
      return;
    }
    window.SupabaseDB.loadAll().then(({ team, hospitals, targets }) => {
      setTeam(team);
      setHospitals(hospitals);
      setTargets(targets);
      prevTeamRef.current      = team;
      prevHospitalsRef.current = hospitals;
      setDataLoaded(true);
      setLoading(false);
    }).catch(err => {
      console.error('[Supabase] loadAll failed:', err);
      setTeam(window.SEED_TEAM);
      setHospitals(window.SEED_HOSPITALS);
      setTargets(window.SEED_TARGETS);
      setDataLoaded(true);
      setLoading(false);
    });
  }, []);

  // ── Sync hospitals → Supabase เมื่อข้อมูลเปลี่ยน ────────
  useEffect(() => {
    if (!dataLoaded || !window.SupabaseDB?.isConfigured) return;
    const prev = prevHospitalsRef.current;
    if (!prev) { prevHospitalsRef.current = hospitals; return; }

    if (hospitals.length > prev.length) {
      const added = hospitals.filter(h => !prev.find(p => p.id === h.id));
      added.forEach(h => window.SupabaseDB.upsertHospital(h));
    } else if (hospitals.length < prev.length) {
      const removed = prev.filter(p => !hospitals.find(c => c.id === p.id));
      removed.forEach(h => window.SupabaseDB.deleteHospital(h.id));
    } else {
      const updated = hospitals.filter(h => {
        const p = prev.find(p => p.id === h.id);
        return p && JSON.stringify(p) !== JSON.stringify(h);
      });
      updated.forEach(h => window.SupabaseDB.upsertHospital(h));
    }
    prevHospitalsRef.current = hospitals;
  }, [hospitals, dataLoaded]);

  // ── Sync team → Supabase เมื่อข้อมูลเปลี่ยน ─────────────
  useEffect(() => {
    if (!dataLoaded || !window.SupabaseDB?.isConfigured) return;
    const prev = prevTeamRef.current;
    if (!prev) { prevTeamRef.current = team; return; }

    if (team.length > prev.length) {
      const added = team.filter(m => !prev.find(p => p.id === m.id));
      added.forEach(m => window.SupabaseDB.upsertMember(m));
    } else if (team.length < prev.length) {
      const removed = prev.filter(p => !team.find(c => c.id === p.id));
      removed.forEach(m => window.SupabaseDB.deleteMember(m.id));
    } else {
      const updated = team.filter(m => {
        const p = prev.find(p => p.id === m.id);
        return p && JSON.stringify(p) !== JSON.stringify(m);
      });
      updated.forEach(m => window.SupabaseDB.upsertMember(m));
    }
    prevTeamRef.current = team;
  }, [team, dataLoaded]);

  // ── Sync targets → Supabase เมื่อข้อมูลเปลี่ยน ──────────
  useEffect(() => {
    if (!dataLoaded || !window.SupabaseDB?.isConfigured) return;
    window.SupabaseDB.saveTargets(targets);
  }, [targets, dataLoaded]);

  const handleLogout = () => {
    if (confirm("ต้องการออกจากระบบ?")) {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("currentUser");
      setTimeout(() => {
        setIsLoggedIn(false);
        setRoute("dashboard");
      }, 100);
    }
  };

  // If not logged in, show login screen
  if (!isLoggedIn) {
    return (
      <ToastProvider>
        <LoginScreen onLogin={() => setIsLoggedIn(true)} />
      </ToastProvider>
    );
  }

  const years = useMemo(() => Object.keys(targets).map(Number).sort(), [targets]);
  const yearHosps = hospitals.filter(h => h.year === year);
  const reminders = useMemo(() => computeReminders(hospitals, team), [hospitals, team]);
  const birthdayReminders = useMemo(() => computeBirthdayReminders(team), [team]);

  const jumpToHospital = (id) => {
    const h = hospitals.find(x => x.id === id);
    if (h && h.year !== year) setYear(h.year);
    setRoute("hospitals");
    setFocusHospitalId(id);
  };

  const titles = {
    dashboard: { title: "Dashboard", sub: `ภาพรวมโครงการติดตั้งระบบ — ปี ${year}` },
    hospitals: { title: "Hospitals", sub: `รายชื่อโรงพยาบาลที่ติดตั้งระบบในปี ${year}` },
    team:      { title: "Team Members", sub: "สมาชิกทีมและตารางงาน" },
    targets:   { title: "Annual Targets", sub: "ตั้งเป้าและเทียบยอดในแต่ละปี" },
    reports:   { title: "Reports", sub: "สรุปยอดและภาพรวมการติดตั้งระบบ" },
    summary:   { title: "Installation Summary", sub: "สรุปยอดติดตั้งตามช่วงวันที่" },
    gateway:   { title: "Gateway Monitor", sub: `ติดตามสถานะการติดตั้ง Gateway และ Connection · ปี ${year}` },
    calendar:  { title: "Schedule", sub: "ปฏิทินงานติดตั้งและ Timeline" },
    "installation-calendar": { title: "Installation Calendar", sub: "ปฎิธินการติดตั้ง" },
    "installation-timeline": { title: "Installation Timeline", sub: "Gantt chart การติดตั้ง" },
    "team-schedule": { title: "Team Schedule", sub: "ตารางทีมงาน Onsite" },
    settings:  { title: "Settings", sub: "การตั้งค่าระบบ" },
  };

  const counts = {
    team: team.length,
    hospitals: yearHosps.length,
  };

  if (loading) {
    return (
      <div style={{
        position: "fixed", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "rgb(255, 248, 249)", gap: 16,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "4px solid var(--border-2)",
          borderTopColor: "var(--accent)",
          animation: "spin 0.8s linear infinite",
        }} />
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--muted)" }}>
          กำลังโหลดข้อมูลจาก Supabase…
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="app-shell">
        <Sidebar route={route} setRoute={setRoute} counts={counts} onLogout={handleLogout} />
        <main className="main">
          <TopBar
            title={titles[route].title}
            sub={titles[route].sub}
            year={year} setYear={setYear} years={years}
          >
            <NotificationCenter
              reminders={reminders}
              birthdayReminders={birthdayReminders}
              setRoute={setRoute}
              onJumpHospital={jumpToHospital}
              dismissed={dismissedReminders}
              setDismissed={setDismissedReminders}
              sent={sentReminders}
              setSent={setSentReminders}
            />
          </TopBar>
          <div className="content">
            {route === "dashboard" && (
              <>
                <RemindersBanner
                  reminders={reminders}
                  dismissed={dismissedReminders}
                  onJumpHospital={jumpToHospital}
                  setRoute={setRoute}
                />
                <Dashboard
                  year={year}
                  hospitals={hospitals}
                  team={team}
                  targets={targets}
                  onJump={setRoute}
                />
              </>
            )}
            {route === "hospitals" && (
              <HospitalsScreen
                hospitals={hospitals}
                setHospitals={setHospitals}
                team={team}
                year={year}
                focusId={focusHospitalId}
                onFocusConsumed={() => setFocusHospitalId(null)}
              />
            )}
            {route === "team" && (
              <TeamScreen
                team={team}
                setTeam={setTeam}
                hospitals={hospitals}
                year={year}
              />
            )}
            {route === "targets" && (
              <TargetsScreen
                targets={targets}
                setTargets={setTargets}
                hospitals={hospitals}
              />
            )}
            {route === "reports" && (
              <ReportsScreen
                hospitals={hospitals}
                targets={targets}
                team={team}
              />
            )}
            {route === "summary" && (
              <InstallationSummaryDashboard
                hospitals={hospitals}
                team={team}
              />
            )}
            {route === "calendar" && (
              <CalendarScreen
                hospitals={hospitals}
                setHospitals={setHospitals}
                team={team}
                year={year}
                setYear={setYear}
              />
            )}
            {route === "gateway" && (
              <GatewayMonitor
                hospitals={hospitals}
                setHospitals={setHospitals}
                team={team}
                year={year}
              />
            )}
            {route === "installation-calendar" && (
              <InstallationCalendarScreen
                hospitals={hospitals}
                year={year}
                setYear={setYear}
                years={years}
                team={team}
              />
            )}
            {route === "installation-timeline" && (
              <InstallationTimelineScreen
                hospitals={hospitals}
                year={year}
                setYear={setYear}
                years={years}
                team={team}
              />
            )}
            {route === "team-schedule" && (
              <TeamScheduleScreen
                hospitals={hospitals}
                year={year}
                setYear={setYear}
                years={years}
                team={team}
              />
            )}
            {route === "settings" && (
              <SettingsScreen apps={window.APPS_CATALOG} />
            )}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
