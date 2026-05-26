// =========================================================
// Dashboard Screen
// =========================================================

const Dashboard = ({ year, hospitals, team, targets, onJump }) => {
  const yearHospitals = hospitals.filter(h => h.year === year);
  const target = targets[year] || { hospitals: 0, revenue: 0 };

  // Counts
  const totalApps = yearHospitals.reduce((a, h) => a + h.apps.length, 0);
  const totalRevenue = yearHospitals.reduce((a, h) => a + (h.price || 0), 0);
  const closed = yearHospitals.filter(h => h.status === "ปิดงาน" || h.status === "ในประกัน" || h.status === "ติดตั้งเสร็จ").length;
  const inProgress = yearHospitals.filter(h => h.status === "กำลังติดตั้ง" || h.status === "ทดสอบระบบ").length;
  const pending = yearHospitals.filter(h => h.status === "รอเริ่ม").length;

  // Monthly progress
  const months = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  const monthly = months.map((m, i) => {
    const count = yearHospitals.filter(h => new Date(h.start).getMonth() === i).length;
    return { label: m, value: count };
  });
  // Cumulative
  let cum = 0;
  const cumulative = monthly.map(m => ({ label: m.label, value: (cum += m.value) }));
  const targetLine = monthly.map((m, i) => ({ label: m.label, value: Math.round(target.hospitals * ((i + 1) / 12)) }));

  // App popularity
  const appCount = {};
  yearHospitals.forEach(h => h.apps.forEach(a => { appCount[a] = (appCount[a] || 0) + 1; }));
  const appSeg = APPS_CATALOG.map(a => ({
    label: a.name,
    value: appCount[a.id] || 0,
    color: a.color,
  })).filter(s => s.value > 0);

  // Region split
  const regions = {};
  yearHospitals.forEach(h => { regions[h.region] = (regions[h.region] || 0) + 1; });
  const regionSeg = Object.entries(regions).map(([label, value], i) => ({
    label, value,
    color: ["#5B5BD6","#E89B6B","#2A8F5E","#C97B1F","#B8546D","#3877B8"][i % 6],
  }));

  // Team workload (active engagements for the year)
  const teamLoad = team.map(t => {
    const count = yearHospitals.filter(h => h.team.includes(t.id)).length;
    return { ...t, load: count };
  }).sort((a, b) => b.load - a.load).slice(0, 6);

  // Recent activity (last 5 hospitals by start desc)
  const recent = [...yearHospitals].sort((a, b) => new Date(b.start) - new Date(a.start)).slice(0, 5);

  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr", gap: 20 }}>
      {/* KPI Row */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <KPI
          label="โรงพยาบาลที่ติดตั้ง"
          value={yearHospitals.length}
          unit={"/ " + target.hospitals}
          target={target.hospitals}
          current={yearHospitals.length}
          delta={`${Math.round((yearHospitals.length / target.hospitals) * 100)}% ของเป้า`}
          deltaDir={yearHospitals.length >= target.hospitals ? "up" : "down"}
          icon="building"
        />
        <KPI
          label="Application ที่ติดตั้ง"
          value={totalApps}
          unit="apps"
          delta="รวมทั้งปี · ติดตามเพื่อ Monitor"
          deltaDir="up"
          icon="layers"
        />
        <KPI
          label="รายได้รวม"
          value={fmtBaht(totalRevenue)}
          target={fmtBaht(target.revenue)}
          current={totalRevenue}
          delta={`${Math.round((totalRevenue / target.revenue) * 100)}% ของเป้า`}
          deltaDir={totalRevenue >= target.revenue ? "up" : "down"}
          icon="cash"
        />
        <KPI
          label="กำลังดำเนินการ"
          value={inProgress + pending}
          unit="ไซต์"
          delta={`ปิดงานแล้ว ${closed} ไซต์`}
          deltaDir="up"
          icon="activity"
        />
      </div>

      {/* Main 2 cols */}
      <div className="grid" style={{ gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
        {/* Cumulative chart */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>ความคืบหน้าสะสมรายเดือน</h3>
              <div className="desc">เส้นทึบ = ที่ทำได้จริง · เส้นประ = เป้าหมายตามแผน</div>
            </div>
            <div className="row-end">
              <Chip kind="accent">{year}</Chip>
              <button className="btn btn-sm" onClick={() => onJump("targets")}>
                ตั้งเป้า <Icon name="arrowRight" size={12} />
              </button>
            </div>
          </div>
          <div style={{ padding: 16 }}>
            <LineChart series={cumulative} target={targetLine} height={250} />
            <div className="row" style={{ marginTop: 8, gap: 16, paddingLeft: 8 }}>
              <span className="row" style={{ gap: 6 }}>
                <span className="s-dot" style={{ background: "var(--accent)" }} />
                <span className="tiny">จำนวนสะสม</span>
              </span>
              <span className="row" style={{ gap: 6 }}>
                <span className="s-dot" style={{ background: "var(--muted-2)" }} />
                <span className="tiny">เป้าหมายตามแผน ({target.hospitals} แห่ง)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Annual Target Ring */}
        <div className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h3 className="display" style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>เป้าหมายปี {year}</h3>
            <div className="tiny muted">สรุปภาพรวม</div>
          </div>
          <div className="row" style={{ gap: 18 }}>
            <ProgressRing value={yearHospitals.length} max={target.hospitals} size={108} stroke={10} />
            <div className="stack" style={{ flex: 1, gap: 14 }}>
              <div>
                <div className="tiny muted">โรงพยาบาล</div>
                <div className="display bold mono" style={{ fontSize: 22 }}>
                  {yearHospitals.length}<span className="muted" style={{ fontSize: 14 }}> / {target.hospitals}</span>
                </div>
              </div>
              <div>
                <div className="tiny muted">เหลือต้องทำ</div>
                <div className="display bold mono" style={{ fontSize: 22 }}>
                  {Math.max(0, target.hospitals - yearHospitals.length)}<span className="muted" style={{ fontSize: 14 }}> แห่ง</span>
                </div>
              </div>
            </div>
          </div>
          <hr className="div" style={{ margin: 0 }} />
          <div className="stack" style={{ gap: 10 }}>
            <div>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                <span className="tiny" style={{ fontWeight: 600 }}>Apps</span>
                <span className="tiny mono">{totalApps} / {target.apps}</span>
              </div>
              <div className="progress thin">
                <span style={{ width: Math.min(100, (totalApps / target.apps) * 100) + "%", background: "var(--c2)" }} />
              </div>
            </div>
            <div>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                <span className="tiny" style={{ fontWeight: 600 }}>รายได้</span>
                <span className="tiny mono">{fmtBaht(totalRevenue)} / {fmtBaht(target.revenue)}</span>
              </div>
              <div className="progress thin">
                <span style={{ width: Math.min(100, (totalRevenue / target.revenue) * 100) + "%", background: "var(--c3)" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-col row */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(2, 1fr) 1.1fr", gap: 20 }}>
        {/* Apps installed */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Application ที่ติดตั้งสูงสุด</h3>
              <div className="desc">จำนวนโรงพยาบาลที่ติดตั้งในปีนี้</div>
            </div>
          </div>
          <div style={{ padding: 18 }}>
            {appSeg.length === 0 ? (
              <div className="empty">ยังไม่มีข้อมูล</div>
            ) : (
              <DonutChart segments={appSeg} totalLabel="Apps" totalValue={totalApps} />
            )}
          </div>
        </div>

        {/* Region */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>กระจายตามภูมิภาค</h3>
              <div className="desc">โรงพยาบาลในแต่ละภาค</div>
            </div>
          </div>
          <div style={{ padding: 18 }}>
            {regionSeg.length === 0 ? (
              <div className="empty">ยังไม่มีข้อมูล</div>
            ) : (
              <DonutChart segments={regionSeg} totalLabel="Sites" totalValue={yearHospitals.length} />
            )}
          </div>
        </div>

        {/* Team load */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>ทีมที่ออกหน้างานสูงสุด</h3>
              <div className="desc">นับจำนวนโรงพยาบาลที่รับผิดชอบ</div>
            </div>
            <button className="btn btn-sm btn-ghost row-end" onClick={() => onJump("team")}>
              ดูทั้งหมด <Icon name="arrowRight" size={12} />
            </button>
          </div>
          <div className="stack" style={{ padding: "4px 0" }}>
            {teamLoad.map((t, i) => (
              <div key={t.id} className="list-item">
                <span className="muted mono tiny" style={{ width: 18 }}>#{i + 1}</span>
                <Avatar name={t.nick} color={t.avatar} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{t.nick} <span className="muted tiny">({t.fname})</span></div>
                  <div className="tiny muted">{t.posShort}</div>
                </div>
                <div className="display bold mono">{t.load}<span className="muted tiny" style={{ fontWeight: 400 }}> ไซต์</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status + recent */}
      <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        {/* Bar chart by month */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>การเริ่มงานในแต่ละเดือน</h3>
              <div className="desc">จำนวนโรงพยาบาลที่เริ่มติดตั้ง</div>
            </div>
          </div>
          <div style={{ padding: 18 }}>
            <BarChart data={monthly} height={200} />
          </div>
        </div>

        {/* Recent */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>เริ่มงานล่าสุด</h3>
              <div className="desc">5 โครงการล่าสุด</div>
            </div>
            <button className="btn btn-sm btn-ghost row-end" onClick={() => onJump("hospitals")}>
              ดูทั้งหมด <Icon name="arrowRight" size={12} />
            </button>
          </div>
          <div className="stack" style={{ padding: "4px 0" }}>
            {recent.map(h => (
              <div key={h.id} className="list-item">
                <div className="avatar" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)", borderRadius: 8, width: 36, height: 36 }}>
                  <Icon name="building" size={14} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.name}</div>
                  <div className="tiny muted">{fmtDate(h.start)} · {h.province}</div>
                </div>
                <Chip kind={statusChipClass(h.status).replace("chip-", "")}>{h.status}</Chip>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Dashboard });
