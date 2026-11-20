import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Lock, Play, Rocket, Sparkles, Star, Zap } from 'lucide-react';
import { CURRICULUM_MODULES, CURRICULUM_WEEKS } from '../data/curriculum';
import type { ModuleId, PaceMode, StudentProgress, WeekLesson } from '../types/curriculum';
import { calculatePaceProjection, PASS_ACCURACY_THRESHOLD, TOTAL_WEEKS } from '../utils/progress';
import { speakEnglish } from '../utils/speech';
import { MascotGuide } from './MascotGuide';

interface LearningPathProps {
  progress: StudentProgress;
  onSelectWeek: (week: WeekLesson) => void;
  onChangePaceMode: (mode: PaceMode) => void;
}

const MODULE_ACCENTS = {
  emerald: {
    banner: 'bg-emerald-600 text-white border-emerald-700',
    activeBtn: 'border-emerald-800 bg-emerald-600 text-white hover:bg-emerald-700',
    ring: 'ring-emerald-300',
    tabActive: 'bg-emerald-600 text-white',
  },
  sky: {
    banner: 'bg-sky-600 text-white border-sky-700',
    activeBtn: 'border-sky-800 bg-sky-600 text-white hover:bg-sky-700',
    ring: 'ring-sky-300',
    tabActive: 'bg-sky-600 text-white',
  },
  amber: {
    banner: 'bg-amber-600 text-white border-amber-700',
    activeBtn: 'border-amber-800 bg-amber-600 text-white hover:bg-amber-700',
    ring: 'ring-amber-300',
    tabActive: 'bg-amber-600 text-white',
  },
  indigo: {
    banner: 'bg-indigo-600 text-white border-indigo-700',
    activeBtn: 'border-indigo-800 bg-indigo-600 text-white hover:bg-indigo-700',
    ring: 'ring-indigo-300',
    tabActive: 'bg-indigo-600 text-white',
  },
};

