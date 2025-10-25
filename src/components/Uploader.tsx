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
      try { document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }); } catch (e) {}
      onProgress && onProgress({ status: 'processing', percent: 0 });
      const data = await uploadWithProgress(file, (p) => {
        setProgress(p);
        onProgress && onProgress({ status: 'processing', percent: p });
      });
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

  return (
    <div className="w-full">
      {loading && (
        <div className="h-2 bg-slate-100 rounded mb-2 overflow-hidden">
          <div style={{ width: progress != null ? `${progress}%` : '40%' }} className="h-full bg-violet-500 transition-all duration-200" />
        </div>
      )}
      <div 
        onDrop={onDrop} 
        onDragOver={(e) => e.preventDefault()} 
        className={`border-2 border-dashed rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 ${
          light 
            ? 'border-indigo-100 bg-white' 
            : 'border-purple-600 bg-gradient-to-b from-purple-600/5 to-transparent'
        }`}
      >
        <div className="text-center sm:text-left">
          <strong className={`text-sm sm:text-base ${light ? 'text-gray-900' : 'text-white'}`}>Drop a PDF here</strong>
          <div className={`text-xs sm:text-sm ${light ? 'text-gray-500' : 'text-purple-300'}`}>or click to choose a file</div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full sm:w-auto">
          <input 
            ref={inputRef} 
            type="file" 
            accept="application/pdf" 
            onChange={onChange} 
            className="hidden" 
          />
          <button 
            onClick={() => inputRef.current?.click()} 
            className={`px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg text-white text-sm sm:text-base border-none cursor-pointer ${
              light ? 'bg-gray-900 hover:bg-gray-800' : 'bg-purple-600 hover:bg-purple-700'
            } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            disabled={loading}
          >
            {loading ? 'Parsing...' : 'Choose file'}
          </button>
          <button 
            onClick={useSample} 
            disabled={loading}
            className="px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-gray-900 text-sm sm:text-base border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Use sample
          </button>
        </div>
      </div>
      {error && <div className="text-red-500 mt-2 text-sm sm:text-base break-words">{error}</div>}
    </div>
  );
}
