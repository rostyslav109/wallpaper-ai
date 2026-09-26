import type { User } from "../types";

type Props = {
  user: User;
  onLogout: () => void;
};

export function Header({ user, onLogout }: Props) {
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
        <span className="pill pill-premium" title="Premium credits">
          Credits · {user.credits}
        </span>
        <span className="header-email">{user.email}</span>
        <button className="btn btn-ghost" onClick={onLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}
