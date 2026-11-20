import React from 'react';
import { Award, Flame, Share2, Star, Volume2, VolumeX } from 'lucide-react';
import type { StudentProgress } from '../types/curriculum';
import { countTotalStars } from '../utils/progress';
import { playTapSound } from '../utils/soundFx';

interface TopHudBarProps {
  progress: StudentProgress;
  onOpenExport: () => void;
  onToggleMute: () => void;
}

export const TopHudBar: React.FC<TopHudBarProps> = ({
  progress,
  onOpenExport,
  onToggleMute,
}) => {
  const totalStars = countTotalStars(progress);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-[0_6px_18px_-12px_rgba(15,23,42,0.22)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
        {/* Zone 1: Single-line Brand with 3D Cube Mark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span
            className="cube-3d flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-b-4 border-emerald-800 bg-gradient-to-b from-emerald-500 to-emerald-600 text-base text-white font-display font-extrabold sm:text-lg"
            aria-label="English Explorers 4°"
          >
            4°
          </span>
          <span className="hidden sm:inline font-display text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            English Explorers
          </span>
        </div>

        {/* Zone 2: Volumetric Gamified Stats */}
        <div className="flex items-center gap-3 sm:gap-6" aria-label="Estadísticas del estudiante">
          <div
            className="flex items-center gap-1.5 text-xs font-extrabold text-amber-800 tabular-nums whitespace-nowrap shrink-0 sm:text-sm"
            title="Racha de días seguidos"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-b from-amber-100 to-orange-100 border-b-2 border-orange-300 shadow-xs">
              <Flame className="h-4 w-4 text-orange-500" aria-hidden="true" />
            </span>
            <span>{progress.streakDays}d</span>
          </div>

          <div
            className="flex items-center gap-1.5 text-xs font-extrabold text-sky-800 tabular-nums whitespace-nowrap shrink-0 sm:text-sm"
            title="Puntos de experiencia XP"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-b from-sky-100 to-sky-200 border-b-2 border-sky-300 shadow-xs">
              <Award className="h-4 w-4 text-sky-600" aria-hidden="true" />
            </span>
            <span>{progress.xp} XP</span>
          </div>

          <div
            className="flex items-center gap-1.5 text-xs font-extrabold text-amber-800 tabular-nums whitespace-nowrap shrink-0 sm:text-sm"
            title="Estrellas ganadas"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-b from-yellow-100 to-amber-200 border-b-2 border-amber-400 shadow-xs">
              <Star className="h-4 w-4 fill-amber-400 text-amber-600" aria-hidden="true" />
            </span>
            <span>{totalStars}</span>
          </div>
        </div>

        {/* Zone 3: Tactile 3D Sound toggle + Export Progress Code CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              // Play subtle confirmation tone only when unmuting
              if (progress.soundMuted) playTapSound(false);
              onToggleMute();
            }}
            aria-label={progress.soundMuted ? 'Activar efectos de sonido' : 'Silenciar efectos de sonido'}
            className="btn-3d flex h-10 w-10 items-center justify-center rounded-xl border border-b-4 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-sky-600"
          >
            {progress.soundMuted ? (
              <VolumeX className="h-5 w-5 text-slate-500" aria-hidden="true" />
            ) : (
              <Volume2 className="h-5 w-5 text-emerald-700" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              playTapSound(progress.soundMuted);
              onOpenExport();
            }}
            className="btn-3d inline-flex min-h-[42px] items-center gap-2 rounded-xl border-b-[5px] border-emerald-800 bg-gradient-to-b from-emerald-500 to-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:from-emerald-500 hover:to-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 whitespace-nowrap shrink-0 sm:px-4 sm:text-sm"
          >
            <Share2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Exportar código de progreso</span>
            <span className="sm:hidden">Código</span>
          </button>
        </div>
      </div>
    </header>
  );
};
