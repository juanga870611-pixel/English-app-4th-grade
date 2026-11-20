import React, { useId, useState } from 'react';
import { playBetoCheerSound } from '../utils/soundFx';

export type MascotMood = 'neutral' | 'happy' | 'encouraging' | 'celebrating';

interface MascotGuideProps {
  mood?: MascotMood;
  message?: string;
  subMessage?: string;
  compact?: boolean;
  bare?: boolean;
  soundMuted?: boolean;
}

const BETO_CHEER_MESSAGES = [
  '¡Hola explorador! Cada palabra nueva te da superpoderes.',
  '¡Tú puedes! Escucha despacio y confía en ti.',
  '¡Qué excelente energía! Sigamos la aventura por Colombia.',
  '¡Muy bien! Paso a paso dominas el inglés de 4°.',
];

export const VolumetricBetoSvg: React.FC<{
  size?: number;
  mood?: MascotMood;
  speaking?: boolean;
  jumping?: boolean;
}> = ({ size = 60, mood = 'neutral', speaking = false, jumping = false }) => {
  const uid = useId().replace(/:/g, '');
  const isHappy = mood === 'happy' || mood === 'celebrating';
  const isEncouraging = mood === 'encouraging';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 84 84"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_6px_8px_rgba(15,23,42,0.22)] ${
        jumping
          ? 'animate-beto-jump'
          : speaking
            ? 'animate-beto-talk'
            : 'animate-beto-float'
      }`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`fur-${uid}`} cx="38%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#5C493E" />
          <stop offset="65%" stopColor="#3E322B" />
          <stop offset="100%" stopColor="#261D18" />
        </radialGradient>
        <radialGradient id={`muzzle-${uid}`} cx="45%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFF7ED" />
          <stop offset="70%" stopColor="#F5E6D3" />
          <stop offset="100%" stopColor="#DEC5A8" />
        </radialGradient>
        <linearGradient id={`gold-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id={`scarf-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>

      {/* Soft ground shadow */}
      <ellipse cx="42" cy="78" rx="22" ry="4" fill="rgba(15,23,42,0.14)" />

      {/* Ears with depth */}
      <circle cx="21" cy="21" r="11.5" fill="#2A201B" />
      <circle cx="21" cy="21" r="6.5" fill="#C69C6D" />
      <circle cx="63" cy="21" r="11.5" fill="#2A201B" />
      <circle cx="63" cy="21" r="6.5" fill="#C69C6D" />

      {/* 3D Volumetric Head */}
      <ellipse cx="42" cy="44" rx="28" ry="26" fill={`url(#fur-${uid})`} />
      {/* Top specular brow sheen */}
      <ellipse cx="36" cy="26" rx="14" ry="5" fill="rgba(255,255,255,0.14)" />

      {/* Golden Spectacles with 3D rim */}
      <circle cx="31" cy="40" r="10" fill={`url(#gold-${uid})`} />
      <circle cx="53" cy="40" r="10" fill={`url(#gold-${uid})`} />
      <rect x="37" y="38" width="10" height="4.2" rx="2.1" fill={`url(#gold-${uid})`} />

      {/* Eyes */}
      {mood === 'celebrating' ? (
        <>
          <path d="M27 40C28.5 37 33.5 37 35 40" stroke="#1E1B18" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M49 40C50.5 37 55.5 37 57 40" stroke="#1E1B18" strokeWidth="2.8" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="31" cy="40" r="3.9" fill="#1E1B18" />
          <circle cx="32.2" cy="38.6" r="1.4" fill="#FFFFFF" />
          <circle cx="53" cy="40" r="3.9" fill="#1E1B18" />
          <circle cx="54.2" cy="38.6" r="1.4" fill="#FFFFFF" />
        </>
      )}

      {/* Volumetric Muzzle */}
      <ellipse cx="42" cy="53" rx="13.5" ry="10.2" fill={`url(#muzzle-${uid})`} />

      {/* Glossy Nose */}
      <ellipse cx="42" cy="48.5" rx="4.7" ry="3.2" fill="#1E1B18" />
      <ellipse cx="40.8" cy="47.6" rx="1.6" ry="0.8" fill="rgba(255,255,255,0.45)" />

      {/* Mouth expression */}
      {speaking ? (
        <ellipse cx="42" cy="57" rx="4.5" ry="3.2" fill="#991B1B" />
      ) : isHappy || jumping ? (
        <path d="M35 55C37.5 59.5 46.5 59.5 49 55" stroke="#1E1B18" strokeWidth="2.6" strokeLinecap="round" />
      ) : isEncouraging ? (
        <path d="M37 56C39.5 55 44.5 55 47 56" stroke="#1E1B18" strokeWidth="2.4" strokeLinecap="round" />
      ) : (
        <path d="M36 55C38.8 57.6 45.2 57.6 48 55" stroke="#1E1B18" strokeWidth="2.4" strokeLinecap="round" />
      )}

      {/* Beveled Colombian Emerald Scarf */}
      <path d="M21 63C29 69 55 69 63 63L58.5 72C49 76 35 76 25.5 72L21 63Z" fill={`url(#scarf-${uid})`} />
      <path d="M27 67.5C36 70.5 48 70.5 57 67.5" stroke="#FBBF24" strokeWidth="2.6" strokeLinecap="round" />

      {/* Animated Waving Paw when speaking or jumping */}
      {(speaking || jumping) && (
        <g className="animate-beto-wave">
          <circle cx="71" cy="57" r="7.5" fill="#3E322B" stroke="#F5E6D3" strokeWidth="1.6" />
        </g>
      )}
    </svg>
  );
};

