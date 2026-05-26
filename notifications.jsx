// =========================================================
// Advance Reminder & Notifications + Birthday Reminders
// =========================================================

// Compute birthday reminders for team members
const computeBirthdayReminders = (team) => {
  const today = new Date(); 
  today.setHours(0, 0, 0, 0);
  const reminders = [];

  team.forEach(t => {
    if (!t.bday) return; // skip if no birthday
    
    const [year, month, day] = t.bday.split('-');
    const currentYear = today.getFullYear();
    
    // Create birthday date for this year
    let bday = new Date(currentYear, parseInt(month) - 1, parseInt(day));
    bday.setHours(0, 0, 0, 0);
    
    // If birthday has passed this year, check next year
    if (bday < today) {
      bday = new Date(currentYear + 1, parseInt(month) - 1, parseInt(day));
      bday.setHours(0, 0, 0, 0);
    }
    
    const daysUntil = Math.round((bday - today) / 86400000);
    
    // Check if within 7 days before or on birthday
    if (daysUntil < 0 || daysUntil > 7) return;
    
    let level = "info";
    let title = "";
    
    if (daysUntil === 0) {
      level = "accent";
      title = "🎂 วันเกิดวันนี้!";
    } else if (daysUntil === 1) {
      title = "🎂 วันเกิดพรุ่งนี้!";
    } else {
      title = `🎂 วันเกิดในอีก ${daysUntil} วัน`;
    }
    
    const age = currentYear - parseInt(year);
    
    reminders.push({
      id: `bday-${t.id}`,
      type: "birthday",
      memberId: t.id,
      memberName: t.fname + " " + t.lname,
      memberNick: t.nick,
      memberAvatar: t.avatar,
      level,
      title,
      daysUntil,
      age,
      birthdayDate: bday,
    });
  });

  return reminders.sort((a, b) => a.daysUntil - b.daysUntil);
};

// Compute advance reminders based on today's date
const computeReminders = (hospitals, team) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const reminders = [];

  hospitals.forEach(h => {
    if (!h.start) return;
    const start = new Date(h.start); start.setHours(0, 0, 0, 0);
    const days = Math.round((start - today) / 86400000);
    const needsAdvance = h.advance === "ยังไม่ Advance" || h.advance === "บางส่วน";
    if (!needsAdvance) return;
    if (days < -3) return; // too far in past

    let level = null;
    let title = "";
    let body = "";
    if (days <= 28 && days > 21) {
      level = "info";
      title = "แจ้งเตือนครั้งที่ 1 · เหลือ 4 สัปดาห์ก่อนเข้าไซต์";
      body = `เตรียมทำ Advance ก่อนเข้าไซต์โครงการ ${h.name}`;
    } else if (days <= 21 && days > 14) {
      level = "warning";
      title = "แจ้งเตือนครั้งที่ 2 · เหลือ 3 สัปดาห์ก่อนเข้าไซต์";
      body = `กรุณาดำเนินการทำ Advance สำหรับ ${h.name} โดยด่วน`;
    } else if (days <= 14 && days >= 0) {
      level = "danger";
      title = `เร่งด่วน · เหลือ ${days} วัน ก่อนเข้าไซต์`;
      body = `ยังไม่ได้ทำ Advance สำหรับ ${h.name}`;
    } else if (days < 0) {
      level = "danger";
      title = `เกินกำหนด · เริ่มงานไปแล้ว ${Math.abs(days)} วัน`;
      body = `ยังไม่ Advance ครบสำหรับ ${h.name}`;
    } else {
      return;
    }

    const lead = team.find(t => t.id === h.lead);
    reminders.push({
      id: `rem-${h.id}`,
      hospitalId: h.id,
      hospitalName: h.name,
      level,
      title,
      body,
      days,
      lead,
      advance: h.advance,
      advanceAmt: h.advanceAmt,
      startDate: h.start,
    });
  });

  return reminders.sort((a, b) => a.days - b.days);
};

