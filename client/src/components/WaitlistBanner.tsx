import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";
import { trackWaitlistSignup } from "@/lib/analytics";

export default function WaitlistBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem("plotr_waitlist_dismissed") === "1"; } catch { return false; }
  });
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const joinWaitlist = trpc.waitlist.join.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("You’re on the list — we’ll be in touch.");
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  if (dismissed) return null;

  function dismiss() {
    try { localStorage.setItem("plotr_waitlist_dismissed", "1"); } catch {}
    setDismissed(true);
  }

  return (
    <div className="bg-[#0f1c2e] text-white py-3 px-4 relative">
      <div className="container flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">
        <p className="font-medium text-white/90 text-center sm:text-left">
          🚀 <span className="font-semibold">Renolab is launching soon</span> — get early access and founding member pricing.
        </p>
        {submitted ? (
          <span className="text-green-400 font-semibold shrink-0">You’re on the list ✓</span>
        ) : (
          <form
            className="flex gap-2 shrink-0"
            onSubmit={e => {
              e.preventDefault();
              if (email) { trackWaitlistSignup(); joinWaitlist.mutate({ email, source: "sitewide-banner", buttonLabel: "Join (sitewide banner)" }); }
            }}
          >
            <Input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-44 h-8 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-primary"
              required
            />
            <Button
              type="submit"
              size="sm"
              className="h-8 bg-primary hover:bg-primary/90 text-white shrink-0"
              disabled={joinWaitlist.isPending}
            >
              {joinWaitlist.isPending ? "..." : "Join"}
            </Button>
          </form>
        )}
      </div>
      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
