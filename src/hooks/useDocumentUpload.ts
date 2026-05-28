import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { uploadAndEvaluate } from "@/lib/documents.functions";
import { useAuth } from "@/lib/auth-context";

const MAX_TEXT_LENGTH = 200000;

export function useDocumentUpload() {
  const fUp = useServerFn(uploadAndEvaluate);
  const qc = useQueryClient();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState("");

  const upload = useMutation({
    mutationFn: async () => {
      if (!file || !user) throw new Error("No file");
      const text = await file.text();
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("user-documents").upload(path, file, { upsert: false });
      if (error) throw new Error(error.message);
      return fUp({ data: { filename: file.name, mime: file.type, storage_path: path, text_content: text.slice(0, MAX_TEXT_LENGTH) } });
    },
    onSuccess: () => {
      setFile(null);
      setErr("");
      qc.invalidateQueries({ queryKey: ["documents"] });
      qc.invalidateQueries({ queryKey: ["opps"] });
    },
    onError: (e: Error) => setErr(e.message),
  });

  return { file, setFile, err, upload };
}
