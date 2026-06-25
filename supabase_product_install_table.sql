-- ============================================================
-- ติดตั้งผลิตภัณฑ์ — ตารางเก็บการติดตั้ง/ใช้งานผลิตภัณฑ์ที่ขาย
-- รันใน Supabase: SQL Editor > New query > วาง > Run
-- ============================================================

create table if not exists public.product_installations (
  id           text primary key,            -- "inst_" + timestamp
  hospital_id  text not null,               -- อ้างอิงโรงพยาบาล
  product      text not null,               -- bms_plus | bms_er_dash | nursing_cart
  install_date date,                        -- วันที่ติดตั้ง
  installers   jsonb default '[]'::jsonb,   -- ผู้ติดตั้ง/ใช้งาน (array ของ team member id)
  status       text  default 'รอติดตั้ง',   -- รอติดตั้ง | กำลังติดตั้ง | ติดตั้งแล้ว | กำลังใช้งาน | หยุดใช้งาน
  note         text  default '',            -- หมายเหตุ
  updated_at   timestamptz default now()
);

create index if not exists idx_product_installations_hospital
  on public.product_installations (hospital_id);
create index if not exists idx_product_installations_product
  on public.product_installations (product);

-- เปิด Row Level Security ให้สอดคล้องกับตารางอื่น ๆ
alter table public.product_installations enable row level security;

-- อนุญาตให้ anon role อ่าน/เขียนได้ (เหมือน hospitals / team_members ที่ใช้ anon key)
drop policy if exists "allow all product_installations" on public.product_installations;
create policy "allow all product_installations"
  on public.product_installations
  for all
  using (true)
  with check (true);