const NotificationCenter = ({ reminders, setRoute, onJumpHospital, dismissed, setDismissed, sent, setSent, birthdayReminders = [] }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const toast = useToast();

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const active = reminders.filter(r => !dismissed.includes(r.id));
  const activeBirthdays = birthdayReminders.filter(b => !dismissed.includes(b.id));
  const danger = active.filter(r => r.level === "danger").length;
  const warning = active.filter(r => r.level === "warning").length;
  const totalBirthdays = activeBirthdays.length;
  const total = active.length + totalBirthdays;

  const sendLine = (r) => {
    setSent([...sent, r.id]);
    toast.push(`ส่ง LINE ถึง ${r.lead ? r.lead.nick : "หัวหน้าทีม"} แล้ว · ${r.hospitalName}`);
  };
  const dismiss = (r) => {
    setDismissed([...dismissed, r.id]);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        className="btn btn-icon"
        onClick={() => setOpen(o => !o)}
        style={{
          position: "relative",
          background: total > 0 ? (danger || totalBirthdays > 0 ? "var(--accent-soft)" : "var(--warning-soft)") : "var(--surface)",
          borderColor: total > 0 ? (danger ? "var(--danger)" : "var(--accent)") : undefined,
        }}
        title={total + " แจ้งเตือน"}
      >
        <Icon name="bell" size={14} style={{ color: total > 0 ? (danger ? "var(--danger)" : "var(--accent)") : "var(--ink-2)" }} />
        {total > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            background: danger ? "var(--danger)" : "var(--accent)",
            color: "#fff", fontSize: 9, fontWeight: 700,
            minWidth: 16, height: 16, borderRadius: 99,
            padding: "0 5px",
            display: "grid", placeItems: "center",
            border: "2px solid var(--bg)",
          }}>{total}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          width: 420, maxHeight: 540,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          boxShadow: "var(--sh-3)",
          zIndex: 30,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border-2)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "var(--accent-soft)", color: "var(--accent-ink)",
              display: "grid", placeItems: "center",
            }}>
              <Icon name="bell" size={14} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="display bold" style={{ fontSize: 14 }}>แจ้งเตือน</div>
              <div className="tiny muted">
                {total === 0 ? "ไม่มีรายการที่ต้องดำเนินการ" : `${total} รายการ${danger ? ` · ${danger} เร่งด่วน` : ""}${totalBirthdays ? ` · ${totalBirthdays} วันเกิด` : ""}`}
              </div>
            </div>
            {dismissed.length > 0 && (
              <button className="btn btn-sm btn-ghost" onClick={() => setDismissed([])}>
                Reset
              </button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            {total === 0 && (
              <div className="empty" style={{ padding: 32 }}>
                <div className="ico"><Icon name="check" size={20} /></div>
                ทุกรายการเรียบร้อย ไม่มีงานต้องเตือน
              </div>
            )}
            
            {/* Birthday Reminders */}
            {activeBirthdays.map(b => (
              <div key={b.id} style={{
                padding: 12,
                background: "var(--surface)",
                border: "1px solid var(--border-2)",
                borderRadius: 10,
                marginBottom: 6,
                display: "flex", flexDirection: "column", gap: 6,
              }}>
                <div className="row" style={{ gap: 8, alignItems: "flex-start" }}>
                  <div style={{
                    padding: "3px 8px",
                    background: "var(--accent-soft)", color: "var(--accent-ink)",
                    borderRadius: 99, fontSize: 10.5, fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {b.title}
                  </div>
                </div>
                <div className="row" style={{ gap: 8, alignItems: "center" }}>
                  <Avatar name={b.memberNick} color={b.memberAvatar} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{b.memberName}</div>
                    <div className="tiny muted">{b.memberNick} · อายุ {b.age} ปี</div>
                  </div>
                </div>
                <div className="row" style={{ gap: 6, marginTop: 4 }}>
                  <button className="btn btn-sm btn-accent" onClick={() => toast.push(`🎂 ขอให้สุขสันต์วันเกิด ${b.memberNick}!`)}>
                    <Icon name="cake" size={11} /> ปล่อยความสุข
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={() => dismiss(b)} title="ปิดแจ้งเตือนนี้">
                    <Icon name="close" size={11} />
                  </button>
                </div>
              </div>
            ))}
            
            {/* Advance Reminders */}
            {active.map(r => {
              const isSent = sent.includes(r.id);
              const bg = r.level === "danger" ? "var(--danger-soft)" :
                         r.level === "warning" ? "var(--warning-soft)" : "var(--accent-soft)";
              const ink = r.level === "danger" ? "#8B2D2D" :
                          r.level === "warning" ? "#8E5610" : "var(--accent-ink)";
              return (
                <div key={r.id} style={{
                  padding: 12,
                  background: "var(--surface)",
                  border: "1px solid var(--border-2)",
                  borderRadius: 10,
                  marginBottom: 6,
                  display: "flex", flexDirection: "column", gap: 6,
                }}>
                  <div className="row" style={{ gap: 8, alignItems: "flex-start" }}>
                    <div style={{
                      padding: "3px 8px",
                      background: bg, color: ink,
                      borderRadius: 99, fontSize: 10.5, fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {r.level === "danger" && "🔴 "}
                      {r.level === "warning" && "🟡 "}
                      {r.level === "info" && "🔵 "}
                      {r.title}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.4, fontWeight: 600 }}>{r.hospitalName}</div>
                  <div className="tiny muted">{r.body}</div>
                  <div className="row" style={{ gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                    <Chip kind="outline" className="tiny">
                      <Icon name="clock" size={10} /> {fmtDate(r.startDate)}
                    </Chip>
                    {r.lead && (
                      <Chip kind="outline" className="tiny">
                        <Avatar name={r.lead.nick} color={r.lead.avatar} /> {r.lead.nick}
                      </Chip>
                    )}
                    <Chip kind={r.advance === "บางส่วน" ? "accent" : "outline"} className="tiny">
                      {r.advance}
                    </Chip>
                  </div>
                  <div className="row" style={{ gap: 6, marginTop: 6 }}>
                    <button
                      className={"btn btn-sm " + (isSent ? "" : "btn-accent")}
                      onClick={() => !isSent && sendLine(r)}
                      disabled={isSent}
                      style={isSent ? { background: "var(--success-soft)", borderColor: "var(--success)", color: "#186540" } : {}}
                    >
                      <Icon name={isSent ? "check" : "phone"} size={11} />
                      {isSent ? "ส่ง LINE แล้ว" : `ส่ง LINE ถึง ${r.lead ? r.lead.nick : "หัวหน้าทีม"}`}
                    </button>
                    <button className="btn btn-sm" onClick={() => { onJumpHospital(r.hospitalId); setOpen(false); }}>
                      เปิด <Icon name="arrowRight" size={11} />
                    </button>
                    <button className="btn btn-sm btn-ghost" onClick={() => dismiss(r)} title="ปิดแจ้งเตือนนี้">
                      <Icon name="close" size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            padding: "10px 16px",
            borderTop: "1px solid var(--border-2)",
            background: "var(--surface-alt)",
            display: "flex", justifyContent: "space-between",
            alignItems: "center", gap: 8,
          }}>
            <span className="tiny muted">
              {activeBirthdays.length > 0 ? `🎂 ${activeBirthdays.length} วันเกิด · ` : ""}เตือนที่ 4 สัปดาห์ และ 3 สัปดาห์ก่อนเข้าไซต์
            </span>
            <button className="btn btn-sm btn-ghost" onClick={() => { setRoute("hospitals"); setOpen(false); }}>
              ดูทั้งหมด
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Banner alert (shown at top of Dashboard if there are urgent items)
const RemindersBanner = ({ reminders, dismissed, onJumpHospital, setRoute }) => {
  const active = reminders.filter(r => !dismissed.includes(r.id));
  const urgent = active.filter(r => r.level === "danger" || r.level === "warning");
  if (urgent.length === 0) return null;

  return (
    <div className="card" style={{
      marginBottom: 16,
      background: "linear-gradient(95deg, var(--danger-soft), var(--warning-soft))",
      border: "1px solid var(--danger)",
      padding: 0,
      overflow: "hidden",
    }}>
      <div className="row" style={{ padding: 16, gap: 14, alignItems: "flex-start" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "var(--danger)", color: "#fff",
          display: "grid", placeItems: "center", flexShrink: 0,
        }}>
          <Icon name="bell" size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="display bold" style={{ fontSize: 15, color: "#8B2D2D" }}>
            ⚠️ แจ้งเตือน Advance · {urgent.length} โครงการต้องดำเนินการด่วน
          </div>
          <div className="tiny" style={{ color: "#8B2D2D", marginTop: 2 }}>
            ใกล้ถึงวันเข้าไซต์แต่ยังทำ Advance ไม่ครบ
          </div>
          <div className="row" style={{ gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {urgent.slice(0, 4).map(r => (
              <button
                key={r.id}
                className="btn btn-sm"
                onClick={() => onJumpHospital(r.hospitalId)}
                style={{ background: "var(--surface)", border: "1px solid var(--danger)", color: "#8B2D2D" }}
              >
                {r.hospitalName.replace("โรงพยาบาล", "รพ.")} · เหลือ {r.days < 0 ? "เลย " + Math.abs(r.days) : r.days} วัน
              </button>
            ))}
            {urgent.length > 4 && (
              <button className="btn btn-sm" onClick={() => setRoute("hospitals")}>
                +{urgent.length - 4} เพิ่ม
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { computeReminders, computeBirthdayReminders, NotificationCenter, RemindersBanner });
