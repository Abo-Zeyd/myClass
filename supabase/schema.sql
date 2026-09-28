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
  foreign key (subject_id, lesson_id, item_id)
    references public.lesson_items (subject_id, lesson_id, id) on delete cascade
);

create table if not exists public.lesson_videos (
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
alter table public.lessons enable row level security;
alter table public.lesson_items enable row level security;
alter table public.lesson_activities enable row level security;
alter table public.lesson_images enable row level security;
alter table public.lesson_videos enable row level security;

revoke all on table public.metadata, public.assignments, public.lessons,
  public.lesson_items, public.lesson_activities, public.lesson_images,
  public.lesson_videos from anon, authenticated;
grant all on table public.metadata, public.assignments, public.lessons,
  public.lesson_items, public.lesson_activities, public.lesson_images,
  public.lesson_videos to service_role;

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

create or replace function public.replace_lessons(p_subject_id text, p_lessons jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  lesson_row record;
  item_row record;
begin
  delete from public.lesson_activities where subject_id = p_subject_id;
  delete from public.lesson_images where subject_id = p_subject_id;
  delete from public.lesson_videos where subject_id = p_subject_id;
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

      insert into public.lesson_images (subject_id, lesson_id, item_id, position, src, alt)
      select p_subject_id, lesson_row.entry->>'id', item_row.entry->>'id',
        (payload.ordinality - 1)::integer, payload.entry->>'src', coalesce(payload.entry->>'alt', '')
      from jsonb_array_elements(coalesce(item_row.entry->'images', '[]'::jsonb))
        with ordinality as payload(entry, ordinality);

      insert into public.lesson_videos (subject_id, lesson_id, item_id, position, url, title)
      select p_subject_id, lesson_row.entry->>'id', item_row.entry->>'id',
        (payload.ordinality - 1)::integer, payload.entry->>'url', coalesce(payload.entry->>'title', '')
      from jsonb_array_elements(coalesce(item_row.entry->'videos', '[]'::jsonb))
        with ordinality as payload(entry, ordinality);
    end loop;
  end loop;
end;
$$;

revoke all on function public.replace_assignments(jsonb) from public, anon, authenticated;
revoke all on function public.replace_lessons(text, jsonb) from public, anon, authenticated;
grant execute on function public.replace_assignments(jsonb) to service_role;
grant execute on function public.replace_lessons(text, jsonb) to service_role;