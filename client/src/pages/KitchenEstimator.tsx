import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { trackKitchenEstimatorView, trackKitchenEstimateComplete, trackEstimateStep } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Ruler, Layers, Wrench, CheckCircle2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserType = "homeowner" | "trade";
type SupplyMode = "supply_only" | "supply_and_fit";
type CarcassFinish = "white_mfc" | "premium_egger" | "feelwood";
type DoorRange = "slab_mfc" | "shaker_painted" | "handleless_j_pull" | "premium_lacquered";
type HandleRange = "standard" | "premium" | "none";
type WorktopSpec = "postform_38mm_600" | "square_edge_25mm_600" | "bullnose_38mm_900" | "square_edge_25mm_900" | "quartz" | "none";

interface WizardState {
  // Step 1 — Who are you?
  userType: UserType;
  supplyMode: SupplyMode;
  guestEmail: string;
  // Step 2 — Kitchen dimensions
  runLengthMetres: number;
  worktopRunMetres: number;
  plinthMetres: number;
  corniceMetres: number;
  // Step 3 — Unit mix
  baseUnits600: number;
  baseUnits500: number;
  baseUnits1000: number;
  wallUnits600: number;
  wallUnits500: number;
  wallUnits1000: number;
  tallUnits600: number;
  tallUnits500: number;
  drawerPacks: number;
  endPanels: number;
  fillers: number;
  // Step 4 — Spec
  carcassFinish: CarcassFinish;
  doorRange: DoorRange;
  handleRange: HandleRange;
  worktopSpec: WorktopSpec;
  // Step 5 — Extras
  splashbackSqm: number;
  appliancesAllowance: number;
}

