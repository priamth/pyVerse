import * as Lucide from "lucide-react";
import { Download, ExternalLink, Star, TrendingUp, Cpu } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trackClick } from "@/lib/api";

export default function ToolDetailModal({ tool, category, open, onOpenChange, onClicked }) {
  if (!tool) return null;
  const Icon = Lucide[tool.icon] || Lucide.Wrench;
  const color = category?.color || "#a855f7";

  const handleDownload = async () => {
    try {
      await trackClick(tool.id);
      onClicked && onClicked(tool.id);
    } catch (e) {
      // non-blocking
    }
    window.open(tool.download_url, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid={`tool-modal-${tool.id}`}
        className="max-w-2xl border-border p-0 overflow-hidden"
      >
        <div
          className="px-6 py-5 border-b border-border relative"
          style={{
            background: `linear-gradient(135deg, ${color}22, transparent 70%)`,
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: `${color}33`,
                border: `1px solid ${color}66`,
                color,
              }}
            >
              <Icon className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogHeader className="text-left space-y-1">
                <DialogTitle className="font-display text-2xl">
                  {tool.name}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  {category?.name || tool.category_slug} tool details
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="cat-chip" style={{ "--cat-color": color }}>
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: color }}
                  />
                  {category?.name || tool.category_slug}
                </span>
                {tool.is_open_source && (
                  <Badge variant="outline" className="font-mono text-[10px] uppercase">
                    Open Source
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
              What it does
            </div>
            <p className="text-sm leading-relaxed">{tool.description}</p>
          </div>

          {tool.alternative_uses?.length > 0 && (
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                Alternative uses
              </div>
              <ul className="grid sm:grid-cols-2 gap-2">
                {tool.alternative_uses.map((u, i) => (
                  <li
                    key={i}
                    data-testid={`alt-use-${i}`}
                    className="text-sm flex items-start gap-2 p-2 rounded-md bg-secondary/60"
                  >
                    <span
                      className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: color }}
                    />
                    {u}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tool.platforms?.length > 0 && (
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                Platforms
              </div>
              <div className="flex flex-wrap gap-2">
                {tool.platforms.map((p) => (
                  <Badge key={p} variant="secondary" className="font-mono text-[11px]">
                    <Cpu className="w-3 h-3 mr-1" /> {p}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground border-t border-border pt-4">
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" style={{ color }} /> Relevance {tool.popularity}
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" style={{ color }} /> {tool.click_count} downloads
            </span>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex flex-wrap gap-3 bg-secondary/40">
          <Button
            type="button"
            onClick={handleDownload}
            data-testid={`download-${tool.id}`}
            className="btn-geek"
            style={{ background: color }}
          >
            <Download className="w-4 h-4 mr-2" /> Download
          </Button>
          {tool.homepage_url && (
            <a
              href={tool.homepage_url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`homepage-${tool.id}`}
              className="inline-flex items-center px-4 py-2 rounded-full border border-border hover:border-primary text-sm font-mono uppercase tracking-wider"
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Homepage
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
