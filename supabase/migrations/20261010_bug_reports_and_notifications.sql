-- =============================================================================
-- بلاغات الأخطاء + نظام تنبيهات موحّد للوحة التحكم
-- =============================================================================
-- يضيف:
--   1) جدول bug_reports        : بلاغات الزوار عن أخطاء الموقع
--   2) جدول admin_notifications : قائمة تنبيهات موحّدة (تعليقات رئيسية + دروس + بلاغات)
--   3) Triggers تُدخل تنبيهاً تلقائياً عند أي تعليق أو بلاغ جديد
--   4) دوال RPC للقراءة والاشارة كمقروء (بدون حذف)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) جدول بلاغات الأخطاء
-- -----------------------------------------------------------------------------
create table if not exists public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  display_name text not null default '',
  category text not null default 'other',
  body text not null,
  page_url text not null default '',
  status text not null default 'pending',
  admin_note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists bug_reports_created_at_idx
  on public.bug_reports (created_at desc);

create index if not exists bug_reports_status_idx
  on public.bug_reports (status);

-- -----------------------------------------------------------------------------
-- 2) جدول التنبيهات الموحّد
--    مصدر واحد للأنواع الثلاثة (تعليقات رئيسية + تعليقات دروس + بلاغات)
--    حتى لا تتكرر منطقيات القراءة والعدّ في التطبيق
-- -----------------------------------------------------------------------------
create table if not exists public.admin_notifications (
  id bigint generated always as identity primary key,
  source_type text not null,
  source_id text not null,
  title text not null default '',
  body text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- التنبيه الأحدث أولاً (للقراءة السريعة لقائمة آخر 10)
create index if not exists admin_notifications_created_at_idx
  on public.admin_notifications (created_at desc);

-- عدّاد غير المقروء: جزئي على غير المقروء فقط (أسرع وأصغر)
create index if not exists admin_notifications_unread_idx
  on public.admin_notifications (created_at desc)
  where read_at is null;

-- يمنع تكرار التنبيه لنفس المصدر (يُستخدم مع ON CONFLICT)
create unique index if not exists admin_notifications_source_idx
  on public.admin_notifications (source_type, source_id);

-- -----------------------------------------------------------------------------
-- 3) الأمان: RLS + منح الصلاحيات لـ service_role فقط
-- -----------------------------------------------------------------------------
alter table public.bug_reports enable row level security;
alter table public.admin_notifications enable row level security;

revoke all on table public.bug_reports, public.admin_notifications
  from anon, authenticated;
grant all on table public.bug_reports, public.admin_notifications
  to service_role;

-- -----------------------------------------------------------------------------
-- 4) Trigger موحّد: أي إدراج في الجداول الثلاثة يُنشئ تنبيهاً
--    SECURITY DEFINER لأن الـ trigger ينفّذ بصلاحيات المُدرج (service_role)
-- -----------------------------------------------------------------------------
create or replace function public.handle_insert_admin_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_source_type text;
  v_title text;
  v_author text;
begin
  v_source_type := case tg_table_name
    when 'lesson_comments' then 'lesson_comment'
    when 'homepage_comments' then 'homepage_comment'
    when 'bug_reports' then 'bug_report'
    else null
  end;

  -- جدول غير معروف: لا نُنشئ تنبيهاً له
  if v_source_type is null then
    return new;
  end if;

  v_author := coalesce(nullif(trim(new.display_name), ''), 'زائر');

  v_title := case tg_table_name
    when 'bug_reports' then 'بلاغ جديد من ' || v_author
    when 'lesson_comments' then 'تعليق جديد على درس من ' || v_author
    else 'تعليق جديد على الصفحة الرئيسية من ' || v_author
  end;

  insert into public.admin_notifications (source_type, source_id, title, body)
  values (v_source_type, new.id::text, v_title, left(coalesce(new.body, ''), 300))
  on conflict (source_type, source_id) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_homepage_comments_notify on public.homepage_comments;
create trigger trg_homepage_comments_notify
  after insert on public.homepage_comments
  for each row execute function public.handle_insert_admin_notification();

drop trigger if exists trg_lesson_comments_notify on public.lesson_comments;
create trigger trg_lesson_comments_notify
  after insert on public.lesson_comments
  for each row execute function public.handle_insert_admin_notification();

drop trigger if exists trg_bug_reports_notify on public.bug_reports;
create trigger trg_bug_reports_notify
  after insert on public.bug_reports
  for each row execute function public.handle_insert_admin_notification();

-- -----------------------------------------------------------------------------
-- 5) دوال RPC للتنبيهات
-- -----------------------------------------------------------------------------

-- آخر 10 تنبيهات (لا تُحذف، وتبقى ظاهرة حتى بعد القراءة)
create or replace function public.list_admin_notifications(p_limit integer default 10)
returns table (
  id bigint,
  source_type text,
  source_id text,
  title text,
  body text,
  read_at timestamptz,
  created_at timestamptz
)
language sql
security invoker
set search_path = public
as $$
  select n.id, n.source_type, n.source_id, n.title, n.body, n.read_at, n.created_at
  from public.admin_notifications n
  order by n.created_at desc
  limit greatest(coalesce(p_limit, 10), 1);
$$;

-- عدد التنبيهات غير المقروءة (شارة الجرس)
create or replace function public.count_unread_admin_notifications()
returns bigint
language sql
security invoker
set search_path = public
as $$
  select count(*) from public.admin_notifications where read_at is null;
$$;

-- تعليم قائمة معيّنة كمقروءة (لا تحذف)
create or replace function public.mark_admin_notifications_read(p_ids bigint[])
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if p_ids is null or cardinality(p_ids) = 0 then
    return;
  end if;

  update public.admin_notifications
  set read_at = now()
  where id = any(p_ids)
    and read_at is null;
end;
$$;

-- -----------------------------------------------------------------------------
-- 6) دوال RPC للبلاغات
-- -----------------------------------------------------------------------------

create or replace function public.update_bug_report(
  p_id uuid,
  p_status text default null,
  p_admin_note text default null
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update public.bug_reports
  set
    status = coalesce(p_status, status),
    admin_note = coalesce(p_admin_note, admin_note)
  where id = p_id;
end;
$$;

create or replace function public.delete_bug_report(p_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  delete from public.admin_notifications
  where source_type = 'bug_report' and source_id = p_id::text;

  delete from public.bug_reports where id = p_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- 7) الصلاحيات على الدوال
-- -----------------------------------------------------------------------------
revoke all on function public.handle_insert_admin_notification() from public, anon, authenticated;
revoke all on function public.list_admin_notifications(integer) from public, anon, authenticated;
revoke all on function public.count_unread_admin_notifications() from public, anon, authenticated;
revoke all on function public.mark_admin_notifications_read(bigint[]) from public, anon, authenticated;
revoke all on function public.update_bug_report(uuid, text, text) from public, anon, authenticated;
revoke all on function public.delete_bug_report(uuid) from public, anon, authenticated;

grant execute on function public.list_admin_notifications(integer) to service_role;
grant execute on function public.count_unread_admin_notifications() to service_role;
grant execute on function public.mark_admin_notifications_read(bigint[]) to service_role;
grant execute on function public.update_bug_report(uuid, text, text) to service_role;
grant execute on function public.delete_bug_report(uuid) to service_role;

notify pgrst, 'reload schema';