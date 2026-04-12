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

  const joinWaitlist = trpc.waitlist.join.useMutation({
    onSuccess: () => {
      setWaitlistSubmitted(true);
      toast.success("You're on the list — we'll be in touch soon.");
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
  IdQ�ԙ@.