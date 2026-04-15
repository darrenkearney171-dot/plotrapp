import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import NavBar from "@/components/NavBar";
import { trackPageView, trackEstimateComplete, trackRenovationPassClick } from "@/lib/analytics";
import {
  CheckCircle2,
  ChevronRight,
  Loader2,
  AlertCircle,
  Clock,
  Ruler,
  Sparkles,
  Wrench,
  ShoppingCart,
  FileText,
  Lock,
  Tag,
  X,
} from "lucide-react";

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

// âââ Helpers ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
}

function ConditionBadge({ condition }: { condition: string }) {
  const map: Record<string, { label: string; color: string }> = {
    poor: { label: "Poor condition", color: "bg-red-500/20 text-red-400" },
    fair: { label: "Fair condition", color: "bg-yellow-500/20 text-yellow-400" },
    good: { label: "Good condition", color: "bg-green-500/20 text-green-400" },
  };
  const c = map[condition] ?? { label: condition, color: "bg-slate-500/20 text-slate-400" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.color}`}>{c.label}</span>;
}

// âââ Locked Feature Card ââââââââââââââââââââââââââââââââââââââââââââââââââââââ

function LockedCard({ title, description, icon: Icon }: { title: string; description: string; icon: any }) {
  return (
    <div className="relative bg-[#1E293B] rounded-xl p-5 border border-slate-700 overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-[1px] bg-[#0F172A]/60 flex flex-col items-center justify-center z-10 rounded-xl">
        <Lock className="w-6 h-6 text-[#FF6B2C] mb-2" />
        <p className="text-sm font-semibold text-white">Pro feature</p>
        <p className="text-xs text-slate-400 mt-0.5">Upgrade to unlock</p>
      </div>
      <div className="opacity-30">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="w-5 h-5 text-[#FF6B2C]" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-slate-400">{description}</p>
        <div className="mt-3 space-y-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-3 bg-slate-700 rounded w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

// âââ Trade Margin Calculator ââââââââââââââââââââââââââââââââââââââââââââââââââ

function TradeMarginCalculator({ materialsLow, materialsHigh }: { materialsLow: number; materialsHigh: number }) {
  const [marginPercent, setMarginPercent] = useState(20);
  const [labourDays, setLabourDays] = useState(5);
  const [dayRate, setDayRate] = useState(250);

  const materialsAvg = (materialsLow + materialsHigh) / 2;
  const labourCost = labourDays * dayRate;
  const subtotal = materialsAvg + labourCost;
  const marginAmount = subtotal * (marginPercent / 100);
  const clientQuote = subtotal + marginAmount;

  return (
    <div className="bg-[#1E293B] rounded-xl p-6 mb-8 border border-amber-500/30">
      <div className="flex items-center gap-2 mb-4">
        <Wrench className="w-5 h-5 text-amber-400" />
        <h3 className="font-bold text-white">Trade Quote Calculator</h3>
        <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full ml-auto">Trade only</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Labour days</label>
          <Input
            type="number"
            min={0}
            max={100}
            value={labourDays}
            onChange={e => setLabourDays(Number(e.target.value) || 0)}
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Day rate (£)</label>
          <Input
            type="number"
            min={0}
            max={1000}
            value={dayRate}
            onChange={e => setDayRate(Number(e.target.value) || 0)}
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Margin: {marginPercent}%</label>
          <Slider
            value={[marginPercent]}
            onValueChange={([v]) => setMarginPercent(v)}
            min={0}
            max={50}
            step={1}
            className="mt-3"
          />
        </div>
      </div>

      <div className="bg-slate-900/60 rounded-lg p-4 space-y-2 text-sm">
        <div className="flex justify-between text-slate-400">
          <span>Materials (avg)</span>
          <span>{formatCurrency(materialsAvg)}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Labour ({labourDays} days × £{dayRate})</span>
          <span>{formatCurrency(labourCost)}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Margin ({marginPercent}%)</span>
          <span>{formatCurrency(marginAmount)}</span>
        </div>
        <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-white text-base">
          <span>Client quote</span>
          <span className="text-amber-400">{formatCurrency(clientQuote)}</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-3">Adjust labour, day rate, and margin to build your client quote. Materials based on the AI estimate midpoint.</p>
    </div>
  );
}

// âââ Main âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export default function EstimateResult() {
  const params = useParams<{ id: string }>();
  const leadId = parseInt(params.id ?? "0", 10);
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: lead, isLoading, error } = trpc.guest.getResult.useQuery(
    { leadId },
    { enabled: !!leadId }
  );
  const { isAuthenticated } = useAuth();
  const { data: visStatus } = trpc.visualisation.status.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();
  const [visDialogOpen, setVisDialogOpen] = useState(false);
  const [visRoomType, setVisRoomType] = useState("bathroom");
  const [visFinishes, setVisFinishes] = useState("modern minimalist");
  const [visStylePrompt, setVisStylePrompt] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    trackPageView("Estimate Result");
    trackEstimateComplete("renovation");
  }, []);

  const generateVisMutation = trpc.visualisation.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedImageUrl(data.imageUrl);
      setVisDialogOpen(false);
      utils.visualisation.status.invalidate();
      toast.success("Visualisation generated and saved to your dashboard!");
    },
    onError: (e) => {
      if (e.message === "FREE_LIMIT_REACHED") {
        toast.error("You've used your 3 free renders. Get Early Access.");
      } else {
        toast.error("Generation failed: " + e.message);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#FF6B2C] mx-auto mb-4" />
          <p className="text-white font-semibold text-lg">Analysing your room…</p>
          <p className="text-slate-400 text-sm mt-1">This usually takes 10–20 seconds</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <p className="text-white font-semibold text-lg">Estimate not found</p>
          <Button onClick={() => navigate("/estimate")} className="mt-4 bg-[#FF6B2C] hover:bg-[#e55a1f] text-white">
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const result = lead.analysisResult as any;
  const isProUser = user && (user as any).subscriptionTier !== "free";
  const isTradeUser = user && (user as any).subscriptionTier === "trade";

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Header */}
      <NavBar />

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Success banner */}
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl px-5 py-3 mb-8">
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          <div>
            <p className="font-semibold text-green-300">Your estimate is ready</p>
            <p className="text-sm text-green-400/70">
              Based on your {lead.projectType?.replace("_", " ")} photo
              {lead.firstName ? `, ${lead.firstName}` : ""}
            </p>
          </div>
        </div>

        {/* Cost Range — always visible */}
        <div className="bg-gradient-to-br from-[#FF6B2C]/20 to-[#1E293B] border border-[#FF6B2C]/30 rounded-2xl p-8 mb-6 text-center">
          <p className="text-slate-400 text-sm mb-1">Estimated project cost</p>
          <div className="text-5xl font-black text-white mb-1">
            {result?.costRangeLow && result?.costRangeHigh
              ? `${formatCurrency(result.costRangeLow)} – ${formatCurrency(result.costRangeHigh)}`
              : "Calculating…"}
          </div>
          <p className="text-slate-400 text-sm">
            {result?.roomType && <span className="capitalize">{result.roomType} · </span>}
            {result?.estimatedArea && <span>{result.estimatedArea} m² · </span>}
            {result?.condition && <ConditionBadge condition={result.condition} />}
          </p>
        </div>

        
          {/* ── Accuracy reassurance ── */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <span className="inline-flex items-center gap-1.5 text-xs bg-slate-800/60 text-slate-400 px-3 py-1.5 rounded-full border border-slate-700/50">
              <CheckCircle2 className="w-3 h-3 text-green-500" /> Based on NI trade rates
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs bg-slate-800/60 text-slate-400 px-3 py-1.5 rounded-full border border-slate-700/50">
              <CheckCircle2 className="w-3 h-3 text-green-500" /> Updated Q2 2026
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs bg-slate-800/60 text-slate-400 px-3 py-1.5 rounded-full border border-slate-700/50">
              <CheckCircle2 className="w-3 h-3 text-green-500" /> Built by a working tradesman
            </span>
          </div>

          {/* Summary — always visible */}
        {result?.aiSummary && (
          <div className="bg-[#1E293B] rounded-xl p-5 mb-6 border border-slate-700">
            <h3 className="font-semibold mb-2 text-slate-200">AI Summary</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{result.aiSummary}</p>
          </div>
        )}

        {/* Recommended Work — always visible */}
        {result?.recommendedWork?.length > 0 && (
          <div className="bg-[#1E293B] rounded-xl p-5 mb-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-5 h-5 text-[#FF6B2C]" />
              <h3 className="font-semibold">Recommended Work</h3>
            </div>
            <ul className="space-y-1.5">
              {result.recommendedWork.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B2C] mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Time estimate — always visible */}
        {result?.timeEstimate && (
          <div className="bg-[#1E293B] rounded-xl p-5 mb-6 border border-slate-700 flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#FF6B2C] shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Estimated time</p>
              <p className="font-semibold">{result.timeEstimate}</p>
            </div>
          </div>
        )}

        {/* ââ Materials Preview + Pro Upsell ââ */}
        {!isProUser && (
          <>
            {/* Show first 3 key materials as a teaser */}
            {result?.keyMaterials?.length > 0 && (
              <div className="bg-[#1E293B] rounded-xl p-5 mb-6 border border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingCart className="w-5 h-5 text-[#FF6B2C]" />
                  <h3 className="font-semibold">Key Materials</h3>
                  <span className="text-xs text-slate-500 ml-auto">Preview — {result.keyMaterials.length} items total</span>
                </div>
                <ul className="space-y-2">
                  {result.keyMaterials.slice(0, 3).map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                  {result.keyMaterials.length > 3 && (
                    <>
                      {result.keyMaterials.slice(3, 5).map((item: string, i: number) => (
                        <li key={i + 3} className="flex items-center gap-2 text-sm text-slate-500 blur-[3px] select-none">
                          <CheckCircle2 className="w-4 h-4 text-green-400/50 shrink-0" />
                          {item}
                        </li>
                      ))}
                      <li className="text-center pt-2">
                        <span className="text-xs text-[#FF6B2C]">
                          + {result.keyMaterials.length - 3} more materials with Pro
                        </span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            )}

            {/* What you get with Pro — horizontal badges instead of 4 locked cards */}
            <div className="bg-[#1E293B]/60 rounded-xl p-5 mb-6 border border-slate-700/50">
              <p className="text-sm text-slate-400 mb-3">Included with Pro membership:</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700">
                  <ShoppingCart className="w-3.5 h-3.5 text-[#FF6B2C]" /> Full materials list with prices
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700">
                  <Ruler className="w-3.5 h-3.5 text-[#FF6B2C]" /> Detailed measurements
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700">
                  <FileText className="w-3.5 h-3.5 text-[#FF6B2C]" /> PDF export
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700">
                  <Tag className="w-3.5 h-3.5 text-[#FF6B2C]" /> Supplier discounts
                </span>
              </div>
            </div>

            {/* ── Renovation Pass — primary one-time offer ── */}
            <div className="bg-gradient-to-br from-[#FF6B2C]/10 to-[#1E293B] border border-[#FF6B2C]/30 rounded-xl p-6 text-center">
              <div className="inline-flex items-center gap-1.5 bg-[#FF6B2C]/20 text-[#FF6B2C] text-xs font-semibold px-3 py-1 rounded-full mb-3">
                <Lock className="w-3 h-3" /> One-time unlock
              </div>
              <h2 className="text-xl font-bold mb-1">Renovation Pass</h2>
              <p className="text-slate-400 text-sm mb-2 max-w-md mx-auto">
                Unlock the full breakdown for this project — itemised materials list, PDF export, and trade pricing. Valid for 90 days.
              </p>
              <div className="flex items-baseline justify-center gap-1 mb-4">
                <span className="text-3xl font-extrabold text-white">£14.99</span>
                <span className="text-slate-500 text-sm">one-time</span>
              </div>
              <Button
                onClick={() => { trackRenovationPassClick(); navigate("/pricing"); }}
                className="bg-[#FF6B2C] hover:bg-[#e55a1f] text-white font-semibold px-10 py-3 text-base mb-3"
              >
                Get Your Renovation Pass
              </Button>
              <p className="text-xs text-slate-500 mb-4">No subscription required. Pay once, access for 90 days.</p>
              <div className="border-t border-slate-700/50 pt-4 mt-2">
                <p className="text-xs text-slate-500 mb-2">Planning multiple projects?</p>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/pricing")}
                  className="text-[#FF6B2C] hover:text-[#e55a1f] text-sm"
                >
                  View Pro & Trade plans →
                </Button>
              </div>
              {!user && (
                <div className="mt-3">
                  <Button
                    variant="ghost"
                    onClick={() => window.location.href = getLoginUrl()}
                    className="text-slate-400 hover:text-slate-300 text-xs"
                  >
                    Already have an account? Sign in
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        {/* âââ Trade Margin Calculator (Trade tier only) ââââââââââââââââââ */}
        {isTradeUser && result?.costRangeLow != null && result?.costRangeHigh != null && (
          <TradeMarginCalculator materialsLow={result.costRangeLow} materialsHigh={result.costRangeHigh} />
        )}

        {/* âââ Visualisation Offer âââââââââââââââââââââââââââââââââââââââ */}
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-slate-700 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-[#FF6B2C]" />
            <h2 className="text-lg font-bold">See what it could look like</h2>
          </div>
          <p className="text-slate-400 text-sm mb-5">
            Generate a photorealistic AI render of your renovated room — based on your project type and chosen finishes.
            {isAuthenticated && visStatus?.tier === "free" && visStatus.remaining !== null && (
              <span className="ml-1 text-slate-500">({visStatus.remaining} free render{visStatus.remaining !== 1 ? "s" : ""} remaining)</span>
            )}
          </p>

          {generatedImageUrl && (
            <div className="mb-5 rounded-xl overflow-hidden border border-slate-700 cursor-pointer" onClick={() => setLightboxOpen(true)}>
              <img src={generatedImageUrl} alt="AI Visualisation" className="w-full object-cover max-h-72" />
              <p className="text-xs text-slate-500 text-center py-2">Click to view full size · Saved to your dashboard</p>
            </div>
          )}

          {isAuthenticated ? (
            visStatus?.canGenerate !== false ? (
              <Button
                className="bg-[#FF6B2C] hover:bg-[#e55a1f] text-white gap-2"
                onClick={() => setVisDialogOpen(true)}
                disabled={generateVisMutation.isPending}
              >
                {generateVisMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Generating…</>
                ) : (
                  <><Sparkles className="w-4 h-4" />{generatedImageUrl ? "Generate another" : "Generate AI Visualisation"}</>
                )}
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400">You've used all 3 free renders.</span>
                <Button size="sm" onClick={() => navigate("/pricing")} className="bg-[#FF6B2C] hover:bg-[#e55a1f] text-white">Get Early Access</Button>
              </div>
            )
          ) : (
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">Sign in to generate a free visualisation.</span>
              <a href={getLoginUrl()}>
                <Button size="sm" className="bg-[#FF6B2C] hover:bg-[#e55a1f] text-white">Sign in — it's free</Button>
              </a>
            </div>
          )}
        </div>

        {/* Post-estimate actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-4 mb-8">
          <Button
            onClick={() => navigate("/estimate")}
            className="bg-[#FF6B2C] hover:bg-[#e55a1f] text-white font-semibold px-8"
          >
            Start another estimate
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/pricing")}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            See pricing
          </Button>
          {!user && (
            <Button
              variant="outline"
              onClick={() => window.location.href = getLoginUrl()}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Save my results — sign in free
            </Button>
          )}
        </div>
      </div>

      {/* Generate Visualisation Dialog */}
      <Dialog open={visDialogOpen} onOpenChange={setVisDialogOpen}>
        <DialogContent className="max-w-md bg-[#1E293B] border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Generate AI Room Visualisation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-slate-300">Room Type</Label>
              <Select value={visRoomType} onValueChange={setVisRoomType}>
                <SelectTrigger className="mt-1 bg-[#0F172A] border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1E293B] border-slate-700">
                  {ROOM_TYPES.map(r => <SelectItem key={r.value} value={r.value} className="text-white">{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">Style / Finishes</Label>
              <Select value={visFinishes} onValueChange={setVisFinishes}>
                <SelectTrigger className="mt-1 bg-[#0F172A] border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1E293B] border-slate-700">
                  {FINISH_OPTIONS.map(f => <SelectItem key={f.value} value={f.value} className="text-white">{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300" htmlFor="vis-style">Additional details (optional)</Label>
              <Input
                id="vis-style"
                placeholder="e.g. dark grey tiles, walk-in shower, freestanding bath"
                value={visStylePrompt}
                onChange={e => setVisStylePrompt(e.target.value)}
                className="mt-1 bg-[#0F172A] border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <p className="text-xs text-slate-500">Generation takes 10–20 seconds. The image will be saved to your dashboard.</p>
            <Button
              className="w-full bg-[#FF6B2C] hover:bg-[#e55a1f] text-white"
              disabled={generateVisMutation.isPending}
              onClick={() => generateVisMutation.mutate({
                roomType: visRoomType,
                finishes: visFinishes,
                stylePrompt: visStylePrompt || undefined,
                leadId,
                photoUrl: lead?.photoUrl ?? undefined,
              })}
            >
              {generateVisMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Building your project visualisation — this takes about 15 seconds…</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />Generate</>  
                )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightboxOpen && generatedImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightboxOpen(false)}>
            <X className="w-8 h-8" />
          </button>
          <img src={generatedImageUrl} alt="AI Visualisation" className="max-w-full max-h-full rounded-xl object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
