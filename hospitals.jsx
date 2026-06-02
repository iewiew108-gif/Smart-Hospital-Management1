// =========================================================
// Hospitals Screen — list, detail drawer, add/edit form
// =========================================================

const FOLLOWUP_CHANNELS = ["โทรศัพท์", "อีเมล", "LINE", "Onsite", "ประชุม", "อื่น ๆ"];
const TRAVEL_MODES = ["รถบริษัท", "รถส่วนตัว", "เครื่องบิน", "รถไฟ", "รถทัวร์", "อื่น ๆ"];

// Reusable contact list editor (add / edit / remove people)
const ContactList = ({ items = [], onChange, accent = "var(--accent)", placeholder = "เช่น คุณสมชาย ใจดี" }) => {
  const [draft, setDraft] = useState({ name: "", pos: "", phone: "", email: "" });
  const add = () => {
    if (!draft.name.trim()) return;
    const id = "c" + Date.now() + Math.floor(Math.random() * 1000);
    onChange([...items, { ...draft, id }]);
    setDraft({ name: "", pos: "", phone: "", email: "" });
  };
  const update = (id, key, val) => onChange(items.map(c => c.id === id ? { ...c, [key]: val } : c));
  const remove = (id) => onChange(items.filter(c => c.id !== id));

  return (
    <div className="stack" style={{ gap: 8 }}>
      {items.map((c, i) => (
        <div key={c.id} style={{
          background: "var(--surface)", borderRadius: 10,
          border: "1px solid var(--border-2)", padding: 10,
        }}>
          <div className="row" style={{ gap: 8, marginBottom: 8, alignItems: "center" }}>
            <div style={{
              width: 22, height: 22, borderRadius: 99, background: accent, color: "#fff",
              display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, flexShrink: 0,
            }}>{i + 1}</div>
            <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>
              ผู้ติดต่อ #{i + 1}
            </div>
            <button className="btn btn-sm btn-ghost btn-icon" onClick={() => remove(c.id)} title="ลบ">
              <Icon name="trash" size={12} />
            </button>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1.3fr 1fr", gap: 8 }}>
            <Field label="ชื่อ-นามสกุล" en="Name">
              <input className="input" value={c.name} onChange={e => update(c.id, "name", e.target.value)} placeholder={placeholder} />
            </Field>
            <Field label="ตำแหน่ง" en="Position">
              <input className="input" value={c.pos} onChange={e => update(c.id, "pos", e.target.value)} placeholder="เช่น หัวหน้าฝ่าย IT" />
            </Field>
            <Field label="เบอร์โทร" en="Phone">
              <input className="input mono" value={c.phone} onChange={e => update(c.id, "phone", e.target.value)} placeholder="0X-XXX-XXXX" />
            </Field>
            <Field label="Email">
              <input className="input mono" value={c.email} onChange={e => update(c.id, "email", e.target.value)} placeholder="name@hospital.go.th" />
            </Field>
          </div>
        </div>
      ))}

      <div style={{
        background: "var(--surface-alt)", borderRadius: 10,
        border: "1px dashed var(--border-strong)", padding: 10,
      }}>
        <div className="tiny" style={{ fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>
          + เพิ่มผู้ติดต่อใหม่
        </div>
        <div className="grid" style={{ gridTemplateColumns: "1.3fr 1fr 1fr 1.2fr auto", gap: 8, alignItems: "flex-end" }}>
          <Field label="ชื่อ-นามสกุล">
            <input className="input" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })}
              placeholder={placeholder} />
          </Field>
          <Field label="ตำแหน่ง">
            <input className="input" value={draft.pos} onChange={e => setDraft({ ...draft, pos: e.target.value })} />
          </Field>
          <Field label="เบอร์โทร">
            <input className="input mono" value={draft.phone} onChange={e => setDraft({ ...draft, phone: e.target.value })} />
          </Field>
          <Field label="Email">
            <input className="input mono" value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} />
          </Field>
          <button className="btn btn-accent" onClick={add} disabled={!draft.name.trim()}>
            <Icon name="plus" size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

const FOLLOWUP_ROLES = [
  { key: "doctor",   label: "ตำแหน่งแพทย์",       color: "#5B5BD6", icon: "award" },
  { key: "admin",    label: "ตำแหน่ง Admin",      color: "#3877B8", icon: "settings" },
  { key: "nurseIPD", label: "ตำแหน่งพยาบาล IPD",   color: "#B8546D", icon: "users" },
  { key: "pharmacy", label: "ตำแหน่งเภสัชกร",     color: "#2A8F5E", icon: "box" },
  { key: "stats",    label: "ตำแหน่งนักเวชสถิติ",  color: "#C97B1F", icon: "report" },
];

const ContactCard = ({ c, accent = "var(--accent)" }) => (
  <div style={{
    padding: "10px 12px", background: "var(--surface-alt)",
    border: "1px solid var(--border-2)", borderRadius: 8,
    borderLeft: `3px solid ${accent}`,
  }}>
    <div className="row" style={{ gap: 8, alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name || "—"}</div>
        {c.pos && <div className="tiny muted">{c.pos}</div>}
      </div>
    </div>
    {(c.phone || c.email) && (
      <div className="row" style={{ gap: 12, marginTop: 6, flexWrap: "wrap", fontSize: 11.5 }}>
        {c.phone && (
          <a href={`tel:${c.phone}`} className="row" style={{ gap: 4, color: "var(--ink-2)" }}>
            <Icon name="phone" size={11} className="muted" />
            <span className="mono">{c.phone}</span>
          </a>
        )}
        {c.email && (
          <a href={`mailto:${c.email}`} className="row" style={{ gap: 4, color: "var(--accent)" }}>
            <Icon name="mail" size={11} />
            <span className="mono">{c.email}</span>
          </a>
        )}
      </div>
    )}
  </div>
);

const addWeeks = (dateStr, weeks) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  d.setDate(d.getDate() + (weeks * 7));
  return d.toISOString().slice(0, 10);
};

