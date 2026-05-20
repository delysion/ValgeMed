"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Send, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SmartInputProps {
  onSubmit: (text: string) => Promise<void>;
  placeholder: string;
  submitLabel: string;
  listeningLabel: string;
  disabled?: boolean;
  className?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function SmartInput({ onSubmit, placeholder, submitLabel, listeningLabel, disabled, className }: SmartInputProps) {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    try {
      await onSubmit(text.trim());
      setText("");
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      console.warn("Speech recognition not supported in this browser");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      setText(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className="pr-12 h-12 text-base"
          />
          {isListening && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <Mic className="h-4 w-4 text-red-500" />
            </div>
          )}
        </div>
        <Button
          type="button"
          variant={isListening ? "destructive" : "ghost"}
          size="icon"
          onClick={isListening ? stopListening : startListening}
          disabled={disabled || isLoading}
          className="h-12 w-12 shrink-0"
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={!text.trim() || isLoading}
          className="h-12 shrink-0 px-5"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          <span className="ml-1">{submitLabel}</span>
        </Button>
      </div>
      {isListening && (
        <p className="text-sm text-text-secondary animate-pulse">
          {listeningLabel}
        </p>
      )}
    </form>
  );
}