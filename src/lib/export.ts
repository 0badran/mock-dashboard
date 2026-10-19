import React, { useRef } from "react";
import { toast } from "sonner";

export interface ExportToCsvOptions {
  filename?: string;
  headers: string[];
  rows: (string | number | boolean | null | undefined)[][];
  successMessage?: string;
}

/**
 * Reusable utility to export tabular data to a CSV/Excel file with full UTF-8 BOM support for Arabic characters.
 */
export function exportToCsv({
  filename = "export",
  headers,
  rows,
  successMessage,
}: ExportToCsvOptions): void {
  const formattedHeaders = headers
    .map((h) => `"${String(h).replace(/"/g, '""')}"`)
    .join(",");

  const formattedRows = rows.map((row) =>
    row
      .map((val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(",")
  );

  const csvContent = "\uFEFF" + [formattedHeaders, ...formattedRows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);

  const dateStr = new Date().toISOString().split("T")[0];
  link.setAttribute("download", `${filename}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  if (successMessage) {
    toast.success(successMessage);
  }
}

export interface UseFileImportOptions {
  onFileSelected?: (file: File) => void;
  successMessage?: string;
}

/**
 * Reusable hook to handle file import (Excel / CSV) with hidden file input ref, trigger, and automatic cleanup.
 */
export function useFileImport(options?: UseFileImportOptions) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (options?.onFileSelected) {
      options.onFileSelected(file);
    }

    if (options?.successMessage) {
      toast.success(`${options.successMessage}: ${file.name}`);
    } else {
      toast.success(file.name);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return {
    fileInputRef,
    triggerImport,
    handleFileChange,
  };
}

/**
 * Standalone helper to handle onChange on any file input directly without the hook.
 */
export function handleFileInputChange(
  e: React.ChangeEvent<HTMLInputElement>,
  options?: UseFileImportOptions
): void {
  const file = e.target.files?.[0];
  if (!file) return;

  if (options?.onFileSelected) {
    options.onFileSelected(file);
  }

  if (options?.successMessage) {
    toast.success(`${options.successMessage}: ${file.name}`);
  } else {
    toast.success(file.name);
  }

  e.target.value = "";
}
