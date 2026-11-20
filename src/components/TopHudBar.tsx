import React from 'react';
import { Award, Flame, Share2, Star, Volume2, VolumeX } from 'lucide-react';
import type { StudentProgress } from '../types/curriculum';
import { countTotalStars } from '../utils/progress';

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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
        {/* Zone 1: Single-line Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-base text-white font-display font-extrabold sm:text-lg"
            aria-label="English Explorers 4°"
          >
            4°
          </span>
          <span className="hidden sm:inline font-display text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            English Explorers
          </span>
        </div>

        {/* Zone 2: Gamified Stats */}
        <div className="flex items-center gap-2.5 sm:gap-5" aria-label="Estadísticas del estudiante">
          <div
            className="flex items-center gap-1 text-xs font-bold text-amber-700 tabular-nums whitespace-nowrap shrink-0 sm:gap-1.5 sm:text-sm"
            title="Racha de días seguidos"
          >
            <Flame className="h-4 w-4 text-orange-500 sm:h-5 sm:w-5" aria-hidden="true" />
            <span>{progress.streakDays}d</span>
          </div>

          <div
            className="flex items-center gap-1 text-xs font-bold text-sky-700 tabular-nums whitespace-nowrap shrink-0 sm:gap-1.5 sm:text-sm"
            title="Puntos de experiencia XP"
          >
            <Award className="h-4 w-4 text-sky-600 sm:h-5 sm:w-5" aria-hidden="true" />
            <span>{progress.xp} XP</span>
          </div>

          <div
            className="flex items-center gap-1 text-xs font-bold text-amber-700 tabular-nums whitespace-nowrap shrink-0 sm:gap-1.5 sm:text-sm"
            title="Estrellas ganadas"
          >
            <Star className="h-4 w-4 fill-amber-400 text-amber-500 sm:h-5 sm:w-5" aria-hidden="true" />
            <span>{totalStars}</span>
          </div>
        </div>

        {/* Zone 3: Sound toggle + Export Progress Code CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={progress.soundMuted ? 'Activar efectos de sonido' : 'Silenciar efectos de sonido'}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-600"
          >
            {progress.soundMuted ? (
              <VolumeX className="h-5 w-5 text-slate-500" aria-hidden="true" />
            ) : (
              <Volume2 className="h-5 w-5 text-emerald-700" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenExport}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border-b-4 border-emerald-800 bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition-transform hover:bg-emerald-700 active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 whitespace-nowrap shrink-0 sm:px-4 sm:text-sm"
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
