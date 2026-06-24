import React, { useEffect, useRef, useState } from 'react';
import { HistoryNode } from '../hooks/useTerminal';
import { COMMAND_REGISTRY, ThemeConfig } from '../config/commands';

const AsciiMirror = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let animationId: number;
    let stream: MediaStream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        const chars = ' @%#*+=-:. ';
        
        const draw = () => {
          if (videoRef.current && canvasRef.current && preRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              const width = 80;
              const height = 60;
              canvasRef.current.width = width;
              canvasRef.current.height = height;
              
              ctx.drawImage(videoRef.current, 0, 0, width, height);
              const data = ctx.getImageData(0, 0, width, height).data;
              
              let asciiStr = '';
              for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                  const idx = (i * width + j) * 4;
                  const r = data[idx];
                  const g = data[idx + 1];
                  const b = data[idx + 2];
                  const brightness = (r + g + b) / 3;
                  const charIdx = Math.floor((brightness / 255) * (chars.length - 1));
                  asciiStr += chars[charIdx];
                }
                asciiStr += '\n';
              }
              preRef.current.textContent = asciiStr;
            }
          }
          animationId = requestAnimationFrame(draw);
        };
        draw();
      } catch (err) {
        setError('[SYSTEM ERROR]: Optical hardware not detected or access denied by user sandbox.');
      }
    };
    startCamera();

    return () => {
      cancelAnimationFrame(animationId);
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  if (error) return <div className="text-red-500 font-bold my-4 animate-pulse">{error}</div>;

  return (
    <div className="my-4 border border-emerald-500/30 p-2 rounded inline-block bg-black">
      <div className="text-emerald-500/50 text-xs mb-2 border-b border-emerald-500/30 pb-1 uppercase tracking-widest">Live Optical Feed [mirror.sys]</div>
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />
      <pre ref={preRef} className="font-mono text-[6px] md:text-[8px] leading-[6px] md:leading-[8px] tracking-widest text-emerald-400 overflow-hidden break-all whitespace-pre"></pre>
    </div>
  );
};

interface HistoryLogProps {
  history: HistoryNode[];
  bootText: string[];
  executeToken: (cmd: string) => void;
  theme: ThemeConfig;
}

