import type { Style } from "../types";

type Props = {
  styles: Style[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function StylePicker({ styles, selectedId, onSelect }: Props) {
  const selected = styles.find((style) => style.id === selectedId);

  return (
    <div className="style-picker">
      <div className="chips" role="radiogroup" aria-label="Style">
        {styles.map((style) => (
          <button
            key={style.id}
            type="button"
            role="radio"
            aria-checked={style.id === selectedId}
            className={`chip ${style.id === selectedId ? "is-active" : ""}`}
            onClick={() => onSelect(style.id)}
          >
            {style.name}
          </button>
        ))}
      </div>

      {selected && <p className="style-description">{selected.description}</p>}
    </div>
  );
}
