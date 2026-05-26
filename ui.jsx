// =========================================================
// UI Primitives — Icons, Modal, Drawer, Charts, etc.
// =========================================================

const { useState, useEffect, useMemo, useRef, useCallback } = React;

// Icons (Lucide-style, simple)
const Icon = ({ name, size = 16, className = "", style = {} }) => {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    building: <><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" /></>,
    target: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
    report: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M8 13h8M8 17h5" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
    filter: <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></>,
    chevronDown: <polyline points="6 9 12 15 18 9" />,
    chevronRight: <polyline points="9 18 15 12 9 6" />,
    chevronLeft: <polyline points="15 18 9 12 15 6" />,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1.5 14a2 2 0 0 1-2 2H8.5a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
    close: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    arrowUp: <><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>,
    arrowDown: <><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></>,
    arrowRight: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
    check: <polyline points="20 6 9 17 4 12" />,
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>,
    map: <><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></>,
    pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
    cash: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="3" /><path d="M6 12h.01M18 12h.01" /></>,
    box: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>,
    list: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
    moreH: <><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></>,
    sparkle: <path d="M12 2l1.9 5.6L20 9l-4.9 2.4L13.5 17 12 12 8.5 17 7 11.4 2 9l5.6-1.4z" />,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
    layers: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
    award: <><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></>,
    trend: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>,
    cake: <><path d="M20 21V11.5a3.5 3.5 0 0 0-7 0V21M3 21v-7.5a3.5 3.5 0 0 1 7 0V21M3 17h18M12 4v3" /><circle cx="12" cy="2" r="1" /></>,
    id: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M15 8h2M15 12h2M7 16h10" /></>,
    info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
    drag: <><circle cx="9" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" /></>,
  };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size} height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      {paths[name] || null}
    </svg>
  );
};

// ----- Avatar
const Avatar = ({ name, color = "#5B5BD6", size = "" }) => {
  const initials = (name || "?")
    .trim()
    .split(/\s+/)
    .map(w => w[0])
    .slice(0, 2)
    .join("");
  return (
    <div className={"avatar " + size} style={{ background: color }}>
      {initials}
    </div>
  );
};

// ----- AvatarGroup
const AvatarGroup = ({ people, max = 4 }) => {
  const show = people.slice(0, max);
  const extra = people.length - show.length;
  return (
    <div className="avatar-group">
      {show.map((p, i) => (
        <Avatar key={p.id || i} name={p.nick || p.fname} color={p.avatar} />
      ))}
      {extra > 0 && <div className="avatar more">+{extra}</div>}
    </div>
  );
};

// ----- Chip
const Chip = ({ children, kind = "", className = "" }) => (
  <span className={`chip ${kind ? "chip-" + kind : ""} ${className}`}>{children}</span>
);

// ----- Modal
const Modal = ({ open, onClose, title, sub, size = "", children, footer }) => {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={"modal " + (size ? "modal-" + size : "")} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div style={{ flex: 1 }}>
            <div className="display bold" style={{ fontSize: 15 }}>{title}</div>
            {sub && <div className="tiny muted">{sub}</div>}
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
};

// ----- Drawer (slides from right)
const Drawer = ({ open, onClose, wide, children }) => {
  if (!open) return null;
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose}></div>
      <div className={"drawer" + (wide ? " drawer-wide" : "")}>{children}</div>
    </>
  );
};

// ----- Search
const SearchBox = ({ value, onChange, placeholder = "ค้นหา..." }) => (
  <div className="search">
    <Icon name="search" size={14} />
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

// ----- Toggle
const Toggle = ({ on, onChange }) => (
  <button className={"toggle " + (on ? "on" : "")} onClick={() => onChange(!on)} />
);

// ----- Tabs
const Tabs = ({ items, value, onChange }) => (
  <div className="tabs">
    {items.map(it => (
      <button
        key={it.value}
        className={"tab " + (value === it.value ? "active" : "")}
        onClick={() => onChange(it.value)}
      >
        {it.label}
      </button>
    ))}
  </div>
);

// ----- YearPill
const YearPill = ({ years, value, onChange }) => (
  <div className="year-pill">
    {years.map(y => (
      <button key={y} className={value === y ? "active" : ""} onClick={() => onChange(y)}>
        {y}
      </button>
    ))}
  </div>
);

// ----- Field
const Field = ({ label, en, children, span = 1, hint }) => (
  <div className="field" style={{ gridColumn: `span ${span}` }}>
    <label className="label">{label}{en && <span className="en">{en}</span>}</label>
    {children}
    {hint && <div className="tiny muted">{hint}</div>}
  </div>
);

// ----- KPI Card
const KPI = ({ label, value, unit, delta, deltaDir, icon, target, current }) => (
  <div className="card kpi">
    <div className="row" style={{ justifyContent: "space-between" }}>
      <div className="kpi-label">
        {icon && <Icon name={icon} size={14} />}
        {label}
      </div>
      {target && (
        <div className="tiny muted mono">เป้า {target}</div>
      )}
    </div>
    <div className="kpi-value">
      {value}
      {unit && <span className="unit">{unit}</span>}
    </div>
    {delta != null && (
      <div className={"kpi-delta " + (deltaDir === "up" ? "up" : deltaDir === "down" ? "down" : "")}>
        {deltaDir === "up" && <Icon name="arrowUp" size={12} />}
        {deltaDir === "down" && <Icon name="arrowDown" size={12} />}
        <span>{delta}</span>
      </div>
    )}
    {target && current != null && (
      <div className="progress thin">
        <span style={{ width: Math.min(100, (current / target) * 100) + "%" }} />
      </div>
    )}
  </div>
);

// ----- Progress Ring
const ProgressRing = ({ value, max, size = 92, stroke = 8, color = "var(--accent)" }) => {
  const pct = max ? Math.min(1, value / max) : 0;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="target-ring" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--bg-2)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .5s" }}
        />
      </svg>
      <div className="center">{Math.round(pct * 100)}%</div>
    </div>
  );
};

