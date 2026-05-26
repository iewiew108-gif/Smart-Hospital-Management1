// =========================================================
// Gateway Monitor + Connection Editor
// =========================================================

const gwStatusChip = (s) => {
  if (s === "ติดตั้งเรียบร้อย") return "success";
  if (s === "กำลังดำเนินการ" || s === "กำลังทดสอบ") return "warning";
  if (s === "รอประสานขอ Gen Key") return "accent";
  if (s === "รอดำเนินการ") return "info";
  return "outline";
};

// ----- Tiny credential pill with show/copy
const SecretField = ({ value, mono = true, mask = false }) => {
  const [show, setShow] = useState(!mask);
  const toast = useToast();
  if (!value) return <span className="tiny muted">—</span>;
  const display = show ? value : "•".repeat(Math.min(10, value.length));
  return (
    <div className="row" style={{ gap: 4, fontSize: 12 }}>
      <span className={mono ? "mono" : ""} style={{ fontWeight: 500 }}>{display}</span>
      {mask && (
        <button className="btn btn-sm btn-ghost btn-icon" onClick={() => setShow(s => !s)} style={{ width: 22, height: 22 }}>
          <Icon name={show ? "close" : "search"} size={10} />
        </button>
      )}
      <button className="btn btn-sm btn-ghost btn-icon" onClick={() => {
        navigator.clipboard?.writeText(value);
        toast.push("คัดลอกแล้ว");
      }} style={{ width: 22, height: 22 }}>
        <Icon name="download" size={10} />
      </button>
    </div>
  );
};

// ----- Section card wrapper
const ConnSection = ({ num, title, sub, icon, color = "var(--accent)", action, children }) => (
  <div className="card" style={{ marginBottom: 14 }}>
    <div style={{
      padding: "12px 16px",
      borderBottom: "1px solid var(--border-2)",
      background: "var(--surface-alt)",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: color, color: "#fff",
        display: "grid", placeItems: "center", flexShrink: 0,
        fontWeight: 700, fontSize: 12,
      }}>{num}</div>
      <div style={{ flex: 1 }}>
        <div className="display bold" style={{ fontSize: 13.5, lineHeight: 1.2 }}>{title}</div>
        {sub && <div className="tiny muted">{sub}</div>}
      </div>
      {action}
    </div>
    <div style={{ padding: 14 }}>{children}</div>
  </div>
);