const AuxTeamEditor = ({ items, team, onChange }) => {
  const [draft, setDraft] = useState({
    memberId: "",
    dateFrom: "",
    weeks: 1,
    dateTo: "",
    role: "",
    travelOut: { date: "", mode: "รถบริษัท", note: "" },
    travelBack: { date: "", mode: "รถบริษัท", note: "" },
  });
  const [expanded, setExpanded] = useState(false);

  // Auto-calc dateTo from dateFrom + weeks
  useEffect(() => {
    if (draft.dateFrom && draft.weeks > 0) {
      setDraft(d => ({ ...d, dateTo: addWeeks(d.dateFrom, d.weeks) }));
    }
  }, [draft.dateFrom, draft.weeks]);

  const bumpWeeks = (n) => setDraft(d => ({ ...d, weeks: Math.max(1, (d.weeks || 0) + n) }));

  const setTravel = (key, field, val) => {
    setDraft(d => ({ ...d, [key]: { ...d[key], [field]: val } }));
  };

  const add = () => {
    if (!draft.memberId || !draft.dateFrom) return;
    const id = "ax" + Date.now();
    // default travel dates if blank
    const out = { ...draft.travelOut, date: draft.travelOut.date || draft.dateFrom };
    const back = { ...draft.travelBack, date: draft.travelBack.date || draft.dateTo };
    onChange([...items, { ...draft, travelOut: out, travelBack: back, id }]);
    setDraft({
      memberId: "", dateFrom: "", weeks: 1, dateTo: "", role: "",
      travelOut: { date: "", mode: "รถบริษัท", note: "" },
      travelBack: { date: "", mode: "รถบริษัท", note: "" },
    });
    setExpanded(false);
  };
  const remove = (id) => onChange(items.filter(x => x.id !== id));

  return (
    <div className="card" style={{ background: "var(--surface-alt)", border: "1px dashed var(--border-strong)" }}>
      <div className="stack" style={{ padding: 12, gap: 8 }}>
        {items.length === 0 && (
          <div className="tiny muted" style={{ textAlign: "center", padding: "8px 0" }}>
            ยังไม่มีทีมเสริม — เพิ่มรายการแรกด้านล่าง
          </div>
        )}
        {items.map((it, i) => {
          const m = team.find(t => t.id === it.memberId);
          const hasTravel = it.travelOut || it.travelBack;
          return (
            <div key={it.id} style={{
              padding: 10, background: "var(--surface)",
              borderRadius: 8, border: "1px solid var(--border-2)",
            }}>
              <div className="row" style={{ gap: 10, alignItems: "flex-start" }}>
                <span className="tiny muted mono" style={{ width: 20, paddingTop: 6 }}>#{i + 1}</span>
                {m ? <Avatar name={m.nick} color={m.avatar} /> : <div className="avatar" style={{ background: "var(--muted-2)" }}>?</div>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {m ? `${m.nick} (${m.fname})` : "—"}
                    {it.role && <span className="muted" style={{ fontWeight: 400 }}> · {it.role}</span>}
                  </div>
                  <div className="tiny muted mono" style={{ marginTop: 2 }}>
                    <Icon name="clock" size={10} /> {fmtDate(it.dateFrom)} → {it.dateTo ? fmtDate(it.dateTo) : "—"}
                    {it.weeks && <span> · {it.weeks} สัปดาห์</span>}
                  </div>
                  {hasTravel && (it.travelOut?.date || it.travelBack?.date) && (
                    <div className="row" style={{ gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                      {it.travelOut?.date && (
                        <Chip kind="info" className="tiny">
                          ↗ ขาไป · {fmtDateShort(it.travelOut.date)} · {it.travelOut.mode}
                        </Chip>
                      )}
                      {it.travelBack?.date && (
                        <Chip kind="accent" className="tiny">
                          ↙ ขากลับ · {fmtDateShort(it.travelBack.date)} · {it.travelBack.mode}
                        </Chip>
                      )}
                    </div>
                  )}
                </div>
                <button className="btn btn-sm btn-ghost btn-icon" onClick={() => remove(it.id)}>
                  <Icon name="trash" size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ borderTop: "1px solid var(--border-2)", padding: 12, background: "var(--surface)" }}>
        <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr 1.5fr 1fr", gap: 8, marginBottom: 8 }}>
          <Field label="ทีมงาน" en="Member">
            <select className="select" value={draft.memberId} onChange={e => setDraft({ ...draft, memberId: e.target.value })}>
              <option value="">— เลือก —</option>
              {team.map(t => <option key={t.id} value={t.id}>{t.nick} ({t.fname})</option>)}
            </select>
          </Field>
          <Field label="วันที่เริ่มเข้าไซต์" en="Start date">
            <input className="input mono" type="date" value={draft.dateFrom} onChange={e => setDraft({ ...draft, dateFrom: e.target.value })} />
          </Field>
          <Field label={`จำนวนสัปดาห์ · ${draft.weeks} wk`} en="Weeks">
            <div className="row" style={{ gap: 4 }}>
              <button type="button" className="btn btn-sm" onClick={() => bumpWeeks(-1)} style={{ width: 28, padding: "5px 0", justifyContent: "center" }}>−</button>
              <input className="input mono" type="number" min={1} value={draft.weeks}
                onChange={e => setDraft({ ...draft, weeks: Math.max(1, +e.target.value || 1) })}
                style={{ width: 50, textAlign: "center", padding: "9px 4px" }} />
              <button type="button" className="btn btn-sm" onClick={() => bumpWeeks(1)} style={{ width: 28, padding: "5px 0", justifyContent: "center" }}>+</button>
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => bumpWeeks(1)}>+1 wk</button>
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => bumpWeeks(2)}>+2 wk</button>
            </div>
          </Field>
          <Field label="วันออก (คำนวณ)" en="End">
            <input className="input mono" type="date" value={draft.dateTo}
              onChange={e => setDraft({ ...draft, dateTo: e.target.value })} />
          </Field>
        </div>
        <div className="row" style={{ gap: 8, marginBottom: 8 }}>
          <Field label="บทบาท / งานที่เข้า" en="Role">
            <input className="input" value={draft.role} onChange={e => setDraft({ ...draft, role: e.target.value })}
              placeholder="เช่น Training, QA round, Support" />
          </Field>
          <button type="button" className="btn" onClick={() => setExpanded(x => !x)} style={{ marginTop: 22 }}>
            <Icon name={expanded ? "chevronDown" : "chevronRight"} size={12} />
            รายละเอียดการเดินทาง
          </button>
        </div>

        {expanded && (
          <div style={{ background: "var(--surface-alt)", borderRadius: 8, padding: 12, marginBottom: 8 }}>
            <div className="row" style={{ gap: 14, alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div className="tiny" style={{ fontWeight: 700, marginBottom: 6, color: "#1F548A", display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ background: "var(--info-soft)", color: "#1F548A", padding: "1px 7px", borderRadius: 99 }}>↗</span>
                  ขาไป (Outbound)
                </div>
                <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="วันเดินทาง">
                    <input className="input mono" type="date" value={draft.travelOut.date}
                      onChange={e => setTravel("travelOut", "date", e.target.value)} />
                  </Field>
                  <Field label="ยานพาหนะ">
                    <select className="select" value={draft.travelOut.mode}
                      onChange={e => setTravel("travelOut", "mode", e.target.value)}>
                      {TRAVEL_MODES.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="หมายเหตุ" hint="เช่น เที่ยวบิน TG201, ออก 06:00">
                  <input className="input" value={draft.travelOut.note}
                    onChange={e => setTravel("travelOut", "note", e.target.value)}
                    placeholder="รายละเอียด..." />
                </Field>
              </div>

              <div style={{ flex: 1 }}>
                <div className="tiny" style={{ fontWeight: 700, marginBottom: 6, color: "var(--accent-ink)", display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ background: "var(--accent-soft)", color: "var(--accent-ink)", padding: "1px 7px", borderRadius: 99 }}>↙</span>
                  ขากลับ (Return)
                </div>
                <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="วันเดินทาง">
                    <input className="input mono" type="date" value={draft.travelBack.date}
                      onChange={e => setTravel("travelBack", "date", e.target.value)} />
                  </Field>
                  <Field label="ยานพาหนะ">
                    <select className="select" value={draft.travelBack.mode}
                      onChange={e => setTravel("travelBack", "mode", e.target.value)}>
                      {TRAVEL_MODES.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="หมายเหตุ" hint="เช่น เที่ยวบิน TG202, ถึง 22:00">
                  <input className="input" value={draft.travelBack.note}
                    onChange={e => setTravel("travelBack", "note", e.target.value)}
                    placeholder="รายละเอียด..." />
                </Field>
              </div>
            </div>
          </div>
        )}

        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button className="btn btn-accent" onClick={add} disabled={!draft.memberId || !draft.dateFrom}>
            <Icon name="plus" size={12} /> เพิ่มเข้าทีมเสริม
          </button>
        </div>
      </div>
    </div>
  );
};

const FollowupsEditor = ({ items, onChange }) => {
  const [draft, setDraft] = useState({ date: new Date().toISOString().slice(0, 10), by: "", channel: "โทรศัพท์", note: "" });

  const add = () => {
    if (!draft.note.trim()) return;
    const id = "f" + Date.now();
    onChange([...items, { ...draft, id }]);
    setDraft({ date: new Date().toISOString().slice(0, 10), by: "", channel: "โทรศัพท์", note: "" });
  };

  const remove = (id) => onChange(items.filter(x => x.id !== id));

  return (
    <div className="card" style={{ background: "var(--surface-alt)", border: "1px dashed var(--border-strong)" }}>
      <div className="stack" style={{ padding: 12, gap: 8 }}>
        {items.length === 0 && (
          <div className="tiny muted" style={{ textAlign: "center", padding: "8px 0" }}>
            ยังไม่มีรายการติดตาม — เพิ่มรายการแรกด้านล่าง
          </div>
        )}
        {items.map((it, i) => (
          <div key={it.id} className="row" style={{
            gap: 10, padding: 10, background: "var(--surface)",
            borderRadius: 8, border: "1px solid var(--border-2)",
            alignItems: "flex-start",
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: 50, background: "var(--danger-soft)",
              color: "var(--danger)", display: "grid", placeItems: "center",
              fontSize: 11, fontWeight: 700, flexShrink: 0,
            }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row" style={{ gap: 8, marginBottom: 4 }}>
                <span className="tiny bold mono">{fmtDateShort(it.date)}</span>
                <Chip kind="outline" className="tiny">{it.channel}</Chip>
                {it.by && <span className="tiny muted">โดย {it.by}</span>}
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.4 }}>{it.note}</div>
            </div>
            <button className="btn btn-sm btn-ghost btn-icon" onClick={() => remove(it.id)} title="ลบ">
              <Icon name="trash" size={12} />
            </button>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid var(--border-2)", padding: 12, background: "var(--surface)" }}>
        <div className="row" style={{ gap: 8, marginBottom: 8, alignItems: "flex-end" }}>
          <Field label="วันที่" en="Date">
            <input className="input mono" type="date" value={draft.date} onChange={e => setDraft({ ...draft, date: e.target.value })} style={{ width: 150 }} />
          </Field>
          <Field label="ช่องทาง" en="Channel">
            <select className="select" value={draft.channel} onChange={e => setDraft({ ...draft, channel: e.target.value })} style={{ width: 130 }}>
              {FOLLOWUP_CHANNELS.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="ผู้ติดตาม" en="By">
            <input className="input" value={draft.by} onChange={e => setDraft({ ...draft, by: e.target.value })} placeholder="ชื่อ" style={{ width: 130 }} />
          </Field>
        </div>
        <div className="row" style={{ gap: 8, alignItems: "flex-end" }}>
          <Field label="รายละเอียดการติดตาม" en="Note">
            <textarea className="textarea" value={draft.note} onChange={e => setDraft({ ...draft, note: e.target.value })}
              placeholder="เช่น ติดต่อฝ่ายการเงิน แจ้งจะดำเนินการภายใน X วัน…" rows={2} />
          </Field>
          <button className="btn btn-accent" onClick={add} disabled={!draft.note.trim()}>
            <Icon name="plus" size={12} /> เพิ่ม
          </button>
        </div>
      </div>
    </div>
  );
};

const HospitalForm = ({ initial, team, onSave, onCancel, onDirtyChange }) => {
  const [form, setForm] = useState(initial || {
    name: "", code: "", taiga: "", taigaUrl: "", marketingName: "", projectType: "", year: new Date().getFullYear(),
    start: "", end: "", warrantyEnd: "", weeks: 0,
    teamSize: 0, team: [], lead: "",
    auxTeam: [],
    province: "", region: "กลาง",
    type: "รพ.ทั่วไป (รพท.)( 200 – 500 เตียง)", workType: "Onsite",
    hosxpVersion: "HOSxP XE 4", dbType: "PostgreSQL",
    wardInstalled: 0, wardBonus: 0, wardTotal: 0,
    price: 0, advanceAmt: 0,
    status: "รอเริ่ม", advance: "ยังไม่ Advance",
    phase: "ติดตั้งครบทุก ward",
    followups: [],
    teamSheetUrl: "",
    contactsAdmin: [],
    contactsFollowup: { doctor: [], admin: [], nurseIPD: [], pharmacy: [], stats: [] },
    apps: [],
  });
  const [isDirty, setIsDirty] = useState(false);
  const markDirty = () => {
    if (!isDirty) {
      setIsDirty(true);
      if (onDirtyChange) onDirtyChange(true);
    }
  };
  const set = (k, v) => { markDirty(); setForm(f => ({ ...f, [k]: v })); };
  const toggleApp = (id) => set("apps", form.apps.includes(id) ? form.apps.filter(a => a !== id) : [...form.apps, id]);
  const toggleTeam = (id) => set("team", form.team.includes(id) ? form.team.filter(a => a !== id) : [...form.team, id]);
  const [formTab, setFormTab] = useState("general");

  const handleCancel = () => {
    if (isDirty && !confirm("มีข้อมูลที่ยังไม่ได้บันทึก\nต้องการออกโดยไม่บันทึกหรือไม่?")) return;
    onCancel();
  };

  // Auto-calc weeks
  useEffect(() => {
    if (form.start && form.end) {
      const ms = new Date(form.end) - new Date(form.start);
      const w = Math.round(ms / (1000 * 60 * 60 * 24 * 7));
      if (w !== form.weeks) set("weeks", w);
    }
  }, [form.start, form.end]);

  return (
    <div>
      {isDirty && (
        <div style={{
          position: "sticky", top: -22, zIndex: 6,
          background: "#FEF3C7", border: "1px solid #F59E0B",
          borderRadius: 8, padding: "8px 14px", marginBottom: 10,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <Icon name="info" size={14} style={{ color: "#B45309", flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 13, color: "#92400E", fontWeight: 600 }}>
            มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก — กด <strong>บันทึก</strong> เพื่อบันทึกข้อมูล
          </span>
          <button
            className="btn btn-accent btn-sm"
            onClick={() => { if (form.name) { onSave(form); } }}
            disabled={!form.name}
          >
            <Icon name="check" size={12} /> บันทึกเลย
          </button>
        </div>
      )}
      <div style={{
        position: "sticky", top: -22, zIndex: 5,
        background: "var(--surface)",
        padding: "4px 0 16px", marginBottom: 4,
        borderBottom: "1px solid var(--border-2)",
      }}>
        <Tabs
          items={[
            { value: "general", label: <span><Icon name="building" size={11} /> ข้อมูลทั่วไป</span> },
            { value: "contacts", label: <span><Icon name="phone" size={11} /> ผู้ติดต่อ ({(form.contactsAdmin?.length || 0) + Object.values(form.contactsFollowup || {}).reduce((a, b) => a + (b?.length || 0), 0)})</span> },
          ]}
          value={formTab}
          onChange={setFormTab}
        />
      </div>
      {formTab === "general" && <>
      <div className="form-section-title"><span className="num">1</span>ข้อมูลโรงพยาบาล</div>
      <div className="grid" style={{ gridTemplateColumns: "2fr 1fr 1fr", gap: 12, marginBottom: 18 }}>
        <Field label="ชื่อโรงพยาบาล" en="Hospital">
          <input className="input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="โรงพยาบาล…" />
        </Field>
        <Field label="Hospital Code">
          <input className="input mono" value={form.code} onChange={e => set("code", e.target.value)} placeholder="ABC-001" />
        </Field>
        <Field label="รหัส Project — Taiga">
          <input className="input mono" value={form.taiga} onChange={e => set("taiga", e.target.value)} placeholder="PRJ-XXX" />
        </Field>
        <Field label="จังหวัด" en="Province">
          <input className="input" value={form.province} onChange={e => set("province", e.target.value)} />
        </Field>
        <Field label="ภูมิภาค" en="Region">
          <select className="select" value={form.region} onChange={e => set("region", e.target.value)}>
            <option>กลาง</option><option>เหนือ</option><option>ตะวันออกเฉียงเหนือ</option><option>ใต้</option><option>ตะวันออก</option><option>ตะวันตก</option>
          </select>
        </Field>
        <Field label="ประเภทโรงพยาบาล" en="Type">
          <select className="select" value={form.type} onChange={e => set("type", e.target.value)}>
            {HOSPITAL_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="การตลาดที่รับผิดชอบ" en="Marketing">
          <input className="input" value={form.marketingName || ""} onChange={e => set("marketingName", e.target.value)} placeholder="ชื่อการตลาด…" />
        </Field>
        <Field label="ประเภท Project" en="Project Type">
          <select title="ประเภท Project" className="select" value={form.projectType || ""} onChange={e => set("projectType", e.target.value)}>
            <option value="">— เลือก —</option>
            <option>ติดตั้งภาพจังหวัดน่าน</option>
            <option>ติดตั้งภาพจังหวัดนราธิวาส</option>
            <option>ติดตั้งภาพจังหวัดแพร่</option>
          </select>
        </Field>
        <Field label="Link Taiga" en="Taiga URL" span={3} hint="ลิงก์บอร์ด Taiga ของโครงการนี้">
          <div className="row" style={{ gap: 8 }}>
            <input
              className="input mono"
              value={form.taigaUrl || ""}
              onChange={e => set("taigaUrl", e.target.value)}
              placeholder="https://tree.taiga.io/project/..."
              style={{ flex: 1 }}
            />
            {form.taigaUrl ? (
              <>
                <Chip kind="success"><Icon name="check" size={10} /> ลิงก์แล้ว</Chip>
                <a href={form.taigaUrl} target="_blank" rel="noopener" className="btn btn-sm">
                  <Icon name="arrowRight" size={12} /> เปิด
                </a>
              </>
            ) : (
              <Chip kind="warning">ยังไม่ลิงก์</Chip>
            )}
          </div>
        </Field>
      </div>

      <div className="form-section-title"><span className="num">2</span>เวอร์ชั่นโปรแกรม & ฐานข้อมูล</div>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
        <Field label="เวอร์ชั่น HOSxP" en="HOSxP Version">
          <select className="select" value={form.hosxpVersion} onChange={e => set("hosxpVersion", e.target.value)}>
            {HOSXP_VERSIONS.map(v => <option key={v}>{v}</option>)}
          </select>
        </Field>
        <Field label="ประเภทฐานข้อมูล" en="Database">
          <select className="select" value={form.dbType} onChange={e => set("dbType", e.target.value)}>
            {DB_TYPES.map(d => <option key={d}>{d}</option>)}
          </select>
        </Field>
      </div>

      <div className="form-section-title"><span className="num">3</span>ระยะเวลาติดตั้ง</div>
      <div className="grid" style={{ gridTemplateColumns: "2fr 2fr 1fr 2fr", gap: 12, marginBottom: 18 }}>
        <Field label="วันที่เริ่มติดตั้ง" en="Start">
          <ThaiDateInput value={form.start} onChange={v => set("start", v)} />
        </Field>
        <Field label="สิ้นสุดวันที่" en="End">
          <ThaiDateInput value={form.end} onChange={v => set("end", v)} />
        </Field>
        <Field label="รวม (สัปดาห์)" en="Weeks">
          <input className="input mono" type="number" value={form.weeks} readOnly />
        </Field>
        <Field label="สิ้นสุดประกัน" en="Warranty">
          <ThaiDateInput value={form.warrantyEnd} onChange={v => set("warrantyEnd", v)} />
        </Field>
        <Field label="ประเภทงาน" en="Work type">
          <select className="select" value={form.workType} onChange={e => set("workType", e.target.value)}>
            {WORK_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Ward ทั้งหมดใน รพ." en="Total wards">
          <input className="input mono" type="number" value={form.wardTotal} onChange={e => set("wardTotal", +e.target.value)} />
        </Field>
        <Field label="Ward ที่ติดตั้ง" en="Installed">
          <input className="input mono" type="number" value={form.wardInstalled} onChange={e => set("wardInstalled", +e.target.value)} />
        </Field>
        <Field label="Ward ที่แถม" en="Bonus">
          <input className="input mono" type="number" value={form.wardBonus} onChange={e => set("wardBonus", +e.target.value)} />
        </Field>
        <Field label="ปี" en="Year">
          <input className="input mono" type="number" value={form.year} onChange={e => set("year", +e.target.value)} />
        </Field>
      </div>

      <div className="form-section-title"><span className="num">4</span>ทีมงานที่ติดตั้ง</div>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Field label="หัวหน้าทีม" en="Lead">
          <select className="select" value={form.lead} onChange={e => set("lead", e.target.value)}>
            <option value="">— เลือก —</option>
            {team.map(t => <option key={t.id} value={t.id}>{t.fname} {t.lname} ({t.nick})</option>)}
          </select>
        </Field>
        <Field label="จำนวนคนทำงาน" en="Team size">
          <input className="input mono" type="number" value={form.teamSize || form.team.length} onChange={e => set("teamSize", +e.target.value)} />
        </Field>
      </div>
      <div className="card card-pad" style={{ background: "var(--surface-alt)", marginBottom: 14 }}>
        <div className="tiny" style={{ marginBottom: 8, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--accent)" }} />
          ทีมงานหลัก (Main team) <span className="muted" style={{ fontWeight: 400 }}>— เลือกได้หลายคน</span>
        </div>
        <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
          {team.map(t => {
            const on = form.team.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggleTeam(t.id)}
                className={"chip " + (on ? "chip-accent" : "chip-outline")}
                style={{ cursor: "pointer", padding: "5px 10px" }}
              >
                <Avatar name={t.nick} color={t.avatar} />
                {t.nick}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ marginBottom: 18 }}>
        <div className="tiny" style={{ marginBottom: 8, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--c2)" }} />
          ทีมงานเสริม (Auxiliary) <span className="muted" style={{ fontWeight: 400 }}>— ระบุช่วงวันที่เข้าร่วม</span>
        </div>
        <AuxTeamEditor
          items={form.auxTeam || []}
          team={team}
          onChange={(items) => set("auxTeam", items)}
        />
      </div>
      <Field label="Link Google Sheet ทีมงาน" en="Team Sheet URL" hint="ลิงก์ไปยัง Google Sheet สำหรับทีมงานที่ติดตั้ง รพ. นี้">
        <div className="row" style={{ gap: 8 }}>
          <input
            className="input mono"
            value={form.teamSheetUrl || ""}
            onChange={e => set("teamSheetUrl", e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            style={{ flex: 1 }}
          />
          {form.teamSheetUrl && (
            <a href={form.teamSheetUrl} target="_blank" rel="noopener" className="btn btn-sm">
              <Icon name="arrowRight" size={12} /> เปิด
            </a>
          )}
        </div>
      </Field>

      <div className="form-section-title"><span className="num">5</span>การเงิน & สถานะ</div>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 18 }}>
        <Field label="ราคาขาย" en="Price (฿)">
          <input className="input mono" type="number" value={form.price} onChange={e => set("price", +e.target.value)} />
        </Field>
        <Field label="จำนวน Advance" en="Amount (฿)">
          <input className="input mono" type="number" value={form.advanceAmt} onChange={e => set("advanceAmt", +e.target.value)} />
        </Field>
        <Field label="สถานะการ Advance" en="Advance status">
          <select className="select" value={form.advance} onChange={e => set("advance", e.target.value)}>
            {ADVANCE_STATUS.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="สถานะการติดตั้ง" en="Install status" span={3}>
          <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
            {INSTALL_STATUS.map(s => (
              <button key={s} onClick={() => set("status", s)}
                className={"chip " + (form.status === s ? "chip-accent" : "chip-outline")}
                style={{ cursor: "pointer", padding: "5px 12px" }}>
                {s}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Phase การติดตั้ง" en="Install Phase" span={3}>
          <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
            {INSTALL_PHASES.map(p => (
              <button key={p} onClick={() => set("phase", p)}
                className={"chip " + (form.phase === p ? "chip-accent" : "chip-outline")}
                style={{ cursor: "pointer", padding: "5px 12px" }}>
                {p}
              </button>
            ))}
          </div>
        </Field>
        {form.status === "ติดปัญหาเก็บเงินไม่ได้" && (
          <Field label="รายละเอียดการติดตามการเก็บเงิน" en="Payment follow-ups" span={3}>
            <FollowupsEditor
              items={form.followups || []}
              onChange={(items) => set("followups", items)}
            />
          </Field>
        )}
      </div>

      </>}

      {formTab === "contacts" && (
        <div className="stack" style={{ gap: 24 }}>
          <div>
            <div className="form-section-title">
              <span className="num">A</span>ข้อมูลการติดต่อ · ผู้ดูแลระบบ
            </div>
            <div className="tiny muted" style={{ marginTop: -8, marginBottom: 12 }}>
              เจ้าหน้าที่ฝ่ายโรงพยาบาลที่รับผิดชอบระบบหลังติดตั้ง — เพิ่มได้มากกว่า 1 คน
            </div>
            <ContactList
              items={form.contactsAdmin || []}
              onChange={(items) => set("contactsAdmin", items)}
              accent="var(--accent)"
              placeholder="เช่น คุณวิภา ทองอินทร์"
            />
          </div>

          <div>
            <div className="form-section-title">
              <span className="num">B</span>ผู้ติดต่อหลังติดตั้งระบบ · แยกตามตำแหน่ง
            </div>
            <div className="tiny muted" style={{ marginTop: -8, marginBottom: 12 }}>
              รายชื่อผู้รับผิดชอบแต่ละตำแหน่ง ไว้สำหรับโทรสอบถามหลังติดตั้งระบบ
            </div>
            <div className="stack" style={{ gap: 18 }}>
              {FOLLOWUP_ROLES.map(r => (
                <div key={r.key} style={{
                  border: "1px solid var(--border-2)", borderRadius: 12,
                  overflow: "hidden",
                }}>
                  <div style={{
                    padding: "10px 14px",
                    background: r.color + "14",
                    borderBottom: "1px solid var(--border-2)",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 7,
                      background: r.color, color: "#fff",
                      display: "grid", placeItems: "center", flexShrink: 0,
                    }}>
                      <Icon name={r.icon} size={12} />
                    </div>
                    <div style={{ flex: 1, fontWeight: 700, fontSize: 13 }}>{r.label}</div>
                    <Chip kind="outline">
                      {(form.contactsFollowup?.[r.key] || []).length} คน
                    </Chip>
                  </div>
                  <div style={{ padding: 12, background: "var(--surface-alt)" }}>
                    <ContactList
                      items={form.contactsFollowup?.[r.key] || []}
                      onChange={(items) => set("contactsFollowup", { ...form.contactsFollowup, [r.key]: items })}
                      accent={r.color}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {formTab === "general" && (<>
      <div className="form-section-title"><span className="num">6</span>Application ที่ติดตั้ง</div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 18 }}>
        {APPS_CATALOG.map(a => {
          const on = form.apps.includes(a.id);
          return (
            <div
              key={a.id}
              className={"app-pill" + (on ? " installed" : "")}
              onClick={() => toggleApp(a.id)}
              style={{ cursor: "pointer" }}
            >
              <div className="ico" style={{ background: on ? "var(--success-soft)" : "var(--bg-2)", color: on ? "#186540" : "var(--muted)" }}>
                {a.short}
              </div>
              <div style={{ flex: 1 }}>
                <div className="nm">{a.name}</div>
                <div className="meta">{a.desc}</div>
              </div>
              <Toggle on={on} onChange={() => toggleApp(a.id)} />
            </div>
          );
        })}
      </div>
      </>)}

      <div className="row" style={{ justifyContent: "flex-end", gap: 10 }}>
        <button type="button" className="btn" onClick={handleCancel}>ยกเลิก</button>
        <button type="button" className="btn btn-accent" onClick={() => onSave(form)} disabled={!form.name}>
          <Icon name="check" size={14} /> บันทึก
        </button>
      </div>
    </div>
  );
};

const HospitalDetail = ({ hospital, team, onEdit, onClose, onToggleApp }) => {
  const lead = team.find(t => t.id === hospital.lead);
  const members = hospital.team.map(id => team.find(t => t.id === id)).filter(Boolean);
  const totalDays = hospital.start && hospital.end ? Math.round((new Date(hospital.end) - new Date(hospital.start)) / 86400000) : 0;
  const todayMs = Date.now();
  const startMs = new Date(hospital.start).getTime();
  const endMs = new Date(hospital.end).getTime();
  const progress = todayMs < startMs ? 0 : todayMs > endMs ? 100 : Math.round(((todayMs - startMs) / (endMs - startMs)) * 100);

  return (
    <>
      <div className="drawer-head">
        <button className="btn btn-ghost btn-icon" onClick={onClose}><Icon name="close" size={14} /></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="display bold" style={{ fontSize: 17, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis" }}>{hospital.name}</div>
          <div className="row" style={{ gap: 6, marginTop: 4 }}>
            <Chip kind="outline" className="mono">{hospital.code}</Chip>
            <Chip kind={statusChipClass(hospital.status).replace("chip-", "")}>{hospital.status}</Chip>
            {hospital.phase && <Chip kind="accent"><Icon name="target" size={10} /> {hospital.phase}</Chip>}
            {hospital.taigaUrl
              ? <a href={hospital.taigaUrl} target="_blank" rel="noopener" style={{ textDecoration: "none" }}>
                  <Chip kind="success"><Icon name="check" size={10} /> Taiga ✓</Chip>
                </a>
              : <Chip kind="warning">Taiga ยังไม่ลิงก์</Chip>
            }
            <span className="tiny muted">· {hospital.province}</span>
          </div>
        </div>
        <button className="btn" onClick={onEdit}><Icon name="edit" size={12} /> แก้ไข</button>
      </div>
      <div className="drawer-body">
        {/* Summary cards */}
        <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 18 }}>
          <div className="card card-pad" style={{ padding: 14 }}>
            <div className="tiny muted">ระยะเวลาติดตั้ง</div>
            <div className="display bold mono" style={{ fontSize: 22 }}>{hospital.weeks}<span className="muted" style={{ fontSize: 13 }}> สัปดาห์</span></div>
            <div className="tiny muted">{totalDays} วัน</div>
          </div>
          <div className="card card-pad" style={{ padding: 14 }}>
            <div className="tiny muted">Ward ที่ติดตั้ง</div>
            <div className="display bold mono" style={{ fontSize: 22 }}>
              {hospital.wardInstalled}<span className="muted" style={{ fontSize: 13 }}> / {hospital.wardTotal || "—"}</span>
            </div>
            <div className="tiny muted">+ {hospital.wardBonus} ward ที่แถม · {hospital.wardTotal ? Math.round(((hospital.wardInstalled + hospital.wardBonus) / hospital.wardTotal) * 100) : 0}% ของ รพ.</div>
          </div>
          <div className="card card-pad" style={{ padding: 14 }}>
            <div className="tiny muted">ราคาขาย</div>
            <div className="display bold mono" style={{ fontSize: 22 }}>{fmtBaht(hospital.price)}</div>
            <Chip kind={advanceChipClass(hospital.advance).replace("chip-", "")} className="tiny" style={{ marginTop: 4 }}>{hospital.advance}</Chip>
          </div>
        </div>

        {/* Timeline */}
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="card-head"><h3>Timeline การติดตั้ง</h3></div>
          <div style={{ padding: 18 }}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
              <div className="tiny muted mono">{fmtDate(hospital.start)}</div>
              <div className="tiny bold mono">{progress}%</div>
              <div className="tiny muted mono">{fmtDate(hospital.end)}</div>
            </div>
            <div className="progress thick">
              <span style={{ width: progress + "%" }} />
            </div>
            <div className="row" style={{ marginTop: 14, gap: 10 }}>
              <Chip kind="outline"><Icon name="clock" size={11} /> เริ่ม {fmtDate(hospital.start)}</Chip>
              <Chip kind="outline"><Icon name="check" size={11} /> สิ้นสุด {fmtDate(hospital.end)}</Chip>
              <Chip kind="info"><Icon name="award" size={11} /> ประกัน {fmtDate(hospital.warrantyEnd)}</Chip>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="card-head">
            <h3>ทีมงาน · หลัก {members.length} คน{hospital.auxTeam?.length ? ` · เสริม ${hospital.auxTeam.length} ครั้ง` : ""}</h3>
            <div className="row-end tiny muted">
              <Icon name="award" size={11} /> หัวหน้า: {lead ? lead.nick : "—"}
            </div>
          </div>
          <div style={{ padding: 14 }}>
            <div className="tiny" style={{ fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--accent)" }} />
              ทีมงานหลัก (Main)
            </div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
              {members.map(m => (
                <div key={m.id} className="row" style={{ padding: 8, background: "var(--surface-alt)", borderRadius: 8 }}>
                  <Avatar name={m.nick} color={m.avatar} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{m.nick} <span className="muted tiny">({m.fname})</span></div>
                    <div className="tiny muted">{m.posShort}</div>
                  </div>
                  {m.id === hospital.lead && <Chip kind="warning">หัวหน้า</Chip>}
                </div>
              ))}
            </div>

            {hospital.auxTeam && hospital.auxTeam.length > 0 && (
              <>
                <div className="tiny" style={{ fontWeight: 600, margin: "16px 0 8px", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--c2)" }} />
                  ทีมงานเสริม (Auxiliary)
                </div>
                <div className="stack" style={{ gap: 6 }}>
                  {hospital.auxTeam.map((ax) => {
                    const m = team.find(t => t.id === ax.memberId);
                    const hasTravel = (ax.travelOut && ax.travelOut.date) || (ax.travelBack && ax.travelBack.date);
                    return (
                      <div key={ax.id} style={{ padding: 10, background: "var(--surface-alt)", borderRadius: 8 }}>
                        <div className="row" style={{ gap: 10 }}>
                          {m ? <Avatar name={m.nick} color={m.avatar} /> : <div className="avatar" style={{ background: "var(--muted-2)" }}>?</div>}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>
                              {m ? `${m.nick} (${m.fname})` : "—"}
                              {ax.role && <span className="muted" style={{ fontWeight: 400 }}> · {ax.role}</span>}
                            </div>
                            <div className="tiny muted mono" style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 2 }}>
                              <Icon name="clock" size={10} /> {fmtDate(ax.dateFrom)} → {ax.dateTo ? fmtDate(ax.dateTo) : "ไม่ระบุ"}
                              {ax.weeks && <span> · {ax.weeks} สัปดาห์</span>}
                            </div>
                          </div>
                        </div>
                        {hasTravel && (
                          <div className="row" style={{ gap: 8, marginTop: 8, paddingTop: 8, borderTop: "1px dashed var(--border-2)" }}>
                            {ax.travelOut?.date && (
                              <div style={{ flex: 1, fontSize: 11.5 }}>
                                <div style={{ fontWeight: 700, color: "#1F548A", display: "flex", gap: 4, alignItems: "center" }}>
                                  <span style={{ background: "var(--info-soft)", padding: "0 6px", borderRadius: 99, fontSize: 10 }}>↗</span>
                                  ขาไป · {fmtDate(ax.travelOut.date)}
                                </div>
                                <div className="muted mono tiny" style={{ marginTop: 1 }}>{ax.travelOut.mode}{ax.travelOut.note ? ` · ${ax.travelOut.note}` : ""}</div>
                              </div>
                            )}
                            {ax.travelBack?.date && (
                              <div style={{ flex: 1, fontSize: 11.5 }}>
                                <div style={{ fontWeight: 700, color: "var(--accent-ink)", display: "flex", gap: 4, alignItems: "center" }}>
                                  <span style={{ background: "var(--accent-soft)", padding: "0 6px", borderRadius: 99, fontSize: 10 }}>↙</span>
                                  ขากลับ · {fmtDate(ax.travelBack.date)}
                                </div>
                                <div className="muted mono tiny" style={{ marginTop: 1 }}>{ax.travelBack.mode}{ax.travelBack.note ? ` · ${ax.travelBack.note}` : ""}</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Apps */}
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="card-head">
            <h3>Application ที่ติดตั้ง</h3>
            <div className="row-end tiny muted">
              {hospital.apps.length} / {APPS_CATALOG.length} apps
            </div>
          </div>
          <div className="stack" style={{ padding: 14, gap: 8 }}>
            {APPS_CATALOG.map(a => {
              const on = hospital.apps.includes(a.id);
              return (
                <div key={a.id} className={"app-pill" + (on ? " installed" : "")}>
                  <div className="ico" style={{ background: on ? a.color : "var(--bg-2)", color: on ? "#fff" : "var(--muted)" }}>
                    {a.short}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="nm">{a.name}</div>
                    <div className="meta">{a.desc}</div>
                  </div>
                  {on ? (
                    <Chip kind="success"><Icon name="check" size={10} /> ติดตั้งแล้ว</Chip>
                  ) : (
                    <Chip kind="outline">ยังไม่ติดตั้ง</Chip>
                  )}
                  <Toggle on={on} onChange={() => onToggleApp(a.id)} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Followups */}
        {hospital.followups && hospital.followups.length > 0 && (
          <div className="card" style={{ marginBottom: 18, border: "1px solid var(--danger-soft)" }}>
            <div className="card-head" style={{ background: "var(--danger-soft)", borderBottom: "1px solid #F4DDDC" }}>
              <Icon name="info" size={14} style={{ color: "var(--danger)" }} />
              <div>
                <h3 style={{ color: "#8B2D2D" }}>การติดตามการเก็บเงิน</h3>
                <div className="desc">{hospital.followups.length} ครั้ง · ติดตามล่าสุด {fmtDate(hospital.followups[hospital.followups.length - 1].date)}</div>
              </div>
            </div>
            <div style={{ padding: 14, position: "relative" }}>
              <div style={{ position: "absolute", left: 26, top: 14, bottom: 14, width: 2, background: "var(--border-2)" }} />
              <div className="stack" style={{ gap: 12, position: "relative" }}>
                {hospital.followups.map((f, i) => (
                  <div key={f.id} className="row" style={{ alignItems: "flex-start", gap: 12 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 50,
                      background: "var(--danger-soft)", color: "var(--danger)",
                      display: "grid", placeItems: "center",
                      fontSize: 11, fontWeight: 700,
                      border: "2px solid var(--surface)",
                      zIndex: 1, flexShrink: 0,
                    }}>{i + 1}</div>
                    <div style={{
                      flex: 1, background: "var(--surface-alt)",
                      borderRadius: 8, padding: "10px 14px",
                      border: "1px solid var(--border-2)",
                    }}>
                      <div className="row" style={{ gap: 8, marginBottom: 4 }}>
                        <span className="tiny bold mono">{fmtDate(f.date)}</span>
                        <Chip kind="outline" className="tiny">{f.channel}</Chip>
                        {f.by && <span className="tiny muted">· โดย {f.by}</span>}
                      </div>
                      <div style={{ fontSize: 13, lineHeight: 1.5 }}>{f.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contacts */}
        {(() => {
          const adminCount = hospital.contactsAdmin?.length || 0;
          const followups = hospital.contactsFollowup || {};
          const followupCount = Object.values(followups).reduce((a, b) => a + (b?.length || 0), 0);
          if (adminCount === 0 && followupCount === 0) return null;
          return (
            <div className="card" style={{ marginBottom: 18 }}>
              <div className="card-head">
                <Icon name="phone" size={14} className="muted" />
                <h3>ผู้ติดต่อ · {adminCount + followupCount} คน</h3>
                <div className="row-end tiny muted">
                  Admin {adminCount} · ตามตำแหน่ง {followupCount}
                </div>
              </div>
              <div style={{ padding: 14 }}>
                {adminCount > 0 && (
                  <>
                    <div className="tiny" style={{ fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--accent)" }} />
                      ผู้ดูแลระบบ (Admin)
                    </div>
                    <div className="stack" style={{ gap: 6, marginBottom: 14 }}>
                      {hospital.contactsAdmin.map(c => (
                        <ContactCard key={c.id} c={c} accent="var(--accent)" />
                      ))}
                    </div>
                  </>
                )}
                {FOLLOWUP_ROLES.map(r => {
                  const list = followups[r.key] || [];
                  if (list.length === 0) return null;
                  return (
                    <div key={r.key} style={{ marginBottom: 14 }}>
                      <div className="tiny" style={{ fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6, color: r.color }}>
                        <Icon name={r.icon} size={11} /> {r.label}
                      </div>
                      <div className="stack" style={{ gap: 6 }}>
                        {list.map(c => <ContactCard key={c.id} c={c} accent={r.color} />)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Misc info */}
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="card-head"><h3>ข้อมูลเพิ่มเติม</h3></div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12, padding: 14 }}>
            <InfoRow icon="building" label="ประเภท" value={hospital.type} />
            <InfoRow icon="map" label="ภูมิภาค" value={hospital.region} />
            <InfoRow icon="layers" label="ประเภทงาน" value={hospital.workType} />
            <InfoRow icon="id" label="รหัส Taiga" value={hospital.taiga} />
            <InfoRow icon="box" label="HOSxP Version" value={hospital.hosxpVersion || "—"} />
            <InfoRow icon="layers" label="Database" value={hospital.dbType || "—"} />
            <InfoRow icon="target" label="Phase การติดตั้ง" value={hospital.phase || "—"} />
            <InfoRow icon="cash" label="จำนวน Advance" value={fmtBaht(hospital.advanceAmt)} />
            <InfoRow icon="users" label="ขนาดทีม" value={`${hospital.team.length} คน`} />
            {hospital.teamSheetUrl && (
              <div className="row" style={{ gap: 10, padding: "10px 12px", background: "var(--surface-alt)", borderRadius: 10, gridColumn: "span 2" }}>
                <div style={{ color: "#0F8E5A" }}><Icon name="report" size={14} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="tiny muted">Google Sheet ทีมงาน</div>
                  <a href={hospital.teamSheetUrl} target="_blank" rel="noopener"
                    style={{ fontWeight: 600, fontSize: 12.5, color: "var(--accent)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                    {hospital.teamSheetUrl}
                  </a>
                </div>
                <a href={hospital.teamSheetUrl} target="_blank" rel="noopener" className="btn btn-sm">
                  <Icon name="arrowRight" size={12} /> เปิด
                </a>
              </div>
            )}
            <div className="row" style={{ gap: 10, padding: "10px 12px", background: "var(--surface-alt)", borderRadius: 10, gridColumn: "span 2" }}>
              <div style={{ color: hospital.taigaUrl ? "#0F8E5A" : "var(--warning)" }}>
                <Icon name="layers" size={14} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="tiny muted">Taiga Project <span className="mono">{hospital.taiga}</span></div>
                {hospital.taigaUrl ? (
                  <a href={hospital.taigaUrl} target="_blank" rel="noopener"
                    style={{ fontWeight: 600, fontSize: 12.5, color: "var(--accent)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                    {hospital.taigaUrl}
                  </a>
                ) : (
                  <div className="tiny" style={{ color: "var(--warning)", fontWeight: 600 }}>ยังไม่ได้ระบุลิงก์ Taiga</div>
                )}
              </div>
              {hospital.taigaUrl ? (
                <a href={hospital.taigaUrl} target="_blank" rel="noopener" className="btn btn-sm">
                  <Icon name="arrowRight" size={12} /> เปิด
                </a>
              ) : (
                <Chip kind="warning">รอลิงก์</Chip>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const HospitalsScreen = ({ hospitals, setHospitals, team, year, focusId, onFocusConsumed }) => {
  const [q, setQ] = useState("");
  const [view, setView] = useState("table");
  const [filter, setFilter] = useState({ status: "", region: "", type: "", app: "", hosxp: "", db: "", workType: "" });
  const [detailId, setDetailId] = useState(null);
  const [editing, setEditing] = useState(null);
  const toast = useToast();
  const formDirtyRef = useRef(false);

  const handleCloseEditing = () => {
    if (formDirtyRef.current && !confirm("มีข้อมูลที่ยังไม่ได้บันทึก\nต้องการออกโดยไม่บันทึกหรือไม่?")) return;
    formDirtyRef.current = false;
    setEditing(null);
  };

  useEffect(() => {
    if (focusId) {
      setDetailId(focusId);
      if (onFocusConsumed) onFocusConsumed();
    }
  }, [focusId]);

  const yearHospitals = hospitals.filter(h => h.year === year);
  const filtered = yearHospitals.filter(h => {
    const s = (h.name + h.code + h.province + h.taiga).toLowerCase();
    if (!s.includes(q.toLowerCase())) return false;
    if (filter.status && h.status !== filter.status) return false;
    if (filter.region && h.region !== filter.region) return false;
    if (filter.type && h.type !== filter.type) return false;
    if (filter.app && !h.apps.includes(filter.app)) return false;
    if (filter.hosxp && h.hosxpVersion !== filter.hosxp) return false;
    if (filter.db && h.dbType !== filter.db) return false;
    if (filter.workType && h.workType !== filter.workType) return false;
    return true;
  });

  const detail = hospitals.find(h => h.id === detailId);

  const save = (form) => {
    formDirtyRef.current = false;
    if (editing === "new") {
      const nums = hospitals.map(h => { const m = String(h.id).match(/\d+/); return m ? parseInt(m[0], 10) : 0; });
      const id = "h" + (nums.length === 0 ? 1 : Math.max(...nums) + 1);
      setHospitals([...hospitals, { ...form, id }]);
      toast.push("เพิ่มโรงพยาบาลสำเร็จ");
    } else {
      setHospitals(hospitals.map(h => h.id === editing.id ? { ...editing, ...form } : h));
      toast.push("บันทึกข้อมูลสำเร็จ");
      if (detailId === editing.id) setDetailId(editing.id);
    }
    setEditing(null);
  };

  const remove = (h) => {
    if (confirm(`ลบ ${h.name} ?`)) {
      setHospitals(hospitals.filter(x => x.id !== h.id));
      setDetailId(null);
      toast.push("ลบสำเร็จ");
    }
  };

  const toggleApp = (hospitalId, appId) => {
    setHospitals(hospitals.map(h => {
      if (h.id !== hospitalId) return h;
      const apps = h.apps.includes(appId) ? h.apps.filter(a => a !== appId) : [...h.apps, appId];
      return { ...h, apps };
    }));
  };

  const regions = [...new Set(yearHospitals.map(h => h.region))];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>โรงพยาบาล</h1>
          <div className="sub">รายชื่อโรงพยาบาลที่ติดตั้งระบบในปี {year} — รวม {yearHospitals.length} แห่ง</div>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <SearchBox value={q} onChange={setQ} placeholder="ค้นหา ชื่อ / รหัส / Taiga / จังหวัด" />
          <Tabs
            items={[{ value: "table", label: <Icon name="list" size={12} /> }, { value: "card", label: <Icon name="grid" size={12} /> }]}
            value={view} onChange={setView}
          />
          <button className="btn" onClick={() => toast.push("ส่งออก CSV แล้ว (mock)")}>
            <Icon name="download" size={14} /> Export
          </button>
          <button className="btn btn-accent" onClick={() => setEditing("new")}>
            <Icon name="plus" size={14} /> เพิ่มโรงพยาบาล
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="card card-pad" style={{ marginBottom: 14, padding: 12 }}>
        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <Icon name="filter" size={13} className="muted" />
          <span className="tiny bold" style={{ color: "var(--muted)" }}>FILTER</span>
          <select className="select" style={{ width: "auto" }} value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
            <option value="">สถานะทุกรายการ</option>
            {INSTALL_STATUS.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="select" style={{ width: "auto" }} value={filter.region} onChange={e => setFilter({ ...filter, region: e.target.value })}>
            <option value="">ทุกภูมิภาค</option>
            {regions.map(r => <option key={r}>{r}</option>)}
          </select>
          <select className="select" style={{ width: "auto" }} value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value })}>
            <option value="">ทุกประเภท</option>
            {HOSPITAL_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="select" style={{ width: "auto" }} value={filter.app} onChange={e => setFilter({ ...filter, app: e.target.value })}>
            <option value="">ทุก Application</option>
            {APPS_CATALOG.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select className="select" style={{ width: "auto" }} value={filter.hosxp} onChange={e => setFilter({ ...filter, hosxp: e.target.value })}>
            <option value="">ทุกเวอร์ชั่น HOSxP</option>
            {HOSXP_VERSIONS.map(v => <option key={v}>{v}</option>)}
          </select>
          <select className="select" style={{ width: "auto" }} value={filter.db} onChange={e => setFilter({ ...filter, db: e.target.value })}>
            <option value="">ทุก Database</option>
            {DB_TYPES.map(d => <option key={d}>{d}</option>)}
          </select>
          <select className="select" style={{ width: "auto" }} value={filter.workType} onChange={e => setFilter({ ...filter, workType: e.target.value })}>
            <option value="">ทุก Work Type</option>
            {WORK_TYPES.map(w => <option key={w}>{w}</option>)}
          </select>
          <div className="row-end">
            <span className="tiny muted">{filtered.length} / {yearHospitals.length} รายการ</span>
            {(filter.status || filter.region || filter.type || filter.app || filter.hosxp || filter.db || filter.workType) && (
              <button className="btn btn-sm btn-ghost" onClick={() => setFilter({ status: "", region: "", type: "", app: "", hosxp: "", db: "", workType: "" })}>
                <Icon name="close" size={12} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {view === "table" ? (
        <div className="card" style={{ overflow: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>โรงพยาบาล</th>
                <th>Code / Taiga</th>
                <th>HOSxP / DB</th>
                <th>ระยะเวลา</th>
                <th>หัวหน้า · ทีม</th>
                <th>Wards</th>
                <th>Apps</th>
                <th>ราคา</th>
                <th>สถานะ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(h => {
                const lead = team.find(t => t.id === h.lead);
                const members = h.team.map(id => team.find(t => t.id === id)).filter(Boolean);
                return (
                  <tr key={h.id} onClick={() => setDetailId(h.id)} style={{ cursor: "pointer" }}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{h.name}</div>
                      <div className="tiny muted">{h.province} · {h.type}</div>
                    </td>
                    <td>
                      <div className="mono tiny" style={{ fontWeight: 600 }}>{h.code}</div>
                      <div className="row" style={{ gap: 4, marginTop: 2 }}>
                        <span className="mono tiny muted">{h.taiga}</span>
                        {h.taigaUrl
                          ? <span title="Taiga linked" style={{ width: 12, height: 12, borderRadius: 99, background: "var(--success-soft)", color: "#186540", display: "grid", placeItems: "center", fontSize: 8, fontWeight: 700 }}>✓</span>
                          : <span title="ยังไม่ลิงก์" style={{ width: 12, height: 12, borderRadius: 99, background: "var(--warning-soft)", color: "#8E5610", display: "grid", placeItems: "center", fontSize: 9, fontWeight: 700 }}>!</span>
                        }
                      </div>
                    </td>
                    <td>
                      <Chip kind="accent" className="tiny">{h.hosxpVersion || "—"}</Chip>
                      <div className="tiny muted mono" style={{ marginTop: 3 }}>{h.dbType || "—"}</div>
                    </td>
                    <td>
                      <div className="tiny mono">{fmtDateShort(h.start)} – {fmtDateShort(h.end)}</div>
                      <div className="tiny muted">{h.weeks} สัปดาห์ · {h.workType}</div>
                    </td>
                    <td>
                      <div style={{ marginBottom: 4 }}>
                        {lead ? (
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 12 }}>{lead.nick}</div>
                            <div className="tiny muted">{lead.posShort}</div>
                          </div>
                        ) : (
                          <div className="tiny muted">ยังไม่ระบุ</div>
                        )}
                      </div>
                      {members.length > 0 && (
                        <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid var(--border-2)" }}>
                          <div className="tiny muted">ทีม ({members.length} คน)</div>
                          <div className="tiny" style={{ color: "var(--fg)" }}>
                            {members.filter(m => m.id !== h.lead).slice(0, 3).map(m => m.nick).join(", ")}
                            {members.length > 4 && ` +${members.length - 4}`}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="num">
                      <div>{h.wardInstalled}<span className="muted tiny">+{h.wardBonus}</span></div>
                      <div className="tiny muted mono">/ {h.wardTotal || "—"}</div>
                    </td>
                    <td>
                      <div className="row" style={{ gap: 3 }}>
                        {h.apps.slice(0, 4).map(aid => {
                          const a = APPS_CATALOG.find(x => x.id === aid);
                          return (
                            <span
                              key={aid}
                              title={a.name}
                              style={{
                                width: 22, height: 22, borderRadius: 5,
                                background: a.color, color: "#fff",
                                fontSize: 9, fontWeight: 700,
                                display: "grid", placeItems: "center",
                              }}
                            >{a.short.slice(0, 3)}</span>
                          );
                        })}
                        {h.apps.length > 4 && <span className="tiny muted">+{h.apps.length - 4}</span>}
                      </div>
                    </td>
                    <td className="num">{fmtBaht(h.price)}</td>
                    <td>
                      <Chip kind={statusChipClass(h.status).replace("chip-", "")}>{h.status}</Chip>
                      {h.phase && h.phase !== "ติดตั้งครบทุก ward" && (
                        <div className="tiny muted mono" style={{ marginTop: 3 }}>{h.phase}</div>
                      )}
                      {h.phase === "ติดตั้งครบทุก ward" && (
                        <div className="tiny muted" style={{ marginTop: 3 }}>ครบทุก ward</div>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-sm btn-ghost" onClick={(e) => { e.stopPropagation(); remove(h); }}>
                        <Icon name="trash" size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty">
              <div className="ico"><Icon name="building" size={20} /></div>
              ไม่พบโรงพยาบาลที่ตรงเงื่อนไข
            </div>
          )}
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
          {filtered.map(h => {
            const lead = team.find(t => t.id === h.lead);
            const members = h.team.map(id => team.find(t => t.id === id)).filter(Boolean);
            return (
              <div key={h.id} className="card card-pad" style={{ cursor: "pointer" }} onClick={() => setDetailId(h.id)}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
                  <Chip kind="outline" className="mono">{h.code}</Chip>
                  <Chip kind={statusChipClass(h.status).replace("chip-", "")}>{h.status}</Chip>
                </div>
                <div className="display bold" style={{ fontSize: 15, lineHeight: 1.3, marginBottom: 4 }}>{h.name}</div>
                <div className="tiny muted" style={{ marginBottom: 12 }}>
                  <Icon name="pin" size={11} /> {h.province} · {h.type}
                </div>
                <div className="row" style={{ marginBottom: 12, gap: 6 }}>
                  {h.apps.slice(0, 5).map(aid => {
                    const a = APPS_CATALOG.find(x => x.id === aid);
                    return (
                      <span key={aid} title={a.name}
                        style={{
                          width: 24, height: 24, borderRadius: 6,
                          background: a.color, color: "#fff",
                          fontSize: 9, fontWeight: 700,
                          display: "grid", placeItems: "center",
                        }}
                      >{a.short.slice(0, 3)}</span>
                    );
                  })}
                  {h.apps.length > 5 && <Chip kind="outline">+{h.apps.length - 5}</Chip>}
                </div>
                <div className="row" style={{ gap: 6, marginBottom: 4 }}>
                  <Chip kind="accent" className="tiny">{h.hosxpVersion || "—"}</Chip>
                  <Chip kind="outline" className="tiny mono">{h.dbType || "—"}</Chip>
                </div>
                <hr className="div" style={{ margin: "10px 0" }} />
                <div style={{ marginBottom: 10 }}>
                  <div className="tiny bold muted" style={{ marginBottom: 4 }}>หัวหน้าทีม</div>
                  {lead ? (
                    <div className="row" style={{ gap: 6, alignItems: "center" }}>
                      <Avatar name={lead.nick} color={lead.avatar} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>{lead.nick}</div>
                        <div className="tiny muted">{lead.posShort}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="tiny muted">ยังไม่ระบุ</div>
                  )}
                </div>
                {members.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div className="tiny bold muted" style={{ marginBottom: 4 }}>ทีมงาน ({members.length} คน)</div>
                    <div className="row" style={{ gap: 4, flexWrap: "wrap" }}>
                      {members.filter(m => m.id !== h.lead).slice(0, 4).map(m => (
                        <div key={m.id} title={`${m.nick} - ${m.posShort}`} style={{
                          width: 32, height: 32, borderRadius: 50,
                          background: m.avatar, color: "#fff",
                          display: "grid", placeItems: "center",
                          fontSize: 11, fontWeight: 700, flexShrink: 0,
                          cursor: "pointer"
                        }}>
                          {m.nick.slice(0, 2)}
                        </div>
                      ))}
                      {members.length > 5 && (
                        <div style={{
                          width: 32, height: 32, borderRadius: 50,
                          background: "var(--bg-2)", color: "var(--muted)",
                          display: "grid", placeItems: "center",
                          fontSize: 10, fontWeight: 700
                        }}>
                          +{members.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div className="tiny muted">ราคาขาย</div>
                  <div className="display bold mono" style={{ fontSize: 16 }}>{fmtBaht(h.price)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drawer */}
      <Drawer open={detail != null} onClose={() => setDetailId(null)}>
        {detail && (
          <HospitalDetail
            hospital={detail}
            team={team}
            onEdit={() => setEditing(detail)}
            onClose={() => setDetailId(null)}
            onToggleApp={(appId) => toggleApp(detail.id, appId)}
          />
        )}
      </Drawer>

      <Modal
        open={editing != null}
        onClose={handleCloseEditing}
        title={editing === "new" ? "เพิ่มโรงพยาบาลใหม่" : "แก้ไขข้อมูลโรงพยาบาล"}
        sub={editing === "new" ? "กรอกข้อมูลโครงการติดตั้ง" : editing?.name}
        size="2xl"
      >
        {editing && (
          <HospitalForm
            initial={editing === "new" ? null : editing}
            team={team}
            onSave={save}
            onCancel={handleCloseEditing}
            onDirtyChange={(dirty) => { formDirtyRef.current = dirty; }}
          />
        )}
      </Modal>
    </div>
  );
};

Object.assign(window, { HospitalsScreen, HospitalDetail });
