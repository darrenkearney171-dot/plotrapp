import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Building2,
  Calculator,
  Camera,
  ClipboardList,
  FileText,
  FolderOpen,
  HardHat,
  ImageIcon,
  LayoutDashboard,
  Loader2,
  Lock,
  Plus,
  ShoppingCart,
  Sparkles,
  Trash2,
  Users,
  Wrench,
  X,
} from "lucide-react";
import NavBar from "@/components/NavBar";

// ─── Create Project Dialog ─────────────────────────────────────────────────────

function CreateProjectDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      toast.success("Project created!");
      setOpen(false);
      setTitle("");
      setAddress("");
      onCreated();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="title">Project Name</Label>
            <Input id="title" placeholder="e.g. Kitchen Renovation" value={title} onChange={e => setTitle(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="address">Property Address (optional)</Label>
            <Input id="address" placeholder="e.g. 14 Main Street, Belfast" value={address} onChange={e => setAddress(e.target.value)} className="mt-1" />
          </div>
          <Button
            className="w-full"
            disabled={!title.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate({ title: title.trim(), propertyAddress: address || undefined })}
          >
            {createMutation.isPending ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Generate Visualisation Dialog ────────────────────────────────────────────

const ROOM_TYPES = [
  { value: "bathroom", label: "Bathroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "living_room", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "hallway", label: "Hallway" },
  { value: "utility_room", label: "Utility Room" },
  { value: "extension", label: "Extension" },
];

const FINISH_OPTIONS = [
  { value: "modern minimalist", label: "Modern Minimalist" },
  { value: "traditional", label: "Traditional" },
  { value: "industrial", label: "Industrial" },
  { value: "scandi", label: "Scandi / Nordic" },
  { value: "luxury", label: "Luxury / High-end" },
  { value: "coastal", label: "Coastal / Light" },
];

function GenerateVisualisationDialog({ onGenerated, photoUrl }: { onGenerated: () => void; photoUrl?: string }) {
  const [open, setOpen] = useState(false);
  const [roomType, setRoomType] = useState("bathroom");
  const [finishes, setFinishes] = useState("modern minimalist");
  const [stylePrompt, setStylePrompt] = useState("");

  const generateMutation = trpc.visualisation.generate.useMutation({
    onSuccess: () => {
      toast.success("Visualisation generated!");
      setOpen(false);
      onGenerated();
    },
    onError: (e) => {
      if (e.message === "FREE_LIMIT_REACHED") {
        toast.error("You've used your 3 free renders. Upgrade to Pro or Trade for unlimited visualisations.");
      } else {
        toast.error("Generation failed: " + e.message);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Sparkles className="w-4 h-4" />
          Generate Visualisation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate a Room Visualisation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label>Room Type</Label>
            <Select value={roomType} onValueChange={setRoomType}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROOM_TYPES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Style / Finishes</Label>
            <Select value={finishes} onValueChange={setFinishes}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FINISH_OPTIONS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="stylePrompt">Additional details (optional)</Label>
            <Input
              id="stylePrompt"
              placeholder="e.g. dark grey tiles, walk-in shower, freestanding bath"
              value={stylePrompt}
              onChange={e => setStylePrompt(e.target.value)}
              className="mt-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            AI image generation takes 1020 seconds. The result is saved to your gallery.
          </p>
          <Button
            className="w-full"
            disabled={generateMutation.isPending}
            onClick={() => generateMutation.mutate({ roomType, finishes, stylePrompt: stylePrompt || undefined, photoUrl: photoUrl || undefined })}
          >
            {generateMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating&</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" />Generate</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Upgrade Modal ─────────────────────────────────────────────────────────────

function UpgradeVisualisationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2">
            <Lock className="w-5 h-5 text-primary" /> Free Renders Used
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mt-2">
          You have used your 3 free project visualisations. Upgrade to Renolab Pro to unlock unlimited visualisations for every room in your project.
        </p>
        <div className="flex flex-col gap-3 mt-4">
          <Link href="/pricing">
            <Button className="w-full" onClick={onClose}>Upgrade to Pro  �9.99/month</Button>
          </Link>
          <Button variant="ghost" className="w-full" onClick={onClose}>Not now</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Status helpers ────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  planning: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
};

const STATUS_LABELS: Record<string, string> = {
  planning: "Planning",
  in_progress: "In Progress",
  completed: "Completed",
};

// ─── Trade Templates ──────────────────────────────────────────────────────────

const TEMPLATE_CATEGORIES = [
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "bedroom", label: "Bedroom" },
  { value: "home_office", label: "Home Office" },
  { value: "utility", label: "Utility" },
  { value: "other", label: "Other" },
];

function TradeTemplates() {
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("kitchen");
  const [description, setDescription] = useState("");

  const utils = trpc.useUtils();
  const { data: templates, isLoading } = trpc.templates.list.useQuery();

  const saveMutation = trpc.templates.save.useMutation({
    onSuccess: () => {
      toast.success("Template saved!");
      setSaveOpen(false);
      setName("");
      setDescription("");
      utils.templates.list.invalidate();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = trpc.templates.delete.useMutation({
    onSuccess: () => {
      toast.success("Template deleted");
      utils.templates.list.invalidate();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="border border-border rounded-xl p-4 bg-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Saved Templates</h3>
        </div>
        <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="w-3 h-3 mr-1" /> Save Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Project Template</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">Save your current wizard inputs as a reusable template for quoting similar jobs quickly.</p>
            <div className="space-y-3 pt-2">
              <div>
                <Label htmlFor="tpl-name">Template Name</Label>
                <Input id="tpl-name" placeholder="e.g. Standard 3m L-shaped Kitchen" value={name} onChange={e => setName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="tpl-cat">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tpl-desc">Description (optional)</Label>
                <Input id="tpl-desc" placeholder="Brief notes about this template" value={description} onChange={e => setDescription(e.target.value)} className="mt-1" />
              </div>
              <Button
                className="w-full"
                disabled={!name.trim() || saveMutation.isPending}
                onClick={() => saveMutation.mutate({
                  name: name.trim(),
                  category,
                  description: description || undefined,
                  templateData: JSON.stringify({ category, savedAt: new Date().toISOString() }),
                })}
              >
                {saveMutation.isPending ? "Saving..." : "Save Template"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="space-y-2">
          {templates.map((tpl: any) => (
            <div key={tpl.id} className="flex items-center justify-between border border-border rounded-lg px-3 py-2 bg-background">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{tpl.name}</p>
                <p className="text-xs text-muted-foreground">
                  {TEMPLATE_CATEGORIES.find(c => c.value === tpl.category)?.label ?? tpl.category}
                  {tpl.description ? ` · ${tpl.description}` : ""}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive ml-2 shrink-0"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (confirm("Delete this template?")) {
                    deleteMutation.mutate({ id: tpl.id });
                  }
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground py-2">No templates saved yet. Save your estimate inputs to quickly re-use them for similar jobs.</p>
      )}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();
  const { data: projects, isLoading } = trpc.projects.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: subscription } = trpc.subscriptions.getCurrent.useQuery(undefined, { enabled: isAuthenticated });
  const { data: visStatus } = trpc.visualisation.status.useQuery(undefined, { enabled: isAuthenticated });
  const { data: visualisations, isLoading: visLoading } = trpc.visualisation.list.useQuery(undefined, { enabled: isAuthenticated });
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const billingPortalMutation = trpc.subscriptions.createBillingPortal.useMutation({
    onSuccess: (data: { portalUrl: string }) => { window.open(data.portalUrl, "_blank"); },
    onError: (e: { message: string }) => toast.error(e.message),
  });
  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: () => { toast.success("Project deleted"); utils.projects.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteVisMutation = trpc.visualisation.delete.useMutation({
    onSuccess: () => { toast.success("Visualisation deleted"); utils.visualisation.list.invalidate(); utils.visualisation.status.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Sign in to access your dashboard</h2>
        <a href={getLoginUrl()}><Button>Sign In</Button></a>
      </div>
    );
  }

  const canGenerate = visStatus?.canGenerate ?? true;
  const remaining = visStatus?.remaining;

  return (
    <div className="min-h-screen bg-background font-[Inter,sans-serif]">
      <NavBar />

      <main className="container py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Plan, price, and manage your renovation projects.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {subscription && (
              <Badge className={subscription.tier === "free" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary border-primary/20"}>
                {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} Plan
              </Badge>
            )}
            {subscription && subscription.tier !== "free" && (
              <Button size="sm" variant="outline" onClick={() => billingPortalMutation.mutate({ origin: window.location.origin })} disabled={billingPortalMutation.isPending}>
                Manage Billing
              </Button>
            )}
            <CreateProjectDialog onCreated={() => utils.projects.list.invalidate()} />
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: FolderOpen, label: "Projects", value: projects?.length ?? 0, href: null },
            { icon: ShoppingCart, label: "Suppliers", value: "Browse", href: "/suppliers" },
            { icon: HardHat, label: "Tradespeople", value: "Find", href: "/tradespeople" },
            { icon: Building2, label: "Upgrade Plan", value: subscription?.tier === "free" ? "Free" : "Active", href: "/pricing" },
          ].map((item) => (
            <div key={item.label} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2">
              <item.icon className="w-5 h-5 text-primary" />
              <p className="text-xs text-muted-foreground">{item.label}</p>
              {item.href ? (
                <Link href={item.href} className="text-base font-semibold text-primary hover:underline">{item.value}</Link>
              ) : (
                <p className="text-base font-semibold">{item.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Trade Dashboard  only for Trade tier users */}
        {subscription?.tier === "trade" && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Trade Tools</h2>
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs ml-2">Trade</Badge>
            </div>

            {/* Trade quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Link href="/kitchen-estimator">
                <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
                  <Calculator className="w-5 h-5 text-primary mb-2" />
                  <p className="font-semibold text-sm">Kitchen Estimator</p>
                  <p className="text-xs text-muted-foreground mt-1">Quick-price a fitted kitchen with trade rates and per-LM figures.</p>
                </div>
              </Link>
              <Link href="/estimate">
                <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
                  <FileText className="w-5 h-5 text-primary mb-2" />
                  <p className="font-semibold text-sm">Room Estimate</p>
                  <p className="text-xs text-muted-foreground mt-1">Photo-based estimate with full materials list and labour time.</p>
                </div>
              </Link>
              <Link href="/new-build">
                <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
                  <ClipboardList className="w-5 h-5 text-primary mb-2" />
                  <p className="font-semibold text-sm">New Build</p>
                  <p className="text-xs text-muted-foreground mt-1">Upload plans, scan rooms, get per-room cost breakdowns.</p>
                </div>
              </Link>
              <Link href="/suppliers">
                <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
                  <ShoppingCart className="w-5 h-5 text-primary mb-2" />
                  <p className="font-semibold text-sm">Trade Suppliers</p>
                  <p className="text-xs text-muted-foreground mt-1">Browse partner suppliers with trade-only pricing.</p>
                </div>
              </Link>
            </div>

            {/* Saved Templates */}
            <TradeTemplates />

            {/* Trade tips / coming soon */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
              <p className="text-sm font-semibold text-amber-800 mb-1">Coming soon for Trade members</p>
              <p className="text-xs text-amber-700">
                Client project folders, and job lead notifications from homeowners on the platform.
              </p>
            </div>
          </div>
        )}

        {/* Projects grid */}
        <h2 className="text-lg font-semibold mb-4">My Projects</h2>
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-base">{project.title}</h3>
                    {project.propertyAddress && (
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-[180px]">{project.propertyAddress}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[project.status]}`}>
                    {STATUS_LABELS[project.status]}
                  </span>
                </div>
                {project.totalEstimatedCost && (
                  <p className="text-sm text-muted-foreground">
                    Est. cost: <span className="font-semibold text-foreground">�{project.totalEstimatedCost.toLocaleString()}</span>
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                  <Link href={`/projects/${project.id}`}>
                    <Button size="sm" variant="outline" className="gap-1">
                      Open <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm("Delete this project?")) deleteMutation.mutate({ id: project.id });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-xl mb-10">
            <LayoutDashboard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Create your first renovation project to get started.</p>
            <CreateProjectDialog onCreated={() => utils.projects.list.invalidate()} />
          </div>
        )}

        {/* ─── Project Visualisations ─────────────────────────────────────────── */}
        <div className="mt-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Project Visualisations
                <Badge className="ml-1 text-xs bg-primary/10 text-primary border-primary/20">AI</Badge>
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                See what your renovation could look like before you start.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Allowance indicator */}
              {visStatus && visStatus.tier === "free" && visStatus.remaining === 1 && (
                <span className="text-xs text-amber-600 font-medium max-w-xs">
                  1 project visualisation remaining  upgrade to Pro for unlimited visualisations across every room in your project.
                </span>
              )}
              {visStatus && visStatus.tier === "free" && visStatus.remaining !== null && visStatus.remaining > 1 && (
                <span className="text-xs text-muted-foreground">
                  {visStatus.remaining} free render{visStatus.remaining !== 1 ? "s" : ""} remaining
                </span>
              )}
              {visStatus && visStatus.tier !== "free" && (
                <span className="text-xs text-muted-foreground">Unlimited renders</span>
              )}
              {canGenerate ? (
                <GenerateVisualisationDialog onGenerated={() => { utils.visualisation.list.invalidate(); utils.visualisation.status.invalidate(); }} />
              ) : (
                <Button className="gap-2" onClick={() => setUpgradeOpen(true)}>
                  <Lock className="w-4 h-4" /> Unlock More Renders
                </Button>
              )}
            </div>
          </div>

          {/* Allowance bar (free tier only) */}
          {visStatus && visStatus.tier === "free" && (
            <div className="mb-6 p-4 bg-card border border-border rounded-xl flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Free renders used</span>
                  <span>{visStatus.freeUsed} / {visStatus.freeLimit}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${Math.min(100, (visStatus.freeUsed / visStatus.freeLimit) * 100)}%` }}
                  />
                </div>
              </div>
              {!canGenerate && (
                <Link href="/pricing">
                  <Button size="sm" variant="outline" className="shrink-0">Upgrade for unlimited</Button>
                </Link>
              )}
            </div>
          )}

          {/* Gallery */}
          {visLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />)}
            </div>
          ) : visualisations && visualisations.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {visualisations.map((vis) => (
                <div key={vis.id} className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-muted cursor-pointer" onClick={() => setLightboxUrl(vis.imageUrl)}>
                  <img src={vis.imageUrl} alt={vis.roomType ?? "Visualisation"} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                    <div className="flex justify-end">
                      <button
                        className="text-white bg-black/40 rounded-full p-1 hover:bg-red-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Delete this visualisation?")) deleteVisMutation.mutate({ id: vis.id });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-white text-xs capitalize font-medium">
                      {vis.roomType?.replace("_", " ") ?? "Room"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
              <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No visualisations yet</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Generate your first AI room render to see what your renovation could look like.
              </p>
              {canGenerate ? (
                <GenerateVisualisationDialog onGenerated={() => { utils.visualisation.list.invalidate(); utils.visualisation.status.invalidate(); }} />
              ) : (
                <Link href="/pricing"><Button>Upgrade to Generate</Button></Link>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Upgrade modal */}
      <UpgradeVisualisationModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightboxUrl(null)}>
            <X className="w-8 h-8" />
          </button>
          <img src={lightboxUrl} alt="Visualisation" className="max-w-full max-h-full rounded-xl object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}

      <footer className="border-t border-border mt-16 py-6 text-center text-xs text-muted-foreground">
        Built on the island of Ireland. renolab.co.uk
      </footer>
    </div>
  );
}
