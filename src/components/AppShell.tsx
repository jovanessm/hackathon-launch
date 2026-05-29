import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/watchlist", label: "Watchlist" },
  { to: "/alerts", label: "Signals" },
  { to: "/documents", label: "Documents" },
  { to: "/stat", label: "Stats" },
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
      <header className="border-b border-border bg-primary text-primary-foreground print:hidden">
        <div className="max-w-[1400px] mx-auto px-8 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex flex-col whitespace-nowrap justify-center">
            <div className="flex items-baseline">
              <span className="text-sm font-semibold tracking-wide text-primary-foreground/80">LONG</span>
              <span className="text-2xl font-black tracking-tight">SCHOTT</span>
            </div>
            <span className="text-[9px] uppercase tracking-[0.15em] text-primary-foreground/60 -mt-0.5 font-medium">Smart Opportunity Finder</span>
          </Link>
          <nav className="flex items-center gap-4 lg:gap-6 flex-wrap justify-end">
            {NAV.map((n) => {
              const active = pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`text-xs uppercase tracking-wider font-medium transition-all border-b-2 py-1 ${
                    active ? "opacity-100 border-[color:var(--color-accent)]" : "opacity-70 border-transparent hover:opacity-100"
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
      <footer className="border-t border-border py-6 mt-12 print:hidden">
        <div className="max-w-[1400px] mx-auto px-8 flex justify-between text-xs text-muted-foreground">
          <span>SCHOTT AG — Pharmaceutical Glass Intelligence</span>
          <span className="label-micro">Pioneer the impossible</span>
        </div>
      </footer>
    </div>
  );
}
