import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { matchProjects, type MatchResult } from "@/lib/match.functions";
import { projects } from "@/lib/projects";

export function ProjectMatcher() {
  const run = useServerFn(matchProjects);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<MatchResult[] | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true); setError(null); setResults(null);
    try {
      const r = await run({ data: { text } });
      if (r.error) setError(r.error); else setResults(r.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Coś poszło nie tak.");
    } finally { setLoading(false); }
  }

  return (
    <section className="mx-auto mt-10 max-w-5xl rounded-xl border border-border bg-card p-5 shadow-soft">
      <h2 className="font-display text-2xl text-card-foreground">Znajdź projekty do pobrania</h2>
      <p className="mt-1 text-sm text-muted-foreground">Opisz projekt własnymi słowami albo wklej listę nazw (każda w nowej linii).</p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} aria-label="Opis lub lista projektów"
          placeholder={"np. strona o przeszczepie włosów\nPDF translator\nklinika beauty"}
          className="w-full rounded-md border border-input bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        <button type="submit" disabled={loading || !text.trim()}
          className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
          {loading ? "Dopasowuję…" : "Dopasuj projekty"}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {results && (
        <ul className="mt-4 divide-y divide-border">
          {results.length === 0 && <li className="py-2 text-sm text-muted-foreground">Nic nie znaleziono.</li>}
          {results.map((r, i) => {
            const p = projects.find((x) => x.id === r.projectId);
            return (
              <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <p className="text-muted-foreground">„{r.query}”</p>
                  <p className="font-medium text-card-foreground">{p ? p.name : "Brak dopasowania"}</p>
                  {r.note && <p className="text-xs text-muted-foreground">{r.note}</p>}
                </div>
                {p?.zip ? (
                  <a href={p.zip.url} download={p.zip.name} className="rounded-md border border-border px-3 py-1.5 text-foreground hover:bg-accent">Pobierz</a>
                ) : (
                  <span className="text-xs text-muted-foreground">{p ? "Brak paczki do pobrania" : "Nie do pobrania"}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
