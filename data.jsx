// =========================================================
// Mock Data — Smart Hospital Management
// =========================================================

const APPS_CATALOG = [
  { id: "ipd",       name: "IPD Nurse Dashboard",       short: "IPD",   desc: "ระบบจอ Dashboard สำหรับพยาบาล", color: "#5B5BD6" },
  { id: "disp",      name: "Dispensing Dashboard",      short: "DISP",  desc: "ระบบจอจ่ายยา", color: "#E89B6B" },
  { id: "bms",       name: "BMS HOSxP Plus",            short: "BMS+",  desc: "Application หลัก BMS HOSxP", color: "#2A8F5E" },
  { id: "line",      name: "HOSxP Line Official Gateway", short: "LINE", desc: "เชื่อม Line OA", color: "#06C755" },
  { id: "mobile",    name: "Mobile Gateway",            short: "MGW",   desc: "Gateway สำหรับ Mobile App", color: "#3877B8" },
  { id: "pdf",       name: "BMS Import PDF",            short: "PDF",   desc: "นำเข้าเอกสาร PDF", color: "#C97B1F" },
  { id: "consent",   name: "BMS Consent",               short: "CSNT",  desc: "ระบบ Consent ผู้ป่วย", color: "#B8546D" },
];

const HOSPITAL_TYPES = [
  "รพ.ชุมชน (รพช.)(30-90 เตียง)",
  "รพ.ทั่วไป (รพท.)( 200 – 500 เตียง)",
  "รพ.ศูนย์ (รพศ.)(มากกว่า 500 เตียง)",
  "รพ.เอกชน",
  "รพ.มหาวิทยาลัย",
  "อื่น ๆ",
];
const WORK_TYPES = ["Onsite", "Online", "MA", "ติดตั้งด้วยตัวเอง Phase 1", "ติดตั้งด้วยตัวเอง Phase 2", "ติดตั้งด้วยตัวเอง Phase 3", "ติดตั้งด้วยตัวเอง Phase 4", "ติดตั้งด้วยตัวเอง Phase 5", "ติดตั้งด้วยตัวเอง Phase 6", "ติดตั้งด้วยตัวเอง Phase 7", "ติดตั้งด้วยตัวเอง Phase 8", "ติดตั้งด้วยตัวเอง Phase 9", "ติดตั้งด้วยตัวเอง Phase 10"];
const INSTALL_STATUS = ["รอเริ่ม", "วางไซต์ไว้", "รอ Confirm site", "Confirm site แล้ว", "กำลังติดตั้ง", "ทดสอบระบบ", "ติดตั้งเสร็จ", "ในประกัน", "ปิดงาน", "เก็บได้แล้วเงินแล้ว", "ติดปัญหาเก็บเงินไม่ได้"];
const ADVANCE_STATUS = ["ยังไม่ Advance", "Advance แล้ว", "เคลียร์แล้ว", "บางส่วน", "ไม่ต้องทำ Advance"];
const HOSXP_VERSIONS = ["HOSxP XE 4", "HOSxP V3", "อื่น ๆ"];
const DB_TYPES = ["PostgreSQL", "MySQL", "MariaDB", "MS SQL Server", "Oracle"];
const INSTALL_PHASES = ["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5", "Phase 6", "ติดตั้งครบทุก ward"];
const DB_FLAVORS = ["MySQL", "MariaDB", "PostgreSQL", "MS SQL Server", "Oracle"];
const GATEWAY_STATUS = ["รอจ่ายเคสคิวติดตั้ง", "รอดำเนินการ", "กำลังดำเนินการ", "กำลังทดสอบ", "ติดตั้งเรียบร้อย"];
const BMS_STATUS = ["รอประสานขอ Gen Key", "รอดำเนินการ", "กำลังดำเนินการ", "ติดตั้งเรียบร้อย"];

const EMPTY_CONNECTION = {
  serverMaster:   { ip: "", db: "", user: "", pass: "", dbType: "MySQL", loginUser: "", loginPass: "" },
  serverImage:    { ip: "", db: "", user: "", pass: "", dbType: "MySQL" },
  serverTraining: { ip: "", db: "", user: "", pass: "", dbType: "MySQL", loginUser: "", loginPass: "" },
  cloudHosxp:     { user: "", pass: "" },
  remote:         { ip: "", id: "", pass: "" },
  ubuntu:         { ip: "", user: "", pass: "", rootPass: "" },
  mobileGateway:  { ip: "", user: "", pass: "", dbType: "MySQL", remote: { ip: "", id: "", pass: "" }, installerId: "", installDate: "", status: "รอติดตั้ง" },
  importPdf:      { ip: "", db: "", user: "", pass: "", dbType: "MySQL", remote: { ip: "", id: "", pass: "" } },
  ubuntuServer:   { ip: "", installerId: "", installDate: "", status: "รอติดตั้ง" },
  lineGateway: {
    ip: "", db: "", user: "", pass: "", dbType: "MySQL",
    remote: { ip: "", id: "", pass: "" },
    botTokenTg: "", chatBotLink: "", lineToken: "",
    installerId: "", installDate: "", status: "รอจ่ายเคสคิวติดตั้ง",
  },
  bmsWizard: {
    ip: "",
    remote: { ip: "", id: "", pass: "" },
    genKey: "", installerId: "", installDate: "", status: "รอประสานขอ Gen Key",
  },
  wifi:    { ssid: "", pass: "" },
  links:   { nurseWeb: "", drugWeb: "" },
  appTablet: { host: "", db: "", mobileGw: "" },
};

