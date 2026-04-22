import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { Plus, Calendar, BookOpen, CheckCircle2, Clock, ChevronRight, X, Settings, LogOut, LogIn, Trash2, Sun, Moon, Zap, Play, Pause, Square, Edit3, Coffee, Brain, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { format, differenceInDays, isPast, isToday, startOfDay, formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';
import { translations, Language } from './translations';

import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  setDoc,
  doc, 
  deleteDoc, 
  serverTimestamp,
  Timestamp,
  User,
  getDocFromServer
} from './lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // alert("エラーが発生しました。詳細はコンソールを確認してください。");
}

interface ActivityLog {
  id: string;
  taskId: string;
  taskTitle: string;
  timestamp: any; // Using any for simplicity with Timestamp/Date mix
  durationMinutes: number;
  progressIncrement: number;
  type: 'pages' | 'percentage';
}

interface Submission {
  id: string;
  title: string;
  subject: string;
  deadline: any;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  description?: string;
  taskType: 'pages' | 'percentage';
  startPage?: number;
  endPage?: number;
  currentPage?: number;
  isDeleted?: boolean;
  deletedAt?: any;
  completedAt?: any;
  uid: string;
  createdAt: any;
  activityLogs?: ActivityLog[];
}

const DEFAULT_SUBJECTS = [
  "国語", "数学", "英語", "物理", "化学", "生物", "地学", 
  "世界史", "日本史", "地理", "現代社会", "倫理", "政治・経済", "情報", "その他"
];

