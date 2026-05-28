// ============================================================
// Supabase Client — Smart Hospital Management
// !! ตั้งค่า URL และ ANON KEY ของคุณด้านล่าง !!
// ============================================================

const SUPABASE_URL      = 'https://bymztzztdariviepsgbl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5bXp0enp0ZGFyaXZpZXBzZ2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDUzMTEsImV4cCI6MjA5NTM4MTMxMX0.A7Vn-vvQ71FGhpKNWpnancnrbwU26JiUjTEREueUoL4';

const _isConfigured = SUPABASE_URL !== 'YOUR_SUPABASE_URL';
const _sb = _isConfigured
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ─── Mapping: JS camelCase → DB snake_case ───────────────────

const _hospitalToDb = (h) => ({
  id:                 h.id,
  year:               h.year,
  name:               h.name,
  code:               h.code               || '',
  taiga:              h.taiga              || '',
  taiga_url:          h.taigaUrl           || '',
  marketing_name:     h.marketingName      || '',
  province:           h.province           || '',
  region:             h.region             || 'กลาง',
  type:               h.type               || '',
  work_type:          h.workType           || '',
  hosxp_version:      h.hosxpVersion       || '',
  db_type:            h.dbType             || '',
  start_date:         h.start              || null,
  end_date:           h.end                || null,
  warranty_end:       h.warrantyEnd        || null,
  weeks:              h.weeks              || 0,
  team_size:          h.teamSize           || 0,
  team_ids:           h.team               || [],
  lead_id:            h.lead               || '',
  aux_team:           h.auxTeam            || [],
  ward_installed:     h.wardInstalled      || 0,
  ward_bonus:         h.wardBonus          || 0,
  ward_total:         h.wardTotal          || 0,
  price:              h.price              || 0,
  advance_amt:        h.advanceAmt         || 0,
  status:             h.status             || 'รอเริ่ม',
  advance:            h.advance            || 'ยังไม่ Advance',
  phase:              h.phase              || '',
  followups:          h.followups          || [],
  team_sheet_url:     h.teamSheetUrl       || '',
  contacts_admin:     h.contactsAdmin      || [],
  contacts_followup:  h.contactsFollowup   || {},
  apps:               h.apps               || [],
  connection:         h.connection         || {},
});

const _hospitalFromDb = (row) => ({
  id:               row.id,
  year:             row.year,
  name:             row.name,
  code:             row.code              || '',
  taiga:            row.taiga             || '',
  taigaUrl:         row.taiga_url         || '',
  marketingName:    row.marketing_name    || '',
  province:         row.province          || '',
  region:           row.region            || 'กลาง',
  type:             row.type              || '',
  workType:         row.work_type         || '',
  hosxpVersion:     row.hosxp_version     || '',
  dbType:           row.db_type           || '',
  start:            row.start_date        || '',
  end:              row.end_date          || '',
  warrantyEnd:      row.warranty_end      || '',
  weeks:            row.weeks             || 0,
  teamSize:         row.team_size         || 0,
  team:             row.team_ids          || [],
  lead:             row.lead_id           || '',
  auxTeam:          row.aux_team          || [],
  wardInstalled:    row.ward_installed    || 0,
  wardBonus:        row.ward_bonus        || 0,
  wardTotal:        row.ward_total        || 0,
  price:            row.price             || 0,
  advanceAmt:       row.advance_amt       || 0,
  status:           row.status            || 'รอเริ่ม',
  advance:          row.advance           || 'ยังไม่ Advance',
  phase:            row.phase             || '',
  followups:        row.followups         || [],
  teamSheetUrl:     row.team_sheet_url    || '',
  contactsAdmin:    row.contacts_admin    || [],
  contactsFollowup: row.contacts_followup || { doctor: [], admin: [], nurseIPD: [], pharmacy: [], stats: [] },
  apps:             row.apps              || [],
  connection:       Object.assign({}, window.EMPTY_CONNECTION, row.connection || {}),
});

