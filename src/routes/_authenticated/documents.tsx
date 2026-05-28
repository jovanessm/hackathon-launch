import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listDocuments, deleteDocument } from "@/lib/documents.functions";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";
import { PageHeader } from "@/components/ui/PageHeader";
import { UploadPanel } from "@/components/documents/UploadPanel";
import { DocumentList } from "@/components/documents/DocumentList";
import { EvaluationLogList } from "@/components/documents/EvaluationLogList";

export const Route = createFileRoute("/_authenticated/documents")({ component: DocumentsPage });

function DocumentsPage() {
  const fList = useServerFn(listDocuments);
  const fDel = useServerFn(deleteDocument);
  const qc = useQueryClient();

  const { data } = useQuery({ queryKey: ["documents"], queryFn: () => fList() });
  const { file, setFile, err, upload } = useDocumentUpload();

  const del = useMutation({
    mutationFn: (v: { id: string; storage_path: string }) => fDel({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      qc.invalidateQueries({ queryKey: ["opps"] });
    },
  });

  return (
    <div>
      <PageHeader
        eyebrow="Bidirectional Re-evaluation"
        title="Document Injection"
        description="Upload internal R&D notes or sales memos. The parser extracts text and applies a bounded modifier (−50% to +50%) against each baseline opportunity score. Documents cannot create opportunities from zero — they are context only."
      />
      <UploadPanel
        file={file}
        onFileChange={setFile}
        onUpload={() => upload.mutate()}
        isUploading={upload.isPending}
        error={err}
      />
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-5">
          <DocumentList documents={data?.docs ?? []} onRemove={(v) => del.mutate(v)} />
        </div>
        <div className="col-span-12 lg:col-span-7">
          <EvaluationLogList logs={data?.logs ?? []} />
        </div>
      </div>
    </div>
  );
}
