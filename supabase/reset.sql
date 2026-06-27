-- ============================================================
-- RESET — drop all app tables, then re-run schema.sql afterwards.
-- Safe ONLY when there is no real data yet (fresh project).
-- Order matters: drop dependents before parents (CASCADE handles FKs too).
-- ============================================================

drop table if exists public.item_rentals cascade;
drop table if exists public.items cascade;
drop table if exists public.bookings cascade;
drop table if exists public.rooms cascade;
drop table if exists public.pkgs cascade;

drop function if exists public.prevent_booking_conflict() cascade;
