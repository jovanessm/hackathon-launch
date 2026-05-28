export interface DocumentRecord {
  id: string;
  filename: string;
  storage_path: string;
  uploaded_at: string;
}

interface Props {
  documents: DocumentRecord[];
  onRemove: (v: { id: string; storage_path: string }) => void;
}

export function DocumentList({ documents, onRemove }: Props) {
  return (
    <div>
      <p className="label-micro mb-3">Documents</p>
      <ul className="border border-border bg-card divide-y divide-border">
        {documents.map((d) => (
          <li key={d.id} className="p-4 flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold">{d.filename}</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(d.uploaded_at).toLocaleString()}</p>
            </div>
            <button onClick={() => onRemove({ id: d.id, storage_path: d.storage_path })}
              className="text-xs text-destructive hover:underline">Remove</button>
          </li>
        ))}
        {documents.length === 0 && <li className="p-8 text-center text-sm text-muted-foreground">No documents uploaded yet.</li>}
      </ul>
    </div>
  );
}
