export async function POST(req: Request) {
  try {
    const body = await req.json();

    const prompt = body.prompt || body.pergunta || "";

    if (!prompt) {
      return Response.json(
        { error: "Nenhuma pergunta foi enviada para a IA." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "GEMINI_API_KEY não configurada na Vercel." },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        {
          error:
            data?.error?.message ||
            "Erro ao chamar Gemini. Verifique sua chave GEMINI_API_KEY.",
        },
        { status: 500 }
      );
    }

    const texto =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "A IA não retornou resposta.";

    return Response.json({
      response: texto,
      resposta: texto,
    });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Erro interno na rota da IA." },
      { status: 500 }
    );
  }
}
