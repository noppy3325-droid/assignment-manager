import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { Plus, Calendar, BookOpen, CheckCircle2, Clock, ChevronRight, ChevronDown, X, Settings, LogOut, LogIn, Trash2, Sun, Moon, Zap, Play, Pause, Square, CheckSquare, Edit3, Coffee, Brain, Eye, EyeOff, AlertCircle, Dog, Cat, Bird, TreePine, PawPrint, Rabbit, Flower, Flower2, MousePointer2, Menu, RotateCcw, Search, Keyboard } from 'lucide-react';
import { format, differenceInDays, isPast, isToday, startOfDay, formatDistanceToNow, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, isSameMonth, isSameDay } from 'date-fns';
import { ja, enUS, vi } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import confetti from 'canvas-confetti';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  useDraggable,
  useDroppable,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import * as holiday_jp from '@holiday-jp/holiday_jp';
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
  getDocFromServer,
  analytics
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
  scheduledDate?: any;
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
  isEvent?: boolean;
  isAllDay?: boolean;
  recurringId?: string;
  hasMoreInSeries?: boolean;
}

const DEFAULT_SUBJECTS = [
  "国語", "数学", "英語", "物理", "化学", "生物", "地学", 
  "世界史", "日本史", "地理", "現代社会", "倫理", "政治・経済", "情報", "その他"
];

const APP_VERSION = '1.3.1';

const RELEASE_NOTES = {
  version: '1.3.1',
  title: "🚀 アップデート情報 (v1.3.1)",
  features: {
    title: "✨ 修正・改善内容",
    items: [
      "デスクトップ版のヘッダーにカレンダー・設定・ログアウトボタンを追加しました",
      "モバイル版メニューを刷新し、操作ボタンを画面下部にコンパクトに配置しました",
      "「進行中/アーカイブ」タブをサイドバー（デスクトップ）に移動し、メイン画面をスッキリさせました",
      "モバイル版のタスク一覧に適切な余白を追加し、視認性を向上させました",
      "ドラッグ＆ドロップ時の表示を改善し、移動中のタスクが見やすくなりました",
      "メニュー内の一部表記（カレンダー等）の日本語化を修正しました"
    ]
  }
};

const TERMS_OF_SERVICE = {
  ja: {
    title: "🚀 Submission-Manager アプリ概要",
    intro: "「進捗を可視化し、提出期限を逃さない。」\n\nSubmission-Managerは、日々の課題や提出物を一括管理し、学習効率を最大化するために開発された進捗管理ツールです。",
    features: {
      title: "📌 主な機能",
      items: [
        "タスク・課題の進捗管理: 0%〜100%のステータスで進行状況をリアルタイムに把握。",
        "期限通知システム: 残り日数や期限間近のタスクをひと目で確認可能。",
        "科目・カテゴリー別フィルタ: 整理された表示で、迷わずタスクに着手。"
      ]
    },
    terms: {
      title: "📝 ご利用規約および免責事項",
      intro: "本アプリの利用にあたり、以下の内容を必ずご確認ください。",
      sections: [
        {
          title: "1. サービスの継続性について",
          content: "本アプリは Google Firebase および無料枠のサーバー資源を利用して運用されています。\n\n無料枠の制限やプラットフォームの仕様変更により、予告なくサービスの停止、または一部機能が利用できなくなる可能性があります。あらかじめご了承ください。"
        },
        {
          title: "2. プライバシーと個人情報の取り扱い",
          content: "個人情報の非保持: 当アプリでは、アカウント情報（氏名・メールアドレス等）や、作成されたタスクの具体的な内容、その他個人を特定できる情報は一切取得・保持いたしません。\n\nデータの匿名性: 入力されたデータはブラウザまたはプラットフォーム上の匿名化された領域で処理されます。"
        },
        {
          title: "3. フィードバックと学術利用",
          content: "ユーザーの皆様からいただいたフィードバックや、統計的な利用状況データ（個人を特定しない形のもの）は、学術的な発表や研究、開発報告等に使用させていただく場合があります。"
        },
        {
          title: "4. 免責事項",
          content: "本アプリの使用によって生じた損害（データの消失、期限の失念等）について、開発者は一切の責任を負いかねます。重要なタスクについては、適宜バックアップや併用管理をお勧めいたします。"
        }
      ],
      footer: "ログインすることで、利用規約および免責事項に同意したものとみなされます。"
    }
  },
  en: {
    title: "🚀 Submission-Manager Overview",
    intro: "\"Visualize progress and never miss a deadline.\"\n\nSubmission-Manager is a progress management tool developed to manage daily tasks and assignments centrally and maximize learning efficiency.",
    features: {
      title: "📌 Main Features",
      items: [
        "Task/Assignment Progress Tracking: View progress in real-time with statuses from 0% to 100%.",
        "Deadline Notification System: Easily check remaining days and upcoming tasks at a glance.",
        "Subject/Category Filtering: Start tasks without hesitation using an organized display."
      ]
    },
    terms: {
      title: "📝 Terms of Service and Disclaimer",
      intro: "Please review the following before using this application.",
      sections: [
        {
          title: "1. Service Continuity",
          content: "This app is operated using Google Firebase and free tier server resources.\n\nPlease note that services may be suspended or features may become unavailable without prior notice due to free tier limitations or platform changes."
        },
        {
          title: "2. Privacy and Data Handling",
          content: "No Personal Data Storage: We do not collect or store account information (names, emails) or specific task content.\n\nData Anonymity: Entered data is processed anonymously in your browser or on the platform."
        },
        {
          title: "3. Feedback and Academic Use",
          content: "Feedback and statistical usage data (non-personally identifiable) may be used for academic presentations, research, or development reports."
        },
        {
          title: "4. Disclaimer",
          content: "The developers shall not be held responsible for any damages (data loss, missed deadlines, etc.) resulting from the use of this app. We recommend keeping backups and parallel management for critical tasks."
        }
      ],
      footer: "By logging in, you agree to these Terms of Service and Disclaimer."
    }
  },
  vi: {
    title: "🚀 Tổng quan về Submission-Manager",
    intro: "\"Trực quan hóa tiến độ, không bao giờ trễ hạn.\"\n\nSubmission-Manager là một công cụ giúp quản lý tập trung các công việc và bài tập hàng ngày nhằm tối đa hóa hiệu quả học tập.",
    features: {
      title: "📌 Tính năng chính",
      items: [
        "Quản lý tiến độ Công việc/Bài tập: Theo dõi tiến độ theo thời gian thực từ 0% đến 100%.",
        "Hệ thống thông báo Hạn chót: Dễ dàng kiểm tra số ngày còn lại và công việc sắp đến hạn.",
        "Lọc theo Môn học/Danh mục: Bắt đầu công việc mà không do dự nhờ giao diện được sắp xếp hợp lý."
      ]
    },
    terms: {
      title: "📝 Điều khoản dịch vụ và Khước từ trách nhiệm",
      intro: "Vui lòng xem kỹ các nội dung sau trước khi sử dụng ứng dụng.",
      sections: [
        {
          title: "1. Tính liên tục của Dịch vụ",
          content: "Ứng dụng này hoạt động bằng Google Firebase và tài nguyên máy chủ gói miễn phí.\n\nXin lưu ý rằng dịch vụ có thể bị tạm dừng hoặc một số tính năng có thể không khả dụng mà không cần báo trước do giới hạn của gói miễn phí hoặc thay đổi nền tảng."
        },
        {
          title: "2. Quyền riêng tư và Xử lý Dữ liệu",
          content: "Không lưu trữ Dữ liệu Cá nhân: Ứng dụng này không thu thập hay lưu trữ thông tin tài khoản (tên, email, v.v...) hoặc nội dung công việc cụ thể.\n\nTính Ẩn danh: Dữ liệu được xử lý ẩn danh trên trình duyệt hoặc trên nền tảng."
        },
        {
          title: "3. Phản hồi và Sử dụng trong Học thuật",
          content: "Phản hồi và dữ liệu thống kê sử dụng (không xác định danh tính cá nhân) có thể được sử dụng cho các bài thuyết trình học thuật, nghiên cứu hoặc báo cáo phát triển."
        },
        {
          title: "4. Khước từ trách nhiệm",
          content: "Nhà phát triển sẽ không chịu trách nhiệm cho bất kỳ thiệt hại nào (mất dữ liệu, trễ hạn, v.v...) phát sinh từ việc sử dụng ứng dụng này. Đối với các công việc quan trọng, bạn nên sao lưu thường xuyên và có phương án quản lý dự phòng."
        }
      ],
      footer: "Bằng việc đăng nhập, bạn đồng ý với các Điều khoản dịch vụ và Khước từ trách nhiệm nêu trên."
    }
  }
};

const DroppableDateCell: React.FC<{ id: string, children: React.ReactNode, className?: string, onClick?: () => void }> = ({ id, children, className, onClick }) => {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div 
      ref={setNodeRef} 
      onClick={onClick} 
      className={cn(className, isOver && "ring-2 ring-inset ring-[var(--m3-primary)] bg-[var(--m3-primary)]/5")}
    >
      {children}
    </div>
  );
};

