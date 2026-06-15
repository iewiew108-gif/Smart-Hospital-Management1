// =========================================================
// Reports Screen — yearly summary, exports
// =========================================================

// Reports Screen
const CONTACT_ROLES = [
  { key: "doctor",   label: "แพทย์",        color: "#5B5BD6" },
  { key: "admin",    label: "Admin",         color: "#3877B8" },
  { key: "nurseIPD", label: "พยาบาล IPD",   color: "#B8546D" },
  { key: "pharmacy", label: "เภสัชกร",      color: "#2A8F5E" },
  { key: "stats",    label: "นักเวชสถิติ",  color: "#C97B1F" },
];

const ReportsScreen = ({ hospitals, targets, team }) => {
  const years = [...new Set(hospitals.map(h => h.year))].sort();
  const toast = useToast();
  const [selectedYearForMonthly, setSelectedYearForMonthly] = useState(null);
  const [reportView, setReportView] = useState("summary");
  const [contactYear, setContactYear] = useState("all");
  const [contactQ, setContactQ] = useState("");

  // Yearly summary table
  const yearly = years.map(y => {
    const list = hospitals.filter(h => h.year === y);
    const target = targets[y] || { hospitals: 0, revenue: 0 };
    const revenue = list.reduce((a, h) => a + h.price, 0);
    const apps = list.reduce((a, h) => a + h.apps.length, 0);
    const advance = list.reduce((a, h) => a + (h.advanceAmt || 0), 0);
    return {
      year: y,
      hospitals: list.length,
      target: target.hospitals,
      apps, revenue, advance,
      progress: target.hospitals ? Math.round((list.length / target.hospitals) * 100) : 0,
    };
  });

  // Year-on-Year chart data
  const yoyHosp = yearly.map(y => ({ label: String(y.year), value: y.hospitals, color: "var(--accent)" }));
  const yoyRevenue = yearly.map(y => ({ label: String(y.year), value: Math.round(y.revenue / 1_000_000) }));

  // Monthly revenue breakdown (for all years combined)
  const monthlyRevenue = (() => {
    const months = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
    const filterByYear = selectedYearForMonthly ? hospitals.filter(h => h.year === selectedYearForMonthly) : hospitals;
    return months.map((m, i) => {
      const revenue = filterByYear
        .filter(h => new Date(h.start).getMonth() === i)
        .reduce((a, h) => a + h.price, 0);
      return { label: m, value: revenue, valueM: Math.round(revenue / 1_000_000) };
    });
  })();

  // App popularity overall
  const appCount = {};
  hospitals.forEach(h => h.apps.forEach(a => { appCount[a] = (appCount[a] || 0) + 1; }));
  const appData = APPS_CATALOG.map(a => ({
    ...a,
    count: appCount[a.id] || 0,
    pct: hospitals.length ? Math.round(((appCount[a.id] || 0) / hospitals.length) * 100) : 0,
  })).sort((a, b) => b.count - a.count);

  // Region distribution
  const regionCount = {};
  hospitals.forEach(h => { regionCount[h.region] = (regionCount[h.region] || 0) + 1; });
  const regionData = Object.entries(regionCount)
    .map(([label, value], i) => ({
      label, value,
      color: ["#5B5BD6","#E89B6B","#2A8F5E","#C97B1F","#B8546D","#3877B8"][i % 6],
    }))
    .sort((a, b) => b.value - a.value);

  // Type distribution
  const typeCount = {};
  hospitals.forEach(h => { typeCount[h.type] = (typeCount[h.type] || 0) + 1; });

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="page-header">
        <div>
          <h1>รายงานสรุป</h1>
          <div className="sub">สรุปยอดการติดตั้งระบบในแต่ละปีและภาพรวมทั้งหมด</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn" onClick={() => toast.push("ส่งออก Excel แล้ว (mock)")}>
            <Icon name="download" size={14} /> Export Excel
          </button>
          <button className="btn btn-primary" onClick={() => toast.push("ส่งออก PDF แล้ว (mock)")}>
            <Icon name="report" size={14} /> Export PDF
          </button>
        </div>
      </div>

      <Tabs
        items={[
          { value: "summary",  label: <span><Icon name="report" size={11} /> สรุปภาพรวม</span> },
          { value: "contacts", label: <span><Icon name="phone" size={11} /> ทะเบียนผู้ติดต่อ</span> },
        ]}
        value={reportView}
        onChange={setReportView}
      />

      {/* ── Contacts Report ── */}
      {reportView === "contacts" && (() => {
        const hospList = hospitals
          .filter(h => contactYear === "all" || h.year === Number(contactYear))
          .filter(h => {
            const hasContacts =
              (h.contactsAdmin || []).length > 0 ||
              CONTACT_ROLES.some(r => ((h.contactsFollowup || {})[r.key] || []).length > 0);
            if (!hasContacts) return false;
            return h.name.toLowerCase().includes(contactQ.toLowerCase());
          })
          .sort((a, b) => a.name.localeCompare(b.name, "th"));

        return (
          <div className="stack" style={{ gap: 14 }}>
            {/* Filter row */}
            <div className="card card-pad" style={{ padding: 12 }}>
              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                <Icon name="filter" size={13} className="muted" />
                <select title="ปี" className="select" style={{ width: "auto" }} value={contactYear} onChange={e => setContactYear(e.target.value)}>
                  <option value="all">ทุกปี</option>
                  {years.map(y => <option key={y} value={y}>ปี {y}</option>)}
                </select>
                <SearchBox value={contactQ} onChange={setContactQ} placeholder="ค้นหาชื่อโรงพยาบาล…" />
                <span className="tiny muted">{hospList.length} โรงพยาบาล</span>
              </div>
            </div>

            {hospList.length === 0 && (
              <div className="card card-pad" style={{ textAlign: "center", color: "var(--muted)", padding: 40 }}>
                ไม่พบโรงพยาบาลที่มีข้อมูลผู้ติดต่อ
              </div>
            )}

            {hospList.map(h => {
              const adminContacts = h.contactsAdmin || [];
              const followup = h.contactsFollowup || {};
              return (
                <div key={h.id} className="card">
                  {/* Hospital header */}
                  <div className="card-head" style={{ background: "var(--surface-alt)" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{h.name}</div>
                      <div className="row" style={{ gap: 8, marginTop: 2 }}>
                        {h.code && <Chip kind="outline" className="mono">{h.code}</Chip>}
                        {h.taiga && <Chip kind="outline" className="mono">{h.taiga}</Chip>}
                        {h.province && <span className="tiny muted">{h.province}</span>}
                        <Chip kind="outline">{h.year}</Chip>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: "12px 18px" }}>
                    {/* Section A — ผู้ดูแลระบบ */}
                    {adminContacts.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div className="tiny bold" style={{ color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                          A · ผู้ดูแลระบบ
                        </div>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                          <thead>
                            <tr style={{ borderBottom: "1px solid var(--border-2)" }}>
                              {["ชื่อ-นามสกุล","ตำแหน่ง","เบอร์โทร","Email"].map(h => (
                                <th key={h} style={{ textAlign: "left", padding: "4px 10px 4px 0", fontWeight: 600, color: "var(--muted)", fontSize: 12 }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {adminContacts.map(c => (
                              <tr key={c.id} style={{ borderBottom: "1px solid var(--border-2)" }}>
                                <td style={{ padding: "6px 10px 6px 0", fontWeight: 600 }}>{c.name}</td>
                                <td style={{ padding: "6px 10px 6px 0", color: "var(--muted)" }}>{c.pos || "—"}</td>
                                <td style={{ padding: "6px 10px 6px 0" }} className="mono">{c.phone || "—"}</td>
                                <td style={{ padding: "6px 0" }} className="mono">{c.email || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Section B — ผู้ติดต่อแยกตามตำแหน่ง */}
                    {CONTACT_ROLES.map(role => {
                      const contacts = (followup[role.key] || []);
                      if (contacts.length === 0) return null;
                      return (
                        <div key={role.key} style={{ marginBottom: 12 }}>
                          <div className="row" style={{ gap: 6, marginBottom: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: 99, background: role.color, flexShrink: 0 }} />
                            <span className="tiny bold" style={{ color: role.color }}>{role.label}</span>
                          </div>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                            <thead>
                              <tr style={{ borderBottom: "1px solid var(--border-2)" }}>
                                {["ชื่อ-นามสกุล","ตำแหน่ง","เบอร์โทร","Email"].map(hd => (
                                  <th key={hd} style={{ textAlign: "left", padding: "4px 10px 4px 0", fontWeight: 600, color: "var(--muted)", fontSize: 12 }}>{hd}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {contacts.map(c => (
                                <tr key={c.id} style={{ borderBottom: "1px solid var(--border-2)" }}>
                                  <td style={{ padding: "6px 10px 6px 0", fontWeight: 600 }}>{c.name}</td>
                                  <td style={{ padding: "6px 10px 6px 0", color: "var(--muted)" }}>{c.pos || "—"}</td>
                                  <td style={{ padding: "6px 10px 6px 0" }} className="mono">{c.phone || "—"}</td>
                                  <td style={{ padding: "6px 0" }} className="mono">{c.email || "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* ── Summary Report ── */}
      {reportView === "summary" && <>

      {/* Summary KPIs */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <KPI
          label="โรงพยาบาลทั้งหมด"
          value={hospitals.length}
          unit="แห่ง"
          delta={`${years.length} ปี`}
          icon="building"
        />
        <KPI
          label="Application ที่ติดตั้ง"
          value={Object.values(appCount).reduce((a, b) => a + b, 0)}
          unit="apps"
          delta="ติดตาม Monitor"
          icon="layers"
        />
        <KPI
          label="รายได้สะสม"
          value={fmtBaht(yearly.reduce((a, y) => a + y.revenue, 0))}
          delta={`เฉลี่ย/ปี ${fmtBaht(yearly.reduce((a, y) => a + y.revenue, 0) / years.length)}`}
          icon="cash"
        />
        <KPI
          label="ทีมงาน"
          value={team.length}
          unit="คน"
          delta="Active"
          icon="users"
        />
      </div>

      {/* Yearly table */}
      <div className="card">
        <div className="card-head">
          <h3>สรุปยอดติดตั้งรายปี</h3>
          <div className="row-end">
            <Chip kind="outline">YoY</Chip>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>ปี</th>
              <th>ติดตั้งจริง</th>
              <th>เป้าหมาย</th>
              <th>% ของเป้า</th>
              <th>Apps ติดตั้ง</th>
              <th>รายได้รวม</th>
              <th>Advance สะสม</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {yearly.map(y => (
              <tr key={y.year}>
                <td><span className="display bold mono" style={{ fontSize: 16 }}>{y.year}</span></td>
                <td className="num bold">{y.hospitals}</td>
                <td className="num muted">{y.target}</td>
                <td>
                  <div className="row" style={{ gap: 8, maxWidth: 200 }}>
                    <div className="progress thin" style={{ flex: 1 }}>
                      <span style={{ width: Math.min(100, y.progress) + "%" }} />
                    </div>
                    <span className="mono tiny bold" style={{ width: 38 }}>{y.progress}%</span>
                  </div>
                </td>
                <td className="num">{y.apps}</td>
                <td className="num bold">{fmtBaht(y.revenue)}</td>
                <td className="num muted">{fmtBaht(y.advance)}</td>
                <td>
                  {y.progress >= 100
                    ? <Chip kind="success"><Icon name="check" size={10} /> ถึงเป้า</Chip>
                    : y.progress >= 70 ? <Chip kind="warning">ใกล้เป้า</Chip>
                    : <Chip kind="danger">ต่ำกว่าเป้า</Chip>}
                </td>
              </tr>
            ))}
            <tr style={{ background: "var(--surface-alt)" }}>
              <td className="bold display">รวม</td>
              <td className="num bold">{yearly.reduce((a, y) => a + y.hospitals, 0)}</td>
              <td className="num muted">{yearly.reduce((a, y) => a + y.target, 0)}</td>
              <td></td>
              <td className="num bold">{yearly.reduce((a, y) => a + y.apps, 0)}</td>
              <td className="num bold">{fmtBaht(yearly.reduce((a, y) => a + y.revenue, 0))}</td>
              <td className="num muted">{fmtBaht(yearly.reduce((a, y) => a + y.advance, 0))}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Charts row */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <h3>จำนวนโรงพยาบาลรายปี</h3>
              <div className="desc">Year-on-Year — Hospitals installed</div>
            </div>
          </div>
          <div style={{ padding: 18 }}>
            <BarChart data={yoyHosp} height={220} />
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <div>
              <h3>รายได้รายปี (ล้านบาท)</h3>
              <div className="desc">Year-on-Year — Revenue (MTHB)</div>
            </div>
          </div>
          <div style={{ padding: 18 }}>
            <BarChart data={yoyRevenue.map(d => ({ ...d, color: "var(--c3)" }))} height={220} />
          </div>
        </div>
      </div>

      {/* Monthly revenue */}
      <div className="card">
        <div className="card-head">
          <div>
            <h3>รายได้สะสมรายเดือน</h3>
            <div className="desc">{selectedYearForMonthly ? `ปี ${selectedYearForMonthly}` : "รวมทุกปี"} — เดือนที่มีการเริ่มโครงการ</div>
          </div>
          <div className="row-end">
            <select 
              className="select" 
              value={selectedYearForMonthly || ""} 
              onChange={e => setSelectedYearForMonthly(e.target.value ? Number(e.target.value) : null)}
              style={{ width: "auto" }}
            >
              <option value="">รวมทุกปี</option>
              {years.map(y => <option key={y} value={y}>ปี {y}</option>)}
            </select>
          </div>
        </div>
        <div style={{ padding: 18 }}>
          <BarChart 
            data={monthlyRevenue.map(m => ({ label: m.label, value: m.valueM, color: "var(--c2)" }))} 
            height={240} 
          />
          <div className="row" style={{ marginTop: 12, gap: 16, paddingLeft: 8, flexWrap: "wrap" }}>
            {monthlyRevenue.map((m, i) => (
              <div key={i} className="row" style={{ gap: 8, alignItems: "center" }}>
                <span className="tiny bold">{m.label}</span>
                <span className="mono tiny">{fmtBaht(m.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Region + Type */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="card">
          <div className="card-head"><h3>กระจายตามภูมิภาค</h3></div>
          <div style={{ padding: 18 }}>
            <DonutChart segments={regionData} totalLabel="Sites" totalValue={hospitals.length} />
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3>ประเภทโรงพยาบาล</h3></div>
          <div className="stack" style={{ padding: 14 }}>
            {Object.entries(typeCount)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count], i) => {
                const color = ["#5B5BD6","#E89B6B","#2A8F5E","#C97B1F","#B8546D","#3877B8"][i % 6];
                const pct = Math.round((count / hospitals.length) * 100);
                return (
                  <div key={type} className="row" style={{ gap: 10, padding: 6 }}>
                    <span className="s-dot" style={{ background: color, width: 10, height: 10 }} />
                    <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{type}</span>
                    <div className="progress thin" style={{ width: 100 }}>
                      <span style={{ width: pct + "%", background: color }} />
                    </div>
                    <span className="mono bold" style={{ width: 30, textAlign: "right" }}>{count}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* HOSxP Version + DB */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="card">
          <div className="card-head">
            <h3>HOSxP Version</h3>
            <div className="desc">เวอร์ชั่นโปรแกรมที่ติดตั้ง</div>
          </div>
          <div style={{ padding: 18 }}>
            {(() => {
              const vc = {};
              hospitals.forEach(h => { if (h.hosxpVersion) vc[h.hosxpVersion] = (vc[h.hosxpVersion] || 0) + 1; });
              const data = Object.entries(vc).map(([label, value], i) => ({
                label, value,
                color: ["#5B5BD6","#E89B6B","#2A8F5E","#C97B1F","#B8546D"][i % 5],
              })).sort((a, b) => b.value - a.value);
              return <DonutChart segments={data} totalLabel="Sites" totalValue={hospitals.length} />;
            })()}
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <h3>Database Type</h3>
            <div className="desc">ประเภทฐานข้อมูลที่ใช้</div>
          </div>
          <div style={{ padding: 18 }}>
            {(() => {
              const dc = {};
              hospitals.forEach(h => { if (h.dbType) dc[h.dbType] = (dc[h.dbType] || 0) + 1; });
              const data = Object.entries(dc).map(([label, value], i) => ({
                label, value,
                color: ["#3877B8","#C97B1F","#2A8F5E","#5B5BD6","#B8546D"][i % 5],
              })).sort((a, b) => b.value - a.value);
              return <DonutChart segments={data} totalLabel="Sites" totalValue={hospitals.length} />;
            })()}
          </div>
        </div>
      </div>
      </>}

    </div>
  );
};

Object.assign(window, { ReportsScreen });
