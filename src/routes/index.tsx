import { createFileRoute } from "@tanstack/react-router";
import { projects } from "@/lib/projects";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Moje projekty — Medical Lasers" },
      { name: "description", content: "Lista wszystkich projektów Medical Lasers w jednym miejscu." },
      { property: "og:title", content: "Moje projekty — Medical Lasers" },
      { property: "og:description", content: "Lista wszystkich projektów Medical Lasers w jednym miejscu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function formatSize(bytes: number) {
  if (bytes < 800 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} kB`;
  const mb = bytes / (1024 * 1024);
  return `${mb >= 10 ? Math.round(mb) : mb.toFixed(1).replace(".", ",")} MB`;
}

function Index() {
  return (
    <main className="min-h-screen bg-background px-5 py-14 md:px-10">
      <header className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.2em] text-primary">Medical Lasers</p>
        <h1 className="mt-3 font-display text-5xl text-foreground md:text-6xl">Moje projekty</h1>
        <p className="mt-4 text-muted-foreground">{projects.length} projektów w jednym miejscu.</p>
      </header>
      <ul className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <li key={p.id} className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5">
            <span className="font-display text-sm text-primary">{String(i + 1).padStart(2, "0")}</span>
            <h2 className="mt-1 text-lg font-semibold text-card-foreground">{p.name}</h2>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{p.desc}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <a href={`https://lovable.dev/projects/${p.id}`} target="_blank" rel="noreferrer" className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:opacity-90">Otwórz projekt</a>
              {p.zip && (
                <a href={p.zip.url} download={p.zip.name} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-foreground hover:bg-accent">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                    <path d="M12 3v12" />
                    <path d="m7 11 5 5 5-5" />
                    <path d="M5 21h14" />
                  </svg>
                  Pobierz
                  <span className="text-xs text-muted-foreground">{formatSize(p.zip.size)}</span>
                </a>
              )}
              {p.url && (
                <a href={p.url} target="_blank" rel="noreferrer" className="rounded-md border border-border px-3 py-1.5 text-foreground hover:bg-accent">Strona na żywo</a>
              )}
            </div>
            {!p.zip && <p className="mt-3 text-xs text-muted-foreground">Brak paczki do pobrania.</p>}
          </li>
        ))}
      </ul>
    </main>
  );
}