// ----- Donut Chart
const DonutChart = ({ segments, totalLabel = "Total", totalValue }) => {
  const total = segments.reduce((a, b) => a + b.value, 0) || 1;
  const size = 140;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="donut-wrap">
      <div className="donut">
        <svg viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--bg-2)" strokeWidth={stroke} fill="none" />
          {segments.map((s, i) => {
            const len = (s.value / total) * c;
            const dash = `${len} ${c - len}`;
            const seg = (
              <circle
                key={i}
                cx={size / 2} cy={size / 2} r={r}
                stroke={s.color}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                style={{ transition: "stroke-dashoffset .5s, stroke-dasharray .5s" }}
              />
            );
            offset += len;
            return seg;
          })}
        </svg>
        <div className="center">
          <div>
            <div className="v">{totalValue ?? total}</div>
            <div className="l">{totalLabel}</div>
          </div>
        </div>
      </div>
      <div className="legend" style={{ flex: 1 }}>
        {segments.map((s, i) => (
          <div className="li" key={i}>
            <div className="sw" style={{ background: s.color }} />
            <div>{s.label}</div>
            <div className="val">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ----- Bar Chart with target
const BarChart = ({ data, target, height = 200 }) => {
  // data: [{label, value}]
  const maxVal = Math.max(target || 0, ...data.map(d => d.value)) || 1;
  return (
    <div className="bar-chart" style={{ height }}>
      {data.map((d, i) => {
        const h = (d.value / maxVal) * (height - 30);
        const th = target ? (target / maxVal) * (height - 30) : 0;
        return (
          <div className="col" key={i}>
            <div className="bar-wrap" style={{ position: "relative" }}>
              {target && (
                <div
                  style={{
                    position: "absolute",
                    left: 0, right: 0,
                    bottom: th,
                    height: 2,
                    borderTop: "2px dashed var(--muted-2)",
                  }}
                />
              )}
              <div
                className="bar"
                style={{ height: h, background: d.color || "var(--accent)" }}
                title={`${d.label}: ${d.value}`}
              />
            </div>
            <div className="x">{d.label}</div>
            <div className="tiny bold mono">{d.value}</div>
          </div>
        );
      })}
    </div>
  );
};

// ----- Line Chart (cumulative vs target)
const LineChart = ({ series, target, height = 240 }) => {
  // series: [{label, value}], target: [{label, value}]  (same length)
  const w = 600;
  const h = height;
  const pad = { l: 36, r: 16, t: 12, b: 30 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const allVals = [...series.map(s => s.value), ...(target ? target.map(t => t.value) : [])];
  const maxY = Math.max(...allVals, 1);
  const niceMax = Math.ceil(maxY / 5) * 5 || 5;

  const x = (i) => pad.l + (series.length === 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
  const y = (v) => pad.t + innerH - (v / niceMax) * innerH;

  const linePath = series.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.value)}`).join(" ");
  const areaPath = linePath + ` L ${x(series.length - 1)} ${y(0)} L ${x(0)} ${y(0)} Z`;
  const targetPath = target ? target.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.value)}`).join(" ") : null;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(niceMax * t));

  return (
    <svg className="line-chart" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height }}>
      <defs>
        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5B5BD6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#5B5BD6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="grid">
        {ticks.map((t, i) => (
          <line key={i} x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} />
        ))}
      </g>
      <g className="y-axis">
        {ticks.map((t, i) => (
          <text key={i} x={pad.l - 8} y={y(t) + 3} textAnchor="end">{t}</text>
        ))}
      </g>
      <g className="x-axis">
        {series.map((p, i) => (
          <text key={i} x={x(i)} y={h - 10} textAnchor="middle">{p.label}</text>
        ))}
      </g>
      <path className="area" d={areaPath} />
      <path className="line" d={linePath} />
      {targetPath && <path className="line target" d={targetPath} />}
      {series.map((p, i) => (
        <circle key={i} className="dot" cx={x(i)} cy={y(p.value)} r="4" />
      ))}
    </svg>
  );
};

// ----- Toast manager (simple)
const ToastCtx = React.createContext({ push: () => {} });
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg) => {
    const id = Math.random();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2400);
  }, []);
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <span className="dot" />
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};
const useToast = () => React.useContext(ToastCtx);

// Export
Object.assign(window, {
  Icon, Avatar, AvatarGroup, Chip, Modal, Drawer, SearchBox, Toggle, Tabs, YearPill,
  Field, KPI, ProgressRing, DonutChart, BarChart, LineChart,
  ToastCtx, ToastProvider, useToast,
});
