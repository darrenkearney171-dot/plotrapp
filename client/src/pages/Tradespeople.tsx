import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle,
  CheckCircle2,
  HardHat,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import NavBar from "@/components/NavBar";

const TRADES = [
  { value: "", label: "All Trades" },
  { value: "joiner_carpenter", label: "Joiner / Carpenter" },
  { value: "plumber", label: "Plumber" },
  { value: "electrician", label: "Electrician" },
  { value: "plasterer", label: "Plasterer" },
  { value: "painter_decorator", label: "Painter & Decorator" },
  { value: "roofer", label: "Roofer" },
  { value: "tiler", label: "Tiler" },
  { value: "builder_general", label: "General Builder" },
  { value: "kitchen_fitter", label: "Kitchen Fitter" },
  { value: "bathroom_fitter", label: "Bathroom Fitter" },
  { value: "landscaper", label: "Landscaper" },
  { value: "other", label: "Other" },
];

const TRADE_LABELS: Record<string, string> = Object.fromEntries(TRADES.slice(1).map(t => [t.value, t.label]));

export default function Tradespeople() {
  const [trade, setTrade] = useState("");
  const [region, setRegion] = useState("");
  const [search, setSearch] = useState("");

  // Introduction request state
  const [introTarget, setIntroTarget] = useState<any>(null);
  const [introName, setIntroName] = useState("");
  const [introEmail, setIntroEmail] = useState("");
  const [introPhone, setIntroPhone] = useState("");
  const [introProject, setIntroProject] = useState("");
  const [introSent, setIntroSent] = useState(false);

  const requestIntro = trpc.tradespeople.requestIntroduction.useMutation({
    onSuccess: () => { setIntroSent(true); toast.success("Introduction request sent!"); },
    onError: (e) => toast.error(e.message),
  });

  // Application form state
  const [appFullName, setAppFullName] = useState("");
  const [appTrade, setAppTrade] = useState("");
  const [appTown, setAppTown] = useState("");
  const [appPhone, setAppPhone] = useState("");
  const [appEmail, setAppEmail] = useState("");
  const [appSubmitted, setAppSubmitted] = useState(false);

  const { data: tradespeople, isLoading } = trpc.tradespeople.list.useQuery(
    trade || region ? { trade: trade || undefined, region: region || undefined } : undefined
  );

  const submitApplication = trpc.trade.submitApplication.useMutation({
    onSuccess: () => {
      setAppSubmitted(true);
      toast.success("Application received! We'll be in touch soon.");
    },
    onError: (e) => toast.error(e.message || "Something went wrong. Please try again."),
  });

  function handleApplicationSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitApplication.mutate({
      fullName: appFullName,
      trade: appTrade,
      town: appTown,
      phone: appPhone,
      email: appEmail,
    });
  }

  const filtered = tradespeople?.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background font-[Inter,sans-serif]">
      <title>Renolab â Tradespeople. The Renovation Platform for the island of Ireland.</title>
      <NavBar />

      {/* Launch banner */}
      <div className="bg-[#0f1c2e] text-white py-4 px-4 text-center">
        <p className="text-sm font-medium">
          Tradespeople listed here are part of our founding launch network. Full contact and booking features go live soon.{" "}
          <Link href="/pricing" className="underline text-primary hover:text-primary/80">Join the waitlist to be first.</Link>
        </p>
      </div>

      <main className="container py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Find a Tradesperson</h1>
          <p className="text-muted-foreground text-sm">Vetted tradespeople across the island of Ireland. All verified by Renolab.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name or region..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Input placeholder="Filter by region..." value={region} onChange={e => setRegion(e.target.value)} className="max-w-xs" />
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          {TRADES.map(t => (
            <button
              key={t.value}
              onClick={() => setTrade(t.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${trade === t.value ? "bg-primary text-white border-primary" : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-52 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(person => (
              <div key={person.id} className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {person.profilePhotoUrl ? (
                      <img src={person.profilePhotoUrl} alt={person.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <HardHat className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base truncate">{person.name}</h3>
                      {person.isVerified && (
                        <CheckCircle className="w-4 h-4 text-primary shrink-0" aria-label="Verified by Renolab" />
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs mt-1">{TRADE_LABELS[person.trade] ?? person.trade}</Badge>
                  </div>
                </div>

                {/* Vetted badge â replaces star rating */}
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Vetted by Renolab
                  </Badge>
                </div>

                {person.bio && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{person.bio}</p>}

                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {person.region}</div>
                  {person.yearsExperience && <div className="flex items-center gap-1.5"><HardHat className="w-3 h-3" /> {person.yearsExperience} years experience</div>}
                </div>

                <div className="mt-auto pt-2 border-t border-border flex flex-col gap-1.5">
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold" onClick={() => setIntroTarget(person)}>
                    Request Introduction
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
            <HardHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No tradespeople found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your filters or check back soon.</p>
          </div>
        )}

        {/* ââ Apply to join section âââââââââââââââââââââââââââââââââââââââ */}
        <section className="mt-20 bg-[#0f1c2e] text-white rounded-2xl p-10">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-extrabold mb-3">Are you a tradesperson in the island of Ireland?</h2>
            <p className="text-white/70 mb-8 leading-relaxed">
              Get listed on Renolab and receive verified job leads from homeowners in your area. Free to apply during our founding launch period.
            </p>

            {appSubmitted ? (
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
                <p className="font-semibold text-lg mb-1">Application received!</p>
                <p className="text-white/60 text-sm">We'll review your application and be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleApplicationSubmit} className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-white/80 text-sm">Full name</Label>
                  <Input
                    value={appFullName}
                    onChange={e => setAppFullName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-white/80 text-sm">Trade or skill</Label>
                  <Input
                    value={appTrade}
                    onChange={e => setAppTrade(e.target.value)}
                    placeholder="e.g. Joiner, Plumber, Tiler"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-white/80 text-sm">Town or area</Label>
                  <Input
                    value={appTown}
                    onChange={e => setAppTown(e.target.value)}
                    placeholder="e.g. Belfast, Derry, Newry"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-white/80 text-sm">Phone number</Label>
                  <Input
                    type="tel"
                    value={appPhone}
                    onChange={e => setAppPhone(e.target.value)}
                    placeholder="+44 7700 000000"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label className="text-white/80 text-sm">Email address</Label>
                  <Input
                    type="email"
                    value={appEmail}
                    onChange={e => setAppEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
                    disabled={submitApplication.isPending}
                  >
                    {submitApplication.isPending ? "Submittingâ¦" : "Apply to join Renolab"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* Introduction Request Dialog */}
      <Dialog open={!!introTarget} onOpenChange={(open) => { if (!open) { setIntroTarget(null); setIntroSent(false); setIntroName(""); setIntroEmail(""); setIntroPhone(""); setIntroProject(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {introSent ? "Request sent!" : `Request introduction to ${introTarget?.name}`}
            </DialogTitle>
          </DialogHeader>
          {introSent ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                We'll review your request and connect you with {introTarget?.name} within 1 business day.
              </p>
              <Button onClick={() => { setIntroTarget(null); setIntroSent(false); }}>Close</Button>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <p className="text-sm text-muted-foreground">
                Fill in your details and we'll introduce you to {introTarget?.name} ({introTarget?.trade?.replace(/_/g, " ")}).
              </p>
              <div>
                <Label>Your name *</Label>
                <Input value={introName} onChange={e => setIntroName(e.target.value)} className="mt-1" placeholder="Full name" />
              </div>
              <div>
                <Label>Your email *</Label>
                <Input type="email" value={introEmail} onChange={e => setIntroEmail(e.target.value)} className="mt-1" placeholder="email@example.com" />
              </div>
              <div>
                <Label>Phone (optional)</Label>
                <Input value={introPhone} onChange={e => setIntroPhone(e.target.value)} className="mt-1" placeholder="Phone number" />
              </div>
              <div>
                <Label>Tell us about your project (optional)</Label>
                <Textarea value={introProject} onChange={e => setIntroProject(e.target.value)} className="mt-1" rows={3} placeholder="E.g. I need a kitchen fitted in Belfast, roughly 4m run..." />
              </div>
              <Button
                className="w-full"
                disabled={!introName || !introEmail || requestIntro.isPending}
                onClick={() => requestIntro.mutate({
                  tradespersonId: introTarget?.id,
                  requesterName: introName,
                  requesterEmail: introEmail,
                  requesterPhone: introPhone || undefined,
                  projectDescription: introProject || undefined,
                })}
              >
                {requestIntro.isPending ? "Sending..." : "Send Introduction Request"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Â© {new Date().getFullYear()} Renolab. All rights reserved.</p>
          <p className="mt-1 font-medium text-foreground">Built on the island of Ireland. renolab.co.uk</p>
        </div>
      </footer>
    </div>
  );
}
