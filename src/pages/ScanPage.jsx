import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Camera, ScanLine, Check, X, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { simulateAIDetection, generateQRCode } from "../lib/demoData";
import DropPointSelector from "../components/DropPointSelector";

export default function ScanPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [step, setStep] = useState("capture"); // capture, analyzing, result, selectDrop
  const [imagePreview, setImagePreview] = useState(null);
  const [detection, setDetection] = useState(null);

  async function handleImageCapture(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);

    setStep("analyzing");

    // Upload image
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    // Simulate AI detection (replace with real API call)
    const result = await simulateAIDetection();
    setDetection({ ...result, image_url: file_url });

    setStep("result");
  }

  async function handleProceed() {
    setStep("selectDrop");
  }

  async function handleDropPointSelected(dropPoint) {
    const qrCode = generateQRCode();
    
    const record = await base44.entities.WasteDetection.create({
      image_url: detection.image_url,
      result: detection.result,
      confidence: detection.confidence,
      valid: detection.valid,
      status: "detected",
      drop_point: dropPoint.name,
      drop_point_lat: dropPoint.lat,
      drop_point_lng: dropPoint.lng,
      qr_code: qrCode,
      points_earned: detection.points || 0,
    });

    navigate(`/drone-status?id=${record.id}`);
  }

  function reset() {
    setStep("capture");
    setImagePreview(null);
    setDetection(null);
  }

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold mb-1">Scan Waste</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Take a photo of recyclable waste for AI detection
      </p>

      <AnimatePresence mode="wait">
        {step === "capture" && (
          <motion.div
            key="capture"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-[4/3] bg-muted rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <>
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Camera className="h-10 w-10 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Capture Waste Image</p>
                    <p className="text-xs text-muted-foreground">Take a photo or upload an image</p>
                  </div>
                </>
              )}
              {/* Scan overlay corners */}
              <div className="absolute inset-4 pointer-events-none">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg" />
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageCapture}
            />

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium"
              >
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = handleImageCapture;
                  input.click();
                }}
                className="h-12 rounded-xl font-medium"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </motion.div>
        )}

        {step === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 space-y-4"
          >
            {imagePreview && (
              <div className="w-32 h-32 rounded-2xl overflow-hidden mb-2">
                <img src={imagePreview} alt="Scanning" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="relative">
              <div className="p-4 bg-primary/10 rounded-full">
                <ScanLine className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold">Analyzing with AI...</p>
              <p className="text-sm text-muted-foreground">Detecting waste type and recyclability</p>
            </div>
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </motion.div>
        )}

        {step === "result" && detection && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {imagePreview && (
              <div className="aspect-video rounded-2xl overflow-hidden">
                <img src={imagePreview} alt="Scanned" className="w-full h-full object-cover" />
              </div>
            )}

            <div className={`p-5 rounded-2xl border ${detection.valid ? "bg-primary/5 border-primary/20" : "bg-destructive/5 border-destructive/20"}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-full ${detection.valid ? "bg-primary/10" : "bg-destructive/10"}`}>
                  {detection.valid ? (
                    <Check className="h-5 w-5 text-primary" />
                  ) : (
                    <X className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-lg">{detection.result}</p>
                  <p className="text-sm text-muted-foreground">
                    {detection.confidence}% confidence
                  </p>
                </div>
              </div>

              {detection.valid ? (
                <div className="bg-card rounded-xl p-3 border border-border">
                  <p className="text-sm text-primary font-medium">
                    ✅ Valid recyclable waste! Earn {detection.points} EcoPoints
                  </p>
                </div>
              ) : (
                <div className="bg-card rounded-xl p-3 border border-border">
                  <p className="text-sm text-destructive font-medium">
                    ❌ Invalid waste type. This item cannot be recycled through EcoDrone+.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={reset} className="h-12 rounded-xl">
                Scan Again
              </Button>
              {detection.valid && (
                <Button onClick={handleProceed} className="h-12 rounded-xl bg-primary hover:bg-primary/90 text-white">
                  Select Drop Point
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {step === "selectDrop" && (
          <motion.div
            key="selectDrop"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <DropPointSelector onSelect={handleDropPointSelected} onBack={() => setStep("result")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}