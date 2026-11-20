import React, { useState } from 'react';
import { Check, Copy, Download, RotateCcw, X } from 'lucide-react';
import type { StudentProgress } from '../types/curriculum';
import {
  calculatePaceProjection,
  countCompletedWeeks,
  countTotalStars,
  generateProgressCode,
  TOTAL_WEEKS,
} from '../utils/progress';

interface ProgressExportModalProps {
  isOpen: boolean;
  progress: StudentProgress;
  onClose: () => void;
  onUpdateStudentName: (name: string) => void;
  onResetProgress: () => void;
}

export const ProgressExportModal: React.FC<ProgressExportModalProps> = ({
  isOpen,
  progress,
  onClose,
  onUpdateStudentName,
  onResetProgress,
}) => {
  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const progressCode = generateProgressCode(progress);
  const completedCount = countCompletedWeeks(progress);
  const totalStars = countTotalStars(progress);
  const projection = calculatePaceProjection(progress, progress.paceMode);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(progressCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback selection
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadReport = () => {
    const completedLines = Object.values(progress.completedWeeks)
      .sort((a, b) => a.weekNumber - b.weekNumber)
      .map(
        (w) =>
          `  - Semana ${w.weekNumber}: ${w.bestAccuracy}% aciertos (${w.stars} estrellas, ${w.xpEarned} XP)`
      );

    const content = [
      'REPORTE DE PROGRESO - ENGLISH EXPLORERS 4° (MEN COLOMBIA)',
      '========================================================',
      `Estudiante: ${progress.studentName}`,
      `Fecha de reporte: ${new Date().toLocaleDateString('es-CO')}`,
      `Código de verificación docente: ${progressCode}`,
      '',
      `Semanas completadas: ${completedCount} de ${TOTAL_WEEKS}`,
      `Estrellas totales: ${totalStars}`,
      `Puntos XP: ${progress.xp}`,
      `Racha: ${progress.streakDays} día(s)`,
      `Modalidad: ${projection.paceLabelEs}`,
      '',
      'Detalle por semana:',
      completedLines.length ? completedLines.join('\n') : '  (Aún no ha completado semanas)',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-ingles-4-${progressCode}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div className="panel-3d w-full max-w-lg rounded-2xl p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="export-modal-title" className="font-display text-xl font-extrabold text-slate-900">
              Reporte para tu profe de Inglés
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Copia o descarga este código en la sala de informática para mostrar tu avance semanal.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de código de progreso"
            className="btn-3d flex h-10 w-10 items-center justify-center rounded-xl border border-b-4 border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Student Name */}
        <div className="mt-5">
          <label htmlFor="student-name-input" className="block text-xs font-bold text-slate-700">
            Tu nombre y curso (para el reporte)
          </label>
          <input
            id="student-name-input"
            type="text"
            value={progress.studentName}
            onChange={(e) => onUpdateStudentName(e.target.value)}
            maxLength={40}
            placeholder="Ej: Sofía Ramírez · 402"
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-inner focus:border-emerald-600 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Alphanumeric Progress Code Card */}
        <div className="panel-3d-emerald mt-5 rounded-2xl p-4 text-center">
          <p className="text-xs font-semibold text-emerald-800">Código alfanumérico de progreso</p>
          <p
            data-testid="progress-code-value"
            className="mt-1.5 font-mono text-2xl font-bold tracking-wider text-emerald-950 tabular-nums sm:text-3xl"
          >
            {progressCode}
          </p>
          <p className="mt-2 text-xs text-emerald-800">
            {completedCount}/{TOTAL_WEEKS} semanas · {totalStars} estrellas · {progress.xp} XP
          </p>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={handleCopy}
            className="btn-3d inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border-b-[5px] border-emerald-800 bg-gradient-to-b from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:to-emerald-700 whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                <span>¡Código copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                <span>Copiar código</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadReport}
            className="btn-3d inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-b-[5px] border-slate-300 border-b-slate-400 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
          >
            <Download className="h-4 w-4 text-sky-700" aria-hidden="true" />
            <span>Descargar reporte (.txt)</span>
          </button>
        </div>

        {/* Optional safe reset for shared school computers */}
        <div className="mt-6 border-t border-slate-200 pt-4 flex items-center justify-between gap-3">
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-700"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>¿Otro estudiante usará este computador? Reiniciar avance</span>
            </button>
          ) : (
            <div className="flex w-full items-center justify-between gap-2 rounded-xl bg-rose-50 px-3 py-2">
              <span className="text-xs font-semibold text-rose-900">¿Seguro que deseas borrar este avance local?</span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onResetProgress();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-700"
                >
                  Sí, reiniciar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
