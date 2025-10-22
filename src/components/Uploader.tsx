"use client";
import React, { useRef, useState } from 'react';

type UploaderProps = {
  onResult?: (r: any) => void;
  onProgress?: (p: { status: 'processing' | 'done' | 'error', percent: number }) => void;
  light?: boolean;
};

export default function Uploader({ onResult, onProgress, light = false }: UploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setLoading(true);
    setProgress(0);
    try {
      // scroll to results area so user sees progress
      try { document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }); } catch (e) {}
      onProgress && onProgress({ status: 'processing', percent: 0 });
      const data = await uploadWithProgress(file, (p) => {
        setProgress(p);
        onProgress && onProgress({ status: 'processing', percent: p });
      });
      // report completion
      onResult && onResult(data);
      onProgress && onProgress({ status: 'done', percent: 100 });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      onResult && onResult({ error: message });
      onProgress && onProgress({ status: 'error', percent: 0 });
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }

  function uploadWithProgress(file: File, onProgress: (p: number) => void) {
    return new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/parse');
      xhr.responseType = 'json';
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          reject(new Error(xhr.response?.error || `Upload failed: ${xhr.status}`));
        }
      };
      xhr.onerror = function () {
        reject(new Error('Network error'));
      };
      const form = new FormData();
      form.append('file', file);
      xhr.send(form);
    });
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (f) handleFile(f);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function useSample() {
    // simple sample text for demo; create a PDF in-browser using pdf-lib
    const sampleText = `DocuScan Sample Statement\n\nAccount: Sample Card Ending in 1234\nStatement Period: Sep 01, 2025 - Sep 30, 2025\nPayment Due Date: Oct 22, 2025\nNew Balance: $123.45\n`;
    try {
      const pdfLib = await import('pdf-lib');
      const { PDFDocument, StandardFonts } = pdfLib;
      const doc = await PDFDocument.create();
      const page = doc.addPage([600, 800]);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const fontSize = 12;
      page.drawText(sampleText, { x: 24, y: 760, size: fontSize, font });
  const uint8 = await doc.save();
  const u8 = Uint8Array.from(uint8);
  const blob = new Blob([u8.buffer], { type: 'application/pdf' });
      const file = new File([blob], 'docuscan-sample.pdf', { type: 'application/pdf' });
      await handleFile(file);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError('Sample generation failed: ' + message);
    }
  }

  const dashed = light ? '2px dashed #e6e7f8' : '2px dashed #6b21a8';
  const bg = light ? '#ffffff' : 'linear-gradient(180deg, rgba(107,33,168,0.06), transparent)';
  const textColor = light ? '#111827' : '#fff';
  const hintColor = light ? '#6b7280' : '#b9a0d9';
  const btnBg = light ? '#111827' : '#6b21a8';

  return (
    <div>
      {loading && (
        <div style={{ height: 8, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ width: progress != null ? `${progress}%` : '40%', height: '100%', background: '#7c3aed', transition: 'width 200ms linear' }} />
        </div>
      )}
      <div onDrop={onDrop} onDragOver={(e) => e.preventDefault()} style={{ border: dashed, borderRadius: 10, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: bg }}>
        <div>
          <strong style={{ color: textColor }}>Drop a PDF here</strong>
          <div style={{ color: hintColor }}>or click to choose a file</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input ref={inputRef} type="file" accept="application/pdf" onChange={onChange} style={{ display: 'none' }} />
          <button onClick={() => inputRef.current && inputRef.current.click()} style={{ background: btnBg, color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 8, cursor: 'pointer' }}>{loading ? 'Parsing...' : 'Choose file'}</button>
          <button onClick={useSample} style={{ background: '#eef2ff', color: '#111827', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }} disabled={loading}>Use sample</button>
        </div>
      </div>
      {error && <div style={{ color: '#ef4444', marginTop: 8 }}>{error}</div>}
    </div>
  );
}
