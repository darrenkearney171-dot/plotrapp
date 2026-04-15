import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { toast } from "sonner";
import { useState } from "react";
import { CheckCircle, X, Zap, Loader2 } from "lucide-react";
import NavBar from "@/components/NavBar";
import { trackWaitlistSignup, trackProWaitlist, trackTradeWaitlist } from "@/lib/analytics";

const PLANS = [
  {
    id: "free" as const,
    name: "Free",
    price: "Â£0",
    period: "",
    badge: null,
    features: [
      "Limited project estimate",
      "Basic cost range",
      "Preview shopping list",
      "Browse partner suppliers",
    ],
    cta: "Get Started Free",
    highlight: false,
    desc: "Try Renolab with no commitment",
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "Â£9.99",
    period: "/month",
    badge: "Most Popular",
    features: [
      "Full guided estimates",
      "Full shopping lists",
      "Downloadable PDFs",
      "Saved projects",
      "Member-only supplier discounts",
      "Unlimited project visualisations",
    ],
    cta: "Get Early Access",
    highlight: true,
    desc: "For homeowners and DIY users",
  },
  {
    id: "trade" as const,
    name: "Trade",
    price: "Â£24.99",
    period: "/month",
    badge: "For Professionals",
    features: [
      "Everything in Pro",
      "Faster workflow",
      "More saved projects",
      "Labour and margin options",
      "Reusable project templates",
      "Trade-focused supplier deals",
      "Unlimited visualisations â save to client project folders",
    ],
    cta: "Get Early Access",
    highlight: false,
    desc: "For installers, joiners, builders, and repeat users",
  },
];

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const { data: subscription } = trpc.subscriptions.getCurrent.useQuery(undefined, { enabled: isAuthenticated });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalPlan, setModalPlan] = useState<"pro" | "trade" | null>(null);
  const [modalEmail, setModalEmail] = useState("");
  const [modalSubmitted, setModalSubmitted] = useState(false);

  const joinWaitlist = trpc.waitlist.join.useMutation({
    onSuccess: () => {
      setModalSubmitted(true);
      toast.success("You're on the list â we'll be in touch when your plan is ready.");
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  const checkout = trpc.subscriptions.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    },
    onError: (err) => toast.error(err.message ?? "Could not start checkout. Please try again."),
  });

  function handleUpgrade(tier: "pro" | "trade") {
    if (!isAuthenticated) {
      openModal(tier);
      return;
    }
    checkout.mutate({ tier, origin: window.location.origin });
  }

  function openModal(plan: "pro" | "trade") {
    setModalPlan(plan);
    setModalEmail("");
    setModalSubmitted(false);
    setModalOpen(true);
  }

  function handleModalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (modalEmail && modalPlan) {
      trackWaitlistSignup();
      if (modalPlan === "pro") trackProWaitlist();
      if (modalPlan === "trade") trackTradeWaitlist();
      joinWaitlist.mutate({
        email: modalEmail,
        source: `pricing-${modalPlan}`,
        buttonLabel: `Join Waitlist â ${modalPlan.charAt(0).toUpperCase() + modalPlan.slice(1)} plan`,
        tier: modalPlan,
      });
    }
  }

  return (
    <div className="min-h-screen bg-background font-[Inter,sans-serif]">
      <title>Renolab â Pricing. The Renovation Platform for the island of Ireland.</title>
      <NavBar />

      <main className="container py-16">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Zap className="w-3 h-3 mr-1" />
            Simple Pricing
          </Badge>
          <h1 className="text-4xl font-extrabold mb-4">Memberships built around real value</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Start free. Upgrade when you need more. Pro and Trade memberships are launching soon â join the waitlist to be first.
          </p>
          {subscription && subscription.tier !== "free" && (
            <div className="mt-4">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1.5">
                You are on the <strong className="ml-1">{subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}</strong> plan
              </Badge>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan) => {
            const isCurrent = subscription?.tier === plan.id;
            return (
              <div
                key={plan.id}
                className={`rounded-xl border p-8 flex flex-col relative ${plan.highlight ? "border-primary shadow-lg shadow-primary/10 bg-primary/5" : "border-border bg-card"}`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white border-0 whitespace-nowrap">
                    {plan.badge}
                  </Badge>
                )}
                <div className="mb-2">
                  <h3 className="font-bold text-xl mb-0.5">{plan.name}</h3>
                  <p className="text-muted-foreground text-xs mb-3">{plan.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 flex-1 my-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <Button className="w-full" disabled variant="outline">Current Plan</Button>
                ) : plan.id === "free" ? (
                  <Link href="/estimate">
                    <Button className="w-full" variant="outline">Get Started Free</Button>
                  </Link>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.highlight ? "default" : "outline"}
                    onClick={() => handleUpgrade(plan.id as "pro" | "trade")}
                    disabled={checkout.isPending}
                  >
                    {checkout.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Redirecting...</> : plan.cta}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
            {[
              {
                q: "How does the estimating tool work?",
                a: "You upload a room photo, add measurements and a description of what you want done, and Renolab generates an estimate and materials list based on that input. The more detail you provide, the more useful the output.",
              },
              {
                q: "Are the material prices accurate?",
                a: "Prices are based on realistic UK trade market data and are intended as a planning guide. Actual costs will vary by supplier, region, and specification.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. Subscriptions are monthly and can be cancelled at any time. You retain access until the end of your billing period.",
              },
              {
                q: "What is included in the supplier discounts?",
                a: "Pro and Trade members can access agreed discounts with Renolab partner suppliers. Discount availability and terms vary by supplier and are subject to change. Supplier partnerships are currently being onboarded.",
              },
              {
                q: "When do Pro and Trade plans launch?",
                a: "We are currently onboarding our founding supplier partners and finalising the platform. Join the waitlist above and we will contact you as soon as your plan is ready.",
              },
            ].map(item => (
              <div key={item.q} className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-sm mb-2">{item.q}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>ÃÂ© {new Date().getFullYear()} Renolab. All rights reserved.</p>
          <p className="mt-1 font-medium text-foreground">Built on the island of Ireland. renolab.co.uk</p>
        </div>
      </footer>

      {/* Waitlist modal for Pro / Trade */}
      <Dialog open={modalOpen} onOpenChange={(o) => { setModalOpen(o); if (!o) setModalSubmitted(false); }}>
        <DialogContent className="max-w-md">
          <button
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            onClick={() => setModalOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {modalPlan === "pro" ? "Sign up to unlock Pro" : "Sign up to unlock Trade"}
            </DialogTitle>
          </DialogHeader>
          {modalSubmitted ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="font-semibold text-lg mb-1">You're on the list!</p>
              <p className="text-sm text-muted-foreground">We'll contact you as soon as your plan is ready.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Renolab launches soon. Enter your email below to join the waitlist and be first to access this plan.
              </p>
              <form onSubmit={handleModalSubmit} className="flex flex-col gap-3">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                  disabled={joinWaitlist.isPending}
                >
                  {joinWaitlist.isPending ? "Savingâ¦" : "Save my spot"}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
