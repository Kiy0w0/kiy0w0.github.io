import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate("/blog", { replace: true });
  }

  return (
    <main className="page blog">
      <div className="blog-wrap blog-narrow">
        <h1 className="blog-title">owner login</h1>
        <form className="blog-form" onSubmit={onSubmit}>
          <label className="field">
            <span className="field__label mono">email</span>
            <input
              className="field__input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span className="field__label mono">password</span>
            <input
              className="field__input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="field-error mono">{error}</p>}
          <button type="submit" disabled={busy}>{busy ? "…" : "sign in"}</button>
        </form>
      </div>
    </main>
  );
}
