import React from 'react';

export type MascotMood = 'neutral' | 'happy' | 'encouraging' | 'celebrating';

interface MascotGuideProps {
  mood?: MascotMood;
  message?: string;
  subMessage?: string;
  compact?: boolean;
  bare?: boolean;
}

export const MascotGuide: React.FC<MascotGuideProps> = ({
  mood = 'neutral',
  message,
  subMessage,
  compact = false,
  bare = false,
}) => {
  const isHappy = mood === 'happy' || mood === 'celebrating';
  const isEncouraging = mood === 'encouraging';

  const containerTone = bare
    ? 'text-slate-800'
    : isHappy
      ? 'rounded-2xl border p-3.5 bg-emerald-50 border-emerald-200 text-emerald-950'
      : isEncouraging
        ? 'rounded-2xl border p-3.5 bg-amber-50 border-amber-200 text-amber-950'
        : 'rounded-2xl border p-3.5 bg-white border-slate-200 text-slate-800';

  return (
    <div
      className={`flex items-center gap-3.5 text-left transition-colors ${containerTone}`}
      role="status"
      aria-live="polite"
    >
      {/* Inline SVG Andean Spectacled Bear ("Beto") */}
      <div className="shrink-0" aria-hidden="true">
        <svg
          width={compact ? 48 : 60}
          height={compact ? 48 : 60}
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          {/* Ears */}
          <circle cx="20" cy="20" r="11" fill="#332924" />
          <circle cx="20" cy="20" r="6" fill="#C69C6D" />
          <circle cx="60" cy="20" r="11" fill="#332924" />
          <circle cx="60" cy="20" r="6" fill="#C69C6D" />

          {/* Head */}
          <ellipse cx="40" cy="43" rx="28" ry="26" fill="#3E322B" />

          {/* Spectacled Bear Golden Rings */}
          <circle cx="29" cy="39" r="9.5" fill="#FDE68A" />
          <circle cx="51" cy="39" r="9.5" fill="#FDE68A" />
          <rect x="35" y="37" width="10" height="4" rx="2" fill="#FDE68A" />

          {/* Eyes */}
          {mood === 'celebrating' ? (
            <>
              <path d="M25 39C26.5 36 31.5 36 33 39" stroke="#1E1B18" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M47 39C48.5 36 53.5 36 55 39" stroke="#1E1B18" strokeWidth="2.8" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="29" cy="39" r="3.8" fill="#1E1B18" />
              <circle cx="30.2" cy="37.8" r="1.3" fill="#FFFFFF" />
              <circle cx="51" cy="39" r="3.8" fill="#1E1B18" />
              <circle cx="52.2" cy="37.8" r="1.3" fill="#FFFFFF" />
            </>
          )}

          {/* Muzzle */}
          <ellipse cx="40" cy="52" rx="13" ry="10" fill="#F5E6D3" />

          {/* Nose */}
          <ellipse cx="40" cy="47.5" rx="4.5" ry="3" fill="#1E1B18" />

          {/* Mouth expression */}
          {isHappy ? (
            <path d="M34 54C36 58 44 58 46 54" stroke="#1E1B18" strokeWidth="2.5" strokeLinecap="round" />
          ) : isEncouraging ? (
            <path d="M36 55C38 54 42 54 44 55" stroke="#1E1B18" strokeWidth="2.4" strokeLinecap="round" />
          ) : (
            <path d="M35 54C37.5 56.5 42.5 56.5 45 54" stroke="#1E1B18" strokeWidth="2.4" strokeLinecap="round" />
          )}

          {/* Colombian Scarf Accent */}
          <path d="M20 63C27 68 53 68 60 63L56 71C47 75 33 75 24 71L20 63Z" fill="#059669" />
          <path d="M26 67C34 70 46 70 54 67" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Beto · Tu Oso Guía</span>
          {mood === 'celebrating' && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700">¡Excelente!</span>
            </>
          )}
          {mood === 'encouraging' && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-amber-700">¡Sigue intentando!</span>
            </>
          )}
        </div>
        {message && (
          <p className="mt-0.5 text-sm font-semibold leading-snug text-slate-900 sm:text-base">
            {message}
          </p>
        )}
        {subMessage && (
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600 sm:text-sm">{subMessage}</p>
        )}
      </div>
    </div>
  );
};
