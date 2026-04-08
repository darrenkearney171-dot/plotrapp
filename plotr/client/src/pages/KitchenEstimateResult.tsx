import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { trackEstimateComplete, trackQuoteRequest } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft, CheckCircle2, Lock, Ruler, Truck, Wrench, ChevronDown, ChevronUp, Phone, Mail,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return `£${n.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;
}

function fmtRange(lo: number | null | undefined, hi: number | null | undefined) {
  if (lo == null || hi == null) return "—";
  if (lo === hi) return fmt(lo);
  return `${fmt(lo)} – ${fmt(hi)}`;
}

// ─── Quote Request Modal ──────────────────────────────────────────────────────

function QuoteModal({
  estimateId, userType, category, supplyMode, estimateLow, estimateHigh, aiSummary,
  onClose,
}: {
  estimateId: number; userType: string; category: string; supplyMode: string;
  estimateLow?: number; estimateHigh?: number; aiSummary?: string;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const requestQuote = trpc.fitted.requestQuote.useMutation({
    onSuccess: () => { trackQuoteRequest(category); setSubmitted(true); },
    onError: (err) => toast.error(err.message),
  });

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Quote request sent!</h2>
            <p className="text-muted-foreground text-sm">
              We'll review your specification and be in touch within 1 business day with a formal quote.
            </p>
            <Button onClick={onClose} className="w-full">Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="max-w-lg w-full my-4">
        <CardHeader>
          <CardTitle className="text-lg">Request a formal quote</CardTitle>
          <p className="text-sm text-muted-foreground">
            We'll review your specification and send a confirmed quote within 1 business day.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Your name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Phone (optional)</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+44 7700 900000" />
          </div>
          <div className="space-y-1.5">
            <Label>Additional notes (optional)</Label>
            <Textarea
              value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any specific requirements, site access details, preferred start date…"
              rows={3}
            />
          </div>

          <div className="p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">What happens next?</p>
            <p>1. We review your specification and estimate</p>
            <p>2. Our team contacts you within 1 business day</p>
            <p>3. We issue a formal written quote with lead time</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button
              onClick={() => requestQuote.mutate({
                fittedEstimateId: estimateId,
                name, email, phone: phone || undefined,
                userType: userType as "homeowner" | "trade",
                category,
                supplyMode: supplyMode as "supply_only" | "supply_and_fit",
                projectSummary: aiSummary,
                estimateRangeLow: estimateLow,
                estimateRangeHigh: estimateHigh,
                notes: notes || undefined,
              })}
              disabled={!name || !email || requestQuote.isPending}
              className="flex-1"
            >
              {requestQuote.isPending ? "Sending…" : "Send quote request"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Upsell Banner ────────────────────────────────────────────────────────────

function UpsellBanner({ tier, userType }: { tier: string; userType: string }) {
  const [, navigate] = useLocation();
  if (tier !== "free") return null;
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-foreground text-sm">
              {userType === "trade" ? "Upgrade to Trade for the full per-metre breakdown" : "Upgrade to Pro for the full shopping list"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {userType === "trade"
                ? "Trade plan includes blended per-linear-metre pricing, optional extras split-out, and formal quote CTA."
                : "Pro plan includes the full itemised shopping list with indicative price ranges per item."}
            </p>
          </div>
          <Button size="sm" onClick={() => navigate("/pricing")} className="shrink-0">Upgrade</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function KitchenEstimateResult() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [showQuote, setShowQuote] = useState(false);
  const [showList, setShowList] = useState(false);

  // Track kitchen estimate result view
  useEffect(() => { trackEstimateComplete("kitchen"); }, []);

  // The result is passed via location state from the wizard mutation
  // We also support loading from the DB for direct URL access
  const { data: estimate, isLoading } = trpc.fitted.getEstimate.useQuery(
    { id: Number(id) },
    { enabled: !!id && !isNaN(Number(id)) }
  );

  // The full result (with shopping list etc.) is stored in sessionStorage by the wizard
  const [cachedResult] = useState<any>(() => {
    try {
      const raw = sessionStorage.getItem(`kitchen-result-${id}`);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Loading your estimate…</p>
        </div>
      </div>
    );
  }

  if (!estimate && !cachedResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Estimate not found.</p>
          <Button onClick={() => navigate("/kitchen-estimator")}>Start new estimate</Button>
        </div>
      </div>
    );
  }

  // Merge DB estimate with cached result (cached has more detail)
  const result = cachedResult ?? estimate;
  const tier: "free" | "pro" | "trade" = result?.tier ?? "free";
  const isTrade = tier === "trade";
  const isPro = tier === "pro";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/kitchen-estimator")} className="gap-1.5 -ml-2">
            <ArrowLeft className="w-4 h-4" /> New estimate
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Kitchen Estimate</h1>
            <p className="text-xs text-muted-foreground">
              {result?.runLengthMetres}m run · {result?.supplyMode === "supply_and_fit" ? "Supply & Fit" : "Supply Only"}
            </p>
          </div>
          <Badge variant={isTrade ? "default" : isPro ? "secondary" : "outline"} className="capitalize">
            {tier} plan
          </Badge>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* ── TRADE OUTPUT ─────────────────────────────────────────────── */}
        {isTrade && (
          <>
            {/* Per-LM hero card */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="pt-6 pb-6">
                <div className="text-center mb-6">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Blended cabinetry rate
                  </p>
                  <div className="text-4xl font-bold text-foreground">
                    {fmtRange(result.perLinearMetreLow, result.perLinearMetreHigh)}
                    <span className="text-lg font-normal text-muted-foreground ml-2">/ linear metre</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Based on {result.runLengthMetres}m run · dynamically calculated from selected spec
                  </p>
                </div>

                <Separator className="my-4" />

                {/* Cabinetry total */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-background rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Total cabinetry</p>
                    <p className="text-xl font-bold text-foreground">
                      {fmtRange(result.totalCabinetryLow, result.totalCabinetryHigh)}
                    </p>
                    <p className="text-xs text-muted-foreground">supply {result.supplyMode === "supply_and_fit" ? "+ fit" : "only"}</p>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Grand total</p>
                    <p className="text-xl font-bold text-foreground">
                      {fmtRange(result.grandTotalLow, result.grandTotalHigh)}
                    </p>
                    <p className="text-xs text-muted-foreground">inc. all extras below</p>
                  </div>
                </div>

                {/* Optional extras — separated out */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Optional extras</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className={`p-2.5 rounded-lg border text-center ${result.worktopIncluded ? "border-green-200 bg-green-50" : "border-border bg-muted/30"}`}>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Ruler className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">Worktop</span>
                      </div>
                      {result.worktopIncluded ? (
                        <p className="text-sm font-semibold text-green-700">{fmt(result.worktopCost)}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">Not included</p>
                      )}
                    </div>
                    <div className={`p-2.5 rounded-lg border text-center ${result.fittingIncluded ? "border-blue-200 bg-blue-50" : "border-border bg-muted/30"}`}>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Wrench className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">Fitting</span>
                      </div>
                      {result.fittingIncluded ? (
                        <p className="text-sm font-semibold text-blue-700">{fmt(result.fittingCost)}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">Not included</p>
                      )}
                    </div>
                    <div className="p-2.5 rounded-lg border border-border bg-muted/30 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Truck className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">Delivery</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{fmt(result.deliveryCost)}</p>
                    </div>
                  </div>
                  {result.appliancesAllowance > 0 && (
                    <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50 text-center">
                      <span className="text-xs font-medium text-foreground">Appliances allowance: </span>
                      <span className="text-sm font-semibold text-amber-700">{fmt(result.appliancesAllowance)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI summary */}
            {result.aiSummary && (
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.aiSummary}</p>
                </CardContent>
              </Card>
            )}

            {/* Quote CTA */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-foreground">Ready to proceed?</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Request a formal written quote — we'll confirm pricing and lead time within 1 business day.
                    </p>
                  </div>
                  <Button onClick={() => setShowQuote(true)} size="lg" className="shrink-0">
                    Request formal quote
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── PRO OUTPUT ───────────────────────────────────────────────── */}
        {isPro && (
          <>
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">Total estimate range</p>
                  <div className="text-4xl font-bold text-foreground">
                    {fmtRange(result.grandTotalLow, result.grandTotalHigh)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.supplyMode === "supply_and_fit" ? "Supply & fit" : "Supply only"} · {result.runLengthMetres}m run
                  </p>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-3 gap-3 text-center">
                  {result.worktopIncluded && (
                    <div className="p-2 rounded-lg bg-muted/40">
                      <p className="text-xs text-muted-foreground">Worktop</p>
                      <p className="font-semibold text-foreground text-sm">{fmt(result.worktopCost)}</p>
                    </div>
                  )}
                  {result.fittingIncluded && (
                    <div className="p-2 rounded-lg bg-muted/40">
                      <p className="text-xs text-muted-foreground">Fitting</p>
                      <p className="font-semibold text-foreground text-sm">{fmt(result.fittingCost)}</p>
                    </div>
                  )}
                  {result.appliancesAllowance > 0 && (
                    <div className="p-2 rounded-lg bg-muted/40">
                      <p className="text-xs text-muted-foreground">Appliances</p>
                      <p className="font-semibold text-foreground text-sm">{fmt(result.appliancesAllowance)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Full shopping list */}
            {result.shoppingListFull?.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Full shopping list</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowList(!showList)} className="gap-1">
                      {showList ? <><ChevronUp className="w-4 h-4" /> Hide</> : <><ChevronDown className="w-4 h-4" /> Show</>}
                    </Button>
                  </div>
                </CardHeader>
                {showList && (
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 text-muted-foreground font-medium">Item</th>
                            <th className="text-right py-2 text-muted-foreground font-medium">Qty</th>
                            <th className="text-right py-2 text-muted-foreground font-medium">Unit</th>
                            <th className="text-right py-2 text-muted-foreground font-medium">Price range</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.shoppingListFull.map((item: any, i: number) => (
                            <tr key={i} className="border-b border-border/50 last:border-0">
                              <td className="py-2 text-foreground">{item.item}</td>
                              <td className="py-2 text-right text-foreground">{item.qty}</td>
                              <td className="py-2 text-right text-muted-foreground">{item.unit}</td>
                              <td className="py-2 text-right text-foreground font-medium">
                                {fmtRange(item.priceRangeLow, item.priceRangeHigh)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {result.aiSummary && (
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.aiSummary}</p>
                </CardContent>
              </Card>
            )}

            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-foreground">Want a confirmed price?</p>
                    <p className="text-sm text-muted-foreground mt-0.5">Request a formal quote from our team.</p>
                  </div>
                  <Button onClick={() => setShowQuote(true)} size="lg" className="shrink-0">
                    Request formal quote
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── FREE OUTPUT ──────────────────────────────────────────────── */}
        {tier === "free" && (
          <>
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">Estimated range</p>
                  <div className="text-4xl font-bold text-foreground">
                    {fmtRange(result.grandTotalLow, result.grandTotalHigh)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.supplyMode === "supply_and_fit" ? "Supply & fit" : "Supply only"} · {result.runLengthMetres}m run
                  </p>
                </div>

                {result.aiSummary && (
                  <>
                    <Separator className="my-4" />
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.aiSummary}</p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Preview list — names + quantities only */}
            {result.shoppingListPreview?.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Materials overview</CardTitle>
                    <Badge variant="outline" className="text-xs gap-1"><Lock className="w-3 h-3" /> Prices locked</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.shoppingListPreview.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                        <span className="text-sm text-foreground">{item.item}</span>
                        <span className="text-sm text-muted-foreground">{item.qty} {item.unit}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground flex items-start gap-2">
                    <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>Upgrade to Pro to see indicative price ranges per item, or to Trade for the blended per-linear-metre rate.</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <UpsellBanner tier={tier} userType={result.userType ?? "homeowner"} />

            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-foreground">Want a confirmed price?</p>
                    <p className="text-sm text-muted-foreground mt-0.5">Request a formal quote — no account needed.</p>
                  </div>
                  <Button onClick={() => setShowQuote(true)} size="lg" className="shrink-0">
                    Request formal quote
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Contact info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground justify-center pt-2">
          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> Call us for a quick chat</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> hello@plotrapp.co.uk</span>
        </div>

      </div>

      {/* Quote modal */}
      {showQuote && (
        <QuoteModal
          estimateId={Number(id)}
          userType={(result?.userType ?? "homeowner") as "homeowner" | "trade"}
          category="kitchen"
          supplyMode={(result?.supplyMode ?? "supply_and_fit") as "supply_only" | "supply_and_fit"}
          estimateLow={result?.grandTotalLow}
          estimateHigh={result?.grandTotalHigh}
          aiSummary={result?.aiSummary}
          onClose={() => setShowQuote(false)}
        />
      )}
    </div>
  );
}