// Members
const TEAM = [];

// Targets by year
const TARGETS = {
  2023: { hospitals: 0, revenue: 0 },
  2024: { hospitals: 0, revenue: 0 },
  2025: { hospitals: 0, revenue: 0 },
  2026: { hospitals: 0, revenue: 0 },
};

// Hospitals
const HOSPITALS = [];

// Packages (การส่ง/การซื้อ Package)
const PACKAGES = [];

// ── Mapping ราคา Package ตามขนาด/จำนวนเตียง ───────────────
const PACKAGE_BED_OPTIONS = [
  { beds: 30,  label: "≤ 30 เตียง", price: 27000  },
  { beds: 60,  label: "60 เตียง",   price: 36000  },
  { beds: 90,  label: "90 เตียง",   price: 46000  },
  { beds: 120, label: "120 เตียง",  price: 72800  },
  { beds: 200, label: "200 เตียง",  price: 138000 },
  { beds: 300, label: "300 เตียง",  price: 220000 },
];
const PACKAGE_SENT_STATUS  = ["Not Sent", "Sent"];
const PACKAGE_CHANNELS     = ["LINE", "อีเมล", "โทรศัพท์", "Onsite", "อื่น ๆ"];

// Make data mutable
window.APPS_CATALOG = APPS_CATALOG;
window.HOSPITAL_TYPES = HOSPITAL_TYPES;
window.WORK_TYPES = WORK_TYPES;
window.INSTALL_STATUS = INSTALL_STATUS;
window.ADVANCE_STATUS = ADVANCE_STATUS;
window.SEED_TEAM = TEAM;
window.SEED_HOSPITALS = HOSPITALS;
window.SEED_TARGETS = TARGETS;
window.SEED_PACKAGES = PACKAGES;
window.PACKAGE_BED_OPTIONS = PACKAGE_BED_OPTIONS;
window.PACKAGE_SENT_STATUS = PACKAGE_SENT_STATUS;
window.PACKAGE_CHANNELS = PACKAGE_CHANNELS;

// ราคา Package จากจำนวนเตียง (คืน 0 ถ้ายังไม่เลือก)
window.getPackagePrice = (beds) => {
  const opt = PACKAGE_BED_OPTIONS.find(o => o.beds === Number(beds));
  return opt ? opt.price : 0;
};
window.getBedLabel = (beds) => {
  const opt = PACKAGE_BED_OPTIONS.find(o => o.beds === Number(beds));
  return opt ? opt.label : "—";
};

// Helpers
window.fmtBahtShort = (n) => {
  if (!n) return "0 บาท";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M บาท";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K บาท";
  return n + " บาท";
};
window.fmtBaht = (n) => (n || 0).toLocaleString("en-US") + " บาท";
window.fmtDate = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
};
window.fmtDateShort = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleDateString("th-TH", { month: "short", day: "numeric" });
};
window.statusChipClass = (status) => {
  if (status === "ปิดงาน") return "chip-success";
  if (status === "เก็บได้แล้วเงินแล้ว") return "chip-success";
  if (status === "ในประกัน") return "chip-info";
  if (status === "ติดตั้งเสร็จ") return "chip-success";
  if (status === "ทดสอบระบบ") return "chip-accent";
  if (status === "กำลังติดตั้ง") return "chip-warning";
  if (status === "ติดปัญหาเก็บเงินไม่ได้") return "chip-danger";
  if (status === "รอเริ่ม") return "chip-outline";
  if (status === "วางไซต์ไว้") return "chip-outline";
  if (status === "รอ Confirm site") return "chip-warning";
  if (status === "Confirm site แล้ว") return "chip-info";
  return "chip-outline";
};
window.advanceChipClass = (status) => {
  if (status === "เคลียร์แล้ว")       return "chip-success";
  if (status === "Advance แล้ว")      return "chip-warning";
  if (status === "บางส่วน")           return "chip-accent";
  if (status === "ไม่ต้องทำ Advance") return "chip-info";
  return "chip-outline";
};
