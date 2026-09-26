import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const CLIENT_ID: string | undefined = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Завантажуємо скрипт Google один раз, коли він уперше знадобиться
function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google script"));
    document.head.appendChild(script);
  });
}

type Props = {
  onCredential: (credential: string) => void;
};

export function GoogleButton({ onCredential }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Завжди тримаємо актуальну версію колбека, не перемальовуючи кнопку
  const onCredentialRef = useRef(onCredential);
  useEffect(() => {
    onCredentialRef.current = onCredential;
  });

  useEffect(() => {
    if (!CLIENT_ID) return;

    loadGoogleScript()
      .then(() => {
        const google = window.google;
        const container = containerRef.current;
        if (!google || !container) return;

        google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => onCredentialRef.current(response.credential),
        });

        google.accounts.id.renderButton(container, {
          theme: "filled_black",
          size: "large",
          shape: "pill",
          text: "continue_with",
          locale: "en",
          width: container.offsetWidth,
        });
      })
      .catch(console.error);
  }, []);

  if (!CLIENT_ID) return null;

  return <div ref={containerRef} className="google-button" />;
}
