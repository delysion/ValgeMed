"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WORK_DURATION = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;
const LONG_BREAK_INTERVAL = 4;

type TimerMode = "work" | "shortBreak" | "longBreak";

export function FocusTimer({ onComplete }: { onComplete?: (minutes: number) => void }) {
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const onCompleteRef = useRef(onComplete);
  const sessionsRef = useRef(sessions);
  const modeRef = useRef(mode);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const duration = mode === "work" ? WORK_DURATION : mode === "shortBreak" ? SHORT_BREAK : LONG_BREAK;

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(duration);
  }, [duration]);

  const toggle = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const skip = useCallback(() => {
    setIsRunning(false);
    const currentMode = modeRef.current;
    const currentSessions = sessionsRef.current;

    if (currentMode === "work") {
      const nextSessions = currentSessions + 1;
      setSessions(nextSessions);
      onCompleteRef.current?.(WORK_DURATION / 60);
      if (nextSessions % LONG_BREAK_INTERVAL === 0) {
        setMode("longBreak");
        setTimeLeft(LONG_BREAK);
      } else {
        setMode("shortBreak");
        setTimeLeft(SHORT_BREAK);
      }
    } else {
      setMode("work");
      setTimeLeft(WORK_DURATION);
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const currentMode = modeRef.current;
          const currentSessions = sessionsRef.current;

          if (currentMode === "work") {
            const nextSessions = currentSessions + 1;
            setSessions(nextSessions);
            onCompleteRef.current?.(WORK_DURATION / 60);
            if (nextSessions % LONG_BREAK_INTERVAL === 0) {
              setMode("longBreak");
              return LONG_BREAK;
            }
            setMode("shortBreak");
            return SHORT_BREAK;
          }
          setMode("work");
          return WORK_DURATION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((duration - timeLeft) / duration) * 100;

  const modeColors = {
    work: "text-cyan",
    shortBreak: "text-emerald",
    longBreak: "text-violet",
  };
  const modeLabels = {
    work: "Focus",
    shortBreak: "Short Break",
    longBreak: "Long Break",
  };
  const ringColor = {
    work: "var(--cyan)",
    shortBreak: "var(--emerald)",
    longBreak: "var(--violet)",
  };
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const dash = (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative grid h-48 w-48 place-items-center sm:h-56 sm:w-56">
        <svg viewBox="0 0 180 180" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={ringColor[mode]}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeLinecap="round"
            strokeWidth="6"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="relative text-center">
          <p className={cn("font-mono text-5xl font-semibold sm:text-6xl", modeColors[mode])}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{modeLabels[mode]}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={reset} aria-label="Reset">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button size="icon" onClick={toggle} aria-label={isRunning ? "Pause" : "Start"}>
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="icon" onClick={skip} aria-label="Skip">
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {sessions > 0 ? (
        <div className="flex items-center gap-1.5">
          {Array.from({ length: sessions }).map((_, i) => (
            <div key={i} className="h-2 w-2 rounded-full bg-cyan" />
          ))}
          <span className="ml-1 text-xs text-muted">{sessions} session{sessions > 1 ? "s" : ""}</span>
        </div>
      ) : null}
    </div>
  );
}
