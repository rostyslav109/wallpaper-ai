import { useEffect, useState } from "react";

type Generation = {
  id: string;
  styleName: string;
  status: "PENDING" | "DONE" | "FAILED";
  createdAt: string;
  originalUrl: string;
  resultUrl: string | null;
};

type Props = {
  reloadKey: number;
};

export function History({ reloadKey }: Props) {
  const [items, setItems] = useState<Generation[]>([]);

  useEffect(() => {
    fetch("/api/generations")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setItems(data));
  }, [reloadKey]);

  if (items.length === 0) {
    return <p>No generations yet.</p>;
  }

  return (
    <div>
      <h2>My works</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {items.map((item) => (
          <div key={item.id}>
            {item.resultUrl ? (
              <img src={item.resultUrl} alt={item.styleName} style={{ width: "100%" }} />
            ) : (
              <p>{item.status === "FAILED" ? "Failed" : "Processing..."}</p>
            )}
            <p>
              {item.styleName} · {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}