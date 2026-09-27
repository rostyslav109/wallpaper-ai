import type { Tier } from "../types";

type Props = {
  tier: Tier;
  step: string | null;
  scores: number[];
};

type StepInfo = { key: string; label: string };

const PREMIUM_STEPS: StepInfo[] = [
  { key: "analyzing", label: "Analyzing your photo" },
  { key: "painting", label: "Painting" },
  { key: "reviewing", label: "Quality check" },
  { key: "saving", label: "Finishing" },
];

const FREE_STEPS: StepInfo[] = [
  { key: "painting", label: "Painting a free preview" },
  { key: "saving", label: "Finishing" },
];

// Таймлайн кроків генерації: що вже зроблено, що відбувається зараз, що попереду
export function ProgressSteps({ tier, step, scores }: Props) {
  const steps = tier === "PREMIUM" ? PREMIUM_STEPS : FREE_STEPS;

  // Друга спроба («improving») показується на місці кроку «Painting»
  const currentKey = step === "improving" ? "painting" : step;
  const currentIndex = steps.findIndex((s) => s.key === currentKey);

  return (
    <ol className="steps">
      {steps.map((s, index) => {
        const state = index < currentIndex ? "done" : index === currentIndex ? "active" : "pending";

        let label = s.label;
        if (s.key === "painting" && step === "improving") label = "Improving the result (2nd attempt)";
        if (s.key === "reviewing" && scores.length > 0) label += ` · score ${scores.join(" → ")}/10`;

        return (
          <li key={s.key} className={`step is-${state}`}>
            <span className="step-dot">{state === "done" ? "✓" : ""}</span>
            <span className="step-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