export const VolumetricTrophySvg: React.FC<{ size?: number }> = ({ size = 56 }) => {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-medal-float drop-shadow-[0_10px_14px_rgba(217,119,6,0.35)]"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`trophy-gold-${uid}`} x1="16" y1="10" x2="64" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="45%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id={`trophy-base-${uid}`} x1="24" y1="58" x2="56" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>
      {/* Handles */}
      <path d="M22 20H12C12 32 17 38 25 38" stroke="#D97706" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M58 20H68C68 32 63 38 55 38" stroke="#D97706" strokeWidth="4.5" strokeLinecap="round" />
      {/* Cup */}
      <path d="M20 14H60V30C60 42.5 51 50 40 50C29 50 20 42.5 20 30V14Z" fill={`url(#trophy-gold-${uid})`} />
      {/* Cup inner highlight */}
      <path d="M26 18V30C26 37 31 43 37 45" stroke="rgba(255,255,255,0.55)" strokeWidth="3" strokeLinecap="round" />
      {/* Star */}
      <path d="M40 22L42.2 26.8L47.4 27.4L43.5 31L44.5 36.2L40 33.6L35.5 36.2L36.5 31L32.6 27.4L37.8 26.8L40 22Z" fill="#FFFBEB" />
      {/* Stem & Pedestal */}
      <rect x="35" y="49" width="10" height="10" fill="#B45309" />
      <rect x="24" y="58" width="32" height="12" rx="4" fill={`url(#trophy-base-${uid})`} />
      <rect x="28" y="61" width="24" height="3" rx="1.5" fill="#FBBF24" />
    </svg>
  );
};

export const MascotGuide: React.FC<MascotGuideProps> = ({
  mood = 'neutral',
  message,
  subMessage,
  compact = false,
  bare = false,
  soundMuted = false,
}) => {
  const [cheerIdx, setCheerIdx] = useState<number | null>(null);
  const [jumping, setJumping] = useState(false);

  const isHappy = mood === 'happy' || mood === 'celebrating';
  const isEncouraging = mood === 'encouraging';

  const containerTone = bare
    ? 'text-slate-800'
    : isHappy
      ? 'panel-3d-emerald p-3.5 text-emerald-950 rounded-2xl'
      : isEncouraging
        ? 'rounded-2xl border border-b-[5px] border-amber-300 border-b-amber-400 bg-gradient-to-b from-white to-amber-50 p-3.5 text-amber-950 shadow-[0_10px_20px_-10px_rgba(217,119,6,0.22)]'
        : 'panel-3d p-3.5 text-slate-800 rounded-2xl';

  const handleTapBeto = () => {
    playBetoCheerSound(soundMuted);
    setJumping(true);
    setCheerIdx((prev) => (prev === null ? 0 : (prev + 1) % BETO_CHEER_MESSAGES.length));
    setTimeout(() => setJumping(false), 700);
  };

  const activeMessage = cheerIdx !== null ? BETO_CHEER_MESSAGES[cheerIdx] : message;

  return (
    <div
      className={`flex items-center gap-3.5 text-left transition-colors ${containerTone}`}
      role="status"
      aria-live="polite"
    >
      {/* Interactive 3D Volumetric Beto */}
      <button
        type="button"
        onClick={handleTapBeto}
        aria-label="Saludar a Beto el Oso Guía para recibir ánimo"
        data-testid="interactive-beto-button"
        title="¡Toca a Beto para recibir un mensaje de ánimo!"
        className="group relative shrink-0 rounded-2xl p-1 transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-emerald-600"
      >
        <VolumetricBetoSvg
          size={compact ? 52 : 66}
          mood={jumping ? 'celebrating' : mood}
          jumping={jumping}
        />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Beto · Tu Oso Guía</span>
          {cheerIdx !== null ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-bold text-emerald-700">¡Hola amigo!</span>
            </>
          ) : mood === 'celebrating' ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-bold text-emerald-700">¡Excelente!</span>
            </>
          ) : mood === 'encouraging' ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-bold text-amber-700">¡Sigue intentando!</span>
            </>
          ) : (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-sky-700">Tócame para saludar</span>
            </>
          )}
        </div>
        {activeMessage && (
          <p className="mt-0.5 text-sm font-semibold leading-snug text-slate-900 sm:text-base">
            {activeMessage}
          </p>
        )}
        {subMessage && (
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600 sm:text-sm">{subMessage}</p>
        )}
      </div>
    </div>
  );
};
