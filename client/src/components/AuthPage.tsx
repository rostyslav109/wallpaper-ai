import { useState, type SyntheticEvent } from "react";
import { api, ApiError } from "../api";
import type { User } from "../types";
import { GoogleButton } from "./GoogleButton";

type Props = {
  onAuth: (user: User, isNewUser: boolean) => void;
};

export function AuthPage({ onAuth }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        await api.register(email, password);
      }
      const user = await api.login(email, password);
      onAuth(user, isRegister);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle(credential: string) {
    setLoading(true);
    setError(null);

    try {
      const { isNew, ...user } = await api.google(credential);
      onAuth(user, isNew);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode(isRegister ? "login" : "register");
    setError(null);
  }

  return (
    <div className="auth-page">
      {/* Фон: фото, розділене скошеною лінією (оригінал / стиль) */}
      <div className="hero" aria-hidden="true">
        <div className="hero-image hero-original" />
        <div className="hero-image hero-styled" />
        <div className="hero-divider" />
        <div className="hero-shade" />
        <span className="hero-label hero-label-left">Original</span>
        <span className="hero-label hero-label-right">Oil Painting</span>
      </div>

      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="brand">
          <span className="brand-mark" />
          Wallpaper AI
        </div>

        <div className="auth-heading">
          <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
          <p className="muted">
            {isRegister
              ? "Get 2 free generations to try it out."
              : "Turn any photo into a work of art."}
          </p>
        </div>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isRegister ? "At least 8 characters" : "Your password"}
            autoComplete={isRegister ? "new-password" : "current-password"}
            minLength={isRegister ? 8 : undefined}
            required
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Please wait…" : isRegister ? "Create account" : "Log in"}
        </button>

        <div className="divider">or</div>
        <GoogleButton onCredential={handleGoogle} />

        <p className="auth-switch">
          {isRegister ? "Already have an account?" : "New here?"}{" "}
          <button type="button" className="link" onClick={toggleMode}>
            {isRegister ? "Log in" : "Create an account"}
          </button>
        </p>
      </form>
    </div>
  );
}
