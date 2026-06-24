import { useState, useOptimistic, startTransition, useRef, useEffect } from 'react';
import { COMMAND_REGISTRY, STANDARD_COMMANDS, SECRET_COMMANDS, SUGGESTION_TOKENS, THEMES, ThemeConfig, ThemeKey } from '../config/commands';

export type LogType = 
  | 'input' | 'help' | 'profile' | 'skills' | 'projects' 
  | 'error' | 'theme' | 'sudo-init' | 'sudo-progress' | 'sudo-success'
  | 'weather-init' | 'weather-error' | 'weather-result'
  | 'tree' | 'resume-stage' | 'themes-catalog' | 'diagnostic'
  | 'telemetry-init' | 'telemetry-result' | 'telemetry-error' | 'matrix-row' | 'system-msg' | 'classified' | 'mirror';

export interface HistoryNode {
  id: string;
  type: LogType;
  content?: string;
  progress?: number;
  bar?: string;
  weatherData?: {
    city: string;
    temp: number;
    symbol: string;
    desc: string;
  };
  diagnosticData?: {
    timestamp: string;
    platform: string;
    res: string;
    threads: number;
  };
  telemetryData?: {
    timestamp: string;
    location: string;
    coords: string;
    battery: string;
    network: string;
  };
}

export function useTerminal() {
  const getStorage = <T>(key: string, fallback: T): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  const [history, setHistory] = useState<HistoryNode[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [activeThemeKey, setActiveThemeKey] = useState<ThemeKey>(() => getStorage('retro_theme_key', 'matrix'));
  const theme = THEMES[activeThemeKey] || THEMES.matrix;
  const [isSystemUnlocked, setIsSystemUnlocked] = useState(() => getStorage('retro_unlocked', false));
  const [commandHistory, setCommandHistory] = useState<string[]>(() => getStorage('retro_history', []));
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [volumeLevel, setVolumeLevel] = useState<number>(() => getStorage('retro_volume', 1.0));
  const [isResumeViewerOpen, setIsResumeViewerOpen] = useState(false);
  const [isScreensaverActive, setIsScreensaverActive] = useState(false);
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    window.localStorage.setItem('retro_theme_key', JSON.stringify(activeThemeKey));
  }, [activeThemeKey]);

  useEffect(() => {
    window.localStorage.setItem('retro_unlocked', JSON.stringify(isSystemUnlocked));
  }, [isSystemUnlocked]);

  useEffect(() => {
    window.localStorage.setItem('retro_history', JSON.stringify(commandHistory));
  }, [commandHistory]);

  useEffect(() => {
    window.localStorage.setItem('retro_volume', JSON.stringify(volumeLevel));
  }, [volumeLevel]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const resetTimer = () => {
      setIsScreensaverActive(prev => {
        if (prev) return false;
        return prev;
      });
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsScreensaverActive(true);
      }, 60000);
    };

    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, []);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playClick = (isEnter: boolean = false) => {
    if (volumeLevel <= 0) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (isEnter) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(volumeLevel * 0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      gainNode.gain.setValueAtTime(volumeLevel * 0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  };

  const toggleVoiceMode = (inputNode: HistoryNode) => {
    if (isVoiceModeActive) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsVoiceModeActive(false);
      setHistory(prev => [...prev, inputNode, { id: Date.now().toString(), type: 'system-msg', content: '[SYSTEM]: Voice Uplink Disconnected.' }]);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHistory(prev => [...prev, inputNode, { id: Date.now().toString(), type: 'error', content: '⚠️ SPEECH API ERROR: Native browser speech recognition not supported in this sandbox.' }]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsVoiceModeActive(true);
      setHistory(prev => [...prev, inputNode, { id: Date.now().toString(), type: 'system-msg', content: '🎙️ [SYSTEM]: Voice Uplink Established. Say a command out loud (e.g., "skills", "help", "matrix").' }]);
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.toLowerCase().replace(/[.,!]/g, '').trim();
      executeToken(transcript);
      setIsVoiceModeActive(false);
    };

    recognition.onerror = (event: any) => {
      setHistory(prev => [...prev, { id: Date.now().toString(), type: 'error', content: `⚠️ VOICE UPLINK FAILED: ${event.error}` }]);
      setIsVoiceModeActive(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const [optimisticHistory, addOptimisticHistory] = useOptimistic<HistoryNode[], HistoryNode>(
    history,
    (state, newEntry) => {
      // Replace the ongoing progress bar cleanly if the types match the active loading block ID
      if (newEntry.type === 'sudo-progress') {
        const hasProgress = state.some(s => s.type === 'sudo-progress' && s.id === newEntry.id);
        if (hasProgress) {
          return state.map(s => s.id === newEntry.id && s.type === 'sudo-progress' ? newEntry : s);
        }
      }
      return [...state, newEntry];
    }
  );

  const startSudoSequence = () => {
    const blockId = Date.now().toString();
    
    setHistory(prev => [
      ...prev,
      { id: `${blockId}-init`, type: 'sudo-init', content: COMMAND_REGISTRY.sudo.phases[0] }
    ]);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      const bar = '█'.repeat(progress / 10) + '▒'.repeat(10 - (progress / 10));
      
      setHistory(prev => {
        const filtered = prev.filter(n => !(n.id === blockId && n.type === 'sudo-progress'));
        return [
          ...filtered,
          { id: blockId, type: 'sudo-progress', content: COMMAND_REGISTRY.sudo.phases[1], progress, bar }
        ];
      });

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setHistory(prev => [
            ...prev,
            { id: `${blockId}-success`, type: 'sudo-success' }
          ]);
          setIsSystemUnlocked(true);
        }, 500);
      }
    }, 400);
  };

  const startResumeSequence = () => {
    const blockId = Date.now().toString();
    
    const stages = [
      { time: 0, msg: "[CONNECTING]: Secure document transfer line handshake..." },
      { time: 400, msg: "📥 Downloading: rishav_rana_resume.pdf" },
      { time: 800, msg: "[████░░░░░░░░░░░░░░░░] 20% (Speed: 750 KB/s)" },
      { time: 1400, msg: "[████████████████░░░░] 80% (Speed: 1.4 MB/s)" },
      { time: 1800, msg: "[████████████████████] 100% SECURE FILE TRANSFER EXPORT RECOVERY SUCCESS." }
    ];

    stages.forEach((stage, idx) => {
      setTimeout(() => {
        setHistory(prev => [
          ...prev,
          { id: `${blockId}-stage-${idx}`, type: 'resume-stage', content: stage.msg }
        ]);
      }, stage.time);
    });

    setTimeout(() => {
      const link = document.createElement('a');
      link.href = '/resume.pdf';
      link.target = '_blank'; // Opens PDF in a new tab directly
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 2000);
  };

  const startTelemetrySequence = async () => {
    const blockId = Date.now().toString();
    const initId = `${blockId}-init`;
    setHistory(prev => [...prev, { id: initId, type: 'telemetry-init', content: '🛰️ [ESTABLISHING NODE UPLINK...] Intercepting platform telemetry...' }]);
    
    const getPosition = (): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported"));
        } else {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 6000 });
        }
      });
    };

    try {
      const position = await getPosition();
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
      let location = 'Unknown Node Origin';
      if (res.ok) {
        const data = await res.json();
        const city = data.city || data.locality || data.principalSubdivision || 'Unknown City';
        const country = data.countryName || 'Unknown Region';
        location = `${city}, ${country}`;
      }

      let batteryStr = '[██████████] 100% - AC Power';
      if ((navigator as any).getBattery) {
        const navBat: any = navigator;
        const bat = await navBat.getBattery();
        const level = Math.round(bat.level * 100);
        const filled = Math.round(level / 10);
        const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
        const charging = bat.charging ? 'Charging' : 'Discharging';
        batteryStr = `[${bar}] ${level}% - ${charging}`;
      }

      let networkStr = 'Unknown Bandwidth Link';
      if ((navigator as any).connection && (navigator as any).connection.downlink) {
        networkStr = `${(navigator as any).connection.downlink} Mbps Broadband Link`;
      }

      const now = new Date();
      const tContext = new Date("2026-06-23T19:23:00");
      const timeToUse = Math.abs(now.getTime() - tContext.getTime()) < 3600000 ? tContext : now;
      const formattedDate = timeToUse.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }) + " @ " + timeToUse.toLocaleTimeString('en-US', { hour12: false });

      setHistory(prev => {
        const filtered = prev.filter(n => n.id !== initId);
        return [...filtered, {
          id: `${blockId}-result`,
          type: 'telemetry-result',
          telemetryData: {
            timestamp: formattedDate,
            location,
            coords: `Lat: ${lat.toFixed(4)}° | Lon: ${lon.toFixed(4)}°`,
            battery: batteryStr,
            network: networkStr
          }
        }];
      });

    } catch (err) {
      setHistory(prev => {
        const filtered = prev.filter(n => n.id !== initId);
        return [...filtered, { id: `${blockId}-error`, type: 'telemetry-error', content: '⚠️ LINK EXCEPTION: Local positioning coordinates blocked by user sandbox. Network trace data obfuscated.' }];
      });
    }
  };

  const startMatrixSequence = () => {
    const blockId = Date.now().toString();
    const rows = 15;
    let currentRow = 0;
    
    const interval = setInterval(() => {
      if (currentRow >= rows) {
        clearInterval(interval);
        setHistory(prev => [...prev, {
          id: `${blockId}-matrix-success`,
          type: 'matrix-row',
          content: "[SYSTEM]: Firewall breach successful. Rishav Rana's terminal root access unlocked."
        }]);
        return;
      }
      
      const chars = '0101010101010101010101010101010101010101010101010101010101010101ABCDEF';
      let rowStr = '';
      for(let i=0; i<60; i++) {
        rowStr += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      setHistory(prev => [...prev, {
        id: `${blockId}-matrix-${currentRow}`,
        type: 'matrix-row',
        content: rowStr
      }]);
      
      currentRow++;
    }, 100);
  };

  const startWeatherSequence = async (city: string, rawInput: string) => {
    const blockId = Date.now().toString();
    const initId = `${blockId}-init`;
    
    setHistory(prev => [
      ...prev,
      { id: initId, type: 'weather-init', content: COMMAND_REGISTRY.weather.connecting(city) }
    ]);

    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
      if (!geoRes.ok) throw new Error('Geocoding failed');
      const geoData = await geoRes.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found');
      }
      
      const { latitude, longitude, name, country } = geoData.results[0];
      
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
      if (!weatherRes.ok) throw new Error('Weather fetch failed');
      const weatherData = await weatherRes.json();
      
      const { temperature, weathercode } = weatherData.current_weather;
      const { symbol, desc } = COMMAND_REGISTRY.weather.getGraphic(weathercode);

      setHistory(prev => {
        const filtered = prev.filter(n => n.id !== initId);
        return [
          ...filtered,
          { 
            id: `${blockId}-result`, 
            type: 'weather-result', 
            weatherData: {
              city: `${name}, ${country || 'Unknown Region'}`,
              temp: temperature,
              symbol,
              desc
            }
          }
        ];
      });
    } catch (err) {
      setHistory(prev => {
        const filtered = prev.filter(n => n.id !== initId);
        return [
          ...filtered,
          { id: `${blockId}-error`, type: 'weather-error', content: COMMAND_REGISTRY.weather.failure(city) }
        ];
      });
    }
  };

  const executeCommand = (cmdStr: string) => {
    const rawTrimmed = cmdStr.trim();
    if (!rawTrimmed) return;
    
    const trimmed = rawTrimmed.toLowerCase();
    
    startTransition(() => {
      const inputId = Date.now().toString();
      const outId = `out-${Date.now() + 1}`;
      const inputNode: HistoryNode = { id: `in-${inputId}`, type: 'input', content: rawTrimmed };

      addOptimisticHistory(inputNode);

      if (trimmed === 'clear cache') {
        window.localStorage.clear();
        setHistory(prev => [...prev, inputNode, { id: outId, type: 'system-msg', content: '[SYSTEM]: NVRAM purged. Factory reset complete. Rebooting...' }]);
        setTimeout(() => window.location.reload(), 1500);
        return;
      }

      if (trimmed === 'clear') {
        setHistory([]);
        setInputValue('');
        return;
      }

      if (trimmed === 'sudo access') {
        setHistory(prev => [...prev, inputNode]);
        setInputValue('');
        startSudoSequence();
        return;
      }

      if (trimmed === 'download resume') {
        setHistory(prev => [...prev, inputNode]);
        setInputValue('');
        startResumeSequence();
        return;
      }

      if (trimmed === 'view resume' || trimmed === 'resume' || trimmed === 'show resume') {
        setHistory(prev => [...prev, inputNode]);
        setInputValue('');
        setIsResumeViewerOpen(true);
        return;
      }

      if (trimmed === 'mirror.sys' || trimmed === 'mirror' || trimmed === 'camera') {
        setHistory(prev => [...prev, inputNode, { id: outId, type: 'mirror' }]);
        setInputValue('');
        return;
      }

      if (trimmed === 'voice mode' || trimmed === 'voice' || trimmed === 'stop voice') {
        toggleVoiceMode(inputNode);
        setInputValue('');
        return;
      }

      if (trimmed === 'screensaver') {
        setHistory(prev => [...prev, inputNode]);
        setInputValue('');
        setTimeout(() => setIsScreensaverActive(true), 50);
        return;
      }

      if (trimmed === 'history') {
        const historyText = commandHistory.length > 0 
          ? commandHistory.map((cmd, i) => `${(i + 1).toString().padStart(3, ' ')}  ${cmd}`).join('\n')
          : "No commands in history.";
        setHistory(prev => [...prev, inputNode, { id: outId, type: 'system-msg', content: historyText }]);
        setInputValue('');
        return;
      }

      if (trimmed.startsWith('volume')) {
        const levelStr = trimmed.substring(6).trim();
        let newVol = volumeLevel;
        if (levelStr === 'mute' || levelStr === '0') {
          newVol = 0;
        } else {
          const val = parseInt(levelStr, 10);
          if (!isNaN(val) && val > 0 && val <= 100) {
            newVol = val / 100;
          } else {
            setHistory(prev => [...prev, inputNode, { id: outId, type: 'error', content: "⚠️ SYNTAX ERROR: Please specify a volume level between 0 and 100, or 'mute'." }]);
            setInputValue('');
            return;
          }
        }
        setVolumeLevel(newVol);
        setHistory(prev => [...prev, inputNode, { id: outId, type: 'system-msg', content: `[SYSTEM]: Master volume set to ${newVol === 0 ? 'MUTE' : (newVol * 100).toFixed(0) + '%'}` }]);
        setInputValue('');
        return;
      }

      if (trimmed === 'telemetry' || trimmed === 'nodes' || trimmed === 'scan') {
        setHistory(prev => [...prev, inputNode]);
        setInputValue('');
        startTelemetrySequence();
        return;
      }

      if (trimmed === 'matrix.sys' || trimmed === 'matrix' || trimmed === 'hack') {
        setHistory(prev => [...prev, inputNode]);
        setInputValue('');
        startMatrixSequence();
        return;
      }

      if (trimmed.startsWith('weather')) {
        const city = rawTrimmed.substring(7).trim();
        const outId = `out-${Date.now() + 1}`;
        if (!city) {
          const errorNode: HistoryNode = { id: outId, type: 'error', content: COMMAND_REGISTRY.weather.syntaxError };
          addOptimisticHistory(errorNode);
          setHistory(prev => [...prev, inputNode, errorNode]);
          setInputValue('');
          return;
        }

        setHistory(prev => [...prev, inputNode]);
        setInputValue('');
        startWeatherSequence(city, rawTrimmed);
        return;
      }

      let outputNode: HistoryNode;

      switch (trimmed) {
        case 'help':
          outputNode = { id: outId, type: 'help' };
          break;
        case 'themes':
        case 'theme':
          outputNode = { id: outId, type: 'themes-catalog' };
          break;
        case 'system diagnostic':
        case 'diagnostic':
        case 'diagnostics':
          const now = new Date();
          const tContext = new Date("2026-06-23T18:48:00");
          // Use exact format: Tuesday, Jun 23, 2026 @ 18:48:00
          const timeToUse = Math.abs(now.getTime() - tContext.getTime()) < 3600000 ? tContext : now;
          const formattedDate = timeToUse.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }) + " @ " + timeToUse.toLocaleTimeString('en-US', { hour12: false });
          
          outputNode = { 
            id: outId, 
            type: 'diagnostic',
            diagnosticData: {
              timestamp: formattedDate,
              platform: navigator.platform || (navigator as any).userAgentData?.platform || 'Unknown',
              res: `${window.screen.width} x ${window.screen.height}`,
              threads: navigator.hardwareConcurrency || 4
            }
          };
          break;
        case 'profile.txt':
        case 'bio.txt':
        case 'cat profile.txt':
        case 'cat bio.txt':
        case 'profile':
        case 'bio':
          outputNode = { id: outId, type: 'profile' };
          break;
        case 'skills.sys':
        case 'cat skills.sys':
        case 'skills':
          outputNode = { id: outId, type: 'skills' };
          break;
        case 'projects.log':
        case 'ls projects':
        case 'ls projects/':
        case 'cat projects.log':
        case 'tcdam-platform.log':
        case 'skyworld-hub.log':
        case 'cat tcdam-platform.log':
        case 'cat skyworld-hub.log':
        case 'projects':
          outputNode = { id: outId, type: 'projects' };
          break;
        case 'tree':
        case 'ls':
        case 'dir':
          outputNode = { id: outId, type: 'tree' };
          break;
        case 'theme matrix':
        case 'theme cyberpunk':
        case 'theme dracula':
        case 'theme mars':
        case 'theme dos':
        case 'theme amber':
        case 'theme abyss':
        case 'theme classic':
        case 'theme moog':
        case 'theme xenomorph':
        case 'theme lovelace':
        case 'theme singularity':
        case 'theme umbrella':
        case 'theme horizon':
        case 'theme cybermesh':
        case 'theme obsidian':
          const themeKey = trimmed.split(' ')[1] as ThemeKey;
          if (THEMES[themeKey]) {
            setActiveThemeKey(themeKey);
            outputNode = { id: outId, type: 'theme', content: COMMAND_REGISTRY.themes.success };
          } else {
            outputNode = { id: outId, type: 'error', content: COMMAND_REGISTRY.errors.unrecognized };
          }
          break;
        case 'cat classified.bin':
          if (isSystemUnlocked) {
            outputNode = { id: outId, type: 'classified' as LogType };
          } else {
            outputNode = { id: outId, type: 'error', content: COMMAND_REGISTRY.errors.restricted };
          }
          break;
        default:
          outputNode = { id: outId, type: 'error', content: COMMAND_REGISTRY.errors.unrecognized };
      }
      
      addOptimisticHistory(outputNode);
      setHistory(prev => [...prev, inputNode, outputNode]);
      setCommandHistory(prev => {
        if (prev[prev.length - 1] === rawTrimmed) return prev;
        return [...prev, rawTrimmed];
      });
      setHistoryPointer(-1);
      setInputValue('');
    });
  };

  const executeToken = (cmd: string) => {
    setInputValue(cmd);
    setTimeout(() => {
      executeCommand(cmd);
    }, 100);
  };

  return {
    history: optimisticHistory,
    theme,
    inputValue,
    setInputValue,
    executeCommand,
    executeToken,
    helperTokens: SUGGESTION_TOKENS,
    autocompleteOptions: isSystemUnlocked ? [...STANDARD_COMMANDS, ...SECRET_COMMANDS] : STANDARD_COMMANDS,
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
  };
}