const DraggableTaskRender: React.FC<{ id: string, children: React.ReactNode, className?: string, disabled?: boolean }> = ({ id, children, className, disabled }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, disabled });
  return (
    <div 
      ref={setNodeRef} 
      {...(disabled ? {} : listeners)} 
      {...(disabled ? {} : attributes)} 
      className={cn(className, !disabled && isDragging && "opacity-50 cursor-grabbing")}
      onClick={(e) => !disabled && isDragging && e.stopPropagation()}
    >
      {children}
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);
  const [repeatType, setRepeatType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [repeatCount, setRepeatCount] = useState(2);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Submission | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [calendarView, setCalendarView] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [addTaskType, setAddTaskType] = useState<'pages' | 'percentage'>('percentage');
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedArchiveIds, setSelectedArchiveIds] = useState<Set<string>>(new Set());
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [modalSubject, setModalSubject] = useState("");
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(() => {
    return localStorage.getItem('app-terms-accepted') === 'true';
  });
  const [showUpdateNotice, setShowUpdateNotice] = useState(() => {
    return localStorage.getItem('app-last-version') !== APP_VERSION;
  });
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [tempAccepted, setTempAccepted] = useState(false);
  const [sortCriteria, setSortCriteria] = useState<'deadline' | 'scheduled' | 'priority' | 'progress'>('scheduled');
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Clear selection on tab change
  useEffect(() => {
    setSelectedArchiveIds(new Set());
    setIsSelectionMode(false);
  }, [activeTab, subjectFilter]);

  // Reset modal subject when adding or editing
  useEffect(() => {
    if (isAdding) {
      setModalSubject("");
    }
  }, [isAdding]);

  useEffect(() => {
    if (isEditing && editData) {
      setModalSubject(editData.subject);
    }
  }, [isEditing, editData]);
  
  // Theme and Language state
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'ja';
  });
  const [modalPriority, setModalPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [theme, setTheme] = useState<'light' | 'dark' | 'dog' | 'cat' | 'animal' | 'flower'>(() => {
    const saved = localStorage.getItem('app-theme');
    return (saved as 'light' | 'dark' | 'dog' | 'cat' | 'animal' | 'flower') || 'light';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [subjects, setSubjects] = useState<string[]>(() => {
    const saved = localStorage.getItem('app-subjects');
    return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS;
  });
  const [newSubject, setNewSubject] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFocusSelectorOpen, setIsFocusSelectorOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [deadlineTime, setDeadlineTime] = useState("23:59");
  
  // Handle subject reordering
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSubjects((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const newItems = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem('app-subjects', JSON.stringify(newItems));
        syncSettings({ subjects: newItems });
        return newItems;
      });
    }
  }

  const [activeDragTaskId, setActiveDragTaskId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragTaskId(String(event.active.id));
  };

  const handleDragCancel = () => {
    setActiveDragTaskId(null);
  };

  const handleAddEvent = async () => {
    if (!user || !selectedDate || !newEventTitle.trim()) return;
    try {
      await addDoc(collection(db, 'submissions'), {
        uid: user.uid,
        title: newEventTitle.trim(),
        subject: modalSubject || '予定',
        deadline: Timestamp.fromDate(selectedDate),
        scheduledDate: Timestamp.fromDate(selectedDate),
        progress: 0,
        status: 'pending',
        priority: modalPriority || 'low',
        createdAt: serverTimestamp(),
        isEvent: true,
        taskType: 'percentage'
      });
      setNewEventTitle("");
      setIsAddingEvent(false);
      showToast(language === 'ja' ? '予定を追加しました' : 'Event added');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'submissions');
    }
  };

  const handleCalendarDragEnd = async (event: DragEndEvent) => {
    setActiveDragTaskId(null);
    const { active, over } = event;
    if (!over) return;
    
    const activeId = String(active.id);
    const overId = String(over.id);
    
    if (activeId.startsWith('task-')) {
      const taskId = activeId.replace('task-', '');
      const task = submissions.find(s => s.id === taskId);
      
      if (overId === 'unscheduled') {
        if (task) {
          try {
            await updateDoc(doc(db, 'submissions', taskId), {
              scheduledDate: null
            });
          } catch(error) {
            handleFirestoreError(error, OperationType.UPDATE, `submissions/${taskId}`);
          }
        }
      } else if (overId.startsWith('date-')) {
        const dateStr = overId.replace('date-', '');
        const [year, month, day] = dateStr.split('-').map(Number);
        
        if (task) {
          try {
            const newDate = new Date();
            newDate.setFullYear(year, month - 1, day);
            newDate.setHours(0, 0, 0, 0);
            await updateDoc(doc(db, 'submissions', taskId), {
              scheduledDate: Timestamp.fromDate(newDate)
            });
          } catch(error) {
            handleFirestoreError(error, OperationType.UPDATE, `submissions/${taskId}`);
          }
        }
      }
    }
  };

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

  const tasksByDate = useMemo(() => {
    const map: Record<string, Submission[]> = {};
    submissions.forEach(sub => {
      if (sub.isDeleted) return;
      const dateToUse = sub.scheduledDate || sub.deadline;
      if (!dateToUse) return;
      
      const dateKey = format(dateToUse instanceof Date ? dateToUse : dateToUse.toDate(), 'yyyy-MM-dd');
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(sub);
    });
    return map;
  }, [submissions]);

  const selectedDateSubmissions = useMemo(() => {
    if (!selectedDate) return [];
    return submissions.filter(sub => {
      if (sub.isDeleted) return false;
      const dateToUse = sub.scheduledDate || sub.deadline;
      if (!dateToUse) return false;
      return isSameDay(dateToUse instanceof Date ? dateToUse : dateToUse.toDate(), selectedDate);
    });
  }, [submissions, selectedDate]);

  const unscheduledSubmissions = useMemo(() => {
    return submissions.filter(sub => !sub.isDeleted && sub.status !== 'completed' && !sub.scheduledDate);
  }, [submissions]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const t = translations[language];

  const closeUpdateNotice = () => {
    localStorage.setItem('app-last-version', APP_VERSION);
    setShowUpdateNotice(false);
  };

  // Keep track of latest settings to reliably sync on tab close
  const latestSettings = useRef({ theme, language, subjects, pomodoroDurations });
  useEffect(() => {
    latestSettings.current = { theme, language, subjects, pomodoroDurations };
  }, [theme, language, subjects, pomodoroDurations]);

  const syncSettings = async (updates: Partial<typeof latestSettings.current>) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
    } catch (e) {
      console.warn("Failed to sync settings", e);
    }
  };

  // Logic to load settings from Firestore upon login
  useEffect(() => {
    if (!user) return;

    // Listen for remote settings changes
    const unsub = onSnapshot(doc(db, 'users', user.uid), { includeMetadataChanges: true }, (docSnap) => {
      // If the document has pending writes, it's a local optimistic update result.
      // We ignore these to prevent the "reversion" flicker where the server hasn't 
      // acknowledged our write yet and might return old values.
      if (docSnap.metadata.hasPendingWrites) return;

      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Only update if different, using functional state updates to avoid stale closures
        setTheme(t => data.theme && data.theme !== t ? data.theme : t);
        setLanguage(l => data.language && data.language !== l ? data.language : l);
        setSubjects(s => {
          if (!data.subjects || JSON.stringify(data.subjects) === JSON.stringify(s)) return s;
          return data.subjects;
        });
        setPomodoroDurations(p => {
          if (!data.pomodoroDurations || JSON.stringify(data.pomodoroDurations) === JSON.stringify(p)) return p;
          return data.pomodoroDurations;
        });
      } else {
        // First time login - push current local settings to firestore
        // But only if we have everything ready
        if (latestSettings.current.subjects.length > 0) {
          syncSettings(latestSettings.current);
        }
      }
    });

    return () => unsub();
  }, [user]);

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
    document.body.className = '';
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else if (theme !== 'light') {
      document.body.classList.add(`theme-${theme}`);
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
      const oneHour = 1000 * 60 * 60;
      
      for (let i = 0; i < submissions.length; i++) {
        const s = submissions[i];
        if (s.status === 'completed' || s.isDeleted) continue;
        
        const diff = s.deadline.getTime() - now.getTime();
        
        // Notify if deadline is within 1 hour and not already notified
        if (diff > 0 && diff < oneHour) {
          const storageKey = `notified_${s.id}`;
          if (!sessionStorage.getItem(storageKey)) {
            new Notification(language === 'ja' ? '締切間近の課題があります' : 'Upcoming deadline', {
              body: `${s.subject}: ${s.title} ${language === 'ja' ? 'の締切まであと1時間以内です！' : 'is due in less than an hour!'}`,
              icon: "/Gemini_Generated_Image_pm2flopm2flopm2f.png"
            });
            sessionStorage.setItem(storageKey, "true");
          }
        }
      }
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
          scheduledDate: docData.scheduledDate ? (docData.scheduledDate as Timestamp).toDate() : undefined,
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

    // Validate increment based on task type - Must be positive integer
    const isPagesValue = submission.taskType === 'pages';
    const maxIncrement = isPagesValue ? 999 : 100;
    const isInteger = /^\d+$/.test(progressInputValue);
    
    if (!isInteger || increment <= 0 || increment > maxIncrement) {
      showToast(isPagesValue ? (language === 'ja' ? '正当な整数を入力してください' : 'Enter a valid positive integer') : t.invalidProgressInput);
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
    const startPageRaw = formData.get('startPage') as string;
    const endPageRaw = formData.get('endPage') as string;
    
    // Strict integer validation
    const startPage = /^\d+$/.test(startPageRaw) ? parseInt(startPageRaw) : 0;
    const endPage = /^\d+$/.test(endPageRaw) ? parseInt(endPageRaw) : 0;
    const dateValue = formData.get('deadlineDate') as string;
    const timeValue = formData.get('deadlineTime') as string || "23:59";

    if (!title || !subject || !dateValue) return;

    const [hours, minutes] = timeValue.split(':').map(Number);
    const [y, m, d] = dateValue.split('-').map(Number);
    const combinedDate = new Date(y, m - 1, d, hours, minutes, 0, 0);

    let scheduledDateObj: Date | null = null;
    const scheduledDateVal = formData.get('scheduledDate') as string;
    if (scheduledDateVal) {
      const [sy, sm, sd] = scheduledDateVal.split('-').map(Number);
      scheduledDateObj = new Date(sy, sm - 1, sd, 0, 0, 0, 0);
    }

    try {
      const promises = [];
      const repeatTimes = isRepeatEnabled ? repeatCount : 1;
      const recurringId = isRepeatEnabled ? Math.random().toString(36).substring(2, 15) : undefined;
      
      for (let i = 0; i < repeatTimes; i++) {
        const dClone = new Date(combinedDate);
        if (isRepeatEnabled) {
          if (repeatType === 'daily') dClone.setDate(dClone.getDate() + i);
          if (repeatType === 'weekly') dClone.setDate(dClone.getDate() + (i * 7));
          if (repeatType === 'monthly') dClone.setMonth(dClone.getMonth() + i);
        }
        
        let sClone: Date | null = null;
        if (scheduledDateObj) {
          sClone = new Date(scheduledDateObj);
          if (isRepeatEnabled) {
            if (repeatType === 'daily') sClone.setDate(sClone.getDate() + i);
            if (repeatType === 'weekly') sClone.setDate(sClone.getDate() + (i * 7));
            if (repeatType === 'monthly') sClone.setMonth(sClone.getMonth() + i);
          }
        }
        
        promises.push(addDoc(collection(db, 'submissions'), {
          uid: user.uid,
          title,
          subject,
          deadline: Timestamp.fromDate(dClone),
          scheduledDate: sClone ? Timestamp.fromDate(sClone) : null,
          description: description || '',
          priority: priority || 'medium',
          progress: 0,
          status: 'pending',
          createdAt: serverTimestamp(),
          taskType,
          startPage: taskType === 'pages' ? startPage : null,
          endPage: taskType === 'pages' ? endPage : null,
          currentPage: taskType === 'pages' ? startPage : 0,
          activityLogs: [],
          recurringId: recurringId || null
        }));
      }
      await Promise.all(promises);
      setIsAdding(false);
      setIsRepeatEnabled(false);
      setRepeatType('weekly');
      setRepeatCount(2);
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
    const startPageStr = formData.get('startPage') as string;
    const endPageStr = formData.get('endPage') as string;

    if (!title || !subject || !dateValue) return;

    // Strict integer validation
    const startPage = /^\d+$/.test(startPageStr) ? parseInt(startPageStr) : (editData.startPage || 0);
    const endPage = /^\d+$/.test(endPageStr) ? parseInt(endPageStr) : (editData.endPage || 0);

    const [hours, minutes] = timeValue.split(':').map(Number);
    const [y, m, d] = dateValue.split('-').map(Number);
    const combinedDate = new Date(y, m - 1, d, hours, minutes, 0, 0);

    const updatePayload: any = {
      title, subject, description, priority, progress,
      deadline: Timestamp.fromDate(combinedDate)
    };

    const scheduledDateVal = formData.get('scheduledDate') as string;
    if (scheduledDateVal) {
      const [sy, sm, sd] = scheduledDateVal.split('-').map(Number);
      updatePayload.scheduledDate = Timestamp.fromDate(new Date(sy, sm - 1, sd, 0, 0, 0, 0));
    } else {
      updatePayload.scheduledDate = null;
    }

    if (editData.taskType === 'pages') {
      updatePayload.startPage = startPage;
      updatePayload.endPage = endPage;
    }

    const isCompleting = progress === 100 && editData.status !== 'completed';
    if (isCompleting) {
      setConfirmDialog({
        title: t.complete,
        message: t.confirmComplete,
        onConfirm: async () => {
          try {
            await updateDoc(doc(db, 'submissions', editData.id), {
              ...updatePayload,
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
        ...updatePayload,
        status: editData.status === 'completed' ? 'completed' : progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'pending',
        completedAt: (progress === 100 || editData.status === 'completed') ? (editData.completedAt || serverTimestamp()) : null
      });
      setIsEditing(false);
      setEditData(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `submissions/${editData.id}`);
    }
  };

  const deleteSubmission = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const submission = submissions.find(s => s.id === id);
    if (!submission) return;

    setConfirmDialog({
      title: language === 'ja' ? 'タスクを削除' : 'Delete Task',
      message: language === 'ja' ? 'このタスクを完全に削除しますか？' : 'Delete this task permanently?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'submissions', submission.id));
          setConfirmDialog(null);
          setSelectedId(null);
          showToast(language === 'ja' ? 'タスクを削除しました' : 'Task deleted');
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `submissions/${submission.id}`);
        }
      },
      onCancel: () => setConfirmDialog(null)
    });
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

  const groupedSubmissions = useMemo(() => {
    const groups: { [key: string]: Submission[] } = {};
    const filtered = submissions.filter(s => {
      // Search filter
      const searchLower = debouncedSearchQuery.toLowerCase();
      const matchesSearch = s.title.toLowerCase().includes(searchLower) || 
                          s.subject.toLowerCase().includes(searchLower) ||
                          (s.description || "").toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;

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
    
    // Sort the filtered list before grouping
    let sorted = [...filtered].sort((a, b) => {
      if (activeTab === 'history') {
        const timeA = a.completedAt?.toMillis() || a.deletedAt?.toMillis() || 0;
        const timeB = b.completedAt?.toMillis() || b.deletedAt?.toMillis() || 0;
        return timeB - timeA;
      }

      switch (sortCriteria) {
        case 'scheduled': {
          const dateA = a.scheduledDate || a.deadline;
          const dateB = b.scheduledDate || b.deadline;
          const timeA = dateA instanceof Date ? dateA.getTime() : dateA?.getTime() || 0;
          const timeB = dateB instanceof Date ? dateB.getTime() : dateB?.getTime() || 0;
          if (timeA !== timeB) return timeA - timeB;
          return a.deadline.getTime() - b.deadline.getTime();
        }
        case 'deadline':
          return a.deadline.getTime() - b.deadline.getTime();
        case 'priority': {
          const pMap = { high: 0, medium: 1, low: 2 };
          if (pMap[a.priority] !== pMap[b.priority]) return pMap[a.priority] - pMap[b.priority];
          return a.deadline.getTime() - b.deadline.getTime();
        }
        case 'progress':
          if (b.progress !== a.progress) return b.progress - a.progress;
          return a.deadline.getTime() - b.deadline.getTime();
        default:
          return a.deadline.getTime() - b.deadline.getTime();
      }
    });

    // Special handling for recurring tasks: only show the first pending one in the list
    if (activeTab === 'active') {
      const seenRecurringIds = new Set<string>();
      const finalSelection: Submission[] = [];
      
      sorted.forEach(s => {
        if (s.recurringId) {
          if (!seenRecurringIds.has(s.recurringId)) {
            seenRecurringIds.add(s.recurringId);
            // Check if there are more pending tasks in this series
            const moreCount = filtered.filter(f => f.recurringId === s.recurringId && f.status === 'pending' && f.id !== s.id).length;
            finalSelection.push({ ...s, hasMoreInSeries: moreCount > 0 });
          }
        } else {
          finalSelection.push(s);
        }
      });
      sorted = finalSelection;
    }

    sorted.forEach(s => {
      if (!groups[s.subject]) groups[s.subject] = [];
      groups[s.subject].push(s);
    });
    return groups;
  }, [submissions, activeTab, subjectFilter, sortCriteria, debouncedSearchQuery]);

  // Calculate overall urgency for background color
  const urgencyLevel = useMemo(() => {
    let minDays = Infinity;
    let found = false;
    const now = new Date();
    
    for (let i = 0; i < submissions.length; i++) {
      const s = submissions[i];
      if (s.status !== 'completed' && !s.isDeleted) {
        const d = differenceInDays(s.deadline, now);
        if (d < minDays) minDays = d;
        found = true;
      }
    }
    
    if (!found) return 'safe';
    if (minDays <= 0) return 'danger';
    if (minDays <= 3) return 'warning';
    return 'safe';
  }, [submissions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input (except for specific cases)
      const isTyping = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement;

      // Escape always works
      if (e.key === 'Escape') {
        setIsAdding(false);
        setIsEditing(false);
        setSelectedId(null);
        setHighlightedTaskId(null);
        setIsCalendarOpen(false);
        setIsMobileMenuOpen(false);
        setIsSettingsOpen(false);
        setIsSubjectDropdownOpen(false);
        if (isTyping) (e.target as HTMLElement).blur();
        return;
      }

      if (isTyping) {
        return;
      }
      
      // Global Shortcuts
      // Cmd+K or Ctrl+K or 'a' to add new task
      if (((e.metaKey || e.ctrlKey) && e.key === 'k') || e.key === 'a') {
        e.preventDefault();
        setIsAdding(true);
        return;
      }

      // Search with '/'
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // Calendar with 'c'
      if (e.key === 'c') {
        e.preventDefault();
        setIsCalendarOpen(true);
        return;
      }

      // History toggle with 'h'
      if (e.key === 'h') {
        e.preventDefault();
        setActiveTab(prev => prev === 'active' ? 'history' : 'active');
        return;
      }

      // Cycle sort with 's'
      if (e.key === 's') {
        e.preventDefault();
        const modes: ('deadline' | 'scheduled' | 'priority' | 'progress')[] = ['deadline', 'scheduled', 'priority', 'progress'];
        setSortCriteria(prev => modes[(modes.indexOf(prev) + 1) % modes.length]);
        return;
      }
      
      // If modal is open
      if (selectedId && !isAdding && !isEditing && !isCalendarOpen && !isSettingsOpen) {
        const selectedSubmission = submissions.find(s => s.id === selectedId);
        if (!selectedSubmission) return;
        
        if ((e.key === 'e' || e.key === 'E') && selectedSubmission.status !== 'completed' && !selectedSubmission.isDeleted && activeTab !== 'history') {
          e.preventDefault();
          setEditData(selectedSubmission);
          setIsEditing(true);
          setSelectedId(null);
        }
        else if (e.key === 'x' || e.key === 'X' || e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault();
          deleteSubmission(selectedId, e as any);
        }
        else if (e.key === 'Enter') {
          e.preventDefault();
          toggleComplete(selectedId, e as any);
          setSelectedId(null);
        }
        return;
      }

      // Task Navigation (j/k or Arrows)
      if (e.key === 'j' || e.key === 'ArrowDown' || e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        const allTasks = Object.values(groupedSubmissions).flat();
        if (allTasks.length === 0) return;

        let nextId = allTasks[0].id;
        if (highlightedTaskId) {
          const currentIndex = allTasks.findIndex(t => t.id === highlightedTaskId);
          if (e.key === 'j' || e.key === 'ArrowDown') {
            nextId = allTasks[(currentIndex + 1) % allTasks.length].id;
          } else {
            nextId = allTasks[(currentIndex - 1 + allTasks.length) % allTasks.length].id;
          }
        }
        setHighlightedTaskId(nextId);
        // Scroll to highlighted element
        const element = document.getElementById(`task-card-${nextId}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      if (highlightedTaskId && e.key === 'Enter') {
        e.preventDefault();
        setSelectedId(highlightedTaskId);
        setHighlightedTaskId(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, submissions, isAdding, isEditing, isCalendarOpen, isSettingsOpen, activeTab, highlightedTaskId, groupedSubmissions]);

  const selectedSubmission = submissions.find(s => s.id === selectedId);

  const recentActivities = useMemo(() => {
    return submissions
      .flatMap(s => (s.activityLogs || []).map(log => ({ ...log, taskTitle: s.title })))
      .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
      .slice(0, 3);
  }, [submissions]);

  const renderTermsModal = () => (
    <AnimatePresence>
      {showTermsModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[400] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="m3-card !bg-white w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden text-slate-900"
          >
            <div className="p-4 sm:p-5 border-b border-slate-200 shrink-0 bg-slate-50">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-3">
                <CheckSquare className="w-5 h-5 text-[var(--m3-primary)]" />
                {language === 'ja' ? '利用規約' : 'Terms of Service'}
              </h2>
            </div>

            <div 
              onScroll={(e) => {
                const target = e.currentTarget;
                if (target.scrollHeight - target.scrollTop <= target.clientHeight + 20) {
                  setHasScrolledToBottom(true);
                }
              }}
              className="flex-1 overflow-y-auto p-5 sm:p-8 scrollbar-custom space-y-6 text-slate-800"
            >
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-900">{TERMS_OF_SERVICE[language].title}</h3>
                <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap text-slate-700">
                  {TERMS_OF_SERVICE[language].intro}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-black flex items-center gap-2 text-slate-900">
                   {TERMS_OF_SERVICE[language].features.title}
                </h3>
                <ul className="space-y-3">
                  {TERMS_OF_SERVICE[language].features.items.map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-sm font-bold text-slate-700">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--m3-primary)] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-100">
                <h3 className="text-lg font-black text-slate-900">{TERMS_OF_SERVICE[language].terms.title}</h3>
                <p className="text-xs font-bold text-slate-500 italic">{TERMS_OF_SERVICE[language].terms.intro}</p>
                
                {TERMS_OF_SERVICE[language].terms.sections.map((section, idx) => (
                  <div key={idx} className="space-y-2">
                    <h4 className="text-sm font-black text-[var(--m3-primary)]">{section.title}</h4>
                    <p className="text-sm font-semibold leading-relaxed text-slate-700 whitespace-pre-wrap">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-black leading-relaxed text-[var(--m3-primary)] text-center">
                  {TERMS_OF_SERVICE[language].terms.footer}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-3 shrink-0">
              {user ? (
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => {
                      setShowTermsModal(false);
                    }}
                    className="px-6 py-3 rounded-2xl bg-[var(--m3-primary)] text-white font-bold transform active:scale-95 transition-all shadow-md"
                  >
                    {language === 'ja' ? '閉じる' : 'Close'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-3">
                    <button 
                      disabled={!hasScrolledToBottom}
                      onClick={() => setTempAccepted(!tempAccepted)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-300",
                        !hasScrolledToBottom ? "opacity-30 grayscale cursor-not-allowed" : "hover:scale-105 active:scale-95"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                        tempAccepted ? "bg-[var(--m3-primary)] border-[var(--m3-primary)]" : "border-slate-300"
                      )}>
                        {tempAccepted && <X className="w-4 h-4 text-white" />}
                      </div>
                      <span className="text-sm font-black uppercase tracking-wider text-slate-700">
                        {language === 'ja' ? '規約に同意する' : 'I agree to the terms'}
                      </span>
                    </button>

                    <div className="flex w-full gap-3">
                      <button 
                        onClick={() => {
                          setShowTermsModal(false);
                          setTempAccepted(false);
                          setHasScrolledToBottom(false);
                        }}
                        className="flex-1 px-6 py-4 rounded-2xl bg-slate-200 text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-slate-300 transition-all"
                      >
                        {t.cancel || 'キャンセル'}
                      </button>
                      <button 
                        disabled={!tempAccepted}
                        onClick={() => {
                          setIsTermsAccepted(true);
                          localStorage.setItem('app-terms-accepted', 'true');
                          setShowTermsModal(false);
                          login();
                        }}
                        className={cn(
                          "flex-[2] m3-button-primary !py-4",
                          !tempAccepted && "opacity-30 grayscale cursor-not-allowed"
                        )}
                      >
                        <LogIn className="w-5 h-5" />
                        {language === 'ja' ? 'Googleでログイン' : 'Login with Google'}
                      </button>
                    </div>
                  </div>
                  {!hasScrolledToBottom && (
                    <p className="text-xs font-black text-center text-red-500 uppercase tracking-widest animate-pulse">
                      {language === 'ja' ? '最後までスクロールして同意してください' : 'Please scroll to the bottom to agree'}
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full m3-card text-center shadow-2xl overflow-hidden"
        >
          <div className="p-10">
            <div className="w-20 h-20 bg-[var(--m3-primary-container)] rounded-[24px] flex items-center justify-center mx-auto mb-8 text-[var(--m3-on-primary-container)] rotate-3">
              <BookOpen className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-[var(--m3-on-surface)] mb-4 tracking-tight">{t.appName}</h1>
            <p className="text-[var(--m3-on-surface-variant)] mb-10 leading-relaxed font-medium">
              {language === 'ja' ? (
                <>提出物を美しく管理しましょう。<br />Googleアカウントでログインして開始します。</>
              ) : (
                <>Manage your assignments beautifully.<br />Sign in with Google to get started.</>
              )}
            </p>
            
            <button 
              onClick={() => {
                if (isTermsAccepted) {
                  login();
                } else {
                  setShowTermsModal(true);
                }
              }}
              className="w-full m3-button-primary py-6"
            >
              <LogIn className="w-5 h-5" />
              {language === 'ja' ? 'Googleでログイン' : 'Login with Google'}
            </button>
          </div>
        </motion.div>
        {renderTermsModal()}
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-6 lg:gap-8 flex-1">
        {/* Sidebar Tabs - Moved from Main */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="segmented-control w-full shrink-0"
        >
          <button 
            onClick={() => {
              setActiveTab('active');
              setSubjectFilter(null);
              setIsMobileMenuOpen(false);
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
              setIsMobileMenuOpen(false);
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

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-[var(--m3-primary-container)] rounded-[28px] p-6 w-full shadow-sm shrink-0"
        >
          <div className="text-xs text-[var(--m3-on-primary-container)] opacity-70 uppercase tracking-[0.15em] font-black mb-1">{t.progress}</div>
          <div className="flex items-baseline gap-1 text-[var(--m3-on-primary-container)]">
            <span className="text-4xl font-light tracking-tighter">{overallProgress}</span>
            <span className="text-sm font-bold opacity-70">%</span>
          </div>
          <div className="h-2 w-full bg-[var(--m3-on-primary-container)]/10 rounded-full mt-4 overflow-hidden shrink-0">
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
          className="bg-[var(--m3-surface-container-high)] rounded-[28px] p-6 w-full shadow-sm border border-[var(--m3-outline-variant)]/20 shrink-0"
        >
          <div className="text-xs text-[var(--m3-on-surface-variant)] uppercase tracking-wider font-black mb-2">{t.upcoming}</div>
          <div className="text-3xl lg:text-4xl font-light tracking-tighter text-[var(--m3-on-surface)]">
            {nearestDeadlinesCount.toString().padStart(2, '0')}
          </div>
          <div className="text-xs font-bold text-[var(--m3-on-surface-variant)] opacity-60 mt-1">{language === 'ja' ? '今後48時間以内' : 'Within 48 hours'}</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
          className="m3-card w-full shadow-none border border-[var(--m3-outline)]/10 flex flex-col shrink-0"
        >
          <div className="text-xs text-[var(--m3-on-surface-variant)] uppercase tracking-wider font-bold mb-3">{t.recentActivity}</div>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map(log => (
                <div key={log.id} className="border-l-2 border-[var(--m3-primary)]/30 pl-2.5 py-0.5">
                  <div className="text-xs font-bold text-[var(--m3-on-surface)] line-clamp-1">{log.taskTitle}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-[var(--m3-on-surface-variant)] font-medium">
                      {formatDistanceToNow(log.timestamp.toDate(), { addSuffix: true, locale: language === 'ja' ? ja : language === 'vi' ? vi : enUS })}
                    </span>
                    <span className="text-xs text-[var(--m3-primary)] font-bold">
                      +{log.progressIncrement}{log.type === 'pages' ? 'p' : '%'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-[var(--m3-on-surface-variant)] italic">{t.noActivity}</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[var(--m3-surface)] text-[var(--m3-on-surface)]">
      {/* Theme Background Watermarks */}
      {theme === 'dog' && (
        <>
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.06] text-[var(--m3-primary)] mix-blend-multiply flex items-center justify-center">
            <motion.div
              animate={{ rotate: [-2, 2, -2], x: [-10, 10, -10] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            >
              <Dog className="w-[120vw] h-[120vh] -rotate-12 translate-x-1/4 translate-y-1/4 stroke-[0.3]" />
            </motion.div>
          </div>
          <motion.div 
            animate={{ y: [0, -15, 0], rotate: [12, 15, 12] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="fixed top-20 right-[10%] opacity-[0.08] pointer-events-none z-0 scale-150"
          >
            <Dog className="w-40 h-40" />
          </motion.div>
          <motion.div 
            animate={{ x: [0, 10, 0], rotate: [-45, -40, -45] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="fixed bottom-40 left-[5%] opacity-[0.08] pointer-events-none z-0"
          >
            <PawPrint className="w-32 h-32" />
          </motion.div>
        </>
      )}
      {theme === 'cat' && (
        <>
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.06] text-[var(--m3-primary)] mix-blend-multiply flex items-center justify-center">
            <motion.div
              animate={{ rotate: [2, -2, 2], y: [-10, 10, -10] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Cat className="w-[120vw] h-[120vh] rotate-12 translate-x-1/4 translate-y-1/4 stroke-[0.3]" />
            </motion.div>
          </div>
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [-12, -15, -12] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="fixed top-40 left-[15%] opacity-[0.08] pointer-events-none z-0"
          >
            <Cat className="w-48 h-48" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, -20, 0], rotate: [45, 50, 45] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="fixed bottom-20 right-[8%] opacity-[0.08] pointer-events-none z-0"
          >
            <PawPrint className="w-24 h-24" />
          </motion.div>
        </>
      )}
      {theme === 'animal' && (
        <>
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.06] text-[var(--m3-primary)] mix-blend-multiply flex items-center justify-center">
            <motion.div
              animate={{ x: [-20, 20, -20] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            >
              <Rabbit className="w-[120vw] h-[120vh] -rotate-12 translate-x-1/4 translate-y-1/4 stroke-[0.3]" />
            </motion.div>
          </div>
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="fixed top-1/4 right-[5%] opacity-[0.08] pointer-events-none z-0 rotate-12"
          >
            <Rabbit className="w-56 h-56" />
          </motion.div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="fixed bottom-1/4 left-[10%] opacity-[0.08] pointer-events-none z-0 -rotate-12"
          >
            <Bird className="w-32 h-32" />
          </motion.div>
        </>
      )}
      {theme === 'flower' && (
        <>
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.15] mix-blend-multiply">
            {/* Scattered colorful flowers based on user image */}
            <motion.div animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-[5%] left-[10%] text-pink-500"><Flower className="w-24 h-24" /></motion.div>
            <motion.div animate={{ y: [0, 20, 0], rotate: [0, -15, 0] }} transition={{ duration: 12, repeat: Infinity }} className="absolute top-[15%] left-[40%] text-orange-400"><Flower2 className="w-16 h-16" /></motion.div>
            <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-[8%] left-[75%] text-yellow-500"><Flower className="w-32 h-32" /></motion.div>
            
            <motion.div animate={{ x: [-10, 10, -10], rotate: [12, 15, 12] }} transition={{ duration: 15, repeat: Infinity }} className="absolute top-[45%] left-[5%] text-blue-400"><Flower2 className="w-20 h-20" /></motion.div>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-red-500 opacity-20"><Flower className="w-[40vw] h-[40vw] stroke-[0.5]" /></motion.div>
            <motion.div animate={{ scale: [0.9, 1.05, 0.9], rotate: [-10, -5, -10] }} transition={{ duration: 14, repeat: Infinity }} className="absolute top-[40%] left-[85%] text-purple-400"><Flower className="w-28 h-28" /></motion.div>
            
            <motion.div animate={{ y: [0, 30, 0], x: [0, 10, 0] }} transition={{ duration: 11, repeat: Infinity }} className="absolute bottom-[15%] left-[15%] text-red-400"><Flower className="w-20 h-20" /></motion.div>
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute bottom-[10%] left-[45%] text-green-400"><Flower2 className="w-16 h-16" /></motion.div>
            <motion.div animate={{ y: [0, -20, 0], scale: [1, 1.2, 1] }} transition={{ duration: 9, repeat: Infinity }} className="absolute bottom-[20%] left-[80%] text-pink-400"><Flower2 className="w-24 h-24" /></motion.div>
          </div>
        </>
      )}

      {/* Update Notification Modal */}
      <AnimatePresence>
        {showUpdateNotice && (
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
              className="bg-[var(--m3-surface-container-high)] w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative border border-[var(--m3-outline)]/10"
            >
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--m3-primary)]/10 flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-[var(--m3-primary)]" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-[var(--m3-on-surface)]">
                    {RELEASE_NOTES.title}
                  </h2>
                  <p className="text-xs font-black text-[var(--m3-primary)] uppercase tracking-widest">Version {APP_VERSION}</p>
                </div>

                <div className="space-y-3 text-left">
                  <h3 className="text-sm font-black text-[var(--m3-on-surface-variant)] uppercase tracking-wider px-1">
                    {RELEASE_NOTES.features.title}
                  </h3>
                  <ul className="space-y-2">
                    {RELEASE_NOTES.features.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--m3-primary)] shrink-0" />
                        <span className="text-sm font-bold text-[var(--m3-on-surface)] leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={closeUpdateNotice}
                  className="w-full py-4 rounded-2xl bg-[var(--m3-primary)] text-[var(--m3-on-primary)] font-black text-sm transition-all hover:bg-[var(--m3-primary)]/90 shadow-lg shadow-[var(--m3-primary)]/20 active:scale-[0.98]"
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
            className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1"
          >
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 sm:p-3 rounded-full hover:bg-[var(--m3-surface-container)] text-[var(--m3-on-surface-variant)] transition-all active:scale-95 shrink-0"
              title={language === 'ja' ? 'メニュー' : 'Menu'}
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[var(--m3-primary)] flex shrink-0 items-center justify-center text-[var(--m3-on-primary)] shadow-lg shadow-[var(--m3-primary)]/20 overflow-hidden relative">
              {theme === 'dog' ? <Dog className="w-6 h-6 sm:w-7 sm:h-7" /> :
               theme === 'cat' ? <Cat className="w-6 h-6 sm:w-7 sm:h-7" /> :
               theme === 'animal' ? <Rabbit className="w-6 h-6 sm:w-7 sm:h-7" /> :
               theme === 'flower' ? <Flower className="w-6 h-6 sm:w-7 sm:h-7" /> :
               <Zap className="w-6 h-6 sm:w-7 sm:h-7" />}
               <motion.div 
                 animate={{ rotate: 360 }} 
                 transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-0 opacity-10"
               >
                 <PawPrint className="w-full h-full p-2" />
               </motion.div>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-[var(--m3-on-surface)] truncate">{t.appName}</h1>
              <p className="text-[10px] sm:text-xs text-[var(--m3-on-surface-variant)]/60 mt-0.5 font-black uppercase tracking-widest leading-none">
                {format(new Date(), language === 'ja' ? 'M月d日 (EEEE)' : 'MMMM d (EEEE)', { locale: language === 'ja' ? ja : language === 'vi' ? vi : enUS })}
              </p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex items-center gap-1 sm:gap-3 shrink-0"
          >
            <div className="hidden lg:flex items-center gap-2 mr-2">
              <button 
                onClick={() => setIsCalendarOpen(true)}
                className="p-3 rounded-full hover:bg-[var(--m3-surface-container)] text-[var(--m3-on-surface-variant)] transition-all active:scale-95"
                title={language === 'ja' ? 'カレンダー' : 'Calendar'}
              >
                <Calendar className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-3 rounded-full hover:bg-[var(--m3-surface-container)] text-[var(--m3-on-surface-variant)] transition-all active:scale-95"
                title={t.settings}
              >
                <Settings className="w-6 h-6" />
              </button>
              <div className="mx-1 h-6 w-px bg-[var(--m3-outline-variant)]/40" />
              <button 
                onClick={() => {
                  setConfirmDialog({
                    title: t.keyboardShortcuts,
                    message: language === 'ja' 
                      ? '• a / ctrl+k : 新規タスク\n• / : 検索\n• s : 並び替え順を切り替え\n• c : カレンダーを開く\n• h : アーカイブ切り替え\n• j / k / 矢印 : タスクを選択\n• Enter : 詳細を開く / 完了'
                      : '• a / ctrl+k : New Task\n• / : Search\n• s : Cycle Sorting\n• c : Open Calendar\n• h : Toggle Archive\n• j / k / Arrows : Select Task\n• Enter : Details / Complete',
                    onConfirm: () => setConfirmDialog(null),
                    confirmLabel: 'OK'
                  });
                }}
                className="p-3 rounded-full hover:bg-[var(--m3-surface-container)] text-[var(--m3-on-surface-variant)] transition-all active:scale-95"
                title={t.keyboardShortcuts}
              >
                <Keyboard className="w-6 h-6" />
              </button>
              <button 
                onClick={logout}
                className="p-3 rounded-full hover:bg-[var(--m3-error-container)]/50 text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-error)] transition-all active:scale-95"
                title={t.logout}
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full m3-card p-0 flex items-center justify-center overflow-hidden border-2 border-[var(--m3-primary)]/20 shadow-sm ml-1 sm:ml-2 shrink-0">
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
          <aside className="hidden lg:flex flex-col gap-6 lg:gap-8 overflow-y-auto pb-0 pr-4 border-r border-[var(--m3-outline-variant)]/40">
            <SidebarContent />
          </aside>

          {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 lg:pb-20 px-4 lg:px-0 lg:pr-2">
        {/* Search and Sort Logic */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1 group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--m3-on-surface-variant)]/40 group-focus-within:text-[var(--m3-primary)] transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[var(--m3-surface-container-high)] border border-[var(--m3-outline-variant)]/20 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-bold text-[var(--m3-on-surface)] transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[var(--m3-surface-variant)]/50 border border-[var(--m3-outline-variant)]/40 text-[10px] font-black text-[var(--m3-on-surface-variant)]/60">
                <span>/</span>
              </div>
            </div>

            {/* Sort Toggle */}
            <div className="flex p-1 bg-[var(--m3-surface-container-high)] rounded-2xl border border-[var(--m3-outline-variant)]/20 shrink-0 overflow-x-auto no-scrollbar">
              {([
                { id: 'deadline', label: t.sort_deadline },
                { id: 'scheduled', label: t.sort_scheduled },
                { id: 'priority', label: t.sort_priority },
                { id: 'progress', label: t.sort_progress }
              ] as const).map((criteria) => (
                <button
                  key={criteria.id}
                  onClick={() => setSortCriteria(criteria.id)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    sortCriteria === criteria.id 
                      ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-md" 
                      : "text-[var(--m3-on-surface-variant)] hover:bg-[var(--m3-surface-container-highest)]"
                  )}
                >
                  {criteria.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Filter Bar */}
          <div className="py-1 flex items-center w-full max-w-full">
          <div className="flex overflow-x-auto gap-2 px-2 no-scrollbar snap-x w-full">
            <button
              onClick={() => setSubjectFilter(null)}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shrink-0 snap-start",
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
                    "px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shrink-0 snap-start",
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

          {activeTab === 'history' && (
            <div className="flex justify-end px-2 mt-2">
              <button
                onClick={() => setIsSelectionMode(!isSelectionMode)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 whitespace-nowrap",
                  isSelectionMode 
                    ? "bg-[var(--m3-primary)]/10 text-[var(--m3-primary)] border border-[var(--m3-primary)]/20" 
                    : "bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface-variant)] border border-[var(--m3-outline)]/10"
                )}
              >
                {isSelectionMode ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                {isSelectionMode ? t.exitSelectionMode : t.selectionMode}
              </button>
            </div>
          )}
        </div>
      </div>

        {/* Bulk Action Bar (Archive Tab) */}
        <AnimatePresence>
          {activeTab === 'history' && isSelectionMode && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="px-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[var(--m3-on-surface)]">
                    {selectedArchiveIds.size > 0 
                      ? `${selectedArchiveIds.size} selected` 
                      : language === 'ja' ? 'タスクを選択' : 'Select Tasks'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const visibleIds = (Object.values(groupedSubmissions).flat() as Submission[]).map(s => s.id);
                      if (selectedArchiveIds.size === visibleIds.length && visibleIds.length > 0) {
                        setSelectedArchiveIds(new Set());
                      } else {
                        setSelectedArchiveIds(new Set(visibleIds));
                      }
                    }}
                    className="m3-button-text h-10 px-4 text-xs"
                  >
                    {(() => {
                      const visibleIds = (Object.values(groupedSubmissions).flat() as Submission[]).map(s => s.id);
                      const isAllSelected = selectedArchiveIds.size === visibleIds.length && visibleIds.length > 0;
                      return isAllSelected ? t.deselectAll : t.selectAll;
                    })()}
                  </button>
                  <button
                    onClick={() => {
                      if (selectedArchiveIds.size === 0) return;
                      setConfirmDialog({
                        title: language === 'ja' ? '一括削除' : 'Bulk Delete',
                        message: t.confirmDeleteSelected,
                        onConfirm: async () => {
                          try {
                            const promises = Array.from(selectedArchiveIds).map((id: string) => deleteDoc(doc(db, 'submissions', id)));
                            await Promise.all(promises);
                            setSelectedArchiveIds(new Set());
                            setConfirmDialog(null);
                          } catch (error) {
                            console.error("Bulk delete failed", error);
                          }
                        },
                        onCancel: () => setConfirmDialog(null)
                      });
                    }}
                    disabled={selectedArchiveIds.size === 0}
                    className="m3-button-primary h-10 px-4 text-xs bg-[var(--m3-error)] hover:bg-[var(--m3-error)]/90 text-[var(--m3-on-error)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    {t.deleteSelected}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                    <span className="text-xs font-black text-[var(--m3-on-surface-variant)] bg-[var(--m3-surface-container-high)] px-2 py-0.5 rounded-md ml-2">
                      {(items as Submission[]).length}
                    </span>
                  </div>
                  <motion.div 
                    layout
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={cn(
                      "grid gap-4 sm:gap-6",
                      activeTab === 'history' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    )}
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      {(items as any[])
                        .map((submission) => (
                          <MemoizedSubmissionCard 
                                key={submission.id} 
                                submission={submission} 
                                hasMoreInSeries={submission.hasMoreInSeries}
                                isHistoryView={activeTab === 'history'}
                                language={language}
                                theme={theme}
                                isSelectionMode={isSelectionMode}
                                isSelected={selectedArchiveIds.has(submission.id)}
                                isHighlighted={highlightedTaskId === submission.id}
                                onToggleSelect={(e) => {
                                  e.stopPropagation();
                                  const newSet = new Set(selectedArchiveIds);
                                  if (newSet.has(submission.id)) {
                                    newSet.delete(submission.id);
                                  } else {
                                    newSet.add(submission.id);
                                  }
                                  setSelectedArchiveIds(newSet);
                                }}
                                onClick={() => {
                                  if (isSelectionMode) {
                                    const newSet = new Set(selectedArchiveIds);
                                    if (newSet.has(submission.id)) {
                                      newSet.delete(submission.id);
                                    } else {
                                      newSet.add(submission.id);
                                    }
                                    setSelectedArchiveIds(newSet);
                                  } else {
                                    setSelectedId(submission.id);
                                  }
                                }}
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
                                      message: language === 'ja' ? 'このタスクを完全に削除しますか？' : 'Delete this task permanently?',
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
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center py-24 px-6 relative"
              >
                <div className="relative group">
                  <div className="absolute -inset-8 bg-[var(--m3-primary)]/5 rounded-full blur-2xl group-hover:bg-[var(--m3-primary)]/10 transition-all duration-700" />
                  {theme === 'dog' ? <Dog className="w-24 h-24 mb-6 text-[var(--m3-primary)]/40 relative z-10 animate-bounce" /> :
                   theme === 'cat' ? <Cat className="w-24 h-24 mb-6 text-[var(--m3-primary)]/40 relative z-10 animate-pulse" /> :
                   theme === 'animal' ? <Rabbit className="w-24 h-24 mb-6 text-[var(--m3-primary)]/40 relative z-10 animate-bounce" /> :
                   theme === 'flower' ? <Flower className="w-24 h-24 mb-6 text-[var(--m3-primary)]/40 relative z-10 animate-pulse" /> :
                   <BookOpen className="w-20 h-20 mb-6 text-[var(--m3-primary)]/30 relative z-10" />}
                </div>
                <p className="font-black text-lg text-[var(--m3-on-surface-variant)]/60 uppercase tracking-widest">{t.noTasks}</p>
                <p className="text-sm font-bold text-[var(--m3-on-surface-variant)]/40 mt-2">{language === 'ja' ? '新しいタスクを追加してください' : 'Add a new task to get started'}</p>
              </motion.div>
            )}
          </motion.div>
        </LayoutGroup>
      </main>
    </div>
  </div>

  {/* Calendar Drawer */}
  <AnimatePresence>
    {isCalendarOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCalendarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 w-full h-full bg-[var(--m3-surface)] z-[160] flex flex-col overflow-hidden"
        >
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleCalendarDragEnd} onDragCancel={handleDragCancel}>
            <div className="p-4 sm:px-8 py-4 flex items-center justify-between border-b border-[var(--m3-outline-variant)]/40 shrink-0 bg-[var(--m3-surface)] z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[20px] bg-[var(--m3-primary-container)] flex items-center justify-center text-[var(--m3-on-primary-container)] shadow-sm">
                <Calendar className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--m3-on-surface)] tracking-tight">
                  {language === 'ja' ? 'カレンダー・スケジュール' : 'Calendar & Schedule'}
                </h2>
                <div className="text-[10px] sm:text-xs font-bold text-[var(--m3-on-surface-variant)] opacity-70">
                  {format(new Date(), 'yyyy / MM / dd')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedDate(new Date())}
                className="hidden sm:flex px-4 py-2 bg-[var(--m3-secondary-container)] hover:bg-[var(--m3-secondary-container)]/80 text-[var(--m3-on-secondary-container)] rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
              >
                {language === 'ja' ? '今日' : 'Today'}
              </button>
              <button 
                onClick={() => setIsCalendarOpen(false)}
                className="p-2 sm:p-3 rounded-2xl hover:bg-[var(--m3-surface-container-highest)] text-[var(--m3-on-surface-variant)] transition-all bg-[var(--m3-surface-container-high)]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row h-full">
            {/* Left Column: Calendar Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:border-r border-[var(--m3-outline-variant)]/30 custom-scrollbar">
              {/* View Switcher/Navigation Header */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-[var(--m3-surface-container-low)] p-3 rounded-3xl border border-[var(--m3-outline-variant)]/20 shadow-sm">
                <div className="flex p-1 bg-[var(--m3-surface-container-high)] rounded-[18px] border border-[var(--m3-outline-variant)]/20 shadow-inner w-full sm:w-auto">
                  {(['weekly', 'monthly', 'yearly'] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => setCalendarView(view)}
                      className={cn(
                        "px-4 sm:px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                        calendarView === view 
                          ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-md" 
                          : "text-[var(--m3-on-surface-variant)] hover:bg-[var(--m3-surface-container-highest)]"
                      )}
                    >
                      {language === 'ja' 
                        ? { weekly: '週間', monthly: '月間', yearly: '年間' }[view]
                        : view.charAt(0).toUpperCase() + view.slice(1)
                      }
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center justify-between flex-1 px-4 py-1.5 bg-[var(--m3-surface-container-highest)]/40 rounded-2xl border border-[var(--m3-outline-variant)]/10 w-full sm:w-auto">
                  <div className="text-sm font-black text-[var(--m3-primary)]">
                    {selectedDate ? format(selectedDate, 
                      calendarView === 'yearly' ? 'yyyy年' : 
                      language === 'ja' ? 'yyyy年 M月' : 'MMMM yyyy', 
                      { locale: language === 'ja' ? ja : language === 'vi' ? vi : enUS }
                    ) : '---'}
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        const d = new Date(selectedDate || new Date());
                        if (calendarView === 'monthly') d.setMonth(d.getMonth() - 1);
                        else if (calendarView === 'weekly') d.setDate(d.getDate() - 7);
                        else d.setFullYear(d.getFullYear() - 1);
                        setSelectedDate(d);
                      }}
                      className="p-1.5 rounded-xl hover:bg-[var(--m3-primary)]/10 text-[var(--m3-primary)] transition-all"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                    <button 
                      onClick={() => {
                        const d = new Date(selectedDate || new Date());
                        if (calendarView === 'monthly') d.setMonth(d.getMonth() + 1);
                        else if (calendarView === 'weekly') d.setDate(d.getDate() + 7);
                        else d.setFullYear(d.getFullYear() + 1);
                        setSelectedDate(d);
                      }}
                      className="p-1.5 rounded-xl hover:bg-[var(--m3-primary)]/10 text-[var(--m3-primary)] transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            {/* Calendar Component */}
            <div className={cn(
              "bg-[var(--m3-surface-container)] rounded-[32px] border border-[var(--m3-outline-variant)]/30 overflow-hidden",
              calendarView === 'monthly' ? "p-0" : "p-4",
              calendarView === 'yearly' && "p-2",
              calendarView === 'weekly' && "pb-2"
            )}>
              <style>{`
                .rdp-row:empty { display: none; }
                .calendar-dot-modifier::after {
                  content: '';
                  display: block;
                  width: 4px;
                  height: 4px;
                  border-radius: 50%;
                  background-color: currentColor;
                  margin-top: 1px;
                }
                .calendar-dot-modifier:not(.rdp-day_selected)::after {
                  background-color: var(--m3-primary);
                }
                /* Monthly Grid Container */
                .monthly-grid {
                  display: flex;
                  flex-direction: column;
                  width: 100%;
                }
                .monthly-header {
                  display: grid;
                  grid-template-columns: repeat(7, 1fr);
                  border-bottom: 1.5px solid var(--m3-outline-variant);
                  background: var(--m3-surface-container-high);
                }
                .monthly-header-cell {
                  padding: 8px 4px;
                  text-align: center;
                  font-size: 10px;
                  font-weight: 900;
                  color: var(--m3-on-surface-variant);
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                }
                .monthly-row {
                  display: grid;
                  grid-template-columns: repeat(7, 1fr);
                  border-bottom: 1px solid var(--m3-outline-variant);
                }
                .monthly-cell {
                  min-height: 85px;
                  border-right: 1px solid var(--m3-outline-variant);
                  display: flex;
                  flex-direction: column;
                  padding: 4px;
                  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                  cursor: pointer;
                  background: var(--m3-surface-container);
                }
                .monthly-cell:hover {
                  background: var(--m3-surface-container-high);
                }
                @media (min-width: 640px) {
                  .monthly-cell {
                    min-height: 100px;
                  }
                }
                .monthly-cell:last-child { border-right: none; }
                .monthly-cell-header {
                  display: flex;
                  justify-content: flex-end;
                  margin-bottom: 2px;
                }
                .monthly-day-num {
                  font-size: 11px;
                  font-weight: 800;
                  width: 22px;
                  height: 22px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 8px;
                  color: var(--m3-on-surface-variant);
                }
                .monthly-task-strip {
                  font-size: 9px;
                  font-weight: 800;
                  padding: 2px 6px;
                  border-radius: 6px;
                  margin-bottom: 2px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  max-width: 100%;
                  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .monthly-today .monthly-day-num {
                  background: var(--m3-primary);
                  color: var(--m3-on-primary);
                  box-shadow: 0 2px 4px var(--m3-primary);
                }
                .monthly-other-month { opacity: 0.35; }
                .monthly-selected-cell { 
                  background: var(--m3-primary-container) !important;
                  box-shadow: inset 0 0 0 2px var(--m3-primary);
                }
                .monthly-selected-cell .monthly-day-num {
                  color: var(--m3-on-primary-container);
                }
              `}</style>
              {calendarView === 'yearly' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 md:p-6 overflow-y-auto max-h-[600px] w-full bg-[var(--m3-surface)]">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const monthDate = new Date((selectedDate || new Date()).getFullYear(), i, 1);
                    
                    const startDate = startOfWeek(monthDate, { locale: language === 'ja' ? ja : language === 'vi' ? vi : enUS });
                    const monthEnd = endOfMonth(monthDate);
                    const weekEnd = endOfWeek(monthEnd, { locale: language === 'ja' ? ja : language === 'vi' ? vi : enUS });
                    
                    const rows = [];
                    let day = startDate;
                    
                    while (day <= weekEnd) {
                      const cells = [];
                      for (let j = 0; j < 7; j++) {
                        const dateClone = new Date(day);
                        const isSelected = selectedDate && isSameDay(dateClone, selectedDate);
                        const isCurrentMonth = isSameMonth(dateClone, monthDate);
                        const hasTask = !!tasksByDate[format(dateClone, 'yyyy-MM-dd')];
                        const isTod = isToday(dateClone);
                        
                        cells.push(
                          <DroppableDateCell
                            key={dateClone.toISOString()}
                            id={`date-${format(dateClone, 'yyyy-MM-dd')}`}
                            className={cn(
                              "w-full aspect-square flex flex-col items-center justify-center rounded-lg transition-all cursor-pointer relative",
                              !isCurrentMonth ? "opacity-30" : "hover:bg-[var(--m3-surface-container-highest)]",
                              isSelected && isCurrentMonth && !isTod ? "bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] hover:bg-[var(--m3-primary-container)]" : "",
                              isTod ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)] hover:bg-[var(--m3-primary)]" : "",
                              isTod && isSelected ? "ring-2 ring-[var(--m3-primary)] ring-offset-1 ring-offset-[var(--m3-surface-container-high)]" : ""
                            )}
                            onClick={() => {
                              setSelectedDate(dateClone);
                              setCalendarView('monthly');
                            }}
                          >
                            <span className="text-[10px] font-bold leading-none pointer-events-none">{dateClone.getDate()}</span>
                            {hasTask && isCurrentMonth && (
                              <div className={cn(
                                "absolute bottom-1 w-1 h-1 rounded-full pointer-events-none",
                                isSelected || isTod ? "bg-current opacity-70" : "bg-[var(--m3-primary)]"
                              )} />
                            )}
                          </DroppableDateCell>
                        );
                        
                        day = addDays(day, 1);
                      }
                      rows.push(<div key={day.toISOString()} className="grid grid-cols-7 gap-0.5">{cells}</div>);
                    }

                    return (
                      <div key={i} className="flex flex-col space-y-2 bg-[var(--m3-surface-container-lowest)] p-3 rounded-2xl border border-[var(--m3-outline-variant)]/20 shadow-sm">
                        <div className="text-sm font-black text-center text-[var(--m3-on-surface)]">
                          {format(monthDate, language === 'ja' ? 'M月' : 'MMMM')}
                        </div>
                        <div className="grid grid-cols-7 gap-0.5 text-[8px] font-black text-center text-[var(--m3-on-surface-variant)] uppercase tracking-widest mb-1">
                          {(language === 'ja' ? ['日', '月', '火', '水', '木', '金', '土'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']).map(d => <div key={d}>{d}</div>)}
                        </div>
                        <div className="flex flex-col space-y-0.5">
                          {rows}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : calendarView === 'weekly' ? (
                <div className="flex flex-col h-full w-full min-h-[400px]">
                  <div className="grid grid-cols-7 flex-1">
                    {(() => {
                      const start = startOfWeek(selectedDate || new Date(), { locale: language === 'ja' ? ja : language === 'vi' ? vi : enUS });
                      const cols = [];
                      for (let i = 0; i < 7; i++) {
                        const dateClone = addDays(start, i);
                        const dateStr = format(dateClone, 'yyyy-MM-dd');
                        const isSelected = selectedDate && isSameDay(dateClone, selectedDate);
                        const isTod = isToday(dateClone);
                        const dayTasks = tasksByDate[dateStr] || [];

                        cols.push(
                          <DroppableDateCell
                            key={dateStr}
                            id={`date-${dateStr}`}
                            className={cn(
                              "border-r border-[var(--m3-outline-variant)]/30 last:border-r-0 flex flex-col p-2 sm:p-3 gap-3 transition-all appearance-none text-left h-full cursor-pointer",
                              isSelected ? "bg-[var(--m3-primary-container)]/20" : "hover:bg-[var(--m3-surface-container)]"
                            )}
                            onClick={() => setSelectedDate(dateClone)}
                          >
                            <div className="flex flex-col items-center w-full gap-1.5 pb-3 border-b border-[var(--m3-outline-variant)]/30">
                              <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                isTod || isSelected ? "text-[var(--m3-primary)]" : "text-[var(--m3-on-surface-variant)]"
                              )}>
                                {format(dateClone, language === 'ja' ? 'E' : 'EEE', { locale: language === 'ja' ? ja : language === 'vi' ? vi : enUS })}
                              </span>
                              <div className={cn(
                                "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-bold shadow-sm transition-all",
                                isSelected ? "bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] ring-2 ring-[var(--m3-primary)] ring-offset-2 ring-offset-[var(--m3-surface-container-high)]" : 
                                isTod ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)]" : 
                                "bg-[var(--m3-surface)] text-[var(--m3-on-surface)] border border-[var(--m3-outline-variant)]/30 group-hover:border-[var(--m3-outline-variant)]/60"
                              )}>
                                {dateClone.getDate()}
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 w-full flex-1">
                              {dayTasks.map(task => (
                                <DraggableTaskRender 
                                  key={task.id} 
                                  id={`task-${task.id}`}
                                  className={cn(
                                    "p-2 sm:p-2.5 rounded-xl border-l-4 shadow-sm w-full text-left transition-all",
                                    task.status === 'completed' 
                                      ? "bg-[var(--m3-surface)] border-l-[var(--m3-outline)] opacity-60" 
                                      : task.isEvent ? "bg-[var(--m3-secondary-container)] border-l-[var(--m3-secondary)] cursor-grab active:cursor-grabbing hover:shadow-md" : "bg-[var(--m3-surface-container-lowest)] border-l-[var(--m3-primary)] hover:shadow-md cursor-grab active:cursor-grabbing"
                                  )}
                                >
                                  <div className={cn(
                                    "text-xs sm:text-sm font-bold line-clamp-2",
                                    task.status === 'completed' ? "text-[var(--m3-on-surface-variant)] line-through" : "text-[var(--m3-on-surface)]"
                                  )}>
                                    {task.title}
                                  </div>
                                </DraggableTaskRender>
                              ))}
                              {dayTasks.length === 0 && (
                                <div className="text-[10px] text-[var(--m3-on-surface-variant)] opacity-50 text-center py-4 font-bold flex-1 flex flex-col justify-center">
                                  -
                                </div>
                              )}
                            </div>
                          </DroppableDateCell>
                        );
                      }
                      return cols;
                    })()}
                  </div>
                </div>
              ) : (
                <div className="monthly-grid">
                  <div className="monthly-header">
                    {(language === 'ja' ? ['日', '月', '火', '水', '木', '金', '土'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map((day, i) => (
                      <div key={day} className={cn("monthly-header-cell", i === 0 && "text-red-500", i === 6 && "text-blue-500")}>{day}</div>
                    ))}
                  </div>
                  {(() => {
                    const monthStart = startOfMonth(selectedDate || new Date());
                    const startDate = startOfWeek(monthStart, { locale: language === 'ja' ? ja : language === 'vi' ? vi : enUS });
                    const monthEnd = endOfMonth(selectedDate || new Date());
                    const weekEnd = endOfWeek(monthEnd, { locale: language === 'ja' ? ja : language === 'vi' ? vi : enUS });
                    
                    const rows = [];
                    let day = startDate;
                    
                    while (day <= weekEnd) {
                      const cells = [];
                      for (let i = 0; i < 7; i++) {
                        const dateClone = new Date(day);
                        const dateStr = format(dateClone, 'yyyy-MM-dd');
                        const isSelected = selectedDate && isSameDay(dateClone, selectedDate);
                        const isCurrentMonth = isSameMonth(dateClone, selectedDate || new Date());
                        const dayTasks = tasksByDate[dateStr] || [];
                        const holidays = holiday_jp.between(dateClone, dateClone);
                        const holiday = holidays.length > 0 ? holidays[0] : null;
                        const dayOfWeek = dateClone.getDay();
                        const isRedDay = dayOfWeek === 0 || !!holiday;
                        const isBlueDay = dayOfWeek === 6 && !holiday;

                        cells.push(
                          <DroppableDateCell 
                            key={dateStr}
                            id={`date-${dateStr}`}
                            onClick={() => setSelectedDate(dateClone)}
                            className={cn(
                              "border-r border-b border-[var(--m3-outline-variant)]/30 last:border-r-0 min-h-[120px] flex flex-col p-1 sm:p-2 transition-all appearance-none text-left cursor-pointer hover:bg-[var(--m3-surface-container)] relative z-0",
                              !isCurrentMonth && "opacity-40 bg-[var(--m3-surface-container-low)]/30",
                              isSelected && "bg-[var(--m3-primary-container)]/10 ring-2 ring-inset ring-[var(--m3-primary)]/50 z-10",
                              isToday(dateClone) && "bg-[var(--m3-primary)]/5"
                            )}
                          >
                            <div className="flex justify-between items-start mb-1 h-6">
                              <span className={cn(
                                "text-xs sm:text-sm font-bold w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full mt-0.5 ml-0.5 shrink-0",
                                isToday(dateClone) ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)]" : 
                                isSelected ? "bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)]" :
                                isRedDay ? "text-red-500" :
                                isBlueDay ? "text-blue-500" : "text-[var(--m3-on-surface)]"
                              )}>{dateClone.getDate()}</span>
                              {holiday && (
                                <span className="text-[8px] sm:text-[9px] font-bold text-red-500 opacity-80 leading-tight mt-1 text-right truncate">
                                  {holiday.name}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 space-y-0.5 min-w-0 mt-1">
                              {dayTasks.slice(0, 4).map(task => (
                                <DraggableTaskRender 
                                  key={task.id} 
                                  id={`task-${task.id}`}
                                  className={cn(
                                    "text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded border border-transparent truncate cursor-grab active:cursor-grabbing font-bold transition-all",
                                    task.status === 'completed'
                                      ? "bg-[var(--m3-surface-variant)]/50 text-[var(--m3-on-surface-variant)] opacity-50 line-through"
                                      : task.isEvent ? "bg-[var(--m3-secondary)]/10 text-[var(--m3-secondary)] hover:bg-[var(--m3-secondary)]/20" : "bg-[var(--m3-primary)]/10 text-[var(--m3-primary)] hover:bg-[var(--m3-primary)]/20"
                                  )}
                                >
                                  {task.title}
                                </DraggableTaskRender>
                              ))}
                              {dayTasks.length > 4 && (
                                <div className="text-[7px] font-black text-[var(--m3-on-surface-variant)] opacity-40 pl-1">
                                  +{dayTasks.length - 4}
                                </div>
                              )}
                            </div>
                          </DroppableDateCell>
                        );
                        day = addDays(day, 1);
                      }
                      rows.push(<div key={day.toISOString()} className="monthly-row">{cells}</div>);
                    }
                    return rows;
                  })()}
                </div>
              )}
            </div>
          </div>
            


            {/* Right Column: Selected Date & Unscheduled List */}
            <div className="w-full lg:w-[400px] xl:w-[450px] bg-[var(--m3-surface-container-low)] flex flex-col overflow-hidden shadow-2xl lg:shadow-none border-t lg:border-t-0 border-[var(--m3-outline-variant)]/40 h-[60vh] lg:h-full">
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-8 custom-scrollbar">
                
                {/* Task List for Selected Date */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-[var(--m3-primary)] rounded-full" />
                      <div>
                        <h3 className="text-sm font-black text-[var(--m3-on-surface)] uppercase tracking-widest">
                          {selectedDate ? format(selectedDate, language === 'ja' ? 'M/d 予定・タスク' : "Sch. for M/d", { locale: language === 'ja' ? ja : language === 'vi' ? vi : enUS }) : '---'}
                        </h3>
                        <p className="text-[10px] font-bold text-[var(--m3-on-surface-variant)] opacity-70">
                          {selectedDateSubmissions.length} {language === 'ja' ? '件のアイテム' : 'items'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsAddingEvent(!isAddingEvent)}
                        className="flex items-center gap-1.5 text-[11px] font-black text-[var(--m3-primary)] bg-[var(--m3-primary)]/5 hover:bg-[var(--m3-primary)]/10 px-4 py-2 rounded-2xl transition-all shadow-sm border border-[var(--m3-primary)]/10"
                      >
                        {isAddingEvent ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {language === 'ja' ? '予定を追加' : 'Add Event'}
                      </button>
                      <button
                        onClick={() => {
                          setAddTaskType('percentage');
                          setIsAdding(true);
                        }}
                        className="hidden sm:flex items-center gap-1.5 text-[11px] font-black text-[var(--m3-secondary)] bg-[var(--m3-secondary)]/5 hover:bg-[var(--m3-secondary)]/10 px-4 py-2 rounded-2xl transition-all shadow-sm border border-[var(--m3-secondary)]/10"
                      >
                        <BookOpen className="w-4 h-4" />
                        {language === 'ja' ? '課題を追加' : 'Add Assignment'}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isAddingEvent && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="px-1 overflow-hidden"
                      >
                        <div className="flex flex-col gap-4 p-5 bg-[var(--m3-surface-container-highest)] rounded-[32px] border-2 border-[var(--m3-primary)]/20 shadow-xl ring-8 ring-[var(--m3-primary)]/5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-[var(--m3-primary)]/10 flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-[var(--m3-primary)]" />
                              </div>
                              <span className="text-[10px] font-black uppercase text-[var(--m3-primary)] tracking-widest">{language === 'ja' ? '新規予定の作成' : 'Create New Event'}</span>
                            </div>
                            <div className="flex gap-1">
                              {(['low', 'medium', 'high'] as const).map(p => (
                                <button
                                  key={p}
                                  onClick={() => setModalPriority(p)}
                                  className={cn(
                                    "w-3 h-3 rounded-full transition-all",
                                    modalPriority === p ? "ring-2 ring-offset-2 ring-[var(--m3-outline)] scale-110" : "opacity-40 hover:opacity-100",
                                    p === 'high' ? "bg-red-500" : p === 'medium' ? "bg-orange-500" : "bg-blue-500"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <input
                              autoFocus
                              type="text"
                              value={newEventTitle}
                              onChange={(e) => setNewEventTitle(e.target.value)}
                              placeholder={language === 'ja' ? 'どのような予定ですか？' : 'What is the event?'}
                              className="w-full bg-transparent text-lg font-black text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)]/30 focus:outline-none"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddEvent();
                              }}
                            />
                            
                            <div className="flex flex-wrap gap-2">
                              {['学校', '個人', '重要', '仕事', 'その他'].map(s => (
                                <button
                                  key={s}
                                  onClick={() => setModalSubject(s)}
                                  className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all",
                                    modalSubject === s 
                                      ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-md" 
                                      : "bg-[var(--m3-surface-container)] text-[var(--m3-on-surface-variant)] hover:bg-[var(--m3-surface-container-high)]"
                                  )}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-[var(--m3-outline-variant)]/30 mt-2">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-[var(--m3-on-surface-variant)] opacity-50 uppercase tracking-tighter">{language === 'ja' ? '日付' : 'Date'}</span>
                              <span className="text-xs font-black text-[var(--m3-on-surface)]">
                                {selectedDate && format(selectedDate, 'yyyy MM/dd')}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setIsAddingEvent(false)}
                                className="px-4 py-2 rounded-xl text-[11px] font-black text-[var(--m3-on-surface-variant)] hover:bg-[var(--m3-surface-container-high)] transition-all"
                              >
                                {language === 'ja' ? 'キャンセル' : 'Cancel'}
                              </button>
                              <button
                                onClick={handleAddEvent}
                                disabled={!newEventTitle.trim()}
                                className="px-6 py-2 rounded-xl bg-[var(--m3-primary)] text-[var(--m3-on-primary)] text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[var(--m3-primary)]/20 disabled:opacity-30 disabled:grayscale transition-all active:scale-95"
                              >
                                {language === 'ja' ? '作成' : 'Create'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {selectedDateSubmissions.length > 0 ? (
                    <div className="space-y-3 px-1">
                      {selectedDateSubmissions.map((sub, idx) => (
                        <motion.div
                          key={sub.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => setSelectedId(sub.id)}
                        >
                          <DraggableTaskRender
                            id={`task-${sub.id}`}
                            className={cn(
                              "group p-4 rounded-[28px] transition-all cursor-grab active:cursor-grabbing flex items-center gap-4 border shadow-sm",
                              sub.status === 'completed' 
                                ? "bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)]/40 opacity-70" 
                                : "bg-[var(--m3-surface-container-highest)] border-[var(--m3-outline)]/10 hover:border-[var(--m3-primary)]/30 hover:shadow-lg"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:rotate-6 group-hover:scale-110",
                              sub.status === 'completed' ? "bg-green-500/10 text-green-500" : 
                              sub.isEvent ? "bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)]" : "bg-[var(--m3-primary)]/5 text-[var(--m3-primary)]"
                            )}>
                              {sub.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : 
                               sub.isEvent ? <Calendar className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0 pointer-events-none">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={cn(
                                  "text-[9px] font-black uppercase tracking-tighter truncate max-w-[100px]",
                                  sub.isEvent ? "text-[var(--m3-secondary)]" : "text-[var(--m3-primary)]"
                                )}>{sub.subject}</span>
                                {sub.priority === 'high' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                              </div>
                              <h4 className="text-sm font-black text-[var(--m3-on-surface)] truncate group-hover:text-[var(--m3-primary)] transition-colors leading-tight">
                                {sub.title}
                              </h4>
                            </div>
                            <div className="text-right shrink-0 pointer-events-none">
                              {!sub.isEvent && (
                                <div className="text-xs font-black text-[var(--m3-on-surface-variant)]">{sub.progress}%</div>
                              )}
                              {sub.status === 'completed' && <div className="text-[10px] font-black text-green-600 uppercase tracking-widest">{language === 'ja' ? '完了' : 'Done'}</div>}
                            </div>
                          </DraggableTaskRender>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 rounded-[40px] border-2 border-dashed border-[var(--m3-outline-variant)]/30 flex flex-col items-center justify-center text-center p-8 bg-[var(--m3-surface-container)]/30 grayscale opacity-40">
                      <div className="w-20 h-20 rounded-[32px] bg-[var(--m3-surface-container-high)] flex items-center justify-center mb-6 shadow-inner">
                        <Calendar className="w-10 h-10 text-[var(--m3-on-surface-variant)]" />
                      </div>
                      <p className="text-sm font-black text-[var(--m3-on-surface-variant)] uppercase tracking-widest">
                        {language === 'ja' ? 'この日の予定は空です' : 'Clear schedule'}
                      </p>
                      <p className="text-xs font-bold text-[var(--m3-on-surface-variant)]/60 mt-1 uppercase tracking-tighter">
                        {language === 'ja' ? 'タスクをドロップして配置' : 'Drop tasks to schedule'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Unscheduled Tasks */}
                <div className="space-y-5 pt-8 border-t border-[var(--m3-outline-variant)]/40">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-[var(--m3-secondary)] rounded-full" />
                      <div>
                        <h3 className="text-sm font-black text-[var(--m3-on-surface)] uppercase tracking-widest">
                          {language === 'ja' ? '未配置のタスク' : 'Unscheduled'}
                        </h3>
                        <p className="text-[10px] font-bold text-[var(--m3-on-surface-variant)] opacity-70">
                          {unscheduledSubmissions.length} {language === 'ja' ? '件の保留' : 'pending'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <DroppableDateCell id="unscheduled" className="h-full">
                    {unscheduledSubmissions.length > 0 ? (
                      <div className="space-y-3 px-1 pb-12">
                        {unscheduledSubmissions.map((sub, idx) => (
                          <motion.div
                            key={sub.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedId(sub.id)}
                          >
                            <DraggableTaskRender
                              id={`task-${sub.id}`}
                              className="group p-4 rounded-[28px] bg-[var(--m3-surface-container-lowest)] border border-[var(--m3-outline)]/10 hover:border-[var(--m3-secondary)]/30 hover:shadow-lg transition-all cursor-grab active:cursor-grabbing flex items-center gap-4"
                            >
                              <div className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:rotate-[-6deg]",
                                sub.status === 'completed' ? "bg-green-500/10 text-green-500" : "bg-[var(--m3-secondary)]/5 text-[var(--m3-secondary)]"
                              )}>
                                {sub.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                              </div>
                              <div className="flex-1 min-w-0 pointer-events-none">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-[9px] font-black uppercase tracking-tighter text-[var(--m3-secondary)] opacity-70 truncate max-w-[100px]">{sub.subject}</span>
                                </div>
                                <h4 className="text-sm font-black text-[var(--m3-on-surface)] truncate group-hover:text-[var(--m3-secondary)] transition-colors leading-tight">{sub.title}</h4>
                              </div>
                            </DraggableTaskRender>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-10 rounded-[32px] border border-dashed border-[var(--m3-outline-variant)]/20 flex flex-col items-center justify-center text-center p-6 opacity-60 bg-[var(--m3-surface-container)]/20">
                        <p className="text-[10px] font-black text-[var(--m3-on-surface-variant)] uppercase tracking-widest">
                          {language === 'ja' ? 'すべてのタスクがスケジュール済み ✨' : 'All organized ✨'}
                        </p>
                      </div>
                    )}
                  </DroppableDateCell>
                </div>
              </div>
            </div>
          </div>
          
          <DragOverlay modifiers={[snapCenterToCursor]} zIndex={200}>
            {activeDragTaskId ? (() => {
              const task = submissions.find(s => `task-${s.id}` === activeDragTaskId);
              if (!task) return null;
              return (
                <div className="group p-4 rounded-[32px] bg-[var(--m3-surface-container-highest)] border-2 border-[var(--m3-primary)]/40 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-4 rotate-2 scale-105 cursor-grabbing z-[210] opacity-95 backdrop-blur-md ring-8 ring-[var(--m3-primary)]/5">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm bg-[var(--m3-primary)] text-[var(--m3-on-primary)] transition-transform group-active:rotate-12">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--m3-primary)] mb-1 opacity-80">{task.subject}</div>
                    <div className="text-sm font-black text-[var(--m3-on-surface)] truncate leading-tight tracking-tight">{task.title}</div>
                  </div>
                </div>
              );
            })() : null}
          </DragOverlay>
          </DndContext>
        </motion.div>
      </>
    )}
  </AnimatePresence>

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
            className="m3-card relative w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex-1 overflow-y-auto p-8 scrollbar-custom">
              <button onClick={() => setIsSettingsOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--m3-surface-container)] z-10">
                 <X className="w-5 h-5 text-[var(--m3-on-surface-variant)]" />
              </button>
              <h2 className="text-2xl font-bold mb-8">{t.settings}</h2>
              
              <div className="space-y-6">
                <div className="space-y-3">
              <label className="text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.2em] px-1">{t.language}</label>
              <div className="segmented-control">
                <button 
                  onClick={() => {
                    setLanguage('ja');
                    syncSettings({ language: 'ja' });
                  }}
                  className={cn("segmented-item", language === 'ja' ? "segmented-item-active" : "segmented-item-inactive")}
                >
                  日本語
                </button>
                <button 
                  onClick={() => {
                    setLanguage('en');
                    syncSettings({ language: 'en' });
                  }}
                  className={cn("segmented-item", language === 'en' ? "segmented-item-active" : "segmented-item-inactive")}
                >
                  English
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.2em] px-1">{t.theme}</label>
              <div className="relative">
                <button 
                  onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 flex items-center justify-between font-bold text-sm hover:bg-[var(--m3-surface-container-high)] transition-all"
                >
                  <div className="flex items-center gap-3">
                    {theme === 'light' && <Sun className="w-5 h-5 text-orange-500" />}
                    {theme === 'dark' && <Moon className="w-5 h-5 text-indigo-400" />}
                    {theme === 'dog' && <Dog className="w-5 h-5 text-[#8b5a2b]" />}
                    {theme === 'cat' && <Cat className="w-5 h-5 text-[#c26978]" />}
                    {theme === 'animal' && <Rabbit className="w-5 h-5 text-[#b16300]" />}
                    {theme === 'flower' && <Flower className="w-5 h-5 text-[#9a4058]" />}
                    <span>
                      {theme === 'light' ? t.light : 
                       theme === 'dark' ? t.navy : 
                       theme === 'dog' ? t.theme_dog : 
                       theme === 'cat' ? t.theme_cat : 
                       theme === 'animal' ? t.theme_animal : 
                       theme === 'flower' ? t.theme_flower : ''}
                    </span>
                  </div>
                  <ChevronDown className={cn("w-5 h-5 transition-transform duration-300", isThemeDropdownOpen ? "rotate-180" : "")} />
                </button>

                <AnimatePresence>
                  {isThemeDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsThemeDropdownOpen(false)}
                      />
                      <motion.div 
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute z-50 top-full left-0 right-0 bg-[var(--m3-surface-container-high)] rounded-2xl shadow-xl border border-[var(--m3-outline)]/10 overflow-hidden py-1"
                      >
                        {[
                          { id: 'light', icon: Sun, label: t.light, color: 'text-orange-500' },
                          { id: 'dark', icon: Moon, label: t.navy, color: 'text-indigo-400' },
                          { id: 'dog', icon: Dog, label: t.theme_dog, color: 'text-[#8b5a2b]' },
                          { id: 'cat', icon: Cat, label: t.theme_cat, color: 'text-[#c26978]' },
                          { id: 'animal', icon: Rabbit, label: t.theme_animal, color: 'text-[#b16300]' },
                          { id: 'flower', icon: Flower, label: t.theme_flower, color: 'text-[#9a4058]' }
                        ].map((th) => (
                          <button
                            key={th.id}
                            onClick={() => {
                              setTheme(th.id as any);
                              syncSettings({ theme: th.id as any });
                              setIsThemeDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full px-4 py-3 flex items-center gap-3 text-left font-bold text-sm hover:bg-[var(--m3-primary)]/10 transition-colors",
                              theme === th.id ? "text-[var(--m3-primary)] bg-[var(--m3-primary)]/5" : "text-[var(--m3-on-surface)]"
                            )}
                          >
                            <th.icon className={cn("w-5 h-5", th.color)} />
                            {th.label}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-[var(--m3-outline)]/10">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-wider">{t.editSubjects}</label>
                <p className="text-[10px] text-[var(--m3-on-surface-variant)] opacity-50 px-1">{t.reorderInfo}</p>
              </div>
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <div className="flex flex-wrap gap-2">
                  <SortableContext 
                    items={subjects}
                    strategy={verticalListSortingStrategy}
                  >
                    {subjects.map(subject => (
                      <SortableSubjectItem 
                        key={subject} 
                        subject={subject} 
                        t={t} 
                        language={language}
                        onDelete={() => {
                          const msg = language === 'ja' ? `${subject}${t.confirmDeleteSubject}` : `${t.confirmDeleteSubject}${subject}?`;
                          setConfirmDialog({
                            title: t.editSubjects,
                            message: msg,
                            onConfirm: () => {
                              const newSubs = subjects.filter(s => s !== subject);
                              setSubjects(newSubs);
                              syncSettings({ subjects: newSubs });
                              setConfirmDialog(null);
                            },
                            onCancel: () => setConfirmDialog(null)
                          });
                        }}
                      />
                    ))}
                  </SortableContext>
                </div>
              </DndContext>
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
                        const newSubs = [...subjects, newSubject.trim()];
                        setSubjects(newSubs);
                        syncSettings({ subjects: newSubs });
                        setNewSubject("");
                      } else {
                        showToast(language === 'ja' ? 'その教科は既に存在します' : 'Subject already exists');
                      }
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    if (newSubject.trim()) {
                      if (!subjects.includes(newSubject.trim())) {
                        const newSubs = [...subjects, newSubject.trim()];
                        setSubjects(newSubs);
                        syncSettings({ subjects: newSubs });
                        setNewSubject("");
                      } else {
                        showToast(language === 'ja' ? 'その教科は既に存在します' : 'Subject already exists');
                      }
                    }
                  }}
                  className="px-4 py-3 rounded-xl bg-[var(--m3-primary)] text-[var(--m3-on-primary)] font-bold text-xs"
                >
                  {t.addSubject}
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--m3-outline)]/10 text-center">
                <div className="text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.2em] mb-2">{t.feedback}</div>
              <p className="text-xs text-[var(--m3-on-surface-variant)]/60 font-medium mb-4">
                {t.feedback_desc}
              </p>
              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSdEbdto4RIERpgNP0MUlLceT1nSEL907bOIo3CNt2XMiLi51w/viewform?usp=publish-editor"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md group"
              >
                <Zap className="w-3 h-3 text-[var(--m3-primary)] group-hover:rotate-12 transition-transform" />
                {t.send_feedback}
              </a>
            </div>

            <div className="pt-6 border-t border-[var(--m3-outline)]/10 text-center">
              <div className="text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.2em] mb-2">{t.license}</div>
              <p className="text-xs text-[var(--m3-on-surface-variant)]/60 font-medium leading-relaxed">
                {t.license_desc}<br />
                © 2026 Lumina Project
              </p>
              <button 
                onClick={() => {
                  setIsSettingsOpen(false);
                  setShowTermsModal(true);
                }}
                className="mt-3 inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-[var(--m3-surface-container)] text-[var(--m3-primary)] text-xs font-bold hover:bg-[var(--m3-primary)]/5 transition-all border border-[var(--m3-primary)]/10 shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {t.termsOfService}
              </button>
              <div className="mt-4 text-[11px] font-mono text-[var(--m3-on-surface-variant)]/30">
                {t.version} {APP_VERSION}
              </div>
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
            className="fixed inset-0 z-[170] flex items-center justify-center p-4 sm:p-6"
          >
            <div 
              onClick={() => setSelectedId(null)}
              className="absolute inset-0 bg-black/20 backdrop-blur-md"
            />
            <motion.div 
              layoutId={selectedId}
              transition={{ layout: { duration: 0.3, type: "spring", stiffness: 300, damping: 30 } }}
              className="relative w-full max-w-lg m3-card !p-0 shadow-2xl border border-[var(--m3-outline)]/10 bg-[var(--m3-surface-container-high)] max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 scrollbar-custom">
                <div className="flex items-center justify-between">
                  <motion.div layoutId={`subject-${selectedId}`} className="text-sm font-bold uppercase tracking-widest text-[var(--m3-primary)]">
                    {selectedSubmission.subject}
                  </motion.div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => deleteSubmission(selectedSubmission.id, e as any)}
                      className="p-2 rounded-full hover:bg-[var(--m3-error)]/10 text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-error)] transition-colors"
                      title={t.delete}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setSelectedId(null)}
                      className="p-2 rounded-full hover:bg-[var(--m3-surface-container)] transition-colors"
                    >
                      <X className="w-5 h-5 text-[var(--m3-on-surface-variant)]" />
                    </button>
                  </div>
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
                    <div className="flex justify-between items-end mb-1 text-sm">
                      <span className="text-[var(--m3-on-surface-variant)] font-black uppercase tracking-tighter opacity-70">{t.progress}</span>
                      <span className="text-[var(--m3-on-surface)] font-light tracking-tighter">
                        <span className="text-2xl">{selectedSubmission.taskType === 'pages' ? selectedSubmission.currentPage : selectedSubmission.progress}</span>
                        <span className="opacity-50 text-xs font-bold ml-0.5">
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

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.2em]">{t.recentActivity}</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {selectedSubmission.activityLogs.slice().reverse().map(log => (
                        <div key={log.id} className="flex items-center gap-4 bg-[var(--m3-surface-container-low)] p-3 rounded-2xl border border-[var(--m3-outline-variant)]/10">
                          <div className="w-8 h-8 rounded-full bg-[var(--m3-primary-container)] flex items-center justify-center shrink-0">
                            <Zap className="w-3.5 h-3.5 text-[var(--m3-on-primary-container)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-[var(--m3-on-surface-variant)] opacity-60">
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

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-wider">{t.details}</h3>
                    <p className="text-[var(--m3-on-surface-variant)] leading-relaxed text-sm font-medium whitespace-pre-wrap">
                      {selectedSubmission.description || (language === 'ja' ? '詳細情報はありません。' : 'No description provided.')}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {selectedSubmission.status !== 'completed' && !selectedSubmission.isDeleted && (
                      <>
                        <button 
                          onClick={() => setIsFocusSelectorOpen(true)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-bold transition-all active:scale-[0.98] bg-transparent border border-[var(--m3-primary)]/20 text-[var(--m3-primary)] hover:bg-[var(--m3-primary)]/5"
                        >
                          <Zap className="w-5 h-5" />
                          {t.startTimer}
                        </button>
                        
                        <button 
                          onClick={() => {
                            setActiveTimerId(selectedSubmission.id);
                            setTimerSeconds(0);
                            setIsTimerRunning(false);
                            setIsTimerPaused(false);
                            setShowProgressInput(true);
                            setProgressInputValue("");
                            setSelectedId(null);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-bold transition-all active:scale-[0.98] border-none bg-[var(--m3-primary)]/15 text-[var(--m3-primary)] hover:bg-[var(--m3-primary)]/25"
                        >
                          <CheckSquare className="w-5 h-5" />
                          {t.progressUpdate}
                        </button>
                      </>
                    )}
                    
                    {!selectedSubmission.isDeleted && activeTab !== 'history' && (
                      <button 
                        onClick={() => {
                          setEditData(selectedSubmission);
                          setModalPriority(selectedSubmission.priority);
                          setSelectedDate(selectedSubmission.deadline);
                          setIsEditing(true);
                          setSelectedId(null);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-bold transition-all active:scale-[0.98] border-none bg-[var(--m3-primary)]/60 text-white hover:bg-[var(--m3-primary)]/70"
                      >
                        <Edit3 className="w-5 h-5" />
                        {t.editTask}
                      </button>
                    )}

                    {selectedSubmission.status !== 'completed' && !selectedSubmission.isDeleted && activeTab !== 'history' && (
                      <button 
                        onClick={(e) => {
                          toggleComplete(selectedSubmission.id, e as any);
                          setSelectedId(null);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-bold transition-all active:scale-[0.98] border-none bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-md shadow-[var(--m3-primary)]/20 hover:shadow-lg hover:brightness-110"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        {t.complete}
                      </button>
                    )}

                    {selectedSubmission.status === 'completed' && !selectedSubmission.isDeleted && activeTab === 'history' && (
                      <button 
                        onClick={(e) => {
                          toggleComplete(selectedSubmission.id, e as any);
                          setSelectedId(null);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-bold transition-all active:scale-[0.98] border border-[var(--m3-primary)]/20 text-[var(--m3-primary)] hover:bg-[var(--m3-primary)]/5"
                      >
                        <RotateCcw className="w-5 h-5" />
                        {language === 'ja' ? '進行中に戻す' : 'Undo Complete'}
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
        className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 w-14 h-14 sm:w-20 sm:h-20 bg-[#cdddf7] text-[#005696] rounded-full shadow-lg shadow-[#cdddf7]/50 flex items-center justify-center z-[170] group hover:opacity-90 transition-all active:scale-95"
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
            className="fixed inset-0 z-[180] flex items-end sm:items-center justify-center p-0 sm:p-6"
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
              className="relative w-full max-w-lg m3-card rounded-t-[28px] sm:rounded-[28px] p-0 shadow-2xl border border-[var(--m3-outline)]/10 max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 scrollbar-custom">
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
                    <div className="relative">
                      <div className="relative group">
                        <input 
                          name="subject" 
                          required 
                          type="text" 
                          value={modalSubject}
                          onChange={(e) => {
                            setModalSubject(e.target.value);
                            setIsSubjectDropdownOpen(true);
                          }}
                          onFocus={() => setIsSubjectDropdownOpen(true)}
                          onBlur={() => setTimeout(() => setIsSubjectDropdownOpen(false), 200)}
                          placeholder={t.subjectPlaceholder} 
                          className="w-full px-5 py-4 pr-12 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-bold text-[var(--m3-on-surface)] transition-all placeholder:font-medium" 
                        />
                        <button
                          type="button"
                          onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--m3-surface-container-highest)] transition-colors"
                        >
                          <ChevronDown className={cn("w-5 h-5 text-[var(--m3-on-surface-variant)] transition-transform duration-200", isSubjectDropdownOpen && "rotate-180")} />
                        </button>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[var(--m3-primary)] group-focus-within:w-[80%] transition-all duration-300 rounded-full" />
                      </div>

                      <AnimatePresence>
                        {isSubjectDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 4, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute z-50 left-0 right-0 top-full bg-[var(--m3-surface-container-high)] border border-[var(--m3-outline)]/10 rounded-2xl shadow-xl max-h-[60vh] sm:max-h-[400px] overflow-y-auto scrollbar-custom py-2"
                          >
                            {subjects.map(s => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => {
                                  setModalSubject(s);
                                  setIsSubjectDropdownOpen(false);
                                }}
                                className={cn(
                                  "w-full text-left px-5 py-3 text-sm font-bold transition-colors hover:bg-[var(--m3-primary)]/10",
                                  modalSubject === s ? "text-[var(--m3-primary)] bg-[var(--m3-primary)]/5" : "text-[var(--m3-on-surface)]"
                                )}
                              >
                                {s}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
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
                        <label className="text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase">{t.startPage}</label>
                        <input name="startPage" type="number" min="0" step="1" placeholder="0" className="w-full px-4 py-3 rounded-xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 transition-all placeholder:font-medium" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase">{t.endPage}</label>
                        <input name="endPage" type="number" min="1" step="1" placeholder="100" className="w-full px-4 py-3 rounded-xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 transition-all placeholder:font-medium" />
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
                          const val = e.target.value;
                          if (!val || val.length !== 10) return;
                          const [y, m, d] = val.split('-').map(Number);
                          if (isNaN(y) || isNaN(m) || isNaN(d) || y < 1000 || y > 9999) return;
                          const date = new Date(selectedDate || new Date());
                          date.setFullYear(y, m - 1, d);
                          if (!isNaN(date.getTime())) {
                            setSelectedDate(date);
                          }
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
                    <label className="text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-widest px-1">{language === 'ja' ? '予定日 (カレンダー配置)' : 'Scheduled Date (Calendar)'}</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                       <input 
                        name="scheduledDate"
                        type="date"
                        className="flex-1 px-5 py-4 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-bold text-[var(--m3-on-surface)] transition-all placeholder:text-[var(--m3-on-surface-variant)]/50"
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
                <div className="space-y-3">
                  <label className="text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-widest px-1">
                    {language === 'ja' ? '繰り返し' : 'Repeat'}
                  </label>
                  <div className="flex flex-col rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 overflow-hidden transition-all">
                    <label className="flex items-center gap-3 cursor-pointer select-none p-4 hover:bg-[var(--m3-surface-container-high)] transition-colors">
                      <input 
                        type="checkbox" 
                        checked={isRepeatEnabled}
                        onChange={(e) => setIsRepeatEnabled(e.target.checked)}
                        className="w-5 h-5 rounded-[6px] border-2 border-[var(--m3-outline)]/30 text-[var(--m3-primary)] focus:ring-[var(--m3-primary)]/20 transition-all cursor-pointer" 
                      />
                      <span className="text-sm font-bold text-[var(--m3-on-surface)]">
                        {language === 'ja' ? '繰り返す' : 'Repeat task'}
                      </span>
                    </label>
                    
                    <AnimatePresence>
                      {isRepeatEnabled && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} 
                          animate={{ height: 'auto', opacity: 1 }} 
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-[var(--m3-outline-variant)]/20"
                        >
                          <div className="p-4 space-y-4 bg-[var(--m3-surface-container-low)]">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[var(--m3-on-surface-variant)]">{language === 'ja' ? 'スパン' : 'Interval'}</span>
                              <select 
                                value={repeatType} 
                                onChange={(e) => setRepeatType(e.target.value as any)}
                                className="bg-[var(--m3-surface)] border border-[var(--m3-outline-variant)]/30 rounded-xl px-3 py-1.5 text-sm font-bold text-[var(--m3-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)]/20"
                              >
                                <option value="daily">{language === 'ja' ? '毎日' : 'Daily'}</option>
                                <option value="weekly">{language === 'ja' ? '毎週' : 'Weekly'}</option>
                                <option value="monthly">{language === 'ja' ? '毎月' : 'Monthly'}</option>
                              </select>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[var(--m3-on-surface-variant)]">{language === 'ja' ? '回数' : 'Times'}</span>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number" 
                                  value={repeatCount}
                                  onChange={(e) => setRepeatCount(Math.max(2, parseInt(e.target.value) || 2))}
                                  min={2} 
                                  max={52} 
                                  className="w-16 px-2 py-1.5 rounded-xl bg-[var(--m3-surface)] border border-[var(--m3-outline)]/20 text-center font-bold text-[var(--m3-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)]/20" 
                                />
                                <span className="text-xs font-bold text-[var(--m3-on-surface-variant)]">{language === 'ja' ? '回' : 'times'}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.1em] px-1">{t.details}</label>
                    <textarea name="description" placeholder={t.descriptionPlaceholder} rows={3} className="w-full px-5 py-4 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-medium resize-none text-[var(--m3-on-surface)] transition-all" />
                  </div>
                <button 
                  type="submit"
                  className="w-full m3-button-primary"
                >
                  {t.record}
                </button>
              </form>
            </div>
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
                        "px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5",
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
                    <div className="px-3 py-1 rounded-full bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface-variant)] text-xs font-black uppercase tracking-widest">
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
                  <div className="text-xs font-black text-[var(--m3-primary)] uppercase tracking-[0.2em]">
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
                        className="absolute w-8 h-8 flex items-center justify-center text-xs font-black text-[var(--m3-on-surface-variant)] opacity-40"
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
                           <div className="text-xs font-black text-[var(--m3-error)] uppercase tracking-widest mt-1 animate-pulse">
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
                        className="text-xs font-black uppercase tracking-widest text-[var(--m3-primary)] hover:opacity-80 transition-opacity flex items-center gap-2 mb-2"
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
                    step="1"
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
                    <div className="flex justify-between text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase">
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
            className="fixed inset-0 z-[180] flex items-end sm:items-center justify-center p-0 sm:p-6"
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
              className="relative w-full max-w-lg m3-card rounded-t-[28px] sm:rounded-[28px] p-0 shadow-2xl border border-[var(--m3-outline)]/10 max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 scrollbar-custom">
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
                    <div className="relative">
                      <div className="relative group">
                        <input 
                          name="subject" 
                          value={modalSubject}
                          onChange={(e) => {
                            setModalSubject(e.target.value);
                            setIsSubjectDropdownOpen(true);
                          }}
                          onFocus={() => setIsSubjectDropdownOpen(true)}
                          onBlur={() => setTimeout(() => setIsSubjectDropdownOpen(false), 200)}
                          required 
                          type="text" 
                          className="w-full px-5 py-4 pr-12 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-bold text-[var(--m3-on-surface)] transition-all placeholder:font-medium" 
                        />
                        <button
                          type="button"
                          onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--m3-surface-container-highest)] transition-colors"
                        >
                          <ChevronDown className={cn("w-5 h-5 text-[var(--m3-on-surface-variant)] transition-transform duration-200", isSubjectDropdownOpen && "rotate-180")} />
                        </button>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[var(--m3-primary)] group-focus-within:w-[80%] transition-all duration-300 rounded-full" />
                      </div>

                      <AnimatePresence>
                        {isSubjectDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 4, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute z-50 left-0 right-0 top-full bg-[var(--m3-surface-container-high)] border border-[var(--m3-outline)]/10 rounded-2xl shadow-xl max-h-[60vh] sm:max-h-[400px] overflow-y-auto scrollbar-custom py-2"
                          >
                            {subjects.map(s => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => {
                                  setModalSubject(s);
                                  setIsSubjectDropdownOpen(false);
                                }}
                                className={cn(
                                  "w-full text-left px-5 py-3 text-sm font-bold transition-colors hover:bg-[var(--m3-primary)]/10",
                                  modalSubject === s ? "text-[var(--m3-primary)] bg-[var(--m3-primary)]/5" : "text-[var(--m3-on-surface)]"
                                )}
                              >
                                {s}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {editData?.taskType === 'pages' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="grid grid-cols-2 gap-4 pb-2"
                  >
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase">{t.startPage}</label>
                      <input name="startPage" type="number" min="0" step="1" defaultValue={editData.startPage} placeholder="0" className="w-full px-4 py-3 rounded-xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 transition-all placeholder:font-medium" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase">{t.endPage}</label>
                      <input name="endPage" type="number" min="1" step="1" defaultValue={editData.endPage} placeholder="100" className="w-full px-4 py-3 rounded-xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 transition-all placeholder:font-medium" />
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
                          const val = e.target.value;
                          if (!val || val.length !== 10) return;
                          const [y, m, d] = val.split('-').map(Number);
                          if (isNaN(y) || isNaN(m) || isNaN(d) || y < 1000 || y > 9999) return;
                          const date = new Date(selectedDate || new Date());
                          date.setFullYear(y, m - 1, d);
                          if (!isNaN(date.getTime())) {
                            setSelectedDate(date);
                          }
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
                    <label className="text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-widest px-1">{language === 'ja' ? '予定日 (カレンダー配置)' : 'Scheduled Date (Calendar)'}</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                       <input 
                        name="scheduledDate"
                        type="date"
                        defaultValue={editData.scheduledDate ? format(editData.scheduledDate, 'yyyy-MM-dd') : ''}
                        className="flex-1 px-5 py-4 rounded-2xl bg-[var(--m3-surface-container)] border border-[var(--m3-outline)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--m3-primary)]/10 font-bold text-[var(--m3-on-surface)] transition-all placeholder:text-[var(--m3-on-surface-variant)]/50"
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
                    <label className="text-xs font-black text-[var(--m3-on-surface-variant)] uppercase tracking-[0.1em] px-1">{t.details}</label>
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
            </div>
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
              <p className="text-[var(--m3-on-surface-variant)] leading-relaxed whitespace-pre-wrap">
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

      {renderTermsModal()}

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85vw] max-w-[320px] bg-[var(--m3-surface)] z-[210] shadow-2xl flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--m3-outline-variant)]/20">
                <div className="font-black text-lg tracking-tight text-[var(--m3-primary)] pl-2">{language === 'ja' ? 'メニュー' : 'Menu'}</div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-[var(--m3-surface-container)] transition-colors active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 flex flex-col gap-8">
                <SidebarContent />
              </div>
              <div className="p-3 border-t border-[var(--m3-outline-variant)]/20 bg-[var(--m3-surface-container)]">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setIsCalendarOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex-1 flex flex-col items-center justify-center gap-1 p-2 rounded-xl hover:bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface-variant)] transition-all group"
                  >
                    <Calendar className="w-5 h-5 text-[var(--m3-primary)]" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">{language === 'ja' ? 'カレンダー' : 'Calendar'}</span>
                  </button>
                  <button 
                    onClick={() => {
                      setIsSettingsOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex-1 flex flex-col items-center justify-center gap-1 p-2 rounded-xl hover:bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface-variant)] transition-all group"
                  >
                    <Settings className="w-5 h-5 text-[var(--m3-primary)]" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">{t.settings}</span>
                  </button>
                  <div className="w-px h-8 bg-[var(--m3-outline-variant)]/40 mx-1" />
                  <button 
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex-1 flex flex-col items-center justify-center gap-1 p-2 rounded-xl hover:bg-[var(--m3-error-container)]/50 text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-error)] transition-all group"
                  >
                    <LogOut className="w-5 h-5 text-[var(--m3-error)]" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">{t.logout}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUpdateNotice && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="m3-card !bg-white w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden text-slate-900"
            >
              <div className="p-4 sm:p-5 border-b border-slate-200 shrink-0 bg-slate-50 flex justify-between items-center">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-3">
                  <Zap className="w-5 h-5 text-[var(--m3-primary)]" />
                  {RELEASE_NOTES.title}
                </h2>
                <div className="text-xs font-bold bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md">
                   v{RELEASE_NOTES.version}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 sm:p-8 scrollbar-custom space-y-6 text-slate-800">
                <div className="space-y-4">
                  <h3 className="text-base font-black flex items-center gap-2 text-slate-900">
                    {RELEASE_NOTES.features.title}
                  </h3>
                  <ul className="space-y-3">
                    {RELEASE_NOTES.features.items.map((item, index) => (
                      <li key={index} className="flex gap-3 text-sm font-bold text-slate-700">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--m3-primary)] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="p-4 sm:p-5 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
                <button 
                  onClick={() => {
                    localStorage.setItem('app-last-version', APP_VERSION);
                    setShowUpdateNotice(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[var(--m3-primary)] text-white font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[var(--m3-primary)]/20"
                >
                  確認しました
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
  language = 'ja',
  theme = 'light',
  isSelectionMode,
  isSelected,
  onToggleSelect,
  isHighlighted,
  hasMoreInSeries
}: { 
  submission: Submission; 
  onClick: () => void;
  onToggleComplete: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  isHistoryView?: boolean;
  language?: Language;
  theme?: 'light' | 'dark' | 'dog' | 'cat' | 'animal' | 'flower';
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (e: React.MouseEvent) => void;
  isHighlighted?: boolean;
  hasMoreInSeries?: boolean;
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
    if (daysLeft <= 3) return { tag: 'bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)]', label: language === 'ja' ? '間近' : 'Soon' };
    return { tag: 'bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)]', label: t.urgency_normal };
  }, [daysLeft, submission.status, submission.priority, submission.isDeleted, t]);

  if (showCompact) {
    return (
      <motion.div
        layout
        layoutId={submission.id}
        id={`task-card-${submission.id}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ 
          layout: { duration: 0.2, ease: "easeOut" },
          opacity: { duration: 0.2 },
          scale: { duration: 0.2 }
        }}
        onClick={onClick}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "group relative bg-[var(--m3-surface-container)] rounded-[20px] p-5 flex items-center gap-4 border cursor-pointer transition-colors",
          isSelected ? "border-[var(--m3-primary)] bg-[var(--m3-primary-container)]/10" : "border-[var(--m3-outline)]/10 hover:border-[var(--m3-primary)]/30",
          isHighlighted && "ring-2 ring-[var(--m3-primary)] shadow-lg shadow-[var(--m3-primary)]/20"
        )}
      >
        {isHistoryView && isSelectionMode && onToggleSelect && (
          <div 
            onClick={onToggleSelect}
            className={cn(
              "w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-colors",
              isSelected 
                ? "bg-[var(--m3-primary)] border-[var(--m3-primary)] text-[var(--m3-on-primary)]" 
                : "border-[var(--m3-outline)]/30 hover:border-[var(--m3-primary)]/50 bg-[var(--m3-surface)]"
            )}
          >
            {isSelected && <CheckCircle2 className="w-4 h-4" />}
          </div>
        )}
        <div className="w-10 h-10 rounded-full bg-[var(--m3-surface-variant)] flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-[var(--m3-on-surface-variant)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <motion.span 
              layoutId={`subject-${submission.id}`} 
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="text-xs font-black text-[var(--m3-primary)] uppercase tracking-wider"
            >
              {submission.subject}
            </motion.span>
            <span className="text-xs text-[var(--m3-outline)]">•</span>
            <span className="text-xs font-medium text-[var(--m3-on-surface-variant)]">
              {format(((submission.deletedAt || submission.completedAt) as any)?.toDate() || new Date(), 'yyyy/MM/dd HH:mm')}
            </span>
          </div>
          <motion.h3 
            layoutId={`title-${submission.id}`} 
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="text-sm font-bold text-[var(--m3-on-surface)] line-clamp-2 leading-tight"
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
      id={`task-card-${submission.id}`}
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
      whileHover={{ y: -4 }}
      className={cn(
        "group relative cursor-pointer bg-[var(--m3-surface-container)] flex flex-col justify-between overflow-visible transition-[box-shadow,border-color,background-color] duration-300",
        "h-full min-h-[180px] rounded-[24px] p-5 sm:p-6",
        "border border-white/10 dark:border-white/5 hover:border-[var(--m3-primary)]/40 hover:shadow-xl hover:shadow-[var(--m3-primary)]/10",
        submission.priority === 'high' && submission.status !== 'completed' && "border-[var(--m3-error)]/30 ring-1 ring-[var(--m3-error)]/20 bg-gradient-to-br from-[var(--m3-surface-container)] to-[var(--m3-error)]/10",
        isHighlighted && "ring-2 ring-[var(--m3-primary)] shadow-lg shadow-[var(--m3-primary)]/20 scale-[1.02]",
        theme === 'dog' && "hover:border-[#8b5a2b]/30",
        theme === 'cat' && "hover:border-[#c26978]/30",
        theme === 'animal' && "hover:border-[#b16300]/30",
        theme === 'flower' && "hover:border-[#9a4058]/30"
      )}
    >
      {/* Visual Stacking Effect */}
      {hasMoreInSeries && (
        <>
          <div className="absolute -bottom-1.5 left-2 right-2 h-full bg-[var(--m3-surface-container-low)] rounded-[24px] border border-white/5 -z-20 opacity-60" />
          <div className="absolute -bottom-3 left-4 right-4 h-full bg-[var(--m3-surface-container-lowest)] rounded-[24px] border border-white/5 -z-30 opacity-40" />
        </>
      )}

      {submission.priority === 'high' && submission.status !== 'completed' && (
        <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden">
          <div className="absolute top-1 right-1 w-2 h-2 bg-[var(--m3-error)] rounded-full animate-ping" />
        </div>
      )}

      {/* Theme Background Decorations */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] sm:opacity-[0.06] flex items-center justify-center overflow-hidden">
        {theme === 'dog' && <Dog className="w-32 h-32 rotate-12 translate-x-1/4 translate-y-1/4" />}
        {theme === 'cat' && <Cat className="w-32 h-32 -rotate-12 -translate-x-1/4 translate-y-1/4" />}
        {theme === 'animal' && <Rabbit className="w-32 h-32 rotate-12 translate-x-1/4" />}
        {theme === 'flower' && <Flower className="w-32 h-32 -rotate-12 translate-y-1/4" />}
      </div>

      {/* Main Content Vertical */}
      <div className="flex flex-col gap-1.5 min-w-0 relative z-10 overflow-visible">
        <div className="flex items-center justify-between gap-1 mb-1">
          <motion.span 
            layoutId={`subject-${submission.id}`} 
            className="text-[10px] font-black uppercase tracking-wider text-[var(--m3-primary)]"
          >
            {submission.subject}
          </motion.span>
          <div className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm",
            submission.priority === 'high' ? "bg-[var(--m3-error)] text-white" : 
            submission.priority === 'medium' ? "bg-amber-600 dark:bg-amber-500 text-white" : "bg-[var(--m3-secondary)] text-white"
          )}>
            {submission.priority === 'high' && <AlertCircle className="w-2.5 h-2.5" />}
            {t[submission.priority]}
          </div>
        </div>
        <motion.h3 
          layoutId={`title-${submission.id}`} 
          className={cn(
            "text-base sm:text-lg font-bold text-[var(--m3-on-surface)] leading-snug tracking-tight break-words whitespace-normal",
            submission.priority === 'high' && submission.status !== 'completed' && "text-[var(--m3-error)]"
          )}
        >
          {submission.title}
        </motion.h3>
      </div>

      <div className="flex flex-col gap-2.5 mt-4 min-h-0 relative z-10">
        {/* Status/Deadlines */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div className={cn(
            "inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl transition-colors",
            isOverdue ? "bg-[var(--m3-error-container)] text-[var(--m3-on-error-container)]" : "bg-[var(--m3-surface-variant)]/50 text-[var(--m3-on-surface-variant)]"
          )}>
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="tabular-nums">
              {format(submission.deadline, 'MM/dd' + (submission.deadline.getHours() === 23 && submission.deadline.getMinutes() === 59 ? '' : ' HH:mm'))}
            </span>
          </div>
          
          <div className={cn(
            "text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg uppercase tracking-wider shrink-0",
            urgencyStyles.tag
          )}>
            {urgencyStyles.label}
          </div>
          
          {submission.scheduledDate && (
            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-bold bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)] shrink-0 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg">
              <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>{format(submission.scheduledDate, language === 'ja' ? 'M/d 予定' : 'On M/d')}</span>
            </div>
          )}

          {submission.taskType === 'pages' && (
            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-bold text-[var(--m3-on-surface-variant)] opacity-70 shrink-0">
              <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="tabular-nums">
                {submission.currentPage} / {submission.endPage}p
              </span>
            </div>
          )}
        </div>
        
        {/* Progress Section */}
        {!submission.isEvent && (
          <div className="flex flex-col gap-1 shrink-0 py-0.5">
            <div className="flex justify-between items-end w-full px-0.5">
              <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-[var(--m3-on-surface-variant)]">
                {t.progress}
              </span>
              <span className="text-xs sm:text-sm font-black tabular-nums text-[var(--m3-primary)]">{submission.progress}%</span>
            </div>
            <div className="h-1.5 sm:h-2 w-full bg-[var(--m3-surface-variant)]/60 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${submission.progress}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  daysLeft <= 0 ? "bg-[var(--m3-error)]" : "bg-[var(--m3-primary)]"
                )}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

const MemoizedSubmissionCard = React.memo(SubmissionCard, (prev, next) => {
  return prev.submission.id === next.submission.id &&
         prev.submission.progress === next.submission.progress &&
         prev.submission.status === next.submission.status &&
         prev.submission.title === next.submission.title &&
         prev.submission.subject === next.submission.subject &&
         prev.submission.deadline?.getTime() === next.submission.deadline?.getTime() &&
         prev.isHistoryView === next.isHistoryView &&
         prev.language === next.language &&
         prev.theme === next.theme &&
         prev.isSelectionMode === next.isSelectionMode &&
         prev.isSelected === next.isSelected &&
         prev.isHighlighted === next.isHighlighted &&
         prev.hasMoreInSeries === next.hasMoreInSeries;
});

function SortableSubjectItem({ subject, onDelete, language, t }: { 
  subject: string; 
  onDelete: () => void; 
  language: string; 
  t: any;
  key?: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: subject });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "px-3 py-1.5 rounded-full bg-[var(--m3-surface-variant)] text-[var(--m3-on-surface-variant)] text-xs font-bold flex items-center gap-2 transition-all cursor-grab active:cursor-grabbing hover:bg-[var(--m3-surface-container-high)] border border-transparent",
        isDragging && "opacity-50 border-[var(--m3-primary)] scale-105 shadow-lg bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)]"
      )}
    >
      <div {...listeners} className="flex items-center gap-2">
        <div className="flex flex-col gap-0.5 opacity-30">
          <div className="w-1 h-0.5 bg-current rounded-full" />
          <div className="w-1 h-0.5 bg-current rounded-full" />
          <div className="w-1 h-0.5 bg-current rounded-full" />
        </div>
        {subject}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-0.5 hover:bg-black/5 rounded-full transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
