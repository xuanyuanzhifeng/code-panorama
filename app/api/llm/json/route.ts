import { NextResponse } from "next/server";
import { extractJsonFromText, getLlmClient, llmBaseUrl, llmModel } from "@/lib/openaiCompat";
import { createAiCallId, logAiError, logAiRequest, logAiResponse } from "@/lib/aiCallLogger";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const callId = createAiCallId();
  try {
    const { prompt, model, temperature } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
    }

    const resolvedModel = model || llmModel;
    const requestBody = {
      model: resolvedModel,
      messages: [
        {
          role: "system",
          content: "You are a precise JSON generator. Return only valid JSON with no markdown fences.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      ...(typeof temperature === "number" ? { temperature } : {}),
    };

    logAiRequest({
      callId,
      providerBaseUrl: llmBaseUrl,
      requestBody,
    });

    const client = getLlmClient();
    const response = await client.chat.completions.create(requestBody as any);

    const text = response.choices?.[0]?.message?.content || "";
    const data = extractJsonFromText(typeof text === "string" ? text : String(text));

    logAiResponse({
      callId,
      providerBaseUrl: llmBaseUrl,
      response: {
        id: response.id,
        model: response.model,
        usage: response.usage ?? null,
        choices: response.choices?.map((choice) => ({
          index: choice.index,
          finish_reason: choice.finish_reason,
          message: choice.message,
        })),
      },
      parsedData: data,
    });

    return NextResponse.json({
      data,
      model: response.model,
      providerBaseUrl: llmBaseUrl,
      usage: response.usage ?? null,
    });
  } catch (error: any) {
    logAiError({
      callId,
      providerBaseUrl: llmBaseUrl,
      error: {
        message: error?.message || "LLM request failed",
        status: error?.status || error?.response?.status || null,
        stack: error?.stack || null,
        response: error?.response?.data || null,
      },
    });
    return NextResponse.json(
      { error: error?.message || "LLM request failed" },
      { status: error?.status || 500 },
    );
  }
}
