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