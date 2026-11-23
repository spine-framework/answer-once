-- public.triggers.trigger_type is NOT NULL with no default (020), but the
-- /api/triggers create path defaults it to 'event' in code. Seed upserts via
-- PostgREST bypass that API default, so seed rows had to carry the column or
-- fail with a null-value violation — a schema/API asymmetry with no reason to
-- exist. Mirroring the API default at the column makes the seed path behave
-- like every other writer.
--
-- SET DEFAULT is additive and idempotent; existing rows and any seed that
-- already sends trigger_type are unaffected.
ALTER TABLE public.triggers ALTER COLUMN trigger_type SET DEFAULT 'event';
