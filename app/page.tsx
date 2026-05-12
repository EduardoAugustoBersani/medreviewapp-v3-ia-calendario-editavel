"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Flame,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  LineChart,
  ListChecks,
  LogOut,
  Plus,
  Search,
  Target,
  Timer,
  Trophy,
  XCircle,
  BarChart3,
  ClipboardList,
  Bot,
  Trash2,
  RefreshCcw,
} from "lucide-react";
import { supabase, supabaseConfigured } from "../lib/supabaseClient";

type Materia = {
  id: string;
  nome: string;
  created_at?: string;
};

type Assunto = {
  id: string;
  materia_id: string;
  nome: string;
  progresso: number;
  created_at?: string;
};

type Revisao = {
  id: string;
  assunto_id: string;
  data_revisao: string;
  status: string;
  prioridade: string;
  assunto?: {
    nome: string;
    materia?: {
      nome: string;
    };
  };
};

type Erro = {
  id: string;
  titulo: string;
  area: string;
  tentativas: number;
  acerto: number;
};

type Prova = {
  id: string;
  nome: string;
  local_residencia: string;
  total_questoes: number;
  total_acertos: number;
  data_prova: string;
  created_at?: string;
};

type ProvaArea = {
  id: string;
  prova_id: string;
  area: string;
  questoes: number;
  acertos: number;
  erros: number;
};

const areasMedicina = [
  "Clínica Médica",
  "Cirurgia",
  "Pediatria",
  "Ginecologia e Obstetrícia",
  "Preventiva",
  "Psiquiatria",
  "Ortopedia",
  "Dermatologia",
  "Neurologia",
  "Cardiologia",
  "Infectologia",
];

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl bg-white/90 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function StatCard({
  icon: Icon,
  titulo,
  valor,
  detalhe,
}: {
  icon: React.ElementType;
  titulo: string;
  valor: string;
  detalhe: string;
}) {
  return (
    <Card>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">{titulo}</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">{valor}</h3>
            <p className="mt-1 text-xs text-slate-400">{detalhe}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
            <Icon className="h-5 w-5 text-slate-700" />
          </div>
        </div>
      </div>
    </Card>
  );
}

