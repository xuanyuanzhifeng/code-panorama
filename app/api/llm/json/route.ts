import { NextResponse } from "next/server";
import { extractJsonFromText, getLlmClient, llmApiType, llmBaseUrl, llmModel } from "@/lib/openaiCompat";
import { createAiCallId, logAiError, logAiRequest, logAiResponse } from "@/lib/aiCallLogger";
import { extractTextFromLlmResponse, normalizeApiType, normalizeBaseUrl } from "@/lib/llmProtocol";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const callId = createAiCallId();
  try {
    const { prompt, model, temperature, baseUrl, apiKey, apiType } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
    }

    const resolvedApiType = normalizeApiType(apiType || llmApiType);
    const resolvedModel = model || llmModel;
    const resolvedBaseUrl = normalizeBaseUrl(String(baseUrl || llmBaseUrl), resolvedApiType);
    const promptMessages = [
      {
        role: "system",
        content: "You are a precise JSON generator. Return only valid JSON with no markdown fences.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];
    const requestBody = resolvedApiType === "responses"
      ? {
          model: resolvedModel,
          input: promptMessages,
          ...(typeof temperature === "number" ? { temperature } : {}),
        }
      : {
          model: resolvedModel,
          messages: promptMessages,
          ...(typeof temperature === "number" ? { temperature } : {}),
        };

    logAiRequest({
      callId,
      apiType: resolvedApiType,
      providerBaseUrl: resolvedBaseUrl,
      requestBody,
    });

    const client = getLlmClient({ baseUrl: resolvedBaseUrl, apiKey: typeof apiKey === "string" ? apiKey : undefined });
    const response = resolvedApiType === "responses"
      ? await client.responses.create(requestBody as any)
      : await client.chat.completions.create(requestBody as any);

    const text = extractTextFromLlmResponse(resolvedApiType, response);
    const data = extractJsonFromText(typeof text === "string" ? text : String(text));

    logAiResponse({
      callId,
      apiType: resolvedApiType,
      providerBaseUrl: resolvedBaseUrl,
      response,
      parsedData: data,
    });

    return NextResponse.json({
      data,
      model: response.model,
      apiType: resolvedApiType,
      providerBaseUrl: resolvedBaseUrl,
      usage: response.usage ?? null,
    });
  } catch (error: any) {
    const resolvedApiType = normalizeApiType((error as any)?.apiType || llmApiType);
    logAiError({
      callId,
      apiType: resolvedApiType,
      providerBaseUrl: normalizeBaseUrl(String((error as any)?.providerBaseUrl || llmBaseUrl), resolvedApiType),
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
