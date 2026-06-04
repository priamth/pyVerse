import {
  Settings,
  Sun,
  Terminal,
  Zap,
  Waves,
  Flame,
  Palette,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme } from "@/context/ThemeContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const THEME_OPTIONS = [
  { id: "cyberpunk", label: "Cyberpunk", icon: Zap, color: "#f72585" },
  { id: "terminal", label: "Retro Terminal", icon: Terminal, color: "#22c55e" },
  { id: "modern", label: "Modern Clean", icon: Sun, color: "#3b82f6" },
  { id: "synthwave", label: "Synthwave", icon: Sparkles, color: "#ff4dd2" },
  { id: "amber", label: "Amber CRT", icon: Flame, color: "#f59e0b" },
  { id: "ocean", label: "Deep Ocean", icon: Waves, color: "#06b6d4" },
];

export default function SettingsMenu() {
  const t = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Open settings"
          data-testid="settings-trigger"
          className="settings-trigger"
        >
          <Settings className="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={12}
        className="w-[360px] p-0 border-border"
        data-testid="settings-panel"
      >
        <div className="px-4 py-3 border-b border-border flex items-start justify-between gap-3">
          <div>
            <div className="font-display font-bold text-base flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" /> Geek Settings
            </div>
            <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
              // tweak everything
            </div>
          </div>
          <button
            type="button"
            onClick={t.reset}
            data-testid="settings-reset"
            className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        <ScrollArea className="max-h-[460px]">
          <div className="p-4 space-y-5">
            {/* THEMES */}
            <Section title="Theme">
              <div className="grid grid-cols-3 gap-2">
                {THEME_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = t.theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      data-testid={`theme-option-${opt.id}`}
                      onClick={() => t.setTheme(opt.id)}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-md border transition-colors ${
                        active
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/60"
                      }`}
                    >
                      <Icon className="w-4 h-4" style={{ color: opt.color }} />
                      <span className="text-[11px] font-medium text-center leading-tight">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Section>

            <Separator />

            {/* DISPLAY */}
            <Section title="Display">
              <Row label="Font size">
                <MiniSelect
                  testid="font-size-select"
                  value={t.fontSize}
                  onValueChange={t.setFontSize}
                  options={[
                    { v: "small", l: "Small" },
                    { v: "normal", l: "Normal" },
                    { v: "large", l: "Large" },
                  ]}
                />
              </Row>
              <Row label="Card density">
                <MiniSelect
                  testid="density-select"
                  value={t.density}
                  onValueChange={t.setDensity}
                  options={[
                    { v: "compact", l: "Compact" },
                    { v: "normal", l: "Normal" },
                    { v: "spacious", l: "Spacious" },
                  ]}
                />
              </Row>
              <Row label="Hover effect">
                <MiniSelect
                  testid="hover-select"
                  value={t.cardHover}
                  onValueChange={t.setCardHover}
                  options={[
                    { v: "lift", l: "Lift" },
                    { v: "glow", l: "Glow" },
                    { v: "none", l: "None" },
                  ]}
                />
              </Row>
              <Row label="Glow intensity">
                <MiniSelect
                  testid="glow-select"
                  value={t.glow}
                  onValueChange={t.setGlow}
                  options={[
                    { v: "off", l: "Off" },
                    { v: "low", l: "Low" },
                    { v: "high", l: "High" },
                  ]}
                />
              </Row>
              <Row label="High contrast">
                <Switch
                  data-testid="toggle-high-contrast"
                  checked={t.highContrast}
                  onCheckedChange={t.setHighContrast}
                />
              </Row>
            </Section>

            <Separator />

            {/* CARD CONTENT */}
            <Section title="Card content">
              <Row label="Show popularity">
                <Switch
                  data-testid="toggle-popularity"
                  checked={t.showPopularity}
                  onCheckedChange={t.setShowPopularity}
                />
              </Row>
              <Row label="Show click count">
                <Switch
                  data-testid="toggle-click-count"
                  checked={t.showClickCount}
                  onCheckedChange={t.setShowClickCount}
                />
              </Row>
              <Row label="Category strip">
                <Switch
                  data-testid="toggle-cat-strip"
                  checked={t.showCategoryStrip}
                  onCheckedChange={t.setShowCategoryStrip}
                />
              </Row>
              <Row label="Alt-use preview">
                <Switch
                  data-testid="toggle-alt-uses"
                  checked={t.showAltUsesPreview}
                  onCheckedChange={t.setShowAltUsesPreview}
                />
              </Row>
            </Section>

            <Separator />

            {/* MOTION */}
            <Section title="Motion & effects">
              <Row label="Reduce motion">
                <Switch
                  data-testid="toggle-reduce-motion"
                  checked={t.reduceMotion}
                  onCheckedChange={t.setReduceMotion}
                />
              </Row>
              <Row label="Scanlines">
                <MiniSelect
                  testid="scanlines-select"
                  value={t.showScanlines}
                  onValueChange={t.setShowScanlines}
                  options={[
                    { v: "auto", l: "Auto" },
                    { v: "on", l: "On" },
                    { v: "off", l: "Off" },
                  ]}
                />
              </Row>
            </Section>

            <Separator />

            {/* BEHAVIOUR */}
            <Section title="Defaults & extras">
              <Row label="Default sort">
                <MiniSelect
                  testid="default-sort-select"
                  value={t.defaultSort}
                  onValueChange={t.setDefaultSort}
                  options={[
                    { v: "relevance", l: "Relevance" },
                    { v: "popularity", l: "Popularity" },
                    { v: "name", l: "Name" },
                    { v: "newest", l: "Newest" },
                  ]}
                />
              </Row>
              <Row label="Show hero stats">
                <Switch
                  data-testid="toggle-hero-stats"
                  checked={t.showHeroStats}
                  onCheckedChange={t.setShowHeroStats}
                />
              </Row>
              <Row label="Chaos mode (random theme/session)">
                <Switch
                  data-testid="toggle-chaos"
                  checked={t.chaosMode}
                  onCheckedChange={t.setChaosMode}
                />
              </Row>
              <Row label="Easter eggs enabled">
                <Switch
                  data-testid="toggle-eggs"
                  checked={t.easterEggs}
                  onCheckedChange={t.setEasterEggs}
                />
              </Row>
            </Section>
          </div>
        </ScrollArea>

        <div className="px-4 py-2 border-t border-border text-[10px] font-mono text-muted-foreground">
          tip: try the Konami code on Home if Easter eggs are on
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-xs font-normal cursor-pointer flex-1">{label}</Label>
      {children}
    </div>
  );
}

function MiniSelect({ value, onValueChange, options, testid }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger data-testid={testid} className="h-8 w-[130px] text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.v} value={o.v} className="text-xs">
            {o.l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
