import { useEffect, useState } from "react";
import { Github, Star, ExternalLink, GitBranch, Code2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fetchRepos } from "@/lib/api";

export default function GithubPage() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepos()
      .then(setRepos)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div data-testid="github-page">
      <section className="hero-scan border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary mb-4 flex items-center gap-2">
            <Github className="w-4 h-4" /> // /git/
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] max-w-3xl">
            Source code is the <span className="text-primary">truest</span> documentation.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-5 max-w-2xl">
            Geekverse is an open project (or will be once we hit v1). Below is the project's repo info plus a
            curated list of GitHub repos every computer geek should already have starred.
          </p>
        </div>
      </section>

      {/* PROJECT INFO */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-secondary border border-border">
                <Github className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-display text-lg font-bold">geekverse / web</div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  the project itself
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A community-curated directory of tools for computer geeks. Built with FastAPI, MongoDB and React.
              Every tool was added by a real human who actually uses it.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <Stat icon={<Star className="w-3.5 h-3.5" />} label="Stars" value="—" />
              <Stat icon={<GitBranch className="w-3.5 h-3.5" />} label="Forks" value="—" />
              <Stat icon={<Code2 className="w-3.5 h-3.5" />} label="Lang" value="JS/Py" />
            </div>
            <div className="mt-6 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              repository link coming soon
            </div>
          </div>

          <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card">
            <div className="font-mono text-[11px] uppercase tracking-wider text-primary mb-3">
              # readme.md
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">
              How to contribute a tool
            </h2>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Pick a category (or propose a new one).</li>
              <li>Submit name, description, alt-uses, download URL and platforms.</li>
              <li>Mention if it's open-source and link the homepage.</li>
              <li>Optional: pick a lucide-react icon name to flex on the card.</li>
            </ol>
            <pre className="mt-5 p-4 rounded-md bg-secondary/60 font-mono text-xs overflow-x-auto">
{`POST /api/tools
{
  "name": "Your Cool Tool",
  "category_slug": "dev",
  "description": "...",
  "alternative_uses": ["..."],
  "download_url": "https://...",
  "platforms": ["Windows", "Linux"]
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* CURATED REPOS */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl tracking-tight">
              Curated repos every geek should star
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Hand-picked, not algorithm-picked.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="font-mono text-sm text-muted-foreground">▌ fetching repos…</div>
        ) : (
          <div
            data-testid="repo-grid"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {repos.map((r) => (
              <a
                key={r.full_name}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`repo-${r.name}`}
                className="tool-card block animate-fade-up"
                style={{ "--cat-color": "hsl(var(--accent))" }}
              >
                <span className="cat-strip" />
                <div className="body p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 font-mono text-xs text-primary">
                      <Github className="w-4 h-4" />
                      <span className="truncate">{r.full_name}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-1.5">{r.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {r.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      <Star className="w-3 h-3 mr-1" /> {r.stars}
                    </Badge>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      <Code2 className="w-3 h-3 mr-1" /> {r.language}
                    </Badge>
                    {r.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[10px] uppercase text-muted-foreground"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 p-2 text-center">
      <div className="flex items-center justify-center gap-1 text-primary mb-0.5">
        {icon}
        <span className="font-mono text-[10px] uppercase">{label}</span>
      </div>
      <div className="font-display font-bold text-sm">{value}</div>
    </div>
  );
}
