import { useEffect, useState } from 'react';
import { readSetting, writeSetting } from '../lib/storage';
type Session = { id: string | null; seconds: number; elapsed: number; running: boolean; paused: boolean; mode: 'stopwatch' | 'pomodoro'; phase: 'work' | 'break'; count: number; savedAt: number; recording: boolean };
const EMPTY: Session = { id: null, seconds: 0, elapsed: 0, running: false, paused: false, mode: 'stopwatch', phase: 'work', count: 0, savedAt: 0, recording: false };
function restore(): Session {
  const saved = readSetting<Session>('lumina-timer-v1', EMPTY);
  if (!saved?.id || !Number.isFinite(saved.seconds) || saved.seconds < 0 || !Number.isFinite(saved.elapsed) || saved.elapsed < 0 || !Number.isFinite(saved.savedAt) || !['stopwatch', 'pomodoro'].includes(saved.mode) || !['work', 'break'].includes(saved.phase)) return EMPTY;
  if (!saved.running || saved.paused) return saved;
  const passed = Math.max(0, Math.floor((Date.now() - saved.savedAt) / 1000));
  const delta = saved.mode === 'pomodoro' ? Math.min(passed, saved.seconds) : passed;
  return { ...saved, seconds: saved.mode === 'pomodoro' ? saved.seconds - delta : saved.seconds + delta,
    elapsed: saved.elapsed + (saved.mode === 'stopwatch' || saved.phase === 'work' ? delta : 0) };
}
export function useStudyTimer() {
  const [initial] = useState(restore);
  const [activeTimerId, setActiveTimerId] = useState(initial.id);
  const [timerSeconds, setTimerSeconds] = useState(initial.seconds);
  const [elapsedStudySeconds, setElapsedStudySeconds] = useState(initial.elapsed);
  const [isTimerRunning, setIsTimerRunning] = useState(initial.running);
  const [isTimerPaused, setIsTimerPaused] = useState(initial.paused);
  const [timerMode, setTimerMode] = useState(initial.mode);
  const [pomodoroPhase, setPomodoroPhase] = useState(initial.phase);
  const [pomodoroSessionCount, setPomodoroSessionCount] = useState(initial.count);
  const [showProgressInput, setShowProgressInput] = useState(initial.recording);
  useEffect(() => {
    writeSetting('lumina-timer-v1', { id: activeTimerId, seconds: timerSeconds, elapsed: elapsedStudySeconds,
      running: isTimerRunning, paused: isTimerPaused, mode: timerMode, phase: pomodoroPhase,
      count: pomodoroSessionCount, recording: showProgressInput, savedAt: Date.now() });
  }, [activeTimerId, timerSeconds, elapsedStudySeconds, isTimerRunning, isTimerPaused, timerMode, pomodoroPhase, pomodoroSessionCount, showProgressInput]);
  useEffect(() => {
    if (!activeTimerId || !isTimerRunning || isTimerPaused) return;
    let anchor = Date.now(), remaining = timerSeconds;
    const tick = () => {
      const delta = Math.max(0, Math.floor((Date.now() - anchor) / 1000));
      if (!delta) return;
      anchor += delta * 1000;
      const counted = timerMode === 'pomodoro' ? Math.min(delta, remaining) : delta;
      if (timerMode === 'pomodoro') { remaining = Math.max(0, remaining - counted); setTimerSeconds(remaining); }
      else setTimerSeconds(s => s + counted);
      if (timerMode === 'stopwatch' || pomodoroPhase === 'work') setElapsedStudySeconds(s => s + counted);
    };
    const timer = window.setInterval(tick, 250);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', tick); };
  }, [activeTimerId, isTimerRunning, isTimerPaused, timerMode, pomodoroPhase]);
  return { activeTimerId, setActiveTimerId, timerSeconds, setTimerSeconds, elapsedStudySeconds, setElapsedStudySeconds,
    isTimerRunning, setIsTimerRunning, isTimerPaused, setIsTimerPaused, timerMode, setTimerMode,
    pomodoroPhase, setPomodoroPhase, pomodoroSessionCount, setPomodoroSessionCount, showProgressInput, setShowProgressInput };
}
