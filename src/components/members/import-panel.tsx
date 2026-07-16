"use client";

import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

interface Preview {
  previewId: string;
  rows: number;
  errors: { line: number; message: string }[];
}

const SAMPLE = `fullName,phone,gender,birthday,group
Akosua Boateng,0244000001,F,1995-07-16,Choir
Kwame Mensah,0244000002,M,1988-05-01,Ushers`;

export function ImportPanel({
  churchId,
  onDone,
  onCancel,
}: {
  churchId: string;
  onDone: (imported: number, skipped: number) => void;
  onCancel: () => void;
}) {
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function doPreview() {
    setError(null);
    setPending(true);
    try {
      const p = await apiFetch<Preview>(`churches/${churchId}/members/import`, { method: "POST", body: { csv } });
      setPreview(p);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not read the CSV");
    } finally {
      setPending(false);
    }
  }

  async function confirm() {
    if (!preview) return;
    setPending(true);
    try {
      const res = await apiFetch<{ imported: number; skipped: number }>(
        `churches/${churchId}/members/import/${preview.previewId}/confirm`,
        { method: "POST" },
      );
      onDone(res.imported, res.skipped);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Import failed");
      setPending(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)]">
      <h3 className="font-display text-lg font-semibold">Import members from CSV</h3>
      <p className="mt-1 text-sm text-ink-soft">
        Header row: <code className="font-data text-xs">fullName,phone,gender,birthday,group</code>. Phones are
        normalised; duplicates are skipped.
      </p>

      {!preview ? (
        <>
          <Textarea
            rows={8}
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            placeholder={SAMPLE}
            className="mt-4 font-data text-sm"
          />
          {error && <p className="mt-2 text-sm font-semibold text-emergency">{error}</p>}
          <div className="mt-4 flex gap-2">
            <Button onClick={doPreview} disabled={pending || !csv.trim()}>
              {pending ? "Reading…" : "Preview"}
            </Button>
            <Button variant="ghost" onClick={() => setCsv(SAMPLE)}>
              Use sample
            </Button>
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <div className="mt-4">
          <p className="font-semibold">
            {preview.rows} row{preview.rows === 1 ? "" : "s"} ready to import
          </p>
          {preview.errors.length > 0 && (
            <div className="mt-3 rounded-[var(--radius)] border border-gold/40 bg-gold-tint p-3">
              <p className="text-sm font-semibold text-gold">{preview.errors.length} warning(s):</p>
              <ul className="mt-1 max-h-40 space-y-0.5 overflow-y-auto text-sm text-ink-soft">
                {preview.errors.map((er, i) => (
                  <li key={i}>
                    Line {er.line}: {er.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {error && <p className="mt-2 text-sm font-semibold text-emergency">{error}</p>}
          <div className="mt-4 flex gap-2">
            <Button onClick={confirm} disabled={pending}>
              {pending ? "Importing…" : `Import ${preview.rows}`}
            </Button>
            <Button variant="ghost" onClick={() => setPreview(null)}>
              Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
