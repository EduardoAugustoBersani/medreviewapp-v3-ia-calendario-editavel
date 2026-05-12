-- Execute este SQL no Supabase em SQL Editor

create table if not exists public.materias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  created_at timestamp with time zone default now()
);

create table if not exists public.assuntos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  materia_id uuid not null references public.materias(id) on delete cascade,
  nome text not null,
  progresso integer default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.revisoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assunto_id uuid not null references public.assuntos(id) on delete cascade,
  data_revisao date not null,
  status text default 'pendente',
  prioridade text default 'media',
  created_at timestamp with time zone default now()
);

create table if not exists public.erros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  area text default 'Geral',
  tentativas integer default 1,
  acerto integer default 0,
  created_at timestamp with time zone default now()
);

alter table public.materias enable row level security;
alter table public.assuntos enable row level security;
alter table public.revisoes enable row level security;
alter table public.erros enable row level security;

drop policy if exists "Usuários veem suas matérias" on public.materias;
drop policy if exists "Usuários criam suas matérias" on public.materias;
drop policy if exists "Usuários editam suas matérias" on public.materias;
drop policy if exists "Usuários apagam suas matérias" on public.materias;

create policy "Usuários veem suas matérias"
on public.materias for select
using (auth.uid() = user_id);

create policy "Usuários criam suas matérias"
on public.materias for insert
with check (auth.uid() = user_id);

create policy "Usuários editam suas matérias"
on public.materias for update
using (auth.uid() = user_id);

create policy "Usuários apagam suas matérias"
on public.materias for delete
using (auth.uid() = user_id);

drop policy if exists "Usuários veem seus assuntos" on public.assuntos;
drop policy if exists "Usuários criam seus assuntos" on public.assuntos;
drop policy if exists "Usuários editam seus assuntos" on public.assuntos;
drop policy if exists "Usuários apagam seus assuntos" on public.assuntos;

create policy "Usuários veem seus assuntos"
on public.assuntos for select
using (auth.uid() = user_id);

create policy "Usuários criam seus assuntos"
on public.assuntos for insert
with check (auth.uid() = user_id);

create policy "Usuários editam seus assuntos"
on public.assuntos for update
using (auth.uid() = user_id);

create policy "Usuários apagam seus assuntos"
on public.assuntos for delete
using (auth.uid() = user_id);

drop policy if exists "Usuários veem suas revisões" on public.revisoes;
drop policy if exists "Usuários criam suas revisões" on public.revisoes;
drop policy if exists "Usuários editam suas revisões" on public.revisoes;
drop policy if exists "Usuários apagam suas revisões" on public.revisoes;

create policy "Usuários veem suas revisões"
on public.revisoes for select
using (auth.uid() = user_id);

create policy "Usuários criam suas revisões"
on public.revisoes for insert
with check (auth.uid() = user_id);

create policy "Usuários editam suas revisões"
on public.revisoes for update
using (auth.uid() = user_id);

create policy "Usuários apagam suas revisões"
on public.revisoes for delete
using (auth.uid() = user_id);

drop policy if exists "Usuários veem seus erros" on public.erros;
drop policy if exists "Usuários criam seus erros" on public.erros;
drop policy if exists "Usuários editam seus erros" on public.erros;
drop policy if exists "Usuários apagam seus erros" on public.erros;

create policy "Usuários veem seus erros"
on public.erros for select
using (auth.uid() = user_id);

create policy "Usuários criam seus erros"
on public.erros for insert
with check (auth.uid() = user_id);

create policy "Usuários editam seus erros"
on public.erros for update
using (auth.uid() = user_id);

create policy "Usuários apagam seus erros"
on public.erros for delete
using (auth.uid() = user_id);
