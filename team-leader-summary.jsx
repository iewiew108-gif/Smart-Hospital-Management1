// =========================================================
// Team Leader Summary — สรุปยอดหัวหน้าทีมรายคน (ตารางเปรียบเทียบ)
// =========================================================

const STATUS_GROUPS = {
  done:    ["ปิดงาน", "ติดตั้งเสร็จ", "เก็บได้แล้วเงินแล้ว", "ในประกัน"],
  inprog:  ["กำลังติดตั้ง", "ทดสอบระบบ", "Confirm site แล้ว"],
  pending: ["รอเริ่ม", "วางไซต์ไว้", "รอ Confirm site"],
  problem: ["ติดปัญหาเก็บเงินไม่ได้"],
};

const STATUS_DOT = {
  "ปิดงาน":                   "#22c55e",
  "ติดตั้งเสร็จ":             "#22c55e",
  "เก็บได้แล้วเงินแล้ว":     "#16a34a",
  "ในประกัน":                 "#4ade80",
  "กำลังติดตั้ง":             "#3b82f6",
  "ทดสอบระบบ":                "#8b5cf6",
  "Confirm site แล้ว":        "#06b6d4",
  "รอ Confirm site":          "#f59e0b",
  "รอเริ่ม":                  "#94a3b8",
  "วางไซต์ไว้":               "#cbd5e1",
  "ติดปัญหาเก็บเงินไม่ได้":  "#ef4444",
};

