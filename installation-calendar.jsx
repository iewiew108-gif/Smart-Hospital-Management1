// =========================================================
// Installation Calendar - ปฎิธิน view
// =========================================================

const InstallationCalendarScreen = ({ hospitals, year, setYear, years, team }) => {
  const [selectedDate, setSelectedDate] = React.useState(() => new Date(year, 0, 1));

  // Get hospitals for selected date
  const getHospitalsForDate = (date) => {
    return hospitals.filter(h => {
      const start = new Date(h.start);
      const end = new Date(h.end);
      return date >= start && date <= end;
    });
  };

  // Get all dates with installations
  const getDatesWithInstallations = () => {
    const dates = new Set();
    hospitals.forEach(h => {
      const start = new Date(h.start);
      const end = new Date(h.end);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d.getFullYear() === year) {
          dates.add(d.toISOString().split('T')[0]);
        }
      }
    });
    return dates;
  };

  const datesWithInstallations = getDatesWithInstallations();
  const currentMonthHospitals = getHospitalsForDate(selectedDate);

  // Calendar grid
  const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
  const daysInMonth = monthEnd.getDate();
  const firstDayOfWeek = monthStart.getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i));
  }

  const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  const goToPreviousMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const handleYearChange = (newYear) => {
    setYear(newYear);
    setSelectedDate(new Date(newYear, 0, 1));
  };

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="page-header">
        <div>
          <h1>ปฎิธินการติดตั้ง</h1>
          <div className="sub">ดูตารางการติดตั้งรายวัน/เดือน/ปี</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <YearPill years={years} value={year} onChange={handleYearChange} />
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {/* Calendar */}
        <div className="card">
          <div className="card-head">
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <button className="btn btn-sm btn-ghost" onClick={goToPreviousMonth}>
                {"<"}
              </button>
              <div className="display bold" style={{ fontSize: 16 }}>
                {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </div>
              <button className="btn btn-sm btn-ghost" onClick={goToNextMonth}>
                {">"}
              </button>
            </div>
          </div>
          <div style={{ padding: 16 }}>
            {/* Day headers */}
            <div className="grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
              {dayNames.map(d => (
                <div key={d} className="tiny bold" style={{ textAlign: "center", color: "var(--muted)" }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {calendarDays.map((day, i) => {
                if (!day) {
                  return <div key={"empty" + i}></div>;
                }

                const dateStr = day.toISOString().split('T')[0];
                const hasInstallation = datesWithInstallations.has(dateStr);
                const hospitalsOnDate = getHospitalsForDate(day);

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(day)}
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      border: "1px solid " + (selectedDate.toDateString() === day.toDateString() ? "var(--primary)" : "var(--border)"),
                      background: selectedDate.toDateString() === day.toDateString() ? "var(--primary-soft)" : "transparent",
                      cursor: "pointer",
                      transition: "all 150ms",
                    }}
                    className="btn-ghost"
                  >
                    <div className="tiny bold">{day.getDate()}</div>
                    {hasInstallation && (
                      <div className="tiny" style={{ marginTop: 2, color: "var(--success)" }}>
                        {hospitalsOnDate.length} โรง
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected date details */}
        <div className="card card-pad">
          <div className="display bold" style={{ fontSize: 16, marginBottom: 14 }}>
            {selectedDate.toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>

          {currentMonthHospitals.length > 0 ? (
            <div className="stack" style={{ gap: 12 }}>
              {currentMonthHospitals.map(h => {
                const lead = team.find(t => t.id === h.lead);
                const start = new Date(h.start);
                const end = new Date(h.end);
                const isStartDate = start.toDateString() === selectedDate.toDateString();
                const isEndDate = end.toDateString() === selectedDate.toDateString();

                return (
                  <div key={h.id} className="card" style={{ padding: 12, background: "var(--surface-alt)" }}>
                    <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
                      <div className="display bold" style={{ fontSize: 13 }}>{h.name}</div>
                      {isStartDate && <Chip kind="success" className="tiny">เริ่ม</Chip>}
                      {isEndDate && <Chip kind="accent" className="tiny">สิ้นสุด</Chip>}
                    </div>
                    <div className="tiny muted">{h.code} · {h.province}</div>
                    {lead && (
                      <div className="row tiny" style={{ marginTop: 6, gap: 4, alignItems: "center" }}>
                        <Avatar name={lead.nick} color={lead.avatar} />
                        <span className="bold">{lead.nick}</span>
                      </div>
                    )}
                    <div className="tiny muted" style={{ marginTop: 6 }}>
                      {start.toLocaleDateString("th-TH", { month: "short", day: "numeric" })} - {end.toLocaleDateString("th-TH", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty" style={{ fontSize: 13 }}>
              📅 ไม่มีการติดตั้งในวันนี้
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { InstallationCalendarScreen });
