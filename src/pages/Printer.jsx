import React, { useState, useEffect, useRef } from 'react';
import { Printer as PrinterIcon, Scissors, Power, Share2, RefreshCw, X } from 'lucide-react';
import QRCode from 'qrcode';

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
    // Inject html2canvas if missing
    if (!document.getElementById('html2canvas-script')) {
      const script = document.createElement('script');
      script.id = 'html2canvas-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      document.head.appendChild(script);
    }

    // Generate the QR code for the website
    QRCode.toDataURL('https://grow-voxly.vercel.app', { 
      margin: 1, 
      width: 160, 
      color: { dark: '#0f172a', light: '#fcfcfc' } 
    }).then(setQrDataUrl).catch(console.error);

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handlePrint = () => {
    if (printTimeoutRef.current) clearTimeout(printTimeoutRef.current);
    if (printStatus === 'printing' || printStatus === 'printed') {
      setPrintStatus('idle');
      setTimeout(() => startPrinting(), 400); 
      return;
    }
    startPrinting();
  };

  const startPrinting = () => {
    // Generate exactly at the moment the button is pressed
    setTicketData({
      id: Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      items: [
        { name: '1x 3D Voxel Tree', price: 'FREE' },
        { name: '1x Custom QR Tile', price: 'FREE' },
        { name: '1x Vanity URL', price: 'FREE' }
      ],
      total: 'PRICELESS'
    });

    setPrintStatus('printing');
    playThermalPrinterSound(printDuration);

    printTimeoutRef.current = setTimeout(() => {
      setPrintStatus('printed');
    }, printDuration);
  };

  const handleTear = () => {
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
      handlePrint(); 
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
            title: 'Grow-Voxly Receipt', 
            text: 'Check out Grow-Voxly, the 3D Voxel URL shortener!',
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
    <div className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-between font-sans overflow-hidden px-4 text-slate-200 pt-10 pb-16 sm:pb-24">
      
      {/* Close Modal Button */}
      <button 
        onClick={onClose} 
        className={`absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[250] ${viewMode === 'ticket' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <X size={24} />
      </button>

      <div className="flex-1" />

      {/* --- PRINTER ASSEMBLY & CONTROLS WRAPPER --- */}
      <div className="relative flex flex-col items-center mt-auto">
        
        {/* --- PRINTER ASSEMBLY --- */}
        <div className="relative flex flex-col items-center">
          
          {/* 1. PRINTER LID / BACK COVER */}
          <div className={`w-[340px] h-[100px] bg-gradient-to-b from-slate-700 to-slate-900 rounded-t-[3rem] shadow-[inset_0_10px_20px_rgba(255,255,255,0.05),0_-10px_30px_rgba(0,0,0,0.5)] border-t border-slate-600 relative z-0 flex justify-center items-start pt-6 ${printerPartAnimation}`}>
             <div className="w-48 h-2 bg-black/20 rounded-full blur-[1px]"></div>
          </div>

          {/* 2. PAPER EXTRUSION ZONE */}
          <div className={`absolute bottom-[135px] w-[340px] h-[800px] flex flex-col items-center justify-end z-10 pointer-events-none ${viewMode === 'ticket' ? 'overflow-visible' : 'overflow-hidden'}`}>
            
            {/* THE ANIMATION WRAPPER */}
            <div 
              className="w-[260px] relative origin-bottom pointer-events-auto flex flex-col items-center"
              style={{
                transform: 
                  printStatus === 'idle' ? 'translateY(100%)' : 
                  printStatus === 'printing' ? 'translateY(0%)' :
                  printStatus === 'printed' ? 'translateY(0%)' :
                  printStatus === 'tearing' ? 'translateY(-15px) rotate(-3deg) scale(1.02)' :
                  'translateY(calc(-50dvh + 50% + 230px)) rotate(0deg) scale(1.1)', 
                transition: 
                  printStatus === 'printing' ? `transform ${printDuration}ms linear` :
                  printStatus === 'tearing' ? 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' :
                  printStatus === 'viewing' ? 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)' :
                  'transform 0.4s ease-in',
              }}
            >
              <div data-html2canvas-ignore="true" className={`absolute inset-0 bg-black/5 shadow-2xl transition-opacity duration-500 z-0 ${viewMode === 'ticket' ? 'opacity-100' : 'opacity-0'}`} />

              {/* THE CAPTURE TARGET */}
              <div ref={ticketRef} className="w-full h-auto bg-transparent text-black flex flex-col relative z-10 shrink-0">
                <JaggedEdgeCode top={true} />

                <div className="w-full bg-[#fcfcfc] px-6 pt-5 pb-7 flex flex-col font-mono text-sm">
                  <div className="text-center font-black text-2xl mb-1 tracking-tighter">
                    GROW-VOXLY
                  </div>
                  <div className="text-center text-xs text-slate-500 mb-4 pb-4 border-b-2 border-dashed border-slate-300">
                    The 3D Voxel URL Engine<br/>
                    grow-voxly.vercel.app
                  </div>
                  
                  {ticketData && (
                    <div className="flex flex-col gap-1 text-slate-800">
                      <div className="flex justify-between text-xs mb-2">
                        <span>{ticketData.date}</span>
                        <span>{ticketData.time}</span>
                      </div>
                      <div className="flex justify-between text-xs mb-3 font-bold">
                        <span>Operation:</span>
                        <span>#{ticketData.id}</span>
                      </div>

                      <div className="border-t border-b border-dashed border-slate-300 py-3 my-2 space-y-2">
                        {ticketData.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span>{item.name}</span>
                            <span>{item.price}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between mt-2 text-lg font-bold">
                        <span>TOTAL:</span>
                        <span>{ticketData.total}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Website QR Code replaces the Barcode */}
                  {qrDataUrl && (
                    <div className="flex justify-center mt-5 mb-2">
                       <img src={qrDataUrl} alt="Grow-Voxly QR" className="w-32 h-32 mix-blend-multiply" />
                    </div>
                  )}

                  <div className="text-center text-[9px] text-slate-400 mt-2 font-sans tracking-wide uppercase">
                    THANK YOU FOR CULTIVATING
                  </div>
                </div>

                <JaggedEdgeCode top={false} />
              </div>

              {/* TICKET VIEW CONTROLS (Flipped positions & renaming) */}
              <div 
                data-html2canvas-ignore="true" 
                className={`absolute top-full mt-6 flex flex-row justify-between gap-3 w-[260px] transition-opacity duration-700 delay-300 ${viewMode === 'ticket' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
              >
                {/* REPRINT (Left) */}
                <button
                  onClick={handleReset}
                  className="flex flex-1 items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-xs bg-slate-700 hover:bg-slate-600 shadow-md text-white transition-all active:scale-95"
                >
                  <RefreshCw size={16} />
                  REPRINT
                </button>

                {/* SHARE WEB (Right) */}
                <button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="flex flex-1 items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-500 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] text-white transition-all active:scale-95"
                >
                  {isSharing ? <span className="animate-spin text-sm">⚙</span> : <Share2 size={16} />}
                  SHARE WEB
                </button>
              </div>

            </div>
          </div>

          {/* 3. THE GAP / SLOT OPENING */}
          <div className={`w-[280px] h-[10px] bg-black absolute bottom-[130px] z-20 shadow-[inset_0_4px_8px_rgba(0,0,0,1)] rounded-sm ${printerPartAnimation}`}></div>

          {/* 4. PRINTER FRONT BODY */}
          <div className={`w-[340px] h-[135px] bg-gradient-to-b from-slate-800 to-slate-950 rounded-b-xl shadow-[0_25px_30px_-10px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] relative z-30 flex flex-col border-t border-slate-700/50 ${printerPartAnimation}`}>
            <div className="absolute top-0 left-0 w-full h-[3px] opacity-60" 
                 style={{ backgroundImage: 'repeating-linear-gradient(90deg, #94a3b8 0px, #94a3b8 2px, transparent 2px, transparent 4px)' }}>
            </div>
            
            <div className="flex-1 px-8 pt-6 pb-4 flex flex-col justify-between">
              <div className="flex gap-4 opacity-20">
                 <div className="h-[2px] flex-1 bg-black rounded-full" />
                 <div className="h-[2px] flex-1 bg-black rounded-full" />
              </div>

              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 shadow-inner flex items-center justify-center">
                     <PrinterIcon size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold tracking-widest text-slate-300">THERMA-PRINT</div>
                    <div className="text-[8px] text-slate-500 tracking-wider">VOXLY SERIES 80</div>
                  </div>
                </div>

                <div className="flex gap-4 items-center bg-slate-900/50 p-2 px-3 rounded-lg border border-black/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <span className="text-[6px] text-slate-400 font-bold tracking-widest">PWR</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      printStatus === 'printing' ? 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)] animate-pulse' : 'bg-slate-700 shadow-inner'
                    }`} />
                    <span className="text-[6px] text-slate-400 font-bold tracking-widest">DATA</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-slate-700 shadow-inner" />
                    <span className="text-[6px] text-slate-400 font-bold tracking-widest">ERR</span>
                  </div>
                  <button className="ml-2 w-6 h-6 rounded-full bg-slate-700 border-b-2 border-slate-900 hover:bg-slate-600 active:border-b-0 active:translate-y-[2px] transition-all flex items-center justify-center cursor-default">
                     <div className="w-3 h-3 rounded-full border-2 border-slate-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN PRINTER CONTROLS (Flipped positions & naming) --- */}
        <div className={`mt-6 flex flex-row gap-4 relative z-50 transition-all duration-700 ${viewMode === 'ticket' ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'}`}>
          
          {/* TEAR (Left) */}
          <button
            onClick={handleTear}
            disabled={printStatus !== 'printed'}
            className={`flex flex-1 items-center justify-center gap-2 w-36 py-2.5 rounded-lg font-bold text-xs transition-all ${
              printStatus === 'printed' ? 'bg-slate-700 hover:bg-slate-600 shadow-md text-white active:scale-95'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
            }`}
          >
            <Scissors size={16} className={printStatus === 'printed' ? 'animate-bounce' : ''} />
            TEAR
          </button>

          {/* GENERATE (Right) */}
          <button
            onClick={handlePrint}
            disabled={printStatus === 'tearing'}
            className={`flex flex-1 items-center justify-center gap-2 w-36 py-2.5 rounded-lg font-bold text-xs transition-all ${
              printStatus === 'tearing' ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-inner' 
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] text-white active:scale-95'
            }`}
          >
            {printStatus === 'printing' ? <span className="animate-spin text-sm">⚙</span> : <Power size={16} />}
            {printStatus === 'printing' ? 'PROCESSING' : 'PRINT'}
          </button>

        </div>

      </div>
    </div>
  );
}
