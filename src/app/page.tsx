"use client";
import React, { useState, useRef } from 'react';
import Uploader from '../components/Uploader';

export default function Home() {
  const [result, setResult] = useState<any>(null);
  const [progressState, setProgressState] = useState<{ status: string; percent: number }>({ status: 'idle', percent: 0 });
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleResult = (r: any) => {
    setResult(r);
    setProgressState({ status: 'done', percent: 100 });
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  const handleProgress = (p: any) => {
    if (p === null) {
      setProgressState({ status: 'idle', percent: 0 });
      return;
    }
    // support both numeric progress (p = 42) and object progress (p = { status, percent })
    if (typeof p === 'object' && p !== null && 'percent' in p) {
      const percent = Number((p as any).percent) || 0;
      const status = (p as any).status || 'processing';
      setProgressState({ status, percent });
      return;
    }
    const num = Number(p);
    if (!Number.isNaN(num)) {
      setProgressState({ status: 'processing', percent: Math.max(0, Math.min(100, Math.round(num))) });
    }
  };

  const scrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-sans">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-12 py-6 border-b border-slate-800 bg-slate-950 bg-opacity-80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-linear-to-r from-cyan-400 to-purple-600 flex items-center justify-center font-bold text-lg">D</div>
          <div>
            <div className="font-bold text-lg">DocuScan</div>
            <div className="text-xs text-slate-400">AI-powered document parsing</div>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <a href="#features" className="text-slate-400 hover:text-cyan-400 transition">Features</a>
          <a href="#upload" className="bg-linear-to-r from-cyan-400 to-purple-600 px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition">Upload PDF</a>
          {result && (
            <button
              onClick={scrollToResults}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              Show results
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="py-20 px-12 flex gap-12 items-center max-w-6xl mx-auto relative z-10">
        <div className="flex-1">
          <div className="text-sm font-bold text-cyan-400 mb-3 uppercase tracking-wider">AI-Powered Extraction</div>
          <h1 className="text-5xl font-black mb-2 text-white">Extract data from</h1>
          <h1 className="text-5xl font-black bg-linear-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6">credit statements instantly</h1>
          <p className="text-slate-300 text-lg leading-relaxed mb-8">Upload PDF statements and DocuScan extracts issuer, card last 4, billing cycle, payment due date, and total balance automatically. Works with Chase, AmEx, Citi, Bank of America, and Capital One.</p>
          <div className="flex gap-4 items-center">
            <a href="#upload" className="bg-linear-to-r from-cyan-400 to-cyan-500 text-black font-bold py-3 px-7 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition transform hover:-translate-y-1">Get started</a>
            <a href="#features" className="text-slate-300 font-semibold hover:text-cyan-400 transition">See features →</a>
          </div>
        </div>
        <div className="w-96 relative">
          <div className="bg-linear-to-r from-cyan-500/10 to-purple-600/10 rounded-2xl p-0.5 shadow-2xl shadow-cyan-500/20">
            <div className="bg-linear-to-br from-slate-900/90 to-slate-950/90 rounded-2xl p-7 backdrop-blur-xl">
              <div className="text-xs font-bold text-cyan-400 mb-3 uppercase tracking-wide">Upload Statement</div>
              <div id="upload"><Uploader light={false} onResult={handleResult} onProgress={handleProgress} /></div>
              <div className="mt-4 text-xs text-slate-400">✓ Privacy-first: files processed in memory only</div>
              <div className="mt-2 text-xs text-slate-400">✓ Works with 5+ major issuers</div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <main className="max-w-6xl mx-auto px-12 py-20 relative z-10">
        <div className="text-center mb-16">
          <div className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">Why DocuScan</div>
          <h2 className="text-4xl font-black text-white mb-4">Powerful features for document extraction</h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">Built with precision and reliability in mind. Extract what matters from your financial documents effortlessly.</p>
        </div>

        <section id="features" className="grid grid-cols-3 gap-7 mb-16">
          {[
            { title: 'Lightning Fast', desc: 'Extract key fields in milliseconds. No waiting, no complicated workflows.', icon: '⚡' },
            { title: 'Multi-Issuer', desc: 'Optimized for Chase, AmEx, Citi, BoA and Capital One statements.', icon: '🏦' },
            { title: 'Privacy First', desc: 'Files processed in memory. No storage, no tracking, no analytics.', icon: '🔒' }
          ].map((feature, i) => (
            <div key={i} className="bg-linear-to-br from-slate-800/60 to-slate-900/80 border border-slate-700 hover:border-cyan-500/50 rounded-xl p-7 transition transform hover:-translate-y-2 hover:shadow-xl hover:shadow-cyan-500/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition" />
              <div className="text-4xl mb-3 relative z-10">{feature.icon}</div>
              <h4 className="text-white font-bold text-lg mb-2 relative z-10">{feature.title}</h4>
              <p className="text-slate-300 text-sm leading-relaxed relative z-10">{feature.desc}</p>
            </div>
          ))}
        </section>

        {/* Results Section */}
        <section className="mt-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white mb-2">Extraction Results</h2>
            <p className="text-slate-300">Your parsed document data appears here</p>
          </div>
          <div ref={resultsRef} id="results" className="bg-linear-to-br from-slate-800/60 to-slate-900/80 border border-cyan-500/30 rounded-xl p-8 min-h-48">
            {progressState.status === 'processing' ? (
              <div className="text-center text-slate-300">
                <div className="mb-4 text-lg">⏳ Please wait while we process your request!</div>
                <div className="text-2xl font-bold text-cyan-400">{progressState.percent}%</div>
              </div>
            ) : result ? (
              (() => {
                if (result.error) {
                  return <div className="text-red-400 text-lg font-semibold">⚠️ {String(result.error)}</div>;
                }
                const r = result;
                const get = (k: string) => (r[k] !== null && r[k] !== undefined && String(r[k]).trim() !== '' ? String(r[k]) : 'N.A.');
                return (
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { label: 'Issuer', value: get('issuer') },
                      { label: 'Card Last 4', value: get('card_last4') },
                      { label: 'Billing Cycle', value: get('billing_cycle') },
                      { label: 'Payment Due', value: get('payment_due_date') },
                      { label: 'Total Balance', value: get('total_balance') }
                    ].map((item, i) => (
                      <div key={i} className="p-4 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">{item.label}</div>
                        <div className="text-xl text-cyan-400 font-bold">{item.value}</div>
                      </div>
                    ))}
                  </div>
                );
              })()
            ) : (
              <div className="text-slate-400 text-lg text-center py-10">📄 Upload a PDF to see extraction results here</div>
            )}
          </div>
        </section>
      </main>

      <footer className="mt-20 py-12 px-12 border-t border-slate-800 text-slate-400 relative z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="font-medium">© {new Date().getFullYear()} DocuScan • Smart Document Extraction</div>
          <div className="text-sm">Privacy-first • Built with ❤️</div>
        </div>
      </footer>
    </div>
  );
}
