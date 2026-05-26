create or replace function app_current_user_id()
returns text language sql stable as $$
  select nullif(current_setting('app.current_user_id', true), '')
$$;

create or replace function app_is_staff()
returns boolean language sql stable as $$
  select coalesce(current_setting('app.is_staff', true), 'false') = 'true'
$$;

create or replace function app_current_org_ids()
returns uuid[] language sql stable as $$
  select coalesce(
    nullif(current_setting('app.current_org_ids', true), '')::uuid[],
    '{}'::uuid[]
  )
$$;

create or replace function app_user_in_org(org_id uuid)
returns boolean language sql stable as $$
  select app_is_staff() or org_id = any(app_current_org_ids())
$$;

create or replace function app_program_is_public(program_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1
    from program p
    where p.id = program_id
      and p.hub_status in ('listed', 'featured')
      and p.active_published_version_id is not null
  )
$$;

create or replace function app_lesson_is_publicly_readable(p_lesson_version_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1
    from lesson_version lv
    join track t on t.id = lv.track_id
    join curriculum_version cv on cv.id = t.curriculum_version_id
    join program p on p.active_published_version_id = cv.id
    where lv.id = p_lesson_version_id
      and p.hub_status in ('listed', 'featured')
  )
$$;

create or replace function app_track_is_publicly_readable(p_track_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1
    from track t
    join curriculum_version cv on cv.id = t.curriculum_version_id
    join program p on p.active_published_version_id = cv.id
    where t.id = p_track_id
      and p.hub_status in ('listed', 'featured')
  )
$$;

create or replace function app_curriculum_version_is_public(p_version_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1
    from program p
    where p.active_published_version_id = p_version_id
      and p.hub_status in ('listed', 'featured')
  )
$$;

create or replace function app_quiz_is_publicly_readable(p_quiz_version_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1
    from lesson_version lv
    where lv.quiz_version_id = p_quiz_version_id
      and app_lesson_is_publicly_readable(lv.id)
  )
$$;

-- organization
alter table organization enable row level security;

drop policy if exists organization_select on organization;
create policy organization_select on organization
  for select using (app_is_staff() or app_user_in_org(id));

drop policy if exists organization_write on organization;
create policy organization_write on organization
  for all using (app_is_staff() or app_user_in_org(id));

-- organization_member
alter table organization_member enable row level security;

drop policy if exists organization_member_select on organization_member;
create policy organization_member_select on organization_member
  for select using (
    app_is_staff()
    or user_id = app_current_user_id()
    or app_user_in_org(organization_id)
  );

drop policy if exists organization_member_write on organization_member;
create policy organization_member_write on organization_member
  for all using (app_is_staff() or app_user_in_org(organization_id));

-- program
alter table program enable row level security;

drop policy if exists program_select on program;
create policy program_select on program
  for select using (
    app_is_staff()
    or app_user_in_org(organization_id)
    or app_program_is_public(id)
  );

drop policy if exists program_write on program;
create policy program_write on program
  for all using (app_is_staff() or app_user_in_org(organization_id));

-- program_hub_settings
alter table program_hub_settings enable row level security;

drop policy if exists program_hub_settings_select on program_hub_settings;
create policy program_hub_settings_select on program_hub_settings
  for select using (
    app_is_staff()
    or app_user_in_org((select organization_id from program where id = program_id))
    or app_program_is_public(program_id)
  );

drop policy if exists program_hub_settings_write on program_hub_settings;
create policy program_hub_settings_write on program_hub_settings
  for all using (
    app_is_staff()
    or app_user_in_org((select organization_id from program where id = program_id))
  );

-- curriculum (draft container)
alter table curriculum enable row level security;

drop policy if exists curriculum_select on curriculum;
create policy curriculum_select on curriculum
  for select using (
    app_is_staff()
    or app_user_in_org((select organization_id from program where id = program_id))
    or app_program_is_public(program_id)
  );

drop policy if exists curriculum_write on curriculum;
create policy curriculum_write on curriculum
  for all using (
    app_is_staff()
    or app_user_in_org((select organization_id from program where id = program_id))
  );

-- curriculum_version
alter table curriculum_version enable row level security;

drop policy if exists curriculum_version_select on curriculum_version;
create policy curriculum_version_select on curriculum_version
  for select using (
    app_is_staff()
    or app_curriculum_version_is_public(id)
    or app_user_in_org((
      select p.organization_id
      from curriculum c
      join program p on p.id = c.program_id
      where c.id = curriculum_id
    ))
  );

