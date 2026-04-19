import React, { useState, useEffect, useRef } from 'react';
import { Printer as PrinterIcon, Scissors, Power, Share2, RefreshCw, X, Trees, Settings } from 'lucide-react';
import QRCode from 'qrcode';

// --- Web Audio API Synth for Button Click Sound ---
const playClickSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // A quick, tactile "clack" sound to simulate a heavy plastic hardware button
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (err) {
    console.warn("Audio context failed or not supported", err);
  }
};

// --- Web Audio API Synth for Thermal Printer Sound ---
const playThermalPrinterSound = (durationMs) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    
    if (ctx.state === 'suspended') ctx.resume();

    const bufferSize = ctx.sampleRate * (durationMs / 1000 + 0.5);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; 
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 5000;
    bandpass.Q.value = 1.2;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.15;

    const motor = ctx.createOscillator();
    motor.type = 'sawtooth';
    motor.frequency.value = 40; 

    const motorGain = ctx.createGain();
    motorGain.gain.value = 0.2;

    const masterGain = ctx.createGain();
    const durationSec = durationMs / 1000;
    
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05);
    masterGain.gain.setValueAtTime(1, ctx.currentTime + durationSec - 0.1);
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + durationSec);

    noiseSource.connect(bandpass).connect(noiseGain).connect(masterGain);
    motor.connect(motorGain).connect(masterGain);
    masterGain.connect(ctx.destination);

    noiseSource.start();
    motor.start();

    setTimeout(() => {
      noiseSource.stop();
      motor.stop();
      ctx.close();
    }, durationMs + 500);

  } catch (err) {
    console.warn("Audio context failed or not supported", err);
  }
};

// --- Web Audio API Synth for Paper Tear Sound ---
const playTearSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    
    if (ctx.state === 'suspended') ctx.resume();

    const duration = 0.4; 
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1200;

    const gainNode = ctx.createGain();
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    noiseSource.connect(filter).connect(gainNode).connect(ctx.destination);
    noiseSource.start();
    
    setTimeout(() => {
      noiseSource.stop();
      ctx.close();
    }, duration * 1000 + 100);

  } catch (err) {
    console.warn("Audio context failed or not supported", err);
  }
};

// --- Helper Components ---
const JaggedEdgeCode = ({ top = true }) => {
  const triangles = Array.from({ length: 26 });
  return (
    <div className="flex w-full h-[5px] bg-transparent">
      {triangles.map((_, i) => (
        <div key={i} className="w-[10px] h-[5px] shrink-0" style={{
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          ...(top ? { borderBottom: '5px solid #fcfcfc' } : { borderTop: '5px solid #fcfcfc' })
        }} />
      ))}
    </div>
  );
};

