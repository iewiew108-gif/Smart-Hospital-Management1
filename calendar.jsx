// =========================================================
// Calendar / Schedule Screen — drag & drop
// =========================================================

const CalendarScreen = ({ hospitals, setHospitals, team, year, setYear }) => {
  const [month, setMonth] = useState(new Date().getMonth());
  const [view, setView] = useState("month"); // month | timeline
  const [dragging, setDragging] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [selected, setSelected] = useState(null);
  const toast = useToast();

  const months = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
  ];
  const weekdays = ["จ","อ","พ","พฤ","ศ","ส","อา"];

  // Build month grid (start Monday)
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // 0 = Monday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ d: daysInPrev - i, dim: true, month: month - 1 });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ d, dim: false, month });
  }
  while (cells.length < 42) {
    const i = cells.length - (startOffset + daysInMonth);
    cells.push({ d: i + 1, dim: true, month: month + 1 });
  }

  // Get events that intersect a day
  const yearHosps = hospitals.filter(h => h.year === year || h.year === year - 1 || h.year === year + 1);
  const eventsForDay = (d, m) => {
    const day = new Date(year, m, d);
    return yearHosps.filter(h => {
      const s = new Date(h.start);
      const e = new Date(h.end);
      return day >= new Date(s.getFullYear(), s.getMonth(), s.getDate()) && day <= e;
    });
  };
  const isStartOfWeek = (cellIdx) => cellIdx % 7 === 0;

  const colorFor = (h) => {
    const idx = parseInt(h.id.slice(1)) % 6;
    return idx === 0 ? "" : `ev-${idx + 1}`;
  };

  const handleDragStart = (h, e) => {
    setDragging(h);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (cell, e) => {
    e.preventDefault();
    setDropTarget(`${cell.month}-${cell.d}`);
  };
  const handleDrop = (cell, e) => {
    e.preventDefault();
    if (!dragging) return;
    const newStart = new Date(year, cell.month, cell.d);
    const oldStart = new Date(dragging.start);
    const diffMs = newStart - oldStart;
    const oldEnd = new Date(dragging.end);
    const newEnd = new Date(oldEnd.getTime() + diffMs);
    const oldWar = new Date(dragging.warrantyEnd);
    const newWar = new Date(oldWar.getTime() + diffMs);
    const toISO = (d) => d.toISOString().slice(0, 10);
    setHospitals(hospitals.map(h => h.id === dragging.id ? {
      ...h,
      start: toISO(newStart),
      end: toISO(newEnd),
      warrantyEnd: toISO(newWar),
    } : h));
    toast.push(`เลื่อน "${dragging.name}" ไป ${fmtDateShort(toISO(newStart))} แล้ว`);
    setDragging(null);
    setDropTarget(null);
  };

  // Timeline view data
  const yearList = hospitals.filter(h => h.year === year).sort((a, b) => new Date(a.start) - new Date(b.start));

  const monthLabels = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

  const goPrev = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const goNext = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>ตารางติดตั้ง</h1>
          <div className="sub">ปฏิทินงานติดตั้งของทีม — ลาก-วางเพื่อเลื่อนกำหนดการ</div>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <Tabs
            items={[
              { value: "month", label: "Month" },
              { value: "timeline", label: "Timeline" },
            ]}
            value={view} onChange={setView}
          />
          <button className="btn btn-accent" onClick={() => toast.push("เพิ่มผ่านหน้าโรงพยาบาล")}>
            <Icon name="plus" size={14} /> นัดติดตั้ง
          </button>
        </div>
      </div>

      {view === "month" ? (
        <div className="card">
          <div className="card-head">
            <button className="btn btn-icon" onClick={goPrev}><Icon name="chevronLeft" size={14} /></button>
            <h3 className="display" style={{ fontSize: 18, fontWeight: 700 }}>{months[month]} {year + 543}</h3>
            <button className="btn btn-icon" onClick={goNext}><Icon name="chevronRight" size={14} /></button>
            <div className="row-end">
              <button className="btn btn-sm" onClick={() => {
                const d = new Date(); setMonth(d.getMonth()); setYear(d.getFullYear());
              }}>วันนี้</button>
              <span className="tiny muted" style={{ marginLeft: 8 }}>
                {yearList.length} งาน ในปี {year}
              </span>
            </div>
          </div>
          
          {/* Month Table View */}
          <div style={{ overflow: "auto", borderRadius: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "2px solid var(--border)", fontWeight: 700, fontSize: 13, color: "var(--muted)" }}>วันที่</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "2px solid var(--border)", fontWeight: 700, fontSize: 13, color: "var(--muted)" }}>วัน</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "2px solid var(--border)", fontWeight: 700, fontSize: 13, color: "var(--muted)" }}>รายชื่อโรงพยาบาล</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", borderBottom: "2px solid var(--border)", fontWeight: 700, fontSize: 13, color: "var(--muted)" }}>จำนวน</th>
                </tr>
              </thead>
              <tbody>
                {cells.map((cell, i) => {
                  if (cell.dim || cell.month !== month) return null;
                  
                  const events = eventsForDay(cell.d, cell.month);
                  const dateNow = new Date();
                  const isToday = cell.d === dateNow.getDate() && cell.month === dateNow.getMonth() && year === dateNow.getFullYear();
                  const dayOfWeek = new Date(year, cell.month, cell.d).toLocaleDateString("th-TH", { weekday: "short" });
                  
                  return (
                    <tr key={i} style={{ 
                      borderBottom: "1px solid var(--border)",
                      background: isToday ? "var(--primary-soft)" : "transparent",
                      hover: { background: "var(--surface-alt)" }
                    }}>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: isToday ? "var(--primary)" : "inherit" }}>
                        {cell.d}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--muted)" }}>
                        {dayOfWeek}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div className="stack" style={{ gap: 6 }}>
                          {events.map(h => (
                            <div 
                              key={h.id}
                              draggable
                              onDragStart={(e) => handleDragStart(h, e)}
                              onClick={() => setSelected(h)}
                              style={{
                                padding: "8px 12px",
                                background: "var(--surface-alt)",
                                borderRadius: 6,
                                fontSize: 12,
                                cursor: "pointer",
                                border: "1px solid var(--border)",
                                transition: "all 150ms"
                              }}
                              className="hover"
                              title={h.name}
                            >
                              <div className="display bold" style={{ fontSize: 12 }}>{h.name}</div>
                              <div className="tiny muted">{h.code}</div>
                            </div>
                          ))}
                          {events.length === 0 && (
                            <div className="tiny muted" style={{ padding: "4px 0" }}>—</div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: events.length > 0 ? "var(--accent)" : "var(--muted)" }}>
                        {events.length}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Timeline (Gantt-like) view
        <div className="card" style={{ overflow: "auto" }}>
          <div className="card-head">
            <h3>Timeline ปี {year}</h3>
            <div className="row-end tiny muted">
              ลาก ↔ เพื่อย้ายงาน · {yearList.length} โครงการ
            </div>
          </div>
          <div style={{ padding: 16, minWidth: 1000 }}>
            <div className="row" style={{ gap: 0, marginBottom: 8 }}>
              <div style={{ width: 240, flexShrink: 0 }}></div>
              <div className="row" style={{ flex: 1, gap: 0 }}>
                {monthLabels.map((m, i) => (
                  <div key={i} style={{
                    flex: 1, fontSize: 11, color: "var(--muted)",
                    fontFamily: "var(--font-mono)", textAlign: "center",
                    borderLeft: i > 0 ? "1px solid var(--border-2)" : "none",
                    padding: "4px 0",
                  }}>{m}</div>
                ))}
              </div>
            </div>
            <div className="stack" style={{ gap: 6 }}>
              {yearList.map(h => {
                const s = new Date(h.start);
                const e = new Date(h.end);
                const startDay = (s.getMonth() * 30 + s.getDate()) / (12 * 30);
                const endDay = (e.getMonth() * 30 + e.getDate()) / (12 * 30);
                const lead = team.find(t => t.id === h.lead);
                return (
                  <div key={h.id} className="row" style={{ gap: 0, position: "relative" }}>
                    <div style={{ width: 240, flexShrink: 0, paddingRight: 8 }} className="row">
                      {lead && <Avatar name={lead.nick} color={lead.avatar} />}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name}</div>
                        <div className="tiny muted">{h.code}</div>
                      </div>
                    </div>
                    <div style={{ flex: 1, position: "relative", height: 32, background: "repeating-linear-gradient(to right, transparent 0, transparent calc(100%/12 - 1px), var(--border-2) calc(100%/12 - 1px), var(--border-2) calc(100%/12))", borderRadius: 4 }}>
                      <div
                        onClick={() => setSelected(h)}
                        style={{
                          position: "absolute",
                          top: 4, bottom: 4,
                          left: `${startDay * 100}%`,
                          width: `${(endDay - startDay) * 100}%`,
                          background: h.status === "ปิดงาน" ? "var(--success-soft)" : h.status === "รอเริ่ม" ? "var(--bg-2)" : "var(--accent-soft)",
                          borderLeft: `3px solid ${h.status === "ปิดงาน" ? "var(--success)" : h.status === "รอเริ่ม" ? "var(--muted-2)" : "var(--accent)"}`,
                          borderRadius: 4,
                          padding: "2px 8px",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--ink-2)",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                        title={`${h.name} (${fmtDate(h.start)} - ${fmtDate(h.end)})`}
                      >
                        <span>{h.weeks}w</span>
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{h.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Modal
        open={selected != null}
        onClose={() => setSelected(null)}
        title={selected?.name}
        sub="รายละเอียดงานติดตั้ง"
        footer={<button className="btn" onClick={() => setSelected(null)}>ปิด</button>}
      >
        {selected && (
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InfoRow icon="clock" label="เริ่ม" value={fmtDate(selected.start)} />
            <InfoRow icon="clock" label="สิ้นสุด" value={fmtDate(selected.end)} />
            <InfoRow icon="award" label="ประกัน" value={fmtDate(selected.warrantyEnd)} />
            <InfoRow icon="layers" label="ประเภทงาน" value={selected.workType} />
            <InfoRow icon="pin" label="จังหวัด" value={selected.province} />
            <InfoRow icon="cash" label="มูลค่า" value={fmtBaht(selected.price)} />
          </div>
        )}
      </Modal>
    </div>
  );
};

Object.assign(window, { CalendarScreen });