const DEFAULT: WizardState = {
  userType: "homeowner",
  supplyMode: "supply_and_fit",
  guestEmail: "",
  runLengthMetres: 4,
  worktopRunMetres: 4,
  plinthMetres: 4,
  corniceMetres: 0,
  baseUnits600: 4,
  baseUnits500: 0,
  baseUnits1000: 1,
  wallUnits600: 3,
  wallUnits500: 0,
  wallUnits1000: 1,
  tallUnits600: 1,
  tallUnits500: 0,
  drawerPacks: 2,
  endPanels: 2,
  fillers: 2,
  carcassFinish: "white_mfc",
  doorRange: "shaker_painted",
  handleRange: "standard",
  worktopSpec: "square_edge_25mm_600",
  splashbackSqm: 0,
  appliancesAllowance: 0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `£${n.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;
}

function NumInput({ label, value, onChange, min = 0, max = 50, step = 1, hint }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; hint?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-background"
          onClick={() => onChange(Math.max(min, value - step))}>−</Button>
        <Input
          type="number" value={value} min={min} max={max} step={step}
          onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
          className="h-8 w-20 text-center"
        />
        <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-background"
          onClick={() => onChange(Math.min(max, value + step))}>+</Button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function KitchenEstimator() {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(DEFAULT);
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Track page view on mount
  useEffect(() => { trackKitchenEstimatorView(); }, []);

  const calc = trpc.fitted.calculateKitchen.useMutation({
    onSuccess: (data) => {
      trackKitchenEstimateComplete(state.supplyMode);
      // Cache full result (with shopping list etc.) for the result page
      try {
        sessionStorage.setItem(`kitchen-result-${data.estimateId}`, JSON.stringify(data));
      } catch {}
      navigate(`/kitchen-estimate/result/${data.estimateId}`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  function set<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setState(prev => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (!user && !state.guestEmail) {
      toast.error("Please enter your email to receive your estimate.");
      return;
    }
    calc.mutate({
      userType: state.userType,
      guestEmail: user ? undefined : state.guestEmail,
      supplyMode: state.supplyMode,
      runLengthMetres: state.runLengthMetres,
      worktopRunMetres: state.worktopRunMetres,
      plinthMetres: state.plinthMetres,
      corniceMetres: state.corniceMetres,
      baseUnits600: state.baseUnits600,
      baseUnits500: state.baseUnits500,
      baseUnits1000: state.baseUnits1000,
      wallUnits600: state.wallUnits600,
      wallUnits500: state.wallUnits500,
      wallUnits1000: state.wallUnits1000,
      tallUnits600: state.tallUnits600,
      tallUnits500: state.tallUnits500,
      drawerPacks: state.drawerPacks,
      endPanels: state.endPanels,
      fillers: state.fillers,
      carcassFinish: state.carcassFinish,
      doorRange: state.doorRange,
      handleRange: state.handleRange,
      worktopSpec: state.worktopSpec,
      splashbackSqm: state.splashbackSqm,
      appliancesAllowance: state.appliancesAllowance,
    });
  }

  const steps = [
    { label: "About you", icon: <CheckCircle2 className="w-4 h-4" /> },
    { label: "Dimensions", icon: <Ruler className="w-4 h-4" /> },
    { label: "Unit mix", icon: <Layers className="w-4 h-4" /> },
    { label: "Specification", icon: <Wrench className="w-4 h-4" /> },
    { label: "Extras", icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🍳</span>
            <h1 className="text-2xl font-bold text-foreground">Kitchen Estimator</h1>
            <Badge variant="secondary" className="ml-auto">Beta</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Get an instant fitted kitchen estimate — supply only or supply &amp; fit.
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-1">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-1 flex-1">
                <button
                  onClick={() => i < step && setStep(i)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded transition-colors ${
                    i === step
                      ? "text-primary bg-primary/10"
                      : i < step
                      ? "text-green-600 cursor-pointer hover:bg-green-50"
                      : "text-muted-foreground cursor-default"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border ${
                    i < step ? "bg-green-500 border-green-500 text-white" :
                    i === step ? "border-primary text-primary" : "border-muted-foreground/30 text-muted-foreground"
                  }`}>
                    {i < step ? "✓" : i + 1}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < steps.length - 1 && <div className={`h-px flex-1 mx-1 ${i < step ? "bg-green-400" : "bg-border"}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card className="border-border">
          <CardContent className="pt-6">

            {/* ── Step 0: About you ─────────────────────────────────────── */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Who is this estimate for?</h2>
                  <p className="text-sm text-muted-foreground">This helps us tailor the output to your needs.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {(["homeowner", "trade"] as UserType[]).map(t => (
                    <button key={t}
                      onClick={() => set("userType", t)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        state.userType === t ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="text-2xl mb-2">{t === "homeowner" ? "🏠" : "🔧"}</div>
                      <div className="font-semibold text-foreground capitalize">{t === "homeowner" ? "Homeowner" : "Trade / Contractor"}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {t === "homeowner" ? "Planning a new kitchen for my home" : "Estimating for a client or project"}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Supply mode</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["supply_and_fit", "supply_only"] as SupplyMode[]).map(m => (
                      <button key={m}
                        onClick={() => set("supplyMode", m)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          state.supplyMode === m ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div className="font-medium text-foreground text-sm">
                          {m === "supply_and_fit" ? "Supply & Fit" : "Supply Only"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {m === "supply_and_fit" ? "Includes installation labour" : "Cabinets delivered flat-pack or assembled"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {!user && (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Your email <span className="text-destructive">*</span></Label>
                    <Input
                      id="email" type="email" placeholder="you@example.com"
                      value={state.guestEmail}
                      onChange={e => set("guestEmail", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">We'll send your estimate to this address.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 1: Dimensions ────────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Kitchen dimensions</h2>
                  <p className="text-sm text-muted-foreground">Measure the total run of cabinets along the walls.</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <NumInput label="Total cabinet run (m)" value={state.runLengthMetres} step={0.5} min={0.5} max={30}
                    hint="Sum of all wall runs with cabinets"
                    onChange={v => { set("runLengthMetres", v); set("worktopRunMetres", v); set("plinthMetres", v); }} />
                  <NumInput label="Worktop run (m)" value={state.worktopRunMetres} step={0.5} min={0} max={30}
                    hint="Usually same as cabinet run"
                    onChange={v => set("worktopRunMetres", v)} />
                  <NumInput label="Plinth (m)" value={state.plinthMetres} step={0.5} min={0} max={30}
                    hint="Base cabinet kick-board run"
                    onChange={v => set("plinthMetres", v)} />
                  <NumInput label="Cornice / pelmet (m)" value={state.corniceMetres} step={0.5} min={0} max={30}
                    hint="Leave 0 if not required"
                    onChange={v => set("corniceMetres", v)} />
                </div>
                <div className="p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground">
                  💡 <strong>Tip:</strong> Measure the total linear metres of cabinets, not the room perimeter. An L-shaped kitchen with 2.4m + 3.0m runs = 5.4m total.
                </div>
              </div>
            )}

            {/* ── Step 2: Unit mix ──────────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Unit mix</h2>
                  <p className="text-sm text-muted-foreground">Enter the number of each unit type. Use the quick-estimate guide below if unsure.</p>
                </div>

                <div className="p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground space-y-1">
                  <p><strong>Quick guide for {state.runLengthMetres}m run:</strong></p>
                  <p>Base units: ~{Math.round(state.runLengthMetres / 0.6)} × 600mm or mix of sizes</p>
                  <p>Wall units: ~{Math.round(state.runLengthMetres / 0.6 * 0.7)} units (fewer over appliances)</p>
                  <p>Tall units: 1–2 for larder / oven housing</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 bg-primary/10 text-primary rounded text-xs flex items-center justify-center font-bold">B</span>
                    Base units
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <NumInput label="500mm" value={state.baseUnits500} onChange={v => set("baseUnits500", v)} />
                    <NumInput label="600mm" value={state.baseUnits600} onChange={v => set("baseUnits600", v)} />
                    <NumInput label="1000mm" value={state.baseUnits1000} onChange={v => set("baseUnits1000", v)} />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 bg-primary/10 text-primary rounded text-xs flex items-center justify-center font-bold">W</span>
                    Wall units
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <NumInput label="500mm" value={state.wallUnits500} onChange={v => set("wallUnits500", v)} />
                    <NumInput label="600mm" value={state.wallUnits600} onChange={v => set("wallUnits600", v)} />
                    <NumInput label="1000mm" value={state.wallUnits1000} onChange={v => set("wallUnits1000", v)} />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 bg-primary/10 text-primary rounded text-xs flex items-center justify-center font-bold">T</span>
                    Tall units &amp; drawers
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <NumInput label="Tall 500mm" value={state.tallUnits500} onChange={v => set("tallUnits500", v)} />
                    <NumInput label="Tall 600mm" value={state.tallUnits600} onChange={v => set("tallUnits600", v)} />
                    <NumInput label="Drawer packs" value={state.drawerPacks} onChange={v => set("drawerPacks", v)} />
                    <NumInput label="End panels" value={state.endPanels} onChange={v => set("endPanels", v)} />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Specification ─────────────────────────────────── */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Specification</h2>
                  <p className="text-sm text-muted-foreground">Choose the finish and hardware for your kitchen.</p>
                </div>

                <div className="space-y-2">
                  <Label>Carcass finish</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { v: "white_mfc", label: "White MFC", desc: "Standard white melamine — great value" },
                      { v: "premium_egger", label: "Premium Egger", desc: "Uni-colour or textured Egger range" },
                      { v: "feelwood", label: "Feelwood", desc: "Realistic wood-grain decorative finish" },
                    ] as { v: CarcassFinish; label: string; desc: string }[]).map(({ v, label, desc }) => (
                      <button key={v} onClick={() => set("carcassFinish", v)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${state.carcassFinish === v ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                        <div className="font-medium text-sm text-foreground">{label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Door range</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { v: "slab_mfc", label: "Slab MFC", desc: "Flat slab — budget-friendly" },
                      { v: "shaker_painted", label: "Shaker Painted", desc: "Classic shaker in painted finish" },
                      { v: "handleless_j_pull", label: "Handleless J-Pull", desc: "Contemporary integrated handle" },
                      { v: "premium_lacquered", label: "Premium Lacquered", desc: "High-gloss or matt lacquer" },
                    ] as { v: DoorRange; label: string; desc: string }[]).map(({ v, label, desc }) => (
                      <button key={v} onClick={() => set("doorRange", v)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${state.doorRange === v ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                        <div className="font-medium text-sm text-foreground">{label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Handles</Label>
                    <Select value={state.handleRange} onValueChange={v => set("handleRange", v as HandleRange)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No handles (handleless)</SelectItem>
                        <SelectItem value="standard">Standard handles</SelectItem>
                        <SelectItem value="premium">Premium handles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Worktop</Label>
                    <Select value={state.worktopSpec} onValueChange={v => set("worktopSpec", v as WorktopSpec)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No worktop (client supplied)</SelectItem>
                        <SelectItem value="postform_38mm_600">Postform 38mm 600mm depth</SelectItem>
                        <SelectItem value="square_edge_25mm_600">Square edge 25mm 600mm</SelectItem>
                        <SelectItem value="bullnose_38mm_900">Bullnose 38mm 900mm depth</SelectItem>
                        <SelectItem value="square_edge_25mm_900">Square edge 25mm 900mm</SelectItem>
                        <SelectItem value="quartz">Quartz (planning allowance)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4: Extras ────────────────────────────────────────── */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Optional extras</h2>
                  <p className="text-sm text-muted-foreground">Add any additional items to include in your estimate.</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <NumInput label="Splashback (m²)" value={state.splashbackSqm} step={0.5} min={0} max={20}
                    hint="Tiled area behind hob / sink"
                    onChange={v => set("splashbackSqm", v)} />
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Appliances allowance (£)</Label>
                    <p className="text-xs text-muted-foreground">Optional budget for oven, hob, extractor, fridge</p>
                    <Input type="number" min={0} max={50000} step={100}
                      value={state.appliancesAllowance}
                      onChange={e => set("appliancesAllowance", Math.max(0, Number(e.target.value)))}
                      className="h-8"
                    />
                  </div>
                </div>

                {/* Summary card */}
                <div className="p-4 bg-muted/40 rounded-lg space-y-2 text-sm">
                  <p className="font-semibold text-foreground">Estimate summary</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                    <span>Run length:</span><span className="text-foreground font-medium">{state.runLengthMetres}m</span>
                    <span>User type:</span><span className="text-foreground font-medium capitalize">{state.userType === "trade" ? "Trade / Contractor" : "Homeowner"}</span>
                    <span>Supply mode:</span><span className="text-foreground font-medium">{state.supplyMode === "supply_and_fit" ? "Supply & Fit" : "Supply Only"}</span>
                    <span>Door range:</span><span className="text-foreground font-medium">{state.doorRange.replace(/_/g, " ")}</span>
                    <span>Worktop:</span><span className="text-foreground font-medium">{state.worktopSpec === "none" ? "Not included" : state.worktopSpec.replace(/_/g, " ")}</span>
                    <span>Total units:</span><span className="text-foreground font-medium">
                      {state.baseUnits600 + state.baseUnits500 + state.baseUnits1000 +
                       state.wallUnits600 + state.wallUnits500 + state.wallUnits1000 +
                       state.tallUnits600 + state.tallUnits500 + state.drawerPacks} units
                    </span>
                  </div>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>

          {step < steps.length - 1 ? (
            <Button onClick={() => { trackEstimateStep(step + 1, "kitchen"); setStep(s => s + 1); }} className="gap-2">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={calc.isPending} className="gap-2 min-w-[160px]">
              {calc.isPending ? (
                <><span className="animate-spin">⏳</span> Calculating…</>
              ) : (
                <>Get Estimate <ChevronRight className="w-4 h-4" /></>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
