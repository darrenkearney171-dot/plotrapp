import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Home,
  Wrench,
  Upload,
  Ruler,
  MessageSquare,
  Mail,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  ImageIcon,
  X,
  SkipForward,
} from "lucide-react";

// âââ Types ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

type UserType = "homeowner" | "tradesperson";

const PROJECT_TYPES = [
  { id: "kitchen", label: "Kitchen", icon: "\u{1F373}" },
  { id: "bathroom", label: "Bathroom", icon: "\u{1F6C1}" },
  { id: "bedroom", label: "Bedroom", icon: "\u{1F6CF}\uFE0F" },
  { id: "living_room", label: "Living Room", icon: "\u{1F6CB}\uFE0F" },
  { id: "hallway", label: "Hallway / Landing", icon: "\u{1F6AA}" },
  { id: "extension", label: "Extension", icon: "\u{1F3D7}\uFE0F" },
  { id: "full_house", label: "Full House", icon: "\u{1F3E0}" },
  { id: "other", label: "Other", icon: "\u{1F528}" },
];

const GUIDED_QUESTIONS: Record<string, { question: string; options: string[] }[]> = {
  kitchen: [
    { question: "What\u2019s the current state of the kitchen?", options: ["Functional but dated", "Needs full replacement", "New build / empty"] },
    { question: "Are you keeping existing plumbing positions?", options: ["Yes, keep as is", "No, moving sink/appliances", "Not sure yet"] },
    { question: "What\u2019s your priority?", options: ["Budget-friendly refresh", "Mid-range renovation", "High-end transformation"] },
  ],
  bathroom: [
    { question: "What\u2019s the current state?", options: ["Functional but dated", "Needs full replacement", "New build / empty"] },
    { question: "Are you keeping existing plumbing?", options: ["Yes, keep as is", "No, moving fixtures", "Not sure yet"] },
    { question: "What\u2019s your priority?", options: ["Budget refresh", "Mid-range renovation", "Luxury transformation"] },
  ],
  bedroom: [
    { question: "What work is needed?", options: ["Decoration only", "Flooring + decoration", "Full renovation"] },
    { question: "Are built-in wardrobes required?", options: ["Yes", "No", "Not sure yet"] },
  ],
  living_room: [
    { question: "What work is needed?", options: ["Decoration only", "Flooring + decoration", "Full renovation"] },
    { question: "Is a fireplace involved?", options: ["Yes, existing", "Yes, new installation", "No fireplace"] },
  ],
  default: [
    { question: "What\u2019s the overall scope?", options: ["Light refresh", "Mid-range renovation", "Full transformation"] },
    { question: "What\u2019s your timeline?", options: ["ASAP", "Within 3 months", "Planning ahead"] },
  ],
};

// âââ Step indicator âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

const STEPS = [
  { id: 1, label: "About you" },
  { id: 2, label: "Your details" },
  { id: 3, label: "Project type" },
  { id: 4, label: "Room photo" },
  { id: 5, label: "Room details" },
  { id: 6, label: "Your estimate" },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-center gap-1">
        {STEPS.map((step, i) => (
          <div key={step.id} className="flex items-start">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  step.id < current
                    ? "bg-[#FF6B2C] text-white"
                    : step.id === current
                    ? "bg-[#FF6B2C] text-white ring-2 ring-[#FF6B2C]/30"
                    : "bg-[#1E293B] text-slate-400 border border-slate-700"
                }`}
              >
                {step.id < current ? <CheckCircle2 className="w-4 h-4" /> : step.id}
              </div>
              <span className={`text-[9px] mt-1 text-center w-14 leading-tight ${
                step.id === current ? "text-[#FF6B2C] font-semibold" : "text-slate-500"
              }`}>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-4 h-0.5 mx-0.5 mt-3.5 shrink-0 ${step.id < current ? "bg-[#FF6B2C]" : "bg-slate-700"}`} />
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-slate-500 mt-3">Takes about 3 minutes to complete.</p>
    </div>
  );
}

