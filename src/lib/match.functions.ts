import { createServerFn } from "@tanstack/react-start";
import { projects } from "./projects";

export type MatchResult = { query: string; projectId: string | null; note: string };

export const matchProjects = createServerFn({ method: "POST" })
  .inputValidator((input: { text: string }) => {
    const text = String(input?.text ?? "").trim().slice(0, 4000);
    if (!text) throw new Error("Wpisz nazwę lub listę projektów.");
    return { text };
  })
  .handler(async ({ data }): Promise<{ results: MatchResult[]; error?: string }> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { results: [], error: "Brak konfiguracji AI." };
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText } = await import("ai");
    const openai = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    const catalog = projects.map((p) => `${p.id} | ${p.name} | ${p.desc.trim()}`).join("\n");
    try {
      const result = streamText({
        model: openai.responses("openai/gpt-6-astra"),
        maxRetries: 0,
        system:
          "Dopasowujesz zapytania użytkownika do projektów z katalogu (id | nazwa | opis). Każda linia lub pozycja tekstu użytkownika to osobne zapytanie; opis słowny może dotyczyć kilku projektów — wtedy zwróć osobny wpis dla każdego pasującego. Zwróć WYŁĄCZNIE JSON: {\"results\":[{\"query\":string,\"projectId\":string|null,\"note\":string}]}. projectId musi być dokładnym id z katalogu albo null, gdy nic nie pasuje. note: krótkie uzasadnienie po polsku.\n\nKatalog:\n" + catalog,
        prompt: data.text,
        providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", store: false } },
      });
      const text = await result.text;
      const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
      const ids = new Set(projects.map((p) => p.id));
      const results: MatchResult[] = (json.results ?? []).map((r: MatchResult) => ({
        query: String(r.query ?? ""),
        projectId: r.projectId && ids.has(r.projectId) ? r.projectId : null,
        note: String(r.note ?? ""),
      }));
      return { results };
    } catch (e: unknown) {
      const status = (e as { statusCode?: number }).statusCode;
      console.error("matchProjects", e);
      if (status === 429) return { results: [], error: "Za dużo zapytań — spróbuj za chwilę." };
      if (status === 402 || status === 403) return { results: [], error: "Brak środków lub dostępu do AI w tym obszarze roboczym." };
      return { results: [], error: "Nie udało się dopasować projektów. Spróbuj ponownie." };
    }
  });
