import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trackWaitlistSignup, trackEstimateStart } from "@/lib/analytics";

export default function NavBar() {
  const [location] = useLocation();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const joinWaitlist = trpc.waitlist.join.useMutation({
    onSuccess: () => {
      toast.success("You're on the list! We'll be in touch soon.");
      setWaitlistOpen(false);
      setEmail("");
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    trackWaitlistSignup();
    joinWaitlist.mutate({ email, source: "nav", buttonLabel: "Get Early Access (nav bar)" });
  };

  const navLinks = [
    { href: "/how-it-works", label: "How It Works" },
    { href: "/new-build", label: "New Build" },
    // { href: "/suppliers", label: "Suppliers" }, // Hidden until supplier partnerships are live
    { href: "/tradespeople", label: "Tradespeople" },
    { href: "/pricing", label: "Pricing" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[#0f1e2e] border-b border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-md bg-[#f97316] flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">Renolab</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    location === link.href
                      ? "text-[#f97316]"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`border-white/20 bg-transparent font-medium ${location === "/dashboard" ? "text-[#f97316] border-[#f97316]/40" : "text-white/80 hover:text-white hover:border-white/40"}`}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-1" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/60 hover:text-white"
                    onClick={logout}
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white/80 hover:text-white hover:border-white/40 bg-transparent"
                    onClick={() => setWaitlistOpen(true)}
                  >
                    Get Early Access
                  </Button>
                  <Link href="/estimate">
                    <Button size="sm" className="bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold">
                      Get Free Estimate
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-white/70 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#0f1e2e] border-t border-white/10 px-4 pb-4 pt-2 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-sm font-medium text-white/70 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold">
                      <LayoutDashboard className="w-4 h-4 mr-1" /> Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-white/20 text-white/80 hover:text-white bg-transparent"
                    onClick={() => { logout(); setMobileOpen(false); }}
                  >
                    <LogOut className="w-4 h-4 mr-1" /> Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-white/20 text-white/80 hover:text-white bg-transparent"
                    onClick={() => { setWaitlistOpen(true); setMobileOpen(false); }}
                  >
                    Get Early Access
                  </Button>
                  <Link href="/estimate" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold">
                      Get Free Estimate
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Waitlist modal */}
      <Dialog open={waitlistOpen} onOpenChange={setWaitlistOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Join the Renolab Waitlist</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            Renolab is launching soon in the island of Ireland. Enter your email to get early access and be first to know when we go live.
          </p>
          <form onSubmit={handleWaitlist} className="flex gap-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button
              type="submit"
              className="bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold"
              disabled={joinWaitlist.isPending}
            >
              {joinWaitlist.isPending ? "Savingâ¦" : "Save my spot"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
