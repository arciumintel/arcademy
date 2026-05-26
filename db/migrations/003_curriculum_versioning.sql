create table if not exists curriculum (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null unique references program(id) on delete cascade,
  draft_status curriculum_draft_status not null default 'draft',
  updated_at timestamptz not null default now()
);

create table if not exists curriculum_version (
  id uuid primary key default gen_random_uuid(),
  curriculum_id uuid not null references curriculum(id) on delete cascade,
  version_number int not null,
  status curriculum_version_status not null default 'published',
  published_at timestamptz,
  published_by text references "user"(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (curriculum_id, version_number)
);

create index if not exists idx_curriculum_version_curriculum
  on curriculum_version(curriculum_id);

alter table program
  drop constraint if exists program_active_published_version_fk;

alter table program
  add constraint program_active_published_version_fk
  foreign key (active_published_version_id)
  references curriculum_version(id) on delete set null;

create table if not exists track (
  id uuid primary key default gen_random_uuid(),
  curriculum_version_id uuid not null references curriculum_version(id) on delete cascade,
  position int not null,
  slug text not null,
  title jsonb not null,
  unique (curriculum_version_id, slug),
  unique (curriculum_version_id, position)
);

create index if not exists idx_track_version on track(curriculum_version_id);

create table if not exists quiz_version (
  id uuid primary key default gen_random_uuid(),
  questions jsonb not null,
  scoring_config jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists lesson_version (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references track(id) on delete cascade,
  position int not null,
  slug text not null,
  title jsonb not null,
  blocks jsonb not null,
  quiz_version_id uuid references quiz_version(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (track_id, slug),
  unique (track_id, position)
);

create index if not exists idx_lesson_version_track on lesson_version(track_id);

create or replace function prevent_published_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'Published version rows are immutable';
end;
$$;
