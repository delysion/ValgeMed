"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Send, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface SmartInputProps {
  onSubmit: (text: string) => Promise<boolean>;
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
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function SmartInput({ onSubmit, placeholder, submitLabel, listeningLabel, disabled, className }: SmartInputProps) {
  const { locale, t } = useTranslation();
  const [inputError, setInputError] = useState<string>();
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => () => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    recognition?.abort();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading || isListening || disabled) return;
    setInputError(undefined);
    setIsLoading(true);
    try {
      if (await onSubmit(text.trim())) setText("");
    } catch {
      setInputError(t("smartInput.sendFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = useCallback(() => {
    if (recognitionRef.current) return;
    setInputError(undefined);

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setInputError(t("smartInput.voiceUnsupported"));
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = locale === "et" ? "et-EE" : "en-US";

    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;
      recognitionRef.current = null;
      setIsListening(false);
    };
    recognition.onerror = () => {
      if (recognitionRef.current !== recognition) return;
      recognitionRef.current = null;
      setIsListening(false);
      setInputError(t("smartInput.voiceFailed"));
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (recognitionRef.current !== recognition) return;
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      setText([text.trimEnd(), transcript.trim()].filter(Boolean).join(" "));
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      recognitionRef.current = null;
      setInputError(t("smartInput.voiceFailed"));
    }
  }, [locale, t, text]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-2 sm:gap-2">
        <div className="relative flex-1 min-w-0">
          <Input
            type="text"
            name="smart-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            autoComplete="off"
            disabled={disabled || isLoading || isListening}
            className="pr-12 h-12 text-sm sm:text-base"
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
          aria-label={t(isListening ? "smartInput.voiceStop" : "smartInput.voiceStart")}
          className="h-12 w-10 sm:w-12 shrink-0"
        >
          {isListening ? <MicOff className="h-5 w-5" aria-hidden="true" /> : <Mic className="h-5 w-5" aria-hidden="true" />}
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={disabled || !text.trim() || isLoading || isListening}
          aria-label={submitLabel}
          className="h-12 shrink-0 px-3 sm:px-5"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Send className="h-5 w-5" aria-hidden="true" />}
          <span className="ml-1 hidden sm:inline">{submitLabel}</span>
        </Button>
      </div>
      {inputError && <p role="alert" className="text-sm text-rose">{inputError}</p>}
      {isListening && (
        <p role="status" className="text-sm text-text-secondary animate-pulse">
          {listeningLabel}
        </p>
      )}
    </form>
  );
}
