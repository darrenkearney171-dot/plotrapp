import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Home,
  Bath,
  ChefHat,
  BedDouble,
  Sofa,
  Wrench,
  Layers,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ImageIcon,
} from "lucide-react";
import { useState } from "react";

// ─── Room icon map ────────────────────────────────────────────────────────────

const ROOM_ICONS: Record<string, React.ElementType> = {
  kitchen: ChefHat,
  bathroom: Bath,
  en_suite: Bath,
  living_room: Sofa,
  master_bedroom: BedDouble,
  bedroom: BedDouble,
  hallway: Home,
  utility: Wrench,
  dining_room: Layers,
  home_office: Layers,
  garage: Home,
  other: Layers,
};

function fmt(n: number) {
  return `£${n.toLocaleString("en-GB")}`;
}

// ─── Collapsible room card ────────────────────────────────────────────────────

function RoomCard({ room }: { room: any }) {
  const [open, setOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const Icon = ROOM_ICONS[room.type] ?? Layers;

  return (
    <>
      {/* Lightbox */}
      {lightboxOpen && room.photoUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <img
            src={room.photoUrl}
            alt={room.label}
            className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
          />
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl font-bold"
            onClick={() => setLightboxOpen(false)}
          >
            ✕
          </button>
        </div>
      )}

      <div className="bg-slate-800/60 rounded-xl border border-slate-700 overflow-hidden">
        {/* AI photo */}
        {room.photoUrl && (
          <button
            onClick={() => setLightboxOpen(true)}
            className="w-full block relative group overflow-hidden"
          >
            <img
              src={room.photoUrl}
              alt={`AI render of ${room.label}`}
              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
              <span className="text-white text-xs font-semibold flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" /> View full size
              </span>
            </div>
            <div className="absolute top-2 right-2 bg-purple-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> AI Render
            </div>
          </button>
        )}

        {/* Header row */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-700/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B2C]/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-[#FF6B2C]" />
            </div>
            <span className="font-semibold text-white text-sm">{room.label}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#FF6B2C] font-bold text-sm">
              {fmt(room.costLow)} – {fmt(room.costHigh)}
            </span>
            {open ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {/* Expanded detail */}
        {open && (
          <div className="px-4 pb-4 border-t border-slate-700/50 pt-3">
            {room.recommendedWork?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  Recommended Work
                </p>
                <ul className="flex flex-col gap-1">
                  {room.recommendedWork.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6B2C] mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {room.keyMaterials?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  Key Materials
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {room.keyMaterials.map((m: string, i: number) => (
                    <span
                      key={i}
                      className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function NewBuildResult() {
  const params = useParams<{ leadId: string }>();
  const leadId = parseInt(params.leadId ?? "0", 10);
  const [, navigate] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Your New Build Estimate — Plotrapp";
    return () => {
      document.title = "Plotrapp — The Renovation Platform for the island of Ireland.";
    };
  }, []);

  const { data: lead, isLoading, error } = trpc.guest.getResult.useQuery(
    { leadId },
    { enabled: !!leadId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-[#FF6B2C] border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Loading your estimate…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <p className="text-red-400 font-semibold mb-2">Estimate not found</p>
            <p className="text-slate-400 text-sm mb-4">
              This estimate may have expired or the link is incorrect.
            </p>
            <Button
              onClick={() => navigate("/new-build")}
              className="bg-[#FF6B2C] hover:bg-[#e55a1f] text-white"
            >
              Start a new estimate
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const result = lead.analysisResult as any;
  // Merge AI-generated photos from the saved rooms JSON into the result rooms
  const savedRooms: any[] = (lead as any).rooms ?? [];
  const photoMap: Record<number, string> = {};
  savedRooms.forEach((r: any, i: number) => {
    if (r.photoUrl) photoMap[i] = r.photoUrl;
  });

  const rooms: any[] = (result?.rooms ?? []).map((r: any, i: number) => ({
    ...r,
    photoUrl: photoMap[i] ?? r.photoUrl ?? null,
  }));

  const totalLow: number = result?.totalCostLow ?? lead.costRangeLow ?? 0;
  const totalHigh: number = result?.totalCostHigh ?? lead.costRangeHigh ?? 0;
  const timeEstimate: string = result?.timeEstimate ?? "";
  const aiSummary: string = result?.aiSummary ?? "";
  const designSummary: string = result?.designSummary ?? "";
  const planNotes: string = (lead as any).planNotes ?? "";
  const stylePrompt: string = (lead as any).stylePrompt ?? "";
  const hasPhotos = rooms.some((r) => r.photoUrl);

  return (
    <div className="min-h-screen bg-[#0D1117] text-white flex flex-col">
      <NavBar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-8 pb-20">
        {/* Back */}
        <button
          onClick={() => navigate("/new-build")}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> New estimate
        </button>

        {/* Header */}
        <div className="mb-6">
          <span className="inline-block bg-[#FF6B2C]/10 text-[#FF6B2C] text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-[#FF6B2C]/20">
            🏗️ New Build Estimate
          </span>
          <h1 className="text-2xl font-extrabold text-white mb-1">Your house fit-out estimate</h1>
          <p className="text-slate-400 text-sm">
            Based on {rooms.length} room{rooms.length !== 1 ? "s" : ""} selected.
            {stylePrompt
              ? ` Style: ${stylePrompt.length > 60 ? stylePrompt.slice(0, 60) + "…" : stylePrompt}`
              : ""}
          </p>
        </div>

        {/* Total cost card */}
        <div className="bg-gradient-to-br from-[#FF6B2C]/20 to-slate-800/60 rounded-2xl border border-[#FF6B2C]/30 p-6 mb-6">
          <p className="text-slate-400 text-sm mb-1">Total estimated cost</p>
          <p className="text-4xl font-extrabold text-white mb-1">
            {fmt(totalLow)} – {fmt(totalHigh)}
          </p>
          {timeEstimate && (
            <div className="flex items-center gap-1.5 text-slate-400 text-sm mt-2">
              <Clock className="w-4 h-4" />
              <span>{timeEstimate}</span>
            </div>
          )}
          <p className="text-xs text-slate-500 mt-3">
            This is an indicative estimate only, not a quote. Actual costs may vary based on site
            conditions, contractor rates, and material availability.
          </p>
        </div>

        {/* Plan scan notes */}
        {planNotes && (
          <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-2">
              📐 Plan Analysis
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">{planNotes}</p>
          </div>
        )}

        {/* Design summary */}
        {designSummary && (
          <div className="bg-purple-900/20 border border-purple-700/40 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-2">
              🎨 Design Recommendations
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">{designSummary}</p>
          </div>
        )}

        {/* AI summary */}
        {aiSummary && (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              AI Summary
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">{aiSummary}</p>
          </div>
        )}

        {/* AI photos gallery (if any generated) */}
        {hasPhotos && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h2 className="text-base font-bold text-white">AI Room Visualisations</h2>
              <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded-full border border-purple-700/30">
                {rooms.filter((r) => r.photoUrl).length} room
                {rooms.filter((r) => r.photoUrl).length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {rooms
                .filter((r) => r.photoUrl)
                .map((room, i) => {
                  const Icon = ROOM_ICONS[room.type] ?? Layers;
                  return (
                    <PhotoCard key={i} room={room} Icon={Icon} />
                  );
                })}
            </div>
          </div>
        )}

        {/* Per-room breakdown */}
        {rooms.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-bold text-white mb-3">Room-by-room breakdown</h2>
            <div className="flex flex-col gap-2">
              {rooms.map((room: any, i: number) => (
                <RoomCard key={i} room={room} />
              ))}
            </div>
          </div>
        )}

        {/* Visualisation upsell */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-sm mb-1">
                {hasPhotos
                  ? "Want more visualisations for your renovation?"
                  : "See what your rooms could look like"}
              </p>
              <p className="text-slate-400 text-xs mb-3">
                {hasPhotos
                  ? "Generate AI visualisations of renovation projects for any room. Free for new accounts."
                  : "Generate AI visualisations of your finished rooms — kitchen, bathroom, living room and more. Free for new accounts."}
              </p>
              {user ? (
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" /> Go to Dashboard
                </Button>
              ) : (
                <Button
                  onClick={() => navigate("/estimate")}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" /> Try a room visualisation
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-5 text-center">
          <p className="font-semibold text-white mb-1">Ready to start planning?</p>
          <p className="text-slate-400 text-sm mb-4">
            Connect with vetted tradespeople on the island of Ireland through Plotrapp when we
            launch.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate("/tradespeople")}
              className="bg-[#FF6B2C] hover:bg-[#e55a1f] text-white font-semibold"
            >
              Browse Tradespeople
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/new-build")}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              New estimate
            </Button>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-600 py-4 border-t border-slate-800">
        Built on the island of Ireland. plotrapp.co.uk
      </footer>
    </div>
  );
}

// ─── Photo card (standalone gallery) ─────────────────────────────────────────

function PhotoCard({ room, Icon }: { room: any; Icon: React.ElementType }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  return (
    <>
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <img
            src={room.photoUrl}
            alt={room.label}
            className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
          />
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl font-bold"
            onClick={() => setLightboxOpen(false)}
          >
            ✕
          </button>
        </div>
      )}
      <button
        onClick={() => setLightboxOpen(true)}
        className="relative rounded-xl overflow-hidden border border-slate-700 group"
      >
        <img
          src={room.photoUrl}
          alt={room.label}
          className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-[#FF6B2C]" />
          <span className="text-white text-xs font-semibold truncate">{room.label}</span>
        </div>
      </button>
    </>
  );
}
