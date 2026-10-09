-- ============================================
-- منشورات القسم: دعم النص + الصورة معاً
-- ============================================

-- 1) إضافة عمود المحتوى النصي
alter table public.homepage_slides
  add column if not exists content text not null default '';

-- 2) جعل رابط الصورة اختيارياً (لتمكين النص فقط)
alter table public.homepage_slides
  alter column url drop not null;

-- 3) تحديث دالة الحفظ لتدعم المحتوى النصي
create or replace function public.replace_homepage_slides(p_slides jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  delete from public.homepage_slides where id is not null;

  insert into public.homepage_slides (id, title, url, content, active, position)
  select
    entry->>'id',
    entry->>'title',
    nullif(entry->>'url', ''),
    coalesce(entry->>'content', ''),
    coalesce((entry->>'active')::boolean, true),
    (ordinality - 1)::integer
  from jsonb_array_elements(coalesce(p_slides, '[]'::jsonb))
    with ordinality as payload(entry, ordinality);
end;
$$;

-- 4) إعادة منح صلاحيات الدالة
revoke all on function public.replace_homepage_slides(jsonb)
  from public, anon, authenticated;
grant execute on function public.replace_homepage_slides(jsonb) to service_role;

-- 5) تحديث صلاحيات الجدول
revoke all on table public.homepage_slides from anon, authenticated;
grant all on table public.homepage_slides to service_role;

-- 6) إعادة تحميل مخطط PostgREST
notify pgrst, 'reload schema';