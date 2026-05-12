import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "IA ainda não configurada. Adicione OPENAI_API_KEY nas variáveis de ambiente da Vercel.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const pergunta = body?.pergunta || "";
    const contexto = body?.contexto || {};

    if (!pergunta.trim()) {
      return NextResponse.json(
        { error: "Digite uma pergunta para a IA." },
        { status: 400 }
      );
    }

    const prompt = `
Você é um mentor de estudos para residência médica.
Analise os dados abaixo e responda em português do Brasil.
Seja prático, direto e priorize ações de estudo.

Dados do aluno em JSON:
${JSON.stringify(contexto, null, 2)}

Pergunta do aluno:
${pergunta}

Responda com:
1. Diagnóstico rápido do desempenho
2. Áreas prioritárias
3. Plano objetivo de estudo
4. Sugestão de revisões
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente especialista em preparação para residência médica e análise de desempenho educacional.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "Erro ao consultar a IA." },
        { status: response.status }
      );
    }

    const resposta = data?.choices?.[0]?.message?.content || "Sem resposta.";

    return NextResponse.json({ resposta });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno ao processar a IA." },
      { status: 500 }
    );
  }
}
