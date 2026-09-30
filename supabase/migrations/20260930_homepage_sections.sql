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

alter table public.supporting_activities enable row level security;
alter table public.announcements enable row level security;
alter table public.homepage_slides enable row level security;

revoke all on table public.supporting_activities, public.announcements, public.homepage_slides
  from anon, authenticated;
grant all on table public.supporting_activities, public.announcements, public.homepage_slides
  to service_role;

insert into public.supporting_activities (id, name, link, completed, position)
select
  payload.entry->>'id',
  payload.entry->>'name',
  coalesce(payload.entry->>'link', ''),
  coalesce((payload.entry->>'completed')::boolean, false),
  (payload.ordinality - 1)::integer
from public.metadata as stored
cross join lateral jsonb_array_elements(
  case when stored.key = 'supporting_activities' then
    case when jsonb_typeof(stored.value::jsonb) = 'array' then stored.value::jsonb else '[]'::jsonb end
  else '[]'::jsonb end
)
  with ordinality as payload(entry, ordinality)
where stored.key = 'supporting_activities'
on conflict (id) do nothing;

create or replace function public.replace_supporting_activities(p_activities jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  delete from public.supporting_activities where id is not null;
  insert into public.supporting_activities (id, name, link, completed, position)
  select entry->>'id', entry->>'name', coalesce(entry->>'link', ''),
    coalesce((entry->>'completed')::boolean, false), (ordinality - 1)::integer
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
  select entry->>'id', entry->>'message', coalesce((entry->>'active')::boolean, true),
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
  select entry->>'id', entry->>'title', entry->>'url', coalesce((entry->>'active')::boolean, true),
    (ordinality - 1)::integer
  from jsonb_array_elements(coalesce(p_slides, '[]'::jsonb))
    with ordinality as payload(entry, ordinality);
end;
$$;

revoke all on function public.replace_supporting_activities(jsonb) from public, anon, authenticated;
revoke all on function public.replace_announcements(jsonb) from public, anon, authenticated;
revoke all on function public.replace_homepage_slides(jsonb) from public, anon, authenticated;
grant execute on function public.replace_supporting_activities(jsonb) to service_role;
grant execute on function public.replace_announcements(jsonb) to service_role;
grant execute on function public.replace_homepage_slides(jsonb) to service_role;

notify pgrst, 'reload schema';