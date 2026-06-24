import React, { useState, useEffect, useRef } from 'react';
import { useTerminal } from '../hooks/useTerminal';
import HistoryLog from './HistoryLog';
import InputLine from './InputLine';
import { ASCII_LOGO, BOOT_SEQUENCE } from '../config/commands';
import { motion } from 'framer-motion';

const MatrixScreensaver = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '010101010101010101ABCDEFXYZ'.split('');
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let x = 0; x < columns; x++) drops[x] = 1;

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F0';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[100] bg-black" />;
};

export default function RetroTerminal() {
  const [isBooting, setIsBooting] = useState(true);
  const [bootText, setBootText] = useState<string[]>([]);
  
  const {
    history,
    theme,
    inputValue,
    setInputValue,
    executeCommand,
    executeToken,
    helperTokens,
    autocompleteOptions,
    commandHistory,
    historyPointer,
    setHistoryPointer,
    playClick,
    volumeLevel,
    setVolumeLevel,
    isResumeViewerOpen,
    setIsResumeViewerOpen,
    isScreensaverActive,
    isVoiceModeActive
  } = useTerminal();

  const [isPoweredOff, setIsPoweredOff] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  const hints = [
    "[TIP]: Type 'projects.log' to view enterprise systems data.",
    "[TIP]: Use Up/Down Arrow keys to scroll input history.",
    "[TIP]: Run 'sudo access' to verify core node credentials."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setHintIndex(prev => (prev + 1) % hints.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Initial boot sequence effect
  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      if (step < BOOT_SEQUENCE.length) {
        setBootText(prev => [...prev, BOOT_SEQUENCE[step]]);
        step++;
      } else {
        clearInterval(interval);
        setTimeout(() => setIsBooting(false), 400);
      }
    }, 120);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClick(false);
    setIsPoweredOff(true);
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClick(false);
    setIsMinimized(true);
  };

  const handleMaximize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    playClick(false);
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (isPoweredOff) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <button 
          onClick={() => { playClick(true); setIsPoweredOff(false); }}
          className="flex flex-col items-center gap-4 opacity-50 hover:opacity-100 hover:scale-110 transition-all cursor-pointer"
          style={{ color: theme.text } as React.CSSProperties}
        >
          <div className="w-16 h-16 border-4 border-current rounded-full flex items-center justify-center shadow-[0_0_15px_currentColor]">
            <div className="w-1.5 h-8 bg-current -mt-6 rounded"></div>
          </div>
          <span className="font-mono text-xl tracking-widest shadow-[0_0_10px_currentColor] font-bold">SYSTEM RESTORE</span>
        </button>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={() => { playClick(true); setIsMinimized(false); }}
          className="px-6 py-3 bg-gray-900 border text-terminal-text font-mono rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.8)] hover:bg-gray-800 transition-all flex items-center gap-3 cursor-pointer"
          style={{ borderColor: theme.text, color: theme.text } as React.CSSProperties}
        >
          <div className="w-3 h-3 rounded-full bg-yellow-500/80 animate-pulse" />
          <span>RETRO_OS_v1.0.4 - MINIMIZED</span>
        </button>
      </div>
    );
  }

  return (
    <>
      {isScreensaverActive && <MatrixScreensaver />}
      
      {isResumeViewerOpen && (
        <motion.div 
          drag 
          dragMomentum={false}
          className="fixed top-20 left-4 md:left-1/4 z-40 w-[90%] md:w-full max-w-2xl bg-gray-900 border border-terminal-text rounded-lg shadow-2xl overflow-hidden shadow-terminal-text/30"
          style={{ '--color-terminal-text': theme.text } as React.CSSProperties}
        >
          <div className="bg-black/50 px-4 py-2 flex justify-between items-center cursor-move border-b border-terminal-text/50">
            <span className="font-mono text-sm" style={{ color: theme.text }}>rishav_rana_resume.pdf</span>
            <button 
              onClick={() => setIsResumeViewerOpen(false)}
              className="w-4 h-4 rounded-full bg-red-500 hover:bg-red-400 border border-red-900"
            />
          </div>
          <div className="p-4 bg-black">
            <object data="/resume.pdf" type="application/pdf" className="w-full h-[60vh] md:h-[400px] rounded-lg border border-slate-800 bg-gray-900">
              <div className="text-white font-mono p-4">
                Viewer failed to load on current sandbox. <br/><br/>
                <a href="/resume.pdf" target="_blank" rel="noreferrer" className="underline" style={{ color: theme.text }}>Download PDF Resume directly</a>
              </div>
            </object>
          </div>
        </motion.div>
      )}

      <div className="fixed bottom-4 right-4 z-30 pointer-events-none opacity-80 hidden md:block">
        <div className="bg-black/80 backdrop-blur-sm border border-terminal-text/40 px-4 py-2 rounded shadow-[0_0_10px_rgba(0,0,0,0.5)] font-mono text-xs max-w-xs transition-opacity duration-500" style={{ color: theme.text }}>
          {hints[hintIndex]}
        </div>
      </div>

      <div 
        className={`w-full h-full max-w-5xl mx-auto overflow-y-auto p-6 md:p-10 text-terminal-text bg-terminal-bg rounded-lg shadow-2xl border border-terminal-text/20 shadow-terminal-text/10 transition-colors duration-500 ${theme.fontClass} ${theme.containerAnimation || ''}`}
        style={{ '--color-terminal-bg': theme.bg, '--color-terminal-text': theme.text } as React.CSSProperties}
        onClick={() => document.getElementById('terminal-main-input')?.focus()}
      >
      <div className="flex justify-between items-center mb-4 border-b border-terminal-text/30 pb-2">
        <div className="flex gap-2 items-center">
          <div onClick={handleClose} title="Close System" className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.6)] cursor-pointer hover:bg-red-400" />
          <div onClick={handleMinimize} title="Minimize Terminal" className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_8px_rgba(234,179,8,0.6)] cursor-pointer hover:bg-yellow-400" />
          <div onClick={handleMaximize} title="Toggle Fullscreen" className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.6)] cursor-pointer hover:bg-green-400" />
          <span className="ml-2 font-mono text-sm opacity-50 tracking-widest hidden sm:inline-block select-none">RETRO_OS_v1.0.4</span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); setVolumeLevel(volumeLevel > 0 ? 0 : 1); }}
          className="font-mono text-xs px-2 py-1 border border-terminal-text/50 text-terminal-text/80 rounded hover:bg-terminal-text/10 transition-colors"
        >
          {volumeLevel > 0 ? '🔊 AUDIO: ON' : '🔇 AUDIO: OFF'}
        </button>
      </div>

      <div className="flex flex-col gap-1 mb-6 opacity-80 pointer-events-none select-none text-sm md:text-base">
        {bootText.map((text, i) => (
          <div key={i} className="animate-in fade-in duration-300">{text}</div>
        ))}
      </div>

      {!isBooting && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          <pre className="text-emerald-400 font-bold mb-8 text-xs sm:text-sm md:text-base leading-tight tracking-tighter drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
            {ASCII_LOGO}
          </pre>
          
          <div className="mb-8 flex flex-wrap gap-3">
            {helperTokens.map(cmd => (
              <button 
                key={cmd}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  executeToken(cmd); 
                  document.getElementById('terminal-main-input')?.focus();
                }}
                className="px-4 py-1.5 border border-terminal-text/40 bg-terminal-text/5 hover:bg-terminal-text hover:text-terminal-bg transition-all active:scale-95 active:bg-emerald-600 uppercase tracking-wider text-xs md:text-sm font-bold shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
              >
                [{cmd}]
              </button>
            ))}
          </div>

          <HistoryLog history={history} bootText={bootText} executeToken={executeToken} theme={theme} />

          <InputLine 
            inputValue={inputValue}
            setInputValue={setInputValue}
            executeCommand={executeCommand}
            autocompleteOptions={autocompleteOptions}
            theme={theme}
            commandHistory={commandHistory}
            historyPointer={historyPointer}
            setHistoryPointer={setHistoryPointer}
            playClick={playClick}
            isVoiceModeActive={isVoiceModeActive}
          />
        </div>
      )}
    </div>
    </>
  );
}
