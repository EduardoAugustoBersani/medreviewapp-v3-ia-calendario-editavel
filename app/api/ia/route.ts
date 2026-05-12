import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const prompt = body.prompt;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(prompt);

    const response = result.response.text();

    return Response.json({
      response,
    });
  } catch (error: any) {
    return Response.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
