create table if not exists program_enrollment (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references "user"(id) on delete cascade,
  program_id uuid not null references program(id) on delete cascade,
  curriculum_version_id uuid not null references curriculum_version(id) on delete restrict,
  enrolled_at timestamptz not null default now(),
  unique (user_id, program_id)
);

create index if not exists idx_enrollment_user on program_enrollment(user_id);
create index if not exists idx_enrollment_program on program_enrollment(program_id);

create table if not exists lesson_progress (
  user_id text not null references "user"(id) on delete cascade,
  lesson_version_id uuid not null references lesson_version(id) on delete restrict,
  started_at timestamptz,
  completed_at timestamptz,
  primary key (user_id, lesson_version_id)
);

create index if not exists idx_lesson_progress_lesson on lesson_progress(lesson_version_id);

create table if not exists quiz_attempt (
  id bigint generated always as identity primary key,
  user_id text not null references "user"(id) on delete cascade,
  quiz_version_id uuid not null references quiz_version(id) on delete restrict,
  answers jsonb not null,
  score numeric(5,2) not null,
  passed boolean not null,
  submitted_at timestamptz not null default now()
);

create index if not exists idx_quiz_attempt_user on quiz_attempt(user_id);
create index if not exists idx_quiz_attempt_quiz on quiz_attempt(quiz_version_id);

create table if not exists platform_event (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  event_type text not null,
  actor_user_id text references "user"(id) on delete set null,
  organization_id uuid references organization(id) on delete set null,
  program_id uuid references program(id) on delete set null,
  curriculum_version_id uuid references curriculum_version(id) on delete set null,
  lesson_version_id uuid references lesson_version(id) on delete set null,
  payload jsonb not null default '{}'
);

create index if not exists idx_platform_event_type_time
  on platform_event(event_type, occurred_at desc);

create index if not exists idx_platform_event_program on platform_event(program_id);
