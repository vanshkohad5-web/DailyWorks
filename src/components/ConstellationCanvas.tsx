import React from 'react';
import { ConstellationType } from '../types.ts';

interface ConstellationCanvasProps {
  type: ConstellationType;
  color?: string;
  isDark: boolean;
}

export const ConstellationCanvas: React.FC<ConstellationCanvasProps> = ({
  type,
  color = '#38bdf8',
  isDark,
}) => {
  return (
    <div className={`relative w-full h-36 overflow-hidden rounded-t-2xl select-none transition-colors duration-300 ${
      isDark ? 'bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent' : 'bg-gradient-to-b from-indigo-50/60 via-sky-50/30 to-white/40'
    }`}>
      {/* Background Star Specks */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={`glow-${type}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity={isDark ? "0.35" : "0.2"} />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient celestial glow */}
        <circle cx={type === 'moon-orbit' ? "45%" : "55%"} cy="45%" r="70" fill={`url(#glow-${type})`} />

        {/* Subtle coordinate grid lines */}
        <line x1="0" y1="60" x2="400" y2="60" stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} strokeDasharray="3,6" />
        <line x1="120" y1="0" x2="120" y2="150" stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} strokeDasharray="3,6" />
        <line x1="260" y1="0" x2="260" y2="150" stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} strokeDasharray="3,6" />

        {type === 'moon-orbit' ? (
          /* PHARM1110 Art history style: Crescent Moon, Orbital Arcs, and connected nodes */
          <g>
            {/* Orbital Arcs */}
            <path
              d="M -20 130 Q 140 10 320 90"
              fill="none"
              stroke={isDark ? "rgba(148, 163, 184, 0.25)" : "rgba(100, 116, 139, 0.35)"}
              strokeWidth="1.2"
            />
            <path
              d="M 30 -10 Q 120 90 280 140"
              fill="none"
              stroke={isDark ? "rgba(148, 163, 184, 0.18)" : "rgba(100, 116, 139, 0.25)"}
              strokeWidth="0.8"
              strokeDasharray="4,4"
            />
            <circle
              cx="130"
              cy="48"
              r="24"
              fill="none"
              stroke={isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(51, 65, 85, 0.2)"}
              strokeWidth="1"
            />

            {/* Glowing Moon Crescent */}
            <circle cx="130" cy="46" r="14" fill={isDark ? "#e2e8f0" : "#0f172a"} />
            <circle cx="135" cy="42" r="13" fill={isDark ? "#0d1624" : "#e2e8f0"} />

            {/* Constellation Nodes & Connecting Rays */}
            <line x1="60" y1="95" x2="130" y2="46" stroke={isDark ? "rgba(148, 163, 184, 0.35)" : "rgba(71, 85, 105, 0.3)"} strokeWidth="1" />
            <line x1="130" y1="46" x2="220" y2="78" stroke={isDark ? "rgba(148, 163, 184, 0.35)" : "rgba(71, 85, 105, 0.3)"} strokeWidth="1" />
            <line x1="220" y1="78" x2="270" y2="35" stroke={isDark ? "rgba(148, 163, 184, 0.25)" : "rgba(71, 85, 105, 0.25)"} strokeWidth="1" />

            {/* Star Points */}
            <circle cx="60" cy="95" r="2.5" fill={isDark ? "#ffffff" : "#0f172a"} />
            <circle cx="220" cy="78" r="3" fill={isDark ? "#38bdf8" : "#0284c7"} />
            <circle cx="270" cy="35" r="2.5" fill={isDark ? "#ffffff" : "#0f172a"} />
            <circle cx="170" cy="18" r="1.5" fill={isDark ? "#ffffff" : "#475569"} />
            <circle cx="95" cy="115" r="1.5" fill={isDark ? "#ffffff" : "#475569"} />
          </g>
        ) : type === 'geometry-mesh' ? (
          /* MATH1110 Mathematics style: Sharp geometric constellation with intersecting chords */
          <g>
            {/* Long connecting lines forming coordinate polygon */}
            <line x1="40" y1="30" x2="210" y2="120" stroke={isDark ? "rgba(148, 163, 184, 0.3)" : "rgba(71, 85, 105, 0.3)"} strokeWidth="1" />
            <line x1="100" y1="130" x2="270" y2="20" stroke={isDark ? "rgba(148, 163, 184, 0.3)" : "rgba(71, 85, 105, 0.3)"} strokeWidth="1" />
            <line x1="190" y1="35" x2="160" y2="90" stroke={isDark ? "rgba(148, 163, 184, 0.35)" : "rgba(71, 85, 105, 0.35)"} strokeWidth="1.2" />
            <line x1="160" y1="90" x2="250" y2="110" stroke={isDark ? "rgba(148, 163, 184, 0.25)" : "rgba(71, 85, 105, 0.25)"} strokeWidth="1" />

            {/* Central Cluster Nodes (matching image) */}
            <circle cx="185" cy="38" r="3.5" fill={isDark ? "#ffffff" : "#0f172a"} />
            <circle cx="196" cy="42" r="2.5" fill={isDark ? "#a5b4fc" : "#4338ca"} />
            <circle cx="190" cy="50" r="2.5" fill={isDark ? "#ffffff" : "#0f172a"} />

            <circle cx="160" cy="90" r="3.5" fill={isDark ? "#818cf8" : "#4f46e5"} />
            <circle cx="210" cy="120" r="2.5" fill={isDark ? "#ffffff" : "#0f172a"} />
            <circle cx="270" cy="20" r="2" fill={isDark ? "#ffffff" : "#0f172a"} />
            <circle cx="100" cy="130" r="2" fill={isDark ? "#ffffff" : "#0f172a"} />
            <circle cx="250" cy="110" r="2.5" fill={isDark ? "#ffffff" : "#0f172a"} />
            <circle cx="120" cy="25" r="1.5" fill={isDark ? "#ffffff" : "#64748b"} />
          </g>
        ) : (
          /* Star-cluster / Pulsar */
          <g>
            <circle cx="150" cy="70" r="5" fill={isDark ? "#2dd4bf" : "#0d9488"} />
            <circle cx="150" cy="70" r="28" fill="none" stroke={isDark ? "rgba(45, 212, 191, 0.25)" : "rgba(13, 148, 136, 0.2)"} strokeWidth="1" strokeDasharray="3,3" />
            <line x1="80" y1="40" x2="150" y2="70" stroke={isDark ? "rgba(148, 163, 184, 0.3)" : "rgba(71, 85, 105, 0.3)"} strokeWidth="1" />
            <line x1="150" y1="70" x2="220" y2="100" stroke={isDark ? "rgba(148, 163, 184, 0.3)" : "rgba(71, 85, 105, 0.3)"} strokeWidth="1" />
            <line x1="150" y1="70" x2="210" y2="35" stroke={isDark ? "rgba(148, 163, 184, 0.3)" : "rgba(71, 85, 105, 0.3)"} strokeWidth="1" />
            <circle cx="80" cy="40" r="3" fill={isDark ? "#ffffff" : "#0f172a"} />
            <circle cx="220" cy="100" r="2.5" fill={isDark ? "#ffffff" : "#0f172a"} />
            <circle cx="210" cy="35" r="3" fill={isDark ? "#ffffff" : "#0f172a"} />
          </g>
        )}
      </svg>
    </div>
  );
};