function formatarData(data: string) {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function Home() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [busca, setBusca] = useState("");
  const [pomodoro, setPomodoro] = useState(25);

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [assuntos, setAssuntos] = useState<Assunto[]>([]);
  const [revisoes, setRevisoes] = useState<Revisao[]>([]);
  const [erros, setErros] = useState<Erro[]>([]);
  const [provas, setProvas] = useState<Prova[]>([]);
  const [provaAreas, setProvaAreas] = useState<ProvaArea[]>([]);

  const [novaMateria, setNovaMateria] = useState("");
  const [novoAssunto, setNovoAssunto] = useState("");
  const [materiaSelecionada, setMateriaSelecionada] = useState("");
  const [novoErro, setNovoErro] = useState("");
  const [areaErro, setAreaErro] = useState("");

  const [nomeProva, setNomeProva] = useState("");
  const [localResidencia, setLocalResidencia] = useState("");
  const [dataProva, setDataProva] = useState("");
  const [totalQuestoes, setTotalQuestoes] = useState("");
  const [totalAcertos, setTotalAcertos] = useState("");
  const [areaProva, setAreaProva] = useState("Clínica Médica");
  const [questoesArea, setQuestoesArea] = useState("");
  const [acertosArea, setAcertosArea] = useState("");
  const [areasTemporarias, setAreasTemporarias] = useState<
    { area: string; questoes: number; acertos: number; erros: number }[]
  >([]);

  const [assuntoRevisaoManual, setAssuntoRevisaoManual] = useState("");
  const [dataRevisaoManual, setDataRevisaoManual] = useState("");
  const [prioridadeRevisaoManual, setPrioridadeRevisaoManual] = useState("media");
  const [revisaoEditandoId, setRevisaoEditandoId] = useState<string | null>(null);
  const [mensagemRevisao, setMensagemRevisao] = useState("");

  const [perguntaIA, setPerguntaIA] = useState("");
  const [respostaIA, setRespostaIA] = useState("");
  const [carregandoIA, setCarregandoIA] = useState(false);

  const [mesCalendario, setMesCalendario] = useState(new Date().getMonth());
  const [anoCalendario, setAnoCalendario] = useState(new Date().getFullYear());

  useEffect(() => {
    async function carregarUsuario() {
      if (!supabaseConfigured) return;

      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
        return;
      }

      setUserId(data.user.id);
      setEmail(data.user.email || "");
    }

    carregarUsuario();
  }, [router]);

  useEffect(() => {
    if (userId && supabaseConfigured) {
      carregarDados();
    }
  }, [userId]);

  async function carregarDados() {
    const { data: materiasData } = await supabase
      .from("materias")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: assuntosData } = await supabase
      .from("assuntos")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: revisoesData } = await supabase
      .from("revisoes")
      .select("*, assunto:assuntos(nome, materia:materias(nome))")
      .order("data_revisao", { ascending: true });

    const { data: errosData } = await supabase
      .from("erros")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: provasData } = await supabase
      .from("provas")
      .select("*")
      .order("data_prova", { ascending: false });

    const { data: provaAreasData } = await supabase
      .from("prova_areas")
      .select("*");

    setMaterias(materiasData || []);
    setAssuntos(assuntosData || []);
    setRevisoes(revisoesData || []);
    setErros(errosData || []);
    setProvas(provasData || []);
    setProvaAreas(provaAreasData || []);
  }

  async function sair() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function criarMateria() {
    if (!novaMateria.trim() || !userId) return;

    await supabase.from("materias").insert({
      user_id: userId,
      nome: novaMateria.trim(),
    });

    setNovaMateria("");
    carregarDados();
  }

  async function criarAssunto() {
    if (!novoAssunto.trim() || !materiaSelecionada || !userId) return;

    const { data: assuntoCriado, error } = await supabase
      .from("assuntos")
      .insert({
        user_id: userId,
        materia_id: materiaSelecionada,
        nome: novoAssunto.trim(),
        progresso: 0,
      })
      .select()
      .single();

    if (!error && assuntoCriado) {
      const hoje = new Date();
      const intervalos = [1, 7, 15, 30];

      const revisoesParaCriar = intervalos.map((dias, index) => {
        const data = new Date(hoje);
        data.setDate(hoje.getDate() + dias);

        return {
          user_id: userId,
          assunto_id: assuntoCriado.id,
          data_revisao: data.toISOString().slice(0, 10),
          status: "pendente",
          prioridade: index === 0 ? "alta" : "media",
        };
      });

      await supabase.from("revisoes").insert(revisoesParaCriar);
    }

    setNovoAssunto("");
    carregarDados();
  }

  async function concluirRevisao(id: string) {
    await supabase.from("revisoes").update({ status: "concluida" }).eq("id", id);
    carregarDados();
  }

  function limparFormularioRevisao() {
    setAssuntoRevisaoManual("");
    setDataRevisaoManual("");
    setPrioridadeRevisaoManual("media");
    setRevisaoEditandoId(null);
    setMensagemRevisao("");
  }

  function prepararEditarRevisao(revisao: Revisao) {
    setRevisaoEditandoId(revisao.id);
    setAssuntoRevisaoManual(revisao.assunto_id);
    setDataRevisaoManual(revisao.data_revisao);
    setPrioridadeRevisaoManual(revisao.prioridade || "media");
    setMensagemRevisao("Editando revisão selecionada. Altere os dados e clique em substituir revisão.");
  }

  async function salvarRevisaoManual() {
    if (!userId || !assuntoRevisaoManual || !dataRevisaoManual) {
      setMensagemRevisao("Selecione um assunto e uma data para a revisão.");
      return;
    }

    if (revisaoEditandoId) {
      await supabase
        .from("revisoes")
        .update({
          assunto_id: assuntoRevisaoManual,
          data_revisao: dataRevisaoManual,
          prioridade: prioridadeRevisaoManual,
          status: "pendente",
        })
        .eq("id", revisaoEditandoId);

      setMensagemRevisao("Revisão substituída com sucesso.");
    } else {
      await supabase.from("revisoes").insert({
        user_id: userId,
        assunto_id: assuntoRevisaoManual,
        data_revisao: dataRevisaoManual,
        prioridade: prioridadeRevisaoManual,
        status: "pendente",
      });

      setMensagemRevisao("Revisão adicionada ao calendário.");
    }

    setAssuntoRevisaoManual("");
    setDataRevisaoManual("");
    setPrioridadeRevisaoManual("media");
    setRevisaoEditandoId(null);
    carregarDados();
  }

  async function removerRevisao(id: string) {
    await supabase.from("revisoes").delete().eq("id", id);
    carregarDados();
  }

  async function perguntarIA() {
    if (!perguntaIA.trim()) return;

    setCarregandoIA(true);
    setRespostaIA("");

    try {
      const response = await fetch("/api/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pergunta: perguntaIA,
          contexto: {
            materias,
            assuntos,
            revisoes,
            erros,
            provas,
            provaAreas,
            desempenhoTotal,
            desempenhoPorArea,
            areasFracas,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setRespostaIA(data.error || "Não foi possível consultar a IA agora.");
      } else {
        setRespostaIA(data.resposta || "A IA não retornou uma resposta.");
      }
    } catch (error) {
      setRespostaIA("Erro ao conectar com a IA. Verifique a configuração da OPENAI_API_KEY na Vercel.");
    } finally {
      setCarregandoIA(false);
    }
  }

  async function criarErro() {
    if (!novoErro.trim() || !userId) return;

    await supabase.from("erros").insert({
      user_id: userId,
      titulo: novoErro.trim(),
      area: areaErro.trim() || "Geral",
      tentativas: 1,
      acerto: 0,
    });

    setNovoErro("");
    setAreaErro("");
    carregarDados();
  }

  function adicionarAreaTemporaria() {
    const questoes = Number(questoesArea);
    const acertos = Number(acertosArea);

    if (!areaProva || !questoes || acertos < 0 || acertos > questoes) return;

    setAreasTemporarias([
      ...areasTemporarias,
      {
        area: areaProva,
        questoes,
        acertos,
        erros: questoes - acertos,
      },
    ]);

    setQuestoesArea("");
    setAcertosArea("");
  }

  function removerAreaTemporaria(index: number) {
    setAreasTemporarias(areasTemporarias.filter((_, i) => i !== index));
  }

  async function criarProva() {
    if (!userId || !nomeProva.trim() || !localResidencia.trim()) return;

    const totalQ = Number(totalQuestoes);
    const totalA = Number(totalAcertos);

    if (!totalQ || totalA < 0 || totalA > totalQ) return;

    const { data: provaCriada, error } = await supabase
      .from("provas")
      .insert({
        user_id: userId,
        nome: nomeProva.trim(),
        local_residencia: localResidencia.trim(),
        data_prova: dataProva || new Date().toISOString().slice(0, 10),
        total_questoes: totalQ,
        total_acertos: totalA,
      })
      .select()
      .single();

    if (!error && provaCriada && areasTemporarias.length > 0) {
      const areasParaSalvar = areasTemporarias.map((item) => ({
        user_id: userId,
        prova_id: provaCriada.id,
        area: item.area,
        questoes: item.questoes,
        acertos: item.acertos,
        erros: item.erros,
      }));

      await supabase.from("prova_areas").insert(areasParaSalvar);
    }

    setNomeProva("");
    setLocalResidencia("");
    setDataProva("");
    setTotalQuestoes("");
    setTotalAcertos("");
    setAreasTemporarias([]);
    carregarDados();
  }

  const revisoesFiltradas = useMemo(() => {
    return revisoes.filter((item) => {
      const texto = `${item.assunto?.nome || ""} ${
        item.assunto?.materia?.nome || ""
      }`.toLowerCase();

      return texto.includes(busca.toLowerCase());
    });
  }, [busca, revisoes]);

  const pendentes = revisoes.filter((r) => r.status === "pendente").length;
  const concluidas = revisoes.filter((r) => r.status === "concluida").length;
  const taxaConclusao =
    revisoes.length > 0 ? Math.round((concluidas / revisoes.length) * 100) : 0;

  const desempenhoTotal = useMemo(() => {
    const totalQuestoes = provas.reduce((acc, p) => acc + Number(p.total_questoes || 0), 0);
    const totalAcertos = provas.reduce((acc, p) => acc + Number(p.total_acertos || 0), 0);
    const totalErros = totalQuestoes - totalAcertos;
    const percentual = totalQuestoes > 0 ? Math.round((totalAcertos / totalQuestoes) * 100) : 0;

    return { totalQuestoes, totalAcertos, totalErros, percentual };
  }, [provas]);

  const desempenhoPorArea = useMemo(() => {
    const mapa: Record<string, { area: string; questoes: number; acertos: number; erros: number; percentual: number }> = {};

    provaAreas.forEach((item) => {
      if (!mapa[item.area]) {
        mapa[item.area] = { area: item.area, questoes: 0, acertos: 0, erros: 0, percentual: 0 };
      }

      mapa[item.area].questoes += Number(item.questoes || 0);
      mapa[item.area].acertos += Number(item.acertos || 0);
      mapa[item.area].erros += Number(item.erros || 0);
    });

    return Object.values(mapa)
      .map((item) => ({
        ...item,
        percentual: item.questoes > 0 ? Math.round((item.acertos / item.questoes) * 100) : 0,
      }))
      .sort((a, b) => b.erros - a.erros);
  }, [provaAreas]);

  const areasFracas = useMemo(() => {
    return [...desempenhoPorArea]
      .sort((a, b) => {
        if (b.erros !== a.erros) return b.erros - a.erros;
        return a.percentual - b.percentual;
      })
      .slice(0, 5);
  }, [desempenhoPorArea]);

  const diasCalendario = useMemo(() => {
    const primeiroDia = new Date(anoCalendario, mesCalendario, 1);
    const ultimoDia = new Date(anoCalendario, mesCalendario + 1, 0);
    const dias = [];

    for (let i = 0; i < primeiroDia.getDay(); i++) {
      dias.push(null);
    }

    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const dataISO = `${anoCalendario}-${String(mesCalendario + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
      const revisoesDoDia = revisoes.filter((r) => r.data_revisao === dataISO);
      dias.push({ dia, dataISO, revisoes: revisoesDoDia });
    }

    return dias;
  }, [anoCalendario, mesCalendario, revisoes]);

  function mesAnterior() {
    if (mesCalendario === 0) {
      setMesCalendario(11);
      setAnoCalendario(anoCalendario - 1);
    } else {
      setMesCalendario(mesCalendario - 1);
    }
  }

  function proximoMes() {
    if (mesCalendario === 11) {
      setMesCalendario(0);
      setAnoCalendario(anoCalendario + 1);
    } else {
      setMesCalendario(mesCalendario + 1);
    }
  }

  if (!supabaseConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
        <div className="max-w-xl rounded-3xl bg-white p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-slate-900">
            MedReview publicado com sucesso
          </h1>
          <p className="mt-3 text-slate-600">
            O site já está pronto para deploy. Para ativar login, banco de dados,
            matérias e revisões, configure as variáveis do Supabase na Vercel.
          </p>
          <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
            <p className="font-semibold">Variáveis necessárias:</p>
            <p className="mt-2">NEXT_PUBLIC_SUPABASE_URL</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
          </div>
        </div>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-500">Carregando...</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 text-slate-900">
      <aside className="fixed left-0 top-0 hidden h-full w-72 border-r border-white/70 bg-white/75 p-6 backdrop-blur-xl lg:block">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">MedReview</h1>
            <p className="text-xs text-slate-500">Revisão inteligente</p>
          </div>
        </div>

        <nav className="mt-10 space-y-2">
          {[
            [LayoutDashboard, "Dashboard"],
            [CalendarDays, "Calendário"],
            [ClipboardList, "Provas"],
            [LibraryBig, "Matérias"],
            [XCircle, "Caderno de erros"],
            [Timer, "Pomodoro"],
            [LineChart, "Métricas"],
          ].map(([Icon, label], i) => {
            const MenuIcon = Icon as React.ElementType;

            return (
              <button
                key={String(label)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                  i === 0
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <MenuIcon className="h-5 w-5" />
                {label as string}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 rounded-3xl bg-slate-900 p-5 text-white">
          <Flame className="h-6 w-6 text-orange-300" />
          <h3 className="mt-3 font-semibold">Usuário conectado</h3>
          <p className="mt-1 break-all text-sm text-slate-300">{email}</p>
          <button
            onClick={sair}
            className="mt-4 flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      <main className="p-5 md:p-8 lg:ml-72">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Seu painel de estudos
            </h2>
            <p className="mt-2 text-slate-500">
              Agora com calendário de revisões, provas, gráficos e análise de áreas fracas.
            </p>
          </div>
        </header>

        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Target} titulo="Matérias" valor={String(materias.length)} detalhe="cadastradas" />
          <StatCard icon={CalendarDays} titulo="Revisões pendentes" valor={String(pendentes)} detalhe="para revisar" />
          <StatCard icon={CheckCircle2} titulo="Desempenho geral" valor={`${desempenhoTotal.percentual}%`} detalhe={`${desempenhoTotal.totalAcertos}/${desempenhoTotal.totalQuestoes} acertos`} />
          <StatCard icon={Trophy} titulo="Conclusão" valor={`${taxaConclusao}%`} detalhe="revisões concluídas" />
        </section>

        <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <div className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold">Calendário de revisões</h3>
                  <p className="text-sm text-slate-500">Veja suas revisões por data.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={mesAnterior} className="rounded-xl bg-slate-100 px-3 py-2 text-sm">Anterior</button>
                  <button onClick={proximoMes} className="rounded-xl bg-slate-100 px-3 py-2 text-sm">Próximo</button>
                </div>
              </div>

              <h4 className="mt-4 text-lg font-semibold capitalize">
                {new Date(anoCalendario, mesCalendario).toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </h4>

              <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-7 gap-2">
                {diasCalendario.map((item, index) => (
                  <div key={index} className="min-h-24 rounded-2xl bg-slate-50 p-2 text-sm">
                    {item && (
                      <>
                        <div className="font-semibold">{item.dia}</div>
                        <div className="mt-1 space-y-1">
                          {item.revisoes.slice(0, 3).map((r) => (
                            <div
                              key={r.id}
                              className={`truncate rounded-lg px-2 py-1 text-[10px] ${
                                r.status === "concluida"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {r.assunto?.nome || "Revisão"}
                            </div>
                          ))}
                          {item.revisoes.length > 3 && (
                            <div className="text-[10px] text-slate-500">+{item.revisoes.length - 3}</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-xl font-bold">Pomodoro</h3>
              <p className="text-sm text-slate-500">Sessão focada de estudo.</p>

              <div className="mx-auto mt-6 flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 shadow-xl shadow-blue-100">
                <div className="text-center text-white">
                  <Clock className="mx-auto mb-2 h-8 w-8" />
                  <div className="text-5xl font-bold">{pomodoro}:00</div>
                  <p className="text-sm opacity-90">minutos</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2">
                {[15, 25, 50].map((min) => (
                  <button
                    key={min}
                    onClick={() => setPomodoro(min)}
                    className={`rounded-2xl py-2 text-sm ${
                      pomodoro === min ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {min} min
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <Card>
            <div className="p-6">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <CalendarDays className="h-5 w-5" />
                Gerenciar revisões do calendário
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Adicione, remova ou substitua revisões manualmente.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <select
                  value={assuntoRevisaoManual}
                  onChange={(e) => setAssuntoRevisaoManual(e.target.value)}
                  className="rounded-2xl bg-slate-100 px-4 py-3 outline-none"
                >
                  <option value="">Selecione o assunto</option>
                  {assuntos.map((assunto) => (
                    <option key={assunto.id} value={assunto.id}>
                      {assunto.nome}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={dataRevisaoManual}
                  onChange={(e) => setDataRevisaoManual(e.target.value)}
                  className="rounded-2xl bg-slate-100 px-4 py-3 outline-none"
                />

                <select
                  value={prioridadeRevisaoManual}
                  onChange={(e) => setPrioridadeRevisaoManual(e.target.value)}
                  className="rounded-2xl bg-slate-100 px-4 py-3 outline-none"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>

              <div className="mt-4 flex flex-col gap-2 md:flex-row">
                <button
                  onClick={salvarRevisaoManual}
                  className="rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white"
                >
                  {revisaoEditandoId ? "Substituir revisão" : "Adicionar revisão"}
                </button>

                {revisaoEditandoId && (
                  <button
                    onClick={limparFormularioRevisao}
                    className="rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-700"
                  >
                    Cancelar edição
                  </button>
                )}
              </div>

              {mensagemRevisao && (
                <p className="mt-3 rounded-2xl bg-blue-50 p-3 text-sm text-blue-700">
                  {mensagemRevisao}
                </p>
              )}

              <div className="mt-5 max-h-96 space-y-3 overflow-y-auto pr-1">
                {revisoes.slice(0, 20).map((revisao) => (
                  <div key={revisao.id} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold">{revisao.assunto?.nome || "Revisão"}</h4>
                        <p className="text-sm text-slate-500">
                          {revisao.assunto?.materia?.nome || "Matéria"} • {formatarData(revisao.data_revisao)} • {revisao.prioridade}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => prepararEditarRevisao(revisao)}
                          className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                          title="Substituir revisão"
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removerRevisao(revisao.id)}
                          className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
                          title="Remover revisão"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <Bot className="h-5 w-5" />
                IA de estudos
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Peça uma análise do seu desempenho, plano de estudo ou prioridade por área.
              </p>

              <textarea
                value={perguntaIA}
                onChange={(e) => setPerguntaIA(e.target.value)}
                placeholder="Ex: Com base nas minhas provas, quais áreas devo estudar esta semana?"
                className="mt-4 min-h-32 w-full rounded-2xl bg-slate-100 px-4 py-3 outline-none"
              />

              <button
                onClick={perguntarIA}
                disabled={carregandoIA}
                className="mt-3 w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
              >
                {carregandoIA ? "Analisando..." : "Perguntar para IA"}
              </button>

              <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap">
                {respostaIA || "A resposta da IA aparecerá aqui. Para funcionar, configure OPENAI_API_KEY na Vercel."}
              </div>
            </div>
          </Card>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <Card>
            <div className="p-6">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <ClipboardList className="h-5 w-5" />
                Cadastrar prova
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <input value={nomeProva} onChange={(e) => setNomeProva(e.target.value)} placeholder="Nome da prova. Ex: ENARE 2024" className="rounded-2xl bg-slate-100 px-4 py-3 outline-none" />
                <input value={localResidencia} onChange={(e) => setLocalResidencia(e.target.value)} placeholder="Local da residência. Ex: USP, ENARE, UNICAMP" className="rounded-2xl bg-slate-100 px-4 py-3 outline-none" />
                <input value={dataProva} onChange={(e) => setDataProva(e.target.value)} type="date" className="rounded-2xl bg-slate-100 px-4 py-3 outline-none" />
                <input value={totalQuestoes} onChange={(e) => setTotalQuestoes(e.target.value)} type="number" placeholder="Total de questões" className="rounded-2xl bg-slate-100 px-4 py-3 outline-none" />
                <input value={totalAcertos} onChange={(e) => setTotalAcertos(e.target.value)} type="number" placeholder="Total de acertos" className="rounded-2xl bg-slate-100 px-4 py-3 outline-none md:col-span-2" />
              </div>

              <div className="mt-5 rounded-3xl bg-slate-50 p-4">
                <h4 className="font-semibold">Separar acertos e erros por área</h4>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
                  <select value={areaProva} onChange={(e) => setAreaProva(e.target.value)} className="rounded-2xl bg-white px-4 py-3 outline-none">
                    {areasMedicina.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                  <input value={questoesArea} onChange={(e) => setQuestoesArea(e.target.value)} type="number" placeholder="Questões" className="rounded-2xl bg-white px-4 py-3 outline-none" />
                  <input value={acertosArea} onChange={(e) => setAcertosArea(e.target.value)} type="number" placeholder="Acertos" className="rounded-2xl bg-white px-4 py-3 outline-none" />
                  <button onClick={adicionarAreaTemporaria} className="rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white">Adicionar</button>
                </div>

                <div className="mt-3 space-y-2">
                  {areasTemporarias.map((item, index) => (
                    <div key={`${item.area}-${index}`} className="flex items-center justify-between rounded-2xl bg-white p-3 text-sm">
                      <span>{item.area}: {item.acertos}/{item.questoes} acertos • {item.erros} erros</span>
                      <button onClick={() => removerAreaTemporaria(index)} className="text-red-600">Remover</button>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={criarProva} className="mt-4 w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white">
                Salvar prova
              </button>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="flex items-center gap-2 text-xl font-bold">
                <BarChart3 className="h-5 w-5" />
                Desempenho nas provas
              </h3>

              <div className="mt-5 rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Desempenho total</p>
                <div className="mt-2 text-3xl font-bold">{desempenhoTotal.percentual}%</div>
                <p className="text-sm text-slate-500">
                  {desempenhoTotal.totalAcertos} acertos • {desempenhoTotal.totalErros} erros • {desempenhoTotal.totalQuestoes} questões
                </p>
                <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${desempenhoTotal.percentual}%` }} />
                </div>
              </div>

              <h4 className="mt-5 font-semibold">Áreas que mais precisam de estudo</h4>
              <div className="mt-3 space-y-3">
                {areasFracas.length === 0 && (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                    Cadastre uma prova para gerar a análise.
                  </p>
                )}

                {areasFracas.map((item, index) => (
                  <div key={item.area} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold">{index + 1}. {item.area}</h5>
                      <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
                        {item.erros} erros
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.acertos}/{item.questoes} acertos • {item.percentual}% de aproveitamento
                    </p>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${item.percentual}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-bold">Histórico de provas</h3>
              <div className="mt-5 space-y-3">
                {provas.map((prova) => {
                  const percentual = prova.total_questoes > 0 ? Math.round((prova.total_acertos / prova.total_questoes) * 100) : 0;

                  return (
                    <div key={prova.id} className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{prova.nome}</h4>
                          <p className="text-sm text-slate-500">
                            {prova.local_residencia} • {formatarData(prova.data_prova)}
                          </p>
                        </div>
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                          {percentual}%
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {prova.total_acertos}/{prova.total_questoes} acertos
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-xl font-bold">Gráfico por área</h3>
              <div className="mt-5 space-y-4">
                {desempenhoPorArea.map((item) => (
                  <div key={item.area}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">{item.area}</span>
                      <span className="text-slate-500">{item.percentual}% • {item.erros} erros</span>
                    </div>
                    <div className="h-4 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${item.percentual}%` }} />
                    </div>
                  </div>
                ))}

                {desempenhoPorArea.length === 0 && (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                    Nenhum dado de área cadastrado ainda.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-bold">Cadastrar matéria</h3>
              <div className="mt-4 flex gap-2">
                <input value={novaMateria} onChange={(e) => setNovaMateria(e.target.value)} placeholder="Ex: Clínica Médica" className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 outline-none" />
                <button onClick={criarMateria} className="rounded-2xl bg-blue-600 px-4 py-3 text-white">
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {materias.map((m) => {
                  const qtdAssuntos = assuntos.filter((a) => a.materia_id === m.id).length;

                  return (
                    <div key={m.id} className="rounded-3xl bg-slate-50 p-4">
                      <h4 className="font-semibold">{m.nome}</h4>
                      <p className="text-sm text-slate-500">{qtdAssuntos} assuntos cadastrados</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-xl font-bold">Cadastrar assunto</h3>

              <div className="mt-4 space-y-3">
                <select value={materiaSelecionada} onChange={(e) => setMateriaSelecionada(e.target.value)} className="w-full rounded-2xl bg-slate-100 px-4 py-3 outline-none">
                  <option value="">Selecione uma matéria</option>
                  {materias.map((m) => (
                    <option key={m.id} value={m.id}>{m.nome}</option>
                  ))}
                </select>

                <input value={novoAssunto} onChange={(e) => setNovoAssunto(e.target.value)} placeholder="Ex: Hipertermia maligna" className="w-full rounded-2xl bg-slate-100 px-4 py-3 outline-none" />

                <button onClick={criarAssunto} className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white">
                  Criar assunto e revisões
                </button>
              </div>
            </div>
          </Card>
        </section>

        <section className="mt-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Caderno de erros</h3>
                  <p className="text-sm text-slate-500">Registre temas que precisam de reforço.</p>
                </div>
                <ListChecks className="h-6 w-6 text-slate-500" />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <input value={novoErro} onChange={(e) => setNovoErro(e.target.value)} placeholder="Erro ou tema" className="rounded-2xl bg-slate-100 px-4 py-3 outline-none" />
                <input value={areaErro} onChange={(e) => setAreaErro(e.target.value)} placeholder="Área" className="rounded-2xl bg-slate-100 px-4 py-3 outline-none" />
                <button onClick={criarErro} className="rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white">
                  Adicionar erro
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                {erros.map((erro) => (
                  <div key={erro.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
                    <div>
                      <h4 className="font-semibold">{erro.titulo}</h4>
                      <p className="text-sm text-slate-500">
                        {erro.area} • {erro.tentativas} tentativa(s)
                      </p>
                    </div>
                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
                      {erro.acerto}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