drop policy if exists curriculum_version_write on curriculum_version;
create policy curriculum_version_write on curriculum_version
  for all using (
    app_is_staff()
    or app_user_in_org((
      select p.organization_id
      from curriculum c
      join program p on p.id = c.program_id
      where c.id = curriculum_id
    ))
  );

-- track
alter table track enable row level security;

drop policy if exists track_select on track;
create policy track_select on track
  for select using (
    app_is_staff()
    or app_track_is_publicly_readable(id)
    or app_user_in_org((
      select p.organization_id
      from curriculum_version cv
      join curriculum c on c.id = cv.curriculum_id
      join program p on p.id = c.program_id
      where cv.id = curriculum_version_id
    ))
  );

drop policy if exists track_write on track;
create policy track_write on track
  for all using (
    app_is_staff()
    or app_user_in_org((
      select p.organization_id
      from curriculum_version cv
      join curriculum c on c.id = cv.curriculum_id
      join program p on p.id = c.program_id
      where cv.id = curriculum_version_id
    ))
  );

-- lesson_version
alter table lesson_version enable row level security;

drop policy if exists lesson_version_select on lesson_version;
create policy lesson_version_select on lesson_version
  for select using (
    app_is_staff()
    or app_lesson_is_publicly_readable(id)
    or app_user_in_org((
      select p.organization_id
      from track t
      join curriculum_version cv on cv.id = t.curriculum_version_id
      join curriculum c on c.id = cv.curriculum_id
      join program p on p.id = c.program_id
      where t.id = track_id
    ))
  );

drop policy if exists lesson_version_write on lesson_version;
create policy lesson_version_write on lesson_version
  for all using (
    app_is_staff()
    or app_user_in_org((
      select p.organization_id
      from track t
      join curriculum_version cv on cv.id = t.curriculum_version_id
      join curriculum c on c.id = cv.curriculum_id
      join program p on p.id = c.program_id
      where t.id = track_id
    ))
  );

-- quiz_version
alter table quiz_version enable row level security;

drop policy if exists quiz_version_select on quiz_version;
create policy quiz_version_select on quiz_version
  for select using (
    app_is_staff()
    or app_quiz_is_publicly_readable(id)
    or exists (
      select 1
      from lesson_version lv
      join track t on t.id = lv.track_id
      join curriculum_version cv on cv.id = t.curriculum_version_id
      join curriculum c on c.id = cv.curriculum_id
      join program p on p.id = c.program_id
      where lv.quiz_version_id = quiz_version.id
        and app_user_in_org(p.organization_id)
    )
  );

drop policy if exists quiz_version_write on quiz_version;
create policy quiz_version_write on quiz_version
  for all using (
    app_is_staff()
    or exists (
      select 1
      from lesson_version lv
      join track t on t.id = lv.track_id
      join curriculum_version cv on cv.id = t.curriculum_version_id
      join curriculum c on c.id = cv.curriculum_id
      join program p on p.id = c.program_id
      where lv.quiz_version_id = quiz_version.id
        and app_user_in_org(p.organization_id)
    )
  );

-- program_enrollment
alter table program_enrollment enable row level security;

drop policy if exists program_enrollment_select on program_enrollment;
create policy program_enrollment_select on program_enrollment
  for select using (app_is_staff() or user_id = app_current_user_id());

drop policy if exists program_enrollment_write on program_enrollment;
create policy program_enrollment_write on program_enrollment
  for all using (app_is_staff() or user_id = app_current_user_id());

-- lesson_progress
alter table lesson_progress enable row level security;

drop policy if exists lesson_progress_select on lesson_progress;
create policy lesson_progress_select on lesson_progress
  for select using (app_is_staff() or user_id = app_current_user_id());

drop policy if exists lesson_progress_write on lesson_progress;
create policy lesson_progress_write on lesson_progress
  for all using (app_is_staff() or user_id = app_current_user_id());

-- quiz_attempt
alter table quiz_attempt enable row level security;

drop policy if exists quiz_attempt_select on quiz_attempt;
create policy quiz_attempt_select on quiz_attempt
  for select using (app_is_staff() or user_id = app_current_user_id());

drop policy if exists quiz_attempt_write on quiz_attempt;
create policy quiz_attempt_write on quiz_attempt
  for all using (app_is_staff() or user_id = app_current_user_id());

-- platform_event
alter table platform_event enable row level security;

drop policy if exists platform_event_select on platform_event;
create policy platform_event_select on platform_event
  for select using (
    app_is_staff()
    or (organization_id is not null and app_user_in_org(organization_id))
  );

drop policy if exists platform_event_write on platform_event;
create policy platform_event_write on platform_event
  for all using (app_is_staff());
