// =========================================================
// Product Installation — การติดตั้ง/ใช้งานผลิตภัณฑ์ที่ขาย
// =========================================================
// บันทึกการติดตั้งผลิตภัณฑ์ของแต่ละโรงพยาบาล (1 รพ. มีได้หลายผลิตภัณฑ์)
//   1. Application BMS HOSxP Plus
//   2. Application BMS HOSxP Plus ER + ติดตั้ง Dashboard
//   3. Application Nursing Cart (รถเข็นหัตถการ)

const ProductBadge = ({ product }) => {
  const info = window.getProductInfo ? window.getProductInfo(product) : { short: product, color: "#94a3b8" };
  return (
    <span style={{
      display: "inline-block", fontSize: 11, fontWeight: 700,
      padding: "2px 10px", borderRadius: 8, background: info.color, color: "#fff",
    }}>{info.short}</span>
  );
};

const installStatusColor = (s) => {
  if (s === "ติดตั้งแล้ว")  return "#3b82f6";
  if (s === "กำลังใช้งาน") return "#2A8F5E";
  if (s === "กำลังติดตั้ง") return "#f59e0b";
  if (s === "หยุดใช้งาน")  return "#ef4444";
  return "#94a3b8"; // รอติดตั้ง
};

// ── ฟอร์มเพิ่ม/แก้ไขการติดตั้ง ────────────────────────────────
const ProductInstallForm = ({ initial, hospitals, team, onSave, onCancel }) => {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const productTypes = window.PRODUCT_TYPES || [];
  const statusOpts = window.INSTALL_PROGRESS || ["รอติดตั้ง", "ติดตั้งแล้ว"];
  const toggleInstaller = (id) =>
    set("installers", (form.installers || []).includes(id)
      ? form.installers.filter(x => x !== id)
      : [...(form.installers || []), id]);

  const sortedHosps = [...hospitals].sort((a, b) =>
    (a.code || "").localeCompare(b.code || "") || (a.name || "").localeCompare(b.name || ""));

  const valid = form.product && form.hospitalId;

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="ผลิตภัณฑ์ที่ติดตั้ง" en="Product" span={2}>
          <select className="select" value={form.product || ""} onChange={e => set("product", e.target.value)}>
            <option value="">— เลือกผลิตภัณฑ์ —</option>
            {productTypes.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </Field>

        <Field label="โรงพยาบาลที่ติดตั้ง" en="Hospital" span={2}>
          <select className="select" value={form.hospitalId || ""} onChange={e => set("hospitalId", e.target.value)}>
            <option value="">— เลือกโรงพยาบาล —</option>
            {sortedHosps.map(h => (
              <option key={h.id} value={h.id}>
                {(h.code ? h.code + " · " : "") + h.name + (h.year ? ` (${h.year})` : "")}
              </option>
            ))}
          </select>
        </Field>

        <Field label="วันที่ติดตั้ง" en="Install date">
          <ThaiDateInput value={form.installDate || ""} onChange={v => set("installDate", v)} />
        </Field>
        <Field label="สถานะ" en="Status">
          <select className="select" value={form.status || "รอติดตั้ง"} onChange={e => set("status", e.target.value)}>
            {statusOpts.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      <Field label="ผู้ติดตั้ง / ผู้ใช้งาน" en="Installer / operator">
        <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
          {team.length === 0 && <div className="tiny muted">ยังไม่มีรายชื่อทีมงาน</div>}
          {team.map(t => {
            const on = (form.installers || []).includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleInstaller(t.id)}
                className={"btn btn-sm" + (on ? " btn-accent" : "")}
              >
                {on && <Icon name="check" size={11} />} {t.nick || t.fname}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="หมายเหตุ" en="Note">
        <textarea className="input" rows={3} value={form.note || ""} onChange={e => set("note", e.target.value)} placeholder="หมายเหตุเพิ่มเติม..." />
      </Field>

      <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
        <button type="button" className="btn" onClick={onCancel}>ยกเลิก</button>
        <button type="button" className="btn btn-accent" onClick={() => onSave(form)} disabled={!valid}>
          <Icon name="check" size={12} /> บันทึก
        </button>
      </div>
    </div>
  );
};

const ProductInstallScreen = ({ hospitals, installs, setInstalls, team, canEdit = false }) => {
  const [q, setQ] = useState("");
  const [productFilter, setProductFilter] = useState("ทั้งหมด");
  const [editing, setEditing] = useState(null); // null | "new" | record
  const toast = useToast();

  const productTypes = window.PRODUCT_TYPES || [];
  const hospById = useMemo(() => {
    const m = {};
    hospitals.forEach(h => { m[h.id] = h; });
    return m;
  }, [hospitals]);

  const blankRec = () => ({
    id: "", hospitalId: "", product: "", installDate: "",
    installers: [], status: "รอติดตั้ง", note: "",
  });

  const rows = useMemo(() => {
    return (installs || [])
      .filter(r => {
        if (productFilter !== "ทั้งหมด" && r.product !== productFilter) return false;
        const h = hospById[r.hospitalId];
        const s = ((h?.name || "") + " " + (h?.code || "") + " " + (r.note || "")).toLowerCase();
        return s.includes(q.toLowerCase());
      })
      .sort((a, b) => (b.installDate || "").localeCompare(a.installDate || ""));
  }, [installs, productFilter, q, hospById]);

  const stats = useMemo(() => {
    const by = {};
    productTypes.forEach(p => { by[p.key] = 0; });
    (installs || []).forEach(r => { if (by[r.product] != null) by[r.product]++; });
    return by;
  }, [installs, productTypes]);

  const save = (form) => {
    if (form.id) {
      setInstalls((installs || []).map(r => r.id === form.id ? form : r));
      toast.push("บันทึกการติดตั้งแล้ว");
    } else {
      const id = "inst_" + Date.now() + Math.floor(Math.random() * 1000);
      setInstalls([...(installs || []), { ...form, id }]);
      toast.push("เพิ่มการติดตั้งแล้ว");
    }
    setEditing(null);
  };

  const remove = (r) => {
    const h = hospById[r.hospitalId];
    const info = window.getProductInfo ? window.getProductInfo(r.product) : { short: r.product };
    if (confirm(`ลบการติดตั้ง ${info.short} ที่ ${h?.name || "—"} ?`)) {
      setInstalls((installs || []).filter(x => x.id !== r.id));
      toast.push("ลบแล้ว");
    }
  };

  const installerNames = (ids) => (ids || [])
    .map(id => { const m = team.find(t => t.id === id); return m ? (m.nick || m.fname) : null; })
    .filter(Boolean);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>ติดตั้งผลิตภัณฑ์</h1>
          <div className="sub">บันทึกการติดตั้ง / ใช้งานผลิตภัณฑ์ที่ขาย — รวม {(installs || []).length} รายการ</div>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <SearchBox value={q} onChange={setQ} placeholder="ค้นหาด้วยชื่อ รพ. / รหัส / หมายเหตุ" />
          {canEdit && (
            <button className="btn btn-accent" onClick={() => setEditing("new")}>
              <Icon name="plus" size={14} /> เพิ่มการติดตั้ง
            </button>
          )}
        </div>
      </div>

      {/* สรุปยอดต่อผลิตภัณฑ์ + filter */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 16 }}>
        {productTypes.map(p => (
          <button
            key={p.key}
            type="button"
            onClick={() => setProductFilter(productFilter === p.key ? "ทั้งหมด" : p.key)}
            className="card kpi"
            style={{
              textAlign: "left", cursor: "pointer",
              border: productFilter === p.key ? `2px solid ${p.color}` : "1px solid var(--border-2)",
            }}
          >
            <div className="kpi-label" style={{ color: p.color }}>
              <Icon name={p.icon} size={14} /> {p.short}
            </div>
            <div className="kpi-value">{stats[p.key] || 0}<span className="unit">รายการ</span></div>
          </button>
        ))}
      </div>

      {productFilter !== "ทั้งหมด" && (
        <div className="row" style={{ gap: 8, marginBottom: 12, alignItems: "center" }}>
          <span className="tiny muted">กรองเฉพาะ:</span>
          <ProductBadge product={productFilter} />
          <button className="btn btn-sm btn-ghost" onClick={() => setProductFilter("ทั้งหมด")}>
            <Icon name="close" size={11} /> ล้างตัวกรอง
          </button>
        </div>
      )}

      <div className="card" style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>รหัส รพ.</th>
              <th>โรงพยาบาลที่ติดตั้ง</th>
              <th>ผลิตภัณฑ์</th>
              <th>วันที่ติดตั้ง</th>
              <th>ผู้ติดตั้ง/ใช้งาน</th>
              <th>สถานะ</th>
              <th>หมายเหตุ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={8} className="tiny muted" style={{ textAlign: "center", padding: 24 }}>
                ยังไม่มีรายการติดตั้ง{canEdit ? " — กด \"เพิ่มการติดตั้ง\" เพื่อเริ่ม" : ""}
              </td></tr>
            )}
            {rows.map(r => {
              const h = hospById[r.hospitalId];
              const installers = installerNames(r.installers);
              return (
                <tr key={r.id}>
                  <td className="mono">{h?.code || "—"}</td>
                  <td style={{ fontWeight: 600 }}>{h?.name || "(ไม่พบโรงพยาบาล)"}</td>
                  <td><ProductBadge product={r.product} /></td>
                  <td className="tiny">{r.installDate ? (window.fmtDate ? window.fmtDate(r.installDate) : r.installDate) : "—"}</td>
                  <td className="tiny">{installers.length ? installers.join(", ") : "—"}</td>
                  <td>
                    <span style={{
                      display: "inline-block", fontSize: 11, fontWeight: 700,
                      padding: "2px 8px", borderRadius: 8,
                      background: installStatusColor(r.status), color: "#fff",
                    }}>{r.status || "รอติดตั้ง"}</span>
                  </td>
                  <td className="tiny muted" style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.note}>{r.note || "—"}</td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      <button type="button" className="btn btn-sm btn-ghost" onClick={() => setEditing(r)} title={canEdit ? "แก้ไข" : "ดู"}>
                        <Icon name={canEdit ? "edit" : "info"} size={12} />
                      </button>
                      {canEdit && (
                        <button type="button" className="btn btn-sm btn-ghost" onClick={() => remove(r)} title="ลบ">
                          <Icon name="trash" size={12} />
                        </button>
                      )}
                    </div>
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
        title={editing === "new" ? "เพิ่มการติดตั้งผลิตภัณฑ์" : (canEdit ? "แก้ไขการติดตั้ง" : "รายละเอียดการติดตั้ง")}
        sub={editing && editing !== "new" ? (hospById[editing.hospitalId]?.name || "") : "ระบุ รพ. / วันที่ / ผู้ติดตั้งใช้งาน"}
        size="lg"
      >
        {editing && (
          canEdit ? (
            <ProductInstallForm
              initial={editing === "new" ? blankRec() : editing}
              hospitals={hospitals}
              team={team}
              onSave={save}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <ProductInstallReadOnly rec={editing} hospital={hospById[editing.hospitalId]} team={team} />
          )
        )}
      </Modal>
    </div>
  );
};

// ── มุมมองอ่านอย่างเดียว (สำหรับ viewer) ──────────────────────
const ProductInstallReadOnly = ({ rec, hospital, team }) => {
  const info = window.getProductInfo ? window.getProductInfo(rec.product) : { label: rec.product };
  const installers = (rec.installers || [])
    .map(id => { const m = team.find(t => t.id === id); return m ? (m.nick || m.fname) : null; })
    .filter(Boolean);
  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <InfoRow icon="box"      label="ผลิตภัณฑ์"        value={info.label} />
      <InfoRow icon="building" label="โรงพยาบาล"        value={hospital ? `${hospital.code ? hospital.code + " · " : ""}${hospital.name}` : "—"} />
      <InfoRow icon="clock"    label="วันที่ติดตั้ง"     value={rec.installDate ? (window.fmtDate ? window.fmtDate(rec.installDate) : rec.installDate) : "—"} />
      <InfoRow icon="info"     label="สถานะ"           value={rec.status || "รอติดตั้ง"} />
      <InfoRow icon="users"    label="ผู้ติดตั้ง/ใช้งาน"  value={installers.length ? installers.join(", ") : "—"} />
      <InfoRow icon="info"     label="หมายเหตุ"         value={rec.note || "—"} />
    </div>
  );
};

Object.assign(window, { ProductInstallScreen });
