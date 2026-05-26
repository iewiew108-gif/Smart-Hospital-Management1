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
  const [team, setTeam] = useState(window.SEED_TEAM);
  const [hospitals, setHospitals] = useState(window.SEED_HOSPITALS);
  const [targets, setTargets] = useState(window.SEED_TARGETS);
  const [route, setRoute] = useState("dashboard");
  const [year, setYear] = useState(2026);
  const [dismissedReminders, setDismissedReminders] = useState([]);
  const [sentReminders, setSentReminders] = useState([]);
  const [focusHospitalId, setFocusHospitalId] = useState(null);

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
  // if (!isLoggedIn) {
  //   return (
  //     <ToastProvider>
  //       <LoginScreen onLogin={() => {
  //         setTimeout(() => setIsLoggedIn(true), 100);
  //       }} />
  //     </ToastProvider>
  //   );
  // }

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
