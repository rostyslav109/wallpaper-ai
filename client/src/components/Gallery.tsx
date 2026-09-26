import { useEffect, useState } from "react";
import type { Generation } from "../types";
import { BeforeAfter } from "./BeforeAfter";

type Props = {
  generations: Generation[];
};

// Галерея «Мої роботи», поділена на платні й безкоштовні
export function Gallery({ generations }: Props) {
  const [opened, setOpened] = useState<Generation | null>(null);

  const done = generations.filter((g) => g.status === "DONE" && g.resultUrl);
  const premium = done.filter((g) => g.tier === "PREMIUM");
  const free = done.filter((g) => g.tier === "FREE");

  if (done.length === 0) return null;

  return (
    <section className="gallery">
      <GallerySection
        title="Premium"
        subtitle="Full resolution, no watermark"
        items={premium}
        onOpen={setOpened}
      />
      <GallerySection
        title="Free previews"
        subtitle="Reduced resolution with watermark"
        items={free}
        onOpen={setOpened}
      />

      {opened && <Lightbox generation={opened} onClose={() => setOpened(null)} />}
    </section>
  );
}

type SectionProps = {
  title: string;
  subtitle: string;
  items: Generation[];
  onOpen: (generation: Generation) => void;
};

function GallerySection({ title, subtitle, items, onOpen }: SectionProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <div className="section-head">
        <h2>{title}</h2>
        <span className="muted">{subtitle}</span>
      </div>

      <div className="grid">
        {items.map((item) => (
          <button key={item.id} className="tile" onClick={() => onOpen(item)}>
            <img src={item.resultUrl ?? ""} alt={item.styleName} loading="lazy" />
            <span className="tile-caption">{item.styleName}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

type LightboxProps = {
  generation: Generation;
  onClose: () => void;
};

// Повноекранний перегляд зі слайдером «до/після»
function Lightbox({ generation, onClose }: LightboxProps) {
  // Закриття клавішею Esc
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const resultUrl = generation.resultUrl ?? "";

  return (
    <div className="overlay" onClick={onClose}>
      <div className="lightbox" onClick={(e) => e.stopPropagation()}>
        <BeforeAfter before={generation.originalUrl} after={resultUrl} />

        <div className="lightbox-bar">
          <div>
            <strong>{generation.styleName}</strong>
            <span className="muted"> · {new Date(generation.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="lightbox-actions">
            <a className="btn btn-secondary" href={resultUrl} download>
              Download
            </a>
            <button className="btn btn-ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