export const LearningPath: React.FC<LearningPathProps> = ({
  progress,
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
      {/* Top Hero Grid: Mascot Welcome + Adaptive Dual Progress Bar */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-stretch">
        {/* Left: Adaptive Pace & Dual Progress Panel */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-emerald-700">
                Grado 4° · Malla Curricular MEN Colombia (36 semanas)
              </p>
              <h1 className="mt-1 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl text-balance">
                Tu ruta de aprendizaje en inglés
              </h1>
            </div>

            {/* Interactive Pace Mode Segmented Toggle */}
            <div
              className="flex w-full items-center gap-1 rounded-xl bg-slate-100 p-1 sm:w-auto"
              role="group"
              aria-label="Selector de ritmo de aprendizaje"
            >
              <button
                type="button"
                onClick={() => onChangePaceMode('standard_9m')}
                className={`min-h-[36px] flex-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors whitespace-nowrap sm:flex-initial sm:px-3 sm:text-xs ${
                  progress.paceMode === 'standard_9m'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Estándar (9 meses)
              </button>
              <button
                type="button"
                onClick={() => onChangePaceMode('fast_7m')}
                className={`inline-flex min-h-[36px] flex-1 items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors whitespace-nowrap sm:flex-initial sm:px-3 sm:text-xs ${
                  progress.paceMode === 'fast_7m'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Avance a tu ritmo (7m)</span>
              </button>
            </div>
          </div>

          {/* Dual Progress Bars: 9-month standard vs 7-month accelerated projection */}
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
              <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-300"
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
              <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-emerald-100">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${Math.max(projection.fastTrackPercent, 3)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Mascot Guide Card */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <MascotGuide
            bare
            mood={projection.completedCount > 0 ? 'happy' : 'neutral'}
            message={
              projection.completedCount === 0
                ? '¡Hola! Soy Beto. Completa la Semana 1 con 80% o más para abrir la Semana 2 hoy mismo.'
                : `¡Llevas ${projection.completedCount} semana(s) completada(s) y ${progress.xp} XP! Sigue así.`
            }
            subMessage={projection.paceLabelEs}
          />

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-600">
            <span>
              Módulo activo: <strong className="text-slate-900">{activeModule.titleEs}</strong>
            </span>
            <span className="font-semibold text-emerald-700 tabular-nums">
              Semana desbloqueada: #{progress.unlockedMaxWeek}
            </span>
          </div>
        </div>
      </section>

      {/* Module Selector Tabs (4 MEN Modules) */}
      <nav aria-label="Módulos curriculares del MEN" className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {CURRICULUM_MODULES.map((mod) => {
          const isActive = mod.id === selectedModuleId;
          const modWeeks = CURRICULUM_WEEKS.filter((w) => w.moduleId === mod.id);
          const completedInMod = modWeeks.filter((w) => Boolean(progress.completedWeeks[w.weekNumber])).length;

          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => setSelectedModuleId(mod.id)}
              className={`flex flex-col items-start rounded-2xl border p-3.5 text-left transition-all focus-visible:outline-2 focus-visible:outline-sky-600 ${
                isActive
                  ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="text-2xl" aria-hidden="true">{mod.iconEmoji}</span>
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

      {/* Selected Module Banner */}
      <section className={`rounded-2xl border p-5 sm:p-6 ${accent.banner}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold opacity-90">{activeModule.menStandard}</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">
              Módulo {activeModule.id}: {activeModule.titleEn} — {activeModule.titleEs}
            </h2>
            <p className="mt-1.5 max-w-3xl text-sm opacity-95">{activeModule.subtitleEs}</p>
          </div>
          <span className="text-5xl self-start sm:self-center" aria-hidden="true">
            {activeModule.iconEmoji}
          </span>
        </div>
      </section>

      {/* Duolingo-Style Winding Weekly Path */}
      <section aria-label={`Ruta de semanas del Módulo ${activeModule.id}`} className="space-y-4">
        {moduleWeeks.map((week, idx) => {
          const completion = progress.completedWeeks[week.weekNumber];
          const isCompleted = Boolean(completion);
          const isUnlocked = week.weekNumber <= progress.unlockedMaxWeek;
          const canPlay = week.isImplemented && isUnlocked;

          // Gentle zig-zag horizontal offset on desktop to evoke Duolingo path
          const zigzagOffsets = [
            'lg:ml-0 lg:mr-auto',
            'lg:mx-auto',
            'lg:ml-auto lg:mr-0',
            'lg:mx-auto',
          ];
          const offsetClass = zigzagOffsets[idx % zigzagOffsets.length];

          const isVocabOpen = previewVocabWeek === week.weekNumber;

          return (
            <div key={week.weekNumber} className={`w-full lg:max-w-3xl ${offsetClass}`}>
              <div
                className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                  isCompleted
                    ? 'border-emerald-300 bg-white'
                    : canPlay
                      ? `border-emerald-500 bg-white ring-4 ${accent.ring}`
                      : 'border-slate-200 bg-slate-50/90'
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Week Node & Info */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border-b-4 font-display font-extrabold tabular-nums ${
                        isCompleted
                          ? 'border-emerald-700 bg-emerald-500 text-white'
                          : canPlay
                            ? 'border-sky-700 bg-sky-500 text-white'
                            : 'border-slate-300 bg-slate-200 text-slate-500'
                      }`}
                    >
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

                      {/* Stars & Best Accuracy if completed */}
                      {completion && (
                        <div className="mt-2 flex items-center gap-3 text-xs font-bold text-emerald-800">
                          <span className="inline-flex items-center gap-0.5" aria-label={`${completion.stars} de 3 estrellas`}>
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`h-4 w-4 ${
                                  s <= completion.stars
                                    ? 'fill-amber-400 text-amber-500'
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

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {week.isImplemented && week.vocabularyPreview.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewVocabWeek(isVocabOpen ? null : week.weekNumber)
                        }
                        className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                      >
                        <BookOpen className="h-4 w-4 text-sky-600" aria-hidden="true" />
                        <span>{isVocabOpen ? 'Ocultar palabras' : 'Vocabulario'}</span>
                      </button>
                    )}

                    {canPlay ? (
                      <button
                        type="button"
                        onClick={() => onSelectWeek(week)}
                        className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl border-b-4 px-5 py-2.5 text-sm font-bold transition-transform active:translate-y-0.5 whitespace-nowrap ${
                          isCompleted
                            ? 'border-emerald-700 bg-emerald-600 text-white hover:bg-emerald-700'
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
                      <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-500 whitespace-nowrap">
                        <Lock className="h-4 w-4" aria-hidden="true" />
                        <span>Aprueba Sem {week.weekNumber - 1} con ≥80%</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Expandable Vocabulary Preview Bar (tap to hear pronunciation!) */}
                {isVocabOpen && week.vocabularyPreview.length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="mb-2.5 text-xs font-bold text-slate-500">
                      Toca cualquier tarjeta para escuchar su pronunciación en inglés:
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
                      {week.vocabularyPreview.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => speakEnglish(v.word)}
                          className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center transition-colors hover:border-sky-300 hover:bg-sky-50"
                        >
                          <span className="text-2xl" aria-hidden="true">{v.emoji}</span>
                          <span className="mt-1 font-display text-sm font-bold text-slate-900">
                            {v.word}
                          </span>
                          <span className="text-[11px] text-slate-500">{v.spanish}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Helpful Footer Tip for Fast-Track Mode */}
      <footer className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Rocket className="h-6 w-6 shrink-0 text-emerald-600" aria-hidden="true" />
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
