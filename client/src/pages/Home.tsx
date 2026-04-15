<blockquote className="text-lg text-white/80 leading-relaxed">
              Renolab was built by Darren Kearney — a joiner, carpenter, and tradesman from Northern Ireland with over a decade on real building sites. Every estimate, every material cost, and every labour rate in this platform comes from real project experience, not scraped data or UK-wide averages.
            </blockquote>
            <p className="mt-6 text-white/60 leading-relaxed">
              Renolab is not a tech company that discovered construction. It is a trade platform built by someone who has priced, planned, and delivered renovation projects across Northern Ireland. That’s why the numbers are accurate — and why tradespeople trust them.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center text-xs text-white/50">
              <span className="inline-flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full">Founded in Northern Ireland</span>
              <span className="inline-flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full">Trade-verified pricing</span>
              <span className="inline-flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full">10+ years construction experience</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ã¢ÂÂÃ¢ÂÂ Value propositions Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-12">Why people use Renolab</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { icon: Clock, title: "Save time", desc: "No more bouncing between notes, supplier websites, and rough guesses." },
              { icon: ShoppingBag, title: "Buy smarter", desc: "Know what materials you likely need before you go near the trade counter." },
              { icon: ShieldCheck, title: "Avoid costly mistakes", desc: "Reduce over-ordering, missed items, and poor planning." },
              { icon: Zap, title: "Access better pricing", desc: "Use member-only supplier discounts designed to save money on real projects." },
              { icon: Camera, title: "Visualise every room before you buy a single tile", desc: "Generate a 3D visualisation of your finished room before you spend a penny. See exactly what your choices look like Ã¢ÂÂ walls, floors, fittings Ã¢ÂÂ all rendered from your project inputs." },
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

      {/* Ã¢ÂÂÃ¢ÂÂ Two paths Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */}
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

      {/* Ã¢ÂÂÃ¢ÂÂ Membership Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-4">Memberships built around real value</h2>
          <p className="text-center text-muted-foreground mb-14 max-w-xl mx-auto">Start free. Upgrade when you need more.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col">
              <h3 className="font-bold text-xl mb-1">Free</h3>
              <p className="text-muted-foreground text-sm mb-4">Perfect for trying Renolab out</p>
              <div className="text-3xl font-extrabold mb-6">ÃÂ£0</div>
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
                <span className="text-3xl font-extrabold">ÃÂ£9.99</span>
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
                <span className="text-3xl font-extrabold">ÃÂ£24.99</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <ul className="space-y-2.5 flex-1 mb-8">
                {["Everything in Pro", "Faster workflow", "More saved projects", "Labour and margin options", "Reusable project templates", "Trade-focused supplier deals", "Unlimited visualisations Ã¢ÂÂ save to client project folders"].map(f => (
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

      {/* Ã¢ÂÂÃ¢ÂÂ Supplier discounts Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */}
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

      {/* Ã¢ÂÂÃ¢ÂÂ Final CTA Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */}
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

      {/* Ã¢ÂÂÃ¢ÂÂ Footer Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */}
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
        <p className="mt-6 text-white/20">ÃÂ© {new Date().getFullYear()} Renolab. All rights reserved.</p>
      </footer>
    </div>
  );
}
