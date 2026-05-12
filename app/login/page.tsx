"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { supabase, supabaseConfigured } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  if (!supabaseConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
        <div className="max-w-md rounded-3xl bg-white p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-slate-900">Configuração pendente</h1>
          <p className="mt-3 text-slate-600">
            Para usar login e cadastro, adicione as variáveis do Supabase na Vercel.
          </p>
          <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
            <p>NEXT_PUBLIC_SUPABASE_URL</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
          </div>
        </div>
      </main>
    );
  }
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [modoCadastro, setModoCadastro] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    setMensagem("");
    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setCarregando(false);

    if (error) {
      setMensagem(error.message);
      return;
    }

    router.push("/");
  }

  async function cadastrar() {
    setMensagem("");
    setCarregando(true);

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    setCarregando(false);

    if (error) {
      setMensagem(error.message);
      return;
    }

    setMensagem("Cadastro criado. Verifique seu e-mail, se a confirmação estiver ativada no Supabase.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">MedReview</h1>
            <p className="text-sm text-slate-500">Entre para continuar seus estudos</p>
          </div>
        </div>

        <div className="space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu e-mail"
            type="email"
            className="w-full rounded-2xl bg-slate-100 px-4 py-3 outline-none"
          />

          <input
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Sua senha"
            type="password"
            className="w-full rounded-2xl bg-slate-100 px-4 py-3 outline-none"
          />

          <button
            onClick={modoCadastro ? cadastrar : entrar}
            disabled={carregando}
            className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {carregando ? "Carregando..." : modoCadastro ? "Criar conta" : "Entrar"}
          </button>

          <button
            onClick={() => {
              setModoCadastro(!modoCadastro);
              setMensagem("");
            }}
            className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            {modoCadastro ? "Já tenho conta" : "Criar uma conta"}
          </button>

          {mensagem && (
            <p className="rounded-2xl bg-yellow-50 p-3 text-sm text-yellow-800">
              {mensagem}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
