import { useEffect, useState } from "react";
import { api, ApiError } from "../api";
import type { Generation, Style, Tier, User } from "../types";
import { Header } from "./Header";
import { UploadZone } from "./UploadZone";
import { StylePicker } from "./StylePicker";
import { BeforeAfter } from "./BeforeAfter";
import { Gallery } from "./Gallery";
import { Notice, type NoticeVariant } from "./Notice";
import { PricingModal } from "./PricingModal";
import { ProgressSteps } from "./ProgressSteps";

type Props = {
  user: User;
  onUserChange: (user: User | null) => void;
  onLogout: () => void;
  showWelcome: boolean;
};

// Опитує статус генерації, поки вона не завершиться (максимум ~3 хвилини)
async function waitForGeneration(id: string, onUpdate: (generation: Generation) => void) {
  for (let i = 0; i < 120; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const generation = await api.generation(id);
    onUpdate(generation);
    if (generation.status !== "PENDING") return generation;
  }
  throw new ApiError(504, "Still working — the result will appear in your gallery soon.");
}

type Progress = {
  tier: Tier;
  step: string | null;
  scores: number[];
};

type Result = {
  url: string;
  tier: Tier;
  styleName: string;
};

export function Studio({ user, onUserChange, onLogout, showWelcome }: Props) {
  const [styles, setStyles] = useState<Style[]>([]);
  const [styleId, setStyleId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [notice, setNotice] = useState<NoticeVariant | null>(showWelcome ? "welcome" : null);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    api.styles().then((list) => {
      setStyles(list);
      setStyleId(list[0]?.id ?? "");
    });
    loadGenerations();
  }, []);

  // Повернулися зі сторінки оплати (?checkout=success).
  // Кредити додає вебхук, який може прийти на кілька секунд пізніше, тому кілька разів перепитуємо сервер.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") !== "success") return;

    window.history.replaceState(null, "", window.location.pathname);
    setNotice("paid");

    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      api.me().then(onUserChange).catch(() => {});
      if (attempts >= 5) clearInterval(timer);
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  function loadGenerations() {
    api.generations().then(setGenerations).catch(() => {});
  }

  function handleFile(newFile: File) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(newFile);
    setPreviewUrl(URL.createObjectURL(newFile));
    setResult(null);
    setError(null);
  }

  async function handleGenerate() {
    if (!file || !styleId) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { id, tier } = await api.generate(file, styleId);
      setProgress({ tier, step: "queued", scores: [] });
      api.me().then(onUserChange).catch(() => {}); // кредит уже зарезервовано — оновлюємо лічильник

      const finished = await waitForGeneration(id, (g) =>
        setProgress({ tier, step: g.step, scores: g.scores })
      );

      if (finished.status === "DONE" && finished.resultUrl) {
        const styleName = styles.find((s) => s.id === styleId)?.name ?? "";
        setResult({ url: finished.resultUrl, tier, styleName });
        if (tier === "FREE") setNotice("upsell");
      } else {
        setError("Generation failed — your credit has been returned.");
      }

      loadGenerations();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onUserChange(null); // сесія закінчилась — повертаємось на логін
        return;
      }
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setProgress(null);
      // Оновлюємо лічильники кредитів з сервера
      api.me().then(onUserChange).catch(() => {});
    }
  }

  const hasGenerations = user.credits > 0 || user.freeGenerations > 0;
  const canGenerate = Boolean(file && styleId) && !loading && hasGenerations;

  // Підказка, яка модель спрацює при натисканні
  const tierHint =
    user.credits > 0
      ? "Premium quality · uses 1 credit"
      : user.freeGenerations > 0
        ? `Free preview · ${user.freeGenerations} left`
        : "You're out of generations";

  return (
    <div className="studio">
      <Header user={user} onLogout={onLogout} onGetCredits={() => setPricingOpen(true)} />

      <main className="studio-main">
        <aside className="panel">
          <section className="panel-section">
            <h2 className="panel-title">1. Upload a photo</h2>
            <UploadZone previewUrl={previewUrl} onFile={handleFile} />
          </section>

          <section className="panel-section">
            <h2 className="panel-title">2. Choose a style</h2>
            <StylePicker styles={styles} selectedId={styleId} onSelect={setStyleId} />
          </section>

          <div className="panel-footer">
            <p className={`tier-hint ${user.credits > 0 ? "is-premium" : ""}`}>{tierHint}</p>
            <button className="btn btn-primary btn-block" disabled={!canGenerate} onClick={handleGenerate}>
              {loading ? "Painting…" : "Generate"}
            </button>
            {error && <p className="form-error">{error}</p>}
          </div>
        </aside>

        <section className="canvas">
          {loading ? (
            <div className="canvas-message">
              {progress ? (
                <ProgressSteps tier={progress.tier} step={progress.step} scores={progress.scores} />
              ) : (
                <span className="spinner" />
              )}
              <span>
                {progress?.tier === "PREMIUM"
                  ? "Premium generations take up to a minute. You can leave — the result will wait in your gallery."
                  : "This usually takes 10–20 seconds."}
              </span>
            </div>
          ) : result && previewUrl ? (
            <div className="result">
              <BeforeAfter before={previewUrl} after={result.url} />
              <div className="result-bar">
                <div className="result-info">
                  <span className={`badge ${result.tier === "PREMIUM" ? "badge-premium" : "badge-free"}`}>
                    {result.tier === "PREMIUM" ? "Premium" : "Free preview"}
                  </span>
                  <span>{result.styleName}</span>
                </div>
                <a className="btn btn-secondary" href={result.url} download="wallpaper-ai.jpg">
                  Download
                </a>
              </div>
            </div>
          ) : previewUrl ? (
            <img src={previewUrl} alt="Selected photo" className="canvas-image" />
          ) : (
            <div className="canvas-message">
              <strong>Your artwork will appear here</strong>
              <span>Upload a photo and pick a style to get started.</span>
            </div>
          )}
        </section>
      </main>

      <Gallery generations={generations} />

      {notice && (
        <Notice
          variant={notice}
          onClose={() => setNotice(null)}
          onGetCredits={() => {
            setNotice(null);
            setPricingOpen(true);
          }}
        />
      )}

      {pricingOpen && <PricingModal onClose={() => setPricingOpen(false)} />}
    </div>
  );
}
