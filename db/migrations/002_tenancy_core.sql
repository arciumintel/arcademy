create table if not exists organization (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  trust_level trust_level not null default 'untrusted',
  moderation_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists organization_member (
  organization_id uuid not null references organization(id) on delete cascade,
  user_id text not null references "user"(id) on delete cascade,
  role org_member_role not null default 'author',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index if not exists idx_org_member_user on organization_member(user_id);

create table if not exists program (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organization(id) on delete restrict,
  slug text not null,
  title text not null,
  tagline text,
  hub_status hub_status not null default 'internal',
  featured_rank smallint check (featured_rank between 1 and 6),
  active_published_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create index if not exists idx_program_org on program(organization_id);

create index if not exists idx_program_hub_status on program(hub_status)
  where hub_status in ('listed', 'featured');

create table if not exists program_hub_settings (
  program_id uuid primary key references program(id) on delete cascade,
  tags text[] not null default '{}',
  sunset_at timestamptz,
  logo_url text,
  support_contact text,
  updated_at timestamptz not null default now()
);
