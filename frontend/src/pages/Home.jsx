import { useEffect, useMemo, useState, useRef } from "react";
import { Search, ArrowUpDown, Sparkles, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ToolCard from "@/components/ToolCard";
import ToolDetailModal from "@/components/ToolDetailModal";
import { fetchCategories, fetchTools, fetchStats } from "@/lib/api";
import { useTheme, THEMES } from "@/context/ThemeContext";

const KONAMI = [
  "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
  "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
  "b","a",
];

export default function Home() {
  const t = useTheme();
  const [categories, setCategories] = useState([]);
  const [tools, setTools] = useState([]);
  const [stats, setStats] = useState({ tools: 0, categories: 0, total_clicks: 0 });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(t.defaultCategory || "all");
  const [sort, setSort] = useState(t.defaultSort || "relevance");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const konamiBuf = useRef([]);

  // Load categories + stats once
  useEffect(() => {
    Promise.all([fetchCategories(), fetchStats()])
      .then(([cats, s]) => {
        setCategories(cats);
        setStats(s);
      })
      .catch(() => {});
  }, []);

  // Load tools whenever filters change (debounce search)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      fetchTools({ search: search || undefined, category, sort })
        .then((data) => setTools(data))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(timer);
  }, [search, category, sort]);

  // Konami easter egg
  useEffect(() => {
    if (!t.easterEggs) return;
    const onKey = (e) => {
      const buf = konamiBuf.current;
      buf.push(e.key);
      if (buf.length > KONAMI.length) buf.shift();
      if (buf.length === KONAMI.length && buf.every((k, i) => k === KONAMI[i])) {
        const next = THEMES[Math.floor(Math.random() * THEMES.length)];
        t.setTheme(next);
        toast.success(`▌ KONAMI ACTIVATED — theme: ${next}`, {
          description: "you found the cheat code, geek.",
        });
        konamiBuf.current = [];
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [t.easterEggs, t]);

  const catMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.slug, c])),
    [categories],
  );

  const refreshAfterClick = async () => {
    const updated = await fetchTools({
      search: search || undefined,
      category,
      sort,
    });
    setTools(updated);
    fetchStats().then(setStats).catch(() => {});
  };

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="hero-scan border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-14">
          {t.showHeroStats && (
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary mb-4">
              // ultimate toolbox · {stats.tools} entries · {stats.categories} cats · {stats.total_clicks} clicks
            </div>
          )}
          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] max-w-3xl">
            Every tool a computer geek <br />
            <span className="text-primary">should already have</span>.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-5 max-w-2xl">
            Curated, color-coded, opinionated. From kernel debuggers to the most
            spectacularly useless web toys ever made — sorted by relevance, popularity, or pure chaos.
          </p>

          {/* Search + Sort */}
          <div className="mt-8 grid sm:grid-cols-[1fr_auto] gap-3 max-w-3xl">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                data-testid="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tools, descriptions, alt-uses…"
                className="pl-9 h-11 font-mono text-sm"
              />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger
                data-testid="sort-select"
                className="h-11 w-full sm:w-[180px] font-mono text-sm"
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance" data-testid="sort-relevance">Relevance</SelectItem>
                <SelectItem value="popularity" data-testid="sort-popularity">Popularity</SelectItem>
                <SelectItem value="name" data-testid="sort-name">Name (A-Z)</SelectItem>
                <SelectItem value="newest" data-testid="sort-newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* CATEGORY CHIPS */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap gap-2 items-center">
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mr-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> categories:
          </span>
          <button
            type="button"
            data-testid="cat-all"
            onClick={() => setCategory("all")}
            className={`cat-chip cursor-pointer ${
              category === "all" ? "ring-2 ring-primary" : ""
            }`}
            style={{ "--cat-color": "hsl(var(--accent))" }}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              data-testid={`cat-${c.slug}`}
              onClick={() => setCategory(c.slug)}
              className={`cat-chip cursor-pointer ${
                category === c.slug ? "ring-2 ring-offset-2 ring-offset-background" : ""
              }`}
              style={{ "--cat-color": c.color }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: c.color }}
              />
              {c.name}
            </button>
          ))}
        </div>
      </section>

      {/* GRID */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        {loading && tools.length === 0 ? (
          <div
            data-testid="tools-loading"
            className="font-mono text-sm text-muted-foreground"
          >
            ▌ loading tools…
          </div>
        ) : tools.length === 0 ? (
          <div
            data-testid="tools-empty"
            className="font-mono text-sm text-muted-foreground py-20 text-center"
          >
            <Sparkles className="w-6 h-6 mx-auto mb-3 text-primary" />
            no tools match your filters. try clearing search or pick a different category.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div className="font-mono text-xs text-muted-foreground">
                showing <Badge variant="secondary" className="mx-1 font-mono">{tools.length}</Badge>
                tool{tools.length === 1 ? "" : "s"}
              </div>
            </div>

            <div
              data-testid="tools-grid"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {tools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  category={catMap[tool.category_slug]}
                  onClick={() => setSelected(tool)}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <ToolDetailModal
        tool={selected}
        category={selected ? catMap[selected.category_slug] : null}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        onClicked={refreshAfterClick}
      />
    </div>
  );
}
