-- ============================================================
-- Package Paperless — ตารางเก็บการส่ง/การซื้อ Package
-- รันใน Supabase: SQL Editor > New query > วาง > Run
-- ============================================================

create table if not exists public.hospital_packages (
  id              text primary key,         -- = "pkg_" + hospital_id
  hospital_id     text not null,            -- อ้างอิงโรงพยาบาล
  beds            integer,                  -- ขนาด/จำนวนเตียง (30,60,90,120,200,300)
  package_type    text    default '',       -- ประเภทแพ็กเกจ
  sent_status     text    default 'Not Sent', -- Not Sent | Sent
  sent_date       date,                     -- วันที่ส่ง Package
  purchase_status text    default '',       -- สถานะการซื้อ (ข้อความอิสระ)
  note            text    default '',       -- หมายเหตุ
  contacts        jsonb   default '[]'::jsonb, -- ผู้ติดต่อ รพ. [{name,pos,phone,email,channel}]
  owner_team      jsonb   default '[]'::jsonb, -- ผู้รับผิดชอบ (array ของ team member id)
  updated_at      timestamptz default now()
);

create index if not exists idx_hospital_packages_hospital
  on public.hospital_packages (hospital_id);

-- เปิด Row Level Security ให้สอดคล้องกับตารางอื่น ๆ
alter table public.hospital_packages enable row level security;

-- อนุญาตให้ anon role อ่าน/เขียนได้ (เหมือน hospitals / team_members ที่ใช้ anon key)
-- ปรับ policy ให้เข้มขึ้นได้ภายหลังตามต้องการ
drop policy if exists "allow all hospital_packages" on public.hospital_packages;
create policy "allow all hospital_packages"
  on public.hospital_packages
  for all
  using (true)
  with check (true);
