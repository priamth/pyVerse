import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  fetchCategories,
  fetchTools,
  createTool,
  deleteTool,
} from "@/lib/api";

const EMPTY = {
  name: "",
  category_slug: "dev",
  description: "",
  alternative_uses: "",
  download_url: "",
  homepage_url: "",
  icon: "Wrench",
  popularity: 60,
  is_open_source: false,
  platforms: "",
};

export default function AdminPage() {
  const [categories, setCategories] = useState([]);
  const [tools, setTools] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const refresh = () =>
    Promise.all([fetchCategories(), fetchTools({ sort: "newest" })]).then(
      ([cats, ts]) => {
        setCategories(cats);
        setTools(ts);
      },
    );

  useEffect(() => {
    refresh();
  }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.download_url || !form.description) {
      toast.error("Name, description and download URL are required");
      return;
    }
    setSubmitting(true);
    try {
      await createTool({
        ...form,
        popularity: Number(form.popularity) || 50,
        alternative_uses: form.alternative_uses
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        platforms: form.platforms
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      toast.success(`Added "${form.name}"`);
      setForm(EMPTY);
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to add tool");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteTool(id);
      toast.success(`Deleted "${name}"`);
      refresh();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div data-testid="admin-page" className="max-w-7xl mx-auto px-6 py-10">
      <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary mb-3">
        // /sudo
      </div>
      <h1 className="font-display font-bold text-3xl sm:text-4xl mb-1">
        Admin <span className="text-primary">Console</span>
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Add new tools or remove old ones. Changes persist to MongoDB.
      </p>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* FORM */}
        <form
          onSubmit={handleCreate}
          className="lg:col-span-2 p-6 rounded-xl border border-border bg-card space-y-4"
          data-testid="admin-form"
        >
          <h2 className="font-display font-bold text-xl flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> New tool
          </h2>

          <Field label="Name *">
            <Input
              data-testid="form-name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
          </Field>

          <Field label="Category">
            <Select
              value={form.category_slug}
              onValueChange={(v) => update("category_slug", v)}
            >
              <SelectTrigger data-testid="form-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Description *">
            <Textarea
              data-testid="form-description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              required
            />
          </Field>

          <Field label="Alternative uses (comma separated)">
            <Input
              data-testid="form-alt-uses"
              value={form.alternative_uses}
              onChange={(e) => update("alternative_uses", e.target.value)}
              placeholder="Note taking, log viewing, ..."
            />
          </Field>

          <Field label="Download URL *">
            <Input
              data-testid="form-download"
              value={form.download_url}
              onChange={(e) => update("download_url", e.target.value)}
              type="url"
              required
            />
          </Field>

          <Field label="Homepage URL">
            <Input
              data-testid="form-homepage"
              value={form.homepage_url}
              onChange={(e) => update("homepage_url", e.target.value)}
              type="url"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Icon (lucide)">
              <Input
                data-testid="form-icon"
                value={form.icon}
                onChange={(e) => update("icon", e.target.value)}
                placeholder="Wrench"
              />
            </Field>
            <Field label="Popularity (0-100)">
              <Input
                data-testid="form-popularity"
                value={form.popularity}
                onChange={(e) => update("popularity", e.target.value)}
                type="number"
                min="0"
                max="100"
              />
            </Field>
          </div>

          <Field label="Platforms (comma separated)">
            <Input
              data-testid="form-platforms"
              value={form.platforms}
              onChange={(e) => update("platforms", e.target.value)}
              placeholder="Windows, macOS, Linux"
            />
          </Field>

          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <Label htmlFor="is_open_source" className="text-sm cursor-pointer">
              Open source?
            </Label>
            <Switch
              id="is_open_source"
              data-testid="form-open-source"
              checked={form.is_open_source}
              onCheckedChange={(v) => update("is_open_source", v)}
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            data-testid="form-submit"
            className="btn-geek w-full"
          >
            <Save className="w-4 h-4 mr-2" /> {submitting ? "Saving…" : "Add tool"}
          </Button>
        </form>

        {/* TABLE */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-bold text-xl">All tools</h2>
            <span className="font-mono text-xs text-muted-foreground">
              {tools.length} total
            </span>
          </div>
          <div className="max-h-[700px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Pop.</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {tools.map((t) => {
                  const cat = categories.find((c) => c.slug === t.category_slug);
                  return (
                    <TableRow key={t.id} data-testid={`admin-row-${t.id}`}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>
                        <span
                          className="cat-chip"
                          style={{ "--cat-color": cat?.color || "#a855f7" }}
                        >
                          {cat?.name || t.category_slug}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {t.popularity}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {t.click_count}
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => handleDelete(t.id, t.name)}
                          data-testid={`delete-${t.id}`}
                          className="p-1.5 rounded-md hover:bg-destructive/20 text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