// âââ Main Component âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export default function GuestEstimate() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [projectType, setProjectType] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoSkipped, setPhotoSkipped] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [dimensions, setDimensions] = useState({ width: "", length: "", height: "" });
  const [stylePrompt, setStylePrompt] = useState("");
  const [guidedAnswers, setGuidedAnswers] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [isAnalysing, setIsAnalysing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const startEstimate = trpc.guest.startEstimate.useMutation();

  const questions = GUIDED_QUESTIONS[projectType ?? ""] ?? GUIDED_QUESTIONS.default;

  // ââ Photo upload ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  async function handlePhotoSelect(file: File) {
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoSkipped(false);
    setUploadingPhoto(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const key = `guest-estimates/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("key", key);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error ?? "Upload failed");
      }
      const data = await res.json();
      setPhotoUrl(data.url);
    } catch (e: any) {
      toast.error(e?.message ?? "Photo upload failed. Please try again.");
      setPhotoFile(null);
      setPhotoPreview(null);
    } finally {
      setUploadingPhoto(false);
    }
  }

  // ââ Submit ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  async function handleSubmit() {
    if (!userType || !projectType || !email) return;
    if (!photoUrl && !photoSkipped) return;
    setIsAnalysing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const dims = {
        width: dimensions.width ? parseFloat(dimensions.width) : undefined,
        length: dimensions.length ? parseFloat(dimensions.length) : undefined,
        height: dimensions.height ? parseFloat(dimensions.height) : undefined,
      };
      const result = await startEstimate.mutateAsync({
        email,
        firstName: firstName || undefined,
        userType,
        projectType,
        photoUrl: photoUrl || undefined,
        dimensions: Object.values(dims).some(Boolean) ? dims : undefined,
        stylePrompt: stylePrompt || undefined,
        guidedAnswers: Object.keys(guidedAnswers).length > 0 ? guidedAnswers : undefined,
      });
      navigate(`/estimate/result/${result.leadId}`);
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong. Please try again.");
      setIsAnalysing(false);
    }
  }

  // ââ Render ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

  // Full-screen progress screen while AI is running
  if (isAnalysing) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[#FF6B2C]/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#FF6B2C] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">{"\u{1F3E0}"}</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Building your estimate{"\u2026"}</h2>
          <p className="text-slate-400 text-sm mb-6">
            {photoUrl
              ? "Our AI is analysing your room photo and inputs. This usually takes 10\u201320 seconds."
              : "Our AI is building your estimate from your inputs. This usually takes 10\u201320 seconds."}
          </p>
          <div className="space-y-2 text-left bg-[#1E293B] rounded-xl p-4">
            {[
              ...(photoUrl ? [{ label: "Analysing room photo", done: true }] : []),
              { label: "Estimating dimensions", done: true },
              { label: "Calculating cost range", done: false },
              { label: "Generating recommendations", done: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B2C] shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 text-slate-500 animate-spin shrink-0" />
                )}
                <span className={item.done ? "text-slate-300" : "text-slate-500"}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-[#FF6B2C]">Renolab</a>
        <span className="text-sm text-slate-400">Free Estimate — No account needed</span>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <StepIndicator current={step} />

        {/* ââ Step 1: User Type ââ */}
        {step === 1 && (
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Who are you?</h1>
            <p className="text-slate-400 mb-8">We'll tailor your estimate to suit your needs.</p>
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <button
                onClick={() => { setUserType("homeowner"); setStep(2); }}
                className={`p-6 rounded-xl border-2 text-center transition-all hover:border-[#FF6B2C] ${
                  userType === "homeowner" ? "border-[#FF6B2C] bg-[#FF6B2C]/10" : "border-slate-700 bg-[#1E293B]"
                }`}
              >
                <Home className="w-8 h-8 mx-auto mb-3 text-[#FF6B2C]" />
                <div className="font-semibold">Homeowner</div>
                <div className="text-xs text-slate-400 mt-1">Renovating my own home</div>
              </button>
              <button
                onClick={() => { setUserType("tradesperson"); setStep(2); }}
                className={`p-6 rounded-xl border-2 text-center transition-all hover:border-[#FF6B2C] ${
                  userType === "tradesperson" ? "border-[#FF6B2C] bg-[#FF6B2C]/10" : "border-slate-700 bg-[#1E293B]"
                }`}
              >
                <Wrench className="w-8 h-8 mx-auto mb-3 text-[#FF6B2C]" />
                <div className="font-semibold">Tradesperson</div>
                <div className="text-xs text-slate-400 mt-1">Pricing work for a customer</div>
              </button>
            </div>
          </div>
        )}

        {/* ââ Step 2: Email Capture (moved early) ââ */}
        {step === 2 && (
          <div>
            <h1 className="text-3xl font-bold mb-2 text-center">Where should we send your estimate?</h1>
            <p className="text-slate-400 mb-8 text-center">
              We'll email your results so you can refer back to them. No spam, ever.
            </p>
            <div className="bg-[#1E293B] rounded-xl p-6 mb-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">First name <span className="text-slate-500">(optional)</span></label>
                <Input
                  placeholder="e.g. Darren"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-[#0F172A] border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Email address <span className="text-red-400">*</span></label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#0F172A] border-slate-700 text-white"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center mb-6">
              We'll never sell your data. Unsubscribe anytime.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!email || !/\S+@\S+\.\S+/.test(email)}
                className="flex-1 bg-[#FF6B2C] hover:bg-[#e55a1f] text-white"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ââ Step 3: Project Type ââ */}
        {step === 3 && (
          <div>
            <h1 className="text-3xl font-bold mb-2 text-center">What are you renovating?</h1>
            <p className="text-slate-400 mb-8 text-center">Select the room or project type.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {PROJECT_TYPES.map((pt) => (
                <button
                  key={pt.id}
                  onClick={() => setProjectType(pt.id)}
                  className={`p-4 rounded-xl border-2 text-center transition-all hover:border-[#FF6B2C] ${
                    projectType === pt.id ? "border-[#FF6B2C] bg-[#FF6B2C]/10" : "border-slate-700 bg-[#1E293B]"
                  }`}
                >
                  <div className="text-2xl mb-1">{pt.icon}</div>
                  <div className="text-sm font-medium">{pt.label}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={!projectType}
                className="flex-1 bg-[#FF6B2C] hover:bg-[#e55a1f] text-white"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ââ Step 4: Photo Upload (with skip option) ââ */}
        {step === 4 && (
          <div>
            <h1 className="text-3xl font-bold mb-2 text-center">Upload a room photo</h1>
            <p className="text-slate-400 mb-8 text-center">
              A photo helps our AI give a more accurate estimate. Don't have one? You can skip this step.
            </p>
            <div
              onClick={() => !photoFile && fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                photoFile ? "border-[#FF6B2C] bg-[#FF6B2C]/5" : "border-slate-700 hover:border-slate-500 bg-[#1E293B]"
              }`}
            >
              {photoPreview ? (
                <div className="relative">
                  <img src={photoPreview} alt="Room" className="max-h-64 mx-auto rounded-lg object-contain" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setPhotoFile(null); setPhotoPreview(null); setPhotoUrl(null); setPhotoSkipped(false); }}
                    className="absolute top-2 right-2 bg-slate-900/80 rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-[#FF6B2C]" />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                  <p className="text-slate-300 font-medium">Click to upload a photo</p>
                  <p className="text-slate-500 text-sm mt-1">JPG, PNG or HEIC — max 10MB</p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoSelect(f); }}
            />

            {/* Skip photo option */}
            {!photoUrl && !uploadingPhoto && (
              <button
                onClick={() => { setPhotoSkipped(true); setStep(5); }}
                className="w-full mt-4 py-2.5 text-sm text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <SkipForward className="w-4 h-4" />
                Skip — estimate without a photo
              </button>
            )}

            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                onClick={() => setStep(5)}
                disabled={(!photoUrl && !photoSkipped) || uploadingPhoto}
                className="flex-1 bg-[#FF6B2C] hover:bg-[#e55a1f] text-white"
              >
                {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ââ Step 5: Room Details (measurements + guided questions + style) ââ */}
        {step === 5 && (
          <div>
            <h1 className="text-3xl font-bold mb-2 text-center">Tell us about the room</h1>
            <p className="text-slate-400 mb-8 text-center">
              The more detail you provide, the more accurate your estimate.
            </p>

            {/* Measurements */}
            <div className="bg-[#1E293B] rounded-xl p-6 space-y-4 mb-6">
              <p className="font-medium text-sm text-slate-300">Measurements <span className="text-slate-500 font-normal">(optional)</span></p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Width (m)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 4.2"
                    value={dimensions.width}
                    onChange={(e) => setDimensions((d) => ({ ...d, width: e.target.value }))}
                    className="bg-[#0F172A] border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Length (m)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 5.8"
                    value={dimensions.length}
                    onChange={(e) => setDimensions((d) => ({ ...d, length: e.target.value }))}
                    className="bg-[#0F172A] border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Height (m)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 2.4"
                    value={dimensions.height}
                    onChange={(e) => setDimensions((d) => ({ ...d, height: e.target.value }))}
                    className="bg-[#0F172A] border-slate-700 text-white"
                  />
                </div>
              </div>
              {dimensions.width && dimensions.length && (
                <p className="text-sm text-[#FF6B2C] font-medium">
                  Floor area: {(parseFloat(dimensions.width) * parseFloat(dimensions.length)).toFixed(1)} m\u00B2
                </p>
              )}
            </div>

            {/* Guided questions */}
            <div className="space-y-4 mb-6">
              {questions.map((q, qi) => (
                <div key={qi} className="bg-[#1E293B] rounded-xl p-5">
                  <p className="font-medium mb-3 text-sm">{q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setGuidedAnswers((a) => ({ ...a, [q.question]: opt }))}
                        className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${
                          guidedAnswers[q.question] === opt
                            ? "border-[#FF6B2C] bg-[#FF6B2C]/10 text-white"
                            : "border-slate-700 text-slate-300 hover:border-slate-500"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Style description */}
            <div className="bg-[#1E293B] rounded-xl p-6 mb-6">
              <label className="block text-sm text-slate-400 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Style description <span className="text-slate-500">(optional)</span>
              </label>
              <Textarea
                placeholder={'e.g. "Modern Scandi kitchen with white cabinets, oak worktops, and matte black hardware."'}
                value={stylePrompt}
                onChange={(e) => setStylePrompt(e.target.value)}
                rows={3}
                className="bg-[#0F172A] border-slate-700 text-white resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(4)} className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={() => setStep(6)} className="flex-1 bg-[#FF6B2C] hover:bg-[#e55a1f] text-white">
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ââ Step 6: Review & Submit ââ */}
        {step === 6 && (
          <div>
            <h1 className="text-3xl font-bold mb-2 text-center">Review & get your estimate</h1>
            <p className="text-slate-400 mb-8 text-center">
              Check your details below, then hit the button to generate your AI estimate.
            </p>

            {/* Summary */}
            <div className="bg-[#1E293B] rounded-xl p-5 mb-6 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Type</span><span className="text-white capitalize">{userType}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Email</span><span className="text-white">{email}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Project</span><span className="text-white capitalize">{projectType?.replace("_", " ")}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Photo</span><span className={photoUrl ? "text-green-400" : "text-slate-500"}>{photoUrl ? "Uploaded" : "Skipped"}</span></div>
              {dimensions.width && dimensions.length && (
                <div className="flex justify-between"><span className="text-slate-400">Floor area</span><span className="text-white">{(parseFloat(dimensions.width) * parseFloat(dimensions.length)).toFixed(1)} m{"\u00B2"}</span></div>
              )}
            </div>

            {/* What's included */}
            <div className="bg-[#1E293B] rounded-xl p-4 mb-6 text-sm space-y-1.5">
              <p className="text-slate-400 font-medium mb-2">Your estimate includes:</p>
              <div className="flex items-center gap-2 text-slate-300"><CheckCircle2 className="w-4 h-4 text-[#FF6B2C]" /> AI-powered cost range</div>
              <div className="flex items-center gap-2 text-slate-300"><CheckCircle2 className="w-4 h-4 text-[#FF6B2C]" /> Recommended work summary</div>
              <div className="flex items-center gap-2 text-slate-300"><CheckCircle2 className="w-4 h-4 text-[#FF6B2C]" /> Key materials identified</div>
              <div className="flex items-center gap-2 text-slate-300"><CheckCircle2 className="w-4 h-4 text-[#FF6B2C]" /> Time estimate</div>
              <div className="flex items-center gap-2 text-slate-500 mt-2 border-t border-slate-700 pt-2">
                <span className="text-[#FF6B2C]">Pro</span> Full itemised shopping list, PDFs, supplier discounts
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(5)} className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!email || isAnalysing}
                className="flex-1 bg-[#FF6B2C] hover:bg-[#e55a1f] text-white font-semibold"
              >
                {isAnalysing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Analysing{"\u2026"}
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Get My Free Estimate
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-500 text-center mt-3">
              By continuing you agree to our terms. We'll never sell your data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
