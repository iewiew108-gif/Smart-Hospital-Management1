// =========================================================
// Annual Targets Screen
// =========================================================

const TargetsScreen = ({ targets, setTargets, hospitals }) => {
  const [editing, setEditing] = useState(null);
  const toast = useToast();
  const years = Object.keys(targets).map(Number).sort();

  const yearStats = (y) => {
    const list = hospitals.filter(h => h.year === y);
    return {
      hospitals: list.length,
      apps: list.reduce((a, h) => a + h.apps.length, 0),
      revenue: list.reduce((a, h) => a + h.price, 0),
    };
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>เป้าหมายรายปี</h1>
          <div className="sub">ตั้งเป้าและเทียบยอดติดตั้งจริงในแต่ละปี</div>
        </div>
        <button className="btn btn-accent" onClick={() => setEditing({ year: Math.max(...years) + 1, hospitals: 30, revenue: 80000000, isNew: true })}>
          <Icon name="plus" size={14} /> ตั้งเป้าหมายปีใหม่
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
        {years.map(y => {
          const t = targets[y];
          const s = yearStats(y);
          const pctH = Math.min(100, (s.hospitals / t.hospitals) * 100);
          const pctA = Math.min(100, (s.apps / t.apps) * 100);
          const pctR = Math.min(100, (s.revenue / t.revenue) * 100);
          const isHit = pctH >= 100;
          return (
            <div key={y} className="card card-pad" style={{ position: "relative", overflow: "hidden" }}>
              {isHit && (
                <div style={{
                  position: "absolute", top: 12, right: 12,
                  background: "var(--success)", color: "#fff",
                  padding: "3px 9px", borderRadius: 99,
                  fontSize: 10, fontWeight: 700,
                  display: "flex", gap: 4, alignItems: "center",
                }}>
                  <Icon name="check" size={10} /> ถึงเป้า
                </div>
              )}
              <div className="row" style={{ alignItems: "center", marginBottom: 16, gap: 14 }}>
                <ProgressRing value={s.hospitals} max={t.hospitals} size={84} stroke={9} />
                <div style={{ flex: 1 }}>
                  <div className="display bold" style={{ fontSize: 28, lineHeight: 1 }}>ปี {y}</div>
                  <div className="tiny muted" style={{ marginTop: 4 }}>
                    {s.hospitals} / {t.hospitals} แห่ง
                  </div>
                  <div className="row" style={{ gap: 4, marginTop: 6 }}>
                    <Chip kind={pctH >= 100 ? "success" : pctH >= 70 ? "warning" : "danger"}>{Math.round(pctH)}%</Chip>
                    <button className="btn btn-sm btn-ghost" onClick={() => setEditing({ year: y, ...t })}>
                      <Icon name="edit" size={11} /> แก้ไข
                    </button>
                  </div>
                </div>
              </div>

              <div className="stack" style={{ gap: 14 }}>
                <ProgressRow
                  label="โรงพยาบาล" en="Hospitals"
                  current={s.hospitals} target={t.hospitals}
                  unit="แห่ง" color="var(--accent)"
                />
                <ProgressRow
                  label="รายได้" en="Revenue"
                  current={s.revenue} target={t.revenue}
                  formatter={fmtBaht} color="var(--c3)"
                />
                <div className="row" style={{ justifyContent: "space-between", padding: "6px 0 0", borderTop: "1px dashed var(--border-2)" }}>
                  <span className="tiny muted">· Application (ติดตาม Monitor)</span>
                  <span className="tiny mono bold">{s.apps} apps</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for editing target */}
      <Modal
        open={editing != null}
        onClose={() => setEditing(null)}
        title={editing?.isNew ? `ตั้งเป้าหมายปี ${editing?.year}` : `แก้ไขเป้าหมายปี ${editing?.year}`}
        size=""
        footer={
          <>
            <button className="btn" onClick={() => setEditing(null)}>ยกเลิก</button>
            <button className="btn btn-accent" onClick={() => {
              setTargets({ ...targets, [editing.year]: {
                hospitals: editing.hospitals,
                revenue: editing.revenue,
              } });
              toast.push(editing.isNew ? "ตั้งเป้าปีใหม่สำเร็จ" : "บันทึกเป้าหมายสำเร็จ");
              setEditing(null);
            }}>
              <Icon name="check" size={14} /> บันทึก
            </button>
          </>
        }
      >
        {editing && (
          <div className="grid" style={{ gap: 14 }}>
            {editing.isNew && (
              <Field label="ปี" en="Year">
                <input className="input mono" type="number" value={editing.year}
                  onChange={e => setEditing({ ...editing, year: +e.target.value })} />
              </Field>
            )}
            <Field label="เป้าจำนวนโรงพยาบาล" en="Hospitals">
              <input className="input mono" type="number" value={editing.hospitals}
                onChange={e => setEditing({ ...editing, hospitals: +e.target.value })} />
            </Field>
            <Field label="เป้ารายได้ (฿)" en="Revenue (THB)">
              <input className="input mono" type="number" value={editing.revenue}
                onChange={e => setEditing({ ...editing, revenue: +e.target.value })} />
              <div className="tiny muted">= {fmtBaht(editing.revenue)}</div>
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
};

const ProgressRow = ({ label, en, current, target, unit, formatter, color }) => {
  const pct = Math.min(100, (current / target) * 100);
  const display = formatter ? formatter : (n) => n.toLocaleString();
  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
        <span className="tiny" style={{ fontWeight: 600 }}>{label} <span className="muted">({en})</span></span>
        <span className="tiny mono">
          {display(current)} <span className="muted">/ {display(target)}</span>{unit && <span className="muted"> {unit}</span>}
        </span>
      </div>
      <div className="progress thin">
        <span style={{ width: pct + "%", background: color }} />
      </div>
      <div className="tiny muted" style={{ textAlign: "right", marginTop: 2 }}>
        {Math.round(pct)}%{pct >= 100 ? " · ถึงเป้าแล้ว 🎯" : ` · เหลือ ${display(Math.max(0, target - current))}${unit ? ` ${unit}` : ""}`}
      </div>
    </div>
  );
};

Object.assign(window, { TargetsScreen });
