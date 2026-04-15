import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Camera,
  CheckCircle,
  Clock,
  HardHat,
  Home,
  ListChecks,
  ShoppingBag,
  ShieldCheck,
  Zap,
  Quote,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import { trackWaitlistSignup, trackEstimateStart, trackNewBuildView } from "@/lib/analytics";

export default function HomePage() {
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const { data: waitlistData } = trpc.waitlist.count.useQuery();

  const joinWaitlist = trpc.waitlist.join.useMutation({
    onSuccess: () => {
      setWaitlistSubmitted(true);
      toast.success("You're on the list â we'll be in touch soon.");
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  function handleWaitlist(e: React.FormEvent, source = "homepage", buttonLabel = "Join Waitlist") {
    e.preventDefault();
    if (waitlistEmail) {
      trackWaitlistSignup();
      joinWaitlist.mutate({ email: waitlistEmail, source, buttonLabel });
    }
  }

  return (
    <div className="min-h-screen bg-background font-[Inter,sans-serif]">
      <title>Renolab â Home. The Renovation Platform for Northern Ireland.</title>
      <NavBar />

      {/* ââ Hero âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */}
      <section className="bg-[#0f1c2e] text-white pt-24 pb-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 text-sm px-4 py-1.5">
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            Built for Northern Ireland
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            Plan smarter. Buy at trade prices. Renovate with confidence.
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Built by an Irish tradesman. Designed for homeowners and tradespeople who want to stop guessing and start building properly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/estimate">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold px-10 text-base">
                Get My Free Estimate
              </Button>
            </Link>
          </div>
          <p className="mt-5 text-sm text-white/40">
            {waitlistData && waitlistData.count > 0
              ? `Join ${waitlistData.count} homeowners and tradespeople across Northern Ireland already on the waitlist.`
              : "Join homeowners and tradespeople across Northern Ireland already on the waitlist."}
          </p>
        </div>
      </section>

      {/* ââ Trust line âââââââââââââââââââââââââââââââââââââââââââââââââââ */}
      <section className="bg-[#0a1520] text-white/60 py-5 text-center text-sm border-b border-white/5">
        <p className="font-medium text-white/80">Built for real projects in the real world.</p>
        <p className="mt-1">Made for DIY homeowners and tradespeople who want faster planning, better buying, and less guesswork.</p>
      </section>

      {/* ââ Who is Renolab for âââââââââââââââââââââââââââââââââââââââââââ */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-4">Who is Renolab for?</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">Two types of people. One platform.</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Homeowners &amp; DIY</h3>
              <p className="text-muted-foreground leading-relaxed">
                Planning a renovation or building new? Renolab helps you understand what a project involves, what materials you'll likely need, and how to buy them at better prices â without needing trade experience. Use the renovation wizard for existing rooms or the New Build mode for house plans.
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <HardHat className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Tradespeople</h3>
              <p className="text-muted-foreground leading-relaxed">
                Pricing jobs takes time. Renolab speeds up the estimating process, generates materials lists from photos and measurements, and gives you a faster path from site visit to quote.
              </p>
            </div>
          </div>
          <div className="text-center mt-10">
            <Link href="/estimate">
              <Button size="lg" className="px-8">Start Your Project <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ââ How it works âââââââââââââââââââââââââââââââââââââââââââââââââ */}
      <section className="py-20 bg-background">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-4">How Renolab works</h2>
          <p className="text-center text-muted-foreground mb-14 max-w-xl mx-auto">Three steps from photos to a buying plan.</p>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: Camera,
                step: "1",
                title: "Upload your photos and project details",
                desc: "Add room photos, measurements, and a few simple project choices so Renolab understands what you're trying to do.",
              },
              {
                icon: ListChecks,
                step: "2",
                title: "Get a guided estimate and shopping list",
                desc: "Renolab builds a project estimate and generates a materials list based on your inputs.",
              },
              {
                icon: ShoppingBag,
                step: "3",
                title: "Unlock supplier discounts",
                desc: "Use your Renolab membership to access partner supplier discounts and member-only deals at the counter.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {item.step}
                  </div>
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-base leading-snug">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ââ What a Renolab estimate looks like ââââââââââââââââââââââââââ */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-4">What a Renolab estimate looks like</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">A real example. A bathroom renovation, itemised and ready to take to any supplier.</p>
          <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden max-w-2xl mx-auto">
            {/* Receipt header */}
            <div className="bg-[#0f1c2e] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">Renolab Estimate</p>
                <p className="text-white/60 text-xs mt-0.5">Bathroom Renovation â Mid-range</p>
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">Example Output</Badge>
            </div>
            {/* Line items */}
            <div className="divide-y divide-border">
              <div className="grid grid-cols-12 px-6 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">
                <span className="col-span-5">Material</span>
                <span className="col-span-2 text-right">Qty</span>
                <span className="col-span-2 text-right">Unit</span>
                <span className="col-span-3 text-right">Total</span>
              </div>
              {[
                { material: "Wall tiles (600Ã300mm)", qty: "18 mÂ²", unit: "Â£22.50", total: "Â£405.00" },
                { material: "Floor tiles (porcelain)", qty: "6 mÂ²", unit: "Â£28.00", total: "Â£168.00" },
                { material: "Tile adhesive (20kg bag)", qty: "6 bags", unit: "Â£12.00", total: "Â£72.00" },
                { material: "Shower enclosure (1200mm)", qty: "1 unit", unit: "Â£320.00", total: "Â£320.00" },
                { material: "Vanity unit + basin", qty: "1 unit", unit: "Â£285.00", total: "Â£285.00" },
                { material: "Plasterboard (2400Ã1200)", qty: "8 sheets", unit: "Â£18.50", total: "Â£148.00" },
              ].map((row) => (
                <div key={row.material} className="grid grid-cols-12 px-6 py-3 text-sm hover:bg-muted/30 transition-colors">
                  <span className="col-span-5 font-medium text-foreground">{row.material}</span>
                  <span className="col-span-2 text-right text-muted-foreground">{row.qty}</span>
                  <span className="col-span-2 text-right text-muted-foreground">{row.unit}</span>
                  <span className="col-span-3 text-right font-semibold">{row.total}</span>
                </div>
              ))}
              {/* Total row */}
              <div className="grid grid-cols-12 px-6 py-4 bg-primary/5 border-t-2 border-primary/20">
                <span className="col-span-9 font-bold text-base">Estimated Materials Total</span>
                <span className="col-span-3 text-right font-extrabold text-primary text-base">Â£1,398.00</span>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6 max-w-xl mx-auto">
            This is the kind of output Renolab generates â an itemised materials list with real pricing, ready to take to any supplier.
          </p>
          <p className="text-center text-sm text-primary/80 mt-3 max-w-xl mx-auto font-medium">
            Pro members can also generate a full 3D project visualisation from these inputs â see exactly what your finished room will look like.
          </p>
          <div className="text-center mt-6">
            <Link href="/estimate">
              <Button size="lg" className="px-8">Get My Free Estimate <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ââ New Build section âââââââââââââââââââââââââââââââââââââââââââ */}
      <section className="py-20 bg-background">
        <div className="container max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-sm px-3 py-1">
                ðï¸ New Build Mode
              </Badge>
              <h2 className="text-3xl font-extrabold mb-4 leading-tight">
                Building a new house? We've got you covered too.
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                No room photos yet â because the walls aren't up. Renolab's New Build mode lets you select your rooms, enter rough dimensions, choose a finish level, and get a full house fit-out estimate broken down room by room.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Perfect for self-builders, developers, and anyone working from house plans who needs a realistic budget before breaking ground.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/new-build">
                  <Button size="lg" className="px-8">
                    Get a New Build Estimate <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button size="lg" variant="outline" className="px-8">
                    How it works
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-muted/30 rounded-2xl border border-border p-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">New Build â 3-bed house example</p>
              <div className="flex flex-col gap-3">
                {[
                  { room: "Kitchen", range: "Â£4,200 â Â£6,800" },
                  { room: "Master Bathroom", range: "Â£2,800 â Â£4,500" },
                  { room: "En-Suite", range: "Â£1,600 â Â£2,800" },
                  { room: "Living Room", range: "Â£1,200 â Â£2,200" },
                  { room: "3Ã Bedrooms", range: "Â£900 â Â£1,800" },
                  { room: "Hallway", range: "Â£600 â Â£1,100" },
                ].map((row) => (
                  <div key={row.room} className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">{row.room}</span>
                    <span className="text-primary font-semibold">{row.range}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-3 mt-1 flex items-center justify-between">
                  <span className="font-bold">Total estimate</span>
                  <span className="text-primary font-extrabold text-base">Â£11,300 â Â£19,200</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">Indicative estimate only. Actual costs vary by specification and contractor.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ââ Why Renolab exists â Founder story ââââââââââââââââââââââââââ */}
      <section className="py-20 bg-[#0f1c2e] text-white">
        <div className="container max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-10">Why Renolab exists.</h2>
          <div className="relative">
            <Quote className="w-10 h-10 text-primary/40 mb-4" />
            <blockquote className="text-lg text-white/80 leading-relaxed">
              Renolab was built by Darren Kearney â a joiner, carpenter, and tradesman from Northern Ireland who spent years watching homeowners get ripped off and tradespeople waste hours on admin that should take minutes. After a career in joinery, fitted furniture, kitchens, and construction, Darren built Renolab to solve the problems he lived every day on site.
            </blockquote>
            <p className="mt-6 text-white/60 leading-relaxed">
              Renolab is not a tech company that discovered construction. It is a trade platform built from the inside out â by someone who has priced a job at 9pm, sourced timber at 7am, and built things with his own hands. That is the difference.
            </p>
          </div>
        </div>
      </section>

      {/* ââ Value propositions âââââââââââââââââââââââââââââââââââââââââââ */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-12">Why people use Renolab</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { icon: Clock, title: "Save time", desc: "No more bouncing between notes, supplier websites, and rough guesses." },
              { icon: ShoppingBag, title: "Buy smarter", desc: "Know what materials you likely need before you go near the trade counter." },
              { icon: ShieldCheck, title: "Avoid costly mistakes", desc: "Reduce over-ordering, missed items, and poor planning." },
              { icon: Zap, title: "Access better pricing", desc: "Use member-only supplier discounts designed to save money on real projects." },
              { icon: Camera, title: "Visualise every room before you buy a single tile", desc: "Generate a 3D visualisation of your finished room before you spend a penny. See exactly what your choices look like â walls, floors, fittings â all rendered from your project inputs." },
            ].map((item) => (
              <div key={item.title} className="bg-card border border-border rounded-xl p-6 flex flex-col gap-3">
                <item.icon className="w-6 h-6 text-primary" />
                <h3 className="font-bold text-sm">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ââ Two paths ââââââââââââââââââââââââââââââââââââââââââââââââââââ */}
      <section className="py-20 bg-background">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-12">Built for two types of user</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Home className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg">For DIY and homeowners</h3>
              </div>
              <ul className="space-y-3">
                {["Guided project planning", "Clearer budgeting", "Step-by-step shopping lists", "Confidence before spending money"].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#0f1c2e] text-white rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <HardHat className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg">For trade users</h3>
              </div>
              <ul className="space-y-3">
                {["Quicker estimating", "Repeatable materials lists", "Faster quoting", "Simpler buying for jobs"].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ââ Membership âââââââââââââââââââââââââââââââââââââââââââââââââââ */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-4">Memberships built around real value</h2>
          <p className="text-center text-muted-foreground mb-14 max-w-xl mx-auto">Start free. Upgrade when you need more.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col">
              <h3 className="font-bold text-xl mb-1">Free</h3>
              <p className="text-muted-foreground text-sm mb-4">Perfect for trying Renolab out</p>
              <div className="text-3xl font-extrabold mb-6">Â£0</div>
              <ul className="space-y-2.5 flex-1 mb-8">
                {["Limited project estimate", "Basic cost range", "Preview shopping list", "Browse partner suppliers"].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/estimate">
                <Button variant="outline" className="w-full">Get Started Free</Button>
              </Link>
            </div>
            {/* Pro */}
            <div className="bg-card border-2 border-primary rounded-2xl p-8 flex flex-col relative shadow-lg shadow-primary/10">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white border-0 whitespace-nowrap">Most Popular</Badge>
              <h3 className="font-bold text-xl mb-1">Pro</h3>
              <p className="text-muted-foreground text-sm mb-4">For homeowners and DIY users</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-extrabold">Â£9.99</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <ul className="space-y-2.5 flex-1 mb-8">
                {["Full guided estimates", "Full shopping lists", "Downloadable PDFs", "Saved projects", "Member-only supplier discounts", "Unlimited project visualisations"].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/pricing">
                <Button className="w-full">Get Early Access</Button>
              </Link>
            </div>
            {/* Trade */}
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col">
              <h3 className="font-bold text-xl mb-1">Trade</h3>
              <p className="text-muted-foreground text-sm mb-4">For installers, joiners, builders, and repeat users</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-extrabold">Â£24.99</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <ul className="space-y-2.5 flex-1 mb-8">
                {["Everything in Pro", "Faster workflow", "More saved projects", "Labour and margin options", "Reusable project templates", "Trade-focused supplier deals", "Unlimited visualisations â save to client project folders"].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/pricing">
                <Button variant="outline" className="w-full">Get Early Access</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ââ Supplier discounts âââââââââââââââââââââââââââââââââââââââââââ */}
      <section className="py-20 bg-[#0f1c2e] text-white">
        <div className="container max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-3xl font-extrabold mb-4">Member-only supplier discounts</h2>
          <p className="text-white/70 text-lg mb-4 leading-relaxed">
            Renolab is not just an estimating tool.<br />It helps you turn a project into a buying plan.
          </p>
          <p className="text-white/55 mb-10 leading-relaxed max-w-xl mx-auto">
            Members can access agreed discounts and offers with partner suppliers, helping both DIY users and tradespeople buy with more confidence. Supplier partnerships are currently being onboarded across Northern Ireland.
          </p>
          <Link href="/pricing">
            <Button size="lg" className="px-8 bg-primary hover:bg-primary/90">
              View Supplier Directory <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ââ Final CTA ââââââââââââââââââââââââââââââââââââââââââââââââââââ */}
      <section className="py-20 bg-primary text-white">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold mb-4">Stop guessing. Start planning properly.</h2>
          <p className="text-white/80 text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
            Whether you're renovating your own home or pricing work for a customer, Renolab helps you plan faster and buy smarter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/estimate">
              <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-semibold px-8">
                Get My Free Estimate
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ââ Footer âââââââââââââââââââââââââââââââââââââââââââââââââââââââ */}
      <footer className="bg-[#0a1520] text-white/40 py-10 text-center text-sm border-t border-white/5">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-xs">R</span>
          </div>
          <span className="font-semibold text-white/60">Renolab</span>
        </div>
        <p className="mb-1">Smart planning tools. Guided estimates. Supplier discounts.</p>
        <p>For homeowners and tradespeople.</p>
        <p className="mt-2 font-semibold text-white/60">Built for Northern Ireland. renolab.co.uk</p>
        <div className="flex justify-center gap-6 mt-6 text-white/30">
          <Link href="/how-it-works" className="hover:text-white/60 transition-colors">How It Works</Link>
          <Link href="/pricing" className="hover:text-white/60 transition-colors">Pricing</Link>
          <!-- Suppliers link hidden until partnerships are live -->
          <Link href="/tradespeople" className="hover:text-white/60 transition-colors">Tradespeople</Link>
        </div>
        <p className="mt-6 text-white/20">Â© {new Date().getFullYear()} Renolab. All rights reserved.</p>
      </footer>
    </div>
  );
}
