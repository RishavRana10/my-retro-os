import React, { useRef, useEffect } from 'react';
import { ThemeConfig } from '../config/commands';

interface InputLineProps {
  inputValue: string;
  setInputValue: (val: string) => void;
  executeCommand: (cmd: string) => void;
  autocompleteOptions: string[];
  theme: ThemeConfig;
  commandHistory: string[];
  historyPointer: number;
  setHistoryPointer: React.Dispatch<React.SetStateAction<number>>;
  playClick: (isEnter?: boolean) => void;
  isVoiceModeActive?: boolean;
}

export default function InputLine({ 
  inputValue, setInputValue, executeCommand, autocompleteOptions, theme, 
  commandHistory, historyPointer, setHistoryPointer, playClick, isVoiceModeActive
}: InputLineProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const matchedGhost = inputValue 
    ? autocompleteOptions.find(opt => opt.startsWith(inputValue.toLowerCase())) 
    : undefined;

  return (
    <div className="flex gap-2 items-start mt-2 text-sm md:text-base">
      <span className="text-white/70 whitespace-nowrap pt-0.5 flex items-center">
        {isVoiceModeActive && <span className="mr-2 animate-pulse">🎙️</span>}
        {theme.promptAddon && <span className="text-yellow-500 mr-2">{theme.promptAddon}</span>}
        guest@retro-os:~$
      </span>
      <div className="flex-1 break-all relative min-h-[1.5rem] pt-0.5">
        <span className="relative z-10">{inputValue}</span>
        {matchedGhost && (
          <span className="absolute left-0 top-0 pt-0.5 opacity-30 pointer-events-none z-0">
            <span className="opacity-0">{inputValue}</span>
            <span>{matchedGhost.slice(inputValue.length)}</span>
          </span>
        )}
        {theme.cursor === '█' ? (
           <span className="animate-flash inline-block w-2.5 h-[1.1em] bg-terminal-text align-middle ml-0.5 relative z-10"></span>
        ) : (
           <span className="animate-flash inline-block align-middle ml-0.5 relative z-10 text-xl leading-none font-sans">{theme.cursor}</span>
        )}
      </div>
      <input 
        ref={inputRef}
        id="terminal-main-input"
        type="text"
        className="opacity-0 absolute w-0 h-0 p-0 m-0 border-none"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          playClick(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            const next = Math.min(historyPointer + 1, commandHistory.length - 1);
            if (next >= 0) {
              setHistoryPointer(next);
              setInputValue(commandHistory[commandHistory.length - 1 - next]);
            }
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = historyPointer - 1;
            setHistoryPointer(next < -1 ? -1 : next);
            if (next >= 0) {
              setInputValue(commandHistory[commandHistory.length - 1 - next]);
            } else {
              setInputValue('');
            }
          } else if (e.key === 'Enter') {
            playClick(true);
            executeCommand(inputValue);
          } else if (e.key === 'Tab') {
            e.preventDefault();
            if (matchedGhost) {
              setInputValue(matchedGhost);
            }
          }
        }}
        autoComplete="off"
        spellCheck="false"
        autoFocus
      />
    </div>
  );
}
