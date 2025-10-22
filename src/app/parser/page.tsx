"use client";
import React, { useState, useRef } from 'react';

export default function ParserPage() {
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setResult(null);
    setLoading(true);
    setFileName((file && (file as File).name) || '');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/parse', { method: 'POST', body: form });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
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

  return (
    <div style={{ minHeight: '100vh', background: '#0b0b0b', color: '#fff', padding: 24, fontFamily: 'Inter, system-ui, Arial' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', background: '#08040b', borderRadius: 12, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }}>
        <h1 style={{ color: '#e9d5ff', margin: 0 }}>Credit Card Statement PDF Parser</h1>
        <p style={{ color: '#c7b3e6' }}>Upload a PDF statement and the parser will extract issuer, last 4 digits, billing cycle, due date and total balance.</p>

        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          style={{
            border: '2px dashed #6b21a8',
            borderRadius: 8,
            padding: 24,
            marginTop: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(107,33,168,0.06), transparent)'
          }}
        >
          <div>
            <strong style={{ color: '#fff' }}>Drag & drop a PDF</strong>
            <div style={{ color: '#b9a0d9', marginTop: 8 }}>or click to select a file</div>
          </div>
          <div>
            <input ref={inputRef} type="file" accept="application/pdf" onChange={onChange} style={{ display: 'none' }} />
            <button
              onClick={() => inputRef.current && inputRef.current.click()}
              style={{ background: '#6b21a8', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 8, cursor: 'pointer' }}
            >
              Choose file
            </button>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          {loading && <div style={{ color: '#d6b3ff' }}>Parsing {fileName || '...'} — please wait...</div>}
          {error && <div style={{ color: '#ffb3b3' }}>Error: {error}</div>}
          {result && (
            <div style={{ marginTop: 12, background: '#0f0b12', padding: 12, borderRadius: 8 }}>
              <h3 style={{ color: '#e9d5ff', marginTop: 0 }}>Extracted data</h3>
              <pre style={{ color: '#cfc0ea', whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
