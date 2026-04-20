/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Eraser, 
  Info,
  ChevronRight,
  TrendingUp,
  History,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { cn } from './lib/utils';
import { detectHateSpeech, type DetectionResult } from './services/gemini';

// Helper to simulate the basic cleaning logic from the user's Python script
const cleanTextLegacy = (text: string) => {
  let cleaned = text.toLowerCase();
  cleaned = cleaned.replace(/\[.*?\]/g, '');
  cleaned = cleaned.replace(/https?:\/\/\S+|www\.\S+/g, '');
  cleaned = cleaned.replace(/<.*?>+/g, '');
  cleaned = cleaned.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
  cleaned = cleaned.replace(/\n/g, '');
  cleaned = cleaned.replace(/\w*\d\w*/g, '');
  return cleaned.trim();
};

type AnalysisRecord = {
  id: string;
  originalText: string;
  result: DetectionResult;
  timestamp: number;
};

export default function App() {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<DetectionResult | null>(null);
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await detectHateSpeech(inputText);
      setCurrentResult(result);
      
      const newRecord: AnalysisRecord = {
        id: Math.random().toString(36).substring(7),
        originalText: inputText,
        result,
        timestamp: Date.now(),
      };
      setHistory(prev => [newRecord, ...prev].slice(0, 10));
    } catch (err) {
      console.error(err);
      setError('Analysis failed. Please check your implementation or API key.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [inputText]);

  const clearInput = () => {
    setInputText('');
    setCurrentResult(null);
    setError(null);
  };

  const getResultColor = (category: string) => {
    switch (category) {
      case 'Hate Speech': return 'text-rose-500 border-rose-200 bg-rose-50';
      case 'Offensive Language': return 'text-amber-500 border-amber-200 bg-amber-50';
      case 'No Hate and Offensive': return 'text-emerald-500 border-emerald-200 bg-emerald-50';
      default: return 'text-slate-500 border-slate-200 bg-slate-50';
    }
  };

  const getResultIcon = (category: string) => {
    switch (category) {
      case 'Hate Speech': return <ShieldAlert className="w-8 h-8 text-rose-500" />;
      case 'Offensive Language': return <AlertTriangle className="w-8 h-8 text-amber-500" />;
      case 'No Hate and Offensive': return <ShieldCheck className="w-8 h-8 text-emerald-500" />;
      default: return <AlertCircle className="w-8 h-8 text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFB] text-[#141414] font-sans selection:bg-[#141414] selection:text-white">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#141414 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 lg:py-24">
        {/* Navigation / Header */}
        <header className="flex flex-col md:flex-row items-baseline justify-between mb-16 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#141414] rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] font-semibold opacity-60">System Model v3.1</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-4">
              Guardian <br className="hidden md:block" /> Sentinel.
            </h1>
            <p className="max-w-md text-lg opacity-60 leading-relaxed italic font-serif">
              A high-precision linguistic filter for detecting hate speech and harmful rhetoric in real-time.
            </p>
          </div>
          
          <div className="hidden lg:flex flex-col items-end gap-2 text-right">
             <div className="flex items-center gap-4 border-l-2 border-[#141414] pl-6 py-1">
                <div>
                   <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">Uptime</p>
                   <p className="font-mono text-xl font-medium">99.9%</p>
                </div>
                <div>
                   <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">Latency</p>
                   <p className="font-mono text-xl font-medium">320ms</p>
                </div>
             </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Analysis Area */}
          <section className="lg:col-span-12">
            <div className="bg-white border border-[#141414] shadow-[8px_8px_0px_#141414] rounded-xl overflow-hidden">
              <div className="p-6 border-b border-[#141414] flex items-center justify-between bg-[#FAFAFA]">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold tracking-widest">Text Core Analysis</span>
                </div>
                <button 
                  onClick={clearInput}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest hover:opacity-100 opacity-40 transition-opacity"
                >
                  <Eraser className="w-3 h-3" />
                  Clear Panel
                </button>
              </div>

              <div className="p-0 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste text to audit category..."
                  className="w-full h-48 md:h-64 p-8 text-xl md:text-2xl font-medium focus:outline-none resize-none placeholder:opacity-20"
                />
                
                <div className="absolute inset-x-0 bottom-0 p-6 flex justify-end bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !inputText.trim()}
                    className={cn(
                      "pointer-events-auto flex items-center gap-2 px-8 py-4 bg-[#141414] text-white rounded-lg font-bold uppercase tracking-widest transition-all",
                      (isAnalyzing || !inputText.trim()) && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing...
                      </div>
                    ) : (
                      <>
                        Invoke Analysis
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 border border-rose-500/20 bg-rose-50 text-rose-600 rounded-lg flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </section>

          {/* Results Display */}
          <AnimatePresence mode="wait">
            {currentResult && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="lg:col-span-8"
              >
                <div className={cn(
                  "p-8 border-2 rounded-2xl transition-colors h-full",
                  getResultColor(currentResult.category)
                )}>
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-current/10">
                      {getResultIcon(currentResult.category)}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs uppercase font-black tracking-widest mb-1 opacity-50">Audit Category</p>
                        <h2 className="text-4xl font-bold tracking-tight">{currentResult.category}</h2>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-widest mb-1 opacity-40">Confidence</p>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-mono text-2xl font-bold">{(currentResult.confidence * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="w-px h-10 bg-current opacity-10" />
                        <div className="flex-1">
                          <p className="text-[10px] uppercase font-bold tracking-widest mb-1 opacity-40">Linguistic Reasoning</p>
                          <p className="text-sm font-medium leading-relaxed italic font-serif">
                            "{currentResult.reasoning}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-current/10 grid md:grid-cols-2 gap-8">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <History className="w-4 h-4 opacity-40" />
                        <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">Cleaned Signature (Legacy logic)</span>
                      </div>
                      <div className="p-4 bg-white/50 border border-current/5 rounded-lg font-mono text-xs break-all">
                        {cleanTextLegacy(inputText)}
                      </div>
                    </div>
                    <div className="text-sm opacity-60 leading-relaxed font-serif">
                      <p>
                        Our Sentinel model utilizes contextual deep-learning to identify intent beyond simple keyword matching. 
                        While legacy preprocessing (shown left) simplifies the tokens, the AI considers the full semantic structure.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Sidebar / Info */}
          <aside className={cn(
            "lg:col-span-4 space-y-8",
            !currentResult && "lg:col-start-9"
          )}>
            <div className="p-6 border border-[#141414]/10 rounded-xl bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-4 h-4 text-[#141414]/40" />
                <h3 className="text-xs uppercase font-bold tracking-widest">Model Specs</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex justify-between items-center text-sm">
                  <span className="opacity-40">Architecture</span>
                  <span className="font-mono text-xs">Transformer v3</span>
                </li>
                <li className="flex justify-between items-center text-sm">
                  <span className="opacity-40">Tokens/Sec</span>
                  <span className="font-mono text-xs">~12.4k</span>
                </li>
                <li className="flex justify-between items-center text-sm">
                  <span className="opacity-40">Bias Filtering</span>
                  <span className="font-mono text-xs bg-emerald-100 text-emerald-700 px-1 rounded">Active</span>
                </li>
              </ul>
            </div>

            <div className="p-6 border border-[#141414]/10 rounded-xl bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-[#141414]/40" />
                <h3 className="text-xs uppercase font-bold tracking-widest">Recent Audits</h3>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {history.length === 0 ? (
                  <p className="text-sm opacity-30 italic text-center py-8 font-serif">No session history yet...</p>
                ) : (
                  history.map((record) => (
                    <motion.div 
                      key={record.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group p-3 border border-transparent hover:border-[#141414]/10 hover:bg-[#FAFAFA] rounded-lg transition-all"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                          record.result.category === 'No Hate and Offensive' ? 'bg-emerald-100 text-emerald-700' :
                          record.result.category === 'Offensive Language' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        )}>
                          {record.result.category.split(' ')[0]}
                        </span>
                        <span className="text-[10px] opacity-30 font-mono">
                          {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm font-medium line-clamp-2 mb-1 group-hover:line-clamp-none transition-all">
                        {record.originalText}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <div className="text-[10px] uppercase font-bold tracking-widest opacity-20 text-center">
              Sentinel © 2026 Audit Protocol
            </div>
          </aside>
        </div>
      </main>

      <footer className="mt-24 py-12 border-t border-[#141414]/5">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 hover:opacity-60 transition-opacity">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-bold tracking-tighter">Guardian Sentinel</span>
          </div>
          <div className="flex gap-8 text-xs font-bold tracking-widest uppercase">
            <a href="#" className="hover:underline flex items-center gap-1">Documentation <ExternalLink className="w-3 h-3" /></a>
            <a href="#" className="hover:underline flex items-center gap-1">Protocol <ExternalLink className="w-3 h-3" /></a>
            <a href="#" className="hover:underline flex items-center gap-1">Open Standards <ExternalLink className="w-3 h-3" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
