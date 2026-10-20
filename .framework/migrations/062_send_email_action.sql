-- Seeds the send_email pipeline action. send_email resolves recipients
-- (literal emails, person UUIDs, 'role:<slug>', or entity handles
-- 'owner'/'watchers'/'self') and sends through an outbound integration
-- (default slug 'transactional-email', e.g. Resend). No-op when the
-- integration is not configured.

INSERT INTO public.actions (slug, name, description, handler, handler_module, ownership, is_system, is_active)
SELECT 'send_email', 'Send Email', 'Core pipeline stage: send email to resolved recipients via an outbound email integration.', 'send_email', 'functions', 'platform', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.actions WHERE slug = 'send_email');
