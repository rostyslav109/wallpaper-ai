import { useEffect, useState } from "react";
import { api } from "./api";
import type { User } from "./types";
import { AuthPage } from "./components/AuthPage";
import { Studio } from "./components/Studio";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // При відкритті сторінки питаємо сервер, чи ми вже залоговані
  useEffect(() => {
    api
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
  }, []);

  function handleAuth(user: User, isNew: boolean) {
    setUser(user);
    setIsNewUser(isNew);
  }

  async function handleLogout() {
    window.google?.accounts.id.disableAutoSelect();
    await api.logout();
    setUser(null);
    setIsNewUser(false);
  }

  if (!authChecked) {
    return (
      <div className="splash">
        <span className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuth={handleAuth} />;
  }

  return (
    <Studio
      user={user}
      onUserChange={setUser}
      onLogout={handleLogout}
      showWelcome={isNewUser}
    />
  );
}