export default function HistoryLog({ history, bootText, executeToken, theme }: HistoryLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, bootText]);

  const renderNode = (node: HistoryNode) => {
    switch (node.type) {
      case 'input':
        return (
          <div className="flex gap-2 items-start text-terminal-text mt-1">
            <span className="text-white/70 whitespace-nowrap">guest@retro-os:~$</span>
            <span className="break-all">{node.content}</span>
          </div>
        );
      case 'help':
        return (
          <div className="my-3 border border-terminal-text/30 p-4 rounded bg-terminal-text/5 max-w-3xl shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            <div className="grid grid-cols-[160px_1fr] gap-y-2 gap-x-4">
              <div className="font-bold border-b border-terminal-text/30 pb-1 text-white">COMMAND</div>
              <div className="font-bold border-b border-terminal-text/30 pb-1 text-white">OPERATION</div>
              {COMMAND_REGISTRY.help.map(h => (
                <React.Fragment key={h.cmd}>
                  <div className="text-emerald-300">{h.cmd}</div>
                  <div className="text-terminal-text/80">{h.desc}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="my-3 italic text-terminal-text/80 leading-relaxed max-w-3xl pl-4 border-l-2 border-emerald-500/50">
            <span className="block mb-2 font-bold text-white not-italic tracking-wide">{COMMAND_REGISTRY.profile.header}</span>
            {COMMAND_REGISTRY.profile.body}
          </div>
        );
      case 'skills':
        return (
          <div className="my-3 max-w-3xl pl-4 border-l-2 border-cyan-500/50 text-terminal-text/90 font-mono text-sm md:text-base">
            <div className="hidden sm:block truncate">{theme.divider}</div>
            <div className="font-bold text-cyan-400">{COMMAND_REGISTRY.skills.header}</div>
            <div className="hidden sm:block truncate">{theme.divider}</div>
            <div className="flex flex-col gap-1 mt-2 sm:mt-0">
              {COMMAND_REGISTRY.skills.list.map(skill => (
                <div key={skill.category} className="flex">
                  <span className="font-bold text-white whitespace-pre">{"• "}{skill.category.padEnd(15, ' ')}{":: "}</span>
                  <span className="break-words">{skill.tools}</span>
                </div>
              ))}
            </div>
            <div className="hidden sm:block truncate">{theme.divider}</div>
          </div>
        );
      case 'projects':
        return (
          <div className="my-3 flex flex-col gap-6 max-w-4xl pl-4 border-l-2 border-purple-500/50 font-mono text-sm md:text-base">
            {COMMAND_REGISTRY.projects.map(proj => (
              <div key={proj.id}>
                <div className="font-bold text-purple-400 mb-1 tracking-wide">NODE {proj.id}: {proj.title}</div>
                <div className="text-white/80">{proj.status}</div>
                <div className="text-white/80 mb-2">{proj.progress}</div>
                
                <div className="flex flex-col gap-1">
                  {proj.modules.map((mod, i) => (
                    <div key={i} className="mb-2">
                      {mod.name !== 'Operations Bullet Matrix:' && (
                        <div className="text-white">├─ {mod.name}</div>
                      )}
                      {mod.name === 'Operations Bullet Matrix:' && (
                        <div className="text-white mb-1">{mod.name}</div>
                      )}
                      {mod.bullets.map((bullet, j) => (
                        <div key={j} className="text-terminal-text/80 ml-1">
                          └─ {bullet}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case 'theme':
        return <div className="my-2 italic text-terminal-text font-bold">{node.content}</div>;
      case 'error':
        return (
          <div className="my-2 text-red-500 font-bold bg-red-900/20 border border-red-500/50 p-3 rounded max-w-3xl">
            {node.content}
          </div>
        );
      case 'sudo-init':
        return <div className="my-2 text-yellow-400 font-bold">{node.content}</div>;
      case 'sudo-progress':
        return (
          <div className="my-1 text-terminal-text/80">
            {node.content} [ {node.bar} ] {node.progress}%
          </div>
        );
      case 'sudo-success':
        return (
          <div className="my-4 text-emerald-400 font-bold border border-emerald-500/50 p-4 rounded bg-emerald-900/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <pre className="text-xs sm:text-sm mb-2 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]">
              {COMMAND_REGISTRY.sudo.badge}
            </pre>
            {COMMAND_REGISTRY.sudo.successMessage}
          </div>
        );
      case 'weather-init':
        return <div className="my-2 text-blue-400 font-bold animate-pulse">{node.content}</div>;
      case 'weather-error':
        return (
          <div className="my-2 text-red-500 font-bold bg-red-900/10 border border-red-500/30 p-2 inline-block rounded max-w-3xl">
            {node.content}
          </div>
        );
      case 'weather-result':
        const w = node.weatherData;
        if (!w) return null;
        return (
          <div className="my-3 text-blue-300 font-mono">
            <div className="truncate">{theme.divider}</div>
            <div className="font-bold text-blue-400 tracking-wide">🌍 METEO METRIC HUB // DATA RETRIEVED SUCCESSFULLY</div>
            <div className="truncate">{theme.divider}</div>
            <div className="grid grid-cols-[140px_1fr] gap-1 mt-2">
              <div className="text-white/70">LOCATION</div>
              <div>: {w.city}</div>
              
              <div className="text-white/70">CURRENT TEMP</div>
              <div>: {w.temp}°C</div>
              
              <div className="text-white/70">CONDITIONS</div>
              <div>: {w.symbol} {w.desc}</div>
            </div>
            <div className="mt-2 truncate">{theme.divider}</div>
          </div>
        );
      case 'resume-stage':
        return <div className="my-1 text-emerald-400 font-mono text-sm md:text-base">{node.content}</div>;
      case 'tree':
        return (
          <div className="my-3 font-mono text-terminal-text/90 whitespace-pre overflow-x-auto text-sm md:text-base">
            <div>📂 rishav-rana-root/</div>
            <div> ├── <span onClick={(e) => { e.stopPropagation(); executeToken('profile.txt'); }} className="cursor-pointer hover:text-white hover:underline decoration-dashed decoration-1 underline-offset-4">📄 profile.txt</span></div>
            <div> ├── <span onClick={(e) => { e.stopPropagation(); executeToken('skills.sys'); }} className="cursor-pointer hover:text-white hover:underline decoration-dashed decoration-1 underline-offset-4">📄 skills.sys</span></div>
            <div> └── 📂 enterprise-projects/</div>
            <div>      ├── <span onClick={(e) => { e.stopPropagation(); executeToken('tcdam-platform.log'); }} className="cursor-pointer hover:text-white hover:underline decoration-dashed decoration-1 underline-offset-4">📄 tcdam-platform.log</span></div>
            <div>      └── <span onClick={(e) => { e.stopPropagation(); executeToken('skyworld-hub.log'); }} className="cursor-pointer hover:text-white hover:underline decoration-dashed decoration-1 underline-offset-4">📄 skyworld-hub.log</span></div>
          </div>
        );
      case 'themes-catalog':
        return (
          <div className="my-3 max-w-3xl pl-4 border-l-2 border-emerald-500/50 text-terminal-text/90 font-mono text-sm md:text-base">
            <div className="font-bold text-white mb-2 tracking-wide">--- COSMETIC CATALOG DICTIONARY ---</div>
            <div className="flex flex-col gap-1">
              {COMMAND_REGISTRY.themesCatalog.map(t => (
                <div key={t.name} className="flex">
                  <span className="font-bold text-emerald-400 whitespace-pre">{"• "}{t.name.padEnd(15, ' ')}{":: "}</span>
                  <span className="break-words max-w-[calc(100%-120px)]">{t.desc}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-white/50 italic text-xs sm:text-sm">Execute 'theme [name]' to engage skin override.</div>
          </div>
        );
      case 'diagnostic':
        const d = node.diagnosticData;
        if (!d) return null;
        return (
          <div className="my-3 font-mono text-terminal-text/90 text-sm md:text-base">
            <div className="truncate">{theme.divider}</div>
            <div className="font-bold text-white tracking-wide">🖥️ CORE SYSTEM DIAGNOSTIC ANALYSIS COMPLETE</div>
            <div className="truncate">{theme.divider}</div>
            <div className="grid grid-cols-[180px_1fr] gap-1 mt-2">
              <div className="text-white/70">CURRENT TIMESTAMP</div>
              <div>: {d.timestamp}</div>
              
              <div className="text-white/70">HOST PLATFORM NODE</div>
              <div>: {d.platform}</div>
              
              <div className="text-white/70">RESOLUTION PROFILE</div>
              <div>: {d.res} px</div>

              <div className="text-white/70">NETWORK CONCURRENCY</div>
              <div>: {d.threads} Core Threads Available</div>

              <div className="text-white/70">LATENCY METRIC</div>
              <div>: Network Intercept Channels Operational (OK)</div>
            </div>
            <div className="mt-2 truncate">{theme.divider}</div>
          </div>
        );
      case 'telemetry-init':
        return <div className="my-1 animate-pulse text-amber-400 font-mono text-sm md:text-base">{node.content}</div>;
      case 'telemetry-error':
        return <div className="my-1 text-red-500 font-mono text-sm md:text-base">{node.content}</div>;
      case 'telemetry-result':
        const t = node.telemetryData;
        if (!t) return null;
        return (
          <div className="my-3 font-mono text-terminal-text/90 text-sm md:text-base">
            <div className="truncate">{theme.divider}</div>
            <div className="font-bold text-white tracking-wide">🛰️ LOCAL NODE INTERCEPT ANALYSIS COMPLETE</div>
            <div className="truncate">{theme.divider}</div>
            <div className="grid grid-cols-[180px_1fr] gap-1 mt-2">
              <div className="text-white/70">SCAN TIMESTAMP</div>
              <div>: {t.timestamp}</div>
              
              <div className="text-white/70">NODE POSITION</div>
              <div>: {t.location}</div>

              <div className="text-white/70">COORDINATES</div>
              <div>: {t.coords}</div>
              
              <div className="text-white/70">ENERGY MATRIX</div>
              <div>: {t.battery}</div>

              <div className="text-white/70">PIPELINE FLOW</div>
              <div>: {t.network}</div>
            </div>
            <div className="mt-2 truncate">{theme.divider}</div>
          </div>
        );
      case 'matrix-row':
        const isSuccess = node.content?.includes('[SYSTEM]');
        return (
          <div className={`my-0.5 font-mono text-sm md:text-base ${isSuccess ? 'text-red-500 font-bold mt-2' : 'text-emerald-500/80 break-all'}`}>
            {node.content}
          </div>
        );
      case 'system-msg':
        return <div className="my-1 text-emerald-400 font-mono text-sm md:text-base whitespace-pre-wrap">{node.content}</div>;
      case 'classified':
        return (
          <div className="my-4 p-4 border border-red-500/50 bg-red-900/10 rounded font-mono shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <div className="text-red-500 font-bold mb-3 animate-pulse">{COMMAND_REGISTRY.classified.header}</div>
            <div className="space-y-2 text-red-400/90 text-sm md:text-base">
              {COMMAND_REGISTRY.classified.body.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        );
      case 'mirror':
        return <AsciiMirror />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col text-sm md:text-base">
      {history.map(node => (
        <div 
          key={node.id} 
          className={`mb-2 animate-in fade-in duration-300 ${theme.historyFade ? 'animate-singularity-fade' : ''}`}
        >
          {renderNode(node)}
        </div>
      ))}
      <div ref={bottomRef} className="h-8" />
    </div>
  );
}
