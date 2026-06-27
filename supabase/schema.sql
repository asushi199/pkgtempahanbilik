-- ============================================================
-- Tempahan PKG Manjung — Multi-PKG room booking schema
-- ============================================================

-- ---------- PKG (tenant) ----------
create table if not exists public.pkgs (
  id text primary key,                 -- slug, e.g. 'sitiawan', 'pantairemis'
  name text not null,                  -- 'PKG Sitiawan'
  admin_password_hash text,            -- HMAC-SHA256 hash of admin password
  whatsapp_admin_phone text,
  logo_src text,                       -- public URL of the PKG logo
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Migration for existing databases:
alter table public.pkgs add column if not exists logo_src text;

-- ---------- Rooms (per PKG, self-managed) ----------
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  pkg_id text not null references public.pkgs(id) on delete cascade,
  slug text not null,                  -- unique within a PKG
  name text not null,
  short_name text not null,
  category text not null,
  image_src text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (pkg_id, slug)
);

create index if not exists rooms_pkg_active_idx
  on public.rooms (pkg_id, active, sort_order);

-- ---------- Bookings ----------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  pkg_id text not null references public.pkgs(id) on delete cascade,
  room_slug text not null,             -- references rooms.slug within the same PKG
  date date not null,
  slot text not null check (slot in ('am', 'pm', 'full_day')),
  name text not null,
  school_or_unit text not null,
  purpose text not null,
  contact text not null,
  contact_normalized text not null default '',
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  approval_token_hash text,
  approved_at timestamptz,
  rejected_at timestamptz,
  notified_at timestamptz,
  notification_error text,
  cancelled_at timestamptz
);

create index if not exists bookings_active_lookup_idx
  on public.bookings (pkg_id, date, room_slug, slot, status)
  where status in ('pending', 'approved');

create index if not exists bookings_pending_contact_lookup_idx
  on public.bookings (pkg_id, contact_normalized, status)
  where status = 'pending';

-- ---------- Conflict prevention (scoped per PKG + room) ----------
create or replace function public.prevent_booking_conflict()
returns trigger
language plpgsql
as $$
begin
  if new.status not in ('pending', 'approved') then
    return new;
  end if;

  if exists (
    select 1
    from public.bookings existing
    where existing.id <> new.id
      and existing.status in ('pending', 'approved')
      and existing.pkg_id = new.pkg_id
      and existing.room_slug = new.room_slug
      and existing.date = new.date
      and (
        existing.slot = new.slot
        or existing.slot = 'full_day'
        or new.slot = 'full_day'
      )
  ) then
    raise exception 'Slot bilik ini sudah ditempah atau sedang menunggu kelulusan.';
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_prevent_conflict on public.bookings;

create trigger bookings_prevent_conflict
before insert or update on public.bookings
for each row execute function public.prevent_booking_conflict();

-- ============================================================
-- Reserved for future: item rental feature
-- ============================================================

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  pkg_id text not null references public.pkgs(id) on delete cascade,
  name text not null,
  description text,
  quantity int not null default 1,
  image_src text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.item_rentals (
  id uuid primary key default gen_random_uuid(),
  pkg_id text not null references public.pkgs(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  quantity int not null default 1,
  start_date date not null,
  end_date date not null,
  name text not null,
  school_or_unit text not null,
  purpose text not null,
  contact text not null,
  contact_normalized text not null default '',
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  approval_token_hash text,
  approved_at timestamptz,
  rejected_at timestamptz,
  cancelled_at timestamptz
);

-- ============================================================
-- Row Level Security (access is via service role key only)
-- ============================================================
alter table public.pkgs enable row level security;
alter table public.rooms enable row level security;
alter table public.bookings enable row level security;
alter table public.items enable row level security;
alter table public.item_rentals enable row level security;

-- ============================================================
-- Seed: 5 PKG (admin password hashes + room photos managed in-app)
-- ============================================================
insert into public.pkgs (id, name) values
  ('sitiawan',     'PKG Sitiawan'),
  ('ayertawar',    'PKG Ayer Tawar'),
  ('serimanjung',  'PKG Seri Manjung'),
  ('beruas',       'PKG Beruas'),
  ('pantairemis',  'PKG Pantai Remis')
on conflict (id) do nothing;

-- ============================================================
-- Storage bucket for room photos (run once in Supabase):
--   1. Dashboard > Storage > New bucket: name = 'room-photos', Public = ON
--   2. Or SQL:
--      insert into storage.buckets (id, name, public)
--      values ('room-photos', 'room-photos', true)
--      on conflict (id) do nothing;
-- ============================================================
