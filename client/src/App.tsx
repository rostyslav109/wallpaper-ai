import {useEffect, useState} from "react";

type Style = {id: string; name: string};

function App() {
  const [styles, setStyles] = useState<Style[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() =>{
    fetch("/api/styles")
    .then((res) => res.json())
    .then((data) => {
      setStyles(data);
      setSelectedStyle(data[0]?.id ?? "");
    });
  }, []);

  async function handleGenerate() {
    if (!file || !selectedStyle) return;

    setLoading(true);
    setError(null);
    setResultUrl(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("style", selectedStyle);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Wallpaper AI</h1>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <select
        value={selectedStyle}
        onChange={(e) => setSelectedStyle(e.target.value)}
      >
        {styles.map((style) => (
          <option key={style.id} value={style.id}>
            {style.name}
          </option>
        ))}
      </select>
      <button onClick={handleGenerate} disabled={!file || loading}>
        {loading ? "Generating..." : "Generate"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {resultUrl && (
        <img src={resultUrl} alt="Result" style={{ maxWidth: "100%" }} />
      )}
    </div>
  )
}

export default App;