// =========================================================
// Installation Summary Dashboard
// =========================================================

const InstallationSummaryDashboard = ({ hospitals, team }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filter hospitals by date range
  const filtered = hospitals.filter(h => {
    if (!startDate && !endDate) return true;
    const hStart = new Date(h.start);
    const start = startDate ? new Date(startDate) : new Date("2000-01-01");
    const end = endDate ? new Date(endDate) : new Date("2099-12-31");
    return hStart >= start && hStart <= end;
  }).sort((a, b) => new Date(a.start) - new Date(b.start));

  // Calculate statistics
  const stats = {
    total: filtered.length,
    revenue: filtered.reduce((a, h) => a + (h.price || 0), 0),
    apps: filtered.reduce((a, h) => a + h.apps.length, 0),
    closed: filtered.filter(h => h.status === "ปิดงาน" || h.status === "ติดตั้งเสร็จ").length,
    inProgress: filtered.filter(h => h.status === "กำลังติดตั้ง" || h.status === "ทดสอบระบบ").length,
    pending: filtered.filter(h => h.status === "รอเริ่ม").length,
  };

  // Summary by hospital (ทั้งปี) - all hospitals in filtered range
  const summaryAllHospitals = (() => {
    const byHosp = {};
    filtered.forEach(h => {
      if (!byHosp[h.id]) {
        byHosp[h.id] = {
          name: h.name,
          code: h.code,
          target: window.SEED_TARGETS[h.year]?.hospitals || 0,
          allTotal: 0,
          installedTotal: 0,
        };
      }
      byHosp[h.id].allTotal += 1;
      if (h.status === "ปิดงาน" || h.status === "ติดตั้งเสร็จ") {
        byHosp[h.id].installedTotal += 1;
      }
    });
    return Object.values(byHosp);
  })();

  // Summary statistics
  const summaryStats = {
    allHospitals: {
      target: summaryAllHospitals.reduce((a, s) => a + s.target, 0),
      total: summaryAllHospitals.reduce((a, s) => a + s.allTotal, 0),
    },
    installed: {
      target: summaryAllHospitals.reduce((a, s) => a + s.target, 0),
      total: summaryAllHospitals.reduce((a, s) => a + s.installedTotal, 0),
    },
  };

  summaryStats.allHospitals.diff = summaryStats.allHospitals.total - summaryStats.allHospitals.target;
  summaryStats.allHospitals.pct = summaryStats.allHospitals.target > 0 ? Math.round((summaryStats.allHospitals.total / summaryStats.allHospitals.target) * 100) : 0;
  summaryStats.installed.diff = summaryStats.installed.total - summaryStats.installed.target;
  summaryStats.installed.pct = summaryStats.installed.target > 0 ? Math.round((summaryStats.installed.total / summaryStats.installed.target) * 100) : 0;

  const getStatusColor = (pct) => pct >= 100 ? "var(--success)" : "var(--danger)";
  const getDiffLabel = (diff) => diff >= 0 ? `+${diff}` : `${diff}`;

  const lead = (id) => team.find(t => t.id === id);

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="page-header">
        <div>
          <h1>สรุปยอดติดตั้ง</h1>
          <div className="sub">ค้นหาและสรุปยอดโรงพยาบาลตามช่วงวันที่ติดตั้ง</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn" onClick={() => window.print()}>
            <Icon name="printer" size={14} /> พิมพ์
          </button>
          <button className="btn btn-primary">
            <Icon name="download" size={14} /> Export
          </button>
        </div>
      </div>

      {/* Filter section */}
      <div className="card card-pad">
        <div className="row" style={{ gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="tiny bold" style={{ color: "var(--muted)", display: "block", marginBottom: 4 }}>
              วันที่เริ่มติดตั้ง (จาก)
            </label>
            <input
              type="date"
              className="input"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="tiny bold" style={{ color: "var(--muted)", display: "block", marginBottom: 4 }}>
              วันที่เริ่มติดตั้ง (ถึง)
            </label>
            <input
              type="date"
              className="input"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => { setStartDate(""); setEndDate(""); }}
            title="ล้างตัวกรอง"
          >
            <Icon name="close" size={14} /> ล้าง
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {/* ทั้งปี */}
        <div className="card">
          <div className="card-head">
            <h3>สรุปทั้งปี (โรงพยาบาลทั้งหมด)</h3>
          </div>
          <div className="grid card-pad" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div className="tiny muted" style={{ marginBottom: 4 }}>เป้าหมาย</div>
              <div className="display bold mono" style={{ fontSize: 24 }}>{summaryStats.allHospitals.target}</div>
            </div>
            <div>
              <div className="tiny muted" style={{ marginBottom: 4 }}>ยอดรวม</div>
              <div className="display bold mono" style={{ fontSize: 24 }}>{summaryStats.allHospitals.total}</div>
            </div>
            <div>
              <div className="tiny muted" style={{ marginBottom: 4 }}>ส่วนต่าง</div>
              <div className="display bold mono" style={{ fontSize: 24, color: getStatusColor(summaryStats.allHospitals.pct) }}>
                {getDiffLabel(summaryStats.allHospitals.diff)}
              </div>
            </div>
            <div>
              <div className="tiny muted" style={{ marginBottom: 4 }}>% ถึงเป้า</div>
              <div className="display bold mono" style={{ fontSize: 24, color: getStatusColor(summaryStats.allHospitals.pct) }}>
                {summaryStats.allHospitals.pct}%
              </div>
            </div>
          </div>
        </div>

        {/* เฉพาะติดตั้งแล้ว */}
        <div className="card">
          <div className="card-head">
            <h3>สรุปเฉพาะติดตั้งแล้ว</h3>
          </div>
          <div className="grid card-pad" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div className="tiny muted" style={{ marginBottom: 4 }}>เป้าหมาย</div>
              <div className="display bold mono" style={{ fontSize: 24 }}>{summaryStats.installed.target}</div>
            </div>
            <div>
              <div className="tiny muted" style={{ marginBottom: 4 }}>ยอดรวม</div>
              <div className="display bold mono" style={{ fontSize: 24 }}>{summaryStats.installed.total}</div>
            </div>
            <div>
              <div className="tiny muted" style={{ marginBottom: 4 }}>ส่วนต่าง</div>
              <div className="display bold mono" style={{ fontSize: 24, color: getStatusColor(summaryStats.installed.pct) }}>
                {getDiffLabel(summaryStats.installed.diff)}
              </div>
            </div>
            <div>
              <div className="tiny muted" style={{ marginBottom: 4 }}>% ถึงเป้า</div>
              <div className="display bold mono" style={{ fontSize: 24, color: getStatusColor(summaryStats.installed.pct) }}>
                {summaryStats.installed.pct}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary by status and basic metrics */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <div className="card card-pad">
          <div className="tiny muted" style={{ marginBottom: 8 }}>โรงพยาบาล</div>
          <div className="display bold" style={{ fontSize: 32, color: "var(--accent)" }}>{stats.total}</div>
          <div className="tiny muted" style={{ marginTop: 4 }}>แห่ง</div>
        </div>
        <div className="card card-pad">
          <div className="tiny muted" style={{ marginBottom: 8 }}>รายได้รวม</div>
          <div className="display bold" style={{ fontSize: 24, color: "var(--c3)" }}>{fmtBaht(stats.revenue)}</div>
          <div className="tiny muted" style={{ marginTop: 4 }}>บาท</div>
        </div>
        <div className="card card-pad">
          <div className="tiny muted" style={{ marginBottom: 8 }}>Apps ติดตั้ง</div>
          <div className="display bold" style={{ fontSize: 32, color: "var(--c2)" }}>{stats.apps}</div>
          <div className="tiny muted" style={{ marginTop: 4 }}>ชุด</div>
        </div>
      </div>

      {/* Hospital table */}
      <div className="card" style={{ overflow: "auto" }}>
        <div className="card-head" style={{ padding: "16px 16px 12px" }}>
          <h3>รายละเอียดโรงพยาบาล</h3>
          <div className="row-end tiny muted">
            {filtered.length} / {hospitals.length} โรงพยาบาล
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 40 }}>ลำดับ</th>
              <th>โรงพยาบาล</th>
              <th>รหัส</th>
              <th>วันเริ่ม</th>
              <th>หัวหน้าทีม</th>
              <th>สถานะ</th>
              <th>รายได้</th>
              <th>Apps</th>
              <th>ประเภท</th>
              <th>จังหวัด</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: "center", padding: "32px" }}>
                  <div className="muted">ไม่พบข้อมูลในช่วงวันที่ที่เลือก</div>
                </td>
              </tr>
            ) : (
              filtered.map((h, idx) => {
                const leadInfo = lead(h.lead);
                return (
                  <tr key={h.id}>
                    <td className="num muted" style={{ fontSize: 12 }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{h.name}</td>
                    <td className="mono tiny">{h.code}</td>
                    <td className="mono tiny">{fmtDate(h.start)}</td>
                    <td>
                      {leadInfo && (
                        <div className="row" style={{ gap: 6, alignItems: "center" }}>
                          <Avatar name={leadInfo.nick} color={leadInfo.avatar} />
                          <span className="tiny">{leadInfo.nick}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <Chip kind={statusChipClass(h.status).replace("chip-", "")} className="tiny">
                        {h.status}
                      </Chip>
                    </td>
                    <td className="num bold">{fmtBaht(h.price)}</td>
                    <td className="num">{h.apps.length}</td>
                    <td className="tiny muted">{h.type}</td>
                    <td className="tiny muted">{h.province}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary by status */}
      {filtered.length > 0 && (
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {/* Status breakdown */}
          <div className="card">
            <div className="card-head">
              <h3>สถานะการติดตั้ง</h3>
            </div>
            <div className="stack" style={{ padding: 14 }}>
              {[
                { label: "ปิดงาน", count: stats.closed, color: "var(--success)" },
                { label: "กำลังติดตั้ง", count: stats.inProgress, color: "var(--warning)" },
                { label: "รอเริ่ม", count: stats.pending, color: "var(--danger)" },
              ].map(s => (
                <div key={s.label} className="row" style={{ gap: 12, padding: 8 }}>
                  <span className="s-dot" style={{ background: s.color, width: 12, height: 12, marginTop: 4 }} />
                  <span style={{ flex: 1, fontWeight: 600 }}>{s.label}</span>
                  <span className="display bold mono">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue breakdown by year */}
          <div className="card">
            <div className="card-head">
              <h3>รายได้ตามปี</h3>
            </div>
            <div className="stack" style={{ padding: 14 }}>
              {(() => {
                const byYear = {};
                filtered.forEach(h => {
                  if (!byYear[h.year]) byYear[h.year] = 0;
                  byYear[h.year] += h.price || 0;
                });
                return Object.entries(byYear)
                  .sort((a, b) => b[0] - a[0])
                  .map(([year, rev]) => (
                    <div key={year} className="row" style={{ gap: 12, padding: 8 }}>
                      <span style={{ flex: 1, fontWeight: 600 }}>ปี {year}</span>
                      <span className="display bold mono">{fmtBaht(rev)}</span>
                    </div>
                  ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { InstallationSummaryDashboard });