// ----- Conn Field (label + input)
const ConnField = ({ label, value, onChange, mono = true, type = "text", placeholder = "" }) => (
  <div className="field">
    <label className="label">{label}</label>
    <input
      className={"input " + (mono ? "mono" : "")}
      type={type}
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

// ====== Connection Editor (drawer content) ======
const ConnectionEditor = ({ hospital, team, onChange, onClose }) => {
  if (!hospital) {
    return (
      <div className="drawer-head">
        <button className="btn btn-ghost btn-icon" onClick={onClose}><Icon name="close" size={14} /></button>
        <div>ไม่พบข้อมูลการตั้งค่า</div>
      </div>
    );
  }

  const ensureDefaults = (conn) => {
    const d = {
      serverMaster:   { ip: "", db: "", user: "", pass: "", dbType: "MySQL", loginUser: "", loginPass: "" },
      serverImage:    { ip: "", db: "", user: "", pass: "", dbType: "MySQL" },
      serverTraining: { ip: "", db: "", user: "", pass: "", dbType: "MySQL", loginUser: "", loginPass: "" },
      cloudHosxp:     { user: "", pass: "" },
      remote:         { ip: "", id: "", pass: "" },
      ubuntu:         { ip: "", user: "", pass: "", rootPass: "" },
      mobileGateway:  { ip: "", user: "", pass: "", dbType: "MySQL", remote: { ip: "", id: "", pass: "" }, installerId: "", installDate: "", status: "" },
      ubuntuServer:   { ip: "", installerId: "", installDate: "", status: "" },
      importPdf:      { ip: "", db: "", user: "", pass: "", dbType: "MySQL", remote: { ip: "", id: "", pass: "" } },
      lineGateway:    { ip: "", db: "", user: "", pass: "", dbType: "MySQL", remote: { ip: "", id: "", pass: "" }, botTokenTg: "", chatBotLink: "", lineToken: "", installerId: "", installDate: "", status: "" },
      bmsWizard:      { ip: "", remote: { ip: "", id: "", pass: "" }, genKey: "", installerId: "", installDate: "", status: "" },
      wifi:           { ssid: "", pass: "" },
      links:          { nurseWeb: "", drugWeb: "" },
      appTablet:      { host: "", db: "", mobileGw: "" },
    };
    const src = conn || {};
    const merged = {};
    for (const key in d) {
      if (typeof d[key] === "object" && src[key] && typeof src[key] === "object") {
        merged[key] = { ...d[key], ...src[key] };
        // merge 1-level deep nested objects (e.g. remote inside mobileGateway)
        for (const sub in d[key]) {
          if (typeof d[key][sub] === "object" && merged[key][sub] && typeof merged[key][sub] === "object") {
            merged[key][sub] = { ...d[key][sub], ...merged[key][sub] };
          }
        }
      } else {
        merged[key] = typeof d[key] === "object" ? { ...d[key] } : (src[key] ?? d[key]);
      }
    }
    return merged;
  };
  
  const c = ensureDefaults(hospital.connection);
  const set = (path, val) => {
    // path: ['serverMaster', 'ip']
    const updated = { ...c };
    let ref = updated;
    for (let i = 0; i < path.length - 1; i++) {
      ref[path[i]] = { ...ref[path[i]] };
      ref = ref[path[i]];
    }
    ref[path[path.length - 1]] = val;
    onChange(updated);
  };
  const toast = useToast();
  const copyFromMaster = (target) => {
    const m = c.serverMaster;
    set([target], { ...c[target], ip: m.ip, db: m.db, user: m.user, pass: m.pass, dbType: m.dbType });
    toast.push("คัดลอกข้อมูลจาก Server Master แล้ว");
  };
  const copyMgwIp = () => {
    set(["appTablet", "mobileGw"], c.mobileGateway.ip);
    toast.push("คัดลอก IP Mobile Gateway แล้ว");
  };

  return (
    <>
      <div className="drawer-head">
        <button className="btn btn-ghost btn-icon" onClick={onClose}><Icon name="close" size={14} /></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="tiny muted">Connection Settings</div>
          <div className="display bold" style={{ fontSize: 16, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis" }}>{hospital.name}</div>
        </div>
        <Chip kind="outline" className="mono">{hospital.code}</Chip>
      </div>
      <div className="drawer-body">
        {/* 1. Server Master */}
        <ConnSection num="1" title="Connection Server Master" sub="HOSxP XE — Server หลัก" color="var(--accent)">
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
            <ConnField label="IP" value={c.serverMaster.ip} onChange={v => set(["serverMaster", "ip"], v)} placeholder="10.x.x.x" />
            <ConnField label="DB" value={c.serverMaster.db} onChange={v => set(["serverMaster", "db"], v)} />
            <ConnField label="USER" value={c.serverMaster.user} onChange={v => set(["serverMaster", "user"], v)} />
            <ConnField label="PASS" value={c.serverMaster.pass} onChange={v => set(["serverMaster", "pass"], v)} />
            <div className="field">
              <label className="label">Type Database</label>
              <select className="select" value={c.serverMaster.dbType} onChange={e => set(["serverMaster", "dbType"], e.target.value)}>
                {DB_FLAVORS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <hr className="div" />
          <div className="tiny" style={{ fontWeight: 700, marginBottom: 8, color: "var(--muted)" }}>
            Login เข้าใช้งานโปรแกรม HOSxP XE Server Master
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <ConnField label="User" value={c.serverMaster.loginUser} onChange={v => set(["serverMaster", "loginUser"], v)} />
            <ConnField label="Pass" value={c.serverMaster.loginPass} onChange={v => set(["serverMaster", "loginPass"], v)} />
          </div>
        </ConnSection>

        {/* 2. Server Image */}
        <ConnSection num="2" title="Connection Server Image" color="var(--c2)"
          action={<button className="btn btn-sm" onClick={() => copyFromMaster("serverImage")}>
            <Icon name="download" size={11} /> คัดลอกจาก Master
          </button>}
        >
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
            <ConnField label="IP" value={c.serverImage.ip} onChange={v => set(["serverImage", "ip"], v)} />
            <ConnField label="DB" value={c.serverImage.db} onChange={v => set(["serverImage", "db"], v)} />
            <ConnField label="USER" value={c.serverImage.user} onChange={v => set(["serverImage", "user"], v)} />
            <ConnField label="PASS" value={c.serverImage.pass} onChange={v => set(["serverImage", "pass"], v)} />
            <div className="field">
              <label className="label">Type Database</label>
              <select className="select" value={c.serverImage.dbType} onChange={e => set(["serverImage", "dbType"], e.target.value)}>
                {DB_FLAVORS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </ConnSection>

        {/* 3. Server Training */}
        <ConnSection num="3" title="Connection Training" color="var(--c3)"
          action={<button className="btn btn-sm" onClick={() => copyFromMaster("serverTraining")}>
            <Icon name="download" size={11} /> คัดลอกจาก Master
          </button>}
        >
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
            <ConnField label="IP" value={c.serverTraining.ip} onChange={v => set(["serverTraining", "ip"], v)} />
            <ConnField label="DB" value={c.serverTraining.db} onChange={v => set(["serverTraining", "db"], v)} />
            <ConnField label="USER" value={c.serverTraining.user} onChange={v => set(["serverTraining", "user"], v)} />
            <ConnField label="PASS" value={c.serverTraining.pass} onChange={v => set(["serverTraining", "pass"], v)} />
            <div className="field">
              <label className="label">Type Database</label>
              <select className="select" value={c.serverTraining.dbType} onChange={e => set(["serverTraining", "dbType"], e.target.value)}>
                {DB_FLAVORS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <hr className="div" />
          <div className="tiny" style={{ fontWeight: 700, marginBottom: 8, color: "var(--muted)" }}>
            Login เข้าใช้งานโปรแกรม HOSxP XE Training
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <ConnField label="User" value={c.serverTraining.loginUser} onChange={v => set(["serverTraining", "loginUser"], v)} />
            <ConnField label="Pass" value={c.serverTraining.loginPass} onChange={v => set(["serverTraining", "loginPass"], v)} />
          </div>
        </ConnSection>

        {/* 4. cloud1.hosxp.net */}
        <ConnSection num="4" title="www.cloud1.hosxp.net" color="var(--c6)">
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <ConnField label="USER" value={c.cloudHosxp.user} onChange={v => set(["cloudHosxp", "user"], v)} />
            <ConnField label="PASS" value={c.cloudHosxp.pass} onChange={v => set(["cloudHosxp", "pass"], v)} />
          </div>
        </ConnSection>

        {/* 5. Remote */}
        <ConnSection num="5" title="เครื่องสำหรับ Remote" color="var(--c5)"
          sub="หมายเหตุ: ประสานผู้ดูแลระบบทุกครั้ง กรณีแก้ไขปัญหา">
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <ConnField label="IP" value={c.remote.ip} onChange={v => set(["remote", "ip"], v)} />
            <ConnField label="ID" value={c.remote.id} onChange={v => set(["remote", "id"], v)} />
            <ConnField label="PASS" value={c.remote.pass} onChange={v => set(["remote", "pass"], v)} />
          </div>
        </ConnSection>

        {/* 6. Ubuntu */}
        <ConnSection num="6" title="เครื่องที่ติดตั้ง Ubuntu" color="#E95420">
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
            <ConnField label="IP" value={c.ubuntu.ip} onChange={v => set(["ubuntu", "ip"], v)} />
            <ConnField label="USER" value={c.ubuntu.user} onChange={v => set(["ubuntu", "user"], v)} />
            <ConnField label="PASS" value={c.ubuntu.pass} onChange={v => set(["ubuntu", "pass"], v)} />
            <ConnField label="root pass" value={c.ubuntu.rootPass} onChange={v => set(["ubuntu", "rootPass"], v)} />
          </div>
        </ConnSection>

        {/* 7. Mobile Gateway */}
        <ConnSection num="7" title="เครื่องสำหรับติดตั้ง Mobile Gateway" color="var(--c1)">
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
            <ConnField label="IP" value={c.mobileGateway.ip} onChange={v => set(["mobileGateway", "ip"], v)} />
            <ConnField label="USER" value={c.mobileGateway.user} onChange={v => set(["mobileGateway", "user"], v)} />
            <ConnField label="PASS" value={c.mobileGateway.pass} onChange={v => set(["mobileGateway", "pass"], v)} />
            <div className="field">
              <label className="label">Type Database</label>
              <select className="select" value={c.mobileGateway.dbType} onChange={e => set(["mobileGateway", "dbType"], e.target.value)}>
                {DB_FLAVORS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <hr className="div" />
          <div className="tiny" style={{ fontWeight: 700, marginBottom: 8, color: "var(--muted)" }}>เครื่องสำหรับ Remote · ประสานผู้ดูแลระบบทุกครั้ง</div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <ConnField label="IP" value={c.mobileGateway.remote.ip} onChange={v => set(["mobileGateway", "remote", "ip"], v)} />
            <ConnField label="ID" value={c.mobileGateway.remote.id} onChange={v => set(["mobileGateway", "remote", "id"], v)} />
            <ConnField label="PASS" value={c.mobileGateway.remote.pass} onChange={v => set(["mobileGateway", "remote", "pass"], v)} />
          </div>
          <hr className="div" />
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="field">
              <label className="label">ผู้ติดตั้ง</label>
              <select className="select" value={c.mobileGateway.installerId} onChange={e => set(["mobileGateway", "installerId"], e.target.value)}>
                <option value="">— เลือก —</option>
                {team.map(t => <option key={t.id} value={t.id}>{t.nick} ({t.fname})</option>)}
              </select>
            </div>
            <ConnField label="วันที่ติดตั้ง" type="date" value={c.mobileGateway.installDate} onChange={v => set(["mobileGateway", "installDate"], v)} />
            <div className="field">
              <label className="label">สถานะการติดตั้ง</label>
              <select className="select" value={c.mobileGateway.status} onChange={e => set(["mobileGateway", "status"], e.target.value)}>
                {GATEWAY_STATUS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </ConnSection>

        {/* 9. Ubuntu Server */}
        <ConnSection num="9" title="เครื่องสำหรับติดตั้ง Ubuntu Server" color="var(--c5)">
          <div className="grid" style={{ gridTemplateColumns: "1fr", gap: 10 }}>
            <ConnField label="IP Address" value={c.ubuntuServer.ip} onChange={v => set(["ubuntuServer", "ip"], v)} placeholder="192.168.x.x" />
          </div>
          <hr className="div" />
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="field">
              <label className="label">ผู้ติดตั้ง</label>
              <select className="select" value={c.ubuntuServer.installerId} onChange={e => set(["ubuntuServer", "installerId"], e.target.value)}>
                <option value="">— เลือก —</option>
                {team.map(t => <option key={t.id} value={t.id}>{t.nick} ({t.fname})</option>)}
              </select>
            </div>
            <ConnField label="วันที่ติดตั้ง" type="date" value={c.ubuntuServer.installDate} onChange={v => set(["ubuntuServer", "installDate"], v)} />
            <div className="field">
              <label className="label">สถานะการติดตั้ง</label>
              <select className="select" value={c.ubuntuServer.status} onChange={e => set(["ubuntuServer", "status"], e.target.value)}>
                {GATEWAY_STATUS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </ConnSection>

        {/* 9. Import PDF */}
        <ConnSection num="9" title="เครื่องสำหรับติดตั้ง BMS Import PDF Gateway" color="var(--c4)">
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
            <ConnField label="IP" value={c.importPdf.ip} onChange={v => set(["importPdf", "ip"], v)} />
            <ConnField label="DB" value={c.importPdf.db} onChange={v => set(["importPdf", "db"], v)} />
            <ConnField label="USER" value={c.importPdf.user} onChange={v => set(["importPdf", "user"], v)} />
            <ConnField label="PASS" value={c.importPdf.pass} onChange={v => set(["importPdf", "pass"], v)} />
            <div className="field">
              <label className="label">Type Database</label>
              <select className="select" value={c.importPdf.dbType} onChange={e => set(["importPdf", "dbType"], e.target.value)}>
                {DB_FLAVORS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <hr className="div" />
          <div className="tiny" style={{ fontWeight: 700, marginBottom: 8, color: "var(--muted)" }}>
            เครื่องสำหรับ Remote · ประสานผู้ดูแลระบบทุกครั้ง
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <ConnField label="IP" value={c.importPdf.remote.ip} onChange={v => set(["importPdf", "remote", "ip"], v)} />
            <ConnField label="ID" value={c.importPdf.remote.id} onChange={v => set(["importPdf", "remote", "id"], v)} />
            <ConnField label="PASS" value={c.importPdf.remote.pass} onChange={v => set(["importPdf", "remote", "pass"], v)} />
          </div>
        </ConnSection>

        {/* 10. LINE Official Gateway */}
        <ConnSection num="10" title="เครื่องสำหรับติดตั้ง HOSxP Line Official Gateway" color="#06C755">
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
            <ConnField label="IP" value={c.lineGateway.ip} onChange={v => set(["lineGateway", "ip"], v)} />
            <ConnField label="DB" value={c.lineGateway.db} onChange={v => set(["lineGateway", "db"], v)} />
            <ConnField label="USER" value={c.lineGateway.user} onChange={v => set(["lineGateway", "user"], v)} />
            <ConnField label="PASS" value={c.lineGateway.pass} onChange={v => set(["lineGateway", "pass"], v)} />
            <div className="field">
              <label className="label">Type Database</label>
              <select className="select" value={c.lineGateway.dbType} onChange={e => set(["lineGateway", "dbType"], e.target.value)}>
                {DB_FLAVORS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <hr className="div" />
          <div className="tiny" style={{ fontWeight: 700, marginBottom: 8, color: "var(--muted)" }}>เครื่องสำหรับ Remote</div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <ConnField label="IP" value={c.lineGateway.remote.ip} onChange={v => set(["lineGateway", "remote", "ip"], v)} />
            <ConnField label="ID" value={c.lineGateway.remote.id} onChange={v => set(["lineGateway", "remote", "id"], v)} />
            <ConnField label="PASS" value={c.lineGateway.remote.pass} onChange={v => set(["lineGateway", "remote", "pass"], v)} />
          </div>
          <hr className="div" />
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <ConnField label="Bot Token Telegram" value={c.lineGateway.botTokenTg} onChange={v => set(["lineGateway", "botTokenTg"], v)} />
            <ConnField label="Link Chat Bot Telegram" value={c.lineGateway.chatBotLink} onChange={v => set(["lineGateway", "chatBotLink"], v)} placeholder="https://t.me/..." />
            <ConnField label="Line Token" value={c.lineGateway.lineToken} onChange={v => set(["lineGateway", "lineToken"], v)} />
            <div className="field">
              <label className="label">ผู้ติดตั้ง</label>
              <select className="select" value={c.lineGateway.installerId} onChange={e => set(["lineGateway", "installerId"], e.target.value)}>
                <option value="">— เลือก —</option>
                {team.map(t => <option key={t.id} value={t.id}>{t.nick} ({t.fname})</option>)}
              </select>
            </div>
            <ConnField label="วันที่ติดตั้ง" type="date" value={c.lineGateway.installDate} onChange={v => set(["lineGateway", "installDate"], v)} mono={true} />
            <div className="field">
              <label className="label">สถานะการติดตั้ง</label>
              <select className="select" value={c.lineGateway.status} onChange={e => set(["lineGateway", "status"], e.target.value)}>
                {GATEWAY_STATUS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </ConnSection>

        {/* 11. BMS Wigrade */}
        <ConnSection num="11" title="เครื่องสำหรับติดตั้ง BMS HOSxP Plus and Wigrade" color="var(--c7)">
          <div className="grid" style={{ gridTemplateColumns: "1fr", gap: 10 }}>
            <ConnField label="IP" value={c.bmsWizard.ip} onChange={v => set(["bmsWizard", "ip"], v)} />
          </div>
          <hr className="div" />
          <div className="tiny" style={{ fontWeight: 700, marginBottom: 8, color: "var(--muted)" }}>เครื่องสำหรับ Remote · ประสานผู้ดูแลระบบทุกครั้ง</div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <ConnField label="IP" value={c.bmsWizard.remote.ip} onChange={v => set(["bmsWizard", "remote", "ip"], v)} />
            <ConnField label="ID" value={c.bmsWizard.remote.id} onChange={v => set(["bmsWizard", "remote", "id"], v)} />
            <ConnField label="PASS" value={c.bmsWizard.remote.pass} onChange={v => set(["bmsWizard", "remote", "pass"], v)} />
          </div>
          <hr className="div" />
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <ConnField label="Gen Key" value={c.bmsWizard.genKey} onChange={v => set(["bmsWizard", "genKey"], v)} />
            <div className="field">
              <label className="label">ผู้ติดตั้ง</label>
              <select className="select" value={c.bmsWizard.installerId} onChange={e => set(["bmsWizard", "installerId"], e.target.value)}>
                <option value="">— เลือก —</option>
                {team.map(t => <option key={t.id} value={t.id}>{t.nick} ({t.fname})</option>)}
              </select>
            </div>
            <ConnField label="วันที่ติดตั้ง" type="date" value={c.bmsWizard.installDate} onChange={v => set(["bmsWizard", "installDate"], v)} />
            <div className="field">
              <label className="label">สถานะการติดตั้ง</label>
              <select className="select" value={c.bmsWizard.status} onChange={e => set(["bmsWizard", "status"], e.target.value)}>
                {BMS_STATUS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </ConnSection>

        {/* 12. WiFi */}
        <ConnSection num="12" title="WiFi & Password" color="var(--c6)">
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <ConnField label="SSID / WiFi" value={c.wifi.ssid} onChange={v => set(["wifi", "ssid"], v)} mono={false} />
            <ConnField label="Pass" value={c.wifi.pass} onChange={v => set(["wifi", "pass"], v)} />
          </div>
        </ConnSection>

        {/* 13. Links */}
        <ConnSection num="13" title="Link ต่าง ๆ" color="var(--accent)">
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <ConnField label="Link Nurse Web" value={c.links.nurseWeb} onChange={v => set(["links", "nurseWeb"], v)} placeholder="http://..." />
            <ConnField label="Link Drug Web" value={c.links.drugWeb} onChange={v => set(["links", "drugWeb"], v)} placeholder="http://..." />
          </div>
        </ConnSection>

        {/* 14. App Tablet */}
        <ConnSection num="14" title="รายละเอียด App Tablet" color="var(--c5)"
          action={<button className="btn btn-sm" onClick={copyMgwIp}>
            <Icon name="download" size={11} /> คัดลอก IP Mobile GW
          </button>}
        >
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <ConnField label="Host" value={c.appTablet.host} onChange={v => set(["appTablet", "host"], v)} />
            <ConnField label="Database" value={c.appTablet.db} onChange={v => set(["appTablet", "db"], v)} />
            <ConnField label="Mobile GW" value={c.appTablet.mobileGw} onChange={v => set(["appTablet", "mobileGw"], v)} />
          </div>
        </ConnSection>
      </div>
      <div className="drawer-foot">
        <button className="btn" onClick={onClose}>ปิด</button>
        <button className="btn btn-accent" onClick={() => { onClose(); toast.push("บันทึก Connection แล้ว"); }}>
          <Icon name="check" size={12} /> บันทึก
        </button>
      </div>
    </>
  );
};

// ====== Gateway Monitor screen ======
const GatewayMonitor = ({ hospitals, setHospitals, team, year }) => {
  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterGw, setFilterGw] = useState(""); // line | bms | mgw | pdf
  const [editingId, setEditingId] = useState(null);
  const toast = useToast();

  const yearHosps = hospitals.filter(h => h.year === year);

  // Status helpers
  const hasInstalled = (s) => s === "ติดตั้งเรียบร้อย";
  const isPending = (s) => s !== "ติดตั้งเรียบร้อย";

  // KPIs
  const lineDone = yearHosps.filter(h => hasInstalled(h.connection?.lineGateway?.status)).length;
  const bmsDone  = yearHosps.filter(h => hasInstalled(h.connection?.bmsWizard?.status)).length;
  const linePending = yearHosps.filter(h => isPending(h.connection?.lineGateway?.status)).length;
  const bmsPending  = yearHosps.filter(h => isPending(h.connection?.bmsWizard?.status)).length;

  const filtered = yearHosps.filter(h => {
    const s = (h.name + h.code + h.province).toLowerCase();
    if (!s.includes(q.toLowerCase())) return false;
    if (filterStatus) {
      const lst = [h.connection?.lineGateway?.status, h.connection?.bmsWizard?.status];
      if (!lst.includes(filterStatus)) return false;
    }
    if (filterGw === "line" && !hasInstalled(h.connection?.lineGateway?.status)) return false;
    if (filterGw === "bms" && !hasInstalled(h.connection?.bmsWizard?.status)) return false;
    if (filterGw === "mgw" && !h.connection?.mobileGateway?.ip) return false;
    if (filterGw === "pdf" && !h.connection?.importPdf?.ip) return false;
    return true;
  });

  const editing = hospitals.find(h => h.id === editingId);

  const updateConn = (newConn) => {
    setHospitals(hospitals.map(h => h.id === editingId ? { ...h, connection: newConn } : h));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Gateway Monitor</h1>
          <div className="sub">ติดตามการติดตั้ง LINE Gateway, BMS Wigrade, Mobile Gateway, Import PDF — ปี {year}</div>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <SearchBox value={q} onChange={setQ} placeholder="ค้นหา รพ. / รหัส" />
          <button className="btn" onClick={() => toast.push("ส่งออกแล้ว (mock)")}>
            <Icon name="download" size={14} /> Export
          </button>
          <button className="btn btn-accent" onClick={() => {
            const newHosp = hospitals.find(h => h.year === year);
            if (newHosp) {
              setEditingId(newHosp.id);
            } else {
              toast.push("ไม่มีโครงการในปีนี้");
            }
          }}>
            <Icon name="plus" size={14} /> เพิ่มการตั้งค่า
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 18 }}>
        {yearHosps.length === 0 && (
          <div className="empty" style={{ gridColumn: "1 / -1" }}>
            <div className="ico"><Icon name="inbox" size={20} /></div>
            ไม่มีโครงการในปี {year}
          </div>
        )}
        {yearHosps.length > 0 && (
          <>
            <KPI
              label="LINE Gateway ติดตั้งแล้ว"
              value={lineDone}
              unit={"/ " + yearHosps.length}
              target={yearHosps.length}
              current={lineDone}
              delta={`${linePending} โครงการรอติดตั้ง`}
              icon="phone"
            />
            <KPI
              label="BMS Wigrade ติดตั้งแล้ว"
              value={bmsDone}
              unit={"/ " + yearHosps.length}
              target={yearHosps.length}
              current={bmsDone}
              delta={`${bmsPending} โครงการรอ Gen Key`}
              icon="award"
            />
            <KPI
              label="Mobile Gateway ใช้งาน"
              value={yearHosps.filter(h => h.connection?.mobileGateway?.ip).length}
              unit="ไซต์"
              icon="layers"
            />
            <KPI
              label="Import PDF Gateway"
              value={yearHosps.filter(h => h.connection?.importPdf?.ip).length}
              unit="ไซต์"
              icon="box"
            />
          </>
        )}
      </div>

      {/* Filter */}
      <div className="card card-pad" style={{ marginBottom: 14, padding: 12 }}>
        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <Icon name="filter" size={13} className="muted" />
          <span className="tiny bold" style={{ color: "var(--muted)" }}>FILTER</span>
          <select className="select" style={{ width: "auto" }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">สถานะทุกรายการ</option>
            {GATEWAY_STATUS.map(s => <option key={s}>{s}</option>)}
            <option>รอประสานขอ Gen Key</option>
          </select>
          <Tabs
            items={[
              { value: "", label: "ทุก Gateway" },
              { value: "line", label: "LINE ✓" },
              { value: "bms", label: "BMS ✓" },
              { value: "mgw", label: "Mobile GW" },
              { value: "pdf", label: "Import PDF" },
            ]}
            value={filterGw}
            onChange={setFilterGw}
          />
          <div className="row-end tiny muted">{filtered.length} / {yearHosps.length} โครงการ</div>
        </div>
      </div>

      {/* Table */}
      {yearHosps.length > 0 ? (
        <div className="card" style={{ overflow: "auto" }}>
          <table className="tbl">
          <thead>
            <tr>
              <th>โรงพยาบาล</th>
              <th>Server Master</th>
              <th>LINE Gateway</th>
              <th>BMS Wigrade</th>
              <th>Mobile GW</th>
              <th>Ubuntu Server</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(h => {
              const c = h.connection || {};
              const lead = team.find(t => t.id === h.lead);
              const lineInstaller = team.find(t => t.id === c.lineGateway?.installerId);
              const bmsInstaller = team.find(t => t.id === c.bmsWizard?.installerId);
              return (
                <tr key={h.id} onClick={() => setEditingId(h.id)} style={{ cursor: "pointer" }}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{h.name}</div>
                    <div className="tiny muted">{h.code} · {h.province}</div>
                    {lead && (
                      <div className="tiny" style={{ marginTop: 4 }}>
                        <span className="muted">หัวหน้า:</span> <span style={{ fontWeight: 600 }}>{lead.nick}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    {c.serverMaster?.ip ? (
                      <>
                        <div className="mono tiny" style={{ fontWeight: 600 }}>{c.serverMaster.ip}</div>
                        <div className="mono tiny muted">{c.serverMaster.dbType}</div>
                      </>
                    ) : <span className="tiny muted">—</span>}
                  </td>
                  <td>
                    <div>
                      <div className="tiny bold">{c.lineGateway?.ip || "—"}</div>
                      <Chip kind={gwStatusChip(c.lineGateway?.status)} style={{ marginTop: 3 }}>{c.lineGateway?.status || "—"}</Chip>
                      {c.lineGateway?.installDate && (
                        <div className="tiny muted mono" style={{ marginTop: 3 }}>{fmtDateShort(c.lineGateway.installDate)}</div>
                      )}
                      {lineInstaller && (
                        <div className="tiny muted" style={{ marginTop: 3 }}>ผู้ติดตั้ง: <span style={{ fontWeight: 600 }}>{lineInstaller.nick}</span></div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="tiny bold">{c.bmsWizard?.ip || "—"}</div>
                      <Chip kind={gwStatusChip(c.bmsWizard?.status)} style={{ marginTop: 3 }}>{c.bmsWizard?.status || "—"}</Chip>
                      {c.bmsWizard?.installDate && (
                        <div className="tiny muted mono" style={{ marginTop: 3 }}>{fmtDateShort(c.bmsWizard.installDate)}</div>
                      )}
                      {bmsInstaller && (
                        <div className="tiny muted" style={{ marginTop: 3 }}>ผู้ติดตั้ง: <span style={{ fontWeight: 600 }}>{bmsInstaller.nick}</span></div>
                      )}
                    </div>
                  </td>
                  <td>
                    {(() => {
                      const mgwInstaller = c.mobileGateway?.installerId ? team.find(t => t.id === c.mobileGateway.installerId) : null;
                      return (
                        <div>
                          <div className="tiny bold">{c.mobileGateway?.ip || "—"}</div>
                          <Chip kind={gwStatusChip(c.mobileGateway?.status)} style={{ marginTop: 3 }}>{c.mobileGateway?.status || "—"}</Chip>
                          {c.mobileGateway?.installDate && (
                            <div className="tiny muted mono" style={{ marginTop: 3 }}>{fmtDateShort(c.mobileGateway.installDate)}</div>
                          )}
                          {mgwInstaller && (
                            <div className="tiny muted" style={{ marginTop: 3 }}>ผู้ติดตั้ง: <span style={{ fontWeight: 600 }}>{mgwInstaller.nick}</span></div>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td>
                    {(() => {
                      const ubuntuInstaller = c.ubuntuServer?.installerId ? team.find(t => t.id === c.ubuntuServer.installerId) : null;
                      return (
                        <div>
                          <div className="tiny bold">{c.ubuntuServer?.ip || "—"}</div>
                          <Chip kind={gwStatusChip(c.ubuntuServer?.status)} style={{ marginTop: 3 }}>{c.ubuntuServer?.status || "—"}</Chip>
                          {c.ubuntuServer?.installDate && (
                            <div className="tiny muted mono" style={{ marginTop: 3 }}>{fmtDateShort(c.ubuntuServer.installDate)}</div>
                          )}
                          {ubuntuInstaller && (
                            <div className="tiny muted" style={{ marginTop: 3 }}>ผู้ติดตั้ง: <span style={{ fontWeight: 600 }}>{ubuntuInstaller.nick}</span></div>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td>
                    <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); setEditingId(h.id); }}>
                      <Icon name="settings" size={11} /> ตั้งค่า
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      ) : (
        <div className="empty">
          <div className="ico"><Icon name="inbox" size={20} /></div>
          ไม่มีโครงการในปี {year}
        </div>
      )}

      <Drawer open={editing != null} onClose={() => setEditingId(null)} wide>
        {editing && (
          <ConnectionEditor
            hospital={editing}
            team={team}
            onChange={updateConn}
            onClose={() => setEditingId(null)}
          />
        )}
      </Drawer>
    </div>
  );
};

Object.assign(window, { GatewayMonitor, ConnectionEditor });
