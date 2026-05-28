export function SignalMeter({ strength }: { strength: number }) {
  return (
    <>
      <div className="mt-2 h-2 bg-secondary">
        <div className="h-2 bg-accent" style={{ width: `${strength * 100}%` }} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Signal {(strength * 100).toFixed(0)}%</p>
    </>
  );
}
