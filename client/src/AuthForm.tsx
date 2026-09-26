import { useState, type SyntheticEvent } from "react";
import type { User } from "./types";

type Props = {
    onAuth: (user: User) => void;
}

export function AuthForm({ onAuth }: Props) {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);


    async function postJson(url: string) {
        const res = await fetch(url, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email, password }),
        })

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || "Something went wrong");
        }
        return data;
    }

    async function handleSubmit(e: SyntheticEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === "register") {
                await postJson("/api/auth/register");
            }
            const user = await postJson("/api/auth/login");
            onAuth(user);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>{mode === "login" ? "Log in" : "Sign up"}</h2>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
            />

            <button type="submit" disabled={loading}>
                {loading ? "..." : mode === "login" ? "Log in" : "Sign up"}
            </button>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
                {mode === "login" ? "No account? Sign up" : "Have an account? Log in"}
            </button>
        </form>
    );
}

