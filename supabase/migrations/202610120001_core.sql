-- Preparation for the future Supabase integration. NOT applied by the local app.
-- Run in a new Supabase project only after reviewing docs/SUPABASE.md.
begin;
create type public.day_result as enum ('win','loss','draw','rest');
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 timezone text not null default 'UTC', player_name text not null default 'You',
 calibration_day date, settings jsonb not null default '{}'
);
create table public.rivals (
 user_id uuid primary key references public.profiles(id) on delete cascade,
 name text not null default 'Blaze' check(char_length(name) between 1 and 24),
 sprite_ref text not null default 'blaze', palette text not null default 'ember',
 archetype text not null default 'blue' check(archetype in ('blue','sensei','machine')),
 difficulty_k numeric not null default .75 check(difficulty_k in (.6,.75,.9)),
 pending_rules jsonb
);
create table public.tasks (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 title text not null check(char_length(title) between 1 and 100),
 xp int not null check(xp between 10 and 5000),
 schedule_type text not null check(schedule_type in ('daily','weekdays','custom','once')),
 schedule_days int[] not null default '{}', once_day date, created_day date not null,
 focus_minutes int not null default 0 check(focus_minutes between 0 and 480),
 category text not null check(category in ('study','fitness','health','life')),
 active boolean not null default true, unique(id,user_id)
);
-- Persisted daily snapshots are required for cross-device target ratchets and grace lists.
create table public.day_configs (
 user_id uuid not null references public.profiles(id) on delete cascade,
 day date not null, timezone text not null, peak_planned_xp int not null check(peak_planned_xp>=0),
 difficulty_k numeric not null check(difficulty_k in (.5,.6,.75,.9)),
 is_rest boolean not null default false, had_completion boolean not null default false,
 task_snapshot jsonb not null default '[]', archetype text not null,
 primary key(user_id,day)
);
create table public.task_logs (
 task_id uuid not null, user_id uuid not null, day date not null,
 task_title text not null, completed_at timestamptz not null default now(),
 xp_awarded int not null check(xp_awarded>=10),
 primary key(user_id,day,task_id),
 foreign key(task_id,user_id) references public.tasks(id,user_id),
 foreign key(user_id,day) references public.day_configs(user_id,day) on delete cascade
);
create table public.day_records (
 user_id uuid not null, day date not null,
 user_xp int not null check(user_xp>=0), rival_xp int not null check(rival_xp>=0),
 rival_target int not null check(rival_target>=0), planned_xp int not null check(planned_xp>=0),
 result public.day_result not null, forfeit boolean not null default false,
 timezone text not null, archetype text not null, task_log_snapshot jsonb not null default '[]',
 primary key(user_id,day),
 foreign key(user_id,day) references public.day_configs(user_id,day) on delete cascade
);
alter table public.profiles enable row level security;
alter table public.rivals enable row level security;
alter table public.tasks enable row level security;
alter table public.day_configs enable row level security;
alter table public.task_logs enable row level security;
alter table public.day_records enable row level security;
create policy own_profile on public.profiles for all to authenticated using(auth.uid()=id) with check(auth.uid()=id);
create policy own_rival on public.rivals for all to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy own_tasks on public.tasks for all to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy read_days on public.day_configs for select to authenticated using(auth.uid()=user_id);
create policy insert_days on public.day_configs for insert to authenticated with check(auth.uid()=user_id);
create policy edit_open_days on public.day_configs for update to authenticated using(auth.uid()=user_id and not exists(select 1 from public.day_records r where r.user_id=day_configs.user_id and r.day=day_configs.day)) with check(auth.uid()=user_id);
create policy read_logs on public.task_logs for select to authenticated using(auth.uid()=user_id);
create policy insert_open_logs on public.task_logs for insert to authenticated with check(auth.uid()=user_id and not exists(select 1 from public.day_records r where r.user_id=task_logs.user_id and r.day=task_logs.day));
create policy undo_open_logs on public.task_logs for delete to authenticated using(auth.uid()=user_id and not exists(select 1 from public.day_records r where r.user_id=task_logs.user_id and r.day=task_logs.day));
create policy read_results on public.day_records for select to authenticated using(auth.uid()=user_id);
create policy insert_results on public.day_records for insert to authenticated with check(auth.uid()=user_id);
-- Intentionally no UPDATE/DELETE result policy: settled matches are immutable.
create function public.new_rival_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id) values(new.id);
 insert into public.rivals(user_id) values(new.id);
 return new;
end;
$$;
revoke all on function public.new_rival_profile() from public, anon, authenticated;
create trigger on_rival_user_created after insert on auth.users for each row execute function public.new_rival_profile();
commit;
