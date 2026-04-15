import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Building2, Globe, MapPin, Search, ShoppingCart, Star } from "lucide-react";
import NavBar from "@/components/NavBar";
import { trackWaitlistSignup } from "@/lib/analytics";

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "timber_merchants", label: "Timber" },
  { value: "builders_merchants", label: "Builders Merchants" },
  { value: "paint_decorating", label: "Paint & Decorating" },
  { value: "roofing_insulation", label: "Roofing" },
  { value: "flooring", label: "Flooring" },
  { value: "kitchen_bathroom", label: "Kitchen & Bathroom" },
  { value: "electrical_plumbing", label: "Electrical" },
  { value: "windows_doors", label: "Windows & Doors" },
];

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.slice(1).map(c => [c.value, c.label])
);

export default function Suppliers() {
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const { data: suppliers, isLoading } = trpc.suppliers.list.useQuery(
    category ? { category } : undefined
  );

  const joinWaitlist = trpc.waitlist.join.useMutation({
    onSuccess: () => {
      setWaitlistSubmitted(true);
      toast.success("You're on the list — we'll be in touch.");
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  const filtered = suppliers?.filter(s =>
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background font-[Inter,sans-serif]">
      <title>Renolab — Suppliers. The Renovation Platform for the island of Ireland.</title>
      <NavBar />

      {/* Onboarding notice banner */}
      <div className="bg-primary/5 border-b border-primary/20 py-4">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">We are currently onboarding our founding supplier partners across the island of Ireland.</p>
              <p className="text-sm text-muted-foreground mt-0.5">Full trade pricing access launches soon. Join the waitlist to be first.</p>
            </div>
            {!waitlistSubmitted ? (
              <form
                className="flex gap-2 shrink-0"
                onSubmit={e => {
                  e.preventDefault();
                  if (waitlistEmail) { trackWaitlistSignup(); joinWaitlist.mutate({ email: waitlistEmail, source: "suppliers", buttonLabel: "Join Waitlist (suppliers page)" }); }
                }}
              >
                <Input
                  type="email"
                  placeholder="Your email"
                  value={waitlistEmail}
                  onChange={e => setWaitlistEmail(e.target.value)}
                  className="w-52 bg-white text-sm"
                  required
                />
                <Button type="submit" size="sm" className="shrink-0" disabled={joinWaitlist.isPending}>
                  {joinWaitlist.isPending ? "Joining..." : "Join Waitlist"}
                </Button>
              </form>
            ) : (
              <Badge className="bg-green-100 text-green-800 border-0 text-sm px-3 py-1.5">You are on the list</Badge>
            )}
          </div>
        </div>
      </div>

      <main className="container py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Supplier Directory</h1>
          <p className="text-muted-foreground text-sm">the island of Ireland building merchants and trade suppliers. Trade pricing access coming soon.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  category === c.value
                    ? "bg-primary text-white border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(supplier => (
              <div key={supplier.id} className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-base truncate">{supplier.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Coming Soon — Launching Soon</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {CATEGORY_LABELS[supplier.category] ?? supplier.category}
                      </Badge>
                      {supplier.isNational && (
                        <Badge className="text-xs bg-blue-100 text-blue-700 border-0">National</Badge>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 border-0 text-xs shrink-0 whitespace-nowrap">
                    Renolab Partner
                  </Badge>
                </div>

                {supplier.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {supplier.description}
                  </p>
                )}

                <div className="space-y-1 text-xs text-muted-foreground">
                  {supplier.region && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 shrink-0" /> {supplier.region}
                    </div>
                  )}
                  {supplier.websiteUrl && (
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3 h-3 shrink-0" />
                      {supplier.websiteUrl.replace(/^https?:\/\//, "")}
                    </div>
                  )}
                </div>

                {/* Contact via Renolab — no direct phone until confirmed */}
                <div className="mt-auto pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    Contact via Renolab — coming soon
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No suppliers found</h3>
            <p className="text-muted-foreground text-sm">
              Try adjusting your filters or check back soon as we add more suppliers.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Renolab. All rights reserved.</p>
          <p className="mt-1 font-medium text-foreground">Built on the island of Ireland. renolab.co.uk</p>
        </div>
      </footer>
    </div>
  );
}
