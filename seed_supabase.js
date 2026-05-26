// ============================================================
// Seed Supabase: อ่านจาก Excel → insert hospitals + team_members
// ============================================================
const XLSX  = require("xlsx");
const path  = require("path");
const https = require("https");

const SUPABASE_URL      = "https://bymztzztdariviepsgbl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5bXp0enp0ZGFyaXZpZXBzZ2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDUzMTEsImV4cCI6MjA5NTM4MTMxMX0.A7Vn-vvQ71FGhpKNWpnancnrbwU26JiUjTEREueUoL4";

// ─── Supabase REST helper ─────────────────────────────────────
async function sbUpsert(table, rows) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(rows);
    const url  = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    const opts = {
      hostname: url.hostname,
      path:     url.pathname + "?on_conflict=id",
      method:   "POST",
      headers:  {
        "Content-Type":  "application/json",
        "apikey":        SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Prefer":        "resolution=merge-duplicates",
        "Content-Length": Buffer.byteLength(body),
      },
    };
    const req = https.request(opts, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ ok: true, status: res.statusCode });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ─── Parse Excel date serial ──────────────────────────────────
function parseDate(v) {
  if (!v) return null;
  if (typeof v === "number" && v > 40000 && v < 60000) {
    const d = XLSX.SSF.parse_date_code(v);
    return `${d.y}-${String(d.m).padStart(2,"0")}-${String(d.d).padStart(2,"0")}`;
  }
  if (typeof v === "string" && v.match(/^\d{4}-\d{2}-\d{2}$/)) return v;
  return null;
}

// ─── Parse name → fname / lname ──────────────────────────────
function splitName(fullName) {
  const cleaned = (fullName || "").replace(/^(นางสาว|นาย|นาง|ด\.ช\.|ด\.ญ\.)\s*/u, "").trim();
  const parts   = cleaned.split(/\s+/);
  return { fname: parts[0] || cleaned, lname: parts.slice(1).join(" ") || "-" };
}

// ─── Map status ───────────────────────────────────────────────
function mapStatus(s) {
  const str = (s || "").trim();
  if (str.includes("ดำเนินการแล้ว") || str.includes("ติดตั้งเรียบร้อย")) return "ติดตั้งเสร็จ";
  if (str.includes("กำลัง"))  return "กำลังติดตั้ง";
  if (str.includes("ทดสอบ"))  return "ทดสอบระบบ";
  if (str.includes("ปิดงาน")) return "ปิดงาน";
  return "รอเริ่ม";
}

// ─── Map work type ────────────────────────────────────────────
function mapWorkType(w) {
  const s = (w || "").trim();
  if (s.startsWith("Online")) return "Online";
  if (s.startsWith("Onsite")) return "Onsite";
  if (s.startsWith("MA"))     return "MA";
  return "Onsite";
}

// ─── Map hospital type ────────────────────────────────────────
function mapHospitalType(t) {
  const s = (t || "").toLowerCase();
  if (s.includes("ใหญ่"))          return "รพ.ศูนย์ (รพศ.)(มากกว่า 500 เตียง)";
  if (s.includes("กลาง"))          return "รพ.ทั่วไป (รพท.)( 200 – 500 เตียง)";
  if (s.includes("เล็ก"))          return "รพ.ชุมชน (รพช.)(30-90 เตียง)";
  return "รพ.ชุมชน (รพช.)(30-90 เตียง)";
}

// ─── Read Excel ───────────────────────────────────────────────
const FILE = path.join(__dirname, "data รายละเอียด team.xlsx");
const wb   = XLSX.readFile(FILE);

// ────────────────────────────────────────────────────────────
// HOSPITALS (sheet 11)
// ────────────────────────────────────────────────────────────
const ws1  = wb.Sheets["11.ประสานงาน And GW"];
const raw1 = XLSX.utils.sheet_to_json(ws1, { defval: "" });

const COL_NAME   = "__EMPTY_3";
const COL_TAIGA  = "__EMPTY";
const COL_CODE   = "__EMPTY_1";
const COL_WARD   = "__EMPTY_15";
const COL_HTYPE  = "__EMPTY_16";
const COL_SIZE   = "__EMPTY_17";
const COL_LEAD   = "__EMPTY_18";
const COL_TEAM   = "__EMPTY_19";
const COL_WTYPE  = "__EMPTY_20";
const COL_STATUS = "__EMPTY_25";
const COL_START  = "__EMPTY_7";
const COL_END    = "__EMPTY_8";
const COL_WARR   = "__EMPTY_9";
const COL_PRICE  = "__EMPTY_32";
const SEQ_COL    = "รายชื่อโรงพยาบาล ติดตั้งโครงการ BMS HOSxP IPD Paperless ประจำปี 2567";

// Thai Buddhist year → CE year
function thaiToCE(thaiYear) { return thaiYear > 2500 ? thaiYear - 543 : thaiYear; }

