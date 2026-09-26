import {useEffect, useState} from "react";
import { AuthForm } from "./AuthForm";
import type { User } from "./types";
import { History } from "./History";

type Style = {id: string; name: string};

function App() {
  const [styles, setStyles] = useState<Style[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyVersion, setHistoryVersion] = useState(0);

  useEffect(() =>{
    fetch("/api/styles")
    .then((res) => res.json())
    .then((data) => {
      setStyles(data);
      setSelectedStyle(data[0]?.id ?? "");
    });
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .finally(() => setAuthChecked(true));
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
        if (res.status === 401) {
          setUser(null);
          return;
        }

        const data = await res.json();
        throw new Error(
          res.status === 402
            ? "You're out of credits"
            : data.error || "Something went wrong"
        );
      }

      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
      setHistoryVersion((v) => v + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      refreshUser();
    }
  }

  async function refreshUser() {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      setUser(await res.json());
    } else {
      setUser(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setFile(null);
    setResultUrl(null);
    setError(null);
  }

  if (!authChecked) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <AuthForm onAuth={setUser} />;
  }

  return (
    <div>
      <h1>Wallpaper AI</h1>
      <p>
        {user.email} · Free: {user.freeGenerations} · Credits: {user.credits}{" "}
        <button onClick={handleLogout}>Log out</button>
      </p>
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
      <button
        onClick={handleGenerate}
        disabled={!file || loading || (user.credits === 0 && user.freeGenerations === 0)}
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {user.credits === 0 && user.freeGenerations === 0 && <p>You're out of credits.</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {resultUrl && (
        <img src={resultUrl} alt="Result" style={{ maxWidth: "100%" }} />
      )}
      <History reloadKey={historyVersion} />
    </div>
  )
}

export default App;