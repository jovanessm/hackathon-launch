interface Props {
  file: File | null;
  onFileChange: (f: File | null) => void;
  onUpload: () => void;
  isUploading: boolean;
  error: string;
}

export function UploadPanel({ file, onFileChange, onUpload, isUploading, error }: Props) {
  return (
    <div className="border border-border bg-card p-6 mb-8">
      <p className="label-micro mb-3">Upload (CSV, TXT, or plain text PDF)</p>
      <div className="flex items-center gap-4">
        <input type="file" accept=".csv,.txt,.md,text/*"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          className="text-sm" />
        <button disabled={!file || isUploading} onClick={onUpload}
          className="bg-primary text-primary-foreground px-6 py-2 text-xs uppercase tracking-wider font-semibold hover:opacity-90 disabled:opacity-40">
          {isUploading ? "Evaluating…" : "Upload & Evaluate"}
        </button>
      </div>
      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
    </div>
  );
}
