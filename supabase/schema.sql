create table if not exists public.metadata (
  key text primary key,
  value text not null
);

create table if not exists public.assignments (
  id text primary key,
  name text not null,
  assigned_date text not null default '',
  submission_date text not null default '',
  link text not null default '',
  completed integer not null default 0,
  position integer not null
);

create table if not exists public.supporting_activities (
  id text primary key,
  name text not null,
  link text not null default '',
  completed boolean not null default false,
  position integer not null
);

create table if not exists public.announcements (
  id text primary key,
  message text not null,
  active boolean not null default true,
  position integer not null
);

create table if not exists public.homepage_slides (
  id text primary key,
  title text not null,
  url text not null,
  active boolean not null default true,
  position integer not null
);

create table if not exists public.lessons (
  subject_id text not null,
  id text not null,
  title text not null,
  position integer not null,
  primary key (subject_id, id)
);

create table if not exists public.lesson_items (
  subject_id text not null,
  lesson_id text not null,
  id text not null,
  title text not null,
  summary text not null default '',
  position integer not null,
  primary key (subject_id, lesson_id, id),
  foreign key (subject_id, lesson_id)
    references public.lessons (subject_id, id) on delete cascade
);

create table if not exists public.lesson_activities (
  subject_id text not null,
  lesson_id text not null,
  item_id text not null,
  position integer not null,
  text text not null,
  foreign key (subject_id, lesson_id, item_id)
    references public.lesson_items (subject_id, lesson_id, id) on delete cascade
);

create table if not exists public.lesson_images (
  subject_id text not null,
  lesson_id text not null,
  item_id text not null,
  position integer not null,
  src text not null,
  alt text not null default '',
  created_at timestamptz not null default now(),
  foreign key (subject_id, lesson_id, item_id)
    references public.lesson_items (subject_id, lesson_id, id) on delete cascade
);

alter table public.lesson_images
  add column if not exists created_at timestamptz;

update public.lesson_images
set created_at = now() - interval '30 days'
where created_at is null;

alter table public.lesson_images
  alter column created_at set default now(),
  alter column created_at set not null;

create index if not exists lesson_images_created_at_idx
  on public.lesson_images (created_at desc);

create table if not exists public.lesson_videos (
  subject_id text not null,
  lesson_id text not null,
  item_id text not null,
  position integer not null,
  url text not null,
  title text not null default '',
  created_at timestamptz not null default now(),
  foreign key (subject_id, lesson_id, item_id)
    references public.lesson_items (subject_id, lesson_id, id) on delete cascade
);

alter table public.lesson_videos
  add column if not exists created_at timestamptz;

update public.lesson_videos
set created_at = now() - interval '30 days'
where created_at is null;

alter table public.lesson_videos
  alter column created_at set default now(),
  alter column created_at set not null;

create index if not exists lesson_videos_created_at_idx
  on public.lesson_videos (created_at desc);

create table if not exists public.lesson_pdfs (
  subject_id text not null,
  lesson_id text not null,
  item_id text not null,
  position integer not null,
  url text not null,
  title text not null default '',
  foreign key (subject_id, lesson_id, item_id)
    references public.lesson_items (subject_id, lesson_id, id) on delete cascade
);

alter table public.metadata enable row level security;
alter table public.assignments enable row level security;
alter table public.supporting_activities enable row level security;
alter table public.announcements enable row level security;
alter table public.homepage_slides enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_items enable row level security;
alter table public.lesson_activities enable row level security;
alter table public.lesson_images enable row level security;
alter table public.lesson_videos enable row level security;
alter table public.lesson_pdfs enable row level security;

revoke all on table public.metadata, public.assignments,
  public.supporting_activities, public.announcements, public.homepage_slides, public.lessons,
  public.lesson_items, public.lesson_activities, public.lesson_images,
  public.lesson_videos, public.lesson_pdfs from anon, authenticated;