const _memberToDb = (m) => ({
  id:        m.id,
  fname:     m.fname,
  lname:     m.lname,
  nick:      m.nick       || '',
  pos_full:  m.posFull    || '',
  pos_short: m.posShort   || '',
  phone:     m.phone      || '',
  email1:    m.email1     || '',
  email2:    m.email2     || '',
  food:      m.food       || '',
  religion:  m.religion   || 'พุทธ',
  license:   m.license    || 'ประเภท 2',
  disease:   m.disease    || '',
  bday:      m.bday       || '',
  gender:    m.gender     || 'ชาย',
  mentor:    m.mentor     || '',
  line_id:   m.line       || '',
  avatar:      m.avatar      || '#5B5BD6',
  photo:       m.photo       || null,
  emoji:       m.emoji       || null,
  work_status: m.workStatus  || 'ปฏิบัติงานอยู่',
  department:  m.department  || '',
});

const _memberFromDb = (row) => ({
  id:       row.id,
  fname:    row.fname,
  lname:    row.lname,
  nick:     row.nick       || '',
  posFull:  row.pos_full   || '',
  posShort: row.pos_short  || '',
  phone:    row.phone      || '',
  email1:   row.email1     || '',
  email2:   row.email2     || '',
  food:     row.food       || '',
  religion: row.religion   || 'พุทธ',
  license:  row.license    || 'ประเภท 2',
  disease:  row.disease    || '',
  bday:     row.bday       || '',
  gender:   row.gender     || 'ชาย',
  mentor:   row.mentor     || '',
  line:     row.line_id    || '',
  avatar:      row.avatar       || '#5B5BD6',
  photo:       row.photo        || null,
  emoji:       row.emoji        || null,
  workStatus:  row.work_status  || 'ปฏิบัติงานอยู่',
  department:  row.department   || '',
});

// ─── Public API ──────────────────────────────────────────────

window.SupabaseDB = {
  isConfigured: _isConfigured,

  // โหลดข้อมูลทั้งหมดครั้งเดียว
  async loadAll() {
    if (!_isConfigured) {
      return {
        team:      [],
        hospitals: [],
        targets:   { 2026: { hospitals: 0, revenue: 0 } },
      };
    }
    const [teamRes, hospsRes, targetsRes] = await Promise.all([
      _sb.from('team_members').select('*').order('fname'),
      _sb.from('hospitals').select('*').order('year', { ascending: false }),
      _sb.from('targets').select('*').order('year'),
    ]);
    if (teamRes.error)    console.error('[Supabase] team_members:', teamRes.error);
    if (hospsRes.error)   console.error('[Supabase] hospitals:', hospsRes.error);
    if (targetsRes.error) console.error('[Supabase] targets:', targetsRes.error);

    const team      = (teamRes.data   || []).map(_memberFromDb);
    const hospitals = (hospsRes.data  || []).map(_hospitalFromDb);
    const tRows     =  targetsRes.data || [];
    const targets   = tRows.length
      ? Object.fromEntries(tRows.map(r => [r.year, { hospitals: r.hospitals, revenue: r.revenue }]))
      : { 2026: { hospitals: 0, revenue: 0 } };

    return { team, hospitals, targets };
  },

  // Hospital CRUD
  async upsertHospital(h) {
    if (!_isConfigured) return;
    const { error } = await _sb.from('hospitals').upsert(_hospitalToDb(h));
    if (error) console.error('[Supabase] upsertHospital:', error);
  },
  async deleteHospital(id) {
    if (!_isConfigured) return;
    const { error } = await _sb.from('hospitals').delete().eq('id', id);
    if (error) console.error('[Supabase] deleteHospital:', error);
  },

  // Team CRUD
  async upsertMember(m) {
    if (!_isConfigured) return;
    const { error } = await _sb.from('team_members').upsert(_memberToDb(m));
    if (error) console.error('[Supabase] upsertMember:', error);
  },
  async deleteMember(id) {
    if (!_isConfigured) return;
    const { error } = await _sb.from('team_members').delete().eq('id', id);
    if (error) console.error('[Supabase] deleteMember:', error);
  },

  // Targets
  async saveTargets(targets) {
    if (!_isConfigured) return;
    const rows = Object.entries(targets).map(([year, t]) => ({
      year:      Number(year),
      hospitals: t.hospitals || 0,
      revenue:   t.revenue   || 0,
    }));
    const { error } = await _sb.from('targets').upsert(rows);
    if (error) console.error('[Supabase] saveTargets:', error);
  },
};
