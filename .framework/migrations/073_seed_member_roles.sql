-- 073_seed_member_roles.sql
-- Seed the member and member_admin end-user roles.
--
-- F-066: 003_core_system_data.sql seeds system_admin plus the department
-- roles but never member/member_admin, even though the platform assumes
-- they exist:
--   * 003's own thread/message types grant record_permissions to both
--   * 060 grants them CRU on account/person; 051/007 grant member reads
--   * the registration RPCs (052/059) default join_request to 'member'
--   * RegisterPage falls back to 'member'; the admin UI defaults app
--     min_role to 'member'; create-app defaults --role member
-- With no roles row the slug never resolves, so every member grant was a
-- dead key (guaranteed-deny) and apps scaffolded with the default --role
-- wrote a min_role no person could satisfy.
--
-- is_system stays false: invites.ts resolveRoleId and the invite-accept
-- path reject is_system role slugs, and these are the self-service
-- end-user roles (same shape the app seed/roles.json files carry).
-- App installs upsert the same slugs (conflict 'slug'), so ON CONFLICT
-- DO NOTHING keeps this a no-op wherever an app already claimed them.

INSERT INTO public.roles (id, slug, name, description, permissions, is_system, is_active, is_protected, app_id, account_id)
VALUES
  (gen_random_uuid(), 'member',       'Member',       'Standard account member — end-user access to account-scoped apps',                 '["*"]'::jsonb, false, true, false, NULL, NULL),
  (gen_random_uuid(), 'member_admin', 'Member Admin', 'Member administrator — same access as member plus invite and member management', '["*"]'::jsonb, false, true, false, NULL, NULL)
ON CONFLICT (slug) DO NOTHING;
