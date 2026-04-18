import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NavBar from "@/components/NavBar";
import { trackPageView } from "@/lib/analytics";
import {
  ArrowRight,
  Camera,
  CheckCircle,
  ClipboardList,
  CreditCard,
  HardHat,
  Home,
  ImageIcon,
  Layers,
  Lock,
  MapPin,
  Ruler,
  ShoppingBag,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";

// ─── Step component ───────────────────────────────────────────────────────────

function Step({
  number,
  icon: Icon,
  title,
  description,
  badge,
}: {
  number: number;
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
          {number}
        </div>
        <div className="w-px flex-1 bg-border mt-3" />
      </div>
      <div className="pb-10">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-base">{title}</h3>
          {badge && (
            <Badge className="text-xs bg-primary/10 text-primary border-primary/20">{badge}</Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ─── Feature row ──────────────────────────────────────────────────────────────

function FeatureRow({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 py-5 border-b border-border last:border-0">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-0.5">{title}</h4>
        <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HowItWorks() {
  useEffect(() => { trackPageView("How It Works"); }, []);

  return (
    <div className="min-h-screen bg-background font-[Inter,sans-serif]">
      <title>How It Works  Renolab. The Renovation Platform for Northern Ireland.</title>
      <NavBar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#0f1c2e] text-white py-20">
        <div className="container max-w-3xl mx-auto text-center">
          <Badge className="mb-5 bg-primary/20 text-primary border-primary/30">How Renolab Works</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
            From rough idea to priced project  in minutes.
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
            Renolab takes the guesswork out of renovation. Whether you're a homeowner planning a bathroom or a tradesperson pricing a kitchen, here's exactly what Renolab does for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/estimate">
              <Button className="bg-primary hover:bg-primary/90 text-white px-8 gap-2">
                Get My Free Estimate <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                Get Early Access
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Who it's for ──────────────────────────────────────────────────── */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-2xl font-extrabold text-center mb-10">Built for two types of people</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Homeowners */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Home className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Homeowners & DIY</h3>
                  <p className="text-muted-foreground text-xs">Planning a renovation yourself</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                You've got a room that needs work but no idea what it'll cost, what materials you need, or who to trust. Renolab gives you an instant, itemised estimate based on your actual room  so you can walk into any supplier or tradesperson conversation knowing your numbers.
              </p>
              <ul className="space-y-2">
                {[
                  "No experience needed  just answer a few questions",
                  "Instant cost range based on your room and finishes",
                  "Full materials list with quantities and trade pricing",
                  "Find vetted local tradespeople when you're ready",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tradespeople */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <HardHat className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Tradespeople & Contractors</h3>
                  <p className="text-muted-foreground text-xs">Pricing jobs and managing clients</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                You're spending hours pricing jobs that don't convert, sourcing materials manually, and dealing with customers who have no idea what things cost. Renolab speeds up your estimating workflow and connects you with homeowners who are already priced and ready to proceed.
              </p>
              <ul className="space-y-2">
                {[
                  "Price a job in minutes, not hours",
                  "Generate client-facing estimates with your margin built in",
                  "Access trade-priced materials from our supplier network",
                  "Get listed in the Renolab tradesperson directory",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Step by step  Homeowners ──────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Homeowner journey */}
            <div>
              <div className="flex items-center gap-2 mb-8">
                <Home className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-extrabold">For Homeowners</h2>
              </div>
              <Step
                number={1}
                icon={Camera}
                title="Upload a photo of your room"
                description="Take a photo of the room you want to renovate and upload it. Renolab's AI analyses the space  identifying the room type, approximate dimensions, and current condition."
              />
              <Step
                number={2}
                icon={Ruler}
                title="Enter your measurements"
                description="Add the room dimensions  length, width, and height. If you don't have exact figures, a rough estimate is fine. Renolab uses these to calculate material quantities accurately."
              />
              <Step
                number={3}
                icon={Layers}
                title="Choose your finishes and style"
                description="Pick your preferred finish level  budget, mid-range, or premium  and describe the style you're going for. Renolab uses this to tailor the materials list and cost range to your actual choices."
              />
              <Step
                number={4}
                icon={ClipboardList}
                title="Get your instant estimate"
                description="Renolab generates a cost range and itemised materials list in seconds. You'll see exactly what materials you likely need, in what quantities, and at what trade price  before you've spoken to a single supplier."
              />
              <Step
                number={5}
                icon={Sparkles}
                title="Visualise the finished room"
                badge="AI"
                description="Generate a photorealistic AI render of your finished room based on your inputs. See what your choices look like  tiles, fittings, finishes  before you spend a penny. Free users get 3 renders. Pro members get unlimited."
              />
              <Step
                number={6}
                icon={ShoppingBag}
                title="Buy at trade prices"
                description="Use your materials list to shop directly with Renolab's partner suppliers at member-only trade prices. No more paying retail when trade accounts are available."
              />
              <div className="mt-2">
                <Link href="/estimate">
                  <Button className="gap-2">
                    Start My Free Estimate <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Tradesperson journey */}
            <div>
              <div className="flex items-center gap-2 mb-8">
                <HardHat className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-extrabold">For Tradespeople</h2>
              </div>
              <Step
                number={1}
                icon={Camera}
                title="Upload a site photo"
                description="On a customer visit, take a photo of the room and upload it to Renolab. The AI analyses the space instantly  no tape measure needed for a first-pass estimate."
              />
              <Step
                number={2}
                icon={Ruler}
                title="Add dimensions and spec"
                description="Enter the room dimensions and the specification your customer wants. Renolab builds the materials list from your inputs  not from generic templates."
              />
              <Step
                number={3}
                icon={CreditCard}
                title="Add your margin"
                description="Trade members can add a labour rate and margin percentage on top of the materials cost. Renolab calculates the full job price  materials plus labour  ready to present to your customer."
              />
              <Step
                number={4}
                icon={ClipboardList}
                title="Generate a client estimate"
                description="Download a branded PDF estimate to share with your customer. Professional, itemised, and generated in minutes rather than hours."
              />
              <Step
                number={5}
                icon={ImageIcon}
                title="Visualise the finished room for your client"
                badge="Trade"
                description="Generate an AI visualisation of the finished room and save it to your client's project folder. Show customers exactly what their renovation will look like  before any work starts."
              />
              <Step
                number={6}
                icon={MapPin}
                title="Get found by local homeowners"
                description="Join the Renolab tradesperson directory and get introduced to homeowners in Northern Ireland who are already priced, ready to proceed, and looking for someone they can trust."
              />
              <div className="mt-2">
                <Link href="/tradespeople">
                  <Button variant="outline" className="gap-2">
                    Apply to Join the Network <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── New Build Mode ────────────────────────────────────────── */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-sm px-3 py-1">
              <�️ New Build Mode
            </Badge>
          </div>
          <h2 className="text-2xl font-extrabold text-center mb-3">Building a new house? No photos needed.</h2>
          <p className="text-muted-foreground text-center text-sm mb-12 max-w-2xl mx-auto">
            If you're a self-builder, developer, or working from house plans, Renolab's New Build mode lets you get a full room-by-room fit-out estimate without needing a single photo. Just select your rooms, enter rough dimensions, and choose a finish level.
          </p>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-0">
              <Step
                number={1}
                icon={Home}
                title="Select your rooms"
                description="Choose every room in your new build from a list  kitchen, bathrooms, bedrooms, living room, hallway, utility, and more. Add duplicates for houses with multiple bathrooms or bedrooms."
              />
              <Step
                number={2}
                icon={Ruler}
                title="Enter rough dimensions"
                description="Add the approximate width, length, and height for each room. You don't need exact measurements  estimates from your house plans are fine at this stage."
              />
              <Step
                number={3}
                icon={Layers}
                title="Choose a finish level"
                description="Select budget, mid-range, or premium finishes. Renolab adjusts the materials list and cost range for every room based on the spec level you choose."
              />
              <Step
                number={4}
                icon={ClipboardList}
                title="Get a full house estimate"
                description="Renolab generates a per-room cost breakdown and a grand total for your entire build. Each room shows a cost range, recommended work, and key materials  all in one place."
              />
              <div className="mt-2">
                <Link href="/new-build">
                  <Button className="gap-2">
                    Get a New Build Estimate <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-5">What you get  3-bed house example</p>
              <div className="space-y-3">
                {[
                  { room: "Kitchen", range: "�4,200  �6,800", note: "Units, worktops, splashback, flooring" },
                  { room: "Master Bathroom", range: "�2,800  �4,500", note: "Full suite, tiling, flooring" },
                  { room: "En-Suite", range: "�1,600  �2,800", note: "Shower, basin, tiling" },
                  { room: "Living Room", range: "�1,200  �2,200", note: "Flooring, painting, skirting" },
                  { room: "3� Bedrooms", range: "�900  �1,800", note: "Flooring, painting per room" },
                  { room: "Hallway", range: "�600  �1,100", note: "Flooring, painting, stairs" },
                ].map((row) => (
                  <div key={row.room} className="flex items-start justify-between text-sm gap-4">
                    <div>
                      <p className="font-medium">{row.room}</p>
                      <p className="text-muted-foreground text-xs">{row.note}</p>
                    </div>
                    <span className="text-primary font-semibold shrink-0">{row.range}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-3 mt-1 flex items-center justify-between">
                  <span className="font-bold">Total estimate</span>
                  <span className="text-primary font-extrabold">�11,300  �19,200</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">Indicative estimate. Actual costs vary by specification and contractor.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What makes Renolab different ───────────────────────────── */}
      <section className="py-20 bg-[#0f1c2e] text-white">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold text-center mb-3">What makes Renolab different</h2>
          <p className="text-white/60 text-center text-sm mb-12 max-w-xl mx-auto">
            There are other estimating tools out there. Here's why Renolab is built differently.
          </p>
          <div className="grid md:grid-cols-2 gap-x-12">
            <div>
              <FeatureRow
                icon={Camera}
                title="AI photo analysis, not generic templates"
                desc="Most estimating tools ask you to fill in a form. Renolab analyses your actual room photo  identifying condition, layout, and features  and builds the estimate from that."
              />
              <FeatureRow
                icon={MapPin}
                title="Built for Northern Ireland"
                desc="Renolab is built by a Northern Ireland tradesman, with Irish suppliers, tradespeople, and pricing in mind. Not a generic UK tool with Ireland bolted on."
              />
              <FeatureRow
                icon={ShoppingBag}
                title="Trade pricing, not retail"
                desc="Renolab's supplier network gives members access to trade-account pricing. The same prices a professional builder pays  available to homeowners and tradespeople alike."
              />
            </div>
            <div>
              <FeatureRow
                icon={Sparkles}
                title="AI room visualisation included"
                desc="See what your finished room looks like before you buy a single tile. Renolab generates photorealistic renders from your project inputs  no design software needed."
              />
              <FeatureRow
                icon={Users}
                title="Vetted local tradespeople"
                desc="Every tradesperson in the Renolab directory is part of our founding launch network  verified, local, and introduced by request rather than cold-called."
              />
              <FeatureRow
                icon={Zap}
                title="Fast enough to use on site"
                desc="Renolab is designed to work on a phone, on a customer visit, in a van. Get a first-pass estimate in under 3 minutes  before you've left the property."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing summary ───────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold text-center mb-3">Simple, honest pricing</h2>
          <p className="text-muted-foreground text-center text-sm mb-12 max-w-xl mx-auto">
            Start for free. Upgrade when you need more.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Free",
                price: "�0",
                desc: "Try Renolab with no commitment",
                features: ["Basic cost range estimate", "Preview materials list", "3 free AI room visualisations", "Browse partner suppliers"],
                cta: "Get Started Free",
                href: "/estimate",
                highlight: false,
              },
              {
                name: "Pro",
                price: "�9.99/mo",
                desc: "For homeowners and DIY users",
                features: ["Full guided estimates", "Full itemised shopping lists", "Downloadable PDFs", "Saved projects", "Unlimited AI visualisations", "Member-only supplier discounts"],
                cta: "Get Early Access",
                href: "/pricing",
                highlight: true,
              },
              {
                name: "Trade",
                price: "�24.99/mo",
                desc: "For installers, joiners, and builders",
                features: ["Everything in Pro", "Labour and margin options", "Client-facing estimates", "Reusable project templates", "Unlimited visualisations  save to client folders", "Trade-focused supplier deals"],
                cta: "Get Early Access",
                href: "/pricing",
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-7 flex flex-col ${plan.highlight ? "bg-primary text-white border-2 border-primary shadow-lg shadow-primary/20" : "bg-card border border-border"}`}
              >
                <h3 className={`font-bold text-lg mb-0.5 ${plan.highlight ? "text-white" : ""}`}>{plan.name}</h3>
                <p className={`text-xs mb-3 ${plan.highlight ? "text-white/70" : "text-muted-foreground"}`}>{plan.desc}</p>
                <p className={`text-2xl font-extrabold mb-5 ${plan.highlight ? "text-white" : ""}`}>{plan.price}</p>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlight ? "text-white/80" : "text-primary"}`} />
                      <span className={plan.highlight ? "text-white/90" : ""}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <Button
                    className={`w-full ${plan.highlight ? "bg-white text-primary hover:bg-white/90" : ""}`}
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-center mb-12">Common questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "Is the estimate accurate enough to use for a real project?",
                a: "Renolab generates a cost range and materials list based on your room photo, dimensions, and finish choices. It is designed to give you a reliable ballpark  accurate enough to have an informed conversation with a supplier or tradesperson. It is not a formal quote. For a binding price, you'll need a tradesperson to survey the job in person.",
              },
              {
                q: "Do I need to create an account to get an estimate?",
                a: "No. You can get a basic cost range estimate without creating an account. Creating a free account unlocks the full materials list, saved projects, and your 3 free AI room visualisations.",
              },
              {
                q: "What is a project visualisation?",
                a: "A project visualisation is a photorealistic AI-generated image of what your finished room could look like, based on the room type, dimensions, and finish choices you entered during your estimate. It is not a photo of your actual room  it is an AI render that shows you how your choices might look in a real space.",
              },
              {
                q: "How does the tradesperson directory work?",
                a: "Tradespeople in the Renolab directory are part of our founding launch network  verified, local, and introduced by request. Homeowners can request an introduction to a tradesperson. Tradespeople can apply to join the network via the Tradespeople page.",
              },
              {
                q: "When will Renolab fully launch?",
                a: "Renolab is currently in pre-launch. The estimate tool and directory are live. Full Pro and Trade memberships, supplier discount access, and the complete feature set will be available at launch. Join the waitlist to be notified first and lock in founding member pricing.",
              },
              {
                q: "Is Renolab only for Northern Ireland?",
                a: "For now, yes. Renolab is built specifically for Northern Ireland  with local suppliers, local tradespeople, and pricing that reflects the local trade market. We may expand to GB in the future.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-border pb-6">
                <h3 className="font-semibold text-base mb-2">{q}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#0f1c2e] text-white">
        <div className="container max-w-2xl mx-auto text-center">
          <Star className="w-10 h-10 text-primary mx-auto mb-5" />
          <h2 className="text-3xl font-extrabold mb-4">Ready to stop guessing?</h2>
          <p className="text-white/70 mb-8 max-w-md mx-auto">
            Get a free estimate in under 3 minutes. No account needed to start.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/estimate">
              <Button className="bg-primary hover:bg-primary/90 text-white px-10 gap-2 text-base">
                Get My Free Estimate <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                Get Early Access
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Built for Northern Ireland. renolab.co.uk
      </footer>
    </div>
  );
}
