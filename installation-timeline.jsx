// =========================================================
// Installation Timeline - Gantt chart view
// =========================================================

const InstallationTimelineScreen = ({ hospitals, year, setYear, years, team }) => {
  const [filter, setFilter] = React.useState({ status: "", region: "", type: "" });
  const [viewMode, setViewMode] = React.useState("year"); // year, month, quarter, custom
  const [selectedMonth, setSelectedMonth] = React.useState(0);
  const [dateRange, setDateRange] = React.useState({ start: "01", end: "12" }); // for custom range

  // Filter hospitals by year
  const yearHospitals = hospitals.filter(h => new Date(h.start).getFullYear() === year);

  // Apply filters
  const filtered = yearHospitals.filter(h => {
    if (filter.status && h.status !== filter.status) return false;
    if (filter.region && h.region !== filter.region) return false;
    if (filter.type && h.type !== filter.type) return false;
    return true;
  });

  // Get date range
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);
  const monthStart = new Date(year, selectedMonth, 1);
  const monthEnd = new Date(year, selectedMonth + 1, 0);
  
  // Get quarter date range (3 months)
  const quarterMonth = Math.floor(selectedMonth / 3) * 3;
  const quarterStart = new Date(year, quarterMonth, 1);
  const quarterEnd = new Date(year, quarterMonth + 3, 0);

  // Calculate pixel position and width for gantt bar
  const getGanttStyle = (start, end, mode = "year") => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    // Determine the range based on mode
    let rangeStart, rangeEnd;
    if (mode === "quarter") {
      rangeStart = quarterStart;
      rangeEnd = quarterEnd;
    } else if (mode === "month") {
      rangeStart = monthStart;
      rangeEnd = monthEnd;
    } else {
      rangeStart = yearStart;
      rangeEnd = yearEnd;
    }
    
    const totalDays = (rangeEnd - rangeStart) / (1000 * 60 * 60 * 24) + 1;
    const offsetDays = Math.max(0, (startDate - rangeStart) / (1000 * 60 * 60 * 24));
    const duration = Math.min((endDate - startDate) / (1000 * 60 * 60 * 24), totalDays - offsetDays);

    return {
      left: (offsetDays / totalDays) * 100 + "%",
      width: Math.max((duration / totalDays) * 100, 2) + "%",
    };
  };

  const regions = [...new Set(yearHospitals.map(h => h.region))];
  const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const quarterNames = ["ไตรมาส 1 (ม.ค.-มี.ค.)", "ไตรมาส 2 (เม.ย.-มิ.ย.)", "ไตรมาส 3 (ก.ค.-ก.ย.)", "ไตรมาส 4 (ต.ค.-ธ.ค.)"];

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="page-header">
        <div>
          <h1>Timeline การติดตั้ง</h1>
          <div className="sub">ดูช่วงวันที่ติดตั้งเป็น Gantt chart</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <YearPill years={years} value={year} onChange={setYear} />
        </div>
      </div>

          {/* Filter bar */}
      <div className="card card-pad" style={{ padding: 12 }}>
        <div className="row" style={{ gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <span className="tiny bold" style={{ color: "var(--muted)" }}>VIEW</span>
            <button 
              onClick={() => setViewMode("year")}
              className={"btn btn-sm " + (viewMode === "year" ? "btn-accent" : "btn-ghost")}
            >
              ทั้งปี
            </button>
            <button 
              onClick={() => setViewMode("quarter")}
              className={"btn btn-sm " + (viewMode === "quarter" ? "btn-accent" : "btn-ghost")}
            >
              3 เดือน
            </button>
            <button 
              onClick={() => setViewMode("month")}
              className={"btn btn-sm " + (viewMode === "month" ? "btn-accent" : "btn-ghost")}
            >
              รายเดือน
            </button>
          </div>

          {viewMode === "month" && (
            <select className="select" style={{ width: "auto" }} value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
              {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          )}

          {viewMode === "quarter" && (
            <select className="select" style={{ width: "auto" }} value={Math.floor(selectedMonth / 3)} onChange={e => setSelectedMonth(Number(e.target.value) * 3)}>
              {quarterNames.map((q, i) => <option key={i} value={i}>{q}</option>)}
            </select>
          )}



          <div style={{ flex: 1 }}></div>

          <span className="tiny bold" style={{ color: "var(--muted)" }}>FILTER</span>
          <select className="select" style={{ width: "auto" }} value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
            <option value="">สถานะทั้งหมด</option>
            <option>ปิดงาน</option>
            <option>กำลังติดตั้ง</option>
            <option>ยังไม่เริ่ม</option>
          </select>
          <select className="select" style={{ width: "auto" }} value={filter.region} onChange={e => setFilter({ ...filter, region: e.target.value })}>
            <option value="">ทุกภูมิภาค</option>
            {regions.map(r => <option key={r}>{r}</option>)}
          </select>
          <div className="row-end">
            <span className="tiny muted">{filtered.length} / {yearHospitals.length} รายการ</span>
            {(filter.status || filter.region || filter.type) && (
              <button className="btn btn-sm btn-ghost" onClick={() => setFilter({ status: "", region: "", type: "" })}>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Gantt chart */}
      <div className="card" style={{ overflow: "auto" }}>
        <div style={{ padding: 18, minHeight: 400 }}>
          {/* Timeline header */}
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16, marginBottom: 20 }}>
            <div className="tiny bold" style={{ color: "var(--muted)" }}>โรงพยาบาล</div>
            <div style={{ position: "relative", height: 30, borderBottom: "1px solid var(--border)" }}>
              {/* Month/Day markers */}
              <div style={{ display: "flex", height: "100%", position: "relative" }}>
                {viewMode === "year" ? (
                  Array.from({ length: 12 }).map((_, i) => {
                    const shortMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
                    return (
                      <div key={i} style={{ flex: 1, borderRight: "1px solid var(--border)", paddingLeft: 8, paddingTop: 4 }}>
                        <span className="tiny bold" style={{ color: "var(--muted)", fontSize: 10 }}>{shortMonths[i]}</span>
                      </div>
                    );
                  })
                ) : viewMode === "quarter" ? (
                  Array.from({ length: 90 }).map((_, i) => {
                    const weekNum = Math.floor(i / 7) + 1;
                    return i % 7 === 0 ? (
                      <div key={i} style={{ flex: 1, borderRight: "1px solid var(--border)", paddingLeft: 4, paddingTop: 4 }}>
                        <span className="tiny bold" style={{ color: "var(--muted)", fontSize: 9 }}>W{weekNum}</span>
                      </div>
                    ) : (
                      <div key={i} style={{ flex: 1, borderRight: "1px solid var(--border)" }}></div>
                    );
                  })
                ) : (
                  Array.from({ length: monthEnd.getDate() }).map((_, i) => (
                    <div key={i} style={{ flex: 1, borderRight: "1px solid var(--border)", paddingLeft: 4, paddingTop: 4 }}>
                      <span className="tiny bold" style={{ color: "var(--muted)", fontSize: 9 }}>{i + 1}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Gantt bars */}
          {filtered.map(h => {
            const lead = team.find(t => t.id === h.lead);
            const ganttStyle = getGanttStyle(h.start, h.end, viewMode);
            const statusColor = h.status === "ปิดงาน" ? "var(--success)" : h.status === "กำลังติดตั้ง" ? "var(--warning)" : "var(--muted)";
            
            // Check if hospital is in current view
            const startDate = new Date(h.start);
            const endDate = new Date(h.end);
            let isInView = false;
            
            if (viewMode === "year") {
              isInView = true;
            } else if (viewMode === "month") {
              isInView = (startDate.getMonth() === selectedMonth && startDate.getFullYear() === year) ||
                         (endDate.getMonth() === selectedMonth && endDate.getFullYear() === year) ||
                         (startDate < monthStart && endDate > monthEnd);
            } else if (viewMode === "quarter") {
              isInView = (startDate <= quarterEnd && endDate >= quarterStart);
            }

            if (!isInView) return null;

            // Get assigned team members (if available in hospital data)
            const teamMembers = h.assignedTeam ? h.assignedTeam.map(id => team.find(t => t.id === id)).filter(Boolean) : [];
            const teamList = lead ? [lead, ...teamMembers].filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i) : teamMembers;
            const tooltipText = teamList.length > 0 
              ? teamList.map(t => `${t.nick} (${t.fname})`).join("\n")
              : lead ? `${lead.nick} (${lead.fname})` : "ไม่มีทีม";

            return (
              <div key={h.id} style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16, marginBottom: 16, alignItems: "center" }}>
                <div>
                  <div className="display bold" style={{ fontSize: 13 }}>{h.name}</div>
                  <div className="tiny muted">{h.code}</div>
                </div>
                <div style={{ position: "relative", height: 32, background: "var(--surface-alt)", borderRadius: 4 }}>
                  <div
                    style={{
                      position: "absolute",
                      left: ganttStyle.left,
                      width: ganttStyle.width,
                      height: "100%",
                      background: statusColor,
                      borderRadius: 4,
                      opacity: 0.7,
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: 8,
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "opacity 0.2s",
                    }}
                    title={tooltipText}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "0.7";
                    }}
                  >
                    <span className="tiny bold" style={{ color: "white", whiteSpace: "nowrap" }}>
                      {h.weeks || "—"} {viewMode === "quarter" ? "สัปดาห์" : viewMode === "month" ? "วัน" : "สัปดาห์"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="empty">
              📅 ไม่พบข้อมูลที่ตรงเงื่อนไข
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="card card-pad">
        <div className="tiny bold" style={{ marginBottom: 12, color: "var(--muted)" }}>LEGEND</div>
        <div className="row" style={{ gap: 24 }}>
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <div style={{ width: 16, height: 16, background: "var(--success)", borderRadius: 2 }}></div>
            <span className="tiny">ปิดงาน</span>
          </div>
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <div style={{ width: 16, height: 16, background: "var(--warning)", borderRadius: 2 }}></div>
            <span className="tiny">กำลังติดตั้ง</span>
          </div>
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <div style={{ width: 16, height: 16, background: "var(--muted)", borderRadius: 2 }}></div>
            <span className="tiny">ยังไม่เริ่ม</span>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { InstallationTimelineScreen });
