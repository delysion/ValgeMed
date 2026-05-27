import { saveEliteTargetSettingsAction } from "@/lib/actions/settings";
import {
  examStrategyLabels,
  targetLevelLabels,
  weaknessToleranceLabels,
  type EliteTargetSettings,
} from "@/lib/scoring/elite-performance";
import { FieldGrid, NativeSelectField, SubmitBar } from "@/components/forms/fields";

function options<T extends string>(labels: Record<T, string>) {
  return Object.entries(labels).map(([value, label]) => ({
    value,
    label: String(label),
  }));
}

export function EliteTargetSettingsForm({ settings }: { settings: EliteTargetSettings }) {
  return (
    <form action={saveEliteTargetSettingsAction} className="space-y-5">
      <FieldGrid>
        <NativeSelectField
          label="Target level"
          name="targetLevel"
          defaultValue={settings.targetLevel}
          options={options(targetLevelLabels)}
          description="Private performance target. This never becomes a public ranking."
        />
        <NativeSelectField
          label="Weakness tolerance"
          name="weaknessTolerance"
          defaultValue={settings.weaknessTolerance}
          options={options(weaknessToleranceLabels)}
          description="How aggressively unresolved weak points should dominate the command."
        />
        <NativeSelectField
          label="Exam strategy"
          name="examStrategy"
          defaultValue={settings.examStrategy}
          options={options(examStrategyLabels)}
          description="How the command engine should choose between conserving, pushing, simulation, and error destruction."
        />
      </FieldGrid>
      <SubmitBar label="Save target mode" pendingLabel="Saving target mode..." />
    </form>
  );
}
