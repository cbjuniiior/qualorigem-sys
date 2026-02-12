import { useState, useCallback } from "react";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, WarningCircle, X } from "@phosphor-icons/react";
import { toast } from "sonner";

interface CsvImporterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (rows: Record<string, string>[]) => Promise<void>;
  requiredColumns: string[];
  optionalColumns?: string[];
  title?: string;
  description?: string;
}

interface ParsedRow {
  data: Record<string, string>;
  errors: string[];
  rowIndex: number;
}

export const CsvImporter = ({
  open,
  onOpenChange,
  onImport,
  requiredColumns,
  optionalColumns = [],
  title = "Importar CSV",
  description = "Faça upload de um arquivo CSV para importação em massa.",
}: CsvImporterProps) => {
  const [step, setStep] = useState<"upload" | "preview" | "importing">("upload");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);

  const reset = useCallback(() => {
    setStep("upload");
    setParsedRows([]);
    setHeaders([]);
    setFileName("");
    setImporting(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv") && !file.type.includes("csv")) {
      toast.error("Por favor, selecione um arquivo CSV");
      return;
    }

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          toast.error("Arquivo vazio ou sem dados válidos");
          return;
        }

        const rawHeaders = results.meta.fields || [];
        // Normalizar headers (lowercase, trim)
        const normalizedHeaders = rawHeaders.map(h => h.trim().toLowerCase());
        setHeaders(normalizedHeaders);

        // Verificar colunas obrigatórias
        const missingCols = requiredColumns.filter(
          col => !normalizedHeaders.includes(col.toLowerCase())
        );

        if (missingCols.length > 0) {
          toast.error(`Colunas obrigatórias ausentes: ${missingCols.join(", ")}`);
          return;
        }

        // Processar linhas
        const rows: ParsedRow[] = (results.data as Record<string, string>[]).map((row, idx) => {
          const normalizedRow: Record<string, string> = {};
          Object.entries(row).forEach(([key, value]) => {
            normalizedRow[key.trim().toLowerCase()] = (value || "").trim();
          });

          const errors: string[] = [];
          requiredColumns.forEach(col => {
            if (!normalizedRow[col.toLowerCase()]?.trim()) {
              errors.push(`Campo "${col}" vazio`);
            }
          });

          return { data: normalizedRow, errors, rowIndex: idx + 1 };
        });

        setParsedRows(rows);
        setStep("preview");
      },
      error: (error) => {
        toast.error(`Erro ao processar CSV: ${error.message}`);
      },
    });

    // Reset input
    e.target.value = "";
  };

  const validRows = parsedRows.filter(r => r.errors.length === 0);
  const errorRows = parsedRows.filter(r => r.errors.length > 0);

  const handleImport = async () => {
    if (validRows.length === 0) {
      toast.error("Nenhum registro válido para importar");
      return;
    }

    try {
      setImporting(true);
      setStep("importing");
      await onImport(validRows.map(r => r.data));
      reset();
      onOpenChange(false);
    } catch (error) {
      setStep("preview");
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="py-8">
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept=".csv"
                id="csv-upload"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-bold text-slate-600 mb-1">
                  Clique para selecionar um arquivo CSV
                </p>
                <p className="text-xs text-slate-400 mb-4">
                  ou arraste e solte aqui
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {requiredColumns.map(col => (
                    <Badge key={col} className="bg-red-100 text-red-700 text-xs">
                      {col} *
                    </Badge>
                  ))}
                  {optionalColumns.map(col => (
                    <Badge key={col} variant="secondary" className="text-xs">
                      {col}
                    </Badge>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider">
                  * Colunas obrigatórias
                </p>
              </label>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {/* Stats */}
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-slate-500" />
                <span className="text-sm font-bold text-slate-700">{fileName}</span>
              </div>
              <div className="flex items-center gap-3 ml-auto text-sm">
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle size={16} /> {validRows.length} válidos
                </span>
                {errorRows.length > 0 && (
                  <span className="text-red-500 font-bold flex items-center gap-1">
                    <WarningCircle size={16} /> {errorRows.length} com erros
                  </span>
                )}
              </div>
            </div>

            {/* Table Preview */}
            <div className="flex-1 overflow-auto border rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="text-left p-2 text-xs font-bold text-slate-500 w-12">#</th>
                    {headers.map(h => (
                      <th key={h} className="text-left p-2 text-xs font-bold text-slate-500">
                        {h}
                        {requiredColumns.includes(h) && <span className="text-red-500 ml-0.5">*</span>}
                      </th>
                    ))}
                    <th className="text-left p-2 text-xs font-bold text-slate-500 w-24">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.slice(0, 100).map((row, idx) => (
                    <tr
                      key={idx}
                      className={`border-t ${row.errors.length > 0 ? "bg-red-50/50" : ""}`}
                    >
                      <td className="p-2 text-xs text-slate-400">{row.rowIndex}</td>
                      {headers.map(h => (
                        <td key={h} className="p-2 text-xs truncate max-w-[150px]">
                          {row.data[h] || <span className="text-slate-300">-</span>}
                        </td>
                      ))}
                      <td className="p-2">
                        {row.errors.length > 0 ? (
                          <span className="text-xs text-red-500" title={row.errors.join("; ")}>
                            <WarningCircle size={14} className="inline mr-1" />
                            {row.errors.length} erro(s)
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-600">
                            <CheckCircle size={14} className="inline mr-1" /> OK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedRows.length > 100 && (
                <div className="p-3 text-center text-xs text-slate-400 bg-slate-50">
                  Mostrando 100 de {parsedRows.length} registros
                </div>
              )}
            </div>
          </div>
        )}

        {step === "importing" && (
          <div className="py-12 text-center">
            <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-600">Importando {validRows.length} registros...</p>
          </div>
        )}

        {step === "preview" && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { reset(); }} className="rounded-xl">
              <X size={16} className="mr-2" /> Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={validRows.length === 0 || importing}
              className="rounded-xl font-bold"
            >
              <Upload size={16} className="mr-2" />
              Importar {validRows.length} registros
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
