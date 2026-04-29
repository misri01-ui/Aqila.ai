/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Upload, 
  Download, 
  RefreshCw, 
  Image as ImageIcon, 
  Cpu, 
  Maximize2,
  Trash2,
  Zap,
  Info
} from 'lucide-react';
import { generateImage, GenerationOptions } from './services/geminiService';

type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [highQuality, setHighQuality] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBaseImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearBaseImage = () => {
    setBaseImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (!prompt) {
      setError("Masukkan perintah (prompt) terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const options: GenerationOptions = {
        prompt,
        aspectRatio,
        highQuality,
        baseImage: baseImage || undefined
      };
      
      const imageUrl = await generateImage(options);
      setGeneratedImageUrl(imageUrl);
    } catch (err) {
      console.error(err);
      setError("Gagal menghasilkan gambar. Pastikan API Key valid dan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImageUrl) return;
    const link = document.createElement("a");
    link.href = generatedImageUrl;
    link.download = `aqila-ai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-screen bg-[#050505] text-white font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 px-8 border-b border-white/10 flex items-center justify-between bg-[#080808] z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-[#00F0FF] to-[#7000FF] rounded-lg shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tighter">AQILA<span className="text-[#00F0FF]">.AI</span></h1>
        </div>
        
        <nav className="hidden md:flex gap-8 text-sm font-medium text-white/60">
          <a href="#" className="text-white">Generator</a>
          <a href="#" className="hover:text-white transition-colors">Editor Pro</a>
          <a href="#" className="hover:text-white transition-colors">History</a>
        </nav>

        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono text-[#00F0FF] tracking-widest uppercase">Engine Ready</div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-b from-zinc-700 to-zinc-900 border border-white/20"></div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar Controls */}
        <aside className="w-72 bg-[#080808] border-r border-white/10 p-6 flex flex-col gap-8 shrink-0 overflow-y-auto">
          {/* Generation Mode / Parameters */}
          <section className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Aspect Ratio</label>
            <div className="grid grid-cols-2 gap-2">
              {(["1:1", "16:9", "9:16", "4:3", "3:4"] as AspectRatio[]).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-2 px-3 text-xs font-semibold rounded border transition-all ${
                    aspectRatio === ratio
                      ? "bg-white/10 border-[#00F0FF]/50 text-[#00F0FF] shadow-[inset_0_0_10px_rgba(0,240,255,0.1)]"
                      : "bg-white/5 border-white/5 hover:bg-white/10"
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Image Reference</label>
            <div className="space-y-3">
              {!baseImage ? (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-12 bg-white/5 border border-dashed border-white/10 rounded-lg flex items-center justify-center gap-3 hover:border-[#00F0FF]/50 hover:bg-white/10 transition-all group"
                >
                  <Upload className="w-4 h-4 text-white/40 group-hover:text-[#00F0FF]" />
                  <span className="text-xs text-white/60">Upload Image</span>
                </button>
              ) : (
                <div className="relative group rounded-lg overflow-hidden border border-[#00F0FF]/30">
                  <img src={baseImage} alt="Ref" className="w-full h-20 object-cover opacity-60" />
                  <button 
                    onClick={clearBaseImage}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Advanced Settings</label>
              <span className={`h-1.5 w-1.5 rounded-full ${highQuality ? 'bg-[#00F0FF]' : 'bg-white/20'}`} />
            </div>
            
            <button 
              onClick={() => setHighQuality(!highQuality)}
              className={`w-full h-12 flex items-center px-4 justify-between rounded-lg border transition-all ${
                highQuality 
                ? "bg-white/10 border-[#00F0FF]/50 shadow-[inset_0_0_10px\_rgba(0,240,255,0.1)]" 
                : "bg-white/5 border-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className={`w-4 h-4 ${highQuality ? 'text-[#00F0FF]' : 'text-white/20'}`} />
                <span className={`text-sm ${highQuality ? 'text-white' : 'text-white/40'}`}>Ultra HD (1K)</span>
              </div>
              <div className={`w-4 h-4 rounded-full border border-white/10 flex items-center justify-center`}>
                {highQuality && <div className="w-2 h-2 bg-[#00F0FF] rounded-full" />}
              </div>
            </button>
          </section>

          <div className="mt-auto">
            <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800 to-black border border-white/10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-white/40 font-bold">AI STATUS</span>
                <span className={`flex h-2 w-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              </div>
              <div className="text-sm font-semibold">{loading ? "Processing..." : "Ready to Generate"}</div>
              <div className="text-[10px] opacity-40 mt-1">Average response: 1.2s</div>
            </div>
          </div>
        </aside>

        {/* Generation Canvas */}
        <section className="flex-1 p-8 flex flex-col gap-6 relative bg-[#050505] overflow-hidden">
          {/* Active Preview Area */}
          <div className="flex-1 relative rounded-3xl overflow-hidden border border-white/5 bg-[#111] group shadow-2xl flex items-center justify-center">
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
            
            <AnimatePresence mode="wait">
              {generatedImageUrl ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full relative"
                >
                  <img 
                    src={generatedImageUrl} 
                    alt="Generated" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    style={{ filter: "brightness(1.05) contrast(1.1)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Actions Overlay */}
                  <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={downloadImage}
                      className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-[#00F0FF] hover:text-black transition-all shadow-xl"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setGeneratedImageUrl(null)}
                      className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-xl"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Resolution Badge */}
                  <div className="absolute bottom-8 left-8 flex items-center gap-4">
                    <div className="px-4 py-2 bg-black/60 backdrop-blur-lg border border-white/10 rounded-xl">
                       <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Output Metrics</div>
                       <div className="text-sm font-bold flex items-center gap-2">
                         4096 x 2304 <span className="text-[#00F0FF] italic text-xs">VIBRANT CONTRAST</span>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ) : loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-6"
                >
                  <div className="relative">
                    <div className="w-24 h-24 border-2 border-[#00F0FF]/10 rounded-full" />
                    <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-[#00F0FF] rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-[#00F0FF] animate-pulse">
                      <Zap className="w-10 h-10 fill-current" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold tracking-tight text-white mb-1">SYNTHESIZING IMAGE</p>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Engine: Aqila-Gen-V4.2</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center space-y-6 max-w-sm"
                >
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto shadow-2xl relative">
                    <div className="absolute inset-0 bg-[#00F0FF]/5 blur-xl rounded-full" />
                    <ImageIcon className="w-8 h-8 text-white/20 relative z-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold tracking-tight">System Ready</h3>
                    <p className="text-sm text-white/40 leading-relaxed font-medium">
                      Enter a prompt below to generate high-contrast, AI-enhanced visual assets in real-time.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Bar */}
          <div className="h-20 bg-[#080808] border border-white/10 rounded-2xl flex items-center px-6 gap-6 shadow-xl relative z-10 shrink-0">
            <div className="w-10 h-10 flex items-center justify-center text-[#00F0FF] bg-white/5 rounded-xl border border-white/5 shrink-0">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="Describe your vision (e.g. Cyberpunk metropolis with neon bioluminescence...)"
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-white/20 font-medium"
            />
            
            <div className="flex items-center gap-4">
              {error && (
                <span className="hidden lg:block text-[10px] font-bold text-red-500 uppercase tracking-widest">{error}</span>
              )}
              <button 
                onClick={handleGenerate}
                disabled={loading}
                className={`px-10 h-12 bg-[#00F0FF] text-black font-bold text-xs uppercase tracking-widest rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 ${loading ? 'opacity-50' : ''}`}
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate
              </button>
            </div>
          </div>

          {/* Floating UI Elements Context */}
          {error && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-500 text-white text-[10px] font-bold uppercase rounded-full shadow-2xl z-50 lg:hidden">
              {error}
            </div>
          )}
        </section>
      </main>

      {/* Bottom Bar */}
      <footer className="h-8 px-8 bg-[#030303] border-t border-white/5 flex items-center justify-between text-[9px] text-white/30 tracking-widest uppercase font-bold shrink-0">
        <div className="flex gap-8">
          <span className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full" /> GPU: ACTIVE</span>
          <span>LATENCY: 42MS</span>
          <span>ENGINE: AQILA-GEN-V4.2</span>
        </div>
        <div>© 2026 AQILA TECHNOLOGIES • POWERED BY GEMINI</div>
      </footer>
    </div>
  );
}
