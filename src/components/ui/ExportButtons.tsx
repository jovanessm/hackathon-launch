import { Download, FileText } from "lucide-react";
import { Button } from "./button";

export interface ColumnDef<T> {
  header: string;
  accessor: (item: T) => string | number | null | undefined;
}

interface Props<T> {
  data: T[];
  columns: ColumnDef<T>[];
  filename: string;
}

export function ExportButtons<T>({ data, columns, filename }: Props<T>) {
  const handleExportCsv = () => {
    if (data.length === 0) return;

    const headers = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(",");
    const rows = data.map((item) => {
      return columns.map((col) => {
        const value = col.accessor(item);
        const stringValue = value === null || value === undefined ? "" : String(value);
        return `"${stringValue.replace(/"/g, '""')}"`;
      }).join(",");
    });

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    // Relying on native print dialog with @media print CSS rules
    window.print();
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-2">
        <Download className="h-4 w-4" />
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportPdf} className="gap-2">
        <FileText className="h-4 w-4" />
        PDF
      </Button>
    </div>
  );
}
