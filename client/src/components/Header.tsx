import type { User } from "../types";

type Props = {
  user: User;
  onLogout: () => void;
  onGetCredits: () => void;
};

export function Header({ user, onLogout, onGetCredits }: Props) {
  return (
    <header className="header">
      <div className="brand">
        <span className="brand-mark" />
        <span className="brand-name">Wallpaper AI</span>
      </div>

      <div className="header-right">
        <span className="pill" title="Free previews left">
          Free · {user.freeGenerations}
        </span>
        <button className="pill pill-premium pill-button" title="Buy credits" onClick={onGetCredits}>
          Credits · {user.credits}
        </button>
        <button className="btn btn-secondary btn-small" onClick={onGetCredits}>
          Get credits
        </button>
        <span className="header-email">{user.email}</span>
        <button className="btn btn-ghost" onClick={onLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}
