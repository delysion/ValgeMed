"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/premium/glass-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  sizeBytes: number;
  extractedText: string | null;
}

interface FileUploadZoneProps {
  onUploadComplete?: (file: UploadedFile) => void;
  onTextExtracted?: (text: string, filename: string) => void;
  subjectId?: string;
  topicId?: string;
  className?: string;
}

export function FileUploadZone({
  onUploadComplete,
  onTextExtracted,
  subjectId,
  topicId,
  className,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        if (subjectId) formData.append("subjectId", subjectId);
        if (topicId) formData.append("topicId", topicId);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await res.json();
        setUploadedFile(data.upload);
        onUploadComplete?.(data.upload);

        if (data.upload.extractedText && onTextExtracted) {
          onTextExtracted(data.upload.extractedText, data.upload.originalName);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [subjectId, topicId, onUploadComplete, onTextExtracted]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clearFile = () => {
    setUploadedFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (uploadedFile) {
    return (
      <GlassCard tone="emerald" className={cn("relative", className)}>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 h-7 w-7"
          onClick={clearFile}
          aria-label="Remove uploaded file"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-primary truncate">
              {uploadedFile.originalName}
            </p>
            <p className="text-xs text-text-secondary">
              {formatSize(uploadedFile.sizeBytes)}
              {uploadedFile.extractedText && " · Text extracted"}
            </p>
            {uploadedFile.extractedText && (
              <p className="mt-2 text-xs text-text-muted line-clamp-3 leading-relaxed">
                {uploadedFile.extractedText.substring(0, 200)}
                {uploadedFile.extractedText.length > 200 ? "..." : ""}
              </p>
            )}
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload study file"
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/40 hover:bg-bg-subtle/50",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        {isUploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
          <Upload className="h-8 w-8 text-text-muted" />
        )}
        <div className="text-center">
          <p className="text-sm font-medium text-text-primary">
            {isUploading ? "Uploading..." : "Drop file here or click to upload"}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            .txt, .md — max 10MB
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        name="file"
        accept=".txt,.md"
        aria-label="Upload study file"
        onChange={handleInputChange}
        className="hidden"
      />

      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-rose" role="alert">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          {error}
        </div>
      )}
    </div>
  );
}
