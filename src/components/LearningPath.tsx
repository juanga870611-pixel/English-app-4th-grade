import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Lock, Play, Rocket, Sparkles, Star, Zap } from 'lucide-react';
import { CURRICULUM_MODULES, CURRICULUM_WEEKS } from '../data/curriculum';
import type { ModuleId, PaceMode, StudentProgress, WeekLesson } from '../types/curriculum';
import { calculatePaceProjection, PASS_ACCURACY_THRESHOLD, TOTAL_WEEKS } from '../utils/progress';
import { playTapSound } from '../utils/soundFx';
import { MascotGuide } from './MascotGuide';
import { VocabFlashcardDeck } from './VocabFlashcardDeck';

interface LearningPathProps {
  progress: StudentProgress;
  soundMuted: boolean;
  onSelectWeek: (week: WeekLesson) => void;
  onChangePaceMode: (mode: PaceMode) => void;
}

const MODULE_ACCENTS = {
  emerald: {
    banner:
      'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white border-emerald-700 border-b-emerald-900 shadow-[0_14px_28px_-10px_rgba(5,150,105,0.42),inset_0_2px_0_rgba(255,255,255,0.3)]',
    activeBtn:
      'border-emerald-800 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white hover:to-emerald-700',
    cubeActive:
      'border-sky-800 bg-gradient-to-b from-sky-400 to-sky-600 text-white',
    trailStroke: '#10B981',
  },
  sky: {
    banner:
      'bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 text-white border-sky-700 border-b-sky-900 shadow-[0_14px_28px_-10px_rgba(2,132,199,0.42),inset_0_2px_0_rgba(255,255,255,0.3)]',
    activeBtn:
      'border-sky-800 bg-gradient-to-b from-sky-500 to-sky-600 text-white hover:to-sky-700',
    cubeActive:
      'border-sky-800 bg-gradient-to-b from-sky-400 to-sky-600 text-white',
    trailStroke: '#0284C7',
  },
  amber: {
    banner:
      'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 text-white border-amber-700 border-b-amber-900 shadow-[0_14px_28px_-10px_rgba(217,119,6,0.42),inset_0_2px_0_rgba(255,255,255,0.3)]',
    activeBtn:
      'border-amber-800 bg-gradient-to-b from-amber-500 to-amber-600 text-white hover:to-amber-700',
    cubeActive:
      'border-amber-700 bg-gradient-to-b from-amber-400 to-amber-600 text-white',
    trailStroke: '#D97706',
  },
  indigo: {
    banner:
      'bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border-indigo-700 border-b-indigo-900 shadow-[0_14px_28px_-10px_rgba(79,70,229,0.42),inset_0_2px_0_rgba(255,255,255,0.3)]',
    activeBtn:
      'border-indigo-800 bg-gradient-to-b from-indigo-500 to-indigo-600 text-white hover:to-indigo-700',
    cubeActive:
      'border-indigo-800 bg-gradient-to-b from-indigo-400 to-indigo-600 text-white',
    trailStroke: '#4F46E5',
  },
};