let currentYear = 2022; // default CE
const hospitals = [];

for (let i = 2; i < raw1.length; i++) {
  const r   = raw1[i];
  const seq = r[SEQ_COL];

  // Detect year section header "ปี 2565" etc.
  if (typeof seq === "string" && seq.startsWith("ปี")) {
    const m = seq.match(/\d+/);
    if (m) currentYear = thaiToCE(Number(m[0]));
    continue;
  }

  const name = String(r[COL_NAME] || "").trim();
  if (!name || typeof seq !== "number") continue;

  const id = "h_" + String(i).padStart(4, "0") + "_" + Date.now().toString(36);

  hospitals.push({
    id,
    year:             currentYear,
    name:             name,
    code:             String(r[COL_CODE] || ""),
    taiga:            String(r[COL_TAIGA] || ""),
    taiga_url:        "",
    province:         "",
    region:           "กลาง",
    type:             mapHospitalType(r[COL_HTYPE]),
    work_type:        mapWorkType(r[COL_WTYPE]),
    hosxp_version:    "HOSxP XE 4",
    db_type:          "MySQL",
    start_date:       parseDate(r[COL_START]),
    end_date:         parseDate(r[COL_END]),
    warranty_end:     parseDate(r[COL_WARR]),
    weeks:            0,
    team_size:        Number(r[COL_SIZE]) || 0,
    team_ids:         [],
    lead_id:          "",
    aux_team:         [],
    ward_installed:   Number(r[COL_WARD]) || 0,
    ward_bonus:       0,
    ward_total:       0,
    price:            Number(r[COL_PRICE]) || 0,
    advance_amt:      0,
    status:           mapStatus(r[COL_STATUS]),
    advance:          "ยังไม่ Advance",
    phase:            "Phase 1",
    followups:        [],
    team_sheet_url:   "",
    contacts_admin:   [],
    contacts_followup: { doctor: [], admin: [], nurseIPD: [], pharmacy: [], stats: [] },
    apps:             ["ipd"],
    connection:       {},
  });
}
console.log(`✅ Hospitals: ${hospitals.length} rows ready`);

// ────────────────────────────────────────────────────────────
// TEAM MEMBERS (sheet 2)
// ────────────────────────────────────────────────────────────
const ws2  = wb.Sheets["2.รายชื่อน้องในทีม"];
const raw2 = XLSX.utils.sheet_to_json(ws2, { defval: "", header: 1 });

const avatarColors = ["#5B5BD6","#E89B6B","#2A8F5E","#C97B1F","#B8546D","#3877B8","#8E7CC3","#D44C47","#7C7C7C"];
const team = [];

for (let i = 2; i < raw2.length; i++) {
  const r   = raw2[i];
  const seq = r[0];
  if (typeof seq !== "number") continue;

  const fullName = String(r[1] || "").trim();
  const posFull  = String(r[2] || "").trim();
  const nick     = String(r[3] || "").trim();
  const genderRaw= String(r[4] || "").trim();
  const email1   = String(r[6] || "").trim().split("**")[0].split("\n")[0].trim();
  const mentor   = String(r[8] || "").trim();

  if (!fullName || !nick) continue;

  const { fname, lname } = splitName(fullName);
  const gender = genderRaw.toLowerCase().includes("ชาย") ? "ชาย" : "หญิง";
  const color  = avatarColors[(seq - 1) % avatarColors.length];

  team.push({
    id:        "m_" + String(seq).padStart(3,"0"),
    fname,
    lname,
    nick,
    pos_full:  posFull,
    pos_short: posFull.includes("ผู้จัดการ") ? "PM" : posFull.includes("หัวหน้า") ? "Lead" : posFull.includes("ชำนาญการพิเศษ") ? "Specialist+" : posFull.includes("ชำนาญการ") ? "Specialist" : "Staff",
    phone:     "",
    email1,
    email2:    "",
    food:      "",
    religion:  "พุทธ",
    license:   "ประเภท 2",
    disease:   "",
    bday:      "",
    gender,
    mentor,
    line_id:   "",
    avatar:    color,
    photo:     null,
    emoji:     null,
  });
}
console.log(`✅ Team members: ${team.length} rows ready`);

// ─── Upload to Supabase in batches ────────────────────────────
async function uploadBatch(table, rows, batchSize = 50) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    try {
      await sbUpsert(table, batch);
      console.log(`  📤 ${table}: uploaded ${i + batch.length}/${rows.length}`);
    } catch (err) {
      console.error(`  ❌ ${table} batch ${i}-${i + batchSize}:`, err.message);
    }
  }
}

(async () => {
  console.log("\n🚀 Starting upload to Supabase...\n");
  await uploadBatch("team_members", team);
  await uploadBatch("hospitals", hospitals);
  console.log("\n✅ Done! เปิดแอปแล้วรีเฟรชได้เลย");
})();
