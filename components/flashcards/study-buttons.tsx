"use client";

import { Button } from "@/components/ui/button";

interface StudyButtonsProps {
  onResponse: (quality: 0 | 1 | 2 | 3) => void;
  labels: {
    again: string;
    hard: string;
    good: string;
    easy: string;
  };
  disabled?: boolean;
}

export function StudyButtons({ onResponse, labels, disabled }: StudyButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        type="button"
        variant="destructive"
        size="lg"
        className="flex-1"
        onClick={() => onResponse(0)}
        disabled={disabled}
      >
        {labels.again}
      </Button>
      <Button
        type="button"
        variant="muted"
        size="lg"
        className="flex-1"
        onClick={() => onResponse(1)}
        disabled={disabled}
      >
        {labels.hard}
      </Button>
      <Button
        type="button"
        variant="emerald"
        size="lg"
        className="flex-1"
        onClick={() => onResponse(2)}
        disabled={disabled}
      >
        {labels.good}
      </Button>
      <Button
        type="button"
        variant="cyan"
        size="lg"
        className="flex-1"
        onClick={() => onResponse(3)}
        disabled={disabled}
      >
        {labels.easy}
      </Button>
    </div>
  );
}