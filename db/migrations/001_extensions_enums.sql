create extension if not exists pgcrypto;

do $$ begin
  create type hub_status as enum (
    'internal', 'listed', 'featured', 'sunset', 'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type trust_level as enum (
    'untrusted', 'self_serve_draft'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type curriculum_draft_status as enum (
    'draft', 'in_review', 'approved', 'rejected', 'changes_requested'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type curriculum_version_status as enum (
    'published', 'superseded', 'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type org_member_role as enum (
    'author', 'admin'
  );
exception
  when duplicate_object then null;
end $$;
