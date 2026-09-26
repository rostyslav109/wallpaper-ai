import { useState } from "react";

type Props = {
  before: string;
  after: string;
};

// Слайдер «до/після»: оригінал накладено зверху й обрізано по позиції повзунка
export function BeforeAfter({ before, after }: Props) {
  const [position, setPosition] = useState(50);

  return (
    <div className="compare">
      <img src={after} alt="Styled result" className="compare-image" />
      <img
        src={before}
        alt="Original photo"
        className="compare-image compare-before"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      />

      <div className="compare-handle" style={{ left: `${position}%` }} />
      <span className="compare-label compare-label-left">Original</span>
      <span className="compare-label compare-label-right">Styled</span>

      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="compare-range"
        aria-label="Compare original and styled image"
      />
    </div>
  );
}