const APP_VERSION = '1.1.0';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Submission | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [addTaskType, setAddTaskType] = useState<'pages' | 'percentage'>('percentage');
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  
  // Theme and Language state
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'ja';
  });
  const [modalPriority, setModalPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('app-theme');
    return (saved as 'light' | 'dark') || 'light';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [subjects, setSubjects] = useState<string[]>(() => {
    const saved = localStorage.getItem('app-subjects');
    return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS;
  });
  const [newSubject, setNewSubject] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFocusSelectorOpen, setIsFocusSelectorOpen] = useState(false);
  const [deadlineTime, setDeadlineTime] = useState("23:59");

  // Timer states
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [showProgressInput, setShowProgressInput] = useState(false);
  const [progressInputValue, setProgressInputValue] = useState("");
  
  // Pomodoro states
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'pomodoro'>('stopwatch');
  const [pomodoroPhase, setPomodoroPhase] = useState<'work' | 'break'>('work');
  const [pomodoroSessionCount, setPomodoroSessionCount] = useState(0);
  const [pomodoroDurations, setPomodoroDurations] = useState({ work: 25 * 60, break: 5 * 60 });
  const [showDigitalTimer, setShowDigitalTimer] = useState(true);

  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
  } | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const t = translations[language];

  // Update Notification Logic
  useEffect(() => {
    const savedVersion = localStorage.getItem('app-version');
    if (savedVersion !== APP_VERSION) {
      setShowUpdateModal(true);
    }
  }, []);

  const closeUpdateModal = () => {
    localStorage.setItem('app-version', APP_VERSION);
    setShowUpdateModal(false);
  };

  // Logic to load settings from Firestore upon login
  useEffect(() => {
    if (!user) return;

    // Listen for remote settings changes
    const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Only update if different and not currently syncing local changes
        if (data.theme && data.theme !== theme) setTheme(data.theme);
        if (data.language && data.language !== language) setLanguage(data.language);
        if (data.subjects && JSON.stringify(data.subjects) !== JSON.stringify(subjects)) {
          setSubjects(data.subjects);
        }
        if (data.pomodoroDurations && JSON.stringify(data.pomodoroDurations) !== JSON.stringify(pomodoroDurations)) {
          setPomodoroDurations(data.pomodoroDurations);
        }
      } else {
        // First time login - push current local settings to firestore
        setDoc(doc(db, 'users', user.uid), {
          theme,
          language,
          subjects,
          pomodoroDurations
        }, { merge: true });
      }
    });

    return () => unsub();
  }, [user]);

  // Keep track of latest settings to reliably sync on tab close
  const latestSettings = useRef({ theme, language, subjects, pomodoroDurations });
  useEffect(() => {
    latestSettings.current = { theme, language, subjects, pomodoroDurations };
  }, [theme, language, subjects, pomodoroDurations]);

  // Sync state changes to Firestore (Debounced to avoid excessive writes)
  useEffect(() => {
    if (!user) return;
    
    setIsSyncing(true);
    const timeout = setTimeout(async () => {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          ...latestSettings.current
        }, { merge: true });
        setIsSyncing(false);
      } catch (e) {
        console.warn("Failed to sync settings to cloud", e);
        setIsSyncing(false);
      }
    }, 30000); // 30s debounce to reduce write frequency

    return () => clearTimeout(timeout);
  }, [theme, language, subjects, pomodoroDurations, user]);

  // Emergency sync on tab close or page hide
  useEffect(() => {
    if (!user) return;

    const performSync = () => {
      setDoc(doc(db, 'users', user.uid), {
        ...latestSettings.current
      }, { merge: true }).catch(console.warn);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        performSync();
      }
    };

    window.addEventListener('beforeunload', performSync);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', performSync);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  useEffect(() => {
    localStorage.setItem('app-subjects', JSON.stringify(subjects));
  }, [subjects]);

  // Apply theme to body
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const overallProgress = useMemo(() => {
    // Only current active tasks (exclude deleted and already completed)
    const activeTasks = submissions.filter(s => !s.isDeleted && s.status !== 'completed');
    
    if (activeTasks.length === 0) {
      // Check if there are any completed tasks (not deleted)
      const hasCompleted = submissions.some(s => !s.isDeleted && s.status === 'completed');
      return hasCompleted ? 100 : 0;
    }
    
    const totalProgress = activeTasks.reduce((sum, s) => sum + (s.progress || 0), 0);
    return Math.round(totalProgress / activeTasks.length);
  }, [submissions]);

  const nearestDeadlinesCount = useMemo(() => {
    return submissions.filter(s => 
      !s.isDeleted &&
      s.status !== 'completed' && 
      differenceInDays(s.deadline, new Date()) <= 2
    ).length;
  }, [submissions]);

  const previewProgress = useMemo(() => {
    if (!activeTimerId || !progressInputValue) return null;
    const submission = submissions.find(s => s.id === activeTimerId);
    if (!submission) return null;

    const increment = parseInt(progressInputValue) || 0;
    let newProgress = submission.progress;

    if (submission.taskType === 'pages') {
      const newCurrentPage = (submission.currentPage || 0) + increment;
      const totalPages = (submission.endPage || 0) - (submission.startPage || 0);
      if (totalPages <= 0) return 100;
      newProgress = Math.min(100, Math.round(((newCurrentPage - (submission.startPage || 0)) / totalPages) * 100));
    } else {
      newProgress = Math.min(100, submission.progress + increment);
    }
    return newProgress;
  }, [activeTimerId, progressInputValue, submissions]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Check for upcoming deadlines and notify
  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date();
      submissions.forEach(s => {
        if (s.status === 'completed') return;
        
        const diff = s.deadline.getTime() - now.getTime();
        const oneHour = 1000 * 60 * 60;
        
        // Notify if deadline is within 1 hour and not already notified (simple session-based check)
        if (diff > 0 && diff < oneHour) {
          const storageKey = `notified_${s.id}`;
          if (!sessionStorage.getItem(storageKey)) {
            new Notification("締切間近の課題があります", {
              body: `${s.subject}: ${s.title} の締切まであと1時間以内です！`,
              icon: "/Gemini_Generated_Image_pm2flopm2flopm2f.png"
            });
            sessionStorage.setItem(storageKey, "true");
          }
        }
      });
    };

    const interval = setInterval(checkDeadlines, 1000 * 60 * 5); // Check every 5 minutes
    checkDeadlines(); // Initial check
    
    return () => clearInterval(interval);
  }, [submissions]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Connection test
  useEffect(() => {
    if (isAuthReady && user) {
      const testConnection = async () => {
        try {
          await getDocFromServer(doc(db, 'test', 'connection'));
        } catch (error) {
          if (error instanceof Error && error.message.includes('the client is offline')) {
            console.error("Please check your Firebase configuration. The client is offline.");
          }
        }
      };
      testConnection();
    }
  }, [isAuthReady, user]);

  // Firestore listener
  useEffect(() => {
    if (!user) {
      setSubmissions([]);
      return;
    }

    const q = query(
      collection(db, 'submissions'),
      where('uid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          ...docData,
          id: doc.id,
          deadline: (docData.deadline as Timestamp).toDate(),
        } as Submission;
      });
      setSubmissions(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'submissions');
    });

    return () => unsubscribe();
  }, [user]);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && !isTimerPaused) {
      interval = setInterval(() => {
        if (timerMode === 'stopwatch') {
          setTimerSeconds(s => s + 1);
        } else {
          setTimerSeconds(s => {
            if (s <= 0) {
              // Phase finished
              handlePomodoroPhaseComplete();
              return 0;
            }
            return s - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isTimerPaused, timerMode]);

  const handlePomodoroPhaseComplete = () => {
    setIsTimerRunning(false);
    
    if (pomodoroPhase === 'work') {
      setPomodoroPhase('break');
      setTimerSeconds(pomodoroDurations.break);
      setPomodoroSessionCount(c => c + 1);
      
      new Notification(t.workPhase + " " + (language === 'ja' ? '終了！' : 'Finished!'), {
        body: t.breakPhase + (language === 'ja' ? 'を始めましょう。' : ' starting now.'),
        icon: "/Gemini_Generated_Image_pm2flopm2flopm2f.png"
      });
      
      // Auto-start break? or wait for user?
      // For now, wait for user to hit "Start Break" or similar
    } else {
      setPomodoroPhase('work');
      setTimerSeconds(pomodoroDurations.work);
      
      new Notification(t.breakPhase + " " + (language === 'ja' ? '終了！' : 'Finished!'), {
        body: t.workPhase + (language === 'ja' ? 'を再開しましょう。' : ' starting now.'),
        icon: "/Gemini_Generated_Image_pm2flopm2flopm2f.png"
      });
    }

    // Play alert sound if we had one
    if (Notification.permission === 'granted') {
      // already did notification
    }
  };

  const startTimer = (id: string, mode: 'stopwatch' | 'pomodoro' = 'stopwatch') => {
    setActiveTimerId(id);
    setTimerMode(mode);
    setPomodoroPhase('work');
    setPomodoroSessionCount(0);
    
    if (mode === 'stopwatch') {
      setTimerSeconds(0);
    } else {
      setTimerSeconds(pomodoroDurations.work);
    }

    setIsTimerRunning(true);
    setIsTimerPaused(false);
    setShowProgressInput(false);
    setProgressInputValue("");
    setSelectedId(null); // Close detail view
  };

  const togglePause = () => {
    setIsTimerPaused(!isTimerPaused);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    setIsTimerPaused(false);
    setShowProgressInput(true);
  };

  const saveActivity = async (increment: number) => {
    if (!activeTimerId) return;
    const submission = submissions.find(s => s.id === activeTimerId);
    if (!submission) return;

    // Validate increment based on task type
    const isPagesValue = submission.taskType === 'pages';
    const maxIncrement = isPagesValue ? 999 : 100;
    
    if (increment <= 0 || increment > maxIncrement) {
      showToast(isPagesValue ? (language === 'ja' ? '正当なページ数を入力してください' : 'Enter a valid page count') : t.invalidProgressInput);
      return;
    }

    const currentTimerId = activeTimerId;
    
    // Reset states first to close the UI immediately
    setActiveTimerId(null);
    setShowProgressInput(false);
    setTimerSeconds(0);
    setProgressInputValue("");

    const durationMinutes = Math.round(timerSeconds / 60) || 1;
    const newLog = {
      id: crypto.randomUUID(),
      timestamp: Timestamp.now(),
      durationMinutes,
      progressIncrement: increment,
      type: submission.taskType
    };

    let newProgress = submission.progress;
    let newCurrentPage = submission.currentPage || 0;

    if (submission.taskType === 'pages') {
      newCurrentPage += increment;
      const totalPages = (submission.endPage || 0) - (submission.startPage || 0);
      newProgress = Math.min(100, Math.round(((newCurrentPage - (submission.startPage || 0)) / totalPages) * 100));
    } else {
      newProgress = Math.min(100, submission.progress + increment);
    }

    try {
      // Logic for 100% completion check
      let finalStatus = newProgress === 100 ? 'completed' : 'in-progress';
      let finalProgress = newProgress;
      let finalCompletedAt = newProgress === 100 ? serverTimestamp() : submission.completedAt || null;

      if (newProgress === 100 && submission.status !== 'completed') {
        setConfirmDialog({
          title: t.complete,
          message: t.askToComplete,
          onConfirm: async () => {
            await finalizeActivity(currentTimerId, newCurrentPage, 100, 'completed', [...(submission.activityLogs || []), newLog], serverTimestamp());
            setConfirmDialog(null);
          },
          onCancel: async () => {
            await finalizeActivity(currentTimerId, newCurrentPage, 99, 'in-progress', [...(submission.activityLogs || []), newLog], null);
            setConfirmDialog(null);
          }
        });
        return;
      }

      await finalizeActivity(currentTimerId, newCurrentPage, finalProgress, finalStatus, [...(submission.activityLogs || []), newLog], finalCompletedAt);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `submissions/${activeTimerId}`);
    }
  };

  const finalizeActivity = async (id: string, currentPage: number, progress: number, status: string, activityLogs: any[], completedAt: any) => {
    try {
      await updateDoc(doc(db, 'submissions', id), {
        progress,
        currentPage,
        status,
        activityLogs,
        completedAt
      });

      if (status === 'completed') {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        showToast(t.taskCompletedMessage);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `submissions/${id}`);
    }
  };

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const addSubmission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const subject = formData.get('subject') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as 'low' | 'medium' | 'high';
    const taskType = formData.get('taskType') as 'pages' | 'percentage';
    const startPage = parseInt(formData.get('startPage') as string) || 0;
    const endPage = parseInt(formData.get('endPage') as string) || 0;
    const dateValue = formData.get('deadlineDate') as string;
    const timeValue = formData.get('deadlineTime') as string || "23:59";

    if (!title || !subject || !dateValue) return;

    const [hours, minutes] = timeValue.split(':').map(Number);
    const [y, m, d] = dateValue.split('-').map(Number);
    const combinedDate = new Date(y, m - 1, d, hours, minutes, 0, 0);

    try {
      await addDoc(collection(db, 'submissions'), {
        uid: user.uid,
        title,
        subject,
        deadline: Timestamp.fromDate(combinedDate),
        description: description || '',
        priority: priority || 'medium',
        progress: 0,
        status: 'pending',
        createdAt: serverTimestamp(),
        taskType,
        startPage: taskType === 'pages' ? startPage : null,
        endPage: taskType === 'pages' ? endPage : null,
        currentPage: taskType === 'pages' ? startPage : 0,
        activityLogs: []
      });
      setIsAdding(false);
      setSelectedDate(new Date());
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'submissions');
    }
  };

  const updateSubmission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !editData || !selectedDate) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const subject = formData.get('subject') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as 'low' | 'medium' | 'high';
    const progressValue = formData.get('progress');
    const progress = progressValue !== null ? (parseInt(progressValue as string) || 0) : editData.progress;
    const dateValue = formData.get('deadlineDate') as string;
    const timeValue = formData.get('deadlineTime') as string || "23:59";

    if (!title || !subject || !dateValue) return;

    const [hours, minutes] = timeValue.split(':').map(Number);
    const [y, m, d] = dateValue.split('-').map(Number);
    const combinedDate = new Date(y, m - 1, d, hours, minutes, 0, 0);

    const isCompleting = progress === 100 && editData.status !== 'completed';
    if (isCompleting) {
      setConfirmDialog({
        title: t.complete,
        message: t.confirmComplete,
        onConfirm: async () => {
          try {
            await updateDoc(doc(db, 'submissions', editData.id), {
              title, subject, description, priority, progress,
              deadline: Timestamp.fromDate(combinedDate),
              status: 'completed',
              completedAt: editData.completedAt || serverTimestamp()
            });
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            showToast(t.taskCompletedMessage);
            setIsEditing(false);
            setEditData(null);
            setConfirmDialog(null);
          } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `submissions/${editData.id}`);
          }
        },
        onCancel: () => setConfirmDialog(null)
      });
      return;
    }

    try {
      await updateDoc(doc(db, 'submissions', editData.id), {
        title, subject, description, priority, progress,
        deadline: Timestamp.fromDate(combinedDate),
        status: editData.status === 'completed' ? 'completed' : progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'pending',
        completedAt: (progress === 100 || editData.status === 'completed') ? (editData.completedAt || serverTimestamp()) : null
      });
      setIsEditing(false);
      setEditData(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `submissions/${editData.id}`);
    }
  };

  const toggleComplete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const submission = submissions.find(s => s.id === id);
    if (!submission) return;

    const isCompleting = submission.status !== 'completed';
    
    if (isCompleting) {
      setConfirmDialog({
        title: t.complete,
        message: t.confirmComplete,
        onConfirm: async () => {
          await performToggle(id, true);
          setConfirmDialog(null);
        },
        onCancel: () => setConfirmDialog(null)
      });
    } else {
      await performToggle(id, false);
    }
  };

  const performToggle = async (id: string, isCompleting: boolean) => {
    const submission = submissions.find(s => s.id === id);
    if (!submission) return;
    try {
      await updateDoc(doc(db, 'submissions', id), {
        status: isCompleting ? 'completed' : 'in-progress',
        progress: isCompleting ? 100 : submission.progress,
        completedAt: isCompleting ? serverTimestamp() : null
      });

      if (isCompleting) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#364fc7', '#2b8a3e', '#fab005', '#fa5252']
        });
        showToast(t.taskCompletedMessage);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `submissions/${id}`);
    }
  };

  // Calculate overall urgency for background color
  const urgencyLevel = useMemo(() => {
    const activeSubmissions = submissions.filter(s => s.status !== 'completed');
    if (activeSubmissions.length === 0) return 'safe';
    
    const daysToNearest = Math.min(...activeSubmissions.map(s => differenceInDays(s.deadline, new Date())));
    
    if (daysToNearest <= 0) return 'danger';
    if (daysToNearest <= 3) return 'warning';
    return 'safe';
  }, [submissions]);

  const groupedSubmissions = useMemo(() => {
    const groups: { [key: string]: Submission[] } = {};
    const filtered = submissions.filter(s => {
      // Archive tab: show both completed and soft-deleted tasks
      if (activeTab === 'history') {
        const isMatch = s.status === 'completed' || s.isDeleted;
        if (!isMatch) return false;
        return subjectFilter ? s.subject === subjectFilter : true;
      }
      
      // Active tab: only show non-completed, non-deleted
      const isActive = !s.isDeleted && s.status !== 'completed';
      if (!isActive) return false;
      return subjectFilter ? s.subject === subjectFilter : true;
    });
    
    filtered.forEach(s => {
      if (!groups[s.subject]) groups[s.subject] = [];
      groups[s.subject].push(s);
    });
    return groups;
  }, [submissions, activeTab, subjectFilter]);

  const selectedSubmission = submissions.find(s => s.id === selectedId);

  const recentActivities = useMemo(() => {
    return submissions
      .flatMap(s => (s.activityLogs || []).map(log => ({ ...log, taskTitle: s.title })))
      .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
      .slice(0, 3);
  }, [submissions]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-ios-blue border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[var(--m3-surface)]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full m3-card text-center shadow-xl"
        >
          <div className="w-20 h-20 bg-[var(--m3-primary-container)] rounded-full flex items-center justify-center mx-auto mb-8 text-[var(--m3-on-primary-container)]">
            <BookOpen className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--m3-on-surface)] mb-4">{t.appName}</h1>
          <p className="text-[var(--m3-on-surface-variant)] mb-10 leading-relaxed">
            {language === 'ja' ? (
              <>提出物を美しく管理しましょう。<br />Googleアカウントでログインして開始します。</>
            ) : (
              <>Manage your assignments beautifully.<br />Sign in with Google to get started.</>
            )}
          </p>
          <button 
            onClick={login}
            className="w-full m3-button-primary"
          >
            <LogIn className="w-5 h-5" />
            {language === 'ja' ? 'Googleでログイン' : 'Sign in with Google'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[var(--m3-surface)] text-[var(--m3-on-surface)]">
      {/* Update Notification Modal */}
      <AnimatePresence>
        {showUpdateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="m3-card !bg-[var(--m3-surface-container-high)] w-full max-w-md p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Zap className="w-32 h-32 text-[var(--m3-primary)]" />
              </div>
              <div className="relative space-y-6 text-left">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--m3-primary)]/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-[var(--m3-primary)]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[var(--m3-on-surface)]">
                      {language === 'ja' ? 'アップデートのお知らせ' : 'Update Notice'}
                    </h2>
                    <div className="text-[10px] font-black text-[var(--m3-primary)] uppercase tracking-widest">Version {APP_VERSION}</div>
                  </div>
                </div>

                <div className="space-y-4 py-2">
                  <h3 className="text-sm font-black text-[var(--m3-on-surface-variant)] uppercase tracking-wider px-1">
                    {language === 'ja' ? '主な変更点' : 'Latest Changes'}
                  </h3>
                  <ul className="space-y-3">
                    {[
                      { 
                        ja: 'タスク編集時の進捗リセット不具合を修正', 
                        en: 'Fixed progress reset bug in task editing' 
                      },
                      { 
                        ja: 'タスク追加ボタンのデザインを刷新', 
                        en: 'New design for the Add Task button' 
                      },
                      { 
                        ja: 'ファビコン表示の不具合を修正', 
                        en: 'Fixed favicon display reliability' 
                      },
                      { 
                        ja: 'タイマー機能と同期の安定性向上', 
                        en: 'Better timer and sync stability' 
                      }
                    ].map((item, idx) => (
                      <motion.li 
                        key={idx}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 * idx }}
                        className="flex items-start gap-3"
                      >
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--m3-primary)] shrink-0" />
                        <span className="text-sm font-bold text-[var(--m3-on-surface)] leading-relaxed">
                          {language === 'ja' ? item.ja : item.en}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={closeUpdateModal}
                  className="w-full m3-button-primary mt-4"
                >
                  {language === 'ja' ? '確認しました' : 'Got it!'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1440px] mx-auto h-screen flex flex-col p-3 sm:p-5 lg:p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t.appName}</h1>
            <p className="text-[10px] sm:text-xs text-[var(--m3-on-surface-variant)] mt-0.5 font-medium">
              {format(new Date(), language === 'ja' ? 'M月d日 (EEEE)' : 'MMMM d (EEEE)', { locale: language === 'ja' ? ja : undefined })}
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex items-center gap-1 sm:gap-3"
          >
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 rounded-full hover:bg-[var(--m3-surface-container)] text-[var(--m3-on-surface-variant)] transition-all active:scale-95"
              title={t.settings}
            >
              <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button 
              onClick={logout}
              className="p-3 rounded-full hover:bg-[var(--m3-error-container)]/50 text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-error)] transition-all active:scale-95"
              title="Logout"
            >
              <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full m3-card p-0 flex items-center justify-center overflow-hidden border-2 border-[var(--m3-primary)]/20 shadow-sm ml-2">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--m3-primary-container)] flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-[var(--m3-on-primary-container)]" />
                </div>
              )}
            </div>
          </motion.div>
        </header>

        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[300px_1fr] gap-8 lg:gap-10 overflow-hidden">
          {/* Sidebar */}
          <aside className="flex flex-row lg:flex-col gap-6 lg:gap-8 overflow-x-auto lg:overflow-y-auto pb-6 lg:pb-0 lg:pr-4 lg:border-r border-[var(--m3-outline-variant)]/40">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="segmented-control w-full min-w-[280px] lg:min-w-0"
            >
              <button 
                onClick={() => {
                  setActiveTab('active');
                  setSubjectFilter(null);
                }}
                className={cn(
                  "segmented-item",
                  activeTab === 'active' ? "segmented-item-active" : "segmented-item-inactive"
                )}
              >
                <Clock className="w-4 h-4" />
                {t.active}
              </button>
              <button 
                onClick={() => {
                  setActiveTab('history');
                  setSubjectFilter(null);
                }}
                className={cn(
                  "segmented-item",
                  activeTab === 'history' ? "segmented-item-active" : "segmented-item-inactive"
                )}
              >
                <BookOpen className="w-4 h-4" />
                {t.archive}
              </button>
            </motion.div>

            <div className="hidden lg:block h-px bg-[var(--m3-outline)]/20 my-2" />

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-[var(--m3-primary-container)] rounded-[28px] p-6 w-full min-w-[180px] lg:min-w-0 shadow-sm shrink-0"
            >
              <div className="text-[10px] text-[var(--m3-on-primary-container)] opacity-70 uppercase tracking-[0.15em] font-black mb-1">{t.progress}</div>
              <div className="flex items-baseline gap-1 text-[var(--m3-on-primary-container)]">
                <span className="text-4xl font-light tracking-tighter">{overallProgress}</span>
                <span className="text-sm font-bold opacity-70">%</span>
              </div>
              <div className="h-2 w-full bg-[var(--m3-on-primary-container)]/10 rounded-full mt-4 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
                  className="h-full bg-[var(--m3-primary)]"
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
              className="bg-[var(--m3-surface-container-high)] rounded-[28px] p-6 w-full min-w-[220px] lg:min-w-0 shadow-sm border border-[var(--m3-outline-variant)]/20 shrink-0"
            >
              <div className="text-[10px] lg:text-[11px] text-[var(--m3-on-surface-variant)] uppercase tracking-wider font-black mb-2">{t.upcoming}</div>
              <div className="text-3xl lg:text-4xl font-light tracking-tighter text-[var(--m3-on-surface)]">
                {nearestDeadlinesCount.toString().padStart(2, '0')}
              </div>
              <div className="text-[10px] font-bold text-[var(--m3-on-surface-variant)] opacity-60 mt-1">{language === 'ja' ? '今後48時間以内' : 'Within 48 hours'}</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
              className="m3-card w-full min-w-[220px] lg:min-w-0 shadow-none border border-[var(--m3-outline)]/10 hidden sm:flex flex-col shrink-0 mb-8"
            >
              <div className="text-[10px] lg:text-[11px] text-[var(--m3-on-surface-variant)] uppercase tracking-wider font-bold mb-3">{t.recentActivity}</div>
              <div className="space-y-3">
                {recentActivities.length > 0 ? (
                  recentActivities.map(log => (
                    <div key={log.id} className="border-l-2 border-[var(--m3-primary)]/30 pl-2.5 py-0.5">
                      <div className="text-[11px] font-bold text-[var(--m3-on-surface)] line-clamp-1">{log.taskTitle}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] text-[var(--m3-on-surface-variant)] font-medium">
                          {formatDistanceToNow(log.timestamp.toDate(), { addSuffix: true, locale: language === 'ja' ? ja : undefined })}
                        </span>
                        <span className="text-[9px] text-[var(--m3-primary)] font-bold">
                          +{log.progressIncrement}{log.type === 'pages' ? 'p' : '%'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[10px] text-[var(--m3-on-surface-variant)] italic">{t.noActivity}</div>
                )}
              </div>
            </motion.div>
          </aside>

          {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 lg:pb-20 lg:pr-2">
        {/* Subject Filter Bar */}
        <div className="mb-6 overflow-x-auto no-scrollbar py-1">
          <div className="flex gap-2 min-w-max px-2">
            <button
              onClick={() => setSubjectFilter(null)}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95",
                subjectFilter === null 
                  ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-md" 
                  : "bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface-variant)] border border-[var(--m3-outline)]/10 hover:bg-[var(--m3-surface-container-highest)]"
              )}
            >
              {t.allSubjects}
            </button>
            {subjects
              .filter(subject => submissions.some(s => 
                s.subject === subject && 
                (activeTab === 'history' ? (s.status === 'completed' || s.isDeleted) : (!s.isDeleted && s.status !== 'completed'))
              ))
              .map(subject => (
                <button
                  key={subject}
                  onClick={() => setSubjectFilter(subjectFilter === subject ? null : subject)}
                  className={cn(
                    "px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95",
                    subjectFilter === subject 
                      ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-md" 
                      : "bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface-variant)] border border-[var(--m3-outline)]/10 hover:bg-[var(--m3-surface-container-highest)]"
                  )}
                >
                  {subject}
                </button>
              ))
            }
          </div>
        </div>

        <LayoutGroup>
          <motion.div 
            layout 
            transition={{ 
              layout: { duration: 0.2, ease: "easeOut" },
              opacity: { duration: 0.2 }
            }} 
            className="space-y-8"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {Object.entries(groupedSubmissions).map(([subject, items]) => (
                <motion.div 
                  key={subject} 
                  layout
                  transition={{ 
                    layout: { duration: 0.3, type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 px-2 border-b border-[var(--m3-outline)]/10 pb-2">
                    <div className="w-1 h-4 bg-[var(--m3-primary)] rounded-full" />
                    <h2 className="text-xl font-black text-[var(--m3-on-surface)] tracking-tight">{subject}</h2>
                    <span className="text-[10px] font-black text-[var(--m3-on-surface-variant)] bg-[var(--m3-surface-container-high)] px-2 py-0.5 rounded-md ml-2">
                      {(items as Submission[]).length}
                    </span>
                  </div>
                  <motion.div 
                    layout
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={cn(
                      "grid gap-4 sm:gap-6",
                      activeTab === 'history' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    )}
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      {(items as Submission[])
                        .sort((a, b) => {
                          if (activeTab === 'history') {
                            const timeA = a.completedAt?.toMillis() || a.deletedAt?.toMillis() || 0;
                            const timeB = b.completedAt?.toMillis() || b.deletedAt?.toMillis() || 0;
                            return timeB - timeA;
                          }
                          return a.deadline.getTime() - b.deadline.getTime();
                        })
                        .map((submission) => (
                          <SubmissionCard 
                                key={submission.id} 
                                submission={submission} 
                                isHistoryView={activeTab === 'history'}
                                language={language}
                                onClick={() => setSelectedId(submission.id)}
                                onToggleComplete={(e) => toggleComplete(submission.id, e)}
                                onDelete={(e) => {
                                  e.stopPropagation();
                                  if (activeTab === 'history') {
                                    setConfirmDialog({
                                      title: language === 'ja' ? '完全削除' : 'Permanent Delete',
                                      message: language === 'ja' ? 'このタスクをデータベースから完全に削除しますか？' : 'Delete this task permanently from the database?',
                                      onConfirm: async () => {
                                        try {
                                          await deleteDoc(doc(db, 'submissions', submission.id));
                                          setConfirmDialog(null);
                                        } catch (error) {
                                          handleFirestoreError(error, OperationType.DELETE, `submissions/${submission.id}`);
                                        }
                                      },
                                      onCancel: () => setConfirmDialog(null)
                                    });
                                  } else {
                                    setConfirmDialog({
                                      title: language === 'ja' ? 'タスクの削除' : 'Delete Task',
                                      message: language === 'ja' ? 'このタスクを非表示にしますか？(履歴には残ります)' : 'Hide this task? (It will remain in history)',
                                      onConfirm: async () => {
                                        try {
                                          await updateDoc(doc(db, 'submissions', submission.id), {
                                            isDeleted: true,
                                            deletedAt: serverTimestamp()
                                          });
                                          setConfirmDialog(null);
                                        } catch (error) {
                                          handleFirestoreError(error, OperationType.UPDATE, `submissions/${submission.id}`);
                                        }
                                      },
                                      onCancel: () => setConfirmDialog(null)
                                    });
                                  }
                                }}
                              />
                            ))}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
            {submissions.length === 0 && (
              <motion.div 
                layout
                transition={{ duration: 0.3, ease: "easeOut" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                className="h-full flex flex-col items-center justify-center text-center py-20"
              >
                <BookOpen className="w-16 h-16 mb-4" />
                <p className="font-bold">{t.noTasks}</p>
              </motion.div>
            )}
          </motion.div>
        </LayoutGroup>
      </main>
    </div>
  </div>

  {/* Settings Modal */}
  <AnimatePresence>
    {isSettingsOpen && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="m3-card relative w-full max-w-sm max-h-[90vh] overflow-y-auto"
        >
          <button onClick={() => setIsSettingsOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--m3-surface-container)] z-10">
             <X className="w-5 h-5 text-[var(--m3-on-surface-variant)]" />
          </button>
          <div className="mb-8">
            <h2 className="text-2xl font-bold">{t.settings}</h2>
            {user && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--m3-surface-container-high)] text-[9px] font-black uppercase tracking-widest text-[var(--m3-primary)] animate-in fade-in slide-in-from-top-1 duration-500">
                {isSyncing ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-2.5 h-2.5 border-2 border-[var(--m3-primary)] border-t-transparent rounded-full"
                    />
                    {t.syncing}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {t.synced}
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="space-y-6 flex-1">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.2em] px-1">{t.language}</label>
              <div className="segmented-control">
                <button 
                  onClick={() => setLanguage('ja')}
                  className={cn("segmented-item", language === 'ja' ? "segmented-item-active" : "segmented-item-inactive")}
                >
                  日本語
                </button>
                <button 
                  onClick={() => setLanguage('en')}
                  className={cn("segmented-item", language === 'en' ? "segmented-item-active" : "segmented-item-inactive")}
                >
                  English
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.2em] px-1">{t.theme}</label>
              <div className="segmented-control">
                <button 
                  onClick={() => setTheme('light')}
                  className={cn("segmented-item", theme === 'light' ? "segmented-item-active" : "segmented-item-inactive")}
                >
                  <Sun className="w-4 h-4" />
                  {t.light}
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={cn("segmented-item", theme === 'dark' ? "segmented-item-active" : "segmented-item-inactive")}
                >
                  <Moon className="w-4 h-4" />
                  {t.navy}
                </button>
              </div>
            </div>
            <div className="space-y-4 py-4 border-t border-[var(--m3-outline)]/10">
              <label className="text-[10px] font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.2em] px-1">{t.pomodoro}</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-widest">{t.focusTime} (m)</label>
                  <input 
                    type="number"
                    value={pomodoroDurations.work / 60}
                    onChange={(e) => setPomodoroDurations(prev => ({ ...prev, work: parseInt(e.target.value) * 60 || 0 }))}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 text-sm font-bold text-[var(--m3-on-surface)] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-widest">{t.breakTime} (m)</label>
                  <input 
                    type="number"
                    value={pomodoroDurations.break / 60}
                    onChange={(e) => setPomodoroDurations(prev => ({ ...prev, break: parseInt(e.target.value) * 60 || 0 }))}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 text-sm font-bold text-[var(--m3-on-surface)] transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--m3-outline)]/10">
              <label className="text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-wider">{t.editSubjects}</label>
              <div className="flex flex-wrap gap-2">
                {subjects.map(subject => (
                  <button
                    key={subject}
                    onClick={() => {
                      const msg = language === 'ja' ? `${subject}${t.confirmDeleteSubject}` : `${t.confirmDeleteSubject}${subject}?`;
                      setConfirmDialog({
                        title: t.editSubjects,
                        message: msg,
                        onConfirm: () => {
                          setSubjects(subjects.filter(s => s !== subject));
                          setConfirmDialog(null);
                        },
                        onCancel: () => setConfirmDialog(null)
                      });
                    }}
                    className="px-3 py-1.5 rounded-full bg-[var(--m3-surface-variant)] text-[var(--m3-on-surface-variant)] text-xs font-bold flex items-center gap-2 hover:bg-[var(--m3-error-container)] hover:text-[var(--m3-on-error-container)] transition-all"
                  >
                    {subject}
                    <X className="w-3 h-3" />
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder={t.newSubjectPlaceholder}
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 text-sm font-medium text-[var(--m3-on-surface)] transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newSubject.trim()) {
                      if (!subjects.includes(newSubject.trim())) {
                        setSubjects([...subjects, newSubject.trim()]);
                        setNewSubject("");
                      }
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
                      setSubjects([...subjects, newSubject.trim()]);
                      setNewSubject("");
                    }
                  }}
                  className="px-4 py-3 rounded-xl bg-[var(--m3-primary)] text-[var(--m3-on-primary)] font-bold text-xs"
                >
                  {t.addSubject}
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--m3-outline)]/10 text-center">
              <div className="text-[10px] font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.2em] mb-2">{t.feedback}</div>
              <p className="text-[10px] text-[var(--m3-on-surface-variant)]/60 font-medium mb-4">
                {t.feedback_desc}
              </p>
              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSdEbdto4RIERpgNP0MUlLceT1nSEL907bOIo3CNt2XMiLi51w/viewform?usp=publish-editor"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md group"
              >
                <Zap className="w-3 h-3 text-[var(--m3-primary)] group-hover:rotate-12 transition-transform" />
                {t.send_feedback}
              </a>
            </div>

            <div className="pt-6 border-t border-[var(--m3-outline)]/10 text-center">
              <div className="text-[10px] font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.2em] mb-2">{t.license}</div>
              <p className="text-[10px] text-[var(--m3-on-surface-variant)]/60 font-medium leading-relaxed">
                {t.license_desc}<br />
                © 2026 Lumina Project
              </p>
              <div className="mt-4 text-[9px] font-mono text-[var(--m3-on-surface-variant)]/30">
                Version {APP_VERSION}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>

      {/* Detail View Overlay */}
      <AnimatePresence>
        {selectedId && selectedSubmission && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <div 
              onClick={() => setSelectedId(null)}
              className="absolute inset-0 bg-black/20 backdrop-blur-md"
            />
            <motion.div 
              layoutId={selectedId}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-lg m3-card !p-0 shadow-2xl border border-[var(--m3-outline)]/10 bg-[var(--m3-surface-container-high)] max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 sm:p-10">
                <div className="flex justify-between items-start mb-8">
                  <motion.div layoutId={`subject-${selectedId}`} className="text-xs font-bold uppercase tracking-widest text-[var(--m3-primary)]">
                    {selectedSubmission.subject}
                  </motion.div>
                  <button 
                    onClick={() => setSelectedId(null)}
                    className="p-2 rounded-full hover:bg-[var(--m3-surface-container)] transition-colors"
                  >
                    <X className="w-5 h-5 text-[var(--m3-on-surface-variant)]" />
                  </button>
                </div>
                
                <motion.h2 layoutId={`title-${selectedId}`} className="text-2xl font-bold text-[var(--m3-on-surface)] mb-6 leading-tight">
                  {selectedSubmission.title}
                </motion.h2>

                <div className="space-y-8">
                  <div className="flex items-center gap-6 text-[var(--m3-on-surface-variant)]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">{format(selectedSubmission.deadline, language === 'ja' ? 'M/d HH:mm' : 'MMM d, HH:mm')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {isPast(selectedSubmission.deadline) ? t.overdue : t.daysLeft + ` ${differenceInDays(selectedSubmission.deadline, new Date())}${t.days}`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end mb-1 text-xs">
                      <span className="text-[var(--m3-on-surface-variant)] font-black uppercase tracking-tighter opacity-70">{t.progress}</span>
                      <span className="text-[var(--m3-on-surface)] font-light tracking-tighter">
                        <span className="text-xl">{selectedSubmission.taskType === 'pages' ? selectedSubmission.currentPage : selectedSubmission.progress}</span>
                        <span className="opacity-50 text-[10px] font-bold ml-0.5">
                          {selectedSubmission.taskType === 'pages' 
                            ? `/ ${selectedSubmission.endPage}p`
                            : `%`}
                        </span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[var(--m3-surface-variant)] rounded-full overflow-hidden shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedSubmission.progress}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full bg-[var(--m3-primary)] shadow-sm"
                      />
                    </div>
                  </div>

                  {selectedSubmission.activityLogs && selectedSubmission.activityLogs.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.2em]">{t.recentActivity}</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {selectedSubmission.activityLogs.slice().reverse().map(log => (
                          <div key={log.id} className="flex items-center gap-4 bg-[var(--m3-surface-container-low)] p-3 rounded-2xl border border-[var(--m3-outline-variant)]/10">
                            <div className="w-8 h-8 rounded-full bg-[var(--m3-primary-container)] flex items-center justify-center shrink-0">
                              <Zap className="w-3.5 h-3.5 text-[var(--m3-on-primary-container)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] font-bold text-[var(--m3-on-surface-variant)] opacity-60">
                                {format(log.timestamp.toDate(), 'M/d HH:mm')}
                              </div>
                              <div className="text-sm font-black text-[var(--m3-on-surface)]">
                                {log.durationMinutes}{language === 'ja' ? '分間のセッション' : ' min session'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-black text-[var(--m3-primary)]">
                                +{log.progressIncrement}{log.type === 'pages' ? 'p' : '%'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-wider">{t.details}</h3>
                    <p className="text-[var(--m3-on-surface-variant)] leading-relaxed text-sm font-medium whitespace-pre-wrap">
                      {selectedSubmission.description || (language === 'ja' ? '詳細情報はありません。' : 'No description provided.')}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => setIsFocusSelectorOpen(true)}
                      className="w-full m3-button-primary"
                    >
                      <Zap className="w-5 h-5" />
                      {t.startTimer}
                    </button>
                    
                    <button 
                      onClick={() => {
                        setEditData(selectedSubmission);
                        setModalPriority(selectedSubmission.priority);
                        setSelectedDate(selectedSubmission.deadline);
                        setIsCalendarOpen(false);
                        setIsEditing(true);
                        setSelectedId(null);
                      }}
                      className="w-full m3-button-outline"
                    >
                      <Edit3 className="w-5 h-5" />
                      {t.editTask}
                    </button>

                    {selectedSubmission.status !== 'completed' && (
                      <button 
                        onClick={(e) => {
                          toggleComplete(selectedSubmission.id, e as any);
                          setSelectedId(null);
                        }}
                        className="w-full m3-button-primary"
                      >
                        <CheckCircle2 className="w-4 h-4 ml-[-4px]" />
                        {t.complete}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={() => {
          setModalPriority('medium');
          setAddTaskType('percentage');
          setIsAdding(true);
        }}
        className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 w-14 h-14 sm:w-20 sm:h-20 bg-[#cdddf7] text-[#005696] rounded-full shadow-lg shadow-[#cdddf7]/50 flex items-center justify-center z-40 group hover:opacity-90 transition-all active:scale-95"
      >
        <Plus className="w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:rotate-90" />
      </motion.button>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6"
          >
            <div 
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/10 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-lg m3-card rounded-t-[28px] sm:rounded-[28px] p-6 sm:p-10 shadow-2xl border border-[var(--m3-outline)]/10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8 shrink-0">
                <h2 className="text-2xl font-bold text-[var(--m3-on-surface)]">{t.addNew}</h2>
                <button onClick={() => setIsAdding(false)} className="p-2 rounded-full hover:bg-[var(--m3-surface-container)]">
                  <X className="w-6 h-6 text-[var(--m3-on-surface-variant)]" />
                </button>
              </div>
              <form onSubmit={addSubmission} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-widest px-1">{t.title}</label>
                    <input name="title" required type="text" placeholder={t.titlePlaceholder} className="w-full px-5 py-4 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-bold text-[var(--m3-on-surface)] transition-all placeholder:font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-widest px-1">{t.subject}</label>
                    <div className="relative group">
                      <input 
                        name="subject" 
                        required 
                        type="text" 
                        list="subjects"
                        placeholder={t.subjectPlaceholder} 
                        className="w-full px-5 py-4 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-bold text-[var(--m3-on-surface)] transition-all placeholder:font-medium" 
                      />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[var(--m3-primary)] group-focus-within:w-[80%] transition-all duration-300 rounded-full" />
                    </div>
                    <datalist id="subjects">
                      {subjects.map(s => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                </div>

                <div className="space-y-4 px-1">
                  <label className="text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.2em]">{t.taskType}</label>
                  <div className="segmented-control">
                    <button 
                      type="button"
                      onClick={() => setAddTaskType('percentage')}
                      className={cn(
                        "segmented-item",
                        addTaskType === 'percentage' ? "segmented-item-active" : "segmented-item-inactive"
                      )}
                    >
                      <Clock className="w-4 h-4" />
                      {language === 'ja' ? '通常' : 'Standard'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAddTaskType('pages')}
                      className={cn(
                        "segmented-item",
                        addTaskType === 'pages' ? "segmented-item-active" : "segmented-item-inactive"
                      )}
                    >
                      <BookOpen className="w-4 h-4" />
                      {language === 'ja' ? 'ページ数' : 'Pages'}
                    </button>
                  </div>
                  <input type="hidden" name="taskType" value={addTaskType} />
                </div>
                  {addTaskType === 'pages' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="grid grid-cols-2 gap-4 pt-2"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--m3-on-surface-variant)] uppercase">{t.startPage}</label>
                        <input name="startPage" type="number" placeholder="0" className="w-full px-4 py-3 rounded-xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 transition-all placeholder:font-medium" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--m3-on-surface-variant)] uppercase">{t.endPage}</label>
                        <input name="endPage" type="number" placeholder="100" className="w-full px-4 py-3 rounded-xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 transition-all placeholder:font-medium" />
                      </div>
                    </motion.div>
                  )}

                <div className="flex flex-col gap-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-widest px-1">{t.deadline}</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                       <input 
                        name="deadlineDate"
                        type="date"
                        required
                        defaultValue={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                        onChange={(e) => {
                          const [y, m, d] = e.target.value.split('-').map(Number);
                          const date = new Date(selectedDate || new Date());
                          date.setFullYear(y, m - 1, d);
                          setSelectedDate(date);
                        }}
                        className="flex-1 px-5 py-4 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-bold text-[var(--m3-on-surface)] transition-all"
                      />
                      <input 
                        name="deadlineTime"
                        type="time"
                        required
                        defaultValue="23:59"
                        className="w-full sm:w-32 px-5 py-4 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-bold text-[var(--m3-on-surface)] transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-widest px-1">{t.priority}</label>
                    <div className="flex flex-wrap gap-2">
                      {(['low', 'medium', 'high'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setModalPriority(p)}
                          className={cn(
                            "m3-chip flex-1 sm:flex-none justify-center py-4 sm:py-2",
                            modalPriority === p ? "m3-chip-selected" : "m3-chip-unselected"
                          )}
                        >
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            p === 'high' ? "bg-red-500" : p === 'medium' ? "bg-orange-500" : "bg-blue-500"
                          )} />
                          <span className="font-bold">{t[p]}</span>
                        </button>
                      ))}
                    </div>
                    <input type="hidden" name="priority" value={modalPriority} />
                  </div>
                </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.1em] px-1">{t.details}</label>
                    <textarea name="description" placeholder={t.descriptionPlaceholder} rows={3} className="w-full px-5 py-4 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-medium resize-none text-[var(--m3-on-surface)] transition-all" />
                  </div>
                <button 
                  type="submit"
                  className="w-full m3-button-primary"
                >
                  {t.record}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer Overlay */}
      <AnimatePresence>
        {activeTimerId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 40 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="m3-card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-12 text-center space-y-8 sm:space-y-12 shadow-2xl relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-[var(--m3-primary)]/10">
                <motion.div 
                  className="h-full bg-[var(--m3-primary)]"
                  animate={{ 
                    width: timerMode === 'stopwatch' 
                      ? `${(timerSeconds % 60) * (100/60)}%`
                      : `${(timerSeconds / (pomodoroPhase === 'work' ? pomodoroDurations.work : pomodoroDurations.break)) * 100}%`
                  }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </div>

              <div className="space-y-2 sm:space-y-4">
                <div className="flex items-center justify-center gap-2">
                  {timerMode === 'pomodoro' && (
                    <motion.div 
                      layoutId="pomodoro-badge"
                      className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5",
                        pomodoroPhase === 'work' 
                          ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)]" 
                          : "bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)]"
                      )}
                    >
                      {pomodoroPhase === 'work' ? <Brain className="w-3 h-3" /> : <Coffee className="w-3 h-3" />}
                      {pomodoroPhase === 'work' ? t.workPhase : t.breakPhase}
                    </motion.div>
                  )}
                  {pomodoroSessionCount > 0 && (
                    <div className="px-3 py-1 rounded-full bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface-variant)] text-[10px] font-black uppercase tracking-widest">
                      {t.sessions}: {pomodoroSessionCount}
                    </div>
                  )}
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <motion.h2 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-lg sm:text-2xl font-black text-[var(--m3-on-surface)] tracking-tight line-clamp-2"
                  >
                    {submissions.find(s => s.id === activeTimerId)?.title}
                  </motion.h2>
                  <div className="text-[9px] sm:text-[10px] font-black text-[var(--m3-primary)] uppercase tracking-[0.2em]">
                    {submissions.find(s => s.id === activeTimerId)?.subject}
                  </div>
                </div>
              </div>
              
              {!showProgressInput ? (
                <div className="space-y-12">
                  {/* Analog Clock Face */}
                  <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto scale-90 sm:scale-100">
                    {/* Dial */}
                    <div className="absolute inset-0 rounded-full border-[6px] border-[var(--m3-outline-variant)]/20 shadow-inner" />
                    
                    {/* Ticks */}
                    {[...Array(60)].map((_, i) => (
                      <div 
                        key={i}
                        className={cn(
                          "absolute top-0 left-1/2 -translate-x-1/2 h-full w-0.5 origin-bottom",
                          i % 5 === 0 ? "h-4 w-1 bg-[var(--m3-on-surface-variant)]" : "h-2 w-0.5 bg-[var(--m3-outline-variant)]"
                        )}
                        style={{ transform: `rotate(${i * 6}deg) translateY(6px)` }}
                      />
                    ))}

                    {/* Numbers */}
                    {[0, 15, 30, 45].map((val) => (
                      <div 
                        key={val}
                        className="absolute w-8 h-8 flex items-center justify-center text-[10px] font-black text-[var(--m3-on-surface-variant)] opacity-40"
                        style={{ 
                          top: val === 0 ? '25px' : val === 30 ? 'auto' : '50%',
                          bottom: val === 30 ? '25px' : 'auto',
                          left: val === 45 ? '25px' : val === 15 ? 'auto' : '50%',
                          right: val === 15 ? '25px' : 'auto',
                          transform: (val === 15 || val === 45) ? 'translateY(-50%)' : 'translateX(-50%)'
                        }}
                      >
                        {val === 0 ? '60' : val}
                      </div>
                    ))}
                    
                    {/* Secondary Hand (Minutes) */}
                    <motion.div 
                      className="absolute top-12 bottom-1/2 left-1/2 w-1.5 -translate-x-1/2 bg-[var(--m3-on-surface-variant)]/30 rounded-full origin-bottom"
                      animate={{ rotate: ((timerSeconds / 60) % 60) * 6 }}
                      transition={{ duration: 0.5, ease: "circOut" }}
                    />

                    {/* Main Hand (Seconds) */}
                    <motion.div 
                      className="absolute top-6 bottom-1/2 left-1/2 w-1 -translate-x-1/2 bg-[var(--m3-primary)] rounded-full origin-bottom shadow-sm"
                      animate={{ 
                        rotate: timerMode === 'stopwatch' 
                          ? (timerSeconds % 60) * 6 
                          : (() => {
                              const totalPhaseSeconds = pomodoroPhase === 'work' ? pomodoroDurations.work : pomodoroDurations.break;
                              const elapsed = totalPhaseSeconds - timerSeconds;
                              return (elapsed % 60) * 6;
                            })()
                      }}
                      transition={{ duration: 0.1, ease: "linear" }}
                    >
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--m3-primary)]" />
                    </motion.div>
                    
                    {/* Center Point */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-[var(--m3-surface-container-high)] rounded-full border-4 border-[var(--m3-primary)] shadow-md z-10" />
                    
                    {/* Digital readout in center-bottom */}
                    {showDigitalTimer && (
                      <div className="absolute top-[65%] left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <div className="text-3xl sm:text-4xl font-black font-mono tracking-tighter text-[var(--m3-on-surface)]">
                          {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:
                          {(timerSeconds % 60).toString().padStart(2, '0')}
                        </div>
                        {(isTimerPaused || !isTimerRunning) && (
                           <div className="text-[10px] font-black text-[var(--m3-error)] uppercase tracking-widest mt-1 animate-pulse">
                             {!isTimerRunning ? (language === 'ja' ? '終了/待機中' : 'IDLE/BREAK') : t.pause}
                           </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    {timerMode === 'pomodoro' && (
                      <button 
                        onClick={() => setShowDigitalTimer(!showDigitalTimer)}
                        className="text-[10px] font-black uppercase tracking-widest text-[var(--m3-primary)] hover:opacity-80 transition-opacity flex items-center gap-2 mb-2"
                      >
                        {showDigitalTimer ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {t.toggleDigitalTimer}
                      </button>
                    )}

                    <div className="flex items-center justify-center gap-10">
                      <button 
                        onClick={() => {
                          if (!isTimerRunning) {
                            setIsTimerRunning(true);
                            setIsTimerPaused(false);
                          } else {
                            togglePause();
                          }
                        }}
                        className={cn(
                          "w-14 h-14 sm:w-16 sm:h-16 rounded-3xl flex items-center justify-center shadow-lg active:scale-95 transition-all duration-300",
                          (!isTimerRunning || isTimerPaused) ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)]" : "bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface)]"
                        )}
                      >
                        {!isTimerRunning || isTimerPaused ? (
                          <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
                        ) : (
                          <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
                        )}
                      </button>
                      <button 
                        onClick={stopTimer}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[var(--m3-error-container)] text-[var(--m3-on-error-container)] flex items-center justify-center shadow-xl active:scale-90 hover:bg-[var(--m3-error)] hover:text-[var(--m3-on-error)] transition-all duration-300 group"
                      >
                        <Square className="w-7 h-7 sm:w-8 sm:h-8 fill-current group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {timerMode === 'pomodoro' && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handlePomodoroPhaseComplete}
                      className="w-full m3-button-outline"
                    >
                      <ChevronRight className="w-5 h-5" />
                      {language === 'ja' ? '次のフェーズへ' : 'Skip Phase'}
                    </motion.button>
                  )}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <h3 className="font-bold text-[var(--m3-on-surface)]">
                    {submissions.find(s => s.id === activeTimerId)?.taskType === 'pages' ? (language === 'ja' ? '何ページ進みましたか？' : 'How many pages completed?') : (language === 'ja' ? '何％進みましたか？' : 'What percentage achieved?')}
                  </h3>
                  <input 
                    type="number" 
                    autoFocus
                    min="1"
                    max={submissions.find(s => s.id === activeTimerId)?.taskType === 'pages' ? "999" : "100"}
                    value={progressInputValue}
                    onChange={(e) => setProgressInputValue(e.target.value)}
                    placeholder="0"
                    className="w-full text-4xl sm:text-6xl font-black text-center border-none rounded-2xl bg-[var(--m3-surface-container)] py-8 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 text-[var(--m3-on-surface)] transition-all placeholder-[var(--m3-on-surface-variant)]/30"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        saveActivity(parseInt(progressInputValue) || 0);
                      }
                    }}
                  />
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-bold text-[var(--m3-on-surface-variant)] uppercase">
                      <span>{t.currentProgress}: {submissions.find(s => s.id === activeTimerId)?.progress}%</span>
                      {previewProgress !== null && (
                        <span className="text-[var(--m3-primary)]">{t.afterUpdate}: {previewProgress}%</span>
                      )}
                    </div>
                    <div className="h-2 w-full bg-[var(--m3-surface-variant)] rounded-full overflow-hidden relative">
                      <div 
                        className="absolute inset-0 bg-[var(--m3-primary)]/20"
                        style={{ width: `${submissions.find(s => s.id === activeTimerId)?.progress}%` }}
                      />
                      {previewProgress !== null && (
                        <motion.div 
                          initial={{ width: `${submissions.find(s => s.id === activeTimerId)?.progress}%` }}
                          animate={{ width: `${previewProgress}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="absolute inset-0 bg-[var(--m3-primary)]"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        setActiveTimerId(null);
                        setShowProgressInput(false);
                      }}
                      className="flex-1 m3-button-outline"
                    >
                      {language === 'ja' ? '破棄' : 'Discard'}
                    </button>
                    <button 
                      onClick={() => saveActivity(parseInt(progressInputValue) || 0)}
                      className="flex-[2] m3-button-primary"
                    >
                      {t.record}
                    </button>
                  </div>
                  <p className="text-xs text-[var(--m3-on-surface-variant)]">
                    {language === 'ja' ? '数値を入力してEnterキーまたはボタンで保存' : 'Enter number and hit Record or Enter'}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && editData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6"
          >
            <div 
              onClick={() => {
                setIsEditing(false);
                setEditData(null);
              }}
              className="absolute inset-0 bg-black/10 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-lg m3-card rounded-t-[28px] sm:rounded-[28px] p-6 sm:p-10 shadow-2xl border border-[var(--m3-outline)]/10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8 shrink-0">
                <h2 className="text-2xl font-bold text-[var(--m3-on-surface)]">{t.editTask}</h2>
                <button onClick={() => {
                  setIsEditing(false);
                  setEditData(null);
                }} className="p-2 rounded-full hover:bg-[var(--m3-surface-container)] text-[var(--m3-on-surface-variant)]">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={updateSubmission} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-widest px-1">{t.title}</label>
                    <input name="title" defaultValue={editData.title} required type="text" className="w-full px-5 py-4 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-bold text-[var(--m3-on-surface)] transition-all placeholder:font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-widest px-1">{t.subject}</label>
                    <div className="relative group">
                      <input 
                        name="subject" 
                        defaultValue={editData.subject} 
                        required 
                        type="text" 
                        list="subjects-edit"
                        className="w-full px-5 py-4 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-bold text-[var(--m3-on-surface)] transition-all placeholder:font-medium" 
                      />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[var(--m3-primary)] group-focus-within:w-[80%] transition-all duration-300 rounded-full" />
                    </div>
                    <datalist id="subjects-edit">
                      {subjects.map(s => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                </div>
                <div className="flex flex-col gap-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-widest px-1">{t.deadline}</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        name="deadlineDate"
                        type="date"
                        required
                        defaultValue={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                        onChange={(e) => {
                          const [y, m, d] = e.target.value.split('-').map(Number);
                          const date = new Date(selectedDate || new Date());
                          date.setFullYear(y, m - 1, d);
                          setSelectedDate(date);
                        }}
                        className="flex-1 px-5 py-4 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-bold text-[var(--m3-on-surface)] transition-all"
                      />
                      <input 
                        name="deadlineTime"
                        type="time"
                        required
                        defaultValue={editData.deadline ? format(editData.deadline, 'HH:mm') : "23:59"}
                        className="w-full sm:w-32 px-5 py-4 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-bold text-[var(--m3-on-surface)] transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-widest px-1">{t.priority}</label>
                    <div className="flex flex-wrap gap-2">
                      {(['low', 'medium', 'high'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setModalPriority(p)}
                          className={cn(
                            "m3-chip flex-1 sm:flex-none justify-center py-4 sm:py-2",
                            modalPriority === p ? "m3-chip-selected" : "m3-chip-unselected"
                          )}
                        >
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            p === 'high' ? "bg-red-500" : p === 'medium' ? "bg-orange-500" : "bg-blue-500"
                          )} />
                          <span className="font-bold">{t[p]}</span>
                        </button>
                      ))}
                    </div>
                    <input type="hidden" name="priority" value={modalPriority} />
                  </div>
                </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.1em] px-1">{t.details}</label>
                    <textarea name="description" defaultValue={editData.description} rows={3} className="w-full px-5 py-4 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-medium resize-none text-[var(--m3-on-surface)] transition-all" />
                  </div>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => {
                      setConfirmDialog({
                        title: (language === 'ja' ? '永久削除' : 'Permanent Delete'),
                        message: t.confirmPermanentDelete,
                        onConfirm: async () => {
                          try {
                            await deleteDoc(doc(db, 'submissions', editData.id));
                            setIsEditing(false);
                            setEditData(null);
                            setConfirmDialog(null);
                            showToast(language === 'ja' ? '削除されました' : 'Task deleted');
                          } catch (error) {
                            handleFirestoreError(error, OperationType.DELETE, `submissions/${editData.id}`);
                          }
                        },
                        onCancel: () => setConfirmDialog(null)
                      });
                    }}
                    className="flex-1 m3-button-error"
                  >
                    {t.delete}
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] m3-button-primary"
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] pointer-events-none"
          >
            <div className="bg-[var(--m3-primary)] text-[var(--m3-on-primary)] px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 font-black text-sm tracking-widest uppercase">
              <CheckCircle2 className="w-6 h-6" />
              {toastMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Focus Mode Selector */}
      <AnimatePresence>
        {isFocusSelectorOpen && selectedSubmission && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="m3-card max-w-sm w-full p-6 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black tracking-tight">{t.focusMode}</h3>
                <button onClick={() => setIsFocusSelectorOpen(false)} className="p-2 rounded-full hover:bg-[var(--m3-surface-container)]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => {
                    startTimer(selectedSubmission.id, 'stopwatch');
                    setIsFocusSelectorOpen(false);
                  }}
                  className="w-full p-6 rounded-3xl bg-[var(--m3-surface-container-high)] border border-[var(--m3-outline)]/10 hover:border-[var(--m3-primary)] transition-all text-left flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[var(--m3-primary)]/10 flex items-center justify-center text-[var(--m3-primary)] group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-[var(--m3-on-surface)]">{t.focusModeStopwatch}</div>
                    <div className="text-xs text-[var(--m3-on-surface-variant)]">{t.focusModeDescStopwatch}</div>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    startTimer(selectedSubmission.id, 'pomodoro');
                    setIsFocusSelectorOpen(false);
                  }}
                  className="w-full p-6 rounded-3xl bg-[var(--m3-surface-container-high)] border border-[var(--m3-outline)]/10 hover:border-[var(--m3-primary)] transition-all text-left flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[var(--m3-secondary-container)] flex items-center justify-center text-[var(--m3-on-secondary-container)] group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-[var(--m3-on-surface)]">{t.focusModePomodoro}</div>
                    <div className="text-xs text-[var(--m3-on-surface-variant)]">{t.focusModeDescPomodoro}</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {confirmDialog && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="m3-card max-w-sm w-full p-8 space-y-6"
            >
              <h3 className="text-xl font-bold">{confirmDialog.title}</h3>
              <p className="text-[var(--m3-on-surface-variant)] leading-relaxed">
                {confirmDialog.message}
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => {
                    confirmDialog.onCancel?.();
                    setConfirmDialog(null);
                  }}
                  className="m3-button-text"
                >
                  {confirmDialog.cancelLabel || t.cancel}
                </button>
                <button 
                  onClick={() => {
                    confirmDialog.onConfirm();
                  }}
                  className="m3-button-primary"
                >
                  {confirmDialog.confirmLabel || (language === 'ja' ? 'はい' : 'Confirm')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SubmissionCard({ 
  submission, 
  onClick,
  onToggleComplete,
  onDelete,
  isHistoryView,
  language = 'ja'
}: { 
  submission: Submission; 
  onClick: () => void;
  onToggleComplete: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  isHistoryView?: boolean;
  language?: Language;
  key?: string | number;
}) {
  const t = translations[language];
  const daysLeft = differenceInDays(submission.deadline, new Date());
  const isOverdue = isPast(submission.deadline) && submission.status !== 'completed';
  const showCompact = isHistoryView || submission.isDeleted;
  
  const urgencyStyles = useMemo(() => {
    if (submission.isDeleted) return { tag: 'bg-[var(--m3-surface-variant)] text-[var(--m3-on-surface-variant)]', label: t.urgency_archive };
    if (submission.status === 'completed') return { tag: 'bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)]', label: t.urgency_completed };
    
    if (daysLeft <= 0) return { tag: 'bg-[var(--m3-error-container)] text-[var(--m3-on-error-container)]', label: t.urgency_urgent };
    if (daysLeft <= 3) return { tag: 'bg-[var(--m3-tertiary-container)] text-[var(--m3-on-tertiary-container)]', label: language === 'ja' ? '間近' : 'Soon' };
    return { tag: 'bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)]', label: t.urgency_normal };
  }, [daysLeft, submission.status, submission.priority, submission.isDeleted, t]);

  if (showCompact) {
    return (
      <motion.div
        layout
        layoutId={submission.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ 
          layout: { duration: 0.2, ease: "easeOut" },
          opacity: { duration: 0.2 },
          scale: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.99 }}
        className="group relative bg-[var(--m3-surface-container)] rounded-[20px] p-5 flex items-center gap-4 border border-[var(--m3-outline)]/10"
      >
        <div className="w-10 h-10 rounded-full bg-[var(--m3-surface-variant)] flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-[var(--m3-on-surface-variant)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <motion.span 
              layoutId={`subject-${submission.id}`} 
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="text-[10px] font-black text-[var(--m3-primary)] uppercase tracking-[0.15em]"
            >
              {submission.subject}
            </motion.span>
            <span className="text-[10px] text-[var(--m3-outline)]">•</span>
            <span className="text-[10px] font-medium text-[var(--m3-on-surface-variant)]">
              {format(((submission.deletedAt || submission.completedAt) as any)?.toDate() || new Date(), 'yyyy/MM/dd HH:mm')}
            </span>
          </div>
          <motion.h3 
            layoutId={`title-${submission.id}`} 
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="text-sm font-bold text-[var(--m3-on-surface)] truncate"
          >
            {submission.title}
          </motion.h3>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      layoutId={submission.id}
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ 
        layout: { duration: 0.3, type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 }
      }}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group relative cursor-pointer bg-[var(--m3-surface-container)] rounded-[32px] p-8 border border-white/10 dark:border-white/5 hover:border-[var(--m3-primary)]/30 hover:shadow-xl hover:shadow-[var(--m3-primary)]/10 flex flex-col gap-6 overflow-hidden transition-all duration-300",
        submission.priority === 'high' && submission.status !== 'completed' && "border-red-500/30 ring-2 ring-red-500/10 bg-gradient-to-br from-[var(--m3-surface-container)] to-red-500/5"
      )}
    >
      {submission.priority === 'high' && submission.status !== 'completed' && (
        <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none">
          <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0 pr-4">
          <div className="flex items-center gap-2">
            <motion.span 
              layoutId={`subject-${submission.id}`} 
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--m3-primary)]"
            >
              {submission.subject}
            </motion.span>
            <div className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter",
              submission.priority === 'high' ? "bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]" : 
              submission.priority === 'medium' ? "bg-orange-500 text-white" : "bg-blue-500 text-white"
            )}>
              {submission.priority === 'high' && <AlertCircle className="w-2.5 h-2.5" />}
              {t[submission.priority]}
            </div>
          </div>
          <motion.h3 
            layoutId={`title-${submission.id}`} 
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
              "text-[19px] font-bold text-[var(--m3-on-surface)] leading-snug tracking-tight line-clamp-2",
              submission.priority === 'high' && "text-red-600 dark:text-red-400"
            )}
          >
            {submission.title}
          </motion.h3>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className={cn(
            "text-[11px] font-black px-4 py-1.5 rounded-xl uppercase tracking-wider shadow-sm",
            urgencyStyles.tag,
            submission.priority === 'high' && submission.status !== 'completed' && "animate-pulse"
          )}>
            {urgencyStyles.label}
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between mt-auto pt-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[var(--m3-on-surface-variant)]">
            <div className={cn(
              "p-2 rounded-lg bg-[var(--m3-surface-variant)]/40",
              isOverdue && "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
            )}>
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-bold">
                {format(submission.deadline, 'MM/dd' + (submission.deadline.getHours() === 23 && submission.deadline.getMinutes() === 59 ? '' : ' HH:mm'))}
              </span>
              <span className={cn(
                "text-[10px] font-bold",
                isOverdue ? "text-red-600 dark:text-red-400" : "text-[var(--m3-on-surface-variant)] opacity-70"
              )}>
                {isOverdue ? t.overdue : `${t.daysLeft} ${daysLeft}${t.days}`}
              </span>
            </div>
          </div>
          {submission.taskType === 'pages' && (
            <div className="flex items-center gap-2 text-[var(--m3-on-surface-variant)] mt-1">
              <BookOpen className="w-4 h-4 opacity-70" />
              <span className="text-[11px] font-bold tabular-nums">
                {submission.currentPage} <span className="opacity-40">/</span> {submission.endPage}p
              </span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2 w-6/12 max-w-[140px]">
           <div className="flex justify-between w-full px-0.5">
              <span className="text-[12px] font-black tabular-nums text-[var(--m3-primary)] leading-none">{submission.progress}%</span>
           </div>
           <div className="h-2 w-full bg-[var(--m3-surface-variant)]/50 rounded-full overflow-hidden shadow-inner p-[1px]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${submission.progress}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "h-full rounded-full transition-all duration-500 shadow-sm",
                  daysLeft <= 0 ? "bg-red-500" : "bg-[var(--m3-primary)]"
                )}
              />
           </div>
        </div>
      </div>
    </motion.div>
  );
}