// --- Main Modal Component ---
export default function PrinterModal({ onClose }) {
  const [printStatus, setPrintStatus] = useState('idle'); 
  const [viewMode, setViewMode] = useState('printer'); 
  const [ticketData, setTicketData] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  
  const printTimeoutRef = useRef(null);
  const ticketRef = useRef(null);
  const printDuration = 4000; 

  useEffect(() => {
    if (!document.getElementById('html2canvas-script')) {
      const script = document.createElement('script');
      script.id = 'html2canvas-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      document.head.appendChild(script);
    }

    QRCode.toDataURL('https://grow-voxly.vercel.app', { 
      margin: 1, 
      width: 140, 
      color: { dark: '#064e3b', light: '#fcfcfc' } 
    }).then(setQrDataUrl).catch(console.error);

    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const onPrintClick = () => {
    playClickSound();
    if (printTimeoutRef.current) clearTimeout(printTimeoutRef.current);
    if (printStatus === 'printing' || printStatus === 'printed') {
      setPrintStatus('idle');
      setTimeout(() => startPrinting(), 400); 
      return;
    }
    startPrinting();
  };

  const startPrinting = () => {
    setTicketData({
      id: Math.random().toString(36).substring(2, 8).toUpperCase(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      lines: [
        "Turns boring links into beautiful 3D voxel trees you can actually explore.",
        "Your URL is the seed. Every single link grows its own unique shape and colors.",
        "Ditch the basic black-and-white pixels. Make your QR codes stand out."
        "Comes with free vanity URLs and real-time scan tracking."
      ]
    });

    setPrintStatus('printing');
    playThermalPrinterSound(printDuration);

    printTimeoutRef.current = setTimeout(() => {
      setPrintStatus('printed');
    }, printDuration);
  };

  const onTearClick = () => {
    playClickSound();
    if (printStatus !== 'printed') return;
    
    playTearSound();
    setPrintStatus('tearing');
    
    setTimeout(() => {
      setViewMode('ticket');
      setPrintStatus('viewing');
    }, 600); 
  };

  const resetToIdle = () => {
    setViewMode('printer');
    setPrintStatus('idle');
  };

  const handleReset = () => {
    resetToIdle();
    setTimeout(() => {
      onPrintClick(); 
    }, 800);
  };

  const handleShare = async () => {
    if (!window.html2canvas || !ticketRef.current) return;
    setIsSharing(true);
    try {
      const canvas = await window.html2canvas(ticketRef.current, { 
        backgroundColor: null, 
        scale: 3, 
        useCORS: true,
        logging: false,
        allowTaint: true
      });
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], "grow-voxly_receipt.png", { type: "image/png" });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ 
            title: 'Grow-Voxly - 3D Voxel URLs', 
            text: 'Plant a Link. Grow a World. Turn your boring URLs into interactive 3D ecosystems. Visit: https://grow-voxly.vercel.app',
            files: [file] 
        });
        resetToIdle();
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'grow-voxly_receipt.png';
        a.click();
        URL.revokeObjectURL(url);
        resetToIdle();
      }
    } catch (err) {
      console.warn("Share cancelled or failed", err);
    } finally {
      setIsSharing(false);
    }
  };

  const printerPartAnimation = `transition-transform duration-1000 ease-in-out ${viewMode === 'ticket' ? 'translate-y-[100vh]' : 'translate-y-0'}`;

  return (
    <div className="fixed inset-0 z-[200] bg-emerald-950/95 backdrop-blur-md flex flex-col items-center justify-between font-sans overflow-hidden px-4 pt-10 pb-16 sm:pb-24">
      
      {/* ALWAYS VISIBLE Close Modal Button */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[250]"
      >
        <X size={24} />
      </button>

      <div className="flex-1" />

      {/* --- PRINTER ASSEMBLY & CONTROLS WRAPPER --- */}
      <div className="relative flex flex-col items-center mt-auto">
        
        {/* --- PRINTER ASSEMBLY --- */}
        <div className="relative flex flex-col items-center">
          
          {/* 1. PRINTER LID / BACK COVER */}
          <div className={`w-[380px] h-[110px] bg-gradient-to-b from-slate-700 to-slate-900 rounded-t-[2.5rem] shadow-[inset_0_12px_24px_rgba(255,255,255,0.08),0_-10px_30px_rgba(0,0,0,0.6)] border-t border-slate-500 relative z-0 flex justify-center items-start pt-6 ${printerPartAnimation}`}>
             <div className="w-56 h-3 bg-black/30 rounded-full blur-[2px] shadow-inner"></div>
          </div>

          {/* 2. PAPER EXTRUSION ZONE */}
          <div className={`absolute bottom-[160px] w-[380px] h-[700px] flex flex-col items-center justify-end z-10 pointer-events-none ${viewMode === 'ticket' ? 'overflow-visible' : 'overflow-hidden'}`}>
            
            {/* THE ANIMATION WRAPPER */}
            <div 
              className="w-[260px] relative origin-bottom pointer-events-auto flex flex-col items-center"
              style={{
                transform: 
                  printStatus === 'idle' ? 'translateY(100%)' : 
                  printStatus === 'printing' ? 'translateY(0%)' :
                  printStatus === 'printed' ? 'translateY(0%)' :
                  printStatus === 'tearing' ? 'translateY(-15px) rotate(-3deg) scale(1.02)' :
                  'translateY(calc(-50dvh + 50% + 190px)) rotate(0deg) scale(1.1)', 
                transition: 
                  printStatus === 'printing' ? `transform ${printDuration}ms linear` :
                  printStatus === 'tearing' ? 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' :
                  printStatus === 'viewing' ? 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)' :
                  'transform 0.4s ease-in',
              }}
            >
              <div data-html2canvas-ignore="true" className={`absolute inset-0 bg-black/5 shadow-2xl transition-opacity duration-500 z-0 ${viewMode === 'ticket' ? 'opacity-100' : 'opacity-0'}`} />

              {/* THE CAPTURE TARGET (RECEIPT) */}
              <div ref={ticketRef} className="w-full h-auto bg-transparent text-slate-800 flex flex-col relative z-10 shrink-0">
                <JaggedEdgeCode top={true} />

                <div className="w-full bg-[#fcfcfc] px-5 pt-4 pb-4 flex flex-col relative overflow-hidden">
                  
                  {/* Artistic Trees Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                     <Trees size={240} className="text-emerald-900" />
                  </div>

                  <div className="relative z-10 flex flex-col font-sans">
                    <div className="text-center font-serif font-black text-2xl mb-0.5 tracking-tight text-emerald-950">
                      GROW-VOXLY
                    </div>
                    <div className="text-center text-[10px] text-slate-500 mb-2 pb-2 border-b border-dashed border-slate-300 font-medium tracking-wide">
                      The 3D Voxel URL Engine
                    </div>
                    
                    {ticketData && (
                      <div className="flex flex-col">
                        <div className="flex justify-between text-[9px] font-bold mb-1 text-slate-600">
                          <span>{ticketData.date}</span>
                          <span>{ticketData.time}</span>
                        </div>
                        <div className="flex justify-between text-[9px] font-bold mb-2">
                          <span className="text-slate-600">SESSION ID:</span>
                          <span className="text-slate-900">#{ticketData.id}</span>
                        </div>

                        <div className="border-t border-b border-dashed border-slate-300 py-2.5 my-1 space-y-2">
                          {ticketData.lines.map((line, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-[9.5px] font-bold text-slate-800 leading-tight">
                              <span className="text-emerald-600 mt-[1px]">▶</span>
                              <span>{line}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {qrDataUrl && (
                      <div className="flex flex-col items-center mt-3">
                         <img src={qrDataUrl} alt="Grow-Voxly QR" className="w-24 h-24 mix-blend-multiply" />
                         <span className="text-[8px] font-bold uppercase tracking-wider mt-1.5 text-slate-500">Scan to visit website</span>
                         <span className="text-[10px] font-bold text-slate-900 mt-0.5">grow-voxly.vercel.app</span>
                      </div>
                    )}

                    <div className="text-center text-[8px] text-slate-400 mt-4 font-bold tracking-widest uppercase">
                      Thank you for cultivating
                    </div>
                  </div>
                </div>

                <JaggedEdgeCode top={false} />
              </div>

              {/* TICKET VIEW CONTROLS */}
              <div 
                data-html2canvas-ignore="true" 
                className={`absolute top-full mt-6 flex flex-row justify-between gap-3 w-[260px] transition-opacity duration-700 delay-300 ${viewMode === 'ticket' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
              >
                <button
                  onClick={handleReset}
                  className="flex flex-1 items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-xs bg-slate-700 hover:bg-slate-600 shadow-md text-white transition-all active:scale-95"
                >
                  <RefreshCw size={16} />
                  REPRINT
                </button>

                <button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="flex flex-1 items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-500 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] text-white transition-all active:scale-95"
                >
                  {isSharing ? <Settings size={16} className="animate-spin" /> : <Share2 size={16} />}
                  SHARE
                </button>
              </div>

            </div>
          </div>

          {/* 3. THE GAP / SLOT OPENING */}
          <div className={`w-[320px] h-[12px] bg-neutral-950 absolute bottom-[154px] z-20 shadow-[inset_0_6px_10px_rgba(0,0,0,1),0_2px_0_rgba(255,255,255,0.1)] rounded-sm ${printerPartAnimation}`}></div>

          {/* 4. PRINTER FRONT BODY (Hardware Panel with Integrated Buttons) */}
          <div className={`w-[380px] h-[160px] bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 rounded-b-2xl shadow-[0_30px_40px_-10px_rgba(0,0,0,0.8),inset_0_2px_3px_rgba(255,255,255,0.2)] relative z-30 flex flex-col border-t border-slate-600 ${printerPartAnimation}`}>
            <div className="absolute top-0 left-0 w-full h-[4px] opacity-50" 
                 style={{ backgroundImage: 'repeating-linear-gradient(90deg, #94a3b8 0px, #94a3b8 2px, transparent 2px, transparent 5px)' }}>
            </div>
            
            <div className="flex-1 px-8 pt-6 pb-6 flex flex-col justify-between">
              
              {/* Vents */}
              <div className="flex gap-5 opacity-30 mx-4 shadow-inner">
                 <div className="h-[4px] flex-1 bg-black rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />
                 <div className="h-[4px] flex-1 bg-black rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />
              </div>

              {/* Control Deck */}
              <div className="flex justify-between items-end mt-auto">
                
                {/* Logo & Branding */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-slate-600 to-slate-900 border border-slate-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center">
                     <PrinterIcon size={22} className="text-emerald-400" />
                  </div>
                  <div className="flex flex-col justify-center drop-shadow-md">
                    <div className="text-[13px] font-black tracking-widest text-slate-200 leading-tight">GROW-VOXLY</div>
                    <div className="text-[9px] text-slate-400 tracking-wider font-bold mt-0.5">SERIES 80 ENG</div>
                  </div>
                </div>

                {/* Integrated Hardware Buttons & LEDs */}
                <div className="flex items-center gap-4">
                  
                  {/* Status LEDs */}
                  <div className="flex flex-col gap-2 mr-1 bg-slate-900/80 p-2 rounded-lg shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-slate-700/50">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]" title="Power" />
                    <div className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      printStatus === 'printing' ? 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.9)] animate-pulse' : 'bg-slate-700 shadow-inner'
                    }`} title="Data" />
                  </div>

                  {/* Hardware TEAR Button */}
                  <button
                    onClick={onTearClick}
                    disabled={printStatus !== 'printed'}
                    className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-xl border-b-[4px] transition-all active:border-b-0 active:translate-y-[4px] ${
                      printStatus === 'printed' 
                        ? 'bg-gradient-to-b from-slate-600 to-slate-700 border-slate-900 text-white hover:from-slate-500 hover:to-slate-600 shadow-[0_6px_12px_rgba(0,0,0,0.4)] cursor-pointer' 
                        : 'bg-slate-800 border-slate-950 text-slate-500 cursor-not-allowed opacity-80 shadow-inner'
                    }`}
                  >
                    <Scissors size={18} className={`mb-1 ${printStatus === 'printed' ? 'animate-bounce' : ''}`} />
                    <span className="text-[8px] font-black tracking-widest uppercase text-shadow-sm">Tear</span>
                  </button>

                  {/* Hardware PRINT Button */}
                  <button
                    onClick={onPrintClick}
                    disabled={printStatus === 'tearing'}
                    className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-xl border-b-[4px] transition-all active:border-b-0 active:translate-y-[4px] ${
                      printStatus === 'tearing'
                        ? 'bg-slate-800 border-slate-950 text-slate-500 cursor-not-allowed opacity-80 shadow-inner'
                        : 'bg-gradient-to-b from-emerald-500 to-emerald-600 border-emerald-900 text-white hover:from-emerald-400 hover:to-emerald-500 shadow-[0_6px_15px_rgba(16,185,129,0.4)] cursor-pointer'
                    }`}
                  >
                    {/* Blinking Light Indicator */}
                    <div className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-black/20 ${printStatus === 'idle' ? 'bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,1)] animate-pulse' : (printStatus === 'printing' ? 'bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,1)]' : 'bg-emerald-800 shadow-inner')}`} />

                    {printStatus === 'printing' ? <Settings size={18} className="animate-spin mb-1" /> : <Power size={18} className="mb-1" />}
                    <span className="text-[8px] font-black tracking-widest uppercase text-shadow-sm">
                      {printStatus === 'printing' ? 'Wait' : 'Print'}
                    </span>
                  </button>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
