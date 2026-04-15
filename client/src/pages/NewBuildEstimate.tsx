import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import NavBar from "@/components/NavBar";
import {
  CheckCircle2,
  Plus,
  Trash2,
  Home,
  Bath,
  ChefHat,
  BedDouble,
  Sofa,
  Wrench,
  Layers,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  Scan,
  AlertCircle,
  X,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ Room types Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ

const ROOM_TYPES = [
  { type: "kitchen", label: "Kitchen", icon: ChefHat },
  { type: "bathroom", label: "Bathroom", icon: Bath },
  { type: "en_suite", label: "En Suite", icon: Bath },
  { type: "living_room", label: "Living Room", icon: Sofa },
  { type: "master_bedroom", label: "Master Bedroom", icon: BedDouble },
  { type: "bedroom", label: "Bedroom", icon: BedDouble },
  { type: "hallway", label: "Hallway / Landing", icon: Home },
  { type: "utility", label: "Utility Room", icon: Wrench },
  { type: "dining_room", label: "Dining Room", icon: Layers },
  { type: "home_office", label: "Home Office", icon: Layers },
  { type: "garage", label: "Garage", icon: Home },
  { type: "other", label: "Other Room", icon: Layers },
];

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ Steps Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ

const STEPS = [
  { id: 1, label: "About you" },
  { id: 2, label: "Upload plans" },
  { id: 3, label: "Confirm rooms" },
  { id: 4, label: "Your style" },
  { id: 5, label: "Finish level" },
  { id: 6, label: "Your estimate" },
];

function StepIndicator({ current }: { current: number }) {
  const currentLabel = STEPS.find(s => s.id === current)?.label ?? "";
  const progress = ((current - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="mb-6">
      {/* Mobile: compact progress bar + step label */}
      <div className="flex flex-col items-center gap-2 md:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#FF6B2C]">Step {current} of {STEPS.length}</span>
          <span className="text-xs text-slate-500">{currentLabel}</span>
        </div>
        <div className="w-full max-w-xs h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-[#FF6B2C] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-slate-500">Takes about 3 minutes to complete.</p>
      </div>

      {/* Desktop: full horizontal stepper */}
      <div className="hidden md:flex flex-col items-center gap-1">
        <div className="flex items-start gap-0">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-start">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  step.id < current
                    ? "bg-[#FF6B2C] border-[#FF6B2C] text-white"
                    : step.id === current
                    ? "border-[#FF6B2C] text-[#FF6B2C] bg-transparent"
                    : "border-slate-600 text-slate-500 bg-transparent"
                }`}>
                  {step.id < current ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                </div>
                <span className={`text-[10px] mt-1 text-center w-12 leading-tight ${
                  step.id === current ? "text-[#FF6B2C] font-semibold" : "text-slate-500"
                }`}>{step.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-3 h-0.5 mx-0.5 mt-3.5 shrink-0 ${step.id < current ? "bg-[#FF6B2C]" : "bg-slate-700"}`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-1">Takes about 3 minutes to complete.</p>
      </div>
    </div>
  );
}

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ Types Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ

interface PlanFile {
  file: File;
  url: string | null;
  mimeType: string;
  uploading: boolean;
  error: string;
}

interface RoomEntry {
  type: string;
  label: string;
  width?: number;
  length?: number;
  height?: number;
  confidence?: string;
  // AI-generated photo for this room
  photoUrl?: string;
  photoGenerating?: boolean;
}

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ Room dimension row Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ

function RoomDimensionRow({
  room,
  index,
  onChange,
  onRemove,
}: {
  room: RoomEntry;
  index: number;
  onChange: (index: number, field: keyof RoomEntry, value: number | string | undefined) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700 relative">
      <button
        onClick={() => onRemove(index)}
        className="absolute top-3 right-3 text-slate-500 hover:text-red-400 transition-colors"
        title="Remove room"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-2 mb-3 pr-6">
        <p className="text-sm font-semibold text-white flex-1">{room.label}</p>
        {room.confidence === "low" && (
          <span className="flex items-center gap-1 text-amber-400 text-xs">
            <AlertCircle className="w-3.5 h-3.5" /> Estimated
          </span>
        )}
        {room.confidence === "high" && (
          <span className="flex items-center gap-1 text-emerald-400 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> From plan
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {(["width", "length", "height"] as const).map((field) => (
          <div key={field}>
            <label className="text-xs text-slate-400 capitalize mb-1 block">{field} (m)</label>
            <Input
              type="number"
              min={0}
              step={0.1}
              placeholder="e.g. 4.5"
              value={room[field] ?? ""}
              onChange={(e) =>
                onChange(index, field, e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className="bg-slate-900 border-slate-600 text-white text-sm h-9"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ Spinner Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ

function Spinner({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ Main component Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ

export default function NewBuildEstimate() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);

  // Step 1 â user info
  const [userType, setUserType] = useState<"homeowner" | "tradesperson">("homeowner");

  // Step 2 â plan upload (multiple files)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [planFiles, setPlanFiles] = useState<PlanFile[]>([]);
  const [scanError, setScanError] = useState("");
  const [planNotes, setPlanNotes] = useState("");

  // Step 3 â room confirmation
  const [selectedRooms, setSelectedRooms] = useState<RoomEntry[]>([]);

  // Step 4 â style prompt
  const [stylePrompt, setStylePrompt] = useState("");
  const [generatePhotos, setGeneratePhotos] = useState(true);

  // Step 5 â finish level
  const [finishLevel, setFinishLevel] = useState<"standard" | "mid" | "premium">("mid");

  // Step 6 â email gate
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [emailError, setEmailError] = useState("");

  const scanMutation = trpc.guest.scanHousePlan.useMutation({
    onSuccess: (data) => {
      const rooms: RoomEntry[] = (data.rooms ?? []).map((r: any) => ({
        type: r.type,
        label: r.label,
        width: r.width ?? undefined,
        length: r.length ?? undefined,
        height: r.height ?? undefined,
        confidence: r.confidence,
      }));
      setSelectedRooms(rooms.length > 0 ? rooms : []);
      setPlanNotes(data.planNotes ?? "");
      setScanError("");
      setStep(3);
    },
    onError: () => {
      setScanError("We couldn't read your plans automatically. Please add rooms manually below.");
      setStep(3);
    },
  });

  const generateRoomPhotoMutation = trpc.guest.generateRoomPhoto.useMutation();

  const generateMutation = trpc.guest.startNewBuildEstimate.useMutation({
    onSuccess: (data) => {
      navigate(`/new-build-result/${data.leadId}`);
    },
    onError: () => {
      setEmailError("Something went wrong. Please try again.");
    },
  });

  // Ã¢ÂÂÃ¢ÂÂ Upload a single file to S3 Ã¢ÂÂÃ¢ÂÂ
  const uploadFile = useCallback(async (file: File, index: number) => {
    setPlanFiles((prev) =>
      prev.map((pf, i) => (i === index ? { ...pf, uploading: true, error: "" } : pf))
    );
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const key = `new-build-plans/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("key", key);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Upload failed");
      }
      const { url, mimeType } = await res.json();
      setPlanFiles((prev) =>
        prev.map((pf, i) =>
          i === index ? { ...pf, url, mimeType: mimeType ?? file.type, uploading: false } : pf
        )
      );
    } catch (err: any) {
      setPlanFiles((prev) =>
        prev.map((pf, i) =>
          i === index ? { ...pf, uploading: false, error: err.message ?? "Upload failed" } : pf
        )
      );
    }
  }, []);

  // Ã¢ÂÂÃ¢ÂÂ Add files from input/drop Ã¢ÂÂÃ¢ÂÂ
  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    const remaining = 5 - planFiles.length;
    const toAdd = arr.slice(0, remaining);
    const newEntries: PlanFile[] = toAdd.map((f) => ({
      file: f,
      url: null,
      mimeType: f.type || "application/octet-stream",
      uploading: false,
      error: "",
    }));
    setPlanFiles((prev) => {
      const updated = [...prev, ...newEntries];
      // Kick off uploads for new entries
      toAdd.forEach((_, i) => {
        const idx = prev.length + i;
        setTimeout(() => uploadFile(toAdd[i], idx), 0);
      });
      return updated;
    });
  }

  // Ã¢ÂÂÃ¢ÂÂ Remove a plan file Ã¢ÂÂÃ¢ÂÂ
  function removePlanFile(index: number) {
    setPlanFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // Ã¢ÂÂÃ¢ÂÂ Scan all uploaded plans Ã¢ÂÂÃ¢ÂÂ
  function handleScanPlans() {
    const uploaded = planFiles.filter((pf) => pf.url);
    if (uploaded.length === 0) return;
    scanMutation.mutate({
      plans: uploaded.map((pf) => ({
        url: pf.url!,
        mimeType: pf.mimeType,
        name: pf.file.name,
      })),
    });
  }

  // Ã¢ÂÂÃ¢ÂÂ Skip to manual Ã¢ÂÂÃ¢ÂÂ
  function skipToManual() {
    setSelectedRooms([]);
    setStep(3);
  }

  // Ã¢ÂÂÃ¢ÂÂ Room management Ã¢ÂÂÃ¢ÂÂ
  function addRoom(type: string, label: string) {
    const count = selectedRooms.filter((r) => r.type === type).length;
    setSelectedRooms((prev) => [
      ...prev,
      { type, label: count > 0 ? `${label} ${count + 1}` : label },
    ]);
  }

  function updateDimension(
    index: number,
    field: keyof RoomEntry,
    value: number | string | undefined
  ) {
    setSelectedRooms((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  }

  function removeRoom(index: number) {
    setSelectedRooms((prev) => prev.filter((_, i) => i !== index));
  }

  // Ã¢ÂÂÃ¢ÂÂ Generate AI photos for all rooms Ã¢ÂÂÃ¢ÂÂ
  async function handleGeneratePhotos() {
    if (!stylePrompt.trim()) return;
    const updated = [...selectedRooms];
    for (let i = 0; i < updated.length; i++) {
      updated[i] = { ...updated[i], photoGenerating: true };
      setSelectedRooms([...updated]);
      try {
        const result = await generateRoomPhotoMutation.mutateAsync({
          roomLabel: updated[i].label,
          roomType: updated[i].type,
          stylePrompt: stylePrompt.trim(),
          finishLevel,
          width: updated[i].width,
          length: updated[i].length,
        });
        updated[i] = { ...updated[i], photoUrl: result.imageUrl, photoGenerating: false };
      } catch {
        updated[i] = { ...updated[i], photoGenerating: false };
      }
      setSelectedRooms([...updated]);
    }
  }

  // Ã¢ÂÂÃ¢ÂÂ Final submit Ã¢ÂÂÃ¢ÂÂ
  function handleSubmit() {
    if (!email.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    generateMutation.mutate({
      email,
      firstName: firstName || undefined,
      userType,
      finishLevel,
      rooms: selectedRooms,
      stylePrompt: stylePrompt || undefined,
    });
  }

  const allUploaded = planFiles.length > 0 && planFiles.every((pf) => pf.url && !pf.uploading);
  const anyUploading = planFiles.some((pf) => pf.uploading);

  const photosGenerating = selectedRooms.some((r) => r.photoGenerating);
  const photosGenerated = selectedRooms.some((r) => r.photoUrl);

  useEffect(() => {
    document.title =
      "New Build Estimate â Renolab. The Renovation Platform for the island of Ireland.";
    return () => {
      document.title = "Renolab â The Renovation Platform for the island of Ireland.";
    };
  }, []);

  return (
    <>
      <div className="min-h-screen bg-[#0D1117] text-white flex flex-col">
        <NavBar />

        <main className="flex-1 flex flex-col items-center justify-start pt-10 pb-20 px-4">
          {/* Header */}
          <div className="text-center mb-6 max-w-xl">
            <span className="inline-block bg-[#FF6B2C]/10 text-[#FF6B2C] text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-[#FF6B2C]/20">
              ðÃ¯Â¸Â New Build Estimator
            </span>
            <h1 className="text-2xl font-extrabold text-white mb-2">
              Get a room-by-room cost estimate for your new build
            </h1>
            <p className="text-slate-400 text-sm">
              Upload your house plans and our AI will scan them, extract every room and its
              dimensions, and generate a realistic cost estimate â all in under 3 minutes.
            </p>
          </div>

          <div className="w-full max-w-lg">
            <StepIndicator current={step} />

            {/* Ã¢ÂÂÃ¢ÂÂ Step 1: User Type Ã¢ÂÂÃ¢ÂÂ */}
            {step === 1 && (
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <h2 className="text-lg font-bold mb-4">Who is this estimate for?</h2>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {(["homeowner", "tradesperson"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setUserType(type)}
                      className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                        userType === type
                          ? "border-[#FF6B2C] bg-[#FF6B2C]/10 text-[#FF6B2C]"
                          : "border-slate-600 text-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {type === "homeowner" ? "ð  Homeowner" : "ð§ Tradesperson / Builder"}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={() => setStep(2)}
                  className="w-full bg-[#FF6B2C] hover:bg-[#e55a1f] text-white font-semibold"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}

            {/* Ã¢ÂÂÃ¢ÂÂ Step 2: Plan Upload (multi-file) Ã¢ÂÂÃ¢ÂÂ */}
            {step === 2 && (
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <h2 className="text-lg font-bold mb-1">Upload your house plans</h2>
                <p className="text-slate-400 text-sm mb-5">
                  Upload up to 5 floor plan images or PDFs (e.g. ground floor, first floor,
                  elevations). Our AI will scan all pages and merge the room list automatically.
                </p>

                {/* Drop zone */}
                <div
                  onClick={() => planFiles.length < 5 && fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
                  }}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors mb-4 ${
                    planFiles.length >= 5
                      ? "border-slate-700 opacity-50 cursor-not-allowed"
                      : "border-slate-600 hover:border-[#FF6B2C]/60 cursor-pointer"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        addFiles(e.target.files);
                        e.target.value = "";
                      }
                    }}
                  />
                  <Upload className="w-7 h-7 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-300 font-medium">
                    {planFiles.length >= 5
                      ? "Maximum 5 files reached"
                      : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    JPEG, PNG, WebP or PDF ÃÂ· Max 20 MB per file ÃÂ· Up to 5 files
                  </p>
                </div>

                {/* File list */}
                {planFiles.length > 0 && (
                  <div className="flex flex-col gap-2 mb-4">
                    {planFiles.map((pf, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-slate-900/60 rounded-xl px-3 py-2.5 border border-slate-700"
                      >
                        <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{pf.file.name}</p>
                          {pf.uploading && (
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                              <Spinner className="w-3 h-3" /> Uploadingâ¦
                            </p>
                          )}
                          {pf.url && !pf.uploading && (
                            <p className="text-xs text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Uploaded
                            </p>
                          )}
                          {pf.error && (
                            <p className="text-xs text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> {pf.error}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removePlanFile(i)}
                          className="text-slate-500 hover:text-red-400 transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleScanPlans}
                    disabled={!allUploaded || anyUploading || scanMutation.isPending}
                    className="w-full bg-[#FF6B2C] hover:bg-[#e55a1f] text-white font-semibold disabled:opacity-40"
                  >
                    {scanMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Spinner />
                        Scanning {planFiles.filter((p) => p.url).length} plan
                        {planFiles.filter((p) => p.url).length !== 1 ? "s" : ""}â¦ ~15 seconds
                      </span>
                    ) : (
                      <>
                        <Scan className="w-4 h-4 mr-2" />
                        Scan {planFiles.filter((p) => p.url).length > 0
                          ? `${planFiles.filter((p) => p.url).length} Plan${planFiles.filter((p) => p.url).length !== 1 ? "s" : ""}`
                          : "Plans"}{" "}
                        with AI
                      </>
                    )}
                  </Button>

                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-slate-700" />
                    <span className="text-xs text-slate-500">or</span>
                    <div className="flex-1 h-px bg-slate-700" />
                  </div>

                  <Button
                    variant="outline"
                    onClick={skipToManual}
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    Add rooms manually instead
                  </Button>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-full mt-3 border-slate-700 text-slate-400 hover:bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              </div>
            )}

            {/* Ã¢ÂÂÃ¢ÂÂ Step 3: Confirm / Edit Rooms Ã¢ÂÂÃ¢ÂÂ */}
            {step === 3 && (
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <h2 className="text-lg font-bold mb-1">
                  {selectedRooms.length > 0 ? "Confirm your rooms" : "Add your rooms"}
                </h2>

                {planNotes && (
                  <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-3 mb-4">
                    <p className="text-xs text-slate-400 font-semibold mb-1">AI plan summary</p>
                    <p className="text-xs text-slate-300">{planNotes}</p>
                  </div>
                )}

                {scanError && (
                  <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-3 mb-4 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-300">{scanError}</p>
                  </div>
                )}

                {selectedRooms.length > 0 ? (
                  <>
                    <p className="text-slate-400 text-sm mb-4">
                      We found {selectedRooms.length} room
                      {selectedRooms.length !== 1 ? "s" : ""} in your plans. Review and adjust
                      dimensions below â or add more rooms.
                    </p>
                    <div className="flex flex-col gap-3 mb-4 max-h-[45vh] overflow-y-auto pr-1">
                      {selectedRooms.map((room, i) => (
                        <RoomDimensionRow
                          key={i}
                          room={room}
                          index={i}
                          onChange={updateDimension}
                          onRemove={removeRoom}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-slate-400 text-sm mb-4">
                    Select rooms to include in your estimate. Tap to add, use + to add multiples.
                  </p>
                )}

                {/* Manual room add grid */}
                <details className="mb-4">
                  <summary className="text-xs text-[#FF6B2C] cursor-pointer font-semibold mb-2 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add more rooms
                  </summary>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {ROOM_TYPES.map(({ type, label, icon: Icon }) => (
                      <button
                        key={type}
                        onClick={() => addRoom(type, label)}
                        className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-600 text-slate-300 hover:border-[#FF6B2C] hover:text-[#FF6B2C] text-xs font-medium transition-all"
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{label}</span>
                        <Plus className="w-3 h-3 ml-auto shrink-0" />
                      </button>
                    ))}
                  </div>
                </details>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    disabled={selectedRooms.length === 0}
                    className="flex-1 bg-[#FF6B2C] hover:bg-[#e55a1f] text-white font-semibold disabled:opacity-40"
                  >
                    Next <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Ã¢ÂÂÃ¢ÂÂ Step 4: Style Prompt + AI Photos Ã¢ÂÂÃ¢ÂÂ */}
            {step === 4 && (
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <h2 className="text-lg font-bold mb-1">How do you want your rooms finished?</h2>
                <p className="text-slate-400 text-sm mb-5">
                  Describe your vision in plain language â our AI will generate a photo of each
                  room styled exactly as you describe, alongside your cost estimate.
                </p>

                {/* Style prompt textarea */}
                <div className="mb-4">
                  <label className="text-xs text-slate-400 mb-1.5 block font-medium">
                    Describe your style (optional but recommended)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Scandinavian kitchen with oak worktops, underfloor heating throughout, modern grey bathrooms with walk-in shower, warm living room with exposed brick feature wallâ¦"
                    value={stylePrompt}
                    onChange={(e) => setStylePrompt(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-[#FF6B2C] transition-colors"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    The more detail you give, the more accurate the AI renders will be.
                  </p>
                </div>

                {/* Generate photos toggle */}
                <div className="flex items-center justify-between bg-slate-900/60 rounded-xl px-4 py-3 border border-slate-700 mb-5">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-sm font-semibold text-white">Generate AI room photos</p>
                      <p className="text-xs text-slate-400">
                        See what each room could look like before you build
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setGeneratePhotos((v) => !v)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      generatePhotos ? "bg-purple-600" : "bg-slate-600"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        generatePhotos ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {/* Generate photos button */}
                {generatePhotos && stylePrompt.trim() && (
                  <div className="mb-5">
                    {photosGenerated ? (
                      <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-xl p-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <p className="text-sm text-emerald-300">
                          AI photos generated for {selectedRooms.filter((r) => r.photoUrl).length}{" "}
                          room{selectedRooms.filter((r) => r.photoUrl).length !== 1 ? "s" : ""}.
                          You'll see them on your results page.
                        </p>
                      </div>
                    ) : (
                      <Button
                        onClick={handleGeneratePhotos}
                        disabled={photosGenerating}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                      >
                        {photosGenerating ? (
                          <span className="flex items-center gap-2">
                            <Spinner />
                            Generating room photosâ¦ ({selectedRooms.filter((r) => r.photoUrl).length}/{selectedRooms.length})
                          </span>
                        ) : (
                          <>
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Generate AI Photos for {selectedRooms.length} Room
                            {selectedRooms.length !== 1 ? "s" : ""}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}

                {/* Room photo previews */}
                {selectedRooms.some((r) => r.photoUrl || r.photoGenerating) && (
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {selectedRooms.map((room, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900/60">
                        {room.photoGenerating ? (
                          <div className="aspect-video flex items-center justify-center">
                            <Spinner className="w-5 h-5 text-purple-400" />
                          </div>
                        ) : room.photoUrl ? (
                          <img
                            src={room.photoUrl}
                            alt={room.label}
                            className="w-full aspect-video object-cover"
                          />
                        ) : null}
                        <p className="text-xs text-slate-400 px-2 py-1.5 truncate">{room.label}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                    className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    onClick={() => setStep(5)}
                    disabled={photosGenerating}
                    className="flex-1 bg-[#FF6B2C] hover:bg-[#e55a1f] text-white font-semibold disabled:opacity-40"
                  >
                    Next <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Ã¢ÂÂÃ¢ÂÂ Step 5: Finish Level Ã¢ÂÂÃ¢ÂÂ */}
            {step === 5 && (
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <h2 className="text-lg font-bold mb-1">What finish level are you aiming for?</h2>
                <p className="text-slate-400 text-sm mb-4">
                  This affects material and fitting costs across all rooms.
                </p>
                <div className="flex flex-col gap-3 mb-6">
                  {(
                    [
                      {
                        value: "standard",
                        title: "Standard",
                        desc: "Functional and cost-effective. Builder-grade fixtures and fittings.",
                      },
                      {
                        value: "mid",
                        title: "Mid-Range",
                        desc: "Good quality throughout. Popular brands, solid materials.",
                      },
                      {
                        value: "premium",
                        title: "Premium",
                        desc: "High-spec finishes. Designer fixtures, premium tiles, bespoke joinery.",
                      },
                    ] as const
                  ).map(({ value, title, desc }) => (
                    <button
                      key={value}
                      onClick={() => setFinishLevel(value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        finishLevel === value
                          ? "border-[#FF6B2C] bg-[#FF6B2C]/10"
                          : "border-slate-600 hover:border-slate-400"
                      }`}
                    >
                      <p
                        className={`font-semibold text-sm ${
                          finishLevel === value ? "text-[#FF6B2C]" : "text-white"
                        }`}
                      >
                        {title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(4)}
                    className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    onClick={() => setStep(6)}
                    className="flex-1 bg-[#FF6B2C] hover:bg-[#e55a1f] text-white font-semibold"
                  >
                    Next <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Ã¢ÂÂÃ¢ÂÂ Step 6: Email Gate + Submit Ã¢ÂÂÃ¢ÂÂ */}
            {step === 6 && (
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <h2 className="text-lg font-bold mb-1">
                  Almost there â where should we send your estimate?
                </h2>
                <p className="text-slate-400 text-sm mb-5">
                  Your free estimate covers {selectedRooms.length} room
                  {selectedRooms.length !== 1 ? "s" : ""} at {finishLevel} finish level.
                  {photosGenerated ? " AI room photos included." : ""} Enter your email to unlock
                  it.
                </p>
                <div className="flex flex-col gap-3 mb-5">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">
                      First name (optional)
                    </label>
                    <Input
                      placeholder="e.g. CiarÃÂ¡n"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Email address *</label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                      }}
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                    {emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(5)}
                    className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={generateMutation.isPending}
                    className="flex-1 bg-[#FF6B2C] hover:bg-[#e55a1f] text-white font-semibold"
                  >
                    {generateMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Spinner />
                        Generating estimateâ¦
                      </span>
                    ) : (
                      <>
                        Get My Estimate <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 text-center mt-3">
                  We'll never spam you. Your email is used to send your estimate only.
                </p>
              </div>
            )}
          </div>
        </main>

        <footer className="text-center text-xs text-slate-600 py-4 border-t border-slate-800">
          Built on the island of Ireland. renolab.co.uk
        </footer>
      </div>
    </>
  );
}
