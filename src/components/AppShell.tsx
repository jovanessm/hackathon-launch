import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/watchlist", label: "Watchlist" },
  { to: "/alerts", label: "Viral Alerts" },
  { to: "/documents", label: "Documents" },
  { to: "/stat", label: "Stats" },
  { to: "/filters", label: "Saved Filters" },
  { to: "/potential-customers", label: "Potential Customers" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="max-w-[1400px] mx-auto px-8 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-baseline gap-3">
            <span className="text-xl font-bold tracking-tight">SCHOTT</span>
            <span className="label-micro text-primary-foreground/70">Smart Opportunity Finder</span>
          </Link>
          <nav className="flex items-center gap-8">
            {NAV.map((n) => {
              const active = pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`text-xs uppercase tracking-wider font-medium transition-opacity ${
                    active ? "opacity-100 border-b-2 border-[color:var(--color-accent)] pb-1" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-xs opacity-70 hidden md:inline">{user?.email}</span>
            <button
              onClick={signOut}
              className="text-xs uppercase tracking-wider border border-primary-foreground/30 px-3 py-1.5 hover:bg-primary-foreground hover:text-primary transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-8 py-10">{children}</main>
      <footer className="border-t border-border py-6 mt-12">
        <div className="max-w-[1400px] mx-auto px-8 flex justify-between text-xs text-muted-foreground">
          <span>SCHOTT AG — Pharmaceutical Glass Intelligence</span>
          <span className="label-micro">Pioneer the impossible</span>
        </div>
      </footer>
    </div>
  );
}
