// =========================================================
// Team Schedule - Timeline รายคน Onsite
// =========================================================

const fmtThaiDateSched = (iso) => {
  if (!iso) return "—";
  const months = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  const [y, m, d] = iso.split("-");
  return `${parseInt(d,10)} ${months[parseInt(m,10)-1]} ${parseInt(y,10)+543}`;
};

const TeamScheduleScreen = ({ hospitals, year, setYear, years, team }) => {
  const [sortBy, setSortBy] = React.useState("name"); // name, onsite-days, current-active
  const [viewMode, setViewMode] = React.useState("year"); // year, month, quarter
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth());
  const [tooltip, setTooltip] = React.useState({ visible: false, x: 0, y: 0, range: null });

  // Filter hospitals by year
  const yearHospitals = hospitals.filter((h) => new Date(h.start).getFullYear() === year);

  // Calculate team statistics
  const teamStats = team.map((member) => {
    // Find all hospitals where this member is involved
    const asLead = yearHospitals.filter((h) => h.lead === member.id);
    const asTeam = yearHospitals.filter((h) => h.team.includes(member.id));
    const allProjects = [...new Set([...asLead, ...asTeam])];

    // Calculate total onsite days
    let totalDays = 0;
    const dateRanges = [];
    allProjects.forEach((h) => {
      const start = new Date(h.start);
      const end = new Date(h.end);
      const days = (end - start) / (1000 * 60 * 60 * 24);
      totalDays += days;
      dateRanges.push({ start, end, hospital: h.name, startIso: h.start, endIso: h.end });
    });

    // Check if currently active (onsite now)
    const now = new Date();
    const isCurrentlyActive = allProjects.some((h) => {
      const start = new Date(h.start);
      const end = new Date(h.end);
      return now >= start && now <= end;
    });

    // Get current active project
    const currentProject = allProjects.find((h) => {
      const start = new Date(h.start);
      const end = new Date(h.end);
      return now >= start && now <= end;
    });

    return {
      id: member.id,
      name: member.nick,
      avatar: member.avatar,
      projects: allProjects,
      asLead: asLead.length,
      asTeam: asTeam.length,
      totalDays: Math.round(totalDays),
      dateRanges,
      isCurrentlyActive,
      currentProject
    };
  });

  // Sort team
  const sortedTeam = [...teamStats].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "onsite-days") return b.totalDays - a.totalDays;
    if (sortBy === "current-active") return (b.isCurrentlyActive ? 1 : 0) - (a.isCurrentlyActive ? 1 : 0);
    return 0;
  });

  // Get date range for this year
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);
  const monthStart = new Date(year, selectedMonth, 1);
  const monthEnd = new Date(year, selectedMonth + 1, 0);
  const quarterStart = new Date(year, Math.floor(selectedMonth / 3) * 3, 1);
  const quarterEnd = new Date(year, Math.floor(selectedMonth / 3) * 3 + 3, 0);

  // Calculate pixel position and width for timeline bar
  const getTimelineStyle = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    let rangeStart, rangeEnd;
    if (viewMode === "month") {
      rangeStart = monthStart;
      rangeEnd = monthEnd;
    } else if (viewMode === "quarter") {
      rangeStart = quarterStart;
      rangeEnd = quarterEnd;
    } else {
      rangeStart = yearStart;
      rangeEnd = yearEnd;
    }

    const totalDays = (rangeEnd - rangeStart) / (1000 * 60 * 60 * 24);
    const offsetDays = Math.max(0, (startDate - rangeStart) / (1000 * 60 * 60 * 24));
    const duration = Math.min((endDate - rangeStart) / (1000 * 60 * 60 * 24) - offsetDays, totalDays - offsetDays);

    return {
      left: offsetDays / totalDays * 100 + "%",
      width: Math.max(duration / totalDays * 100, 1) + "%"
    };
  };

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="page-header">
        <div>
          <h1>ตารางทีมงาน</h1>
          <div className="sub">ดูช่วง Onsite ของแต่ละสมาชิก</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <span className="tiny bold" style={{ color: "var(--muted)" }}>VIEW</span>
            <button
              onClick={() => setViewMode("year")}
              className={"btn btn-sm " + (viewMode === "year" ? "btn-accent" : "btn-ghost")}>
              
              ทั้งปี
            </button>
            <button
              onClick={() => setViewMode("quarter")}
              className={"btn btn-sm " + (viewMode === "quarter" ? "btn-accent" : "btn-ghost")}>
              
              3 เดือน
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={"btn btn-sm " + (viewMode === "month" ? "btn-accent" : "btn-ghost")}>
              
              รายเดือน
            </button>
          </div>

          {viewMode === "month" &&
          <select className="select" style={{ width: "auto" }} value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
              {["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"].map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          }

          {viewMode === "quarter" &&
          <select className="select" style={{ width: "auto" }} value={Math.floor(selectedMonth / 3)} onChange={(e) => setSelectedMonth(Number(e.target.value) * 3)}>
              <option value="0">Q1 (ม.ค. - มี.ค.)</option>
              <option value="1">Q2 (เม.ย. - มิ.ย.)</option>
              <option value="2">Q3 (ก.ค. - ก.ย.)</option>
              <option value="3">Q4 (ต.ค. - ธ.ค.)</option>
            </select>
          }

          <YearPill years={years} value={year} onChange={setYear} />
        </div>
      </div>

      {/* Timeline header */}
      <div className="card" style={{ overflow: "auto" }}>
        <div style={{ padding: 18 }}>
          {/* Month markers */}
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16, marginBottom: 20 }}>
            <div className="tiny bold" style={{ color: "var(--muted)" }}>สมาชิกทีม</div>
            <div style={{ position: "relative", height: 30, borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", height: "100%", position: "relative" }}>
                {viewMode === "year" ?
                Array.from({ length: 12 }).map((_, i) => {
                  const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
                  return (
                    <div key={i} style={{ flex: 1, borderRight: "1px solid var(--border)", paddingLeft: 8, paddingTop: 4 }}>
                        <span className="tiny bold" style={{ color: "var(--muted)", fontSize: 10 }}>{monthNames[i]}</span>
                      </div>);

                }) :
                viewMode === "quarter" ?
                Array.from({ length: 90 }).map((_, i) => {
                  const weekNum = Math.floor(i / 7) + 1;
                  return i % 7 === 0 ?
                  <div key={i} style={{ flex: 1, borderRight: "1px solid var(--border)", paddingLeft: 4, paddingTop: 4 }}>
                        <span className="tiny bold" style={{ color: "var(--muted)", fontSize: 9 }}>W{weekNum}</span>
                      </div> :

                  <div key={i} style={{ flex: 1, borderRight: "1px solid var(--border)" }}></div>;

                }) :

                Array.from({ length: monthEnd.getDate() }).map((_, i) =>
                <div key={i} style={{ flex: 1, borderRight: "1px solid var(--border)", paddingLeft: 4, paddingTop: 4 }}>
                      <span className="tiny bold" style={{ color: "var(--muted)", fontSize: 9 }}>{i + 1}</span>
                    </div>
                )
                }
              </div>
            </div>
          </div>

          {/* Team timeline bars */}
          {sortedTeam.map((member) => {
            // Filter projects by view mode
            const filteredRanges = member.dateRanges.filter((range) => {
              const startDate = new Date(range.start);
              const endDate = new Date(range.end);

              if (viewMode === "month") {
                return startDate <= monthEnd && endDate >= monthStart;
              } else if (viewMode === "quarter") {
                return startDate <= quarterEnd && endDate >= quarterStart;
              }
              return true; // year mode shows all
            });

            return (
              <div key={member.id} style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
              <div>
                <div className="row" style={{ gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <Avatar name={member.name} color={member.avatar} />
                  <div>
                    <div className="display bold" style={{ fontSize: 13 }}>{member.name}</div>
                    {member.isCurrentlyActive &&
                      <Chip kind="success" className="tiny" style={{ marginTop: 2 }}>
                        <Icon name="play" size={9} /> ทำงาน
                      </Chip>
                      }
                  </div>
                </div>
                <div className="tiny muted">
                  {member.asLead} หัวหน้า · {member.asTeam} สมาชิก
                </div>
                <div className="tiny bold" style={{ marginTop: 4, color: "var(--primary)" }}>
                  {filteredRanges.reduce((sum, r) => sum + Math.round((new Date(r.end) - new Date(r.start)) / (1000 * 60 * 60 * 24)), 0)} วัน
                </div>
              </div>

              <div style={{ position: "relative", minHeight: 60 }}>
                {/* Timeline background */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 40, background: "var(--surface-alt)", borderRadius: 4 }}>
                  {/* Project bars */}
                  {filteredRanges.map((range, i) => {
                      const style = getTimelineStyle(range.start, range.end);
                      const isCurrentProject = member.currentProject?.name === range.hospital;
                      const isHovered = tooltip.range === range;

                      return (
                        <div
                          key={i}
                          style={{
                            position: "absolute",
                            left: style.left,
                            width: style.width,
                            height: 28,
                            top: 6,
                            background: isCurrentProject ? "var(--primary)" : "var(--accent)",
                            borderRadius: 3,
                            opacity: isHovered ? 1 : isCurrentProject ? 1 : 0.6,
                            display: "flex",
                            alignItems: "center",
                            paddingLeft: 6,
                            paddingRight: 6,
                            overflow: "hidden",
                            cursor: "pointer",
                            fontSize: "12px",
                            transition: "opacity 0.15s",
                          }}
                          onMouseEnter={(e) => setTooltip({ visible: true, x: e.clientX, y: e.clientY, range })}
                          onMouseMove={(e)  => setTooltip(t => ({ ...t, x: e.clientX, y: e.clientY }))}
                          onMouseLeave={()  => setTooltip({ visible: false, x: 0, y: 0, range: null })}
                        >
                          <span className="tiny bold" style={{ color: "white", whiteSpace: "nowrap", fontSize: "12px" }}>
                            {range.hospital.substring(0, 12)}
                          </span>
                        </div>);
                    })}
                </div>

                {/* Current day marker */}
                {(() => {
                    let markerStart, markerEnd;
                    if (viewMode === "month") {
                      markerStart = monthStart;
                      markerEnd = monthEnd;
                    } else if (viewMode === "quarter") {
                      markerStart = quarterStart;
                      markerEnd = quarterEnd;
                    } else {
                      markerStart = yearStart;
                      markerEnd = yearEnd;
                    }

                    const now = new Date();
                    if (now >= markerStart && now <= markerEnd) {
                      const totalDays = (markerEnd - markerStart) / (1000 * 60 * 60 * 24);
                      const offsetDays = (now - markerStart) / (1000 * 60 * 60 * 24);
                      const leftPercent = offsetDays / totalDays * 100;

                      return (
                        <div
                          style={{
                            position: "absolute",
                            left: leftPercent + "%",
                            top: 0,
                            bottom: 0,
                            width: 2,
                            background: "var(--danger)",
                            zIndex: 10
                          }}>
                    </div>);

                    }
                    return null;
                  })()}

                {/* Tooltip */}
                {member.currentProject &&
                  <div className="tiny muted" style={{ marginTop: 44, paddingLeft: 6 }}>
                    อยู่ที่: <span className="bold">{member.currentProject.name}</span>
                  </div>
                  }
              </div>
            </div>);

          })}

          {sortedTeam.length === 0 &&
          <div className="empty">
              <Icon name="users" size={20} />
              ไม่มีข้อมูลทีมงาน
            </div>
          }
        </div>
      </div>

      {/* Legend */}
      <div className="card card-pad">
        <div className="tiny bold" style={{ marginBottom: 12, color: "var(--muted)" }}>LEGEND</div>
        <div className="row" style={{ gap: 24 }}>
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <div style={{ width: 16, height: 16, background: "var(--primary)", borderRadius: 2 }}></div>
            <span className="tiny">กำลังทำงาน</span>
          </div>
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <div style={{ width: 16, height: 16, background: "var(--accent)", borderRadius: 2, opacity: 0.6 }}></div>
            <span className="tiny">ที่ผ่านมา</span>
          </div>
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <div style={{ width: 2, height: 16, background: "var(--danger)" }}></div>
            <span className="tiny">วันนี้</span>
          </div>
        </div>
      </div>

      {/* Custom Tooltip */}
      {tooltip.visible && tooltip.range && (
        <div style={{
          position: "fixed",
          left: tooltip.x + 14,
          top: tooltip.y - 80,
          zIndex: 9999,
          background: "#1e293b",
          color: "#f8fafc",
          borderRadius: 10,
          padding: "10px 14px",
          pointerEvents: "none",
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          minWidth: 220,
          fontSize: 13,
          lineHeight: 1.7,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 14, color: "#e2e8f0" }}>
            {tooltip.range.hospital}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#94a3b8", fontSize: 12 }}>
            <span style={{ color: "#4ade80", fontWeight: 600 }}>▶</span>
            <span>เริ่มเข้าไซต์</span>
            <span style={{ marginLeft: "auto", color: "#f8fafc", fontWeight: 600 }}>
              {fmtThaiDateSched(tooltip.range.startIso)}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#94a3b8", fontSize: 12 }}>
            <span style={{ color: "#f87171", fontWeight: 600 }}>■</span>
            <span>จบไซต์</span>
            <span style={{ marginLeft: "auto", color: "#f8fafc", fontWeight: 600 }}>
              {fmtThaiDateSched(tooltip.range.endIso)}
            </span>
          </div>
        </div>
      )}
    </div>);

};

Object.assign(window, { TeamScheduleScreen });