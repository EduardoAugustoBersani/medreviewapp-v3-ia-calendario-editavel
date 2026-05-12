-- Execute este SQL no Supabase SQL Editor para adicionar as funções de provas

create table if not exists public.provas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  local_residencia text not null,
  data_prova date default current_date,
  total_questoes integer not null,
  total_acertos integer not null,
  created_at timestamp with time zone default now()
);

create table if not exists public.prova_areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prova_id uuid not null references public.provas(id) on delete cascade,
  area text not null,
  questoes integer not null,
  acertos integer not null,
  erros integer not null,
  created_at timestamp with time zone default now()
);

alter table public.provas enable row level security;
alter table public.prova_areas enable row level security;

drop policy if exists "Usuários veem suas provas" on public.provas;
drop policy if exists "Usuários criam suas provas" on public.provas;
drop policy if exists "Usuários editam suas provas" on public.provas;
drop policy if exists "Usuários apagam suas provas" on public.provas;

create policy "Usuários veem suas provas"
on public.provas for select
using (auth.uid() = user_id);

create policy "Usuários criam suas provas"
on public.provas for insert
with check (auth.uid() = user_id);

create policy "Usuários editam suas provas"
on public.provas for update
using (auth.uid() = user_id);

create policy "Usuários apagam suas provas"
on public.provas for delete
using (auth.uid() = user_id);

drop policy if exists "Usuários veem suas áreas de prova" on public.prova_areas;
drop policy if exists "Usuários criam suas áreas de prova" on public.prova_areas;
drop policy if exists "Usuários editam suas áreas de prova" on public.prova_areas;
drop policy if exists "Usuários apagam suas áreas de prova" on public.prova_areas;

create policy "Usuários veem suas áreas de prova"
on public.prova_areas for select
using (auth.uid() = user_id);

create policy "Usuários criam suas áreas de prova"
on public.prova_areas for insert
with check (auth.uid() = user_id);

create policy "Usuários editam suas áreas de prova"
on public.prova_areas for update
using (auth.uid() = user_id);

create policy "Usuários apagam suas áreas de prova"
on public.prova_areas for delete
using (auth.uid() = user_id);
