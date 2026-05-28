-- ============================================================
-- Smart Hospital Management — Supabase Schema
-- วิธีใช้: คัดลอก SQL นี้ไปวางใน Supabase → SQL Editor → Run
-- ============================================================

-- 1) TEAM MEMBERS
create table if not exists team_members (
  id            text primary key,
  fname         text not null,
  lname         text not null,
  nick          text,
  pos_full      text,
  pos_short     text,
  phone         text,
  email1        text,
  email2        text,
  food          text,
  religion      text default 'พุทธ',
  license       text default 'ประเภท 2',
  disease       text,
  bday          text,
  gender        text default 'ชาย',
  mentor        text,
  line_id       text,
  avatar        text default '#5B5BD6',
  photo         text,
  emoji         text,
  work_status   text default 'ปฏิบัติงานอยู่',
  department    text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 2) HOSPITALS
create table if not exists hospitals (
  id                  text primary key,
  year                integer not null,
  name                text not null,
  code                text,
  marketing_name      text,
  taiga               text,
  taiga_url           text,
  province            text,
  region              text default 'กลาง',
  type                text,
  work_type           text,
  hosxp_version       text,
  db_type             text,
  start_date          text,
  end_date            text,
  warranty_end        text,
  weeks               integer default 0,
  team_size           integer default 0,
  team_ids            text[]  default '{}',
  lead_id             text,
  aux_team            jsonb   default '[]',
  ward_installed      integer default 0,
  ward_bonus          integer default 0,
  ward_total          integer default 0,
  price               numeric default 0,
  advance_amt         numeric default 0,
  status              text    default 'รอเริ่ม',
  advance             text    default 'ยังไม่ Advance',
  phase               text,
  followups           jsonb   default '[]',
  team_sheet_url      text,
  contacts_admin      jsonb   default '[]',
  contacts_followup   jsonb   default '{}',
  apps                text[]  default '{}',
  connection          jsonb   default '{}',
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- 3) TARGETS (เป้าหมายรายปี)
create table if not exists targets (
  year        integer primary key,
  hospitals   integer default 0,
  revenue     numeric default 0
);

-- ============================================================
-- Row Level Security (RLS) — เปิดสำหรับ authenticated users
-- ถ้าต้องการให้ทุกคนเข้าถึงได้โดยไม่ต้อง login ให้ใช้ policy anon
-- ============================================================

alter table team_members  enable row level security;
alter table hospitals     enable row level security;
alter table targets       enable row level security;

-- อนุญาตทุก operation สำหรับ anon key (ใช้งานใน SPA โดยไม่มี login)
create policy "Allow all for anon" on team_members  for all using (true) with check (true);
create policy "Allow all for anon" on hospitals     for all using (true) with check (true);
create policy "Allow all for anon" on targets       for all using (true) with check (true);

-- ============================================================
-- ข้อมูลเริ่มต้น targets (optional)
-- ============================================================
insert into targets (year, hospitals, revenue) values
  (2023, 0, 0),
  (2024, 0, 0),
  (2025, 0, 0),
  (2026, 0, 0)
on conflict (year) do nothing;
