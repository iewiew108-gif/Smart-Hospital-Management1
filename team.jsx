// =========================================================
// Team Members Screen
// =========================================================

const TeamForm = ({ initial, onSave, onCancel, onDirtyChange }) => {
  const [form, setForm] = useState(initial || {
    fname: "", lname: "", nick: "", posFull: "", posShort: "",
    phone: "", email1: "", email2: "", food: "", religion: "พุทธ", license: "ประเภท 2",
    disease: "", bday: "", gender: "ชาย", mentor: "", line: "",
    avatar: "#5B5BD6", photo: null, emoji: null,
    workStatus: "ปฏิบัติงานอยู่", department: "",
  });
  const [isDirty, setIsDirty] = useState(false);
  const markDirty = () => {
    if (!isDirty) {
      setIsDirty(true);
      if (onDirtyChange) onDirtyChange(true);
    }
  };
  const set = (k, v) => { markDirty(); setForm(f => ({ ...f, [k]: v })); };

  const handleCancel = () => {
    if (isDirty && !confirm("มีข้อมูลที่ยังไม่ได้บันทึก\nต้องการออกโดยไม่บันทึกหรือไม่?")) return;
    onCancel();
  };

  const avatarColors = ["#5B5BD6","#E89B6B","#2A8F5E","#C97B1F","#B8546D","#3877B8","#8E7CC3"];
  const emojiOptions = ["🤵", "👨‍💼", "👨‍🔧", "👨‍⚕️", "👩‍💼", "👩‍🔧", "👩‍⚕️", "👨‍💻", "👩‍💻", "🧑‍🏫", "🎓", "🏆", "⚡", "🚀", "💡", "🎯"];
  const fileInputRef = React.useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        set("photo", event.target?.result); // Store as base64
      };
      reader.readAsDataURL(file);
    }
  };

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
            type="button"
            className="btn btn-accent btn-sm"
            onClick={() => { if (form.fname && form.lname) onSave(form); }}
            disabled={!form.fname || !form.lname}
          >
            <Icon name="check" size={12} /> บันทึกเลย
          </button>
        </div>
      )}
      <div className="form-section-title"><span className="num">1</span>ข้อมูลส่วนตัว</div>

      {/* Avatar row — centered */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
        <div className="stack" style={{ alignItems: "center", gap: 8 }}>
          {form.photo ? (
            <img
              src={form.photo}
              alt={form.nick || form.fname}
              style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent)" }}
            />
          ) : form.emoji ? (
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 48, background: "var(--surface-alt)",
              border: "2px solid var(--accent)", animation: "bounce 2s infinite",
            }}>
              {form.emoji}
            </div>
          ) : (
            <Avatar name={form.nick || form.fname} color={form.avatar} size="avatar-lg" />
          )}
          <div className="row" style={{ gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
            {avatarColors.map(c => (
              <button
                key={c}
                onClick={() => set("avatar", c)}
                style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: c, border: form.avatar === c && !form.photo ? "2px solid var(--ink)" : "1px solid var(--border-strong)",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
          <div className="row" style={{ gap: 4, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
            {emojiOptions.map(emoji => (
              <button
                key={emoji}
                onClick={() => set("emoji", emoji)}
                title={emoji}
                style={{
                  fontSize: 24,
                  background: form.emoji === emoji ? "var(--accent-soft)" : "transparent",
                  border: form.emoji === emoji ? "2px solid var(--accent)" : "1px solid var(--border-strong)",
                  borderRadius: 8, padding: "4px 6px", cursor: "pointer", transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.3) rotate(10deg)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                {emoji}
              </button>
            ))}
          </div>
          <button className="btn btn-sm btn-ghost" onClick={() => fileInputRef.current?.click()} title="อัปโหลดภาพ">
            📸 อัปโหลดภาพ
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
          {form.photo && (
            <button className="btn btn-sm btn-ghost" onClick={() => set("photo", null)} title="ลบภาพ">✕ ลบ</button>
          )}
          <div className="tiny muted">รูปภาพ <span className="en">Avatar</span></div>
        </div>
      </div>

      {/* Personal fields row — below avatar */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 18 }}>
        <Field label="ชื่อ" en="First name">
          <input className="input" value={form.fname} onChange={e => set("fname", e.target.value)} />
        </Field>
        <Field label="นามสกุล" en="Last name">
          <input className="input" value={form.lname} onChange={e => set("lname", e.target.value)} />
        </Field>
        <Field label="ชื่อเล่น" en="Nickname">
          <input className="input" value={form.nick} onChange={e => set("nick", e.target.value)} />
        </Field>
        <Field label="เพศ" en="Gender">
          <select title="เพศ" className="select" value={form.gender} onChange={e => set("gender", e.target.value)}>
            <option>ชาย</option><option>หญิง</option><option>อื่นๆ</option>
          </select>
        </Field>
        <Field label="วันเกิด" en="Birthday">
          <ThaiDateInput value={form.bday} onChange={v => set("bday", v)} />
        </Field>
        <Field label="ศาสนา" en="Religion">
          <select title="ศาสนา" className="select" value={form.religion} onChange={e => set("religion", e.target.value)}>
            <option>พุทธ</option><option>คริสต์</option><option>อิสลาม</option><option>อื่นๆ</option>
          </select>
        </Field>
        <Field label="สถานะการทำงาน" en="Work Status">
          <select title="สถานะการทำงาน" className="select" value={form.workStatus || "ปฏิบัติงานอยู่"} onChange={e => set("workStatus", e.target.value)}>
            <option>ปฏิบัติงานอยู่</option>
            <option>ย้ายแผนก</option>
            <option>ลาออก</option>
          </select>
        </Field>
        <Field label="แผนก" en="Department">
          <select title="แผนก" className="select" value={form.department || ""} onChange={e => set("department", e.target.value)}>
            <option value="">— เลือก —</option>
            <option>คลังข้อมูล</option>
            <option>IM</option>
            <option>BGS</option>
          </select>
        </Field>
      </div>

      <div className="form-section-title"><span className="num">2</span>ตำแหน่ง & การติดต่อ</div>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
        <Field label="ตำแหน่ง (เต็ม)" en="Position">
          <input className="input" value={form.posFull} onChange={e => set("posFull", e.target.value)} />
        </Field>
        <Field label="ตำแหน่ง (ย่อ)" en="Short">
          <input className="input" value={form.posShort} onChange={e => set("posShort", e.target.value)} />
        </Field>
        <Field label="เบอร์โทร" en="Phone">
          <input className="input" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="0XX-XXX-XXXX" />
        </Field>
        <Field label="LINE Token / ID">
          <input className="input" value={form.line} onChange={e => set("line", e.target.value)} placeholder="@username" />
        </Field>
        <Field label="Email หลัก" en="Email 1">
          <input className="input" type="email" value={form.email1} onChange={e => set("email1", e.target.value)} />
        </Field>
        <Field label="Email สำรอง" en="Email 2">
          <input className="input" type="email" value={form.email2} onChange={e => set("email2", e.target.value)} />
        </Field>
      </div>

      <div className="form-section-title"><span className="num">3</span>สุขภาพ & ทีม</div>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Field label="อาหารที่แพ้" en="Food allergy">
          <input className="input" value={form.food} onChange={e => set("food", e.target.value)} placeholder="ไม่มี" />
        </Field>
        <Field label="โรคประจำตัว" en="Conditions">
          <input className="input" value={form.disease} onChange={e => set("disease", e.target.value)} placeholder="ไม่มี" />
        </Field>
        <Field label="ใบขับขี่" en="Driving license">
          <select className="select" value={form.license} onChange={e => set("license", e.target.value)}>
            <option>ไม่มี</option><option>ประเภท 1</option><option>ประเภท 2</option><option>ประเภท 3</option>
          </select>
        </Field>
        <Field label="พี่เลี้ยง" en="Mentor">
          <input className="input" value={form.mentor} onChange={e => set("mentor", e.target.value)} placeholder="ชื่อพี่เลี้ยง" />
        </Field>
      </div>

      <div className="row" style={{ marginTop: 22, justifyContent: "flex-end", gap: 10 }}>
        <button type="button" className="btn" onClick={handleCancel}>ยกเลิก</button>
        <button type="button" className="btn btn-accent" onClick={() => onSave(form)} disabled={!form.fname || !form.lname}>
          <Icon name="check" size={14} /> บันทึก
        </button>
      </div>
    </div>
  );
};

const TeamScreen = ({ team, setTeam, hospitals, year }) => {
  const [q, setQ] = useState("");
  const [view, setView] = useState("grid");
  const [editing, setEditing] = useState(null); // null | "new" | member
  const [viewing, setViewing] = useState(null);
  const toast = useToast();
  const formDirtyRef = useRef(false);

  const handleCloseEditing = () => {
    if (formDirtyRef.current && !confirm("มีข้อมูลที่ยังไม่ได้บันทึก\nต้องการออกโดยไม่บันทึกหรือไม่?")) return;
    formDirtyRef.current = false;
    setEditing(null);
  };

  const filtered = team.filter(t => {
    const s = (t.fname + t.lname + t.nick + t.posFull).toLowerCase();
    return s.includes(q.toLowerCase());
  });

  const loadFor = (id) => hospitals.filter(h => h.year === year && h.team.includes(id)).length;
  const isLeadFor = (id) => hospitals.filter(h => h.year === year && h.lead === id).length;

  const save = (form) => {
    formDirtyRef.current = false;
    if (editing === "new") {
      const id = "t" + (team.length === 0 ? 1 : Math.max(...team.map(t => parseInt(t.id.slice(1)))) + 1);
      setTeam([...team, { ...form, id }]);
      toast.push("เพิ่มทีมงานสำเร็จ");
    } else {
      setTeam(team.map(t => t.id === editing.id ? { ...editing, ...form } : t));
      toast.push("บันทึกข้อมูลสำเร็จ");
    }
    setEditing(null);
  };

  const remove = (t) => {
    if (confirm(`ลบ ${t.fname} ${t.lname} ?`)) {
      setTeam(team.filter(x => x.id !== t.id));
      toast.push("ลบทีมงานสำเร็จ");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>ทีมงาน</h1>
          <div className="sub">รายชื่อทีมและความรับผิดชอบในการติดตั้งระบบ — รวม {team.length} คน</div>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <SearchBox value={q} onChange={setQ} placeholder="ค้นหาด้วยชื่อ / ชื่อเล่น / ตำแหน่ง" />
          <Tabs
            items={[{ value: "grid", label: <Icon name="grid" size={12} /> }, { value: "list", label: <Icon name="list" size={12} /> }]}
            value={view} onChange={setView}
          />
          <button className="btn" onClick={() => toast.push("ส่งออกข้อมูลทีมแล้ว (mock)")}>
            <Icon name="download" size={14} /> Export
          </button>
          <button className="btn btn-accent" onClick={() => setEditing("new")}>
            <Icon name="plus" size={14} /> เพิ่มทีมงาน
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {filtered.map(t => (
            <div key={t.id} className="card card-pad" style={{ position: "relative" }}>
              <button
                className="btn btn-ghost btn-icon"
                style={{ position: "absolute", top: 10, right: 10 }}
                onClick={() => remove(t)}
                title="ลบ"
              >
                <Icon name="trash" size={14} />
              </button>
              <div className="row" style={{ alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
                {t.photo ? (
                  <img 
                    src={t.photo} 
                    alt={t.nick}
                    style={{
                      width: 80, height: 80, borderRadius: "50%",
                      objectFit: "cover", border: "2px solid var(--accent)"
                    }}
                  />
                ) : t.emoji ? (
                  <div
                    style={{
                      width: 80, height: 80, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 40, background: "var(--surface-alt)",
                      border: "2px solid var(--accent)",
                      animation: "bounce 2s infinite",
                      flexShrink: 0,
                    }}
                  >
                    {t.emoji}
                  </div>
                ) : (
                  <Avatar name={t.nick} color={t.avatar} size="avatar-lg" />
                )}
                <div style={{ flex: 1 }}>
                  <div className="display bold" style={{ fontSize: 16, lineHeight: 1.2 }}>{t.nick}</div>
                  <div className="tiny muted">{t.fname} {t.lname}</div>
                  <div style={{ marginTop: 8 }}>
                    <Chip kind="accent">{t.posShort}</Chip>
                  </div>
                </div>
              </div>
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
                <div className="row" style={{ gap: 6 }}>
                  <Icon name="phone" size={12} className="muted" />
                  <span>{t.phone}</span>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <Icon name="cake" size={12} className="muted" />
                  <span>{t.bday ? new Date(t.bday).toLocaleDateString("th-TH", { day: "numeric", month: "short" }) : "—"}</span>
                </div>
                <div className="row" style={{ gap: 6, gridColumn: "span 2" }}>
                  <Icon name="mail" size={12} className="muted" />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.email1}</span>
                </div>
              </div>
              <hr className="div" />
              <div className="row" style={{ justifyContent: "space-between", fontSize: 12 }}>
                <div>
                  <div className="display bold mono" style={{ fontSize: 18 }}>{loadFor(t.id)}</div>
                  <div className="tiny muted">โครงการปี {year}</div>
                </div>
                <div>
                  <div className="display bold mono" style={{ fontSize: 18 }}>{isLeadFor(t.id)}</div>
                  <div className="tiny muted">เป็นหัวหน้าทีม</div>
                </div>
                <button className="btn btn-sm" onClick={() => setViewing(t)}>
                  ดูข้อมูล <Icon name="chevronRight" size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <table className="tbl">
            <thead>
              <tr>
                <th>ชื่อ</th><th>ตำแหน่ง</th><th>เบอร์</th><th>Email</th><th>พี่เลี้ยง</th>
                <th>โครงการปี {year}</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td>
                    <div className="row" style={{ gap: 10 }}>
                      {t.photo ? (
                        <img 
                          src={t.photo} 
                          alt={t.nick}
                          style={{
                            width: 40, height: 40, borderRadius: "50%",
                            objectFit: "cover", border: "1px solid var(--accent)"
                          }}
                        />
                      ) : t.emoji ? (
                        <div
                          style={{
                            width: 40, height: 40, borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 20, background: "var(--surface-alt)",
                            border: "1px solid var(--accent)",
                            animation: "bounce 2s infinite",
                          }}
                        >
                          {t.emoji}
                        </div>
                      ) : (
                        <Avatar name={t.nick} color={t.avatar} />
                      )}
                      <div>
                        <div style={{ fontWeight: 600 }}>{t.fname} {t.lname}</div>
                        <div className="tiny muted">{t.nick}</div>
                      </div>
                    </div>
                  </td>
                  <td>{t.posShort}</td>
                  <td className="mono">{t.phone}</td>
                  <td className="tiny">{t.email1}</td>
                  <td>{t.mentor}</td>
                  <td className="num">{loadFor(t.id)}</td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => setViewing(t)}>ดู</button>
                      <button className="btn btn-sm btn-ghost" onClick={() => setEditing(t)}>
                        <Icon name="edit" size={12} />
                      </button>
                      <button className="btn btn-sm btn-ghost" onClick={() => remove(t)}>
                        <Icon name="trash" size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={editing != null}
        onClose={handleCloseEditing}
        title={editing === "new" ? "เพิ่มทีมงานใหม่" : "แก้ไขข้อมูลทีมงาน"}
        sub={editing === "new" ? "กรอกข้อมูลทั้งหมดเพื่อเพิ่มสมาชิกใหม่" : `${editing?.fname || ""} ${editing?.lname || ""}`}
        size="xl"
      >
        {editing && (
          <TeamForm
            initial={editing === "new" ? null : editing}
            onSave={save}
            onCancel={handleCloseEditing}
            onDirtyChange={(dirty) => { formDirtyRef.current = dirty; }}
          />
        )}
      </Modal>

      <Modal
        open={viewing != null}
        onClose={() => setViewing(null)}
        title="ข้อมูลทีมงาน"
        sub={viewing ? `${viewing.fname} ${viewing.lname} (${viewing.nick})` : ""}
        size="lg"
        footer={
          <>
            <button className="btn" onClick={() => setViewing(null)}>ปิด</button>
            <button className="btn btn-primary" onClick={() => { setEditing(viewing); setViewing(null); }}>
              <Icon name="edit" size={12} /> แก้ไข
            </button>
          </>
        }
      >
        {viewing && (
          <div>
            <div className="row" style={{ gap: 16, marginBottom: 18 }}>
              <Avatar name={viewing.nick} color={viewing.avatar} size="avatar-lg" />
              <div style={{ flex: 1 }}>
                <div className="display bold" style={{ fontSize: 20 }}>{viewing.fname} {viewing.lname}</div>
                <div className="muted">{viewing.posFull}</div>
                <div className="row" style={{ gap: 6, marginTop: 6 }}>
                  <Chip kind="accent">{viewing.posShort}</Chip>
                  <Chip kind="outline">{viewing.gender}</Chip>
                </div>
              </div>
              <div className="stack" style={{ textAlign: "right" }}>
                <div>
                  <div className="tiny muted">โครงการปี {year}</div>
                  <div className="display bold mono" style={{ fontSize: 24 }}>{loadFor(viewing.id)}</div>
                </div>
              </div>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <InfoRow icon="phone"  label="เบอร์โทร"     value={viewing.phone} />
              <InfoRow icon="id"     label="LINE Token"   value={viewing.line || "—"} />
              <InfoRow icon="mail"   label="Email 1"      value={viewing.email1} />
              <InfoRow icon="mail"   label="Email 2"      value={viewing.email2 || "—"} />
              <InfoRow icon="cake"   label="วันเกิด"       value={viewing.bday ? fmtDate(viewing.bday) : "—"} />
              <InfoRow icon="star"   label="ศาสนา"        value={viewing.religion} />
              <InfoRow icon="info"   label="อาหารที่แพ้"   value={viewing.food || "ไม่มี"} />
              <InfoRow icon="info"   label="โรคประจำตัว"   value={viewing.disease || "ไม่มี"} />
              <InfoRow icon="info"   label="ใบขับขี่"      value={viewing.license} />
              <InfoRow icon="users"  label="พี่เลี้ยง"      value={viewing.mentor || "—"} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="row" style={{ gap: 10, padding: "10px 12px", background: "var(--surface-alt)", borderRadius: 10 }}>
    <div style={{ color: "var(--muted)" }}><Icon name={icon} size={14} /></div>
    <div style={{ flex: 1 }}>
      <div className="tiny muted">{label}</div>
      <div style={{ fontWeight: 600, fontSize: 13 }}>{value}</div>
    </div>
  </div>
);

Object.assign(window, { TeamScreen });
