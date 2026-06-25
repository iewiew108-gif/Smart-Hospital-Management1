// =========================================================
// Package Paperless — การส่ง/การซื้อ Package
// =========================================================
// เก็บสถานะการส่งและการซื้อ Package ของแต่ละโรงพยาบาล
// ราคาอ้างอิงจากขนาด/จำนวนเตียง (window.getPackagePrice)

const pkgId = (hospitalId) => "pkg_" + hospitalId;

const SentBadge = ({ status }) => {
  const sent = status === "Sent";
  return (
    <span style={{
      display: "inline-block", fontSize: 11, fontWeight: 700,
      padding: "2px 10px", borderRadius: 8,
      background: sent ? "#2A8F5E" : "#94a3b8", color: "#fff",
    }}>{sent ? "Sent" : "Not Sent"}</span>
  );
};

// ── ผู้ติดต่อ รพ. (ชื่อ/ตำแหน่ง/เบอร์/อีเมล/ช่องทาง) ──────────
const PkgContactList = ({ items = [], onChange }) => {
  const [draft, setDraft] = useState({ name: "", pos: "", phone: "", email: "", channel: "LINE" });
  const channels = window.PACKAGE_CHANNELS || ["LINE", "อีเมล", "โทรศัพท์", "อื่น ๆ"];
  const add = () => {
    if (!draft.name.trim()) return;
    const id = "pc" + Date.now() + Math.floor(Math.random() * 1000);
    onChange([...items, { ...draft, id }]);
    setDraft({ name: "", pos: "", phone: "", email: "", channel: "LINE" });
  };
  const update = (id, key, val) => onChange(items.map(c => c.id === id ? { ...c, [key]: val } : c));
  const remove = (id) => onChange(items.filter(c => c.id !== id));

  return (
    <div className="stack" style={{ gap: 8 }}>
      {items.map((c, i) => (
        <div key={c.id} style={{ background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border-2)", padding: 10 }}>
          <div className="row" style={{ gap: 8, marginBottom: 8, alignItems: "center" }}>
            <div style={{ width: 22, height: 22, borderRadius: 99, background: "var(--accent)", color: "#fff", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
            <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>ผู้ติดต่อ #{i + 1}</div>
            <button type="button" className="btn btn-sm btn-ghost btn-icon" onClick={() => remove(c.id)} title="ลบ">
              <Icon name="trash" size={12} />
            </button>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1.3fr 1fr", gap: 8 }}>
            <Field label="ชื่อ-นามสกุล">
              <input className="input" value={c.name} onChange={e => update(c.id, "name", e.target.value)} placeholder="เช่น คุณสมชาย ใจดี" />
            </Field>
            <Field label="ตำแหน่ง">
              <input className="input" value={c.pos} onChange={e => update(c.id, "pos", e.target.value)} placeholder="เช่น หัวหน้าฝ่าย IT" />
            </Field>
            <Field label="เบอร์โทร">
              <input className="input mono" value={c.phone} onChange={e => update(c.id, "phone", e.target.value)} placeholder="0X-XXX-XXXX" />
            </Field>
            <Field label="Email">
              <input className="input mono" value={c.email} onChange={e => update(c.id, "email", e.target.value)} placeholder="name@hospital.go.th" />
            </Field>
            <Field label="ส่งทาง / ช่องทางติดต่อ" span={2}>
              <select className="select" value={c.channel || "LINE"} onChange={e => update(c.id, "channel", e.target.value)}>
                {channels.map(ch => <option key={ch} value={ch}>{ch}</option>)}
              </select>
            </Field>
          </div>
        </div>
      ))}

      <div style={{ background: "var(--surface-alt)", borderRadius: 10, border: "1px dashed var(--border-strong)", padding: 10 }}>
        <div className="tiny" style={{ fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>+ เพิ่มผู้ติดต่อใหม่</div>
        <div className="grid" style={{ gridTemplateColumns: "1.3fr 1fr 1fr 1.2fr 1fr auto", gap: 8, alignItems: "flex-end" }}>
          <Field label="ชื่อ-นามสกุล">
            <input className="input" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="เช่น คุณสมชาย ใจดี" />
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
          <Field label="ส่งทาง">
            <select className="select" value={draft.channel} onChange={e => setDraft({ ...draft, channel: e.target.value })}>
              {channels.map(ch => <option key={ch} value={ch}>{ch}</option>)}
            </select>
          </Field>
          <button type="button" className="btn btn-accent" onClick={add} disabled={!draft.name.trim()}>
            <Icon name="plus" size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── ฟอร์มแก้ไข Package ของโรงพยาบาลหนึ่งแห่ง ──────────────────
const PackageForm = ({ initial, hospital, team, onSave, onCancel }) => {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const bedOpts = window.PACKAGE_BED_OPTIONS || [];
  const sentOpts = window.PACKAGE_SENT_STATUS || ["Not Sent", "Sent"];
  const price = window.getPackagePrice ? window.getPackagePrice(form.beds) : 0;
  const toggleOwner = (id) =>
    set("ownerTeam", (form.ownerTeam || []).includes(id)
      ? form.ownerTeam.filter(x => x !== id)
      : [...(form.ownerTeam || []), id]);

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="ขนาด / จำนวนเตียง" en="Beds">
          <select className="select" value={form.beds || ""} onChange={e => set("beds", e.target.value ? Number(e.target.value) : null)}>
            <option value="">— เลือกขนาด —</option>
            {bedOpts.map(o => <option key={o.beds} value={o.beds}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="ราคา Package (อัตโนมัติจากขนาด)" en="Price">
          <div className="input mono" style={{ display: "flex", alignItems: "center", background: "var(--surface-alt)", fontWeight: 700 }}>
            {window.fmtBaht ? window.fmtBaht(price) : price + " บาท"}
          </div>
        </Field>

        <Field label="ประเภทแพ็กเกจ" en="Package type" span={2}>
          <input className="input" value={form.packageType || ""} onChange={e => set("packageType", e.target.value)} placeholder="เช่น Paperless Standard / Premium" />
        </Field>

        <Field label="สถานะการส่ง Package" en="Sent status">
          <select className="select" value={form.sentStatus || "Not Sent"} onChange={e => set("sentStatus", e.target.value)}>
            {sentOpts.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="วันที่ส่ง Package" en="Sent date">
          <ThaiDateInput value={form.sentDate || ""} onChange={v => set("sentDate", v)} />
        </Field>

        <Field label="สถานะการซื้อ" en="Purchase status" span={2}>
          <input className="input" value={form.purchaseStatus || ""} onChange={e => set("purchaseStatus", e.target.value)} placeholder="เช่น รออนุมัติงบ / ทำ PO แล้ว / ซื้อแล้ว" />
        </Field>
      </div>

      <Field label="ผู้รับผิดชอบ (ทีม / พนักงานในบริษัท)" en="Owner team">
        <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
          {team.length === 0 && <div className="tiny muted">ยังไม่มีรายชื่อทีมงาน</div>}
          {team.map(t => {
            const on = (form.ownerTeam || []).includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleOwner(t.id)}
                className={"btn btn-sm" + (on ? " btn-accent" : "")}
              >
                {on && <Icon name="check" size={11} />} {t.nick || t.fname}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="ผู้ติดต่อ รพ." en="Hospital contacts">
        <PkgContactList items={form.contacts || []} onChange={v => set("contacts", v)} />
      </Field>

      <Field label="หมายเหตุ" en="Note">
        <textarea className="input" rows={3} value={form.note || ""} onChange={e => set("note", e.target.value)} placeholder="หมายเหตุเพิ่มเติม..." />
      </Field>

      <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
        <button type="button" className="btn" onClick={onCancel}>ยกเลิก</button>
        <button type="button" className="btn btn-accent" onClick={() => onSave(form)}>
          <Icon name="check" size={12} /> บันทึก
        </button>
      </div>
    </div>
  );
};

const PackageScreen = ({ hospitals, packages, setPackages, team, year, canEdit = false }) => {
  const [q, setQ] = useState("");
  const [sentFilter, setSentFilter] = useState("ทั้งหมด");
  const [editing, setEditing] = useState(null); // hospital being edited
  const toast = useToast();

  const pkgByHospital = useMemo(() => {
    const m = {};
    (packages || []).forEach(p => { m[p.hospitalId] = p; });
    return m;
  }, [packages]);

  const blankPkg = (hospitalId) => ({
    id: pkgId(hospitalId), hospitalId, beds: null, packageType: "",
    sentStatus: "Not Sent", sentDate: "", purchaseStatus: "", note: "",
    contacts: [], ownerTeam: [],
  });

  // รวมรายชื่อ รพ. ของปีที่เลือก + package ของแต่ละแห่ง
  const rows = useMemo(() => {
    return hospitals
      .filter(h => h.year === year)
      .map(h => ({ hospital: h, pkg: pkgByHospital[h.id] || blankPkg(h.id) }))
      .filter(r => {
        if (sentFilter !== "ทั้งหมด" && r.pkg.sentStatus !== sentFilter) return false;
        const s = (r.hospital.name + " " + r.hospital.code + " " + (r.pkg.packageType || "")).toLowerCase();
        return s.includes(q.toLowerCase());
      })
      .sort((a, b) => (a.hospital.code || "").localeCompare(b.hospital.code || ""));
  }, [hospitals, year, pkgByHospital, sentFilter, q]);

  const stats = useMemo(() => {
    const all = hospitals.filter(h => h.year === year);
    let sent = 0, value = 0;
    all.forEach(h => {
      const p = pkgByHospital[h.id];
      if (p && p.sentStatus === "Sent") sent++;
      if (p && p.beds) value += window.getPackagePrice ? window.getPackagePrice(p.beds) : 0;
    });
    return { total: all.length, sent, notSent: all.length - sent, value };
  }, [hospitals, year, pkgByHospital]);

  const save = (form) => {
    const others = (packages || []).filter(p => p.hospitalId !== form.hospitalId);
    setPackages([...others, form]);
    setEditing(null);
    toast.push("บันทึก Package แล้ว");
  };

  const ownerNames = (ids) => (ids || [])
    .map(id => { const m = team.find(t => t.id === id); return m ? (m.nick || m.fname) : null; })
    .filter(Boolean);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Package Paperless</h1>
          <div className="sub">ติดตามการส่ง / การซื้อ Package ของโรงพยาบาล — ปี {year} · รวม {stats.total} แห่ง</div>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <SearchBox value={q} onChange={setQ} placeholder="ค้นหาด้วยชื่อ รพ. / รหัส / ประเภทแพ็กเกจ" />
          <div className="row" style={{ gap: 4 }}>
            {["ทั้งหมด", "Sent", "Not Sent"].map(s => (
              <button
                key={s}
                type="button"
                className={"btn btn-sm" + (sentFilter === s ? " btn-accent" : "")}
                onClick={() => setSentFilter(s)}
              >{s === "ทั้งหมด" ? "ทั้งหมด" : s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* สรุปยอด */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 16 }}>
        <KPI label="โรงพยาบาลทั้งหมด" value={stats.total} unit="แห่ง" icon="building" />
        <KPI label="ส่ง Package แล้ว" value={stats.sent} unit="แห่ง" icon="box" />
        <KPI label="ยังไม่ส่ง" value={stats.notSent} unit="แห่ง" icon="clock" />
        <KPI label="มูลค่ารวม (ตามขนาด)" value={window.fmtBahtShort ? window.fmtBahtShort(stats.value) : stats.value} icon="report" />
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>รหัส รพ.</th>
              <th>ชื่อโรงพยาบาล</th>
              <th>ขนาด/เตียง</th>
              <th>ราคา</th>
              <th>ประเภทแพ็กเกจ</th>
              <th>การส่ง</th>
              <th>วันที่ส่ง</th>
              <th>สถานะการซื้อ</th>
              <th>ผู้รับผิดชอบ</th>
              <th>หมายเหตุ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={11} className="tiny muted" style={{ textAlign: "center", padding: 24 }}>
                ไม่พบโรงพยาบาลในปี {year}
              </td></tr>
            )}
            {rows.map(({ hospital: h, pkg: p }) => {
              const price = window.getPackagePrice ? window.getPackagePrice(p.beds) : 0;
              const owners = ownerNames(p.ownerTeam);
              return (
                <tr key={h.id}>
                  <td className="mono">{h.code || "—"}</td>
                  <td style={{ fontWeight: 600 }}>{h.name}</td>
                  <td>{p.beds ? (window.getBedLabel ? window.getBedLabel(p.beds) : p.beds) : "—"}</td>
                  <td className="mono">{price ? (window.fmtBaht ? window.fmtBaht(price) : price) : "—"}</td>
                  <td>{p.packageType || "—"}</td>
                  <td><SentBadge status={p.sentStatus} /></td>
                  <td className="tiny">{p.sentDate ? (window.fmtDate ? window.fmtDate(p.sentDate) : p.sentDate) : "—"}</td>
                  <td className="tiny">{p.purchaseStatus || "—"}</td>
                  <td className="tiny">{owners.length ? owners.join(", ") : "—"}</td>
                  <td className="tiny muted" style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={p.note}>{p.note || "—"}</td>
                  <td>
                    {canEdit ? (
                      <button type="button" className="btn btn-sm btn-ghost" onClick={() => setEditing(h)} title="แก้ไข">
                        <Icon name="edit" size={12} />
                      </button>
                    ) : (
                      <button type="button" className="btn btn-sm btn-ghost" onClick={() => setEditing(h)} title="ดู">
                        <Icon name="info" size={12} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={editing != null}
        onClose={() => setEditing(null)}
        title={editing ? `Package — ${editing.name}` : "Package"}
        sub={editing ? `รหัส ${editing.code || "—"}${canEdit ? "" : " · โหมดดูอย่างเดียว"}` : ""}
        size="lg"
      >
        {editing && (
          canEdit ? (
            <PackageForm
              initial={pkgByHospital[editing.id] || blankPkg(editing.id)}
              hospital={editing}
              team={team}
              onSave={save}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <PackageReadOnly pkg={pkgByHospital[editing.id] || blankPkg(editing.id)} team={team} />
          )
        )}
      </Modal>
    </div>
  );
};

// ── มุมมองอ่านอย่างเดียว (สำหรับ viewer) ──────────────────────
const PackageReadOnly = ({ pkg, team }) => {
  const price = window.getPackagePrice ? window.getPackagePrice(pkg.beds) : 0;
  const owners = (pkg.ownerTeam || [])
    .map(id => { const m = team.find(t => t.id === id); return m ? (m.nick || m.fname) : null; })
    .filter(Boolean);
  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <InfoRow icon="box"    label="ขนาด/เตียง"        value={pkg.beds ? (window.getBedLabel ? window.getBedLabel(pkg.beds) : pkg.beds) : "—"} />
      <InfoRow icon="report" label="ราคา"              value={price ? (window.fmtBaht ? window.fmtBaht(price) : price) : "—"} />
      <InfoRow icon="info"   label="ประเภทแพ็กเกจ"     value={pkg.packageType || "—"} />
      <InfoRow icon="box"    label="การส่ง"            value={pkg.sentStatus || "Not Sent"} />
      <InfoRow icon="clock"  label="วันที่ส่ง"          value={pkg.sentDate ? (window.fmtDate ? window.fmtDate(pkg.sentDate) : pkg.sentDate) : "—"} />
      <InfoRow icon="info"   label="สถานะการซื้อ"      value={pkg.purchaseStatus || "—"} />
      <InfoRow icon="users"  label="ผู้รับผิดชอบ"       value={owners.length ? owners.join(", ") : "—"} />
      <InfoRow icon="info"   label="หมายเหตุ"          value={pkg.note || "—"} />
      <div style={{ gridColumn: "span 2" }}>
        <div className="tiny muted" style={{ marginBottom: 6 }}>ผู้ติดต่อ รพ.</div>
        {(pkg.contacts || []).length === 0 && <div className="tiny muted">—</div>}
        {(pkg.contacts || []).map(c => (
          <div key={c.id} className="row" style={{ gap: 10, padding: "8px 12px", background: "var(--surface-alt)", borderRadius: 8, marginBottom: 6 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name} {c.pos && <span className="tiny muted">· {c.pos}</span>}</div>
              <div className="tiny muted">
                {[c.phone, c.email, c.channel && ("ส่งทาง " + c.channel)].filter(Boolean).join(" · ")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { PackageScreen });