grant all on table public.metadata, public.assignments,
  public.supporting_activities, public.announcements, public.homepage_slides, public.lessons,
  public.lesson_items, public.lesson_activities, public.lesson_images,
  public.lesson_videos, public.lesson_pdfs to service_role;

create or replace function public.replace_assignments(p_assignments jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  delete from public.assignments where id is not null;

  insert into public.assignments (
    id, name, assigned_date, submission_date, link, completed, position
  )
  select
    entry->>'id',
    entry->>'name',
    coalesce(entry->>'assignedDate', ''),
    coalesce(entry->>'submissionDate', ''),
    coalesce(entry->>'link', ''),
    case when coalesce((entry->>'completed')::boolean, false) then 1 else 0 end,
    (ordinality - 1)::integer
  from jsonb_array_elements(coalesce(p_assignments, '[]'::jsonb))
    with ordinality as payload(entry, ordinality);
end;
$$;

create or replace function public.replace_supporting_activities(p_activities jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  delete from public.supporting_activities where id is not null;

  insert into public.supporting_activities (id, name, link, completed, position)
  select
    entry->>'id',
    entry->>'name',
    coalesce(entry->>'link', ''),
    coalesce((entry->>'completed')::boolean, false),
    (ordinality - 1)::integer
  from jsonb_array_elements(coalesce(p_activities, '[]'::jsonb))
    with ordinality as payload(entry, ordinality);
end;
$$;

create or replace function public.replace_announcements(p_announcements jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  delete from public.announcements where id is not null;

  insert into public.announcements (id, message, active, position)
  select
    entry->>'id',
    entry->>'message',
    coalesce((entry->>'active')::boolean, true),
    (ordinality - 1)::integer
  from jsonb_array_elements(coalesce(p_announcements, '[]'::jsonb))
    with ordinality as payload(entry, ordinality);
end;
$$;

create or replace function public.replace_homepage_slides(p_slides jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  delete from public.homepage_slides where id is not null;

  insert into public.homepage_slides (id, title, url, active, position)
  select
    entry->>'id',
    entry->>'title',
    entry->>'url',
    coalesce((entry->>'active')::boolean, true),
    (ordinality - 1)::integer
  from jsonb_array_elements(coalesce(p_slides, '[]'::jsonb))
    with ordinality as payload(entry, ordinality);
end;
$$;

create or replace function public.replace_lessons(p_subject_id text, p_lessons jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  lesson_row record;
  item_row record;
  image_created_at jsonb;
  video_created_at jsonb;
begin
  select coalesce(
    jsonb_object_agg(
      jsonb_build_array(lesson_id, item_id, src)::text,
      to_jsonb(created_at)
    ),
    '{}'::jsonb
  )
  into image_created_at
  from public.lesson_images
  where subject_id = p_subject_id;

  select coalesce(
    jsonb_object_agg(
      jsonb_build_array(lesson_id, item_id, url)::text,
      to_jsonb(created_at)
    ),
    '{}'::jsonb
  )
  into video_created_at
  from public.lesson_videos
  where subject_id = p_subject_id;

  delete from public.lesson_activities where subject_id = p_subject_id;
  delete from public.lesson_images where subject_id = p_subject_id;
  delete from public.lesson_videos where subject_id = p_subject_id;
  delete from public.lesson_pdfs where subject_id = p_subject_id;
  delete from public.lesson_items where subject_id = p_subject_id;
  delete from public.lessons where subject_id = p_subject_id;

  for lesson_row in
    select payload.entry, payload.ordinality
    from jsonb_array_elements(coalesce(p_lessons, '[]'::jsonb))
      with ordinality as payload(entry, ordinality)
  loop
    insert into public.lessons (subject_id, id, title, position)
    values (
      p_subject_id,
      lesson_row.entry->>'id',
      lesson_row.entry->>'title',
      (lesson_row.ordinality - 1)::integer
    );

    for item_row in
      select payload.entry, payload.ordinality
      from jsonb_array_elements(coalesce(lesson_row.entry->'items', '[]'::jsonb))
        with ordinality as payload(entry, ordinality)
    loop
      insert into public.lesson_items (subject_id, lesson_id, id, title, summary, position)
      values (
        p_subject_id,
        lesson_row.entry->>'id',
        item_row.entry->>'id',
        item_row.entry->>'title',
        coalesce(item_row.entry->>'summary', ''),
        (item_row.ordinality - 1)::integer
      );

      insert into public.lesson_activities (subject_id, lesson_id, item_id, position, text)
      select p_subject_id, lesson_row.entry->>'id', item_row.entry->>'id',
        (payload.ordinality - 1)::integer, payload.activity
      from jsonb_array_elements_text(coalesce(item_row.entry->'activities', '[]'::jsonb))
        with ordinality as payload(activity, ordinality);

      insert into public.lesson_images (
        subject_id, lesson_id, item_id, position, src, alt, created_at
      )
      select p_subject_id, lesson_row.entry->>'id', item_row.entry->>'id',
        (payload.ordinality - 1)::integer,
        payload.entry->>'src',
        coalesce(payload.entry->>'alt', ''),
        coalesce(
          (
            image_created_at ->> jsonb_build_array(
              lesson_row.entry->>'id',
              item_row.entry->>'id',
              payload.entry->>'src'
            )::text
          )::timestamptz,
          now()
        )
      from jsonb_array_elements(coalesce(item_row.entry->'images', '[]'::jsonb))
        with ordinality as payload(entry, ordinality);

      insert into public.lesson_videos (
        subject_id, lesson_id, item_id, position, url, title, created_at
      )
      select p_subject_id, lesson_row.entry->>'id', item_row.entry->>'id',
        (payload.ordinality - 1)::integer,
        payload.entry->>'url',
        coalesce(payload.entry->>'title', ''),
        coalesce(
          (
            video_created_at ->> jsonb_build_array(
              lesson_row.entry->>'id',
              item_row.entry->>'id',
              payload.entry->>'url'
            )::text
          )::timestamptz,
          now()
        )
      from jsonb_array_elements(coalesce(item_row.entry->'videos', '[]'::jsonb))
        with ordinality as payload(entry, ordinality);

      insert into public.lesson_pdfs (subject_id, lesson_id, item_id, position, url, title)
      select p_subject_id, lesson_row.entry->>'id', item_row.entry->>'id',
        (payload.ordinality - 1)::integer, payload.entry->>'url', coalesce(payload.entry->>'title', '')
      from jsonb_array_elements(coalesce(item_row.entry->'pdfs', '[]'::jsonb))
        with ordinality as payload(entry, ordinality);
    end loop;
  end loop;
end;
$$;

revoke all on function public.replace_assignments(jsonb) from public, anon, authenticated;
revoke all on function public.replace_supporting_activities(jsonb) from public, anon, authenticated;
revoke all on function public.replace_announcements(jsonb) from public, anon, authenticated;
revoke all on function public.replace_homepage_slides(jsonb) from public, anon, authenticated;
revoke all on function public.replace_lessons(text, jsonb) from public, anon, authenticated;
grant execute on function public.replace_assignments(jsonb) to service_role;
grant execute on function public.replace_supporting_activities(jsonb) to service_role;
grant execute on function public.replace_announcements(jsonb) to service_role;
grant execute on function public.replace_homepage_slides(jsonb) to service_role;
grant execute on function public.replace_lessons(text, jsonb) to service_role;

notify pgrst, 'reload schema';

-- Atomic visitor counter used by the server-rendered homepage.
create or replace function public.increment_visitor_count()
returns bigint
language plpgsql
security invoker
set search_path = public
as $$
declare
  next_count bigint;
begin
  insert into public.metadata (key, value)
  values ('visitor_count', '1')
  on conflict (key) do update
    set value = (public.metadata.value::bigint + 1)::text
  returning value::bigint into next_count;

  return next_count;
end;
$$;

revoke all on function public.increment_visitor_count() from public, anon, authenticated;
grant execute on function public.increment_visitor_count() to service_role;

notify pgrst, 'reload schema';