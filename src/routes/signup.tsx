import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [org, setOrg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName, org },
      },
    });
    setLoading(false);
    if (error) setError(error.message);
    else navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-primary text-primary-foreground p-12">
        <p className="label-micro text-primary-foreground/60">SCHOTT AG</p>
        <div>
          <h1 className="text-5xl font-bold leading-tight">Three to five years<br />ahead of the market.</h1>
          <p className="mt-6 text-base text-primary-foreground/70 max-w-md leading-relaxed">
            Public-signal scouting tuned for the pharmaceutical glass business unit — vials, ampoules,
            cartridges, syringes.
          </p>
        </div>
        <p className="label-micro text-primary-foreground/50">Request access</p>
      </div>
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <p className="label-micro">Onboarding</p>
          <h2 className="mt-2 text-3xl font-bold">Create Account</h2>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="label-micro block mb-2">Full Name</label>
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="label-micro block mb-2">Organization</label>
              <input value={org} onChange={(e) => setOrg(e.target.value)}
                className="w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="label-micro block mb-2">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="label-micro block mb-2">Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-accent" />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 text-xs uppercase tracking-wider font-semibold hover:opacity-90 disabled:opacity-50">
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>
          <p className="mt-6 text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/login" className="text-accent hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