export const LearningPath: React.FC<LearningPathProps> = ({
  progress,
  soundMuted,
  onSelectWeek,
  onChangePaceMode,
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<ModuleId>(1);
  const [previewVocabWeek, setPreviewVocabWeek] = useState<number | null>(1);

  const activeModule = CURRICULUM_MODULES.find((m) => m.id === selectedModuleId) ?? CURRICULUM_MODULES[0];
  const moduleWeeks = CURRICULUM_WEEKS.filter((w) => w.moduleId === selectedModuleId);
  const projection = calculatePaceProjection(progress, progress.paceMode);
  const accent = MODULE_ACCENTS[activeModule.accentColor];

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      {/* Top 3D Hero Grid: Adaptive Dual Progress Platform + Interactive Beto */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-stretch">
        {/* Left: 3D Volumetric Progress & Pace Platform */}
        <div className="panel-3d lg:col-span-7 flex flex-col justify-between rounded-2xl p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-emerald-700">
                Grado 4° · Malla Curricular MEN Colombia (36 semanas)
              </p>
              <h1 className="mt-1 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl text-balance">
                Tu ruta de aprendizaje en inglés
              </h1>
            </div>

            {/* Tactile 3D Pace Mode Segmented Toggle */}
            <div
              className="flex w-full items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100/90 p-1 shadow-inner sm:w-auto"
              role="group"
              aria-label="Selector de ritmo de aprendizaje"
            >
              <button
                type="button"
                onClick={() => {
                  playTapSound(soundMuted);
                  onChangePaceMode('standard_9m');
                }}
                className={`min-h-[36px] flex-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all whitespace-nowrap sm:flex-initial sm:px-3 sm:text-xs ${
                  progress.paceMode === 'standard_9m'
                    ? 'border-b-2 border-slate-300 bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Estándar (9 meses)
              </button>
              <button
                type="button"
                onClick={() => {
                  playTapSound(soundMuted);
                  onChangePaceMode('fast_7m');
                }}
                className={`inline-flex min-h-[36px] flex-1 items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all whitespace-nowrap sm:flex-initial sm:px-3 sm:text-xs ${
                  progress.paceMode === 'fast_7m'
                    ? 'border-b-2 border-emerald-800 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Avance a tu ritmo (7m)</span>
              </button>
            </div>
          </div>

          {/* 3D Beveled Dual Progress Bars */}
          <div className="mt-5 space-y-3.5">
            <div>
              <div className="flex items-center justify-between gap-2 text-xs font-bold">
                <span className="text-slate-700">
                  Avance anual estándar (9 meses · 36 semanas)
                </span>
                <span className="font-mono text-slate-900 tabular-nums shrink-0">
                  {projection.completedCount}/{TOTAL_WEEKS} ({projection.standardPercent}%)
                </span>
              </div>
              <div className="mt-1.5 h-3.5 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-b from-sky-400 to-sky-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition-all duration-300"
                  style={{ width: `${Math.max(projection.standardPercent, 3)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 text-xs font-bold">
                <span className="text-emerald-800">
                  Meta ruta rápida (7 meses · ≥{PASS_ACCURACY_THRESHOLD}% desbloquea de inmediato)
                </span>
                <span className="font-mono text-emerald-800 tabular-nums shrink-0">
                  {projection.fastTrackPercent}% · ~{projection.projectedMonths}m rest.
                </span>
              </div>
              <div className="mt-1.5 h-3.5 w-full overflow-hidden rounded-full border border-emerald-200 bg-emerald-100/70 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition-all duration-300"
                  style={{ width: `${Math.max(projection.fastTrackPercent, 3)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive Volumetric Beto Guide Platform */}
        <div className="panel-3d lg:col-span-5 flex flex-col justify-between gap-4 rounded-2xl p-5">
          <MascotGuide
            bare
            soundMuted={soundMuted}
            mood={projection.completedCount > 0 ? 'happy' : 'neutral'}
            message={
              projection.completedCount === 0
                ? '¡Hola! Soy Beto. Completa la Semana 1 con 80% o más para abrir la Semana 2 hoy mismo.'
                : `¡Llevas ${projection.completedCount} semana(s) completada(s) y ${progress.xp} XP! Sigue así.`
            }
            subMessage={projection.paceLabelEs}
          />

          <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 pt-3 text-xs text-slate-600">
            <span>
              Módulo activo: <strong className="text-slate-900">{activeModule.titleEs}</strong>
            </span>
            <span className="font-bold text-emerald-700 tabular-nums">
              Semana desbloqueada: #{progress.unlockedMaxWeek}
            </span>
          </div>
        </div>
      </section>

      {/* Raised 3D Expedition Module Tabs (4 MEN Modules) */}
      <nav aria-label="Módulos curriculares del MEN" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {CURRICULUM_MODULES.map((mod) => {
          const isActive = mod.id === selectedModuleId;
          const modWeeks = CURRICULUM_WEEKS.filter((w) => w.moduleId === mod.id);
          const completedInMod = modWeeks.filter((w) => Boolean(progress.completedWeeks[w.weekNumber])).length;

          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => {
                playTapSound(soundMuted);
                setSelectedModuleId(mod.id);
              }}
              className={`btn-3d flex flex-col items-start rounded-2xl border border-b-[5px] p-3.5 text-left focus-visible:outline-2 focus-visible:outline-sky-600 ${
                isActive
                  ? 'border-slate-800 border-b-slate-950 bg-gradient-to-b from-slate-800 to-slate-900 text-white'
                  : 'border-slate-200 border-b-slate-300 bg-gradient-to-b from-white to-slate-50 text-slate-800 hover:to-slate-100'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-xl shadow-xs ${
                    isActive ? 'bg-white/10' : 'bg-slate-100'
                  }`}
                  aria-hidden="true"
                >
                  {mod.iconEmoji}
                </span>
                <span
                  className={`font-mono text-xs font-bold tabular-nums ${
                    isActive ? 'text-emerald-300' : 'text-slate-500'
                  }`}
                >
                  {completedInMod}/9 sem
                </span>
              </div>
              <p className={`mt-2 text-xs font-semibold ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                Módulo {mod.id} · Sem {mod.weeksRange[0]}–{mod.weeksRange[1]}
              </p>
              <p className="mt-0.5 font-display text-sm font-extrabold leading-tight sm:text-base">
                {mod.titleEn}
              </p>
            </button>
          );
        })}
      </nav>

      {/* Selected Module 3D Banner */}
      <section className={`rounded-2xl border border-b-[6px] p-5 sm:p-6 ${accent.banner}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold opacity-90">{activeModule.menStandard}</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">
              Módulo {activeModule.id}: {activeModule.titleEn} — {activeModule.titleEs}
            </h2>
            <p className="mt-1.5 max-w-3xl text-sm opacity-95">{activeModule.subtitleEs}</p>
          </div>
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/15 text-4xl shadow-inner backdrop-blur-xs self-start sm:self-center"
            aria-hidden="true"
          >
            {activeModule.iconEmoji}
          </div>
        </div>
      </section>

      {/* 3D Isometric Adventure Path (36 Weeks) */}
      <section
        aria-label={`Ruta de semanas del Módulo ${activeModule.id}`}
        data-testid="adventure-roadmap-3d"
        className="relative space-y-6 pb-2"
      >
        {moduleWeeks.map((week, idx) => {
          const completion = progress.completedWeeks[week.weekNumber];
          const isCompleted = Boolean(completion);
          const isUnlocked = week.weekNumber <= progress.unlockedMaxWeek;
          const canPlay = week.isImplemented && isUnlocked;
          const isCurrentActive = canPlay && !isCompleted;

          const zigzagOffsets = [
            'lg:ml-0 lg:mr-auto',
            'lg:mx-auto',
            'lg:ml-auto lg:mr-0',
            'lg:mx-auto',
          ];
          const offsetClass = zigzagOffsets[idx % zigzagOffsets.length];
          const isVocabOpen = previewVocabWeek === week.weekNumber;

          return (
            <div key={week.weekNumber} className={`relative w-full lg:max-w-3xl ${offsetClass}`}>
              {/* Isometric Adventure Trail Connector to Next Platform */}
              {idx < moduleWeeks.length - 1 && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none mx-auto flex h-6 w-20 items-center justify-center -mb-6 mt-0"
                >
                  <div
                    className="h-6 w-2 rounded-full opacity-40"
                    style={{
                      background: isCompleted ? '#10B981' : '#94A3B8',
                    }}
                  />
                </div>
              )}

              <div
                data-week-node={week.weekNumber}
                data-node-state={isCompleted ? 'completed' : isCurrentActive ? 'active' : 'locked'}
                className={`platform-iso-node rounded-2xl p-4 sm:p-5 ${
                  isCompleted
                    ? 'panel-3d-emerald'
                    : isCurrentActive
                      ? 'panel-3d border-sky-400 border-b-sky-600 ring-4 ring-sky-200/70'
                      : 'panel-3d-locked'
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Raised 3D Week Pedestal Cube + Info */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`cube-3d relative flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border-b-[5px] font-display font-extrabold tabular-nums ${
                        isCompleted
                          ? 'border-emerald-800 bg-gradient-to-b from-emerald-400 to-emerald-600 text-white'
                          : isCurrentActive
                            ? `${accent.cubeActive} animate-node-beacon`
                            : 'border-slate-400 bg-gradient-to-b from-slate-200 to-slate-300 text-slate-600'
                      }`}
                    >
                      {isCompleted && (
                        <span
                          className="animate-medal-float absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-amber-500 bg-gradient-to-b from-yellow-300 to-amber-400 shadow-sm"
                          aria-hidden="true"
                        >
                          <Star className="h-3.5 w-3.5 fill-white text-white" />
                        </span>
                      )}
                      <span className="text-[10px] leading-none opacity-90">SEM</span>
                      <span className="text-xl leading-tight">{week.weekNumber}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold text-slate-500">
                        <span>Semana {week.weekNumber}</span>
                        <span aria-hidden="true">·</span>
                        <span>{week.isImplemented ? `${week.challenges.length} retos` : 'Próxima entrega'}</span>
                        {week.hasMicroStory && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-amber-700 font-bold">Incluye Microcuento</span>
                          </>
                        )}
                      </div>

                      <h3 className="mt-0.5 font-display text-lg font-extrabold text-slate-900 sm:text-xl">
                        {week.titleEs}{' '}
                        <span className="font-semibold text-slate-500">({week.titleEn})</span>
                      </h3>

                      <p className="mt-1 text-xs font-medium text-slate-600 sm:text-sm">
                        {week.grammarFocus}
                      </p>

                      {/* Volumetric Golden Stars & Best Accuracy */}
                      {completion && (
                        <div className="mt-2 flex items-center gap-3 text-xs font-bold text-emerald-800">
                          <span className="inline-flex items-center gap-0.5" aria-label={`${completion.stars} de 3 estrellas`}>
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`h-4 w-4 ${
                                  s <= completion.stars
                                    ? 'fill-amber-400 text-amber-500 drop-shadow-[0_2px_3px_rgba(245,158,11,0.45)]'
                                    : 'text-slate-300'
                                }`}
                                aria-hidden="true"
                              />
                            ))}
                          </span>
                          <span className="tabular-nums">Mejor nota: {completion.bestAccuracy}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tactile 3D Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    {week.isImplemented && week.vocabularyPreview.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          playTapSound(soundMuted);
                          setPreviewVocabWeek(isVocabOpen ? null : week.weekNumber);
                        }}
                        className="btn-3d inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-b-4 border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                      >
                        <BookOpen className="h-4 w-4 text-sky-600" aria-hidden="true" />
                        <span>{isVocabOpen ? 'Ocultar palabras' : 'Vocabulario'}</span>
                      </button>
                    )}

                    {canPlay ? (
                      <button
                        type="button"
                        onClick={() => {
                          playTapSound(soundMuted);
                          onSelectWeek(week);
                        }}
                        className={`btn-3d inline-flex min-h-[44px] items-center gap-2 rounded-xl border-b-[5px] px-5 py-2.5 text-sm font-bold whitespace-nowrap ${
                          isCompleted
                            ? 'border-emerald-800 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white hover:to-emerald-700'
                            : accent.activeBtn
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                            <span>Practicar de nuevo</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                            <span>¡Empezar semana!</span>
                          </>
                        )}
                      </button>
                    ) : !week.isImplemented ? (
                      <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-500 whitespace-nowrap">
                        <Sparkles className="h-4 w-4 text-amber-500" aria-hidden="true" />
                        <span>Malla MEN lista · Próximamente</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-xl border border-b-2 border-slate-300 bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-500 whitespace-nowrap">
                        <Lock className="h-4 w-4" aria-hidden="true" />
                        <span>Aprueba Sem {week.weekNumber - 1} con ≥80%</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Expandable 3D Flip + Tilt Vocabulary Flashcards */}
                {isVocabOpen && week.vocabularyPreview.length > 0 && (
                  <VocabFlashcardDeck items={week.vocabularyPreview} soundMuted={soundMuted} />
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Helpful 3D Footer Platform */}
      <footer className="panel-3d rounded-2xl p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="cube-3d flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-b-4 border-emerald-700 bg-emerald-100">
            <Rocket className="h-5 w-5 text-emerald-700" aria-hidden="true" />
          </span>
          <p className="text-sm text-slate-700">
            <strong>Modo Avance a tu Ritmo:</strong> Al completar cada semana con al menos{' '}
            <strong>80% de aciertos</strong>, desbloqueas de inmediato la siguiente semana para avanzar hasta en 7 meses.
          </p>
        </div>
        <p className="text-xs font-semibold text-slate-500 shrink-0">
          Guardado automático en este equipo
        </p>
      </footer>
    </main>
  );
};
