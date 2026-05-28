import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-primary text-primary-foreground p-12">
        <div>
          <p className="label-micro text-primary-foreground/60">SCHOTT AG</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">Smart Opportunity Finder</p>
        </div>
        <div>
          <h1 className="text-5xl font-bold leading-tight">
            Pioneer the<br />impossible.
          </h1>
          <p className="mt-6 text-base text-primary-foreground/70 max-w-md leading-relaxed">
            Identify high-stakes MedTech and pharmaceutical glass opportunities 3 to 5 years before they
            become obvious to the broader market.
          </p>
        </div>
        <p className="label-micro text-primary-foreground/50">Pharmaceutical glass intelligence platform</p>
      </div>
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <p className="label-micro">Authentication</p>
          <h2 className="mt-2 text-3xl font-bold">Sign In</h2>
          <p className="mt-2 text-sm text-muted-foreground">Access the intelligence dashboard.</p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="label-micro block mb-2">Email</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="label-micro block mb-2">Password</label>
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-accent"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 text-xs uppercase tracking-wider font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
          <p className="mt-6 text-sm text-muted-foreground">
            No account?{" "}
            <Link to="/signup" className="text-accent hover:underline">Request access</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
