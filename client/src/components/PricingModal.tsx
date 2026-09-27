import { useEffect, useState } from "react";
import { api, ApiError } from "../api";
import type { Pack } from "../types";

type Props = {
  onClose: () => void;
};

// Вікно з пакетами кредитів. Кнопка «Buy» веде на сторінку оплати Creem.
export function PricingModal({ onClose }: Props) {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.packs().then(setPacks).catch(() => setError("Couldn't load prices"));
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleBuy(packId: string) {
    setBuyingId(packId);
    setError(null);
    try {
      const { url } = await api.checkout(packId);
      window.location.href = url; // переходимо на сторінку оплати
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setBuyingId(null);
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="pricing" onClick={(e) => e.stopPropagation()}>
        <div className="pricing-head">
          <h2>Get premium credits</h2>
          <p className="muted">1 credit = 1 premium generation: full resolution, no watermark, our best model.</p>
        </div>

        <div className="pricing-grid">
          {packs.map((pack) => (
            <div key={pack.id} className={`pack ${pack.highlight ? "is-highlight" : ""}`}>
              {pack.highlight && <span className="pack-badge">Most popular</span>}
              <h3>{pack.name}</h3>
              <p className="pack-credits">{pack.credits} credits</p>
              <p className="pack-price">{pack.price}</p>
              <button
                className={`btn btn-block ${pack.highlight ? "btn-primary" : "btn-secondary"}`}
                disabled={!pack.available || buyingId !== null}
                onClick={() => handleBuy(pack.id)}
              >
                {!pack.available ? "Coming soon" : buyingId === pack.id ? "Redirecting…" : "Buy"}
              </button>
            </div>
          ))}
        </div>

        {error && <p className="form-error">{error}</p>}

        <p className="pricing-foot muted">
          Secure checkout by Creem · One-time payment, no subscription ·{" "}
          <a href="/refund.html" target="_blank" rel="noreferrer">Refund policy</a>
        </p>

        <button className="btn btn-ghost pricing-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
    </div>
  );
}
