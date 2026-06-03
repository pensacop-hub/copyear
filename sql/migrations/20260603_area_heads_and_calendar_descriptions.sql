alter table public.cop_calendar_events
  add column if not exists description text not null default '';

create table if not exists public.cop_area_heads (
  id integer primary key,
  sort_order integer not null,
  region text not null,
  area text not null unique,
  name text not null,
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.cop_area_heads (
  id, sort_order, region, area, name, phone, email, address
)
select
  row_number() over (order by first_sort_order)::integer as id,
  row_number() over (order by first_sort_order)::integer as sort_order,
  region,
  area,
  area_leader,
  '',
  '',
  ''
from (
  select distinct on (area)
    region,
    area,
    area_leader,
    sort_order as first_sort_order
  from public."cop personnel"
  where nullif(trim(area), '') is not null
  order by area, sort_order asc
) source
on conflict (area) do update
set
  sort_order = excluded.sort_order,
  region = excluded.region,
  name = excluded.name,
  updated_at = now();

update public."cop personnel" p
set area_leader = ah.name
from public.cop_area_heads ah
where lower(trim(ah.area)) = lower(trim(p.area));