const TeamLeaderSummary = ({ hospitals, team, year }) => {
  const [filterYear, setFilterYear] = useState(year || "all");
  const [dateStart,  setDateStart]  = useState("");
  const [dateEnd,    setDateEnd]    = useState("");
  const [search,     setSearch]     = useState("");
  const [sortKey,    setSortKey]    = useState("total");
  const [sortDir,    setSortDir]    = useState(-1); // -1 = desc
  const [expanded,   setExpanded]   = useState({}); // { leadId: bool }

  const allYears = [...new Set(hospitals.map(h => h.year))].filter(Boolean).sort();

  // ── กรองโรงพยาบาล ────────────────────────────────────
  const filteredHosps = hospitals.filter(h => {
    if (filterYear !== "all" && h.year !== Number(filterYear)) return false;
    if (dateStart || dateEnd) {
      const hDate = h.start ? new Date(h.start) : null;
      if (!hDate) return false;
      if (dateStart && hDate < new Date(dateStart)) return false;
      if (dateEnd   && hDate > new Date(dateEnd))   return false;
    }
    return true;
  });

  // ── จัดกลุ่มตามหัวหน้าทีม ────────────────────────────
  const leadMap = {};
  filteredHosps.forEach(h => {
    const lid = h.lead;
    if (!lid) return;
    if (!leadMap[lid]) leadMap[lid] = [];
    leadMap[lid].push(h);
  });

  const summaries = Object.entries(leadMap).map(([leadId, hosps]) => {
    const m = team.find(t => t.id === leadId);
    const done    = hosps.filter(h => STATUS_GROUPS.done.includes(h.status)).length;
    const inprog  = hosps.filter(h => STATUS_GROUPS.inprog.includes(h.status)).length;
    const pending = hosps.filter(h => STATUS_GROUPS.pending.includes(h.status)).length;
    const problem = hosps.filter(h => STATUS_GROUPS.problem.includes(h.status)).length;
    const revenue = hosps.reduce((a, h) => a + (h.price || 0), 0);
    const pct     = hosps.length > 0 ? Math.round((done / hosps.length) * 100) : 0;
    return {
      leadId,
      nick:     m?.nick    || leadId,
      name:     m ? `${m.fname || ""} ${m.lname || ""}`.trim() : leadId,
      posShort: m?.posShort || "",
      total: hosps.length, done, inprog, pending, problem, revenue, pct,
      hosps,
    };
  });

  // ── กรองชื่อ + เรียง ──────────────────────────────────
  const sorted = summaries
    .filter(s => !search || s.nick.includes(search) || s.name.includes(search))
    .sort((a, b) => {
      const v = (x) => {
        if (sortKey === "nick")    return x.nick;
        if (sortKey === "total")   return x.total;
        if (sortKey === "done")    return x.done;
        if (sortKey === "inprog")  return x.inprog;
        if (sortKey === "pending") return x.pending;
        if (sortKey === "problem") return x.problem;
        if (sortKey === "pct")     return x.pct;
        if (sortKey === "revenue") return x.revenue;
        return x.total;
      };
      return typeof v(a) === "string"
        ? sortDir * v(a).localeCompare(v(b))
        : sortDir * (v(a) - v(b));
    });

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => -d);
    else { setSortKey(key); setSortDir(-1); }
  };
  const SortArrow = ({ k }) => sortKey === k
    ? <span style={{ marginLeft: 3, opacity: 0.7 }}>{sortDir === -1 ? "▼" : "▲"}</span>
    : null;

  const toggleExpand = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  // ── KPI รวม ───────────────────────────────────────────
  const kTotal   = filteredHosps.length;
  const kDone    = filteredHosps.filter(h => STATUS_GROUPS.done.includes(h.status)).length;
  const kInprog  = filteredHosps.filter(h => STATUS_GROUPS.inprog.includes(h.status)).length;
  const kPending = filteredHosps.filter(h => STATUS_GROUPS.pending.includes(h.status)).length;
  const kProblem = filteredHosps.filter(h => STATUS_GROUPS.problem.includes(h.status)).length;
  const kRevenue = filteredHosps.reduce((a, h) => a + (h.price || 0), 0);
  const noLead   = filteredHosps.filter(h => !h.lead).length;

  // ── Column header helper ──────────────────────────────
  const TH = ({ col, children, align = "center" }) => (
    <th
      onClick={() => toggleSort(col)}
      style={{
        padding: "10px 12px", fontSize: 13, fontWeight: 600,
        color: sortKey === col ? "var(--accent)" : "var(--muted)",
        cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
        textAlign: align, borderBottom: "2px solid var(--border-1)",
        background: "var(--bg-2)",
      }}
    >
      {children}<SortArrow k={col} />
    </th>
  );

  const TD = ({ children, center, bold, color, style: s }) => (
    <td style={{
      padding: "10px 12px", fontSize: 14,
      textAlign: center ? "center" : "left",
      fontWeight: bold ? 700 : 400,
      color: color || "inherit",
      verticalAlign: "middle",
      ...s,
    }}>
      {children}
    </td>
  );

  const pctColor = (p) => p >= 80 ? "#22c55e" : p >= 40 ? "#f59e0b" : "#94a3b8";

  const thaiDate = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    const months = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
    return `${parseInt(d,10)} ${months[parseInt(m,10)-1]} ${parseInt(y,10)+543}`;
  };

  return (
    <div>
      {/* ── KPI Bar ─────────────────────────────────────── */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "รพ.ทั้งหมด",      value: kTotal,   color: "#5B5BD6" },
          { label: "ติดตั้งเสร็จ",    value: kDone,    color: "#22c55e" },
          { label: "กำลังดำเนินการ",  value: kInprog,  color: "#3b82f6" },
          { label: "รอดำเนินการ",     value: kPending, color: "#f59e0b" },
          { label: "ติดปัญหา",        value: kProblem, color: "#ef4444" },
          { label: "มูลค่ารวม",       value: kRevenue > 0 ? `฿${kRevenue.toLocaleString()}` : "—", color: "#8b5cf6" },
        ].map(k => (
          <div key={k.label} className="card card-pad" style={{ borderTop: `3px solid ${k.color}`, padding: "12px 14px" }}>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 2 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* ── Filter bar ──────────────────────────────────── */}
      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          {/* Year */}
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>ปี</div>
            <select className="input" style={{ minWidth: 150, fontSize: 14 }}
              value={filterYear} onChange={e => setFilterYear(e.target.value)}>
              <option value="all">ทุกปี</option>
              {allYears.map(y => (
                <option key={y} value={y}>ปี {y + 543} ({y})</option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>วันที่ติดตั้ง (เริ่ม)</div>
            <input type="date" className="input" style={{ fontSize: 14 }}
              value={dateStart} onChange={e => setDateStart(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>วันที่ติดตั้ง (สิ้นสุด)</div>
            <input type="date" className="input" style={{ fontSize: 14 }}
              value={dateEnd} onChange={e => setDateEnd(e.target.value)} />
          </div>
          {(dateStart || dateEnd) && (
            <button className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-end" }}
              onClick={() => { setDateStart(""); setDateEnd(""); }}>
              ล้างวันที่
            </button>
          )}

          {/* Search */}
          <div style={{ marginLeft: "auto" }}>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>ค้นหา</div>
            <input className="input" style={{ minWidth: 200, fontSize: 14 }}
              placeholder="ชื่อเล่น / ชื่อ-นามสกุล…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {(dateStart || dateEnd) && (
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--accent)" }}>
            กรองช่วงวันที่ติดตั้ง: {dateStart ? thaiDate(dateStart) : "—"} ถึง {dateEnd ? thaiDate(dateEnd) : "—"}
          </div>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────── */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ width: 40, padding: "10px 12px", background: "var(--bg-2)", borderBottom: "2px solid var(--border-1)", fontSize: 13, color: "var(--muted)" }}>#</th>
                <TH col="nick" align="left">หัวหน้าทีม</TH>
                <TH col="total">รวม</TH>
                <TH col="done">ติดตั้งเสร็จ<br/><span style={{fontWeight:400,fontSize:11}}>ปิดงาน</span></TH>
                <TH col="inprog">กำลัง<br/><span style={{fontWeight:400,fontSize:11}}>ดำเนินการ</span></TH>
                <TH col="pending">รอ<br/><span style={{fontWeight:400,fontSize:11}}>ดำเนินการ</span></TH>
                <TH col="problem">ติดปัญหา</TH>
                <TH col="pct">% เสร็จ</TH>
                <TH col="revenue">มูลค่า</TH>
                <th style={{ width: 80, padding: "10px 12px", background: "var(--bg-2)", borderBottom: "2px solid var(--border-1)", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: 40, color: "var(--muted)", fontSize: 14 }}>
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : sorted.map((s, idx) => (
                <React.Fragment key={s.leadId}>
                  {/* ── แถวข้อมูลหัวหน้าทีม ── */}
                  <tr style={{
                    borderBottom: expanded[s.leadId] ? "none" : "1px solid var(--border-1)",
                    background: expanded[s.leadId] ? "#f8faff" : (idx % 2 === 0 ? "#fff" : "var(--bg-2)"),
                    transition: "background 0.15s",
                  }}>
                    <td style={{ padding: "10px 12px", textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
                      {idx + 1}
                    </td>
                    {/* ชื่อ */}
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: "50%",
                          background: "linear-gradient(135deg,#667eea,#764ba2)",
                          color: "#fff", display: "flex", alignItems: "center",
                          justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0,
                        }}>
                          {s.nick?.slice(0, 2) || "?"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{s.nick}</div>
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>{s.name}</div>
                        </div>
                      </div>
                    </td>
                    {/* ตัวเลข */}
                    <TD center bold color="#5B5BD6">{s.total}</TD>
                    <TD center bold color="#22c55e">{s.done}</TD>
                    <TD center bold color="#3b82f6">{s.inprog}</TD>
                    <TD center bold color="#f59e0b">{s.pending}</TD>
                    <TD center bold color={s.problem > 0 ? "#ef4444" : "var(--muted)"}>{s.problem}</TD>
                    {/* Progress */}
                    <td style={{ padding: "10px 12px", minWidth: 100 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{
                            height: "100%", borderRadius: 3,
                            width: `${s.pct}%`,
                            background: pctColor(s.pct),
                            transition: "width 0.4s",
                          }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: pctColor(s.pct), minWidth: 32, textAlign: "right" }}>
                          {s.pct}%
                        </span>
                      </div>
                    </td>
                    {/* มูลค่า */}
                    <TD center color="#8b5cf6" style={{ fontSize: 13 }}>
                      {s.revenue > 0 ? `฿${s.revenue.toLocaleString()}` : "—"}
                    </TD>
                    {/* ปุ่ม expand */}
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: 12, padding: "4px 10px" }}
                        onClick={() => toggleExpand(s.leadId)}
                      >
                        {expanded[s.leadId] ? "▲ ซ่อน" : `▼ ดู ${s.total} รพ.`}
                      </button>
                    </td>
                  </tr>

                  {/* ── แถวขยาย: รายชื่อโรงพยาบาล ── */}
                  {expanded[s.leadId] && (
                    <tr>
                      <td colSpan={10} style={{
                        padding: "0 0 0 60px",
                        background: "#f0f4ff",
                        borderBottom: "1px solid var(--border-1)",
                      }}>
                        <div style={{ padding: "12px 16px 16px" }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 8 }}>
                            รายชื่อโรงพยาบาลในความรับผิดชอบ ({s.hosps.length} แห่ง)
                          </div>
                          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                            <thead>
                              <tr style={{ background: "#f8fafc" }}>
                                {["#","ชื่อโรงพยาบาล","รหัส Taiga","ประเภท","วันที่เริ่ม","วันที่แล้วเสร็จ","สถานะ","มูลค่า"].map(h => (
                                  <th key={h} style={{ padding: "7px 10px", fontSize: 12, fontWeight: 600, color: "var(--muted)", textAlign: h === "#" || h === "มูลค่า" ? "center" : "left", borderBottom: "1px solid var(--border-1)" }}>
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {s.hosps.map((h, hi) => (
                                <tr key={h.id} style={{ borderBottom: "1px solid var(--border-1)", background: hi % 2 === 0 ? "#fff" : "#fafbff" }}>
                                  <td style={{ padding: "7px 10px", textAlign: "center", fontSize: 12, color: "var(--muted)" }}>{hi + 1}</td>
                                  <td style={{ padding: "7px 10px", fontSize: 13, fontWeight: 600 }}>{h.name}</td>
                                  <td style={{ padding: "7px 10px", fontSize: 12, color: "var(--muted)" }}>{h.code || "—"}</td>
                                  <td style={{ padding: "7px 10px", fontSize: 12 }}>{h.type || "—"}</td>
                                  <td style={{ padding: "7px 10px", fontSize: 12 }}>{thaiDate(h.start) || "—"}</td>
                                  <td style={{ padding: "7px 10px", fontSize: 12 }}>{thaiDate(h.end) || "—"}</td>
                                  <td style={{ padding: "7px 10px" }}>
                                    <span style={{
                                      display: "inline-flex", alignItems: "center", gap: 5,
                                      padding: "2px 8px", borderRadius: 12, fontSize: 11,
                                      background: `${STATUS_DOT[h.status] || "#94a3b8"}18`,
                                      color: STATUS_DOT[h.status] || "#94a3b8",
                                      border: `1px solid ${STATUS_DOT[h.status] || "#94a3b8"}40`,
                                      fontWeight: 600,
                                    }}>
                                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_DOT[h.status] || "#94a3b8", flexShrink: 0 }} />
                                      {h.status || "—"}
                                    </span>
                                  </td>
                                  <td style={{ padding: "7px 10px", fontSize: 12, textAlign: "center", color: "#8b5cf6" }}>
                                    {h.price > 0 ? `฿${h.price.toLocaleString()}` : "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

              {/* แถวรวมท้าย */}
              {sorted.length > 0 && (
                <tr style={{ background: "#f0f4ff", borderTop: "2px solid var(--border-1)" }}>
                  <td colSpan={2} style={{ padding: "10px 12px", fontWeight: 700, fontSize: 13 }}>รวมทั้งหมด ({sorted.length} คน)</td>
                  <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, color: "#5B5BD6" }}>{sorted.reduce((a,s)=>a+s.total,0)}</td>
                  <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, color: "#22c55e" }}>{sorted.reduce((a,s)=>a+s.done,0)}</td>
                  <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, color: "#3b82f6" }}>{sorted.reduce((a,s)=>a+s.inprog,0)}</td>
                  <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, color: "#f59e0b" }}>{sorted.reduce((a,s)=>a+s.pending,0)}</td>
                  <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, color: "#ef4444" }}>{sorted.reduce((a,s)=>a+s.problem,0)}</td>
                  <td style={{ padding: "10px 12px" }}>
                    {(() => {
                      const t = sorted.reduce((a,s)=>a+s.total,0);
                      const d = sorted.reduce((a,s)=>a+s.done,0);
                      const p = t > 0 ? Math.round((d/t)*100) : 0;
                      return (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${p}%`, background: pctColor(p), borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: pctColor(p), minWidth: 32, textAlign: "right" }}>{p}%</span>
                        </div>
                      );
                    })()}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, color: "#8b5cf6", fontSize: 13 }}>
                    {(() => { const r = sorted.reduce((a,s)=>a+s.revenue,0); return r > 0 ? `฿${r.toLocaleString()}` : "—"; })()}
                  </td>
                  <td />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* หมายเหตุ */}
      {noLead > 0 && (
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>
          * มี {noLead} โรงพยาบาลที่ยังไม่ได้ระบุหัวหน้าทีม (ไม่แสดงในตาราง)
        </div>
      )}

      {/* Legend */}
      <div style={{ marginTop: 12, display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "var(--muted)" }}>
        {[
          ["ติดตั้งเสร็จ/ปิดงาน","#22c55e"],
          ["กำลังดำเนินการ","#3b82f6"],
          ["ทดสอบระบบ","#8b5cf6"],
          ["Confirm site แล้ว","#06b6d4"],
          ["รอ Confirm site","#f59e0b"],
          ["รอเริ่ม","#94a3b8"],
          ["ติดปัญหา","#ef4444"],
        ].map(([label, color]) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { TeamLeaderSummary });
