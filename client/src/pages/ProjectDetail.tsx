import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useParams } from "wouter";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Camera,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Download,
  ImagePlus,
  Loader2,
  Package,
  Palette,
  Ruler,
  Sparkles,
  Wand2,
  X,
  XCircle,
} from "lucide-react";

function NavBar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="container flex items-center gap-4 h-16">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Dashboard</Button>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-xs">P</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Renolab</span>
        </div>
      </div>
    </header>
  );
}

const STEPS = ["Room Photo", "Dimensions", "Style & Vision", "Analyse"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center mb-6">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                i < current
                  ? "bg-primary border-primary text-white"
                  : i === current
                  ? "border-primary text-primary bg-white"
                  : "border-muted-foreground/30 text-muted-foreground/50 bg-white"
              }`}
            >
              {i < current ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${i === current ? "text-primary" : "text-muted-foreground/60"}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 mb-4 transition-colors ${i < current ? "bg-primary" : "bg-muted-foreground/20"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function RoomUploadCard({ projectId, onAnalysed }: { projectId: number; onAnalysed: () => void }) {
  const roomPhotoRef = useRef<HTMLInputElement>(null);
  const refImgRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [roomName, setRoomName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [width, setWidth] = useState("");
  const [length, setLength] = useState("");
  const [height, setHeight] = useState("");
  const [stylePrompt, setStylePrompt] = useState("");
  const [refFiles, setRefFiles] = useState<File[]>([]);
  const [refPreviews, setRefPreviews] = useState<string[]>([]);
  const [stage, setStage] = useState<"idle" | "uploading" | "analysing" | "done" | "error">("idle");

  const getUploadUrl = trpc.analysis.getUploadUrl.useMutation();
  const analyzeRoom = trpc.analysis.analyzeRoom.useMutation();

  function handleRoomFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
  }

  function handleRefFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 3 - refFiles.length);
    setRefFiles(prev => [...prev, ...files].slice(0, 3));
    setRefPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))].slice(0, 3));
  }

  function removeRefFile(i: number) {
    setRefFiles(prev => prev.filter((_, idx) => idx !== i));
    setRefPreviews(prev => prev.filter((_, idx) => idx !== i));
  }

  async function uploadFile(f: File, key: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", f);
    formData.append("key", key);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    const { url } = await res.json();
    return url as string;
  }

  async function handleAnalyse() {
    if (!file) return;
    setStage("uploading");
    try {
      const { key } = await getUploadUrl.mutateAsync({
        projectId,
        fileName: file.name,
        contentType: file.type,
        roomName: roomName || "Room",
      });
      const photoUrl = await uploadFile(file, key);

      let referenceImageUrls: string[] = [];
      if (refFiles.length > 0) {
        referenceImageUrls = await Promise.all(
          refFiles.map((rf, i) => uploadFile(rf, `references/${projectId}/${Date.now()}-ref${i}-${rf.name}`))
        );
      }

      setStage("analysing");

      const manualDimensions =
        width || length || height
          ? {
              width: width ? parseFloat(width) : undefined,
              length: length ? parseFloat(length) : undefined,
              height: height ? parseFloat(height) : undefined,
            }
          : undefined;

      await analyzeRoom.mutateAsync({
        projectId,
        photoKey: key,
        photoUrl,
        roomName: roomName || "Room",
        manualDimensions,
        stylePrompt: stylePrompt || undefined,
        referenceImageUrls: referenceImageUrls.length > 0 ? referenceImageUrls : undefined,
      });

      setStage("done");
      toast.success("Room analysis complete!");
      setFile(null); setFilePreview(null); setRoomName("");
      setWidth(""); setLength(""); setHeight("");
      setStylePrompt(""); setRefFiles([]); setRefPreviews([]);
      setStep(0);
      onAnalysed();
    } catch (e: any) {
      setStage("error");
      toast.error(e.message ?? "Analysis failed. Please try again.");
    }
  }

  const isProcessing = stage === "uploading" || stage === "analysing";

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Camera className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-base">Analyse a Room</h3>
      </div>

      <StepIndicator current={step} />

      {step === 0 && (
        <div className="space-y-4">
          <div>
            <Label>Room Name</Label>
            <Input placeholder="e.g. Kitchen, Living Room" value={roomName} onChange={e => setRoomName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Room Photo <span className="text-destructive">*</span></Label>
            <div
              className="mt-1 border-2 border-dashed border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
              onClick={() => roomPhotoRef.current?.click()}
            >
              {filePreview ? (
                <div className="relative">
                  <img src={filePreview} alt="Room preview" className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium">Click to change</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload a room photo</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP up to 10MB</p>
                </div>
              )}
            </div>
            <input ref={roomPhotoRef} type="file" accept="image/*" className="hidden" onChange={handleRoomFileChange} />
          </div>
          <Button className="w-full" disabled={!file} onClick={() => setStep(1)}>
            Next: Add Dimensions
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter your room measurements for more accurate estimates, or leave blank to let the AI estimate from the photo.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Width (m)</Label>
              <Input type="number" step="0.1" min="0" placeholder="e.g. 4.2" value={width} onChange={e => setWidth(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Length (m)</Label>
              <Input type="number" step="0.1" min="0" placeholder="e.g. 5.8" value={length} onChange={e => setLength(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Height (m)</Label>
              <Input type="number" step="0.1" min="0" placeholder="e.g. 2.4" value={height} onChange={e => setHeight(e.target.value)} className="mt-1" />
            </div>
          </div>
          {width && length && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
              <p className="font-medium text-primary text-xs">Calculated</p>
              <p className="text-muted-foreground text-xs mt-1">
                Floor area: <strong>{(parseFloat(width) * parseFloat(length)).toFixed(1)} mÂ²</strong>
                {height && <> Â· Wall perimeter: <strong>{(2 * (parseFloat(width) + parseFloat(length))).toFixed(1)} m</strong></>}
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>Back</Button>
            <Button className="flex-1" onClick={() => setStep(2)}>Next: Style & Vision</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <Label>Describe Your Desired Look</Label>
            <Textarea
              placeholder="e.g. Modern Scandinavian kitchen with white cabinets, warm oak accents, and brushed brass fixtures. Bright and airy with plenty of storage..."
              value={stylePrompt}
              onChange={e => setStylePrompt(e.target.value)}
              className="mt-1 min-h-[100px] resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">Describe colours, finishes, style, mood — the more detail, the better the AI recommendations.</p>
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <ImagePlus className="w-4 h-4" />
              Reference Images <span className="text-muted-foreground font-normal text-xs ml-1">(up to 3)</span>
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5 mb-2">Upload inspiration photos — the AI will align its recommendations with your chosen style.</p>

            {refPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {refPreviews.map((src, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden border border-border">
                    <img src={src} alt={`Reference ${i + 1}`} className="w-full h-24 object-cover" />
                    <button
                      className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 hover:bg-black/80 transition-colors"
                      onClick={() => removeRefFile(i)}
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {refFiles.length < 3 && (
              <div
                className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => refImgRef.current?.click()}
              >
                <ImagePlus className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Add inspiration photo ({refFiles.length}/3)</p>
              </div>
            )}
            <input ref={refImgRef} type="file" accept="image/*" multiple className="hidden" onChange={handleRefFilesChange} />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
            <Button className="flex-1" onClick={() => setStep(3)}>Review & Analyse</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-muted/40 rounded-xl p-4 space-y-3 text-sm">
            <div className="flex gap-3">
              {filePreview && <img src={filePreview} alt="Room" className="w-20 h-16 object-cover rounded-lg shrink-0" />}
              <div>
                <p className="font-semibold">{roomName || "Room"}</p>
                {(width || length || height) && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {[width && `W: ${width}m`, length && `L: ${length}m`, height && `H: ${height}m`].filter(Boolean).join(" Â· ")}
                  </p>
                )}
                {stylePrompt && <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">"{stylePrompt}"</p>}
              </div>
            </div>
            {refPreviews.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">{refPreviews.length} reference image{refPreviews.length > 1 ? "s" : ""} attached</p>
                <div className="flex gap-1.5">
                  {refPreviews.map((src, i) => (
                    <img key={i} src={src} alt={`Ref ${i + 1}`} className="w-12 h-10 object-cover rounded" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {stage === "uploading" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading photos...
            </div>
          )}
          {stage === "analysing" && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <Sparkles className="w-4 h-4 animate-pulse" /> AI is analysing your room...
            </div>
          )}
          {stage === "done" && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" /> Analysis complete!
            </div>
          )}
          {stage === "error" && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <XCircle className="w-4 h-4" /> Analysis failed. Please try again.
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" disabled={isProcessing} onClick={() => setStep(2)}>Back</Button>
            <Button className="flex-1" disabled={isProcessing} onClick={handleAnalyse}>
              {isProcessing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Analyse with AI</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalysisCard({ analysis, projectId, onMaterialsGenerated, onRenderGenerated }: { analysis: any; projectId: number; onMaterialsGenerated: () => void; onRenderGenerated: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [renderLoading, setRenderLoading] = useState(false);
  const generateMaterials = trpc.analysis.generateMaterials.useMutation();
  const generateRender = trpc.analysis.generateRender.useMutation();
  const dims = analysis.dimensions as any;
  const scope = analysis.renovationScope as any;
  const style = analysis.styleRecommendations as any;

  async function handleGenerateMaterials() {
    setGenerating(true);
    try {
      await generateMaterials.mutateAsync({ analysisId: analysis.id, projectId });
      toast.success("Materials list generated!");
      onMaterialsGenerated();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to generate materials list");
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerateRender() {
    setRenderLoading(true);
    try {
      await generateRender.mutateAsync({ analysisId: analysis.id });
      toast.success("3D render generated!");
      onRenderGenerated();
    } catch (e: any) {
      toast.error(e.message ?? "Render generation failed. Please try again.");
    } finally {
      setRenderLoading(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${analysis.status === "completed" ? "bg-green-500" : analysis.status === "processing" ? "bg-amber-500 animate-pulse" : "bg-red-500"}`} />
          <div>
            <p className="font-medium text-sm">{analysis.roomName}</p>
            <p className="text-xs text-muted-foreground">{new Date(analysis.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs capitalize">{analysis.status}</Badge>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && analysis.status === "completed" && (
        <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
          {dims && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold">Dimensions</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { label: "Width", value: `${dims.width?.toFixed(1)}m` },
                  { label: "Length", value: `${dims.length?.toFixed(1)}m` },
                  { label: "Height", value: `${dims.height?.toFixed(1)}m` },
                  { label: "Floor Area", value: `${dims.area?.toFixed(1)}mÂ²` },
                  { label: "Perimeter", value: `${dims.perimeter?.toFixed(1)}m` },
                ].map(d => (
                  <div key={d.label} className="bg-muted/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-muted-foreground">{d.label}</p>
                    <p className="text-sm font-semibold">{d.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {scope && (
            <div>
              <p className="text-sm font-semibold mb-2">Renovation Scope</p>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Room type: <span className="text-foreground font-medium">{scope.roomType}</span></p>
                <p className="text-xs text-muted-foreground">Condition: <span className="text-foreground font-medium capitalize">{scope.condition}</span></p>
                {scope.identifiedFeatures?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {scope.identifiedFeatures.map((f: string) => (
                      <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                    ))}
                  </div>
                )}
                {scope.recommendedWork?.length > 0 && (
                  <ul className="mt-2 space-y-0.5">
                    {scope.recommendedWork.map((w: string) => (
                      <li key={w} className="text-xs text-muted-foreground flex gap-1.5">
                        <span className="text-primary mt-0.5">•</span>{w}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {style && (
            <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-primary">Style Recommendations</p>
              </div>
              <div className="space-y-2">
                {style.palette && (
                  <p className="text-xs"><span className="font-medium text-foreground">Colour Palette:</span> <span className="text-muted-foreground">{style.palette}</span></p>
                )}
                {style.finishes?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-foreground mb-1">Finishes</p>
                    <div className="flex flex-wrap gap-1">
                      {style.finishes.map((f: string) => <Badge key={f} variant="outline" className="text-xs border-primary/30 text-primary">{f}</Badge>)}
                    </div>
                  </div>
                )}
                {style.keyMaterials?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-foreground mb-1">Key Materials</p>
                    <div className="flex flex-wrap gap-1">
                      {style.keyMaterials.map((m: string) => <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>)}
                    </div>
                  </div>
                )}
                {style.designNotes && (
                  <p className="text-xs text-muted-foreground italic mt-1">"{style.designNotes}"</p>
                )}
              </div>
            </div>
          )}

          {analysis.aiSummary && (
            <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 leading-relaxed">{analysis.aiSummary}</p>
          )}

          {/* Render section */}
          {analysis.renderStatus === "completed" && analysis.renderUrl ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-primary" />
                  AI Room Render
                </p>
                <a
                  href={analysis.renderUrl}
                  download="plotr-render.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Download className="w-3 h-3" /> Download
                </a>
              </div>
              <div className="rounded-xl overflow-hidden border border-border">
                <img
                  src={analysis.renderUrl}
                  alt="AI room render"
                  className="w-full object-cover"
                />
              </div>
              {analysis.renderPrompt && (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer hover:text-foreground transition-colors">View render prompt</summary>
                  <p className="mt-1 bg-muted/40 rounded p-2 leading-relaxed">{analysis.renderPrompt}</p>
                </details>
              )}
              <Button size="sm" variant="outline" className="w-full" onClick={handleGenerateRender} disabled={renderLoading}>
                {renderLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Regenerating...</> : <><Wand2 className="w-4 h-4 mr-2" /> Regenerate Render</>}
              </Button>
            </div>
          ) : analysis.renderStatus === "generating" || renderLoading ? (
            <div className="bg-primary/5 border border-primary/15 rounded-xl p-5 text-center">
              <Wand2 className="w-8 h-8 text-primary mx-auto mb-2 animate-pulse" />
              <p className="text-sm font-medium text-primary">Generating your 3D render...</p>
              <p className="text-xs text-muted-foreground mt-1">This takes 15–30 seconds</p>
              <div className="mt-3 h-1.5 bg-primary/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-[pulse_2s_ease-in-out_infinite] w-2/3" />
              </div>
            </div>
          ) : (
            <Button size="sm" variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/5" onClick={handleGenerateRender} disabled={renderLoading}>
              <Wand2 className="w-4 h-4 mr-2" /> Generate 3D Room Render
            </Button>
          )}

          <Button size="sm" className="w-full" onClick={handleGenerateMaterials} disabled={generating}>
            {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Package className="w-4 h-4 mr-2" /> Generate Materials List</>}
          </Button>
        </div>
      )}
    </div>
  );
}

function MaterialsListCard({ list }: { list: any }) {
  const [expanded, setExpanded] = useState(false);
  const items = list.items as any[];
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <Package className="w-4 h-4 text-primary" />
          <div>
            <p className="font-medium text-sm">{list.title}</p>
            <p className="text-xs text-muted-foreground">{items?.length ?? 0} items</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Trade Price</p>
            <p className="text-sm font-bold text-primary">£{list.totalTradePrice?.toFixed(2)}</p>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>
      {expanded && (
        <div className="border-t border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Item</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Category</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground">Qty</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground">Trade £</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground">Retail £</th>
                </tr>
              </thead>
              <tbody>
                {items?.map((item: any, i: number) => (
                  <tr key={i} className="border-t border-border/50 hover:bg-muted/20">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-xs">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">{item.description}</p>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground capitalize">{item.category}</td>
                    <td className="px-4 py-2.5 text-right text-xs">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-2.5 text-right text-xs font-medium text-primary">£{item.tradePrice?.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">£{item.retailPrice?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/50">
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-xs font-semibold">Total</td>
                  <td className="px-4 py-2 text-right text-sm font-bold text-primary">£{list.totalTradePrice?.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right text-xs text-muted-foreground">£{list.totalRetailPrice?.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {list.notes && (
            <p className="px-4 py-3 text-xs text-muted-foreground border-t border-border/50 bg-muted/20">{list.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id ?? "0");
  const { isAuthenticated, loading } = useAuth();

  const { data: project, isLoading: projectLoading } = trpc.projects.get.useQuery(
    { id: projectId },
    { enabled: isAuthenticated && !!projectId }
  );
  const { data: analyses, refetch: refetchAnalyses } = trpc.analysis.listByProject.useQuery(
    { projectId },
    { enabled: isAuthenticated && !!projectId }
  );
  const { data: materials, refetch: refetchMaterials } = trpc.materials.listByProject.useQuery(
    { projectId },
    { enabled: isAuthenticated && !!projectId }
  );

  if (loading || projectLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Sign in to view your project</h2>
        <a href={getLoginUrl()}><Button>Sign In</Button></a>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold">Project not found</h2>
        <Link href="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">{project.title}</h1>
          {project.description && <p className="text-muted-foreground mt-1">{project.description}</p>}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="capitalize text-xs">{project.status}</Badge>
            {project.totalEstimatedCost && <span className="text-xs text-muted-foreground">Budget: £{project.totalEstimatedCost.toLocaleString()}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <RoomUploadCard projectId={projectId} onAnalysed={() => { refetchAnalyses(); refetchMaterials(); }} />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div>
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Room Analyses
                <Badge variant="secondary" className="text-xs">{analyses?.length ?? 0}</Badge>
              </h2>
              {analyses?.length ? (
                <div className="space-y-3">
                  {analyses.map(a => (
                    <AnalysisCard key={a.id} analysis={a} projectId={projectId} onMaterialsGenerated={() => refetchMaterials()} onRenderGenerated={() => refetchAnalyses()} />
                  ))}
                </div>
              ) : (
                <div className="bg-muted/30 rounded-xl p-6 text-center">
                  <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No room analyses yet. Upload a photo to get started.</p>
                </div>
              )}
            </div>

            {materials && materials.length > 0 && (
              <div>
                <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  Materials Lists
                  <Badge variant="secondary" className="text-xs">{materials.length}</Badge>
                </h2>
                <div className="space-y-3">
                  {materials.map(m => <MaterialsListCard key={m.id} list={m} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
