import * as Lucide from "lucide-react";
import { TrendingUp, Star } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ToolCard({ tool, category, onClick }) {
  const Icon = Lucide[tool.icon] || Lucide.Wrench;
  const color = category?.color || "#a855f7";
  const t = useTheme();

  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`tool-card-${tool.id}`}
      className="tool-card text-left animate-fade-up"
      style={{ "--cat-color": color }}
    >
      {t.showCategoryStrip && <span className="cat-strip" />}
      <div className="body p-5 relative">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center"
            style={{
              background: `${color}26`,
              border: `1px solid ${color}55`,
              color,
            }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <span className="cat-chip" style={{ "--cat-color": color }}>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: color }}
            />
            {category?.name || tool.category_slug}
          </span>
        </div>

        <h3 className="font-display font-bold text-lg leading-tight mb-1">
          {tool.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {tool.description}
        </p>

        {t.showAltUsesPreview && tool.alternative_uses?.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {tool.alternative_uses.slice(0, 2).map((u, i) => (
              <span
                key={i}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary/70 text-muted-foreground"
              >
                {u}
              </span>
            ))}
          </div>
        )}

        {(t.showPopularity || t.showClickCount) && (
          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {t.showPopularity ? (
              <span className="flex items-center gap-1.5" data-testid={`pop-${tool.id}`}>
                <Star className="w-3 h-3" style={{ color }} />
                {tool.popularity}
              </span>
            ) : <span />}
            {t.showClickCount && (
              <span className="flex items-center gap-1.5" data-testid={`clicks-${tool.id}`}>
                <TrendingUp className="w-3 h-3" style={{ color }} />
                {tool.click_count} clicks
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
