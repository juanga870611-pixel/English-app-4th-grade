import { useEffect, useState } from 'react';
import { CURRICULUM_WEEKS } from './data/curriculum';
import type { PaceMode, StudentProgress, WeekLesson } from './types/curriculum';
import {
  applyWeekCompletion,
  createInitialProgress,
  STORAGE_KEY,
} from './utils/progress';
import { TopHudBar } from './components/TopHudBar';
import { LearningPath } from './components/LearningPath';
import { LessonRunner } from './components/LessonRunner';
import { ProgressExportModal } from './components/ProgressExportModal';

function loadProgressFromStorage(): StudentProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProgress();
    const parsed = JSON.parse(raw) as Partial<StudentProgress>;
    return {
      ...createInitialProgress(),
      ...parsed,
      completedWeeks: parsed.completedWeeks ?? {},
    };
  } catch {
    return createInitialProgress();
  }
}

export default function App() {
  const [progress, setProgress] = useState<StudentProgress>(() => loadProgressFromStorage());
  const [activeSession, setActiveSession] = useState<{
    weekNumber: number;
    mode: 'full' | 'speaking_only';
  } | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Auto-save progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors
    }
  }, [progress]);

  const activeWeek: WeekLesson | undefined =
    activeSession !== null
      ? CURRICULUM_WEEKS.find((w) => w.weekNumber === activeSession.weekNumber)
      : undefined;

  const nextWeekAfterActive =
    activeWeek !== undefined
      ? CURRICULUM_WEEKS.find((w) => w.weekNumber === activeWeek.weekNumber + 1)
      : undefined;

  const handleFinishWeek = (accuracy: number) => {
    if (!activeWeek) {
      return {
        starsEarned: 1 as const,
        xpEarned: 0,
        passed: false,
        unlockedNextWeek: false,
      };
    }

    const result = applyWeekCompletion(
      progress,
      activeWeek.weekNumber,
      accuracy,
      activeWeek.challenges.length
    );

    setProgress(result.nextProgress);

    return {
      starsEarned: result.starsEarned,
      xpEarned: result.xpEarned,
      passed: result.passed,
      unlockedNextWeek: result.unlockedNextWeek,
    };
  };

  const handleChangePaceMode = (paceMode: PaceMode) => {
    setProgress((prev) => ({ ...prev, paceMode }));
  };

  const handleToggleMute = () => {
    setProgress((prev) => ({ ...prev, soundMuted: !prev.soundMuted }));
  };

  const handleUpdateStudentName = (studentName: string) => {
    setProgress((prev) => ({ ...prev, studentName }));
  };

  const handleResetProgress = () => {
    const fresh = createInitialProgress();
    setProgress(fresh);
    setActiveSession(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/80 via-slate-50 to-emerald-50/50 text-slate-900">
      <TopHudBar
        progress={progress}
        onOpenExport={() => setExportModalOpen(true)}
        onToggleMute={handleToggleMute}
      />

      {activeWeek && activeSession ? (
        <LessonRunner
          key={`${activeWeek.weekNumber}-${activeSession.mode}`}
          week={activeWeek}
          mode={activeSession.mode}
          soundMuted={progress.soundMuted}
          hasNextPlayableWeek={Boolean(nextWeekAfterActive?.isImplemented)}
          onExit={() => setActiveSession(null)}
          onSwitchToFullWeek={() =>
            setActiveSession({ weekNumber: activeWeek.weekNumber, mode: 'full' })
          }
          onFinishWeek={handleFinishWeek}
          onGoToNextWeek={() => {
            if (nextWeekAfterActive?.isImplemented) {
              setActiveSession({ weekNumber: nextWeekAfterActive.weekNumber, mode: 'full' });
            } else {
              setActiveSession(null);
            }
          }}
        />
      ) : (
        <LearningPath
          progress={progress}
          soundMuted={progress.soundMuted}
          onSelectWeek={(week, mode = 'full') =>
            setActiveSession({ weekNumber: week.weekNumber, mode })
          }
          onChangePaceMode={handleChangePaceMode}
        />
      )}

      <ProgressExportModal
        isOpen={exportModalOpen}
        progress={progress}
        onClose={() => setExportModalOpen(false)}
        onUpdateStudentName={handleUpdateStudentName}
        onResetProgress={handleResetProgress}
      />
    </div>
  );
}
