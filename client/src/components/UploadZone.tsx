import { useState } from "react";
import { shrinkImage } from "../lib/shrinkImage";

type Props = {
  previewUrl: string | null;
  onFile: (file: File) => void;
};

// Поле для завантаження фото: клік або перетягування файлу
export function UploadZone({ previewUrl, onFile }: Props) {
  const [dragging, setDragging] = useState(false);

  // Великі фото стискаємо в браузері; якщо щось пішло не так — віддаємо оригінал
  const handleFile = async (file: File) => {
    try {
      onFile(await shrinkImage(file));
    } catch {
      onFile(file);
    }
  };

  return (
    <label
      className={`upload ${dragging ? "is-dragging" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) void handleFile(file);
      }}
    >
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = ""; // щоб можна було обрати той самий файл ще раз
        }}
      />

      {previewUrl ? (
        <img src={previewUrl} alt="Selected photo" className="upload-preview" />
      ) : (
        <div className="upload-empty">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V4" />
            <path d="m6 10 6-6 6 6" />
            <path d="M4 20h16" />
          </svg>
          <strong>Drop a photo here</strong>
          <span className="muted">or click to browse · JPG, PNG or WebP · large photos are resized automatically</span>
        </div>
      )}
    </label>
  );
}
