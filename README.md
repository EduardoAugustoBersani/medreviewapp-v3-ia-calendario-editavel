# MedReview App com Supabase

Este projeto já tem:

- Login e cadastro com Supabase Auth
- Banco de dados no Supabase
- Cadastro de matérias
- Cadastro de assuntos
- Criação automática de revisões em 1, 7, 15 e 30 dias
- Conclusão de revisões
- Caderno de erros
- Deploy pronto para Vercel

## 1. Instalar

```bash
npm install
```

## 2. Criar arquivo .env.local

Copie o arquivo `.env.example` e renomeie para `.env.local`.

Preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
```

## 3. Criar tabelas no Supabase

No Supabase:

SQL Editor > New Query

Cole o conteúdo de:

```text
supabase/schema.sql
```

Clique em Run.

## 4. Rodar local

```bash
npm run dev
```

## 5. Deploy na Vercel

Na Vercel, adicione as mesmas variáveis de ambiente:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Depois faça o deploy.


## Correção para Vercel

Esta versão não quebra o build caso as variáveis do Supabase ainda não estejam configuradas.
O site publica normalmente e mostra uma tela de configuração pendente.

Para ativar o backend, configure na Vercel:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY


## Atualização V2

Novas funções:

- Calendário mensal de revisões
- Cadastro de provas de residência
- Separação de acertos e erros por área médica
- Gráfico de desempenho total
- Gráfico de desempenho por área
- Ranking automático das áreas que mais precisam de estudo

## SQL adicional

No Supabase, execute o arquivo:

```text
supabase/schema_v2_provas.sql
```


## Atualização V3

Novas funções:

- Adicionar revisão manual no calendário
- Remover revisão do calendário
- Substituir data/assunto/prioridade de uma revisão
- Área de IA de estudos
- API segura em `app/api/ia/route.ts`, usando `OPENAI_API_KEY` apenas no servidor

## Variáveis para IA na Vercel

Em Project > Settings > Environment Variables, adicione:

```env
OPENAI_API_KEY=sua_chave_da_openai
OPENAI_MODEL=gpt-4o-mini
```

Depois faça redeploy sem cache.
