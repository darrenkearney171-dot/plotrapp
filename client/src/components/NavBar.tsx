import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/new-build", label: "New Build" },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/tradespeople", label: "Tradespeople" },
  { href: "/pricing", label: "Pricing" },
];

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-[#0f172a] border-b border-white/10 sticky top-0 z-50">
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
                className="text-white/70 hover:text-white text-sm font-medium transition-colors"
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
                  <Button variant="ghost" className="text-white/70 hover:text-white text-sm">
                    Dashboard
                  </Button>
                </Link>
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="ghost" className="text-white/70 hover:text-white text-sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  className="text-white/70 hover:text-white text-sm"
                  onClick={logout}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/waitlist">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-sm">
                    Join Waitlist
                  </Button>
                </Link>
                <Link href="/estimate">
                  <Button className="bg-[#f97316] hover:bg-[#ea6c0a] text-white text-sm">
                    Get Free Estimate
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white/70 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0f172a] border-t border-white/10 px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-white/70 hover:text-white text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/10 space-y-2">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full text-white/70 hover:text-white text-sm justify-start">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full text-white/70 hover:text-white text-sm justify-start"
                  onClick={() => { logout(); setMobileOpen(false); }}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/waitlist" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 text-sm">
                    Join Waitlist
                  </Button>
                </Link>
                <Link href="/estimate" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-[#f97316] hover:bg-[#ea6c0a] text-white text-sm">
                    Get Free Estimate
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
