import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Move,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Footprints,
  Bike,
  Car,
  Minimize2,
  Maximize2,
  Compass,
} from 'lucide-react';
import { SpeedMode } from '../types';

interface FloatingJoystickProps {
  onVectorChange: (vector: { x: number; y: number } | null) => void;
  speedMode: SpeedMode;
  onSpeedModeChange: (mode: SpeedMode) => void;
  currentSpeed: number;
  bearing: number;
  opacity: number;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const FloatingJoystick: React.FC<FloatingJoystickProps> = ({
  onVectorChange,
  speedMode,
  onSpeedModeChange,
  currentSpeed,
  bearing,
  opacity,
  isOpen,
  onToggleOpen,
}) => {
  // Widget position (starts at bottom right, draggable)
  const [position, setPosition] = useState({ x: 24, y: 140 }); // offset from bottom-right
  const [isDraggingWidget, setIsDraggingWidget] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });

  // Analog thumb state
  const [stickOffset, setStickOffset] = useState({ x: 0, y: 0 });
  const [isStickActive, setIsStickActive] = useState(false);
  const stickCenterRef = useRef<HTMLDivElement>(null);

  const MAX_RADIUS = 46; // maximum joystick radius in px

  // Widget dragging handlers
  const handleWidgetDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsDraggingWidget(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  useEffect(() => {
    const handleWidgetDragMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingWidget) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = dragStartRef.current.mouseX - clientX;
      const deltaY = dragStartRef.current.mouseY - clientY;

      // Ensure it stays within viewport bounds
      const newX = Math.max(12, Math.min(window.innerWidth - 220, dragStartRef.current.posX + deltaX));
      const newY = Math.max(80, Math.min(window.innerHeight - 260, dragStartRef.current.posY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handleWidgetDragEnd = () => {
      setIsDraggingWidget(false);
    };

    if (isDraggingWidget) {
      window.addEventListener('mousemove', handleWidgetDragMove);
      window.addEventListener('mouseup', handleWidgetDragEnd);
      window.addEventListener('touchmove', handleWidgetDragMove, { passive: false });
      window.addEventListener('touchend', handleWidgetDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleWidgetDragMove);
      window.removeEventListener('mouseup', handleWidgetDragEnd);
      window.removeEventListener('touchmove', handleWidgetDragMove);
      window.removeEventListener('touchend', handleWidgetDragEnd);
    };
  }, [isDraggingWidget]);

  // Analog stick handlers
  const updateStickPosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!stickCenterRef.current) return;
      const rect = stickCenterRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = clientX - centerX;
      let dy = clientY - centerY;

      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > MAX_RADIUS) {
        dx = (dx / dist) * MAX_RADIUS;
        dy = (dy / dist) * MAX_RADIUS;
      }

      setStickOffset({ x: dx, y: dy });

      // Inverted Y: screen down is south, screen up is north
      const normX = dx / MAX_RADIUS;
      const normY = -dy / MAX_RADIUS; // positive is North
      onVectorChange({ x: normX, y: normY });
    },
    [onVectorChange]
  );

  const handleStickStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsStickActive(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    updateStickPosition(clientX, clientY);
  };

  useEffect(() => {
    const handleStickMove = (e: MouseEvent | TouchEvent) => {
      if (!isStickActive) return;
      if ('touches' in e && e.cancelable) {
        e.preventDefault();
      }
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      updateStickPosition(clientX, clientY);
    };

    const handleStickEnd = () => {
      if (!isStickActive) return;
      setIsStickActive(false);
      setStickOffset({ x: 0, y: 0 });
      onVectorChange(null);
    };

    if (isStickActive) {
      window.addEventListener('mousemove', handleStickMove);
      window.addEventListener('mouseup', handleStickEnd);
      window.addEventListener('touchmove', handleStickMove, { passive: false });
      window.addEventListener('touchend', handleStickEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleStickMove);
      window.removeEventListener('mouseup', handleStickEnd);
      window.removeEventListener('touchmove', handleStickMove);
      window.removeEventListener('touchend', handleStickEnd);
    };
  }, [isStickActive, onVectorChange, updateStickPosition]);

  // D-Pad single tap handlers
  const handleDPadNudge = (direction: 'N' | 'S' | 'E' | 'W') => {
    let vec = { x: 0, y: 0 };
    if (direction === 'N') vec = { x: 0, y: 1 };
    if (direction === 'S') vec = { x: 0, y: -1 };
    if (direction === 'E') vec = { x: 1, y: 0 };
    if (direction === 'W') vec = { x: -1, y: 0 };

    onVectorChange(vec);
    setTimeout(() => {
      onVectorChange(null);
    }, 400);
  };

  if (!isOpen) {
    return (
      <button
        id="btn-open-joystick"
        onClick={onToggleOpen}
        className="fixed z-30 bottom-24 right-4 bg-slate-800/90 hover:bg-slate-700 text-sky-400 p-3 rounded-full shadow-2xl border border-slate-700 flex items-center justify-center transition"
        title="Open GPS Joystick"
      >
        <Move className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      id="floating-joystick-widget"
      style={{
        right: `${position.x}px`,
        bottom: `${position.y}px`,
        opacity: opacity,
      }}
      className="fixed z-30 select-none touch-none transition-opacity duration-200"
    >
      <div className="w-52 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden text-slate-100 flex flex-col items-center">
        {/* Drag Handle & Header */}
        <div
          id="joystick-drag-header"
          onMouseDown={handleWidgetDragStart}
          onTouchStart={handleWidgetDragStart}
          className="w-full px-3 py-2 bg-slate-800/80 border-b border-slate-700/50 flex items-center justify-between cursor-move"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Move className="w-3.5 h-3.5 text-sky-400" />
            <span>GPS Joystick</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              id="btn-close-joystick"
              onClick={onToggleOpen}
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition"
              title="Minimize Joystick"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Telemetry info row */}
        <div className="w-full px-3 py-1 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800">
          <div className="flex items-center gap-1 text-sky-400 font-mono">
            <span>{currentSpeed}</span>
            <span className="text-[9px]">km/h</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <Compass className="w-3 h-3 text-emerald-400" />
            <span className="font-mono">{bearing}°</span>
          </div>
        </div>

        {/* Analog Pad Area */}
        <div className="relative w-44 h-44 my-2 flex items-center justify-center">
          {/* Compass labels */}
          <span className="absolute top-1 text-[10px] font-bold text-slate-500">N</span>
          <span className="absolute bottom-1 text-[10px] font-bold text-slate-500">S</span>
          <span className="absolute left-1 text-[10px] font-bold text-slate-500">W</span>
          <span className="absolute right-1 text-[10px] font-bold text-slate-500">E</span>

          {/* D-Pad quick nudge arrows */}
          <button
            id="dpad-nudge-up"
            onClick={() => handleDPadNudge('N')}
            className="absolute top-4 p-1 rounded-full text-slate-400 hover:text-sky-400 hover:bg-slate-800/80 transition"
            title="Step North"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            id="dpad-nudge-down"
            onClick={() => handleDPadNudge('S')}
            className="absolute bottom-4 p-1 rounded-full text-slate-400 hover:text-sky-400 hover:bg-slate-800/80 transition"
            title="Step South"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            id="dpad-nudge-left"
            onClick={() => handleDPadNudge('W')}
            className="absolute left-4 p-1 rounded-full text-slate-400 hover:text-sky-400 hover:bg-slate-800/80 transition"
            title="Step West"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            id="dpad-nudge-right"
            onClick={() => handleDPadNudge('E')}
            className="absolute right-4 p-1 rounded-full text-slate-400 hover:text-sky-400 hover:bg-slate-800/80 transition"
            title="Step East"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Center base circle */}
          <div
            ref={stickCenterRef}
            onMouseDown={handleStickStart}
            onTouchStart={handleStickStart}
            className="relative w-28 h-28 rounded-full bg-slate-950/80 border-2 border-slate-700/80 shadow-inner flex items-center justify-center cursor-pointer"
          >
            {/* Concentric guide rings */}
            <div className="w-20 h-20 rounded-full border border-slate-800 pointer-events-none"></div>
            <div className="w-10 h-10 rounded-full border border-slate-800 pointer-events-none absolute"></div>

            {/* Draggable Stick Thumb */}
            <div
              style={{
                transform: `translate(${stickOffset.x}px, ${stickOffset.y}px)`,
              }}
              className={`absolute w-12 h-12 rounded-full border-2 border-white/80 shadow-lg flex items-center justify-center transition-shadow ${
                isStickActive
                  ? 'bg-sky-500 shadow-sky-500/50 scale-105'
                  : 'bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white/40"></div>
            </div>
          </div>
        </div>

        {/* Quick Speed Switcher Bar */}
        <div className="w-full px-2 py-1.5 bg-slate-800/60 border-t border-slate-800 flex items-center justify-between gap-1">
          <button
            id="btn-speed-walk"
            onClick={() => onSpeedModeChange('walk')}
            className={`flex-1 py-1 rounded text-[11px] font-medium flex items-center justify-center gap-1 transition ${
              speedMode === 'walk'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
            title="Walking (4.5 km/h)"
          >
            <Footprints className="w-3 h-3" />
            <span>Walk</span>
          </button>
          <button
            id="btn-speed-bike"
            onClick={() => onSpeedModeChange('bike')}
            className={`flex-1 py-1 rounded text-[11px] font-medium flex items-center justify-center gap-1 transition ${
              speedMode === 'bike'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
            title="Bicycle (22 km/h)"
          >
            <Bike className="w-3 h-3" />
            <span>Bike</span>
          </button>
          <button
            id="btn-speed-car"
            onClick={() => onSpeedModeChange('car')}
            className={`flex-1 py-1 rounded text-[11px] font-medium flex items-center justify-center gap-1 transition ${
              speedMode === 'car'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
            title="Drive (65 km/h)"
          >
            <Car className="w-3 h-3" />
            <span>Drive</span>
          </button>
        </div>
      </div>
    </div>
  );
};
